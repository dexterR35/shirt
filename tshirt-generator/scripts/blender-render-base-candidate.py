"""Render r007 as a candidate replacement for base.png, framed on the same 8000 x 5000 canvas.

base.png's garment occupies x 2343..5656, y 611..4389 (alpha >= 128; see
docs/BASE_ANALYSIS.md). The orthographic front camera maps the mesh height to that
pixel height with the garment centred on x 4000 and its top at y 611. The output is
a review candidate only; base.png and the deployed assets are not touched.
"""
import bpy
from pathlib import Path
from mathutils import Vector

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'artifacts'/'blender-shirt'
bpy.ops.wm.open_mainfile(filepath=str(OUT/'tshirt-base-stitched-r007.blend'))
scene=bpy.context.scene
shirt=bpy.data.objects['T-Shirt | base proportions and stitched construction']
zs=[v.co.z for v in shirt.data.vertices]
top,bottom=max(zs),min(zs)
WIDTH,HEIGHT=8000,5000
BASE_TOP,BASE_BOTTOM=611,4389
metres_per_pixel=(top-bottom)/(BASE_BOTTOM-BASE_TOP)
camera=bpy.data.objects['CAMERA | front product']
camera.data.type='ORTHO'
camera.data.ortho_scale=WIDTH*metres_per_pixel
camera.data.shift_x=camera.data.shift_y=0
centre_z=top-(HEIGHT/2-BASE_TOP)*metres_per_pixel
camera.location=(0,-3.4,centre_z)
camera.rotation_euler=(Vector((0,0,centre_z))-camera.location).to_track_quat('-Z','Y').to_euler()
scene.camera=camera
for obj in scene.objects:
    if obj.name.startswith('STAGE'):obj.hide_render=True
scene.render.film_transparent=True
scene.render.resolution_x=WIDTH
scene.render.resolution_y=HEIGHT
scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG'
scene.render.image_settings.color_mode='RGBA'
prefs=bpy.context.preferences.addons['cycles'].preferences
prefs.compute_device_type='CUDA'
prefs.get_devices()
for device in prefs.devices:device.use=device.type=='CUDA'
scene.cycles.device='GPU' if any(d.use for d in prefs.devices) else 'CPU'
scene.cycles.samples=96
scene.cycles.use_denoising=True
scene.render.filepath=str(OUT/'base-candidate-r007.png')
bpy.ops.render.render(write_still=True)
print('BASE_CANDIDATE',scene.render.filepath,'ortho',camera.data.ortho_scale,'centre_z',centre_z)
