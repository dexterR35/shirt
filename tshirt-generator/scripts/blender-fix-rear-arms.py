"""Fit armhole sewing through underarm folds along the mesh, not across air."""
import bpy
import json
import heapq
import math
import ast
from pathlib import Path
from datetime import datetime
from bisect import bisect_right
from mathutils import Vector
from mathutils.bvhtree import BVHTree

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'artifacts'/'blender-shirt'
if bpy.app.background:
    bpy.ops.wm.open_mainfile(filepath=str(OUT/'tshirt-base-stitched-r005.blend'))
else:
    bpy.ops.wm.save_as_mainfile(filepath=str(OUT/('before-rear-arm-fix-'+datetime.now().strftime('%Y%m%d-%H%M%S')+'.blend')),copy=True)
shirt=bpy.data.objects['T-Shirt | base proportions and stitched construction']
bvh=BVHTree.FromObject(shirt,bpy.context.evaluated_depsgraph_get())
construction=bpy.data.collections['CONSTRUCTION | base collar armholes cuffs hem']
thread=bpy.data.materials['STITCH | soft ivory cotton thread']
seam_mat=bpy.data.materials['SEAM | subtle recessed joining line']
mesh=shirt.data
report=[]
# Reuse only the pure curve/sampling helpers, never an earlier scene mutation.
module=ast.parse((ROOT/'scripts'/'blender-fix-sleeve-seams.py').read_text())
helpers=ast.Module(body=[n for n in module.body if isinstance(n,ast.FunctionDef) and n.name in ('sampler','curve','stitch_section')],type_ignores=[])
exec(compile(helpers,'sewing-helpers','exec'))
height=max(v.co.z for v in mesh.vertices)-min(v.co.z for v in mesh.vertices)
scale=height/196
zmax=max(v.co.z for v in mesh.vertices)

def surface(x,z,back=False):
    return bvh.ray_cast(Vector((x,1 if back else -1,z)),Vector((0,-1 if back else 1,0)),3)[0]

def underarm_route(a,b,sign):
    # Dijkstra on the actual underarm surface prevents the rear/front connector
    # from cutting through the garment or hopping between neighboring folds.
    allowed={v.index for v in mesh.vertices if 0.16<sign*v.co.x<0.255 and 0.465<v.co.z<0.635}
    adjacency={i:[] for i in allowed}
    for edge in mesh.edges:
        u,v=edge.vertices
        if u in allowed and v in allowed:
            distance=(mesh.vertices[u].co-mesh.vertices[v].co).length
            adjacency[u].append((v,distance))
            adjacency[v].append((u,distance))
    def nearest_vertex(p):
        _,_,face,_=bvh.find_nearest(p)
        candidates=[i for i in mesh.polygons[face].vertices if i in allowed]
        assert candidates,'underarm endpoint outside the surface patch'
        return min(candidates,key=lambda i:(mesh.vertices[i].co-p).length_squared)
    first,last=nearest_vertex(a),nearest_vertex(b)
    costs={first:0}
    parents={}
    heap=[(0,first)]
    while heap:
        distance,u=heapq.heappop(heap)
        if distance!=costs[u]:continue
        if u==last:break
        for v,weight in adjacency[u]:
            candidate=distance+weight
            if candidate<costs.get(v,float('inf')):
                costs[v]=candidate
                parents[v]=u
                heapq.heappush(heap,(candidate,v))
    assert last in costs,'No continuous underarm surface route'
    indices=[last]
    while indices[-1]!=first:indices.append(parents[indices[-1]])
    points=[a]+[mesh.vertices[i].co.copy() for i in reversed(indices)]+[b]
    print('UNDERARM_ROUTE',sign,len(points),costs[last],min(p.z for p in points),max(sign*p.x for p in points))
    return points

def armhole(sign):
    front=[]
    back=[]
    for i in range(201):
        t=i/200
        x=sign*(64-13*t)*scale
        z=zmax-(21+53*t)*scale
        a,b=surface(x,z),surface(x,z,True)
        if a is not None:front.append(a)
        # The rear seam meets the underarm fold above the front endpoint.
        # Mirroring the front endpoint down the back creates a visible U-shaped tail.
        if b is not None and t<=0.82:back.append(b)
    lower=underarm_route(front[-1],back[-1],sign)
    shoulder=[]
    for i in range(1,101):
        p=back[0].lerp(front[0],i/101)
        hit,_,_,_=bvh.ray_cast(Vector((p.x,p.y,zmax+0.1)),Vector((0,0,-1)),1)
        shoulder.append(hit)
    path=front+lower[1:-1]+list(reversed(back))+shoulder
    length,at=sampler(path)
    path=[at(length*i/1200) for i in range(1200)]
    for _ in range(30):
        path=[bvh.find_nearest(path[i]*0.5+(path[(i-1)%1200]+path[(i+1)%1200])*0.25)[0] for i in range(1200)]
    return path

paths={sign:armhole(sign) for sign in (-1,1)}
for obj in list(construction.objects):
    if 'ARMHOLE' in obj.name:bpy.data.objects.remove(obj,do_unlink=True)
for sign,label in [(-1,'LEFT'),(1,'RIGHT')]:
    stitch_section(label+' ARMHOLE | continuous rear and underarm join',paths[sign],True)
    report[-1]['method']='mesh-edge shortest path through underarm; rear endpoint ends in fold; surface-smoothed closed loop'
shirt['revision']='r006: rear armhole and underarm stitch paths routed along the cloth surface'
scene=bpy.context.scene
cam=bpy.data.objects.get('CAMERA | rear armhole inspection')
if cam is None:
    cam=bpy.data.objects.new('CAMERA | rear armhole inspection',bpy.data.cameras.new('Rear armhole inspection'))
    scene.collection.objects.link(cam)
target=Vector((0,0.04,0.635))
cam.location=(0,2.4,0.7)
cam.rotation_euler=(target-cam.location).to_track_quat('-Z','Y').to_euler()
cam.data.type='ORTHO'
cam.data.ortho_scale=0.79
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
            space.region_3d.view_distance=0.80
scene.camera=bpy.data.objects['CAMERA | front product']
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'tshirt-base-stitched-r006.blend'))
(OUT/'rear-arm-stitch-report.json').write_text(json.dumps(report,indent=2))
if bpy.app.background:
    # The product cyclorama is behind the shirt, between a rear camera and cloth.
    # Omit it from inspection renders and light the back with a temporary softbox.
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
    scene.render.filepath=str(OUT/'tshirt-rear-stitches.png')
    bpy.ops.render.render(write_still=True)
    cam.location=(1.6,2.4,0.64)
    cam.rotation_euler=(target-cam.location).to_track_quat('-Z','Y').to_euler()
    scene.render.filepath=str(OUT/'tshirt-rear-stitches-angle.png')
    bpy.ops.render.render(write_still=True)
