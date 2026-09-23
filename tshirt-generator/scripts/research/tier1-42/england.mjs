import {add,previous,base,neck,cuffs,shoulderBands,path,poly,line,mirror,hatch,gradient} from './shared.mjs';
import {ink,tileTrace,placeTrace} from './ink.mjs';

for(const [name,variant,box,mode,threshold,width,color,notes] of [
  ['Arsenal','away',[530,850,580,570],'blue',40,88,'#315276','Connected navy/blue chevrons and ribbed triangular fields replace disconnected generic triangles. Gold shoulder tapes and red/gold trims remain on the original PNG seams.'],
  ['Aston Villa','away',[375,760,580,600],'light',7,88,'#59595E','Charcoal field with fine hatched diamonds and broad zigzag rows, traced from the independently saved Away print. Gold/claret/pale-blue trim retained.'],
  ['Bournemouth','away',[338,942,570,360],'inverse',85,88,'#6A589B','Lavender geometric print with continuous diagonal hatch, angular gaps and solid purple cores; contours follow a clean lower-front reference fragment.'],
  ['Fulham','away',[251,605,385,290],'red',55,92,'#DB293D','Irregular red/black checkers traced from the lower front, with frayed edges and staggered row joins. White shoulder tape, round base neckline and cuffs retained.'],
]){
  const c=previous(name,variant);c.layers=[];
  if(name==='Fulham')for(const k of ['body','leftSleeve','rightSleeve'])c.colors[k]='#191C21';
  if(name==='Arsenal'){
    for(let y=-30;y<210;y+=30){const upper=[],lower=[];for(let i=-1;i<16;i++){upper.push([i*16,y+(i%2?22:0)]);lower.push([i*16,y+(i%2?22:0)+16]);}const p=[...upper,...lower.reverse()];c.layers.push(poly(p,gradient('#213C5B','#31567A',0,y,0,y+32)));const h=hatch(p,'#0E223B',.61,.24,0);let d='';for(const piece of h.d.split('Z').filter(Boolean)){if(d.length+piece.length>18500){c.layers.push(path(d,'#0E223B'));d='';}d+=piece+'Z';}if(d)c.layers.push(path(d,'#0E223B'));}
  }else if(name==='Aston Villa'){
    for(let y=-12;y<200;y+=39){for(let x=5;x<200;x+=13)c.layers.push(hatch([[x,y],[x+2.5,y+12],[x,y+25],[x-2.5,y+12]],'#656266',.63,.19,-.9,'all',.6));const top=[],bottom=[];for(let x=0;x<=200;x+=1){const yy=y+30+3*Math.sin(x*.5);top.push([x,yy]);bottom.push([x,yy+4]);}c.layers.push(hatch([...top,...bottom.reverse()],'#666268',.6,.21,-.9,'all',.55));}
  }else if(name==='Bournemouth'){
    const grid=Array.from({length:9},(_,r)=>Array.from({length:8},(_,j)=>[-30+j*35+(r%2)*13+([0,3,-4,5,-2,1][(r+j)%6]),-24+r*31+[0,5,-4,2,-6,3,0,4][(j+r)%8]]));
    for(let r=0;r<8;r++)for(let j=0;j<7;j++){
      const a=grid[r][j],b=grid[r][j+1],d=grid[r+1][j],e=grid[r+1][j+1];
      for(const [i,triangle]of ((r+j)%2?[[a,b,d],[b,e,d]]:[[a,b,e],[a,e,d]]).entries()){
        const center=triangle.reduce((v,p)=>[v[0]+p[0]/3,v[1]+p[1]/3],[0,0]),inset=triangle.map(([x,y])=>[center[0]+(x-center[0])*.94,center[1]+(y-center[1])*.94]);
        c.layers.push(hatch(inset,'#7160A7',1,.45,(i+j)%2?.75:-.8));
        c.layers.push(poly(triangle.map(([x,y])=>[center[0]+(x-center[0])*.53,center[1]+(y-center[1])*.53]),'#6B569D'));
      }
    }
  }else{
    const t=await ink(name,variant,{box,mode,threshold,width:250});tileTrace(c,t,{width,color,x:-6,y:-10});
  }
  add(name,variant,c,notes);
}
{
  const c=previous('Chelsea','away');c.detailLayers=[];
  cuffs(c,[[3.7,'#DCC735'],[.5,'#161B1B']]);neck(c,[['#171A19',.4],['#DCC735',2.6],['#171A19',.5]]);
  const cuff=(t,depth)=>{const u=1-t;return[u**3*12+3*u*u*t*24+3*u*t*t*36+t**3*44.5,u**3*76.6+3*u*u*t*81.2+3*u*t*t*86.5+t**3*85.6-depth];};
  for(const reflect of [p=>p,mirror])for(let i=0;i<6;i++)for(const depth of [1.2,2.45]){
    const t=i/6,pts=[[t,depth],[t+.075,depth],[t+.105,depth+.65],[t+.155,depth+.65]].map(([t,d])=>cuff(t,d));
    c.detailLayers.push(line(reflect(pts),'#171A19',.28,reflect===mirror?'rightSleeve':'leftSleeve'));
  }
  const ring=(t,z)=>{const u=1-t;return[u**3*(130-7*z)+3*u*u*t*(132-5*z)+3*u*t*t*(68+5*z)+t**3*(70+7*z),u**3*(5-3*z)+3*u*u*t*(32-8*z)+3*u*t*t*(32-8*z)+t**3*(5-3*z)];};
  let ornament='';for(let i=0;i<18;i++)for(const z of [.35,.63])ornament+=line([[i/18,z],[(i+.4)/18,z],[(i+.6)/18,z+.14],[(i+.95)/18,z+.14]].map(([t,z])=>ring(t,z)),'#171A19',.2,'all').d;
  c.collar.layers.splice(-1,0,path(ornament,'#171A19'));
  add('Chelsea','away',c,'Black pinstriped field and yellow piping retained. Parallel stepped black ornament now follows the actual PNG cuff Bézier and collar ring, so the detail stays inside the existing yellow trim.');
}
{
  const c=previous('Coventry City','home');c.layers=c.layers.filter(l=>l.type==='rect');
  const t=await ink('Coventry City','home',{box:[635,735,91,640],mode:'dark',threshold:9,width:75});
  for(const x of [16,42,69,96,123,150,177])for(const y of [-4,94])c.layers.push(...placeTrace(t,{x,y,width:14,height:98,color:'#196B9D',clip:'all',opacity:.72}));
  add('Coventry City','home',c,'White/sky-blue columns with navy separator lines and dark blue photographic crowd texture traced from the central source column; this replaces the earlier invented floral description. Original navy ring retained.');
}
{
  const c=previous('Crystal Palace','away');c.layers=c.layers.filter(l=>l.type==='polygon'||l.d?.startsWith('M32')||l.d?.startsWith('M168'));
  const t=await ink('Crystal Palace','away',{box:[176,505,287,340],mode:'light',threshold:5,width:220});
  c.layers.unshift(...placeTrace(t,{x:47,y:93,width:106,height:101,color:'#4C555D',opacity:.7}));
  const upper=await ink('Crystal Palace','away',{box:[202,565,145,168],mode:'light',threshold:5,width:130});
  const temp={layers:[]};tileTrace(temp,upper,{x:0,y:-20,width:31,height:36,color:'#404A53',opacity:.6});
  // Upper feather fragments remain a separate study: full illustrated positioning
  // cannot be recovered from this three-quarter photograph alone.
  c.layers.unshift(...temp.layers.filter(l=>!l.d.includes('NaN')));
  add('Crystal Palace','away',c,'Actual fine feather contours replace isolated hatch lozenges; lower eagle-plumage fragment mapped separately from the upper field. Red/blue shoulder, cuff and side inserts retained.','The upper repeats and lower illustration do not yet form one continuous source-matched feather field; needs a clearer straight-front illustration.');
}
{
  const c=previous('Nottingham Forest','home');c.layers=[];
  const t=await ink('Nottingham Forest','home',{box:[216,425,290,280],mode:'light',threshold:5,width:200});
  tileTrace(c,t,{width:97,height:94,color:'#E33A3D',opacity:.45,x:3,y:8});
  add('Nottingham Forest','home',c,'Red tonal field now uses contours from the actual lower-front source print, with white shoulder tapes and the original round ring.','The blurred archive photograph does not separate the upper camouflage boundaries from fabric lighting reliably; the repeated lower fragment remains a draft.');
}
