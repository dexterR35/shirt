import {add,previous,base,neck,cuffs,path,rect,poly,line,gradient,mirror} from './shared.mjs';
import {ink,tileTrace,placeTrace} from './ink.mjs';
{
  const c=previous('Fiorentina','home');
  const t=await ink('Fiorentina','home',{box:[310,730,710,720],mode:'dark',threshold:7,width:310});
  c.layers.push(rect(48,80,104,117,'#642E99','body'),...placeTrace(t,{x:48,y:80,width:104,height:117,color:'#432174',clip:'body',opacity:.85}));
  add('Fiorentina','home',c,'Nested purple bandana diamonds now include the directly traced central rosette, fine floral border chains and corner diamond ornament. Plain sleeves and white cuffs retained on the original PNG.');
}
for(const variant of ['home','away']){
  const c=previous('Frosinone',variant);c.layers=c.layers.filter(l=>l.type==='polygon');
  const home=variant==='home',t=await ink('Frosinone',variant,{box:home?[314,620,330,338]:[375,712,330,370],mode:'dark',threshold:home?3.5:3,width:230,blur:6});
  tileTrace(c,t,{width:90,height:95,color:home?'#BEA143':'#C9C6BD',opacity:home?.42:.32,x:10,y:0});
  if(!home)c.layers.push(path('M48 78L55 82L49 126Z','#172B39','body'),path('M152 78L145 82L151 126Z','#172B39','body'));
  add('Frosinone',variant,c,`${home?'Yellow/blue':'Ivory/navy/gold'} shirt with a source-derived tonal architectural line field replacing invented building outlines. The Home and Away fragments were traced independently.`, 'The fine scene is recovered only as a repeat; full architectural arrangement and the faint upper field still need a sharper reference.');
}
{
  const c=previous('Milan','away');
  for(const d of ['M49 37Q73 44 89 21Q83 48 58 58L49 52Z','M94 40Q122 41 140 20Q127 51 105 61Q101 55 94 40Z','M48 117Q66 121 95 104Q77 128 52 137Z','M77 149Q106 154 143 124Q127 154 107 163Q88 166 77 149Z','M101 167Q134 178 152 166L152 176Q127 190 110 178Z'])c.layers.push(path(d,gradient('#F1F2F1','#CDD4D7',0,25,140,195),'body',.55));
  add('Milan','away',c,'White shirt with additional overlapping pale feather lobes on the upper chest and lower front, soft gray print gradients and red/black seam trim.','The individually drawn feathers still differ from the exact source composition; a full outline review remains required.');
}
{
  const c=previous('Monza','away');c.layers=[];
  const t=await ink('Monza','away',{box:[220,434,253,259],mode:'dark',threshold:3,width:260,blur:4});
  tileTrace(c,t,{x:-45,y:-10,width:106,height:107,color:'#A8B1B7',opacity:.28,reflect:true});
  add('Monza','away',c,'Gray dot waves now follow the actual observed curved dot tracks and blank valleys from the lower-front Away image; the source burgundy collar color stays on the original round ring.','Dot tracks at the horizontal repeat and plain sleeves still require refinement before this adaptation can be released.');
}
for(const variant of ['home','away']){
  const c=previous('Sassuolo',variant),h=variant==='home',kept=c.layers.filter(l=>l.type==='rect'||!h&&l.d?.startsWith('M49')||!h&&l.d?.startsWith('M151'));c.layers=[];
  if(h)for(const k of ['body','leftSleeve','rightSleeve'])c.colors[k]='#199F5B';
  const t=await ink('Sassuolo',variant,{box:h?[428,520,78,446]:[314,639,359,388],mode:'dark',threshold:h?5:5,width:h?65:220,blur:9});
  if(h){for(let x=-3;x<200;x+=15)for(const y of [-5,82,169])c.layers.push(...placeTrace(t,{x,y,width:15,height:87,color:'#126D68',opacity:.8}));}
  else tileTrace(c,t,{width:75,height:81,color:'#CCD1CE',x:1,y:-2});
  c.layers.push(...kept);
  if(!h)c.layers.push(poly([[48,70],[54,87],[48,101],[43,80]],'#128652','leftSleeve'),poly([[152,70],[146,87],[152,101],[157,80]],'#128652','rightSleeve'));
  add('Sassuolo',variant,c,h?'Green/black columns now contain actual blue-green mineral contours from the central source stripe; green seam bands and black stripe spacing retained.':'White shirt with directly traced fine gray leaf clusters, thin green neckline/cuff borders and green underarm inserts. The independent Away floral pattern replaces the generic angular fragments.');
}
{
  const c=base('#F3EDDE','#282C27','#282C27');
  for(const [right,color]of [[false,'#F57D38'],[true,'#168E70']]){
    const p=[[75,4],[64,7],[62,18],[58,8],[48,12],[47,26],[40,16],[33,22],[35,34],[25,25],[18,36],[22,47],[14,42],[9,56],[18,74],[43,32],[76,20]];
    const points=right?mirror(p):p;
    const fill={type:'linearGradient',x1:right?135:65,y1:4,x2:right?187:13,y2:72,stops:[{offset:0,color:'#2D302B'},{offset:.22,color:'#333D30'},{offset:.51,color},{offset:.79,color:'#EFE6D1'},{offset:1,color:'#F3EDDE'}]};
    // Round the fan crests instead of the old disconnected pointed polygons.
    const d=right?'M125 4Q140 3 138 17Q151 7 152 24Q168 11 165 34Q181 21 179 45Q191 34 191 57L182 74L157 32L124 20Z':'M75 4Q60 3 62 17Q49 7 48 24Q32 11 35 34Q19 21 21 45Q9 34 9 57L18 74L43 32L76 20Z';
    c.layers.push(path(d,fill));
    const seam=(right?mirror:q=>q)([[74,19],[48,29],[18,74]]);c.layers.push(line(seam,'#292A25',2,'all'),line(seam,right?'#E78D50':'#459F84',.65,'all'));
    const side=right?'M151 81Q138 127 141 196H153V81Z':'M49 81Q62 127 59 196H47V81Z';
    c.layers.push(path(side,{type:'linearGradient',x1:0,y1:81,x2:0,y2:197,stops:[{offset:0,color:'#292D27'},{offset:.4,color},{offset:.83,color:'#F0E7D4'},{offset:1,color:'#F3EDDE'}]},'body'));
    c.layers.push(path(right?'M150 85Q138 129 141 197H142Q139 129 151 85Z':'M50 85Q62 129 59 197H58Q61 129 49 85Z','#2C2B27','body'));
  }
  neck(c,[['#E99859',.35],['#252C26',2.5],['#338A6E',.35]]);cuffs(c,[[1.2,'#292923']]);c.layers.push(rect(0,196,200,2,'#292923','body'));
  add('Venezia','away',c,'Ivory shirt with rounded overlapping fan crests across the shoulders, dark-to-orange left and dark-to-green right gradients fading into ivory. Curved side panels and thin contrasting seams replace hard stair-step polygons.','The small tonal ivory body print and exact fan overlap boundaries are still incomplete.');
}
