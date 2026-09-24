import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import {refinementBatch,read,base,neck,cuffs,rect,path,poly,panels,line,gradient,sidePiping} from './tier2-refinement-helpers.mjs';
const batch='tier2-italy-complete-2026-09-24';
const prior=await read('artifacts/footballkitarchive/tier2-italy-2026-09-24/manifest.json');
const work=await read('data/research/tier2-worklist.json');
const rows=await Promise.all(work.tasks.filter(t=>t.country_name==='Italy'&&!prior.some(p=>p.name===t.team_name&&p.variant===t.variant)).map(async t=>({...t,name:t.team_name,country:'Italy',key:`${t.team_name}:${t.variant}`,reference_sha256:crypto.createHash('sha256').update(await fs.readFile(t.reference_path)).digest('hex')})));
const {scope,add,ink,save}=await refinementBatch(batch,[],rows);
for(const r of scope){let c;
 if(r.name==='Ascoli'){
  c=base('#EFEEEB');for(let y=-80;y<280;y+=3)c.layers.push(poly([[49,y],[151,y-105],[151,y-103.9],[49,y+1.1]],'#D4D4CE','body',.38));
  for(let y=78;y<193;y+=15)panels(c,[[49,y],[51,y-2],[51,y+6],[49,y+8]],'#24272A');add(r,c,'White with very pale fine rising diagonal torso lines and black interrupted narrow side bars. White sleeves and collar; tonal print contrast adapted from the independent Away front, with material weave and logos excluded.');
 }
 if(r.name==='Benevento'&&r.variant==='home'){
  c=base('#E22B27','#CD282A');for(const x of [52,73,95,117,139]){c.layers.push(rect(x,0,9,200,'#F0C725','body'));for(let y=0;y<201;y+=4.5)if(y<60||y>125)for(let j=0;j<2;j++)c.layers.push(poly([[x+j*4.5+.4,y+.3],[x+j*4.5+4,y+2.25],[x+j*4.5+.4,y+4.2]],'#E52D27','body'));}
  panels(c,[[48,76],[54,90],[52,116],[49,104]],'#202727');add(r,c,'Red with five narrow yellow vertical stripes, fine red triangular lattice in the upper/lower stripes and near-solid yellow through mid-front. Red sleeves and neckline, small black underarm inserts. Stripe lattice geometry measured from front; branding omitted.');
 }
 if(r.name==='Benevento'&&r.variant==='away'){
  c=base('#F0F0EC');for(const pts of [[[77,7],[77,26],[86,42],[104,42],[114,15]],[[77,26],[64,30],[58,23]],[[86,42],[75,54]],[[104,42],[117,52]],[[112,23],[131,21],[135,10],[123,7]],[[131,21],[139,33],[151,39]],[[49,89],[59,83],[65,88]],[[49,119],[57,116],[67,107]],[[57,116],[57,143],[96,149],[104,157],[133,182],[138,200]],[[57,143],[52,148],[49,159]],[[104,157],[126,121],[142,133],[137,158],[113,180]],[[126,121],[132,105]],[[137,158],[149,181]],[[49,174],[64,183],[70,200]],[[64,183],[91,186],[111,198]]])c.layers.push(line(pts,'#C9BA85',.55,'body',.75));
  add(r,c,'White with sparse pale-gold irregular polygon edges, concentrated around upper chest and lower torso. Gold line junctions placed individually from the Away source; plain white neck and sleeves.');
 }
 if(r.name==='Catanzaro'&&r.variant==='home'){
  c=base('#9F2326','#E4B821');cuffs(c,[[3.3,'#E2B52B']]);sidePiping(c,'#D6AF35',.5);
  for(const clip of ['leftSleeve','rightSleeve'])for(const [x,y]of [[22,36],[31,60],[169,31],[177,58]])for(let j=0;j<3;j++){const pts=[];for(let t=0;t<=1;t+=.04){const a=t*5.4;pts.push([x+Math.cos(a)*(6+t*7+j),y+Math.sin(a)*(6+t*7+j)]);}c.layers.push(line(pts,'#AD4240',.5,clip,.55));}
  add(r,c,'Deep red body with faint tonal scroll forms on red sleeves, gold sleeve bands and thin gold side piping. The source gold polo collar is represented only by recoloring the existing PNG round neckline; no flap or placket drawn.');
 }
 if(r.name==='Catanzaro'&&r.variant==='away'){
  c=base('#EEC72C','#EEC72C');neck(c,[['#E9C127',3],['#9D252B',.8]]);cuffs(c,[[4,'#A8272D']]);
  await ink(c,r,{box:[208,174,460,830],width:500,mode:'blue',threshold:-125,min:150,max:250,smooth:1,exclude:[[520,235,103,106],[587,865,80,60]]},{x:49,y:7,width:102,height:193,color:'#F1D884'});
  sidePiping(c,'#A9302C',.4);add(r,c,'Golden-yellow shirt with pale cream flowing woodgrain-like vertical/diagonal ink mapped from full Away front, red cuffs and fine red neck edge. Separate color-channel ink mask excludes red sponsors; crest and lower label omitted. Yellow sleeves retain original fabric.');
 }
 if(r.name==='Cremonese'){
  c=base('#E7EBE7','#8A8C8C');c.colors.leftSleeve=c.colors.rightSleeve='#AFB2B2';neck(c,[['#E9EBE7',1],['#777D80',1],['#C63C48',.5]]);cuffs(c,[[3.3,'#AEB2B2'],[2,'#6E7479'],[.8,'#D63B48']]);
  for(const [x,y,s]of [[73,116,1],[43,184,.85],[152,169,.85],[154,96,.5],[133,6,.45],[63,5,.38]])for(const pts of [[[0,0],[-16,-9],[4,-18],[2,-4]],[[0,2],[-18,11],[-5,18],[1,29]],[[3,-3],[18,-17],[14,9],[18,23],[2,3]]]){const p=pts.map(([xx,yy])=>[x+xx*s,y+yy*s]);c.layers.push(poly(p,'#B7B9B8','body'),line([...p,p[0]],'#CA666A',.4,'body'));}
  add(r,c,'Pale grey-white torso with asymmetric grey angular three-part motifs outlined thin red, grey sleeves, and grey/red fine collar and cuff bands. Motif positions adapted individually from the Away front; sponsor and crest shapes excluded.');
 }
 if(r.name==='Empoli'){
  c=base('#EAE0CE');for(let y=6;y<200;y+=8)for(let x=50;x<151;x+=8)c.layers.push(line([[x,y],[x+3,y-3],[x+6,y],[x+3,y+3],[x,y]],'#D1C5B2',.22,'body',.32));
  panels(c,[[49,184],[53,196],[49,199]],'#2C74AB');neck(c,[['#EAE0CE',3],['#477697',.35]]);add(r,c,'Warm ivory with a very faint fine diagonal geometric field and small blue hem-side inserts, ivory sleeves and neckline with a narrow blue inner edge. Tiny source textile pattern simplified to thin tonal outlines without transcribing lettering or emblems.');
 }
 if(r.name==='Hellas Verona'){
  c=base('#F3CF15','#143E67');neck(c,[['#123F67',2],['#EFCC25',.6],['#173F67',.6],['#EFCC25',.4]]);cuffs(c,[[3.7,'#123F67'],[1.5,'#E9CA27'],[1,'#194567'],[.4,'#EFCF2A']]);
  await ink(c,r,{box:[222,163,456,821],width:520,mode:'dark',threshold:3,blur:10,smooth:1.2,repairs:[{target:[269,240,110,65],source:[260,471,110,65]},{target:[528,207,110,110],source:[410,489,110,110]},{target:[265,354,400,78],source:[237,518,400,78]}]},{x:49,y:5,width:102,height:190,color:'#D3AE12',opacity:.48});
  add(r,c,'Yellow with faint tonal street-map contours across the front, solid yellow sleeves, navy/yellow layered collar and cuff bands. The full front map is converted to discrete lines; logo-obscured sections reconstructed from adjacent clean map, so exact hidden street alignment is not claimed.');
 }
 if(r.name==='Padova'){
  c=base('#D91528','#EEECE6');c.colors.leftSleeve=c.colors.rightSleeve=c.colors.leftCuff=c.colors.rightCuff='#F0EFEB';
  for(let y=7;y<200;y+=12)for(let x=49;x<151;x+=12)if((Math.floor(y/12)+Math.floor((x-49)/12))%2===0)c.layers.push(rect(x,y,12,12,'#C31225','body',.65));
  cuffs(c,[[4.5,'#EEEDE8']]);for(const side of ['left','right'])for(let i=0;i<8;i++){const x=10+i*5,y=74+(x-12)*.23;c.detailLayers.push(poly([[side==='left'?x:200-x,y-2],[side==='left'?x+4:196-x,y-1],[side==='left'?x+2:198-x,y+3]],'#C91C2B',`${side}Sleeve`));}
  add(r,c,'Red body with tonal red checker field, white sleeves and neckline, red triangular teeth along white cuff bands. Small repeated animal/club motifs inside source checks omitted under the no-emblems rule; checker size and cuff teeth adapted from front.');
 }
 if(r.name==='Palermo'&&r.variant==='home'){
  c=base('#EAA1A7','#252322');cuffs(c,[[3.8,'#242221']]);
  const patches=[[[49,47],[78,23],[54,64]],[[77,48],[148,5],[141,19],[99,74],[151,66],[151,73],[84,87],[96,69]],[[49,151],[101,132],[64,147],[49,165]],[[76,200],[119,142],[126,157],[152,107],[151,142],[127,185],[120,177],[97,200]],[[50,106],[61,98],[49,114]]];
  for(const p of patches)c.layers.push(poly(p,'#D87883','body'));
  for(const p of [[[49,45],[77,27],[71,36],[49,67]],[[73,59],[150,9],[114,37],[91,45]],[[98,200],[119,172],[116,186],[150,149],[151,168],[120,200]]])c.layers.push(poly(p,'#2B2525','body'));
  for(const pts of [[[49,39],[68,32],[49,50]],[[74,63],[146,12]],[[49,147],[93,134]],[[49,150],[89,140]],[[87,193],[120,151],[126,166]],[[92,193],[119,159],[125,170]]])c.layers.push(line(pts,'#EFBDC0',.5,'body'));
  add(r,c,'Pink with asymmetric salmon and black rising diagonal brush/zigzag slashes, manually placed from the Home front. Pink sleeves, black cuffs and existing round collar; sponsors, crest and all Puma marks removed.');
 }
 if(r.name==='Palermo'&&r.variant==='away'){
  c=base('#F3D8B8','#E7DD7C');cuffs(c,[[3,'#E7DD7C']]);
  await ink(c,r,{box:[251,189,510,775],width:530,mode:'red',threshold:42,min:140,max:250,smooth:1,repairs:[{target:[330,286,116,76],source:[341,621,116,76]},{target:[565,282,130,92],source:[549,598,130,92]},{target:[303,422,407,86],source:[292,685,407,86]}]},{x:49,y:4,width:102,height:196,color:'#F4B579'});
  for(const [box,x,clip]of [[[126,270,105,122],2,'leftSleeve'],[[794,272,97,114],151,'rightSleeve']])await ink(c,r,{box,width:180,mode:'red',threshold:42,min:140,max:250},{x,y:25,width:47,height:60,color:'#F4B579',clip});
  await ink(c,r,{box:[251,520,510,430],width:500,channelMask:{red:[0,39],yellow:[62,160],lum:[150,250]}},{x:49,y:95,width:102,height:105,color:'#E9CE75'});
  add(r,c,'Cream-peach with orange citrus fruit, leaf and flower silhouettes mapped from the independently sourced Away front, pale lemon collar/cuffs. Brand-obscured floral areas reconstructed from clean same-print regions; discrete color contours only, no source fabric raster.');
 }
 if(r.name==='Südtirol'&&r.variant==='home'){
  c=base('#EEEFEA');for(const p of [[[49,116],[64,128],[102,173],[119,200],[88,200],[67,168],[49,163]],[[65,116],[120,148],[151,199],[133,200],[103,175],[81,140]]])c.layers.push(poly(p,'#B2212D','body'));
  c.layers.push(poly([[12,44],[20,69],[29,78],[35,72],[27,53],[25,30]],'#B2212D','leftSleeve'));
  add(r,c,'White with two asymmetric broad red angular lower-front ribbons and a red left-sleeve wedge; right sleeve remains white. Fine tonal red marks inside lower-left red area simplified, white collar/cuffs. Source asymmetry retained, logos removed.');
 }
 if(r.name==='Südtirol'&&r.variant==='away'){
  c=base('#242526','#222426');
  await ink(c,r,{box:[380,236,738,1259],width:580,mode:'light',threshold:3,blur:9,min:15,max:115,smooth:1.1,repairs:[{target:[505,310,135,125],source:[450,970,135,125]},{target:[902,276,150,168],source:[744,1060,150,168]},{target:[520,500,500,222],source:[464,996,500,222]},{target:[560,752,460,96],source:[435,1200,460,96]},{target:[1030,1320,70,95],source:[910,1100,70,95]}]},{x:49,y:7,width:102,height:193,color:'#5F6161',opacity:.65});
  neck(c,[['#252728',3.5]]);c.collar.layers.push({...rect(98.8,15,1.1,12,'#EFEFEA'),id:'white-front-neck-tab'},{...rect(99.9,15,1.1,12,'#C3303B'),id:'red-front-neck-tab'});
  add(r,c,'Charcoal with faint grey road-map contours across the front, dark sleeves and neckline with tiny white/red center tab. Map ink separated locally from fabric; obscured sponsor regions reconstructed using clean lower map contours. No lettering, stars or club symbols retained.');
 }
 if(r.name==='Vicenza'){
  c=base('#3B3C42','#232629');c.colors.leftSleeve=c.colors.rightSleeve=c.colors.leftCuff=c.colors.rightCuff='#232629';
  c.layers.push(poly([[75,4],[73,14],[59,27],[50,47],[48,78],[41,80],[43,46],[50,24]],'#EBECE8'),poly([[125,4],[127,14],[141,27],[150,47],[152,78],[159,80],[157,46],[150,24]],'#CC3039'));
  neck(c,[['#252728',3],['#C7333C',.75]]);add(r,c,'Charcoal front and black sleeves with asymmetric white left/red right curved raglan bands and red neckline edge. The large repeated LR monogram and shoulder manufacturer chevrons are branding and deliberately omitted; independent Away source retained.');
 }
}
await save();
