import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import {validateConfig} from '../src/lib/shirt-renderer.js';

// Source-reviewed trim adaptations. New files are immutable PNG layout
// revisions, separate from the approved historical kit artwork.
const read=async p=>JSON.parse(await fs.readFile(p,'utf8'));
const latest=new Map();
for(const file of await fs.readdir('data/kits'))if(file.endsWith('.json')){
  const r=await read('data/kits/'+file),key=`${r.team_id}-${r.variant}`;
  if(!latest.has(key)||latest.get(key).revision<r.revision)latest.set(key,r);
}
const path=(id,d,fill,clip='all',colorRole)=>({id,type:'path',d,fill,clip,...(colorRole?{colorRole}:{})});
const n=x=>+x.toFixed(3);
function band(id,points,fill,width,offset=0,side='left') {
  const edges=[[],[]];
  for(let i=0;i<points.length;i++){
    const prev=points[Math.max(0,i-1)],next=points[Math.min(points.length-1,i+1)];
    const dx=next[0]-prev[0],dy=next[1]-prev[1],length=Math.hypot(dx,dy);
    for(let e=0;e<2;e++){
      const amount=offset+(e?width/2:-width/2);
      const x=points[i][0]+dy/length*amount,y=points[i][1]-dx/length*amount;
      edges[e].push([n(side==='right'?200-x:x),n(y)]);
    }
  }
  const polygon=[...edges[0],...edges[1].reverse()];
  return {id,type:'polygon',clip:'all',fill,points:polygon};
}
function shoulderCurve(endY=41) {
  const start=[75.5,4.3],control1=[44.5,18],control2=[32,14],end=[25.5,endY],points=[];
  for(let i=0;i<=36;i++){
    const t=i/36,u=1-t;
    points.push([u*u*u*start[0]+3*u*u*t*control1[0]+3*u*t*t*control2[0]+t*t*t*end[0],u*u*u*start[1]+3*u*u*t*control1[1]+3*u*t*t*control2[1]+t*t*t*end[1]]);
  }
  return points;
}
function shoulders(c,{color,width=2.2,gap=1,end=41,offset=0,backing,blueEdge}){
  const curve=shoulderCurve(end);
  for(const side of ['left','right']){
    if(backing)c.detailLayers.push(band(`${side}-shoulder-backing`,curve,backing,9,3,side));
    if(blueEdge)c.detailLayers.push(band(`${side}-shoulder-blue-edge`,curve,blueEdge,2.7,0,side));
    for(let i=0;i<2;i++)c.detailLayers.push(band(`${side}-shoulder-band-${i+1}`,curve,color,width,offset+i*(width+gap),side));
  }
}
function cuffArea(depth,side){
  // Open lower extent is masked by the exact PNG sleeve edge. This avoids
  // painting old-template cuff lines across empty space or the wrong seam.
  if(side==='left')return `M12 ${n(76.6-depth)}C24 ${n(81.2-depth)} 36 ${n(86.5-depth)} 44.5 ${n(85.6-depth)}Q48 ${n(85.7-depth)} 49.2 ${n(77.5-depth)}L52 106H5Z`;
  return `M188 ${n(76.6-depth)}C176 ${n(81.2-depth)} 164 ${n(86.5-depth)} 155.5 ${n(85.6-depth)}Q152 ${n(85.7-depth)} 150.8 ${n(77.5-depth)}L148 106H195Z`;
}
function cuffs(c,bands){
  for(const side of ['left','right'])for(const [i,[depth,color,role]] of bands.entries())c.detailLayers.push(path(`${side}-cuff-band-${i}`,cuffArea(depth,side),color,`${side}Sleeve`,role?`${side}Cuff`:undefined));
}
// Curves measured against the original PNG: outer sewn ring reaches y≈25,
// opening y≈19. Back facing is kept separate from its colored neck band.
const neckOuter='M70 5L77 2Q100 7 123 2L130 5C132 32 68 32 70 5Z';
const neckOpening='M77 2Q100 7 123 2C127 24 73 24 77 2Z';
function round(c,edge,inside=c.colors.body,edgeWidth=0.8){
  const layers=[path('collar-outer',neckOuter,c.colors.collar,'all','collar')];
  if(edge)layers.push(path('collar-inner-trim',`M${n(77-edgeWidth)} 2.2Q100 7.2 ${n(123+edgeWidth)} 2.2C${n(127+edgeWidth)} ${n(24+edgeWidth*1.333)} ${n(73-edgeWidth)} ${n(24+edgeWidth*1.333)} ${n(77-edgeWidth)} 2.2Z`,edge));
  layers.push(path('collar-facing',neckOpening,inside,'all',inside===c.colors.body?'body':undefined));
  if(edge)layers.push(path('collar-back-trim','M77 2Q100 7 123 2L123.1 3.1Q100 8.2 76.9 3.1Z',edge));
  c.collar={shape:'custom',layers};
}
function vNeck(c,colors){
  // Painted V trim on the retained physical PNG neckline, not a fabricated
  // change to the underlying neck opening or source fabric geometry.
  c.collar={shape:'custom',layers:[path('neck-facing',neckOuter,c.colors.body,'all','body')]};
  let inset=0;
  const widths=colors.length===2?[3.5,.85]:colors.length===3?[2.7,1.1,1.2]:colors.length===5?[1,1.5,.9,1.5,.6]:[3.8];
  const contour=d=>`M${n(70+d)} 4L${n(77+d*.28)} 2Q100 7 ${n(123-d*.28)} 2L${n(130-d)} 4Q${n(126-d*.55)} ${n(20-d*.45)} 100 ${n(31-d*.9)}Q${n(74+d*.55)} ${n(20-d*.45)} ${n(70+d)} 4Z`;
  colors.forEach((color,i)=>{
    c.collar.layers.push(path(`v-neck-band-${i}`,contour(inset),color,'all',i===0&&color===c.colors.collar?'collar':undefined));
    inset+=widths[i];
  });
  c.collar.layers.push(path('neck-opening',contour(inset),c.colors.body,'all','body'));

}
function polo(c,edge){
  const collar=c.colors.collar;
  c.collar={shape:'custom',layers:[
    path('polo-facing',neckOuter,c.colors.body,'all','body'),
    path('polo-placket','M96 18H104V36H96Z',collar,'all','collar'),
    path('polo-left','M76 2L100 18L89 29L68 20Z',collar,'all','collar'),
    path('polo-right','M124 2L100 18L111 29L132 20Z',collar,'all','collar'),
  ]};
  if(edge)c.collar.layers.push(path('polo-edge-left','M76 2L69 19L89 27L98 18L99 19L89 29L68 20L75 2Z',edge),path('polo-edge-right','M124 2L131 19L111 27L102 18L101 19L111 29L132 20L125 2Z',edge));
}
const profiles={
  'Leeds United:home':{shoulder:{color:'#1164B7',width:2.9,gap:.95,end:41},collar:['round','#E0BE39'],edgeWidth:1.1,cuffs:[[4.7,'#1164B7',true],[1.2,'#E0BE39']],notes:'Two broad blue shoulder bands with one white separator, shortened to the upper sleeve; yellow inner collar line, white neck facing and yellow cuff edge. Nineteen alternating torso lines follow shallow chest/hem curves and no longer enter the shoulders.'},
  'Liverpool:away':{shoulder:{color:'#B71932',width:1.55,gap:.9,end:39},collar:['v','#FFFFFF','#B71932','#FFFFFF','#B71932','#FFFFFF'],cuffs:[[7,'#FFFFFF',true],[6,'#B71932'],[3.4,'#FFFFFF'],[2.1,'#B71932'],[.55,'#FFFFFF']],notes:'Two narrow red shoulder tapes, double red neck and cuff trim restored from the saved flat-front photograph.'},
  'Liverpool:home':{shoulder:{color:'#ECEEF1',width:1.8,gap:.8,end:37},collar:['round','#ECEEF1'],cuffs:[[3.5,'#B91F3B',true]],notes:'Two pale shoulder tapes follow the top edge and end on the upper sleeve; pale collar inner edge restored. Existing angular fabric artwork retained.'},
  'Manchester United:away':{shoulder:{color:'#C5263F',width:2.25,gap:.9,end:42},collar:['v','#165AA9','#F2F0ED','#C5263F'],cuffs:[[6,'#165AA9',true],[3.6,'#F2F0ED'],[2,'#C5263F']],notes:'Two red upper-shoulder bands replace three generic thin tracks; blue/white/red neck and cuff edges restored.'},
  'Manchester United:home':{shoulder:{color:'#F0F0F2',width:1.75,gap:.9,end:40},collar:['polo','#F4F1F0'],cuffs:[[5,'#EEEFF1',true],[2.9,'#18181C'],[1.6,'#EEEFF1']],notes:'Two pale shoulder tapes and the observed polo flap/placket paint; white/black/white cuff finish. The original PNG sewn round neckline remains underneath the painted polo detail.'},
  'Aston Villa:home':{shoulder:{color:'#A9CBE6',width:2.2,gap:1,end:40},collar:['polo','#5B1730'],cuffs:[[5.8,'#A9CBE6',true]],notes:'Two pale-blue shoulder tapes and polo flap/placket paint replace the generic three tracks and plain blue round fill.'},
  'Arsenal:home':{shoulder:{color:'#B61430',width:2.6,gap:1,end:40},collar:['v','#B61430'],cuffs:[[5.7,'#B61430',true]],notes:'Continuous white raglan shoulder panels extend to the neckline, with two red shoulder bands; removed unsupported floating white triangles.'},
  'Newcastle United:away':{shoulder:{color:'#EDECEE',width:2.4,gap:1.1,end:43},collar:['v','#EEEDEF','#101B2A','#6AB4C5'],cuffs:[[8,'#101B2A',true],[7,'#EEEDEF'],[5.2,'#101B2A'],[2.5,'#6AB4C5']],notes:'Two white shoulder tapes, navy/white/sky-blue neckline and layered cuff edging restored; tonal body motif is retained as an approximation.'},
  'Newcastle United:home':{shoulder:{color:'#F1EFF0',width:2,gap:1.15,end:40,offset:4.5,backing:'#111419',blueEdge:'#74BBD0'},collar:['round','#74BBD0'],cuffs:[[5.8,'#111419',true],[1.15,'#74BBD0']],notes:'Sky-blue upper tape and two white shoulder bands on a dark panel; body columns stop at the shoulder panel, avoiding intersecting comb-like lines. Collar/cuff blue edging restored.'},
  'Brentford:home':{collar:['round','#EAB23A','#EFECEE'],edgeWidth:1.6,cuffs:[[6.5,'#19161A',true],[2.2,'#EAB23A']],notes:'Black/yellow neck and cuff edging restored; side piping moved to the new body sides instead of floating inside white columns.'},
  'Brentford:away':{collar:['round',null,'#DDD3C4'],cuffs:[[5.8,'#E6DBCA',true]],notes:'Cream sleeve ribbing widened to the source proportions; source cream neck facing preserved separately from the neck band.'},
  'Ipswich Town:home':{collar:['round','#F1F0EC','#0E1938'],edgeWidth:.45,cuffs:[[5,'#0E1938',true],[.85,'#F1F0EC']],notes:'Pale inner collar and cuff lines restored from the flat front. Existing fan-diamond artwork retained.'},
  'Ipswich Town:away':{collar:['v','#111419','#CA203A'],cuffs:[[5.8,'#111419',true],[1.15,'#CA203A']],notes:'Black/red neck and cuff edging restored; horizontal lines remain confined to the torso.'},
  'Barcelona:home':{collar:['v','#10182D'],cuffs:[[3.8,'#10182D',true]],notes:'Dark shallow neck trim and cuff placement mapped to the new base; previously researched color bands retained.'},
  'Barcelona:away':{collar:['round',null,'#101114'],cuffs:[[3.8,'#101114',true]],notes:'Purple piping now follows the actual sleeve seam from shoulder to underarm instead of floating across the upper shoulder. Black neck facing and side gussets retained.'},
};
await fs.mkdir('data/kits/png-layouts',{recursive:true});
for(const r of latest.values())if(r.status==='ready'){
  const profile=profiles[`${r.team_name}:${r.variant}`];if(!profile)throw Error('Missing per-kit review profile');
  const c=structuredClone(r.config);c.templateVersion='png-front-1';c.detailLayers=[];
  // Match the exact old helper family, not arbitrary team pattern geometry.
  c.layers=c.layers.filter(p=>!(p.type==='path' && (/^M80 [\d.]+Q68 /.test(p.d)||/^M120 [\d.]+Q132 /.test(p.d))));
  if(r.team_name==='Leeds United'){
    c.layers=[];
    for(let i=0;i<19;i++){
      const y=22+i*9.5,dip=i<5?2.1:i<12?1.2:2.3,fill=i%2?'#E0BE39':'#1164B7';
      const x=i===0?60:i===1?48:35;
      c.layers.push(path(`body-pinline-${i+1}`,`M${x} ${n(y)}Q100 ${n(y+dip)} ${200-x} ${n(y)}L${200-x} ${n(y+.46)}Q100 ${n(y+dip+.46)} ${x} ${n(y+.46)}Z`,fill,'body'));
    }
  }
  if(r.team_name==='Arsenal'){
    c.layers=[];
    c.layers.push(path('left-raglan-shoulder','M0 0H78L75 6C62 16 55 39 49 77L0 96Z','#F1EFF1'),path('right-raglan-shoulder','M200 0H122L125 6C138 16 145 39 151 77L200 96Z','#F1EFF1'));
  }
  if(r.team_name==='Newcastle United'&&r.variant==='home'){
    c.layers=c.layers.filter(p=>!(p.type==='path' && /^M(?:81|119) 2L/.test(p.d)));
    // Existing broad body columns were all-clipped and cut across shoulder tapes.
    c.layers=c.layers.map(p=>p.type==='rect'?{...p,clip:'body'}:p);
  }
  if(r.team_name==='Manchester United'&&r.variant==='home')c.layers=[];
  if(r.team_name==='Barcelona'&&r.variant==='away'){
    c.layers=c.layers.filter(p=>!['left-shoulder-piping','right-shoulder-piping'].includes(p.id));
    // Replace the two legacy shoulder curves regardless of case of their HEX.
    c.layers=c.layers.filter(p=>!(p.type==='path'&&p.d.includes('Q35 26')));
    c.layers.push(path('left-sleeve-piping','M34.7 22C40 37 43 52 44 60Q45 70 49 77L49.5 76.6Q45.6 69.8 44.6 59.8C43.6 51.8 40.6 36.7 35.3 21.8Z','#7553AB'),path('right-sleeve-piping','M165.3 22C160 37 157 52 156 60Q155 70 151 77L150.5 76.6Q154.4 69.8 155.4 59.8C156.4 51.8 159.4 36.7 164.7 21.8Z','#7553AB'));
  }
  if(r.team_name==='Brentford'&&r.variant==='home'){
    c.layers=c.layers.filter(p=>!(p.type==='path'&&p.fill==='#EAB23A'));
    c.layers.push(path('left-side-piping','M49 77Q53 133 49 197H50.2Q54.2 133 50.2 77Z','#EAB23A','body'),path('right-side-piping','M151 77Q147 133 151 197H149.8Q145.8 133 149.8 77Z','#EAB23A','body'));
  }
  if(profile.shoulder)shoulders(c,profile.shoulder);
  if(profile.collar[0]==='round')round(c,profile.collar[1],profile.collar[2]||c.colors.body,profile.edgeWidth);
  else if(profile.collar[0]==='v')vNeck(c,profile.collar.slice(1));
  else polo(c,profile.collar[1]);
  cuffs(c,profile.cuffs);
  validateConfig(c);
  const references=r.references.map(ref=>({local_path:ref.local_path,page_url:ref.page_url}));
  if(r.team_name==='Leeds United')references.unshift({local_path:'data/research/references/leeds-home-user-front.png',source_type:'user-supplied flat-front correction reference'});
  for(const ref of references)ref.sha256=crypto.createHash('sha256').update(await fs.readFile(ref.local_path)).digest('hex');
  const layout={schemaVersion:1,team_id:r.team_id,team_name:r.team_name,variant:r.variant,source_revision:r.revision,layout_revision:'p001',surface_version:'original-png-composite-1',status:process.argv.includes('--reviewed')?'reviewed':'draft',review_scope:'Shoulder geometry, collar and cuff paint adapted against local source photographs. This is not a new kit-season verification or a claim of identical garment construction.',reviewed_by:'Codex',reviewed_at:'2026-09-23',human_approved:false,references,changes:profile.notes,limitations:'Original PNG silhouette, round-neck fabric folds and seams are retained. Painted V/polo trims cannot alter physical construction. Other previously approximated fabric patterns are not certified by this trim review.',shoulder_band_count:profile.shoulder?2:0,config:c};
  const file=`data/kits/png-layouts/${r.team_id}-${r.variant}-p001.json`,content=JSON.stringify(layout,null,2)+'\n';
  try{const previous=await fs.readFile(file,'utf8');if(previous!==content){if(JSON.parse(previous).status==='reviewed')throw Error(`Immutable layout changed: ${file}; create another layout revision.`);await fs.writeFile(file,content);}}catch(e){if(e.code!=='ENOENT')throw e;await fs.writeFile(file,content);}
  console.log(r.team_name,r.variant,layout.layout_revision);
}
