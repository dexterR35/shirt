"""End visible armhole stitching where the underarm fold opens, not inside it.

The cloth sleeve and body only meet at the bottom of a narrow fold (about
z 0.535). A stitch line that follows the join there is visible from behind as a
tail running down between the hanging sleeve and the body. This revision keeps
r006's armhole arc above the fold entry and leaves the fold itself unstitched.
"""
import bpy
import json
import ast
from pathlib import Path
from datetime import datetime
from mathutils import Vector
from mathutils.bvhtree import BVHTree

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'artifacts'/'blender-shirt'
if bpy.app.background:
    bpy.ops.wm.open_mainfile(filepath=str(OUT/'tshirt-base-stitched-r006.blend'))
else:
    bpy.ops.wm.save_as_mainfile(filepath=str(OUT/('before-underarm-fix-'+datetime.now().strftime('%Y%m%d-%H%M%S')+'.blend')),copy=True)
shirt=bpy.data.objects['T-Shirt | base proportions and stitched construction']
bvh=BVHTree.FromObject(shirt,bpy.context.evaluated_depsgraph_get())
construction=bpy.data.collections['CONSTRUCTION | base collar armholes cuffs hem']
thread=bpy.data.materials['STITCH | soft ivory cotton thread']
seam_mat=bpy.data.materials['SEAM | subtle recessed joining line']
# Height where the underarm fold opens between the hanging sleeve and the body,
# measured on the r006 rear close-up. Visible stitching stops here.
FOLD_ENTRY_Z=0.575
# Reuse only the pure curve helper, never an earlier scene mutation.
module=ast.parse((ROOT/'scripts'/'blender-fix-sleeve-seams.py').read_text())
helpers=ast.Module(body=[n for n in module.body if isinstance(n,ast.FunctionDef) and n.name=='curve'],type_ignores=[])
exec(compile(helpers,'sewing-helpers','exec'))

def open_sampler(path):
    lengths=[0]
    for a,b in zip(path,path[1:]):
        lengths.append(lengths[-1]+(b-a).length)
    def at(s):
        s=min(max(s,0),lengths[-1])
        lo,hi=0,len(lengths)-1
        while hi-lo>1:
            mid=(lo+hi)//2
            if lengths[mid]<=s:lo=mid
            else:hi=mid
        return path[lo].lerp(path[hi],(s-lengths[lo])/max(1e-12,lengths[hi]-lengths[lo]))
    return lengths[-1],at

def visible_arc(label):
    old=next(o for o in construction.objects if label+' ARMHOLE' in o.name and 'turned seam' in o.name)
    loop=[Vector(p.co[:3]) for p in old.data.splines[0].points][:-1]
    low=[p.z<FOLD_ENTRY_Z for p in loop]
    assert any(low) and not all(low)
    # Rotate so the loop starts at one fold entry; the arc then runs over the
    # shoulder to the other fold entry and the fold section is contiguous at the end.
    start=next(i for i in range(len(loop)) if not low[i] and low[i-1])
    loop=loop[start:]+loop[:start]
    low=low[start:]+low[:start]
    arc=loop[:low.index(True)]
    assert all(low[len(arc):]),'armhole enters the fold more than once'
    return arc,min(p.z for p in loop)

def stitch_arc(name,path):
    total,at=open_sampler(path)
    # Same thread geometry as the closed sections, without wrapping around.
    def point(s,lateral=0,clearance=0.00046):
        pos=at(s)
        hit,normal,_,_=bvh.find_nearest(pos)
        tangent=(at(s+0.0005)-at(s-0.0005)).normalized()
        across=normal.cross(tangent).normalized()
        hit,normal,_,_=bvh.find_nearest(hit+across*lateral)
        return hit+normal*clearance
    count=round(total/0.0022)
    pitch=total/count
    stitches=[[point((i+t)*pitch,lateral) for t in (0.12,0.31,0.50,0.69)] for lateral in (-0.00085,0.00085) for i in range(count)]
    curve(name+' | double topstitch above underarm fold',stitches,0.00034,thread)
    loops=[[point((i+0.25+0.35*t)*pitch,(t-0.5)*0.0017) for t in (0,0.33,0.67,1)] for i in range(count)]
    curve(name+' | coverstitch cross-loops above underarm fold',loops,0.00018,thread)
    n=round(total/0.0008)
    curve(name+' | turned seam above underarm fold',[[point(total*i/n,0,0.00006) for i in range(n+1)]],0.00013,seam_mat)
    return total,count*2

arcs={label:visible_arc(label) for label in ('LEFT','RIGHT')}
for obj in list(construction.objects):
    if 'ARMHOLE' in obj.name:bpy.data.objects.remove(obj,do_unlink=True)
report=[]
for label,(arc,previous_low) in arcs.items():
    length,stitches=stitch_arc(label+' ARMHOLE | visible arc',arc)
    report.append({'name':label+' ARMHOLE | visible arc','length_m':length,'stitches':stitches,'fold_entry_z_m':FOLD_ENTRY_Z,'previous_lowest_z_m':previous_low,'lowest_z_m':min(p.z for p in arc),'method':'r006 armhole arc kept above the underarm fold entry; fold section left unstitched'})
    print('UNDERARM',label,'lowest stitch',round(previous_low,4),'->',round(report[-1]['lowest_z_m'],4))
shirt['revision']='r007: armhole stitching ends at the underarm fold entry instead of running down into it'
scene=bpy.context.scene
cam=bpy.data.objects['CAMERA | rear armhole inspection']
target=Vector((0,0.04,0.635))
cam.location=(0,2.4,0.7)
cam.rotation_euler=(target-cam.location).to_track_quat('-Z','Y').to_euler()
scene.camera=bpy.data.objects['CAMERA | front product']
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'tshirt-base-stitched-r007.blend'))
(OUT/'underarm-stitch-report.json').write_text(json.dumps(report,indent=2))
if bpy.app.background:
    for obj in scene.objects:
        if obj.name.startswith('STAGE'):obj.hide_render=True
    light_data=bpy.data.lights.new('REVIEW | rear softbox','AREA')
    light_data.energy=55
    light_data.shape='DISK'
    light_data.size=1.2
    light=bpy.data.objects.new('REVIEW | rear softbox',light_data)
    scene.collection.objects.link(light)
    light.location=(-0.7,1.2,1.4)
    light.rotation_euler=(target-light.location).to_track_quat('-Z','Y').to_euler()
    prefs=bpy.context.preferences.addons['cycles'].preferences
    prefs.compute_device_type='CUDA'
    prefs.get_devices()
    for device in prefs.devices:device.use=device.type=='CUDA'
    scene.cycles.device='GPU' if any(d.use for d in prefs.devices) else 'CPU'
    scene.cycles.samples=64
    scene.cycles.use_denoising=True
    scene.render.resolution_percentage=100
    scene.render.resolution_x=1600
    scene.render.resolution_y=1050
    scene.camera=cam
    scene.render.filepath=str(OUT/'tshirt-underarm-rear.png')
    bpy.ops.render.render(write_still=True)
    cam.location=(1.3,2.2,0.6)
    cam.data.ortho_scale=0.42
    underarm=Vector((0.2,0.04,0.58))
    cam.rotation_euler=(underarm-cam.location).to_track_quat('-Z','Y').to_euler()
    scene.render.filepath=str(OUT/'tshirt-underarm-rear-detail.png')
    bpy.ops.render.render(write_still=True)
