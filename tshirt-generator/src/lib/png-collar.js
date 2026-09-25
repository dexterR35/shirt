/** Paint boundaries measured on the existing PNG neckline, in 200-unit space.
 * They tint the sewn fabric; they never introduce flaps, a V or a placket.
 */
export const PNG_NECK_AREA = 'M70 5L77 2Q100 7 123 2L130 5C132 32 68 32 70 5Z';
export const PNG_NECK_OPENING = 'M77 2Q100 7 123 2C127 24 73 24 77 2Z';
/** The same ring's back half, seen from behind on the 3D mesh (same u axis as the front),
 * down to its seam: the rib's top edge runs from v 0.6 beside the neck to v 3 at the
 * center back, and it is about 5 units (2 cm) deep. Measured on the mesh's back
 * projection (docs/THREE_D_VIEW.md); the 2D PNG never shows it.
 */
export const BACK_NECK_RING = 'M73 -2H127V6.5Q121 5 116 5.8Q100 9.6 84 5.8Q79 5 73 6.5Z';

/** Map outer-to-inner color bands onto the same sewn round ring.
 * @param {object} config
 * @param {{color:string,weight:number}[]} bands Relative widths, outer to inner.
 */
export function baseCollarPaint(config, bands = [{color:config.colors.collar,weight:1}]) {
  const n = v => +v.toFixed(3);
  const contour = t => `M${n(70+7*t)} ${n(5-3*t)}L77 2Q100 7 123 2L${n(130-7*t)} ${n(5-3*t)}C${n(132-5*t)} ${n(32-8*t)} ${n(68+5*t)} ${n(32-8*t)} ${n(70+7*t)} ${n(5-3*t)}Z`;
  const layer=(id,d,fill,colorRole)=>({id,type:'path',d,fill,clip:'all',...(colorRole?{colorRole}:{})});
  const total=bands.reduce((sum,b)=>sum+b.weight,0);
  if(!bands.length || bands.length>10 || bands.some(b=>!Number.isFinite(b.weight)||b.weight<=0))throw Error('Invalid collar color bands');
  let offset=0;
  const layers=bands.map((b,i)=>{
    const result=layer(`base-collar-color-${i}`,contour(offset/total),b.color,i===0?'collar':undefined);
    offset+=b.weight;
    return result;
  });
  layers.push(layer('base-neck-facing',PNG_NECK_OPENING,config.colors.body,'body'));
  return {shape:'custom',layers};
}
