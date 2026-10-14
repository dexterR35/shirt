"""Render the base-referenced stitched garment without changing old outputs."""
import bpy
import sys
from pathlib import Path
from mathutils import Vector

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'artifacts'/'blender-shirt'
bpy.ops.wm.open_mainfile(filepath=str(OUT/'tshirt-base-stitched-r002.blend'))
scene=bpy.context.scene
prefs=bpy.context.preferences.addons['cycles'].preferences
prefs.compute_device_type='CUDA'
prefs.get_devices()
for device in prefs.devices:device.use=device.type=='CUDA'
scene.cycles.device='GPU' if any(d.use for d in prefs.devices) else 'CPU'
scene.render.resolution_percentage=100
scene.cycles.samples=96
scene.cycles.adaptive_threshold=0.007
scene.cycles.use_denoising=True
front=bpy.data.objects['CAMERA | front product']
close_data=front.data.copy()
close=bpy.data.objects.new('CAMERA | collar stitch detail',close_data)
scene.collection.objects.link(close)
close.location=(0,-3.4,0.75)
close.rotation_euler=(Vector((0,0,0.75))-close.location).to_track_quat('-Z','Y').to_euler()
close_data.ortho_scale=0.33
scene.camera=close
scene.render.resolution_x=1500
scene.render.resolution_y=900
scene.render.filepath=str(OUT/'tshirt-base-collar-detail.png')
bpy.ops.render.render(write_still=True)
if '--detail-only' in sys.argv:
    raise SystemExit(0)
scene.render.resolution_x=2400
scene.render.resolution_y=2800
scene.camera=front
scene.render.filepath=str(OUT/'tshirt-base-stitched-front.png')
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'tshirt-base-stitched-r002.blend'))
bpy.ops.render.render(write_still=True)
scene.camera=bpy.data.objects['CAMERA | three-quarter']
scene.render.filepath=str(OUT/'tshirt-base-stitched-angle.png')
bpy.ops.render.render(write_still=True)
scene.camera=front
scene.render.film_transparent=True
bpy.data.objects['STAGE | matte navy seamless'].hide_render=True
scene.render.filepath=str(OUT/'tshirt-base-stitched-transparent.png')
bpy.ops.render.render(write_still=True)
