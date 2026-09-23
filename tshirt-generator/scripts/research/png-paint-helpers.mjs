import {neutralConfig} from '../../src/lib/shirt-renderer.js';
import {baseCollarPaint} from '../../src/lib/png-collar.js';
export const path=(d,fill,clip='all',opacity=1)=>({type:'path',d,fill,clip,opacity});
export const rect=(x,y,width,height,fill,clip='all',opacity=1)=>({type:'rect',x,y,width,height,fill,clip,opacity});
export const poly=(points,fill,clip='all',opacity=1)=>({type:'polygon',points,fill,clip,opacity});
export function base(body,collar=body,cuff=body){const c=neutralConfig(body);c.templateVersion='png-front-1';c.colors.collar=collar;c.colors.leftCuff=c.colors.rightCuff=cuff;c.collar=baseCollarPaint(c);c.detailLayers=[];return c;}
export function neck(c,bands){c.colors.collar=bands[0][0];c.collar=baseCollarPaint(c,bands.map(([color,weight])=>({color,weight})));}
export function cuffs(c,bands){
  for(const side of ['left','right'])for(const [i,[depth,color]] of bands.entries()){
    const d=side==='left'?`M12 ${76.6-depth}C24 ${81.2-depth} 36 ${86.5-depth} 44.5 ${85.6-depth}Q48 ${85.7-depth} 49.2 ${77.5-depth}L52 106H5Z`:`M188 ${76.6-depth}C176 ${81.2-depth} 164 ${86.5-depth} 155.5 ${85.6-depth}Q152 ${85.7-depth} 150.8 ${77.5-depth}L148 106H195Z`;
    c.detailLayers.push({...path(d,color,`${side}Sleeve`),...(i===0?{colorRole:`${side}Cuff`}:{})});
    if(i===0)c.colors[`${side}Cuff`]=color;
  }
}
export function shoulderBands(c,color,{width=2,gap=1,end=40,count=2,inset=0}={}){
  const points=Array.from({length:37},(_,i)=>{const t=i/36,u=1-t;return [u**3*75.5+3*u*u*t*44.5+3*u*t*t*32+t**3*25.5,u**3*4.3+3*u*u*t*18+3*u*t*t*14+t**3*end];});
  for(const mirror of [false,true])for(let j=0;j<count;j++){
    const edges=[[],[]];
    points.forEach(([x,y],i)=>{const a=points[Math.max(0,i-1)],b=points[Math.min(36,i+1)],dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy);for(let e=0;e<2;e++){const v=inset+j*(width+gap)+(e?width/2:-width/2),xx=x+dy/length*v;edges[e].push([+(mirror?200-xx:xx).toFixed(3),+(y-dx/length*v).toFixed(3)]);}});
    c.detailLayers.push(poly([...edges[0],...edges[1].reverse()],color));
  }
}
export function sidePiping(c,color,width=.7){
  c.layers.push(path(`M49 77Q53 133 49 197H${49+width}Q${53+width} 133 ${49+width} 77Z`,color,'body'),path(`M151 77Q147 133 151 197H${151-width}Q${147-width} 133 ${151-width} 77Z`,color,'body'));
}
