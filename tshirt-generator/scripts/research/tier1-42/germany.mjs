import {add,previous,path,rect,poly,line} from './shared.mjs';
import {ink,tileTrace,placeTrace} from './ink.mjs';
{
  const c=previous('Bayer Leverkusen','away');c.layers=[];
  const t=await ink('Bayer Leverkusen','away',{box:[670,89,124,80],mode:'dark',threshold:9,width:170});
  tileTrace(c,t,{width:41,height:35,color:'#224664',x:0,y:0});
  c.layers.push(path('M49 31Q100 17 151 31L151 197H49Z','#CDDFE1','body'));
  add('Bayer Leverkusen','away',c,'Source-derived mineral boundary contours replace circular shoulder loops; pale ice-blue torso and slate original ring/cuff trim retained.','The multi-tone mineral cells still need matching fills and seamless placement across both shoulders and sleeves.');
}
for(const variant of ['home','away']){
  const c=previous('FC Augsburg',variant),h=variant==='home';const piping=h?c.layers.filter(l=>l.d?.startsWith('M49')||l.d?.startsWith('M151')):[];c.layers=[];
  const t=await ink('FC Augsburg',variant,{box:h?[300,492,300,230]:[306,530,300,174],mode:'dark',threshold:h?6:3,width:260,blur:h?9:30});
  tileTrace(c,t,{width:104,height:h?85:79,color:h?'#B5A89D':'#0A5B6B',opacity:h?.64:.7,x:-4,y:-5});c.layers.push(...piping);
  add('FC Augsburg',variant,c,h?'Ivory marble field now contains the actual fine branching fracture contours; claret side piping and green/gold/claret trim retained.':'Teal body and sleeves with observed irregular dark mineral shapes replacing repeated angular symbols; gold seam borders retained.');
}
{
  const c=previous('RB Leipzig','away');c.layers=[];
  const t=await ink('RB Leipzig','away',{box:[432,817,602,668],mode:'light',threshold:6,width:270});
  c.layers.push(...placeTrace(t,{x:48,y:88,width:104,height:106,color:'#EF9557',opacity:.55}));
  const top=await ink('RB Leipzig','away',{box:[595,310,220,190],mode:'light',threshold:7,width:170});
  for(const x of [48,84,120])c.layers.push(...placeTrace(top,{x,y:22,width:36,height:50,color:'#F2995A',opacity:.62}));
  add('RB Leipzig','away',c,'Fine gold branching line work is now traced from the unobstructed lower illustration and center chest. Plain red sleeves and navy/gold collar/cuff bands retained.','The upper branching figure remains reconstructed from a partial crop; source overlap hidden by chest branding prevents a faithful complete outline.');
}
{
  const c=previous('Union Berlin','home');c.layers=[];
  const t=await ink('Union Berlin','home',{box:[302,540,258,364],mode:'light',threshold:4,width:220});
  for(const y of [-26,77,180])c.layers.push(...placeTrace(t,{x:48,y,width:104,height:103,color:'#FA6650',opacity:.55}));
  for(const side of ['leftSleeve','rightSleeve'])for(const x of [4,150])c.layers.push(...placeTrace(t,{x,y:23,width:45,height:64,color:'#FA6650',opacity:.48,clip:side}));
  add('Union Berlin','home',c,'Pointed architectural columns and triangular trusses now follow the actual curved source rows, including tonal sleeve motifs. Red shirt, pale shoulder tape and seam edging retained.');
}
{
  const c=previous('VfB Stuttgart','away');c.layers=[];
  const t=await ink('VfB Stuttgart','away',{box:[400,809,306,390],mode:'dark',threshold:2,width:220,blur:22});
  tileTrace(c,t,{width:68,height:87,color:'#A71C2B',opacity:.48,x:-5,y:-8});c.layers.push(rect(0,61,200,26,'#F0EEEC','body'));
  add('VfB Stuttgart','away',c,'Actual tonal leaf/organic contours replace generic curls across the red shirt; pale chest band and fine white neckline/cuff edging retained.');
}
