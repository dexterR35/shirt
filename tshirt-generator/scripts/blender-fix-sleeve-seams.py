"""Straighten sleeve joining seams and remove artificial shoulder bridge bulges."""
import bpy
import json
from bisect import bisect_right
from datetime import datetime
from pathlib import Path
from mathutils import Vector
from mathutils.bvhtree import BVHTree

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'artifacts' / 'blender-shirt'
if bpy.app.background:
    bpy.ops.wm.open_mainfile(filepath=str(OUT / 'tshirt-base-stitched-r003.blend'))
else:
    # Preserve the user's current edits and viewing state before this correction.
    bpy.ops.wm.save_as_mainfile(filepath=str(OUT / ('before-sleeve-fix-' + datetime.now().strftime('%Y%m%d-%H%M%S') + '.blend')), copy=True)
shirt = bpy.data.objects['T-Shirt | base proportions and stitched construction']
bvh = BVHTree.FromObject(shirt, bpy.context.evaluated_depsgraph_get())
construction = bpy.data.collections['CONSTRUCTION | base collar armholes cuffs hem']
thread = bpy.data.materials['STITCH | soft ivory cotton thread']
seam_mat = bpy.data.materials['SEAM | subtle recessed joining line']

height=max(v.co.z for v in shirt.data.vertices)-min(v.co.z for v in shirt.data.vertices)
scale=height/196
zmax=max(v.co.z for v in shirt.data.vertices)

def surface(x,z,back=False):
    hit,normal,_,_=bvh.ray_cast(Vector((x,1 if back else -1,z)),Vector((0,-1 if back else 1,0)),3)
    return hit

def armhole_path(sign):
    # Straight front/back panel lines, with a surface-following shoulder join.
    # No sinusoidal outward excursion in either bridge.
    front=[]
    back=[]
    for i in range(201):
        t=i/200
        x=sign*(64-13*t)*scale
        z=zmax-(21+53*t)*scale
        a=surface(x,z)
        b=surface(x,z,True)
        if a is not None and b is not None:
            front.append(a)
            back.append(b)
    def bridge(a,b,shoulder=False):
        points=[]
        for i in range(1,101):
            guess=a.lerp(b,i/101)
            if shoulder:
                hit,_,_,_=bvh.ray_cast(Vector((guess.x,guess.y,zmax+0.1)),Vector((0,0,-1)),1)
            else:
                hit,_,_,_=bvh.find_nearest(guess)
            points.append(hit)
        return points
    path=front+bridge(front[-1],back[-1])+list(reversed(back))+bridge(back[0],front[0],True)
    total,at=sampler(path)
    path=[at(total*i/900) for i in range(900)]
    # Smooth the joins in the tangent direction and re-fit to cloth every pass.
    for _ in range(8):
        path=[bvh.find_nearest(path[i]*0.5+(path[(i-1)%len(path)]+path[(i+1)%len(path)])*0.25)[0] for i in range(len(path))]
    return path

def cuff_path(sign):
    label='LEFT' if sign<0 else 'RIGHT'
    obj=next(o for o in construction.objects if label+' CUFF' in o.name and 'continuous turned seam' in o.name)
    path=[Vector(p.co[:3]) for p in obj.data.splines[0].points][:-1]
    total,at=sampler(path)
    path=[at(total*i/500) for i in range(500)]
    # Remove the short bridge ripple while retaining the observed hem's route.
    for _ in range(100):
        path=[path[i]*0.5+(path[(i-1)%500]+path[(i+1)%500])*0.25 for i in range(500)]
    return [bvh.find_nearest(p)[0] for p in path]

def sampler(path):
    points = path + [path[0]]
    lengths = [0]
    for a,b in zip(points,points[1:]):
        lengths.append(lengths[-1]+(b-a).length)
    def at(s):
        s %= lengths[-1]
        i = min(len(points)-2, max(0, bisect_right(lengths,s)-1))
        return points[i].lerp(points[i+1], (s-lengths[i])/max(1e-12,lengths[i+1]-lengths[i]))
    return lengths[-1], at

def curve(name, paths, radius, material):
    data = bpy.data.curves.new(name, 'CURVE')
    data.dimensions = '3D'
    data.resolution_u = 1
    data.bevel_depth = radius
    data.bevel_resolution = 2
    data.use_fill_caps = True
    for path in paths:
        spline = data.splines.new('POLY')
        spline.points.add(len(path)-1)
        for point, co in zip(spline.points,path):
            point.co = (*co,1)
    obj = bpy.data.objects.new(name,data)
    construction.objects.link(obj)
    data.materials.append(material)
    obj['construction'] = 'Straight panel join fitted continuously to the garment, without outward bridge arcs.'
    return obj

report = []
def stitch_section(name, path, cross_loops=False):
    gaps = [(a-b).length for a,b in zip(path,path[1:]+[path[0]])]
    assert max(gaps)<0.006, (name, 'section is not a closed continuous contour',max(gaps))
    total, at = sampler(path)
    # One continuously sampled surface loop, including over shoulder and underarm.
    def point(s, lateral=0, clearance=0.00046):
        pos = at(s)
        hit, normal, _, _ = bvh.find_nearest(pos)
        tangent = (at(s+0.0005)-at(s-0.0005)).normalized()
        across = normal.cross(tangent).normalized()
        hit, normal, _, _ = bvh.find_nearest(hit+across*lateral)
        return hit + normal*clearance
    count = round(total/0.0022)
    pitch = total/count
    stitches = [[point((i+t)*pitch,lateral) for t in (0.12,0.31,0.50,0.69)] for lateral in (-0.00085,0.00085) for i in range(count)]
    curve(name+' | complete double topstitch',stitches,0.00034,thread)
    if cross_loops:
        loops = [[point((i+0.25+0.35*t)*pitch,(t-0.5)*0.0017) for t in (0,0.33,0.67,1)] for i in range(count)]
        curve(name+' | continuous coverstitch cross-loops',loops,0.00018,thread)
    n = round(total/0.0008)
    curve(name+' | continuous turned seam',[[point(total*i/n,0,0.00006) for i in range(n+1)]],0.00013,seam_mat)
    report.append({'name':name,'length_m':total,'stitches':count*2,'largest_section_edge_m':max(gaps),'method':'straight panel paths and smoothed surface-fitted joins'})

# Replace only sleeve construction in the new revision; neckline and fabric stay intact.
cuff_paths={sign:cuff_path(sign) for sign in (-1,1)}
for obj in list(construction.objects):
    if 'ARMHOLE' in obj.name or 'CUFF' in obj.name:
        bpy.data.objects.remove(obj,do_unlink=True)
for sign, label in [(-1,'LEFT'),(1,'RIGHT')]:
    stitch_section(label+' ARMHOLE | straight panel join',armhole_path(sign),True)
    stitch_section(label+' CUFF | smooth turned hem',cuff_paths[sign])

scene = bpy.context.scene
shirt['revision'] = 'r004: straight sleeve panel joins and smooth shoulder/cuff connections'
camera = bpy.data.objects.get('CAMERA | sleeve construction detail')
if camera is None:
    camera = bpy.data.objects.new('CAMERA | sleeve construction detail',bpy.data.cameras.new('Sleeve construction detail'))
    scene.collection.objects.link(camera)
camera.location = (1.1,-1.65,0.92)
target = Vector((0.045,0,0.625))
camera.rotation_euler = (target-camera.location).to_track_quat('-Z','Y').to_euler()
camera.data.type = 'ORTHO'
camera.data.ortho_scale = 0.75
for screen in bpy.data.screens:
    for area in screen.areas:
        if not bpy.app.background and area.type=='CONSOLE' and screen==bpy.context.screen:
            area.type='VIEW_3D'
        if area.type=='VIEW_3D':
            space=area.spaces.active
            space.overlay.show_overlays=False
            space.shading.type='MATERIAL'
            space.region_3d.view_perspective='ORTHO'
            space.region_3d.view_rotation=camera.rotation_euler.to_quaternion()
            space.region_3d.view_location=target
            space.region_3d.view_distance=0.82
scene.camera=bpy.data.objects['CAMERA | front product']
scene.render.filepath=str(OUT/'tshirt-corrected-seams-front.png')
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'tshirt-base-stitched-r004.blend'))
(OUT/'sleeve-seam-correction-report.json').write_text(json.dumps(report,indent=2))
print('SLEEVE_CORRECTION',json.dumps(report))
if bpy.app.background:
    prefs=bpy.context.preferences.addons['cycles'].preferences
    prefs.compute_device_type='CUDA'
    prefs.get_devices()
    for device in prefs.devices:
        device.use=device.type=='CUDA'
    scene.cycles.device='GPU' if any(d.use for d in prefs.devices) else 'CPU'
    scene.cycles.samples=64
    scene.cycles.use_denoising=True
    scene.render.resolution_percentage=100
    scene.render.resolution_x=1500
    scene.render.resolution_y=1300
    scene.camera=camera
    scene.render.filepath=str(OUT/'tshirt-corrected-seams-angle.png')
    bpy.ops.render.render(write_still=True)
    camera.location=(0,-3.4,0.635)
    camera.rotation_euler=(Vector((0,0,0.635))-camera.location).to_track_quat('-Z','Y').to_euler()
    camera.data.ortho_scale=0.78
    scene.render.resolution_y=1050
    scene.render.filepath=str(OUT/'tshirt-corrected-seams-detail.png')
    bpy.ops.render.render(write_still=True)
