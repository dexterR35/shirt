"""Render the viewport visibility revision without changing its saved view."""
import bpy
from pathlib import Path
from mathutils import Vector

OUT = Path(__file__).resolve().parents[1] / 'artifacts' / 'blender-shirt'
bpy.ops.wm.open_mainfile(filepath=str(OUT / 'tshirt-base-stitched-r003.blend'))
scene = bpy.context.scene
prefs = bpy.context.preferences.addons['cycles'].preferences
prefs.compute_device_type = 'CUDA'
prefs.get_devices()
for device in prefs.devices:
    device.use = device.type == 'CUDA'
scene.cycles.device = 'GPU' if any(d.use for d in prefs.devices) else 'CPU'
scene.cycles.samples = 64
scene.cycles.use_denoising = True
scene.render.resolution_percentage = 100
scene.render.resolution_x = 1600
scene.render.resolution_y = 1100
cam = scene.camera
cam.location = (0, -3.4, 0.635)
cam.rotation_euler = (Vector((0, 0, 0.635)) - cam.location).to_track_quat('-Z', 'Y').to_euler()
cam.data.ortho_scale = 0.78
scene.render.filepath = str(OUT / 'tshirt-visible-stitches-detail.png')
bpy.ops.render.render(write_still=True)
