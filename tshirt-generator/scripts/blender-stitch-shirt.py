"""Refine the supplied GLB against base.png, adding real, editable stitching.

The source image, original GLB, and the first studio revision stay unchanged.
"""
import bpy
import json
import math
from pathlib import Path
from bisect import bisect_right
from mathutils import Vector
from mathutils.bvhtree import BVHTree

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'artifacts' / 'blender-shirt'
bpy.ops.wm.open_mainfile(filepath=str(OUT / 'tshirt-smooth-studio.blend'))
scene = bpy.context.scene
shirt = bpy.data.objects['T-Shirt | smooth editable fabric']
shirt.name = 'T-Shirt | base proportions and stitched construction'
shirt.modifiers[0].iterations = 100
depsgraph = bpy.context.evaluated_depsgraph_get()
evaluated = shirt.evaluated_get(depsgraph)
refined = bpy.data.meshes.new_from_object(evaluated, depsgraph=depsgraph)
shirt.modifiers.clear()
shirt.data = refined

# Match the measured front aspect ratio with a uniform width correction.
# Row-wise scaling is intentionally avoided: the sleeve/torso transition has
# multiple silhouette intervals and must not create horizontal mesh ridges.
zmin = min(v.co.z for v in refined.vertices)
zmax = max(v.co.z for v in refined.vertices)
height = zmax-zmin
scale = height / 196
current_width=max(v.co.x for v in refined.vertices)-min(v.co.x for v in refined.vertices)
width_ratio=(3314/3779*height)/current_width
for vert in refined.vertices:
    vert.co.x *= width_ratio
refined.update()
for poly in refined.polygons:
    poly.use_smooth = True
bpy.context.view_layer.update()
bvh = BVHTree.FromObject(shirt,bpy.context.evaluated_depsgraph_get())

details = bpy.data.collections.new('CONSTRUCTION | base collar armholes cuffs hem')
scene.collection.children.link(details)

def make_mat(name, color, roughness=0.85):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    mat.diffuse_color = (*color,1)
    bsdf = mat.node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value = (*color,1)
    bsdf.inputs['Roughness'].default_value = roughness
    bsdf.inputs['Specular IOR Level'].default_value = 0.2
    return mat

thread = make_mat('STITCH | soft ivory cotton thread',(0.42,0.44,0.46))
seam_mat = make_mat('SEAM | subtle recessed joining line',(0.40,0.42,0.44))
edge_mat = make_mat('BINDING | white folded fabric edge',(0.72,0.74,0.77))

def curve_object(name, paths, radius, mat):
    curve = bpy.data.curves.new(name,'CURVE')
    curve.dimensions = '3D'
    curve.resolution_u = 1
    curve.bevel_depth = radius
    curve.bevel_resolution = 2
    curve.use_fill_caps = True
    for points in paths:
        if len(points)<2:
            continue
        spline = curve.splines.new('POLY')
        spline.points.add(len(points)-1)
        for p,co in zip(spline.points,points):
            p.co = (*co,1)
    obj = bpy.data.objects.new(name,curve)
    details.objects.link(obj)
    curve.materials.append(mat)
    obj['construction'] = 'Actual 3D thread/seam curves fitted to model surface; no image decal.'
    return obj

def cubic(a,b,c,d,n=160):
    a,b,c,d = map(Vector,(a,b,c,d))
    return [a*(1-t)**3+b*3*t*(1-t)**2+c*3*t*t*(1-t)+d*t**3 for t in [i/n for i in range(n+1)]]

def surface(uv, side='front', offset=0.00013):
    x=(uv[0]-100)*scale
    z=zmax-(uv[1]-2)*scale
    direction=Vector((0,1 if side=='front' else -1,0))
    origin=Vector((x,-1 if side=='front' else 1,z))
    hit,normal,face,distance=bvh.ray_cast(origin,direction,3)
    if hit is None:
        return None
    if normal.dot(direction)>0:
        normal=-normal
    return hit + normal*offset

def shifted(points, distance):
    result=[]
    for i,p in enumerate(points):
        tangent=points[min(i+1,len(points)-1)]-points[max(0,i-1)]
        tangent.normalize()
        perp=Vector((-tangent.y,tangent.x))
        result.append(p+perp*distance)
    return result

def arc_sampler(points):
    lengths=[0]
    for a,b in zip(points,points[1:]):
        lengths.append(lengths[-1]+(b-a).length)
    def at(s):
        i=min(len(points)-2,max(0,bisect_right(lengths,s)-1))
        t=(s-lengths[i])/max(1e-12,lengths[i+1]-lengths[i])
        return points[i].lerp(points[i+1],min(1,max(0,t)))
    return lengths[-1],at

seam_report=[]
def sew_closed(name, points, outer_signs=(1,-1), coverstitch=False):
    """Continue reference front seams all the way around the 3D garment."""
    front=[surface(p,'front',0) for p in points]
    back=[surface(p,'back',0) for p in reversed(points)]
    front=[p for p in front if p is not None]
    back=[p for p in back if p is not None]
    def bridge(a,b,sign):
        result=[]
        for i in range(1,32):
            t=i/32
            guess=a.lerp(b,t)+Vector((sign*0.014*math.sin(math.pi*t),0,0))
            hit,normal,index,distance=bvh.find_nearest(guess)
            result.append(hit)
        return result
    path=front+bridge(front[-1],back[0],outer_signs[0])+back+bridge(back[-1],front[0],outer_signs[1])+[front[0]]
    # Smooth only the small join paths by arc-length resampling of the surface.
    total,at=arc_sampler(path)
    threads=[]
    stitch_count=0
    for lateral in (-0.00085,0.00085):
        s=0.0
        while s<total-0.002:
            segment=[]
            for t in (0.1,0.3,0.5,0.7):
                pos=at(s+0.0022*t)
                tangent=(at(min(total,s+0.0022*t+0.0003))-at(max(0,s+0.0022*t-0.0003))).normalized()
                hit,normal,index,distance=bvh.find_nearest(pos)
                across=normal.cross(tangent).normalized()
                hit,normal,index,distance=bvh.find_nearest(hit+across*lateral)
                segment.append(hit+normal*0.00035)
            if max((a-b).length for a,b in zip(segment,segment[1:]))<0.004:
                threads.append(segment)
                stitch_count+=1
            s+=0.0022
    curve_object(name+' | complete double topstitch',threads,0.00022,thread)
    if coverstitch:
        loops=[]
        s=0.0
        while s<total-0.0022:
            segment=[]
            for t in (0,0.33,0.67,1):
                pos=at(s+0.0022*(0.24+0.36*t))
                tangent=(at(min(total,s+0.0017))-at(max(0,s+0.0002))).normalized()
                hit,normal,index,distance=bvh.find_nearest(pos)
                across=normal.cross(tangent).normalized()
                hit,normal,index,distance=bvh.find_nearest(hit+across*((t-0.5)*0.0017))
                segment.append(hit+normal*0.00035)
            if max((a-b).length for a,b in zip(segment,segment[1:]))<0.004:
                loops.append(segment)
            s+=0.0022
        curve_object(name+' | continuous coverstitch cross-loops',loops,0.000115,thread)
    surface_path=[]
    for i in range(round(total/0.001)+1):
        hit,normal,index,distance=bvh.find_nearest(at(total*i/round(total/0.001)))
        surface_path.append(hit+normal*0.00006)
    curve_object(name+' | continuous turned seam',[surface_path],0.00013,seam_mat)
    seam_report.append({'name':name,'side':'closed 3D front/back/side loop','stitches':stitch_count})

def sew(name, points, side='front', double=True, binding=False, pitch=0.53):
    # Reference coordinates are 200 units; 0.53 units is ~2 mm stitch pitch.
    center=[surface(p,side,0.00004) for p in points]
    runs=[]
    run=[]
    for p in center:
        if p is None or (run and (p-run[-1]).length>0.012):
            if len(run)>1:runs.append(run)
            run=[]
        if p is not None:run.append(p)
    if len(run)>1:runs.append(run)
    curve_object(name+' | joined seam',runs,0.00018,seam_mat)
    if binding:
        curve_object(name+' | folded edge',[[surface(p,side,0.00005) for p in run2 if surface(p,side,0.00005) is not None] for run2 in [shifted(points,0.18)]],0.00032,edge_mat)
    stitch_paths=[]
    for lateral in (-0.23,0.23) if double else (0,):
        length,at=arc_sampler(shifted(points,lateral))
        s=0.0
        while s<length-pitch:
            uv=[at(s+pitch*t) for t in (0.10,0.30,0.50,0.70)]
            projected=[surface(p,side,0.00036) for p in uv]
            if all(p is not None for p in projected) and max((p-q).length for p,q in zip(projected,projected[1:]))<0.004:
                # A tiny arch makes each stitch a thread, rather than a flat line.
                for j,p in enumerate(projected):
                    p.y += (-1 if side=='front' else 1)*math.sin(j/3*math.pi)*0.00011
                stitch_paths.append(projected)
            s+=pitch
    curve_object(name+' | double topstitch' if double else name+' | topstitch',stitch_paths,0.00022,thread)
    # Fine cross-loops reproduce the coverstitch seen on the reference's
    # collar and set-in armholes, rather than using only printed dash marks.
    if double and ('COLLAR' in name or 'ARMHOLE' in name):
        length,center_at=arc_sampler(points)
        _,left_at=arc_sampler(shifted(points,-0.23))
        _,right_at=arc_sampler(shifted(points,0.23))
        loops=[]
        s=0.0
        while s<length-pitch:
            start=left_at(s+pitch*0.24)
            end=right_at(s+pitch*0.60)
            projected=[surface(start.lerp(end,t),side,0.00035) for t in (0,0.33,0.67,1)]
            if all(p is not None for p in projected) and max((a-b).length for a,b in zip(projected,projected[1:]))<0.004:
                loops.append(projected)
            s+=pitch
        curve_object(name+' | coverstitch cross-loops',loops,0.000115,thread)
    seam_report.append({'name':name,'side':side,'stitches':len(stitch_paths),'projected_samples':sum(p is not None for p in center),'samples':len(points)})

# These paths follow the measured base.png construction (200-unit reference grid).
sew('COLLAR | front round neck',cubic((71,5),(67,32),(133,32),(129,5)),binding=True,pitch=0.47)
for name,sign in [('LEFT',-1),('RIGHT',1)]:
    mirror=lambda p:(100+sign*(p[0]-100),p[1])
    # Define right-hand path once, then mirror to left.
    armhole=cubic(*map(mirror,[(164,23),(160,35),(157,52),(155,61)]),n=140)
    armhole+=cubic(*map(mirror,[(155,61),(154,66),(152,72),(151,76)]),n=70)[1:]
    sew_closed(name+' ARMHOLE | set-in sleeve',armhole,(sign,sign),coverstitch=True)
    cuff=cubic(*map(mirror,[(185,76.5),(176,80.0),(163,85.0),(154,83.0)]))
    sew_closed(name+' CUFF | turned hem',cuff,(-sign,sign))
hem=cubic((50,194),(73,196),(127,196),(150,194),n=240)
sew_closed('BOTTOM HEM | continuous turned hem',hem)

# Back construction is an explicit continuation of the visible front sewing style.
sew('BACK NECK | facing',cubic((76,7),(88,11),(113,11),(124,7)),side='front',binding=True,pitch=0.48)

# Lighting with more visible, gentle fold contrast than the first smooth study.
bpy.data.lights['SOFTBOX | large key left'].energy=72
bpy.data.lights['SOFTBOX | large key left'].size=0.95
bpy.data.lights['SOFTBOX | broad fill right'].energy=16
bpy.data.lights['SOFTBOX | frontal lift'].energy=4
scene.world.node_tree.nodes['Background'].inputs[1].default_value=0.08
scene.camera=bpy.data.objects['CAMERA | front product']
scene.camera.location.z=0.44
scene.camera.rotation_euler=(Vector((0,0,0.44))-scene.camera.location).to_track_quat('-Z','Y').to_euler()
prefs=bpy.context.preferences.addons['cycles'].preferences
prefs.compute_device_type='CUDA'
prefs.get_devices()
for device in prefs.devices:device.use=device.type=='CUDA'
scene.cycles.device='GPU' if any(d.use for d in prefs.devices) else 'CPU'
scene.cycles.samples=128
scene.render.filepath=str(OUT/'tshirt-base-stitched-front.png')
shirt['reference']='base.png: observed round collar, double armhole stitching, cuff and hem construction.'
shirt['revision']='r002: base aspect ratio and separate editable stitching'
shirt['limitations']='Native supplied GLB volume retained; single front reference does not establish exact hidden/back construction.'
notes=bpy.data.texts.new('README | base stitching r002')
notes.write('Base-referenced construction revision\n\nInput: user model.glb. Visual reference: base.png.\nThe native mesh remains 3D and matches the base front width-to-height ratio.\nCONSTRUCTION contains separately editable 3D thread paths for collar, armholes, cuffs, and hem.\nThe fabric has no coarse bump/noise or baked image lighting.\nOriginal source is hidden; the previous smooth study is preserved as its own blend.\nThe back seam continuations are inferred, because the supplied base is a front view.\n')
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'tshirt-base-stitched-r002.blend'))
(OUT/'stitching-report.json').write_text(json.dumps({'source':'model.glb','reference':'base.png','revision':'r002','seams':seam_report,'height':height,'fitted_width':max(v.co.x for v in refined.vertices)-min(v.co.x for v in refined.vertices)},indent=2))
print('SEAM_REPORT',json.dumps(seam_report))
scene.render.resolution_percentage=60
scene.cycles.samples=48
scene.render.filepath=str(OUT/'stitched-preview.png')
bpy.ops.render.render(write_still=True)
