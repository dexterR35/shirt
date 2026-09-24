import sharp from 'sharp';
import {path} from '../png-paint-helpers.mjs';

const round=x=>+x.toFixed(3);
/** Trace a binary ink mask into closed contour polygons, retaining hole winding.
 * Fills are constant chosen colors, with no raster image embedded. Segmentation
 * can still pick up wrinkles or branding; every crop and render needs review.
 */
export function contours(mask,w,h){
  const edges=new Map(),key=(x,y)=>y*(w+1)+x;
  const edge=(a,b)=>{const list=edges.get(a)||[];list.push(b);edges.set(a,list);};
  const on=(x,y)=>x>=0&&x<w&&y>=0&&y<h&&mask[y*w+x];
  for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(on(x,y)){
    if(!on(x,y-1))edge(key(x,y),key(x+1,y));
    if(!on(x+1,y))edge(key(x+1,y),key(x+1,y+1));
    if(!on(x,y+1))edge(key(x+1,y+1),key(x,y+1));
    if(!on(x-1,y))edge(key(x,y+1),key(x,y));
  }
  const result=[];
  while(edges.size){
    const start=edges.keys().next().value;let v=start,points=[],limit=4*w*h;
    do{points.push([v%(w+1),Math.floor(v/(w+1))]);const next=edges.get(v);if(!next?.length)throw Error('Open ink contour');const q=next.pop();if(!next.length)edges.delete(v);v=q;}while(v!==start&&--limit);
    if(!limit)throw Error('Ink contour did not close');
    let area=0;for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length];area+=a[0]*b[1]-b[0]*a[1];}
    if(Math.abs(area)<5)continue;
    points=points.filter((b,i,p)=>{const a=p[(i+p.length-1)%p.length],c=p[(i+1)%p.length];return (b[0]-a[0])*(c[1]-b[1])!==(b[1]-a[1])*(c[0]-b[0]);});
    if(points.length>2)result.push(points);
  }
  return result;
}

/** Isolate observed printed ink in an explicitly reviewed, branding-free crop.
 * dark/light modes remove slow illumination with a local average. Color modes
 * use a channel contrast to separate ink from cloth; fills are chosen separately.
 */
export async function tracePatch({reference,box,width=240,mode='dark',threshold=8,blur=10,min=0,max=255,close=0,exclude=[]}){
  const pipeline=sharp(reference).extract({left:box[0],top:box[1],width:box[2],height:box[3]}).resize({width}).removeAlpha().toColourspace('srgb');
  const {data,info}=await pipeline.clone().blur(.5).raw().toBuffer({resolveWithObject:true});
  const local=await pipeline.clone().blur(blur).raw().toBuffer();
  let mask=new Uint8Array(info.width*info.height);
  for(let i=0;i<mask.length;i++){
    const r=data[i*3],g=data[i*3+1],b=data[i*3+2],lum=(r+g+b)/3,mean=(local[i*3]+local[i*3+1]+local[i*3+2])/3;
    const value=mode==='dark'?mean-lum:mode==='light'?lum-mean:mode==='blue'?b-r:mode==='green'?g-r:mode==='red'?r-g:mode==='yellow'?(r+g)/2-b:mode==='value'?lum:mode==='inverse'?255-lum:0;
    mask[i]=value>threshold&&lum>=min&&lum<=max?1:0;
  }
  // Optional small binary closing reconnects broken printed strokes without
  // importing the photograph's continuous lighting or texture values.
  if(close){
    if(!Number.isInteger(close)||close<1||close>3)throw Error('Invalid ink closing radius');
    for(const dilate of [true,false]){const next=new Uint8Array(mask.length);
      for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++){
        let value=dilate?0:1;
        for(let yy=Math.max(0,y-close);yy<=Math.min(info.height-1,y+close);yy++)for(let xx=Math.max(0,x-close);xx<=Math.min(info.width-1,x+close);xx++)value=dilate?value|mask[yy*info.width+xx]:value&mask[yy*info.width+xx];
        next[y*info.width+x]=value;
      }mask=next;
    }
  }
  // Explicit source-pixel exclusions remove observed branding before tracing.
  // Apply after closing so morphological operations cannot reconnect a logo.
  for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++){
    const sx=box[0]+x/info.width*box[2],sy=box[1]+y/info.height*box[3];
    if(exclude.some(([xx,yy,w,h])=>sx>=xx&&sx<xx+w&&sy>=yy&&sy<yy+h))mask[y*info.width+x]=0;
  }
  // Independent narrow bands keep every outer contour and its holes in the
  // same SVG path, even when a large print needs several validated layers.
  const groups=[];
  for(let y=0;y<info.height;y+=8){
    const h=Math.min(8,info.height-y);
    groups.push(contours(mask.slice(y*info.width,(y+h)*info.width),info.width,h).map(p=>p.map(([x,yy])=>[x,yy+y])));
  }
  return {width:info.width,height:info.height,groups,ink_pixels:mask.reduce((a,b)=>a+b,0)};
}

export function placeTrace(trace,{x,y,width,height=width*trace.height/trace.width,color,clip='body',opacity=1}){
  const layers=[];let d='';
  for(const group of trace.groups){
    const s=group.map(contour=>`M${contour.map(([xx,yy])=>`${round(x+xx/trace.width*width)} ${round(y+yy/trace.height*height)}`).join('L')}Z`).join('');
    if(s.length>19000)throw Error('Trace band too large; reduce sampling size');
    if(d.length+s.length>19000){layers.push(path(d,color,clip,opacity));d='';}d+=s;
  }if(d)layers.push(path(d,color,clip,opacity));return layers;
}

export function tileTrace(c,trace,{width,height=width*trace.height/trace.width,color,clip='all',opacity=1,x=0,y=0,reflect=false}){
  for(let yy=y,row=0;yy<200;yy+=height,row++)for(let xx=x,col=0;xx<200;xx+=width,col++){
    const tile=reflect?{...trace,groups:trace.groups.map(g=>g.map(p=>p.map(([a,b])=>[col%2?trace.width-a:a,row%2?trace.height-b:b])))}:trace;
    c.layers.push(...placeTrace(tile,{x:xx,y:yy,width,height,color,clip,opacity}));
  }
}
