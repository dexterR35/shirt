"""Build a reversible, clean-fabric studio scene from the user's model.glb.

Run with Blender --background --factory-startup --python this-file.py.
The GLB and existing application assets are never modified.
"""
import bpy
import bmesh
import json
import math
from pathlib import Path
from mathutils import Matrix, Vector

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'artifacts' / 'blender-shirt'
OUT.mkdir(parents=True, exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
bpy.ops.import_scene.gltf(filepath=str(ROOT / 'model.glb'))
shirt = next(o for o in scene.objects if o.type == 'MESH')
shirt.name = 'T-Shirt | smooth editable fabric'
shirt.matrix_world = Matrix.Rotation(-math.pi / 2, 4, 'Z') @ shirt.matrix_world
bpy.context.view_layer.objects.active = shirt
shirt.select_set(True)
bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
points = [shirt.matrix_world @ Vector(v) for v in shirt.bound_box]
lo = Vector(tuple(min(p[i] for p in points) for i in range(3)))
hi = Vector(tuple(max(p[i] for p in points) for i in range(3)))
shirt.location -= Vector(((lo.x+hi.x)/2, (lo.y+hi.y)/2, lo.z-0.065))
bpy.ops.object.transform_apply(location=True, rotation=False, scale=False)

# Keep an untouched mesh/material copy inside the blend for easy comparison.
originals = bpy.data.collections.new('SOURCE | original imported geometry and texture')
scene.collection.children.link(originals)
source = shirt.copy()
source.data = shirt.data.copy()
source.name = 'SOURCE | original GLB (hidden)'
originals.objects.link(source)
source.hide_render = True
source.hide_set(True)
originals.hide_render = True
originals.hide_viewport = True

# Weld UV-split vertices so smoothing cannot pull a seam apart.
bm = bmesh.new()
bm.from_mesh(shirt.data)
before = len(bm.verts)
bmesh.ops.remove_doubles(bm, verts=list(bm.verts), dist=0.000006)
bmesh.ops.recalc_face_normals(bm, faces=list(bm.faces))
bm.to_mesh(shirt.data)
bm.free()
if shirt.data.has_custom_normals:
    bpy.ops.mesh.customdata_custom_splitnormals_clear()
for poly in shirt.data.polygons:
    poly.use_smooth = True

# Protect neckline, sleeve rims, and hem; reduce generated surface chatter.
group = shirt.vertex_groups.new(name='Surface refinement | protected collar and hems')
for vert in shirt.data.vertices:
    x, y, z = vert.co
    collar = abs(x) < 0.13 and z > 0.70
    hem = z < 0.085
    cuff = abs(x) > 0.235 and z < 0.55
    group.add([vert.index], 0.30 if collar else 0.45 if hem or cuff else 1.0, 'REPLACE')
smooth = shirt.modifiers.new('Gentle surface smoothing | preserve silhouette', 'SMOOTH')
smooth.factor = 0.85
smooth.iterations = 160
smooth.vertex_group = group.name

def material(name, color, roughness, sheen=0.0):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    mat.diffuse_color = (*color, 1)
    bsdf = mat.node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value = (*color, 1)
    bsdf.inputs['Roughness'].default_value = roughness
    bsdf.inputs['Metallic'].default_value = 0.0
    bsdf.inputs['Specular IOR Level'].default_value = 0.23
    bsdf.inputs['Sheen Weight'].default_value = sheen
    bsdf.inputs['Sheen Roughness'].default_value = 0.75
    return mat

fabric = material('FABRIC | clean pearl white matte cotton', (0.78, 0.80, 0.83), 0.78, 0.16)
fabric['design_note'] = 'Clean solid color. No image texture, bump, normal, noise, or displacement nodes.'
shirt.data.materials.clear()
shirt.data.materials.append(fabric)
shirt['source_file'] = 'model.glb (unaltered)'
shirt['editing_note'] = 'Adjust the named Smooth modifier; hidden SOURCE collection keeps original geometry/material.'

studio = bpy.data.collections.new('STUDIO | cameras and softboxes')
scene.collection.children.link(studio)
def to_studio(obj):
    for col in list(obj.users_collection):
        col.objects.unlink(obj)
    studio.objects.link(obj)

target = Vector((0, 0, 0.44))
def camera(name, position, scale):
    data = bpy.data.cameras.new(name)
    obj = bpy.data.objects.new(name, data)
    studio.objects.link(obj)
    obj.location = position
    obj.rotation_euler = (target - obj.location).to_track_quat('-Z','Y').to_euler()
    data.type = 'ORTHO'
    data.ortho_scale = scale
    data.lens = 70
    return obj

front = camera('CAMERA | front product', (0, -3.4, 0.46), 0.97)
angle = camera('CAMERA | three-quarter', (1.4, -3.5, 0.62), 1.00)
back = camera('CAMERA | back', (0, 3.4, 0.46), 0.97)
scene.camera = front

def area(name, pos, power, size, color, ratio=1.0):
    data = bpy.data.lights.new(name, 'AREA')
    data.energy = power
    data.shape = 'RECTANGLE'
    data.size = size
    data.size_y = size * ratio
    data.color = color
    obj = bpy.data.objects.new(name, data)
    studio.objects.link(obj)
    obj.location = pos
    obj.rotation_euler = (target - obj.location).to_track_quat('-Z','Y').to_euler()
    return obj

area('SOFTBOX | large key left', (-0.9,-1.25,1.65), 65, 1.20, (1.0,0.97,0.93), 1.3)
area('SOFTBOX | broad fill right', (1.1,-0.9,0.9), 25, 1.1, (0.91,0.96,1.0), 1.25)
area('SOFTBOX | shoulder rim', (0.4,0.75,1.4), 60, 0.85, (0.92,0.97,1.0), 1.1)
area('SOFTBOX | frontal lift', (0,-1.8,0.5), 8, 0.9, (1.0,1.0,1.0))
world = bpy.data.worlds.new('WORLD | neutral ambient fill')
world.use_nodes = True
world.node_tree.nodes['Background'].inputs[0].default_value = (0.55,0.60,0.70,1)
world.node_tree.nodes['Background'].inputs[1].default_value = 0.10
scene.world = world
# Real curved cyclorama, avoiding a horizon across the shirt.
profile = [(-5.0, 0.0), (0.45, 0.0)]
for i in range(1, 49):
    theta = math.pi / 2 * i / 48
    profile.append((0.45 + 0.8 * math.sin(theta), 0.8 * (1-math.cos(theta))))
profile.append((1.25, 4.0))
verts = [(x,y,z) for y,z in profile for x in (-5.0,5.0)]
faces = [(2*i,2*i+1,2*i+3,2*i+2) for i in range(len(profile)-1)]
stage_mesh = bpy.data.meshes.new('Seamless curved studio sweep')
stage_mesh.from_pydata(verts, [], faces)
stage_mesh.update()
floor = bpy.data.objects.new('STAGE | matte navy seamless', stage_mesh)
scene.collection.objects.link(floor)
floor.location.z = -0.20
for poly in stage_mesh.polygons:
    poly.use_smooth = True
floor.data.materials.append(material('STAGE | dark slate', (0.026,0.039,0.063), 0.9))
to_studio(floor)

scene.render.engine = 'CYCLES'
scene.cycles.samples = 128
scene.cycles.use_denoising = True
scene.cycles.adaptive_threshold = 0.015
scene.cycles.max_bounces = 8
scene.cycles.diffuse_bounces = 4
scene.cycles.glossy_bounces = 4
prefs = bpy.context.preferences.addons['cycles'].preferences
try:
    prefs.compute_device_type = 'CUDA'
    prefs.get_devices()
    for device in prefs.devices:
        device.use = device.type == 'CUDA'
    scene.cycles.device = 'GPU' if any(d.use for d in prefs.devices) else 'CPU'
except Exception:
    scene.cycles.device = 'CPU'
scene.render.resolution_x = 1800
scene.render.resolution_y = 2000
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGBA'
scene.render.image_settings.color_depth = '8'
scene.view_settings.view_transform = 'AgX'
scene.view_settings.look = 'AgX - Medium High Contrast'
scene.view_settings.exposure = 0
scene.render.film_transparent = False
scene.render.filepath = str(OUT / 'tshirt-studio-front.png')

# Open to a clean, framed material view in the interactive Blender window.
bpy.ops.object.select_all(action='DESELECT')
shirt.hide_set(False)
shirt.select_set(True)
bpy.context.view_layer.objects.active = shirt
for screen in bpy.data.screens:
    for area_ui in screen.areas:
        if area_ui.type == 'VIEW_3D':
            space = area_ui.spaces.active
            space.region_3d.view_perspective = 'CAMERA'
            space.overlay.show_overlays = False
            space.shading.type = 'MATERIAL'
            space.shading.use_scene_world = False
            space.shading.use_scene_lights = False

notes = bpy.data.texts.new('README | T-shirt studio')
notes.write('Clean T-shirt studio\n\nSource: model.glb, retained unchanged.\nEditable smooth mesh: select T-Shirt. Adjust named Smooth modifier.\nMaterial: FABRIC, Base Color and Roughness. No coarse bump or baked color texture.\nOriginal mesh and texture: hidden SOURCE collection.\nCameras: front, three-quarter, back.\nLights: four named area softboxes with neutral ambient fill.\nF12 renders the front product view at 1800 x 2000.\nFor alpha output: hide STAGE in renders and enable Film > Transparent.\n')
bpy.ops.wm.save_as_mainfile(filepath=str(OUT / 'tshirt-smooth-studio.blend'))
print('PREPARED', json.dumps({'vertices_before':before, 'vertices_after':len(shirt.data.vertices), 'faces':len(shirt.data.polygons), 'smoothing_iterations':smooth.iterations, 'device':scene.cycles.device}))

# Fast geometry review first, then a physically lit preview.
scene.render.resolution_x = 900
scene.render.resolution_y = 1000
scene.render.engine = 'BLENDER_WORKBENCH'
scene.display.shading.color_type = 'SINGLE'
scene.display.shading.single_color = (0.7,0.7,0.7)
scene.display.shading.show_cavity = False
floor.hide_render = True
scene.render.filepath = str(OUT / 'smooth-geometry-review.png')
bpy.ops.render.render(write_still=True)
floor.hide_render = False
scene.render.engine = 'CYCLES'
scene.cycles.samples = 48
scene.render.filepath = str(OUT / 'studio-preview.png')
bpy.ops.render.render(write_still=True)
