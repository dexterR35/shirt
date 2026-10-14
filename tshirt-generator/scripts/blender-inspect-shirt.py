"""Inspect the supplied GLB without changing the source asset."""
import bpy
import json
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'artifacts' / 'blender-shirt'
OUT.mkdir(parents=True, exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(ROOT / 'model.glb'))
meshes = [o for o in bpy.context.scene.objects if o.type == 'MESH']
points = [o.matrix_world @ Vector(v) for o in meshes for v in o.bound_box]
lo = Vector(tuple(min(p[i] for p in points) for i in range(3)))
hi = Vector(tuple(max(p[i] for p in points) for i in range(3)))
center = (lo + hi) / 2
print('MODEL_INFO', json.dumps([{'name':o.name, 'vertices':len(o.data.vertices), 'faces':len(o.data.polygons), 'dimensions':list(o.dimensions)} for o in meshes]))
prefs = bpy.context.preferences.addons['cycles'].preferences
try:
    prefs.compute_device_type = 'OPTIX'
    prefs.get_devices()
    print('CYCLES_DEVICES', [(d.name, d.type) for d in prefs.devices])
except Exception as exc:
    print('DEVICE_INFO', str(exc))
scene = bpy.context.scene
scene.render.engine = 'BLENDER_WORKBENCH'
scene.render.resolution_x = 720
scene.render.resolution_y = 720
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
scene.world = bpy.data.worlds.new('Inspection world')
scene.display.shading.light = 'STUDIO'
scene.display.shading.studiolight_rotate_z = 0.4
scene.display.shading.color_type = 'SINGLE'
scene.display.shading.single_color = (0.72, 0.72, 0.72)
scene.display.shading.show_shadows = True
scene.display.shading.show_cavity = False
scene.display.shading.background_type = 'WORLD'
scene.world.color = (0.08, 0.08, 0.08)
cam_data = bpy.data.cameras.new('Inspect camera')
cam = bpy.data.objects.new('Inspect camera', cam_data)
scene.collection.objects.link(cam)
scene.camera = cam
cam_data.type = 'ORTHO'
cam_data.ortho_scale = max(hi-lo) * 1.22
for name, direction in [('plus-x', (1,0,0)), ('minus-x',(-1,0,0)), ('plus-y',(0,1,0)), ('minus-y',(0,-1,0))]:
    cam.location = center + Vector(direction)*3
    cam.rotation_euler = (center-cam.location).to_track_quat('-Z','Y').to_euler()
    scene.render.filepath = str(OUT / f'inspect-{name}.png')
    bpy.ops.render.render(write_still=True)
