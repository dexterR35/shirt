import bpy,json
from pathlib import Path
from mathutils import Vector
from mathutils.bvhtree import BVHTree
OUT=Path(__file__).resolve().parents[1]/'artifacts'/'blender-shirt'
bpy.ops.wm.open_mainfile(filepath=str(OUT/'tshirt-base-stitched-r004.blend'))
shirt=bpy.data.objects['T-Shirt | base proportions and stitched construction']
bvh=BVHTree.FromObject(shirt,bpy.context.evaluated_depsgraph_get())
for obj in bpy.data.objects:
    if obj.type=='CURVE' and ('COLLAR' in obj.name or 'BACK NECK' in obj.name) and 'seam' in obj.name:
        points=[list(p.co[:3]) for s in obj.data.splines for p in s.points]
        print(obj.name,points[::max(1,len(points)//10)])
for y in (-.12,-.08,-.04,0,.04,.08,.12,.16):
    print('TOPSCAN',y,[(x,round(hit.z,4) if hit else None) for x in (0,.04,.08,.1,.12,.14) for hit,_,_,_ in [bvh.ray_cast(Vector((x,y,1)),Vector((0,0,-1)),.35)]])
