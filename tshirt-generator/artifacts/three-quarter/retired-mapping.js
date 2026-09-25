/**
 * Measured 2D fabric regions on neutral-v1.png, in 200-unit image coordinates.
 * UVs address the EXISTING front paint, never a kit reference photograph.
 * Piecewise patches preserve independent sleeves, cuffs and sewn round collar.
 */
export const QUARTER_BASE = Object.freeze({
  version: 'three-quarter-1', path: '/assets/base/three-quarter-a3bb58576469-v1.webp',
  width: 1254, height: 1254, x: 0, y: 0, span: 1254,
});

// The generated alpha is retained inside this contour. The contour excludes
// isolated extraction specks outside the garment without tracing its fabric.
export const QUARTER_OUTLINE = 'M85.4 5.2Q88 5.2 93 6.2L113.9 8Q117.4 8.8 120.1 13.4L143.7 27.8Q151.8 31.6 156.1 44.2Q158.8 51 159.8 60.2L161 68.7L164.9 80.4Q165.7 82.6 162.7 83.9Q152.8 88.5 143.9 89Q142.5 109 146.4 132.3L151.5 168L153.8 179.8Q154.8 183.9 153 185.1Q131.5 192.4 105.5 191.2Q79 191.4 53.4 183.9Q52.1 183.3 52.9 181L58.3 153.2L60.2 127.5Q62.8 111 61.4 104.5L57 87.8Q43 88 25.6 80.1Q23.6 79 24.1 77.1L30.7 54.4Q35.4 33.9 44.8 28L77.8 10.2Z';
const LEFT = 'M49.2 24.7C62 23.6 71.1 32.4 71.6 43.2C73.3 53.5 70.4 60.2 64.9 64.9L60.2 80.9L56.9 88.2L15 90L15 18Z';
const RIGHT = 'M125.8 24C136.9 29 148.9 35.5 149.7 44.2C151.5 55.6 146.3 63.7 144.1 76.4L143.4 89.6L177 91L176 14Z';
const LEFT_CUFF = 'M26.3 71.9Q43.6 71.2 60.2 80.7L56.9 87.8Q39.5 87.4 24.1 78.3Z';
const RIGHT_CUFF = 'M143.7 81.4Q154.6 79.6 162.9 75.3L165.2 81.9Q155.4 87.6 143.5 88.8Z';
const NECK = 'M78.6 9.7L85.4 5.2Q99 7.4 115 8.4C117.6 8.8 119.8 9.2 122.5 14C127.1 24.6 125.2 32 116.3 31.5C102.5 32.7 86.7 23 78.6 9.7Z';

const lerp = (a,b,t) => a.map((v,i) => v+(b[i]-v)*t);
const bezier = (a,b,c,d,t) => a.map((v,i) => (1-t)**3*v+3*(1-t)**2*t*b[i]+3*(1-t)*t*t*c[i]+t**3*d[i]);
const quadratic = (a,b,c,t) => a.map((v,i) => (1-t)**2*v+2*(1-t)*t*b[i]+t*t*c[i]);
const triangles = [];
function patch(id, source, target, nx=16, ny=8) {
  for(let j=0;j<ny;j++) for(let i=0;i<nx;i++) {
    const corners=[[i/nx,j/ny],[(i+1)/nx,j/ny],[(i+1)/nx,(j+1)/ny],[i/nx,(j+1)/ny]];
    const src=corners.map(([u,v])=>source(u,v)), dst=corners.map(([u,v])=>target(u,v));
    for(const ix of [[0,1,2],[0,2,3]]) triangles.push({id,src:ix.map(k=>src[k]),dst:ix.map(k=>dst[k])});
  }
}
function rows(id, sections, nx=16) {
  const smooth=(values,j,t)=>values[0].map((_,k)=>{
    const a=values[Math.max(0,j-1)][k],b=values[j][k],c=values[j+1][k],d=values[Math.min(values.length-1,j+2)][k];
    return .5*((2*b)+(-a+c)*t+(2*a-5*b+4*c-d)*t*t+(-a+3*b-3*c+d)*t*t*t);
  });
  for(let j=0;j<sections.length-1;j++) {
    const a=sections[j],b=sections[j+1];
    patch(id,(u,v)=>lerp(smooth(sections.map(r=>r.s[0]),j,v),smooth(sections.map(r=>r.s[1]),j,v),u),
      (u,v)=>{
        const point=lerp(smooth(sections.map(r=>r.d[0]),j,v),smooth(sections.map(r=>r.d[1]),j,v),u);
        point[1]+=(a.bend+(b.bend-a.bend)*v)*Math.sin(Math.PI*u);
        return point;
      },nx,8);
  }
}

/** Four-point perspective transform. All straight artwork stays straight. */
function projective(from,to) {
  const a=[];
  from.forEach(([x,y],i)=>{const [u,v]=to[i];a.push([x,y,1,0,0,0,-u*x,-u*y,u],[0,0,0,x,y,1,-v*x,-v*y,v]);});
  for(let c=0;c<8;c++) {
    let p=c;for(let r=c+1;r<8;r++)if(Math.abs(a[r][c])>Math.abs(a[p][c]))p=r;
    [a[c],a[p]]=[a[p],a[c]];
    const divisor=a[c][c];for(let k=c;k<=8;k++)a[c][k]/=divisor;
    for(let r=0;r<8;r++)if(r!==c){const factor=a[r][c];for(let k=c;k<=8;k++)a[r][k]-=factor*a[c][k];}
  }
  const h=a.map(row=>row[8]);
  return (x,y)=>{const w=h[6]*x+h[7]*y+1;return [(h[0]*x+h[1]*y+h[2])/w,(h[3]*x+h[4]*y+h[5])/w];};
}
const FRONT_BODY=[[35,22],[165,22],[151.5,198],[48.5,198]];
const ANGLED_BODY=[[49.2,24.7],[149.7,39],[154,188],[52.5,187]];
export const projectQuarterBody=projective(FRONT_BODY,ANGLED_BODY);
const bodyUV=projective(ANGLED_BODY,FRONT_BODY);
rows(2,[
  {s:[[23,12],[35,22]],d:[[36,18],[49.2,24.7]],bend:0},
  {s:[[22,38],[40,38]],d:[[33.5,40],[70.1,35.6]],bend:-2},
  {s:[[15.5,60],[44,60]],d:[[28.5,60],[71,55.5]],bend:-1.5},
  {s:[[12,74],[48,77]],d:[[26.3,71.9],[62,76]],bend:-1},
  {s:[[12,78],[45,86]],d:[[24.1,78.3],[56.9,87.8]],bend:1.8},
  {s:[[10,100],[48,100]],d:[[20,100],[60,100]],bend:0},
]);
rows(3,[
  {s:[[165,22],[180,12]],d:[[125.8,24],[153,25]],bend:0},
  {s:[[160,38],[178,38]],d:[[149.7,44.2],[158,44]],bend:0},
  {s:[[156,60],[184.5,60]],d:[[148,65],[161,65]],bend:.3},
  {s:[[152,77],[188,74]],d:[[143.7,81.4],[162.9,75.3]],bend:.5},
  {s:[[155,86],[188,78]],d:[[143.5,88.8],[165.2,81.9]],bend:1},
  {s:[[152,100],[190,100]],d:[[141,101],[172,97]],bend:0},
]);
// A dedicated curved strip makes narrow cuff trims follow the actual sewn hem.
patch(4,(u,v)=>lerp(quadratic([12,74],[31,83],[46.5,83],u),quadratic([12,78],[28,85],[45,86],u),v),
  (u,v)=>lerp(quadratic([26.3,71.9],[43.6,71.2],[60.2,80.7],u),quadratic([24.1,78.3],[39.5,87.4],[56.9,87.8],u),v),24,5);
patch(5,(u,v)=>lerp(quadratic([153.5,83],[169,83],[188,74],u),quadratic([155,86],[172,85],[188,78],u),v),
  (u,v)=>lerp(quadratic([143.7,81.4],[154.6,79.6],[162.9,75.3],u),quadratic([143.5,88.8],[155.4,87.6],[165.2,81.9],u),v),24,5);
// Inner neck: a small clean body-color sample, no front pattern inside the shirt.
patch(6,(u,v)=>[100+u*.01,10+v*.01],(u,v)=>[76+u*52,4+v*34],1,1);
// The back rim uses the same collar color as the front rim.
patch(7,(u,v)=>[100+u*.01,23+v*.01],(u,v)=>lerp(quadratic([85.5,5.2],[96,7.7],[114.9,8.2],u),quadratic([88.1,11.4],[103,14.2],[119.5,17],u),v),24,3);
patch(8,(u,v)=>lerp(bezier([70,5],[68,32],[132,32],[130,5],u),bezier([77,2],[73,24],[127,24],[123,2],u),v),
  (u,v)=>{
    const outer=u<.65?bezier([78.6,9.7],[86.7,23],[102.5,32.7],[116.3,31.5],u/.65):u<.9?bezier([116.3,31.5],[125.2,32],[127.1,24.6],[122.5,14],(u-.65)/.25):bezier([122.5,14],[119.8,9.2],[117.6,8.8],[115,8.4],(u-.9)/.1);
    const inner=u<.65?bezier([85.4,5.2],[84.7,13.4],[98.5,24.5],[110.3,25.4],u/.65):u<.9?bezier([110.3,25.4],[119.4,26.9],[123,23],[119.7,15],(u-.65)/.25):bezier([119.7,15],[118.4,11],[117.5,8.7],[115,8.4],(u-.9)/.1);
    return lerp(outer,inner,v);
  },64,8);

export const QUARTER_TRIANGLES = triangles;
const REGION_PATHS = [null,'M0 0H200V200H0Z',LEFT,RIGHT,LEFT_CUFF,RIGHT_CUFF,NECK,NECK,NECK];
const maps = new Map();

/** Inverse UV map, cached per canvas size. No seam cracks from Canvas triangle clipping. */
function uvMap(size, margin, span) {
  const key=`${size}:${margin}:${span}`;
  if(maps.has(key)) return maps.get(key);
  const map=new Float32Array(size*size*2);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++) {
    const [u,v]=bodyUV((x+.5-margin)*200/span,(y+.5-margin)*200/span);
    map[(y*size+x)*2]=Math.max(0,Math.min(200,u));
    map[(y*size+x)*2+1]=Math.max(0,Math.min(200,v));
  }
  const ctx=new OffscreenCanvas(size,size).getContext('2d',{willReadFrequently:true});
  let previous=0, mask;
  for(const {id,src,dst} of triangles) {
    if(id!==previous) {
      ctx.resetTransform();ctx.clearRect(0,0,size,size);
      ctx.setTransform(span/200,0,0,span/200,margin,margin);
      ctx.fill(new Path2D(REGION_PATHS[id]));
      mask=ctx.getImageData(0,0,size,size).data;previous=id;
    }
    const [[ax,ay],[bx,by],[cx,cy]]=dst.map(([x,y])=>[margin+x*span/200,margin+y*span/200]);
    const denominator=(by-cy)*(ax-cx)+(cx-bx)*(ay-cy);
    if(Math.abs(denominator)<1e-8)continue;
    const minX=Math.max(0,Math.floor(Math.min(ax,bx,cx))),maxX=Math.min(size-1,Math.ceil(Math.max(ax,bx,cx)));
    const minY=Math.max(0,Math.floor(Math.min(ay,by,cy))),maxY=Math.min(size-1,Math.ceil(Math.max(ay,by,cy)));
    for(let y=minY;y<=maxY;y++)for(let x=minX;x<=maxX;x++) {
      const p=y*size+x;if(mask[p*4+3]<128)continue;
      const a=((by-cy)*(x+.5-cx)+(cx-bx)*(y+.5-cy))/denominator;
      const b=((cy-ay)*(x+.5-cx)+(ax-cx)*(y+.5-cy))/denominator,c=1-a-b;
      if(a<-.00001||b<-.00001||c<-.00001)continue;
      map[p*2]=src[0][0]*a+src[1][0]*b+src[2][0]*c;
      map[p*2+1]=src[0][1]*a+src[1][1]*b+src[2][1]*c;
    }
  }
  if(maps.size>=2)maps.delete(maps.keys().next().value);
  maps.set(key,map);return map;
}

/** Reproject unshaded front artwork. nearest preserves exact part-ID colors for editing. */
export function quarterPaint(source, size, {margin=0,span=size,nearest=false}={}) {
  const map=uvMap(size,margin,span),out=new Uint8ClampedArray(size*size*4);
  for(let p=0;p<size*size;p++) {
    let u=map[p*2],v=map[p*2+1];
    if(u<0){out.set([255,255,255,255],p*4);continue;}
    const x=Math.max(0,Math.min(size-1,u*size/200-.5)),y=Math.max(0,Math.min(size-1,v*size/200-.5));
    if(nearest){const i=(Math.round(y)*size+Math.round(x))*4;out.set(source.subarray(i,i+4),p*4);continue;}
    const x0=Math.floor(x),y0=Math.floor(y),x1=Math.min(size-1,x0+1),y1=Math.min(size-1,y0+1),fx=x-x0,fy=y-y0;
    for(let k=0;k<3;k++)out[p*4+k]=Math.round((source[(y0*size+x0)*4+k]*(1-fx)+source[(y0*size+x1)*4+k]*fx)*(1-fy)+(source[(y1*size+x0)*4+k]*(1-fx)+source[(y1*size+x1)*4+k]*fx)*fy);
    out[p*4+3]=255;
  }
  return out;
}
