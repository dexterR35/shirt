"""Make construction readable in the interactive Blender view; keep r002 intact."""
import bpy
from pathlib import Path
from mathutils import Quaternion, Vector
from mathutils.bvhtree import BVHTree

ROOT = Path(bpy.data.filepath).resolve().parents[2]
OUT = ROOT / 'artifacts' / 'blender-shirt'
shirt = bpy.data.objects['T-Shirt | base proportions and stitched construction']
bvh = BVHTree.FromObject(shirt, bpy.context.evaluated_depsgraph_get())
construction = bpy.data.collections['CONSTRUCTION | base collar armholes cuffs hem']
for obj in construction.objects:
    obj.hide_set(False)
    obj.hide_viewport = False
    if obj.type != 'CURVE':
        continue
    if 'topstitch' in obj.name or 'cross-loops' in obj.name:
        obj.data.bevel_depth = 0.00034 if 'topstitch' in obj.name else 0.00018
        for spline in obj.data.splines:
            for point in spline.points:
                co = Vector(point.co[:3])
                hit, normal, _, _ = bvh.find_nearest(co)
                if normal.dot(co-hit) < 0:
                    normal.negate()
                point.co = (*(hit + normal * 0.00046), 1)
thread = bpy.data.materials['STITCH | soft ivory cotton thread']
thread.diffuse_color = (0.27, 0.29, 0.31, 1)
thread.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = thread.diffuse_color
shirt['revision'] = 'r003: clearer raised cotton stitches and close inspection viewport'
for screen in bpy.data.screens:
    for area in screen.areas:
        if area.type == 'CONSOLE' and screen == bpy.context.screen:
            area.type = 'VIEW_3D'
        if area.type != 'VIEW_3D':
            continue
        space = area.spaces.active
        space.shading.type = 'MATERIAL'
        space.overlay.show_overlays = False
        space.region_3d.view_perspective = 'ORTHO'
        space.region_3d.view_rotation = Quaternion((0.70710678, 0.70710678, 0, 0))
        space.region_3d.view_location = (0, 0, 0.62)
        space.region_3d.view_distance = 0.82
bpy.context.scene.render.filepath = str(OUT / 'tshirt-visible-stitches-front.png')
bpy.ops.wm.save_as_mainfile(filepath=str(OUT / 'tshirt-base-stitched-r003.blend'))
