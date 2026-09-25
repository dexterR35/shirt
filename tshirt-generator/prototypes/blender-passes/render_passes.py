"""
Prototype step 2: Blender renders, per camera view, the two images the app would
composite in 2D (the plan: Blender as the single source of fabric and shape).

  <view>-shading.png   Cycles, neutral white fabric with the studio lights, folds and
                       stitching: the per-view replacement for base.png.
  <view>-uv.f32        Kit paint UV per pixel (R = u/200, G = v/200 from the top),
  <view>-attr.f32      front/back (R, 0 back .. 1 front) and side panel (G) weights,
                       A = coverage. Raw float32 RGBA, bottom row first, no
                       anti-aliasing and no color management: exact data, not a picture.

blender -b --factory-startup --python render_passes.py -- \
    <shirt-for-blender.glb> <out dir> <size> <samples> <detail mean> "name:az:el:dist;..."
Camera poses use the app's convention (shirt-3d-pose.js): azimuth 0 = front,
positive = the viewer's right, elevation up, distance in meters, 28 degree FOV.
"""
import bpy, sys, math, os
import numpy as np

argv = sys.argv[sys.argv.index('--') + 1:]
GLB, OUT, SIZE, SAMPLES, DETAIL_MEAN, VIEWS = argv[0], argv[1], int(argv[2]), int(argv[3]), float(argv[4]), argv[5]

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
bpy.ops.import_scene.gltf(filepath=GLB)
shirt = next(o for o in scene.objects if o.type == 'MESH')
mesh = shirt.data
PAINT_UV, DETAIL_UV = mesh.uv_layers[0].name, mesh.uv_layers[1].name
COLOR = mesh.color_attributes[0].name
detail = next(n.image for n in mesh.materials[0].node_tree.nodes if n.bl_idname == 'ShaderNodeTexImage')
detail.colorspace_settings.name = 'Non-Color'


def material(name, build):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nodes, links = mat.node_tree.nodes, mat.node_tree.links
    nodes.clear()
    out = nodes.new('ShaderNodeOutputMaterial')
    links.new(build(nodes, links), out.inputs['Surface'])
    return mat


def fabric(nodes, links):
    """Neutral white knit: the source texture's stitching and folds as a normalized
    multiply (as in the 3D view), sheen for polyester."""
    uv = nodes.new('ShaderNodeUVMap'); uv.uv_map = DETAIL_UV
    tex = nodes.new('ShaderNodeTexImage'); tex.image = detail
    links.new(uv.outputs['UV'], tex.inputs['Vector'])
    ratio = nodes.new('ShaderNodeMath'); ratio.operation = 'DIVIDE'; ratio.inputs[1].default_value = DETAIL_MEAN
    links.new(tex.outputs['Color'], ratio.inputs[0])
    clamp = nodes.new('ShaderNodeMath'); clamp.operation = 'MINIMUM'; clamp.inputs[1].default_value = 1.3
    links.new(ratio.outputs[0], clamp.inputs[0])
    linear = nodes.new('ShaderNodeMath'); linear.operation = 'POWER'; linear.inputs[1].default_value = 2.2
    links.new(clamp.outputs[0], linear.inputs[0])
    strength = nodes.new('ShaderNodeMix'); strength.data_type = 'FLOAT'; strength.inputs['Factor'].default_value = 0.55
    strength.inputs['A'].default_value = 1.0
    links.new(linear.outputs[0], strength.inputs['B'])
    albedo = nodes.new('ShaderNodeMath'); albedo.operation = 'MULTIPLY'; albedo.inputs[1].default_value = 0.82
    links.new(strength.outputs['Result'], albedo.inputs[0])
    bsdf = nodes.new('ShaderNodeBsdfPrincipled')
    links.new(albedo.outputs[0], bsdf.inputs['Base Color'])
    bsdf.inputs['Roughness'].default_value = 0.78
    bsdf.inputs['Specular IOR Level'].default_value = 0.35
    bsdf.inputs['Sheen Weight'].default_value = 0.5
    bsdf.inputs['Sheen Roughness'].default_value = 0.5
    return bsdf.outputs['BSDF']


def emit(source):
    def build(nodes, links):
        node = source(nodes)
        emission = nodes.new('ShaderNodeEmission'); emission.inputs['Strength'].default_value = 1.0
        links.new(node, emission.inputs['Color'])
        return emission.outputs['Emission']
    return build


def uv_source(nodes):
    uv = nodes.new('ShaderNodeUVMap'); uv.uv_map = PAINT_UV
    return uv.outputs['UV']


def attr_source(nodes):
    color = nodes.new('ShaderNodeVertexColor'); color.layer_name = COLOR
    return color.outputs['Color']


MATERIALS = {'shading': material('fabric', fabric), 'uv': material('paint-uv', emit(uv_source)), 'attr': material('facing-side', emit(attr_source))}

# Camera and a studio rig that moves with it (as in the 3D view: key, fill, rim).
target = bpy.data.objects.new('target', None); scene.collection.objects.link(target)
cam_data = bpy.data.cameras.new('camera'); cam_data.sensor_fit = 'VERTICAL'; cam_data.angle_y = math.radians(28)
camera = bpy.data.objects.new('camera', cam_data); scene.collection.objects.link(camera); scene.camera = camera
aim = camera.constraints.new('TRACK_TO'); aim.target = target; aim.track_axis = 'TRACK_NEGATIVE_Z'; aim.up_axis = 'UP_Y'
for name, power, size, local in [('key', 40, 1.1, (-1.1, 1.25, 0.2)), ('fill', 6, 1.6, (1.5, 0.2, 0.0)), ('rim', 30, 0.8, (0.7, 1.1, -3.6))]:
    data = bpy.data.lights.new(name, 'AREA'); data.energy = power; data.size = size
    light = bpy.data.objects.new(name, data); scene.collection.objects.link(light)
    light.parent = camera; light.location = local
    track = light.constraints.new('TRACK_TO'); track.target = target; track.track_axis = 'TRACK_NEGATIVE_Z'; track.up_axis = 'UP_Y'
world = bpy.data.worlds.new('studio'); scene.world = world
world.use_nodes = True
world.node_tree.nodes['Background'].inputs['Color'].default_value = (0.5, 0.5, 0.5, 1)
world.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.35

scene.render.engine = 'CYCLES'
scene.cycles.device = 'CPU'
scene.render.resolution_x = scene.render.resolution_y = SIZE
scene.render.resolution_percentage = 100
scene.render.film_transparent = True
scene.view_settings.view_transform = 'Standard'
scene.view_settings.look = 'None'


def pose(az, el, dist):
    a, e = math.radians(az), math.radians(el)
    # The app's pose (three.js, Y up, front +Z) in Blender (Z up, front -Y).
    camera.location = (dist * math.cos(e) * math.sin(a), -dist * math.cos(e) * math.cos(a), dist * math.sin(e))


def render(kind, path):
    shirt.data.materials[0] = MATERIALS[kind]
    data = kind != 'shading'
    scene.cycles.samples = 1 if data else SAMPLES
    scene.cycles.use_denoising = not data
    scene.cycles.filter_width = 0.01 if data else 1.5
    scene.cycles.max_bounces = 0 if data else 8
    for light in ('key', 'fill', 'rim'):
        scene.objects[light].hide_render = data
    world.node_tree.nodes['Background'].inputs['Strength'].default_value = 0 if data else 0.35
    settings = scene.render.image_settings
    if data:
        settings.file_format = 'OPEN_EXR'; settings.color_depth = '32'; settings.color_mode = 'RGBA'
        scene.render.filepath = path + '.exr'
        bpy.ops.render.render(write_still=True)
        image = bpy.data.images.load(path + '.exr')
        pixels = np.empty(SIZE * SIZE * 4, dtype=np.float32)
        image.pixels.foreach_get(pixels)
        pixels.tofile(path + '.f32')
        bpy.data.images.remove(image)
        os.remove(path + '.exr')
    else:
        settings.file_format = 'PNG'; settings.color_depth = '16'; settings.color_mode = 'RGBA'
        scene.render.filepath = path + '.png'
        bpy.ops.render.render(write_still=True)


for view in VIEWS.split(';'):
    name, az, el, dist = view.split(':')
    pose(float(az), float(el), float(dist))
    for kind in ('shading', 'uv', 'attr'):
        render(kind, os.path.join(OUT, f'{name}-{kind}'))
        print(f'RENDERED {name} {kind}', flush=True)
