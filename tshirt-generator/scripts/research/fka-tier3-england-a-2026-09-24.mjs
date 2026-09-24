import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import {refinementBatch,base,neck,cuffs,rect,path,poly,panels,line,sidePiping} from './tier2-refinement-helpers.mjs';
import {tracePatch,tileTrace} from './tier1-42/trace.mjs';

const batch='tier3-england-a-2026-09-24';
const sourceOrder=JSON.parse(await fs.readFile('artifacts/footballkitarchive/league-one-a-2026-27/source-order.json','utf8'));
const scope=await Promise.all(sourceOrder.map(async r=>({...r,country:'England',key:`${r.name}:${r.variant}`,reference_path:r.reference,reference_sha256:crypto.createHash('sha256').update(await fs.readFile(r.reference)).digest('hex')})));
const {add,ink,save}=await refinementBatch(batch,[],scope);
const white='#F3F2EF',black='#17191D';
const strips=(c,xs,width,color,clip='body')=>xs.forEach(x=>c.layers.push(rect(x,0,width,200,color,clip)));
const hem=(c,color,depth=1.7)=>c.detailLayers.push(path(`M48 ${195.8-depth}Q100 ${198.5-depth} 152 ${195.8-depth}V205H48Z`,color,'body'));
// Raglan color inserts measured separately for these references, not legacy tapes.
const raglan=(c,color)=>panels(c,[[76,3],[73,10],[40,26],[34,38],[27,33],[34,23]],color);

for(const r of scope){let c,notes;
 if(r.name==='AFC Wimbledon'&&r.variant==='home'){
  c=base('#084592','#F0CD3C');cuffs(c,[[5,'#F0CD3C']]);
  for(const points of [[[75,12],[51,25],[35,34]],[[125,12],[149,25],[165,34]]])c.layers.push(line(points,'#E2C540',.45));
  sidePiping(c,'#D7C14A',.45);
  notes='Deep royal/navy blue plain field with yellow round-ring recoloring, broad yellow cuffs and fine yellow raglan/side piping. Repeated Lotto emblems in the collar and cuff tape are deliberately omitted, as are all chest/sleeve marks. The gold seam braid is reduced to a fine color line; source V-neck is not drawn over the existing PNG ring.';
 }
 if(r.name==='AFC Wimbledon'&&r.variant==='away'){
  c=base('#C51D29','#AD1720');cuffs(c,[[2.8,'#E7BB4B']]);hem(c,'#E7BB4B',2.1);
  // Narrow stripe spacing measured from the unobstructed lower front. The
  // recurring double-diamond manufacturer marks are excluded everywhere.
  strips(c,Array.from({length:48},(_,i)=>i*4.2),.5,'#961E27','all');
  strips(c,Array.from({length:24},(_,i)=>i*8.4+1.4),.23,'#E13A3B','all');
  for(const x of [63,88,113,138]){
   c.layers.push(rect(x,0,.35,200,'#841F28','body'),rect(x+3.5,0,.35,200,'#841F28','body'));
   let d='';for(let y=0;y<200;y+=4.9)d+=`M${x+.5} ${y}l1.4 1.5 1.4-1.5v3.4l-1.4-1.5-1.4 1.5Z`;
   c.layers.push(path(d,'#9B2830','body',.75));
  }
  notes='Red field with fine dark-red vertical lines and four narrow linked ornamental columns, observed separately from the repeated Lotto symbols. Manufacturer double-diamonds are removed throughout. Gold cuff and hem edges retained; dark-red color only on the existing round neckline. Polo flaps/placket and sponsor lettering are omitted. Fine line spacing is adapted to the common silhouette.';
 }
 if(r.name==='Barnsley'&&r.variant==='home'){
  c=base('#D30B2D');neck(c,[['#D30B2D',4],[white,.6]]);cuffs(c,[[3.5,'#D30B2D'],[.8,white]]);
  const trace=await tracePatch({reference:r.reference_path,box:[350,970,250,280],width:250,mode:'dark',threshold:1.2,blur:6,min:30,max:150});
  tileTrace(c,trace,{x:0,y:0,width:43,height:48,color:'#AA1330',clip:'all',opacity:.65,reflect:true});
  notes='Red with a faint small-scale tonal jacquard-like vertical zigzag field, red cuffs and a narrow white cuff/neck edge. Discrete constant-color contours from the clean lower-front crop [350,970,250,280], sampled at 250 px and reflected at 43 × 48 internal units; broad illumination is removed. Fine print is reduced and extended across sponsor-hidden areas, not claimed to match hidden placement. Original PNG supplies all fabric/shading; no second V-neck.';
 }
 if(r.name==='Barnsley'&&r.variant==='away'){
  c=base('#1C2E4B');neck(c,[['#18253E',4],[white,.6]]);cuffs(c,[[4,'#18253E'],[.8,white]]);
  await ink(c,r,{box:[255,270,605,1200],width:430,mode:'blue',threshold:62,min:35,max:117,repairs:[{target:[390,302,168,132],source:[604,965,168,132]},{target:[384,467,158,184],source:[651,927,158,184]},{target:[264,680,430,216],source:[333,1010,430,216]}]},{x:49,y:8,width:102,height:192,color:'#225992'});
  const sleeveTrace=await tracePatch({reference:r.reference_path,box:[922,290,95,185],width:95,mode:'blue',threshold:62,min:35,max:117});
  for(const clip of ['leftSleeve','rightSleeve'])tileTrace(c,sleeveTrace,{x:0,y:0,width:16,height:31.2,color:'#225992',clip,reflect:true});
  notes='Navy with irregular blue fields of short angled dashes, independently traced from the Away front. Three explicitly measured unbranded lower-front patches repair manufacturer, crest and sponsor regions before discrete blue-ink segmentation. Sleeve dashes use the clean upper-right sleeve crop [922,290,95,185], tiled at 16 × 31.2 units to match the small torso dash scale; hidden opposite-sleeve placement is adapted. Navy cuffs/ring with thin white inner edges; no source photo pixels, cyan branding or duplicate V-neck.';
 }
 if(r.name==='Blackpool'&&r.variant==='home'){
  c=base('#FF781F',white);c.colors.leftSleeve=c.colors.rightSleeve='#F77649';
  for(const side of ['left','right'])for(let i=0;i<13;i++){
   const y=18+i*5.3,thick=i<4?1.6:2.1;
   let points=[[0,y],[26,y+6],[26,y+7.2],[50,y+10.5],[50,y+10.5+thick],[26,y+7.2+thick],[26,y+6+thick],[0,y+thick]];
   if(side==='right')points=points.map(([x,yy])=>[200-x,yy]);
   c.layers.push(poly(points,white,`${side}Sleeve`));
  }
  c.colors.leftCuff=c.colors.rightCuff='#F77649';cuffs(c,[[.7,white]]);
  notes='Tangerine plain torso, white recolored round collar, and coral/orange sleeves with thirteen narrow, stepped white bands. The breaks and slight diagonal orientation are adapted to the common sleeves; the upper shoulder cap remains tangerine. Fine white cuff edge retained. All sponsors and Puma marks omitted; no V-neck paint on the chest.';
 }
 if(r.name==='Blackpool'&&r.variant==='away'){
  c=base('#163C61','#F88739');c.colors.leftSleeve=c.colors.rightSleeve='#1C3657';
  strips(c,[42,64,86,108,130],11,'#79BCE0');
  panels(c,[[76,3],[73,14],[43,27],[36,43],[28,35],[34,21]],'#86C5E5');cuffs(c,[[2.8,'#F88739']]);
  notes='Navy torso with four full sky-blue vertical bands and a partial side band, with a central navy stripe, solid navy sleeves, pale-blue shoulder inserts and orange neckline/cuff edges. Stripe count and spacing follow the independent Away front, with continuous lines restored through the sponsor. Fine panel joins adapted to the PNG; all orange crest/manufacturer/sponsor graphics removed.';
 }
 if(r.name==='Bradford City'&&r.variant==='home'){
  c=base('#FCB73B',black);c.colors.leftSleeve=c.colors.rightSleeve='#672D31';
  strips(c,[57,114],29,'#672D31');
  // One broad amber outer shoulder/sleeve stripe, independent of manufacturer marks.
  panels(c,[[76,2],[75,5],[38,22],[29,38],[22,75],[17,73],[23,35],[33,18]],'#FCB73B');
  cuffs(c,[[4,black],[3.1,'#FCB73B'],[2.3,'#672D31'],[.8,black]]);
  notes='Amber central and side panels with two broad claret torso bands; claret sleeves with one amber outer shoulder-to-cuff strip per side. Black ring and black/claret cuff bands with a narrow amber line, measured from the front. Very fine woven texture stays with the original PNG; no crest, sponsor, manufacturer marks or extra V-neck.';
 }
 if(r.name==='Bradford City'&&r.variant==='away'){
  c=base('#F4F3F4','#732633');
  neck(c,[['#732633',1],['#EAAF48',.35],['#732633',.4],['#EAAF48',.35],['#732633',.4],['#EAAF48',.35],['#732633',1]]);
  cuffs(c,[[5.5,'#732633'],[4.9,'#EAAF48'],[4.3,'#732633'],[3.7,'#EAAF48'],[3.1,'#732633'],[2.5,'#EAAF48'],[1.9,'#732633'],[1.3,'#EAAF48'],[.6,'#732633']]);
  notes='White field and sleeves with claret trim containing four fine amber cuff lines. The source polo collar has amber striping; its claret/amber colors are adapted to seven bands confined to the PNG ring. No polo flaps or placket drawn. Weave, emblems, sponsor and sleeve lettering omitted.';
 }
 if(r.name==='Bromley'&&r.variant==='home'){
  c=base('#F1F0F3',black);strips(c,[51,67,83,99,115,131,147],.38,'#27292E');
  notes='White shirt with seven fine black torso pinlines, plain white sleeves/cuffs and black neckline recoloring. Lines are straightened from the worn front photo and continued through branding; their fine width and spacing remain source-specific. Gold areas are emblems/manufacturer marks and are omitted. Hidden side geometry and source polo construction are not inferred.';
 }
 if(r.name==='Bromley'&&r.variant==='away'){
  c=base('#181A1E');
  for(const [x,w] of [[47,3],[65,13],[93,13],[121,13],[148,3]]){c.layers.push(rect(x,0,w,200,'#CC223C','body'),rect(x+w+1.2,0,1.15,200,'#CC223C','body'));}
  panels(c,[[76,0],[74,10],[48,17],[39,27],[36,22],[44,14]],black);
  notes='Black shirt with three full red torso stripes plus red edge fragments, each red stripe followed by a narrow companion pinline. Black shoulders, sleeves, cuff and ring. The worn reference is normalized to a flat front; manufacturer shoulder chevrons and all gold/red/white branding are omitted. Exact obscured side continuation is not claimed.';
 }
 if(r.name==='Burton Albion'&&r.variant==='home'){
  c=base('#F2BC32','#20231F');strips(c,[57,81,106,130],13,'#171D1B');
  c.colors.leftSleeve=c.colors.rightSleeve='#171D1B';
  panels(c,[[36,22],[40,27],[27,79],[19,76]],'#F2BC32');raglan(c,'#F2BC32');
  neck(c,[['#20231F',3],['#C3B77C',.45]]);cuffs(c,[[3.1,'#171D1B'],[2,'#D8B339'],[1.3,'#171D1B']]);
  notes='Gold/yellow with four black vertical torso stripes and a central gold band, black sleeves with gold outer stripe and raglan panels. Black round neckline with thin muted pale inner edge; black cuffs with narrow gold line. Archive front is a flat kit illustration credited to fmslovakia.com, not a garment photograph; this reference limitation is retained. Logos, sponsor and crest removed.';
 }
 if(r.name==='Burton Albion'&&r.variant==='away'){
  c=base('#2D466D');raglan(c,'#F0F0E7');
  neck(c,[['#F0F0E7',1.1],['#2D466D',.45],['#F0F0E7',1.1]]);
  cuffs(c,[[4.2,'#F0F0E7'],[3.1,'#2D466D'],[2.4,'#F0F0E7'],[1.1,'#2D466D'],[.5,'#F0F0E7']]);
  for(const points of [[[74,9],[57,17],[43,32],[48,71]],[[126,9],[143,17],[157,32],[152,71]]])c.layers.push(line(points,'#F0F0E7',.6));
  notes='Plain navy with off-white upper shoulder/raglan panels and thin curved armhole piping; navy/off-white double trim on cuffs and original round ring. Independently saved Away illustration is credited to fmslovakia.com, with exact physical garment construction unverified. No source V-neck, sponsor, manufacturer or crest paint.';
 }
 if(r.name==='Cambridge United'&&r.variant==='home'){
  c=base('#F6B21F','#161A1B');cuffs(c,[[3.6,'#161A1B']]);
  c.layers.push(rect(49,182,.7,18,'#161A1B','body'),rect(150.3,182,.7,18,'#161A1B','body'));
  notes='Amber/gold body and sleeves with solid black cuff bands and black recoloring of the PNG ring. Fine black lower-side seam accents retained. Source fold-down collar is deliberately reduced to ring color; all black sponsor/crest/manufacturer lettering removed.';
 }
 if(r.name==='Cambridge United'&&r.variant==='away'){
  c=base('#B5D9EB','#171D48');
  strips(c,Array.from({length:45},(_,i)=>i*4.5),2,'#C8E2EF','all');
  panels(c,[[76,0],[76,10],[50,22],[33,35],[28,25],[45,12]],'#B5D9EB');
  for(const [points,color,width]of [[[[75,12],[51,24],[34,36]],'#E9AB31',2.4],[[[125,12],[149,24],[166,36]],'#E9AB31',2.4],[[[75,13],[51,25],[34,37]],'#171D48',1.8],[[[125,13],[149,25],[166,37]],'#171D48',1.8]])c.layers.push(line(points,color,width));
  neck(c,[['#171D48',4],['#E9AB31',.7]]);cuffs(c,[[5.3,'#E9AB31'],[4.4,'#171D48']]);
  for(const x of [49,148])c.layers.push(rect(x,70,3,130,'#ACD1E5','body'));
  notes='Pale sky-blue with fine alternating lighter vertical stripes on torso and sleeves, solid sky shoulder yokes, and navy/gold curved raglan lines. Navy ring with gold inner edge, navy cuffs with gold top edge and pale side inserts. Source says Plain but visible stripes are independently drawn. Mesh is not traced; hidden side detail adapted to common silhouette.';
 }
 if(r.name==='Doncaster Rovers'&&r.variant==='home'){
  c=base('#C9294B');
  for(const [y,height]of [[21,14],[54,20],[94,20],[134,20],[174,26]])c.layers.push(rect(0,y,200,height,'#F1EEEE','all'));
  neck(c,[['#C9294B',4],['#CAB97D',.7]]);cuffs(c,[[6,'#CAB97D']]);
  notes='Five white horizontal bands across a red torso, including the white hem; bands continue across sleeves above broad pale-gold cuffs. Red neckline with thin gold inner edge recolors the existing round ring. Band heights are measured from the independent flat front, without warping by source folds. All crests, sponsor and sleeve marks omitted.';
 }
 if(r.name==='Doncaster Rovers'&&r.variant==='away'){
  c=base('#5868C4');neck(c,[['#5868C4',4],['#C9B982',.7]]);
  cuffs(c,[[4.5,'#181B2C'],[3.7,'#BFA968'],[3.1,'#181B2C'],[1.8,'#BFA968'],[1.2,'#181B2C']]);
  notes='Plain periwinkle/royal-blue field with blue existing ring and fine pale-gold inner edge; black cuffs with two fine gold bands. No invented torso print. Metallic source trim is approximated by a flat estimated gold, with original PNG highlights retained. Crest, manufacturer, labels and sponsor omitted.';
 }
 if(!c||!notes)throw Error('Unpainted scope slot '+r.key);
 add(r,c,notes);
}
await save();
