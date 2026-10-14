"""Render front, three-quarter and transparent outputs from the saved studio."""
import bpy
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'artifacts' / 'blender-shirt'
bpy.ops.wm.open_mainfile(filepath=str(OUT / 'tshirt-smooth-studio.blend'))
scene = bpy.context.scene
floor = bpy.data.objects['STAGE | matte navy seamless']
floor.location.z = -0.20
scene.cycles.samples = 160
scene.cycles.adaptive_threshold = 0.01
prefs = bpy.context.preferences.addons['cycles'].preferences
prefs.compute_device_type = 'CUDA'
prefs.get_devices()
for device in prefs.devices:
    device.use = device.type == 'CUDA'
scene.cycles.device = 'GPU' if any(d.use for d in prefs.devices) else 'CPU'
bpy.ops.wm.save_as_mainfile(filepath=str(OUT / 'tshirt-smooth-studio.blend'))

outputs = []
for filename, camera, transparent in [
    ('tshirt-studio-front.png','CAMERA | front product',False),
    ('tshirt-studio-angle.png','CAMERA | three-quarter',False),
    ('tshirt-transparent.png','CAMERA | front product',True),
]:
    scene.camera = bpy.data.objects[camera]
    floor.hide_render = transparent
    scene.render.film_transparent = transparent
    scene.render.filepath = str(OUT / filename)
    bpy.ops.render.render(write_still=True)
    outputs.append({'file':filename, 'width':scene.render.resolution_x, 'height':scene.render.resolution_y, 'transparent':transparent})
(OUT / 'render-manifest.json').write_text(json.dumps({'source':'model.glb', 'blend':'tshirt-smooth-studio.blend', 'engine':'Cycles', 'samples':scene.cycles.samples, 'outputs':outputs}, indent=2))
print('RENDER_OUTPUTS', json.dumps(outputs))
