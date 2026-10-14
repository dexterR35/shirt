"""Replace the front-only collar decoration with a closed 3D sewing loop."""
import bpy
import json
import math
from pathlib import Path
from datetime import datetime
from bisect import bisect_right
from mathutils import Vector
from mathutils.bvhtree import BVHTree

OUT=Path(__file__).resolve().parents[1]/'artifacts'/'blender-shirt'
if bpy.app.background:
    bpy.ops.wm.open_mainfile(filepath=str(OUT/'tshirt-base-stitched-r004.blend'))
else:
    bpy.ops.wm.save_as_mainfile(filepath=str(OUT/('before-collar-fix-'+datetime.now().strftime('%Y%m%d-%H%M%S')+'.blend')),copy=True)
shirt=bpy.data.objects['T-Shirt | base proportions and stitched construction']
bvh=BVHTree.FromObject(shirt,bpy.context.evaluated_depsgraph_get())
collection=bpy.data.collections['CONSTRUCTION | base collar armholes cuffs hem']
thread=bpy.data.materials['STITCH | soft ivory cotton thread']
seam=bpy.data.materials['SEAM | subtle recessed joining line']
binding=bpy.data.materials['BINDING | white folded fabric edge']
center=Vector((0,0.02,0))
old_front=next(o for o in collection.objects if 'COLLAR | front round neck | joined seam' in o.name)
front_points=[Vector(p.co[:3]) for s in old_front.data.splines for p in s.points]
front_angles=[]
for p in front_points:
    angle=math.atan2(p.y-center.y,p.x-center.x)
    while front_angles and angle<front_angles[-1]:angle+=2*math.pi
    front_angles.append(angle)

def top(x,y):
    hit,normal,_,_=bvh.ray_cast(Vector((x,y,1)),Vector((0,0,-1)),0.31)
    return hit

# Find the opening's actual outline in every radial direction. The resulting
# sewing route follows the top surface around the entire existing neck band.
path=[]
for i in range(720):
    theta=2*math.pi*i/720
    direction=Vector((math.cos(theta),math.sin(theta),0))
    previous=0.0
    boundary=None
    for j in range(1,181):
        radius=j*0.001
        xy=center+direction*radius
        if top(xy.x,xy.y) is not None:
            lo,hi=previous,radius
            for _ in range(12):
                mid=(lo+hi)/2
                xy=center+direction*mid
                if top(xy.x,xy.y) is None:lo=mid
                else:hi=mid
            boundary=hi
            break
        previous=radius
    assert boundary is not None, ('missing neck boundary',i)
    # The front band is broader in plan view than the near-vertical rear band.
    margin=0.024-0.008*max(0,math.sin(theta))
    xy=center+direction*(boundary+margin)
    hit=top(xy.x,xy.y)
    assert hit is not None, ('collar projection missed',i)
    path.append(hit)

# Retain the accepted front curve exactly; only complete its missing rear arc.
# The back joins blend into its endpoints rather than adding a second neckline.
def original_front(angle):
    index=min(len(front_points)-2,max(0,bisect_right(front_angles,angle)-1))
    t=(angle-front_angles[index])/(front_angles[index+1]-front_angles[index])
    return front_points[index].lerp(front_points[index+1],t)

def base_at(angle):
    f=(angle%(2*math.pi))/(2*math.pi)*720
    index=int(f)%720
    return path[index].lerp(path[(index+1)%720],f-int(f))

start,end=front_angles[0],front_angles[-1]
start_delta=front_points[0]-base_at(start)
end_delta=front_points[-1]-base_at(end)
fitted=[]
for i,p in enumerate(path):
    angle=2*math.pi*i/720
    while angle<start:angle+=2*math.pi
    if angle<=end:
        fitted.append(original_front(angle))
    else:
        near_end=max(0,1-(angle-end)/0.4)
        near_start=max(0,1-(start+2*math.pi-angle)/0.4)
        q=p+end_delta*(near_end*near_end)+start_delta*(near_start*near_start)
        fitted.append(top(q.x,q.y))
path=fitted
# Smooth tiny triangulation variations before fitting the final continuous route.
for _ in range(6):
    path=[bvh.find_nearest(path[i]*0.5+(path[(i-1)%720]+path[(i+1)%720])*0.25)[0] for i in range(720)]
distances=[0.0]
closed=path+[path[0]]
for a,b in zip(closed,closed[1:]):distances.append(distances[-1]+(b-a).length)
length=distances[-1]
assert max(b-a for a,b in zip(distances,distances[1:]))<0.006, 'Neck seam must not jump between surfaces'

def at(s):
    s%=length
    i=min(len(path)-1,max(0,bisect_right(distances,s)-1))
    return closed[i].lerp(closed[i+1],(s-distances[i])/(distances[i+1]-distances[i]))

def point(s,lateral=0,clearance=0.00046):
    hit,normal,_,_=bvh.find_nearest(at(s))
    if normal.z<0:normal.negate()
    tangent=(at(s+0.0005)-at(s-0.0005)).normalized()
    across=normal.cross(tangent).normalized()
    hit,normal,_,_=bvh.find_nearest(hit+across*lateral)
    if normal.z<0:normal.negate()
    return hit+normal*clearance

def curve(name,paths,radius,material,cyclic=False):
    data=bpy.data.curves.new(name,'CURVE')
    data.dimensions='3D'
    data.bevel_depth=radius
    data.bevel_resolution=2
    data.use_fill_caps=True
    for coords in paths:
        spline=data.splines.new('POLY')
        spline.points.add(len(coords)-1)
        for p,co in zip(spline.points,coords):p.co=(*co,1)
        spline.use_cyclic_u=cyclic
    obj=bpy.data.objects.new(name,data)
    collection.objects.link(obj)
    data.materials.append(material)
    obj['construction']='Full 360-degree neckline stitching; uniform pitch across the closing join.'
    return obj

for obj in list(collection.objects):
    if 'COLLAR' in obj.name or 'BACK NECK' in obj.name:
        bpy.data.objects.remove(obj,do_unlink=True)
count=round(length/0.0019)
pitch=length/count
rows=[[point((i+t)*pitch,lateral) for t in (0.12,0.31,0.5,0.69)] for lateral in (-0.00085,0.00085) for i in range(count)]
curve('COLLAR 360 | continuous double topstitch',rows,0.00034,thread)
loops=[[point((i+0.25+0.35*t)*pitch,(t-0.5)*0.0017) for t in (0,0.33,0.67,1)] for i in range(count)]
curve('COLLAR 360 | continuous coverstitch cross-loops',loops,0.00018,thread)
curve('COLLAR 360 | closed joining seam',[[point(length*i/1000,0,0.00006) for i in range(1000)]],0.00013,seam,True)
curve('COLLAR 360 | closed folded edge',[[point(length*i/1000,0.0014,0.00010) for i in range(1000)]],0.00026,binding,True)
shirt['revision']='r005: complete neckline sewing loop, including sides and rear; r004 sleeves preserved'

scene=bpy.context.scene
cam=bpy.data.objects.get('CAMERA | complete collar inspection')
if cam is None:
    cam=bpy.data.objects.new('CAMERA | complete collar inspection',bpy.data.cameras.new('Complete collar inspection'))
    scene.collection.objects.link(cam)
target=Vector((0,0.02,0.775))
cam.location=(0,-0.5,2.4)
cam.rotation_euler=(target-cam.location).to_track_quat('-Z','Y').to_euler()
cam.data.type='ORTHO'
cam.data.ortho_scale=0.36
for screen in bpy.data.screens:
    for area in screen.areas:
        if not bpy.app.background and screen==bpy.context.screen and area.type=='CONSOLE':area.type='VIEW_3D'
        if area.type=='VIEW_3D':
            space=area.spaces.active
            space.shading.type='MATERIAL'
            space.overlay.show_overlays=False
            space.region_3d.view_perspective='ORTHO'
            space.region_3d.view_rotation=cam.rotation_euler.to_quaternion()
            space.region_3d.view_location=target
            space.region_3d.view_distance=0.40
scene.camera=bpy.data.objects['CAMERA | front product']
scene.render.filepath=str(OUT/'tshirt-complete-collar-front.png')
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'tshirt-base-stitched-r005.blend'))
report={'revision':'r005','length_m':length,'rows':2,'stitches_per_row':count,'pitch_m':pitch,'closed_centerline':True,'closing_join_distance_m':(point(0)-point(length)).length,'maximum_sample_gap_m':max(b-a for a,b in zip(distances,distances[1:]))}
(OUT/'collar-closure-report.json').write_text(json.dumps(report,indent=2))
print('COLLAR_REPORT',json.dumps(report))
if bpy.app.background:
    prefs=bpy.context.preferences.addons['cycles'].preferences
    prefs.compute_device_type='CUDA'
    prefs.get_devices()
    for device in prefs.devices:device.use=device.type=='CUDA'
    scene.cycles.device='GPU' if any(d.use for d in prefs.devices) else 'CPU'
    scene.cycles.samples=64
    scene.cycles.use_denoising=True
    scene.render.resolution_percentage=100
    scene.render.resolution_x=1400
    scene.render.resolution_y=1200
    scene.camera=cam
    scene.render.filepath=str(OUT/'tshirt-complete-collar-top.png')
    bpy.ops.render.render(write_still=True)
    cam.location=(0,-1.8,1.12)
    cam.rotation_euler=(Vector((0,0.02,0.76))-cam.location).to_track_quat('-Z','Y').to_euler()
    cam.data.ortho_scale=0.38
    scene.render.resolution_y=950
    scene.render.filepath=str(OUT/'tshirt-complete-collar-front.png')
    bpy.ops.render.render(write_still=True)
