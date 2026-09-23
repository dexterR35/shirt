import {add,previous,path,poly,line,mirror,gradient} from './shared.mjs';
import {ink,tileTrace,placeTrace} from './ink.mjs';
{
  const c=previous('Dinamo București','away');c.layers=c.layers.filter(l=>l.type!=='path'||!l.d?.includes('l3-1 1 2'));
  const t=await ink('Dinamo București','away',{box:[531,759,122,328],mode:'dark',threshold:2.5,width:95,blur:6});
  tileTrace(c,t,{width:23,height:62,color:'#D2D0BD',opacity:.22,x:1,y:3});
  add('Dinamo București','away',c,'Ivory/cream vertical bands with a very faint source-derived mottled field, replacing the earlier invented angular spots. Red/black/red cuff and original collar borders and red underarm details retained.');
}
{
  const c=previous('FC Argeș','home');c.layers=c.layers.filter(l=>l.type==='rect'&&l.width===15||l.type==='polygon');
  const t=await ink('FC Argeș','home',{box:[237,418,181,298],mode:'dark',threshold:3,width:180,blur:8});
  c.layers.push(...placeTrace(t,{x:66,y:88,width:68,height:109,color:'#CDCFCC',clip:'body',opacity:.4}));
  add('FC Argeș','home',c,'White/purple layout retained; the lower central architectural photograph now has source-derived tonal contours instead of invented building rows.','The pale scene above and behind the sponsor is still unresolved, and the only saved archive front is blurred; no complete illustration is claimed.');
}
{
  const c=previous('Oțelul Galați','away');
  // Replace the old narrow ribbon insert; source has a broad mesh gusset
  // tapering from the sleeve underside into the upper waist.
  c.layers=c.layers.filter(l=>l.type!=='polygon'&&!(l.fill==='#A5B1B3'));
  for(const right of [false,true]){
    const p=[[47,36],[41,53],[39,78],[44,86],[51,126],[53,105],[49,82]],pts=right?mirror(p):p;
    c.layers.push(poly(pts,'#DDE3E1'));
    for(let i=0;i<18;i++){const y=53+i*3.2,x=42+(y-53)*.09,q=[[x,y],[x+4,y+2]];c.layers.push(line(right?mirror(q):q,'#899EA5',.13,'all',.55));}
  }
  add('Oțelul Galați','away',c,'Navy/teal field with fading hexagons, pale shoulder tape and revised broad mesh underarm gussets tapering into the waist; the original PNG collar remains the only neckline.','The available archive front is blurred and its page could not be fetched during this review. Fine hexagon scale and exact gusset contour remain unverified.');
}
{
  const c=previous('Asteras Tripolis','home');c.layers=[];
  const t=await ink('Asteras Tripolis','home',{box:[222,484,270,301],mode:'dark',threshold:7,width:230,blur:9});
  tileTrace(c,t,{width:89,height:99,color:'#CBA326',opacity:.7,x:0,y:1});
  add('Asteras Tripolis','home',c,'Gold tropical/illustrated fragments now follow the visible source print instead of six generic leaves; blue cuffs and round base collar retained.','The model pose hides and distorts part of the field; a repeated crop cannot establish the full illustration or sleeve placement.');
}
{
  const c=previous('Kifisia','away');c.layers=[];
  const t=await ink('Kifisia','away',{box:[336,170,115,88],mode:'dark',threshold:5,width:160,blur:7});
  for(const x of [42,78,114])for(const y of [-4,32])c.layers.push(...placeTrace(t,{x,y,width:39,height:40,color:gradient('#ADB5B3','#EFF0ED',0,10,0,78),clip:'body',opacity:.72}));
  add('Kifisia','away',c,'Fine branching mineral contours from the actual upper-chest image replace the sparse hand-drawn vein skeleton. The gray field fades into plain white, with navy/gold seam trim.');
}
for(const variant of ['home','away']){
  const c=previous('Panetolikos',variant),h=variant==='home';c.layers=c.layers.filter(l=>l.d?.startsWith('M49')||l.d?.startsWith('M151'));
  const t=await ink('Panetolikos',variant,{box:h?[326,565,270,515]:[355,560,273,508],mode:'dark',threshold:h?5:7,width:260,blur:7});
  c.layers.push(...placeTrace(t,{x:70,y:84,width:62,height:111,color:h?'#D6A31B':'#132F54',opacity:.8}));
  const head=await ink('Panetolikos',variant,{box:h?[361,248,175,88]:[399,246,173,88],mode:'dark',threshold:h?5:7,width:160,blur:6});
  c.layers.push(...placeTrace(head,{x:81,y:27,width:39,height:29,color:h?'#D6A31B':'#132F54',opacity:.8}));
  add('Panetolikos',variant,c,`${h?'Yellow/blue':'Blue/gold'} kit with source-derived hatched Titormos head and lower-body contours. Vertical Greek lettering, chest logos, sponsor and badge are omitted.`, 'The central Titormos figure is interrupted where the sponsor hides its torso; this partial trace must remain a draft.');
}
