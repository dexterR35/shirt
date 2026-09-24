import {refinementBatch,base,neck,cuffs,rect,path,poly,panels,line} from './tier2-refinement-helpers.mjs';
const {scope,add,ink,save}=await refinementBatch('tier2-refine-england-2026-09-24',['england']);
for(const r of scope){let c=structuredClone(r.config);c.layers=[];
 if(r.name==='Charlton Athletic'){
  // Faint curving tonal field, visible in the clean lower front; no granular fabric trace.
  for(const [x,y,flip]of [[64,40,1],[126,79,-1],[78,138,1],[128,186,-1]])for(let i=0;i<5;i++){
   const dx=i*1.3;const pts=[];for(let t=0;t<=1;t+=.025){const a=t*Math.PI*2.1,rad=4+t*18;pts.push([x+flip*(Math.cos(a)*rad+dx),y+Math.sin(a)*rad*1.25]);}c.layers.push(line(pts,'#DDD8C8',.45,'body',.28));
  }
  add(r,c,'Warm ivory with extremely faint curving tonal lines, claret round-neck/cuff color bands and thin red edging. Granular over-contrasted tracing replaced by low-contrast smooth contours observed on the lower front; fabric comes only from PNG.');
 }
 if(r.name==='Lincoln City'){
  await ink(c,r,{box:[285,190,510,800],width:440,mode:'dark',threshold:6,blur:12,smooth:1.5,repairs:[{target:[380,455,270,270],source:[410,730,270,230]},{target:[350,287,83,88],source:[455,270,83,88]},{target:[625,269,79,110],source:[690,740,79,110]}]},{x:49,y:10,width:102,height:190,color:'#111517'});
  add(r,c,'Charcoal with near-black diagonal and horizontal brush contours mapped from the full front; yellow neck edge and double cuffs. Logo-obscured central print reconstructed from adjacent clean brush ink. Local contrast segmentation removes broad photographic shading.');
 }
 if(r.name==='Norwich City'){
  neck(c,[['#EED017',3],['#298B39',.45]]);
  await ink(c,r,{box:[310,700,610,630],width:500,mode:'dark',threshold:3,blur:20,smooth:3},{x:49,y:12,width:102,height:188,color:'#D3BC19',opacity:.48});
  panels(c,[[76,3],[74,10],[48,24],[47,55],[40,37],[36,25]],'#29873C');
  for(const [x,clip]of [[1,'leftSleeve'],[151,'rightSleeve']])await ink(c,r,{box:[108,292,178,335],width:200,mode:'green',threshold:12,blur:9},{x,y:20,width:48,height:66,color:'#26863B',clip});
  add(r,c,'Yellow shirt with faint tonal marble contours adapted from the unobstructed lower front; solid green raglan strips and independently isolated green marble sleeve ink. Yellow neckline with fine green edge and green cuffs. Unbranded lower print extended vertically over the sponsor-obscured torso; exact hidden marble placement cannot be recovered.');
 }
 if(r.name==='Southampton'){
  c=base('#65ABD4','#0868AB');
  const pieces=[{box:[340,756,620,600],x:49,y:92,w:102,h:108},{box:[300,225,640,190],x:49,y:7,w:102,h:38},{box:[310,740,630,330],x:49,y:43,w:102,h:51}];
  for(const p of pieces)for(const [mode,threshold,min,max,color]of [['inverse',137,35,160,'#1470B4'],['value',166,135,240,'#84B7D8'],['red',-8,95,230,'#BCACD5']])await ink(c,r,{box:p.box,width:500,mode,threshold,min,max,blur:8},{x:p.x,y:p.y,width:p.w,height:p.h,color});
  for(const [box,x,clip]of [[[120,275,150,310],1,'leftSleeve'],[[995,280,155,310],151,'rightSleeve']])for(const [mode,threshold,color]of [['inverse',137,'#1875B4'],['red',-8,'#B5ACD1']])await ink(c,r,{box,width:190,mode,threshold,min:50,max:230,blur:8},{x,y:20,width:48,height:64,color,clip});
  panels(c,[[75,3],[75,7],[40,23],[34,31],[34,23]],'#81B9D9');cuffs(c,[[3,'#0D69AE']]);
  add(r,c,'Blue/pink flowing marble rebuilt with three discrete ink separations and separately measured sleeve crops. Branding-free upper/lower source print covers the torso; the middle sponsor region uses adjacent clean contours at matching scale. Fine cyan transitions, pale shoulder inserts and blue cuffs/neck retained; continuous photograph shading excluded.');
 }
 if(r.name==='West Ham United'&&r.variant==='home'){
  await ink(c,r,{box:[360,330,780,1020],width:480,mode:'dark',threshold:4.5,blur:12,max:105,smooth:2,repairs:[{target:[850,405,175,155],source:[720,960,175,155]},{target:[520,450,145,100],source:[400,900,145,100]},{target:[525,575,480,220],source:[470,950,480,220]},{target:[1030,1260,90,80],source:[930,1080,90,80]},{target:[390,1260,100,90],source:[500,1040,100,90]}]},{x:49,y:14,width:102,height:186,color:'#431526',opacity:.95});
  c.detailLayers=[];cuffs(c,[[3.5,'#4F1732']]);
  for(const side of ['left','right']){let d='';for(let x=7;x<52;x+=1.7)for(let row=0;row<3;row++){const yy=75+(x-12)*.24+row*1.1,xx=side==='left'?x:200-x;if((Math.round(x/1.7)+row)%2===0)d+=`M${xx.toFixed(2)} ${yy.toFixed(2)}h1.2v1.05h-1.2Z`;}c.detailLayers.push(path(d,'#51A9D0',`${side}Sleeve`));}
  neck(c,[['#581A30',3],['#57B3D9',.55]]);let d='';for(let i=0;i<44;i++){const a=Math.PI*(.12+i/43*.76);for(let j=0;j<3;j++){const x=100+Math.cos(a)*(27+j*1.15),y=5+Math.sin(a)*(14+j*1.1);if((i+j)%2===0)d+=`M${x.toFixed(2)} ${y.toFixed(2)}h.9v.7h-.9Z`;}}c.collar.layers.push({...path(d,'#5DB9DF'),id:'sky-checker-collar'});
  add(r,c,'Claret angular tonal print mapped from the full front with observed logos excluded, solid sky-blue sleeves and dark/sky checker trim. Shoulder/body print placement no longer repeats a single crop; small sleeve checks follow each sloping cuff and collar checks stay inside the existing neckline.');
 }
 if(r.name==='West Ham United'&&r.variant==='away'){
  // Large, very pale angular outlines and curls are the printed field; fine dotted weave is excluded.
  for(const [x,y,s]of [[64,21,1],[126,38,-1],[62,95,1],[126,148,-1],[78,184,1]]){
   const pts=[[x,y],[x+s*24,y+19],[x+s*3,y+41],[x-s*14,y+27],[x,y]];c.layers.push(line(pts,'#D9DCE2',.6,'body',.36));
   for(let j=0;j<3;j++){const q=[];for(let t=0;t<=1;t+=.03){const a=t*6.1;q.push([x+s*(6+Math.cos(a)*(5+t*9+j)),y+20+Math.sin(a)*(6+t*9+j)]);}c.layers.push(line(q,'#DADDE3',.4,'body',.32));}
  }
  add(r,c,'White with very faint large angular outline and curving motifs observed in the independent Away front, replacing grainy fabric tracing. Fine claret/blue-grey neckline and cuff edges retained; dotted material weave stays with the original fabric.');
 }
 if(r.name==='Wrexham'){
  await ink(c,r,{box:[220,230,580,1190],width:550,mode:'red',threshold:23,blur:9,exclude:[[225,295,80,100],[535,265,150,155]]},{x:49,y:9,width:102,height:189,color:'#A33242',opacity:.9});
  for(const [box,x,clip]of [[[113,400,101,250],5,'leftSleeve'],[[816,400,160,300],151,'rightSleeve']])await ink(c,r,{box,width:180,mode:'red',threshold:19,blur:9},{x,y:27,width:43,height:56,color:'#8C303C',clip,opacity:.8});
  add(r,c,'Charcoal with fine red horizontal branching veins mapped from the front at full height, with crest/manufacturer exclusions and independently measured sleeve veins. Removed oversized repeating tile; dark collar/cuffs and original fabric retained.');
 }
}
await save();
