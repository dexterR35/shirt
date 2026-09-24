import fs from 'node:fs/promises';
import {path,poly,rect} from './png-paint-helpers.mjs';
import {saveProfiles} from './fka-save-profiles.mjs';
import {tracePatch,placeTrace} from './tier1-42/trace.mjs';
import crypto from 'node:crypto';

// Fixed predecessor paths: rerunning this batch never samples its own output.
const read=async p=>JSON.parse(await fs.readFile(p,'utf8'));
const batch='tier1-refinement-2026-09-24',date='2026-09-24';
const predecessors=await read('artifacts/footballkitarchive/tier1-42-2026-09-23/manifest.json');
const profiles=[],scope=[],traces=[];
const n=v=>+v.toFixed(3);
const lerp=(a,b,t)=>a+(b-a)*t;
function color(stops,t){
  const i=Math.max(0,stops.findIndex(s=>s[0]>=t)-1),a=stops[i],b=stops[i+1]||a;
  const f=Math.max(0,Math.min(1,(t-a[0])/(b[0]-a[0]||1)));
  return '#'+[1,3,5].map(k=>Math.round(lerp(parseInt(a[1].slice(k,k+2),16),parseInt(b[1].slice(k,k+2),16),f)).toString(16).padStart(2,'0')).join('');
}
function line(points,fill,width=.3,clip='body',opacity=1){
  let d='';for(let i=1;i<points.length;i++){
    const [x,y]=points[i-1],[xx,yy]=points[i],len=Math.hypot(xx-x,yy-y);if(!len)continue;
    const dx=(yy-y)/len*width/2,dy=(x-xx)/len*width/2;
    d+=`M${n(x+dx)} ${n(y+dy)}L${n(xx+dx)} ${n(yy+dy)}L${n(xx-dx)} ${n(yy-dy)}L${n(x-dx)} ${n(y-dy)}Z`;
  }return path(d,fill,clip,opacity);
}
async function prior(name,variant){
  const row=predecessors.find(p=>p.name===name&&p.variant===variant);
  if(row?.status!=='draft')throw Error('Only unreviewed predecessors may be refined');
  const k=await read(row.kit);scope.push({name,variant,previous_kit:row.kit,previous_layout:row.layout,reference:row.reference,source_url:k.references[0].page_url});
  return structuredClone(k.config);
}
function add(name,variant,c,observations,remaining){
  profiles.push({name,variant,country:['Union Berlin','Bayer Leverkusen'].includes(name)?'Germany':'France',make:()=>structuredClone(c),observations,remaining});
}

// Lorient: the source has two triangular wedges meeting at a waist. The old
// four-point study crossed its edges; six ordered vertices retain the notch.
{
  const c=await prior('Lorient','home');c.layers=[];
  for(let row=-1;row<7;row++)for(let col=-1;col<4;col++){
    const x=43+col*38+(row%2)*19,y=17+row*29;
    const points=[[x,y],[x+19,y+13],[x+38,y],[x+38,y+25],[x+19,y+13],[x,y+25]];
    const fill={type:'linearGradient',x1:x,y1:y+12,x2:x+38,y2:y+12,stops:[{offset:0,color:'#F2AA3D'},{offset:.48,color:'#F35F24'},{offset:.52,color:'#F35F24'},{offset:1,color:'#F2AA3D'}]};
    c.layers.push(poly(points,fill,'body',.9));
  }
  add('Lorient','home',c,'Orange body with staggered pairs of gold triangular wedges, inward fades and the source central waist/notches. The incorrect crossing quadrilateral is removed. Sleeves stay plain orange; black and white cuff edging and only the existing round PNG collar are retained.','Compare the waist, spacing and gold fade against the independent 26-27 Home source.');
}

// Union: restore the connected window mullions and trusses seen below the
// sponsor. Repetition follows the observed vertically repeated lens-shaped rows.
{
  const c=await prior('Union Berlin','home');c.layers=[];
  const draw=(cx,y,w,h,clip,opacity)=>{
    const ink='#F65B48',top=x=>y-h*Math.sqrt(Math.max(0,1-((x-cx)/(w/2))**2)),bottom=x=>y+h*Math.sqrt(Math.max(0,1-((x-cx)/(w/2))**2));
    const a=[],b=[];
    for(let i=0;i<=80;i++){const x=cx-w/2+w*i/80;a.push([x,top(x)]);b.push([x,bottom(x)]);}
    c.layers.push(line(a,ink,.6,clip,opacity),line(b,ink,.6,clip,opacity));
    for(let i=1;i<22;i++){
      const x=cx-w/2+w*i/22;c.layers.push(line([[x,top(x)],[x,bottom(x)]],ink,.8,clip,opacity));
    }
    for(const direction of [-1,1]){
      const edge=direction===-1?top:bottom,outer=[],zig=[];
      for(let i=0;i<=12;i++){
        const x=cx-w/2+w*i/12,yy=edge(x)+direction*6;
        outer.push([x,yy]);zig.push([x,yy],[x+w/24,edge(x+w/24)]);
      }
      c.layers.push(line(outer,ink,.55,clip,opacity),line(zig,ink,.55,clip,opacity));
    }
    // Pointed openings between the curved rows; no lettering or chest marks.
    for(const sign of [-1,1])for(let i=0;i<4;i++){
      const x=cx+sign*(11+i*8),yy=top(x)-6;
      c.layers.push(line([[x-3,yy],[x-3,yy-7],[x,yy-11],[x+3,yy-7],[x+3,yy]],ink,.65,clip,opacity));
    }
  };
  for(const y of [16,55,94,133,172,211])draw(100,y,82,10,'body',.34);
  for(const side of ['leftSleeve','rightSleeve'])for(const y of [33,61,89])draw(side==='leftSleeve'?29:171,y,48,7,side,.3);
  for(const x of [49,54,146,151])c.layers.push(line([[x,19],[x,200]],'#F65B48',.5,'body',.2));
  add('Union Berlin','home',c,'Continuous tonal lens-shaped architectural rows with closely spaced vertical mullions, pointed openings and triangular trusses replace broken threshold contours. Tonal sleeve continuation, pale shoulder tape, cuff edges and the existing red round collar are retained.','Compare the architectural row spacing and connected trusses with the independent Home photograph.');
}

// Catmull-Rom sampled paths remain validated vector polygons. Nested offset
// contours create a diffuse curved print without raster assets or SVG filters.
function smooth(points){
  const out=[];for(let i=0;i<points.length-1;i++){
    const p0=points[Math.max(0,i-1)],p1=points[i],p2=points[i+1],p3=points[Math.min(points.length-1,i+2)];
    for(let j=0;j<18;j++){const t=j/18;out.push([0,1].map(k=>.5*((2*p1[k])+(-p0[k]+p2[k])*t+(2*p0[k]-5*p1[k]+4*p2[k]-p3[k])*t*t+(-p0[k]+3*p1[k]-3*p2[k]+p3[k])*t*t*t)));}
  }return [...out,points.at(-1)];
}
function offset(points,d){return points.map(([x,y],i)=>{
  const a=points[Math.max(0,i-1)],b=points[Math.min(points.length-1,i+1)],len=Math.hypot(b[0]-a[0],b[1]-a[1]);
  return [n(x+(b[1]-a[1])/len*d),n(y-(b[0]-a[0])/len*d)];
});}
{
  const c=await prior('Toulouse','away');c.layers=[];
  for(const k of ['body','leftSleeve','rightSleeve'])c.colors[k]='#F4ECF1';
  for(let x=50;x<=153;x+=20.4)c.layers.push(rect(x,17,.19,185,'#CD81A3','body',.68));
  const fields=[
    {p:[[41,113],[57,125],[78,124],[91,133],[99,149],[101,157],[112,172],[128,192],[137,208]],close:[[137,230],[0,230],[0,110]],sign:1},
    {p:[[159,83],[145,98],[137,117],[135,141],[126,157],[127,164],[139,180],[153,202]],close:[[210,220],[210,70]],sign:-1}
  ];
  const stops=[[0,'#F4ECF1'],[.14,'#F2D3E3'],[.29,'#F395BE'],[.43,'#F4478C'],[.51,'#EE3B69'],[.6,'#D84C99'],[.74,'#9B4C95'],[1,'#4C286C']];
  for(const field of fields){const curve=smooth(field.p);
    for(let i=0;i<=80;i++){
      const t=i/80,d=(8-17*t)*field.sign;
      c.layers.push(poly([...offset(curve,d),...field.close],color(stops,t),'body'));
    }
  }
  // Secondary magenta folds printed inside the purple mass, distinct from the
  // original PNG's physical cloth shading.
  for(const points of [[[40,139],[58,154],[78,160],[103,181],[128,207]],[[40,165],[58,179],[75,182],[91,190],[104,205]]]){
    const p=smooth(points);
    for(let i=0;i<24;i++)c.layers.push(line(p,'#C653A0',9-i*.34,'body',.028));
  }
  add('Toulouse','away',c,'Pale pink body with fine pink pinstripes and asymmetric purple lower waves. Dense vector contour bands now follow curved pink/red/magenta transitions, replacing straight gradient boundaries; two softer interior magenta waves follow the source. Sleeves and the original round collar stay pale.','Compare the diffuse wave contours and interior highlights with the independent Away source.');
}

{
  const c=await prior('Bayer Leverkusen','away');c.layers=[];
  for(const k of ['body','leftSleeve','rightSleeve'])c.colors[k]='#BED5DE';
  const reference=scope.at(-1).reference,box=[747,145,77,120];
  // This narrow sleeve patch was inspected at 5x: no badge, sponsor, garment
  // boundary or collar. Four nested luminance masks retain actual cell fills.
  for(const [threshold,fill] of [[205,'#7EABBF'],[165,'#4D7A9D'],[125,'#315474'],[83,'#1D2D50']]){
    const t=await tracePatch({reference,box,width:86,mode:'inverse',threshold:255-threshold});
    traces.push({team:'Bayer Leverkusen',variant:'away',reference,source_sha256:crypto.createHash('sha256').update(await fs.readFile(reference)).digest('hex'),box,width:86,mode:'inverse',threshold:255-threshold,fill,ink_pixels:t.ink_pixels,method:'Nested source luminance contours with estimated constant blue fills, reflected at tile boundaries. No raster embedded.'});
    for(let row=0;row<2;row++)for(let col=0;col<6;col++){
      const reflected={...t,groups:t.groups.map(g=>g.map(p=>p.map(([x,y])=>[col%2?t.width-x:x,row%2?t.height-y:y])))};
      c.layers.push(...placeTrace(reflected,{x:col*35,y:row*55,width:35,height:55,color:fill,clip:'all'}));
    }
  }
  c.layers.push(path('M49 33Q100 20 151 33L151 200H49Z','#CDDFE1','body'));
  add('Bayer Leverkusen','away',c,'Ice-blue body with four source-derived blue mineral tones on the shoulder and sleeve fields. Nested filled contours restore the pale cells, middle-blue pools and dark veins missing from the earlier outline-only trace. The inspected clean sleeve sample excludes all branding; slate round collar and patterned cuffs are retained.','The source-derived cells repeat across shoulders and sleeves; review the scale, seam continuity and overall distribution before activation.');
}

await fs.mkdir(`artifacts/footballkitarchive/${batch}`,{recursive:true});
await fs.writeFile(`data/research/${batch}-scope.json`,JSON.stringify(scope,null,2)+'\n');
await fs.writeFile(`data/research/${batch}-traces.json`,JSON.stringify({batch,date,traces},null,2)+'\n');
const decisions=process.argv.includes('--reviewed')?await read(`data/research/${batch}-review.json`):[];
if(process.argv.includes('--reviewed')&&(decisions.length!==profiles.length||new Set(decisions.map(d=>d.key)).size!==profiles.length))throw Error('Every profile needs an independent review');
for(const d of decisions){
  const p=profiles.find(p=>`${p.name}:${p.variant}`===d.key);
  if(!p||!['ready','draft'].includes(d.status)||!d.notes||!d.comparison_path||d.status==='draft'&&!d.remaining)throw Error('Invalid review decision');
  await fs.access(d.comparison_path);p.remaining=d.remaining;
}
await saveProfiles(profiles,batch,{date,reviewed:decisions.filter(d=>d.status==='ready').map(d=>d.key)});
