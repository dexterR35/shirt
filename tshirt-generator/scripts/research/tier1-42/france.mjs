import {add,previous,base,neck,cuffs,path,rect,poly,line,mirror,gradient,shoulderBands} from './shared.mjs';
import {ink,tileTrace,placeTrace} from './ink.mjs';
{
  const c=previous('Lorient','home');c.layers=[];for(const k of ['body','leftSleeve','rightSleeve'])c.colors[k]='#F2531F';
  for(let row=-1;row<8;row++)for(let col=0;col<4;col++){
    const x=40+col*31+(row%2)*9,y=row*29,p=[[x,y+5],[x+24,y+20],[x+24,y-2],[x+4,y+18]];
    c.layers.push(poly(p,gradient('#F35320','#F8C045',x,y+4,x+22,y+20),'body',.85));
  }
  add('Lorient','home',c,'Orange torso with separate staggered golden angular motifs and directional orange-to-gold fades, replacing continuous stepped columns. Plain orange sleeves and black/white seam trim retained.');
}
{
  const c=previous('Lorient','away');c.layers=[];neck(c,[['#20221F',3]]);
  const t=await ink('Lorient','away',{box:[233,533,99,107],mode:'yellow',threshold:20,width:180,blur:7});
  for(let row=-1;row<8;row++)for(let col=0;col<4;col++)c.layers.push(...placeTrace(t,{x:39+col*31+(row%2)*15.5,y:row*30,width:31,height:30,color:'#CFC09B',opacity:.7,clip:'body'}));
  add('Lorient','away',c,'Pale-gold interlocking rosette contours traced from the source replace generic radial spirals on warm ivory. Plain black original collar and ornamental dark cuffs retained.');
}
{
  const c=previous('Marseille','away');c.layers=[];
  const t=await ink('Marseille','away',{box:[486,858,623,450],mode:'blue',threshold:26,width:390});
  tileTrace(c,t,{width:89,height:64,color:'#4C8A9F',opacity:.75,x:-8,y:3});
  let hatch='';for(let y=0;y<200;y+=.66)hatch+=`M0 ${y.toFixed(3)}h200v.31H0Z`;c.layers.push(path(hatch,'#202B37'));
  add('Marseille','away',c,'Actual blue horizontal hatch islands from the Away camouflage field replace repeated generic polygons. Navy cloth, pale cyan ring and sleeve-end edging retained.');
}
{
  const c=base('#263D60','#294968','#294968');shoulderBands(c,'#A5D4E9',{count:2,width:1.4,gap:1.1,end:35,inset:2.5});
  neck(c,[['#294968',3]]);cuffs(c,[[4.1,'#A6D1E0'],[.4,'#274664']]);
  const curve=(t,z)=>{const u=1-t;return[u**3*12+3*u*u*t*24+3*u*t*t*36+t**3*44.5,u**3*76.6+3*u*u*t*81.2+3*u*t*t*86.5+t**3*85.6-z];};
  for(const reflect of [p=>p,mirror])for(let row=0;row<4;row++){
    const p=[];for(let i=0;i<=90;i++){const t=i/90,z=.65+row*.86+.28*Math.sin(t*38+row*1.8)+.15*Math.sin(t*71);p.push(curve(t,z));}c.detailLayers.push(line(reflect(p),'#24466A',.35,reflect===mirror?'rightSleeve':'leftSleeve'));
  }
  const ring=(t,z)=>{const u=1-t;return[u**3*(130-7*z)+3*u*u*t*(132-5*z)+3*u*t*t*(68+5*z)+t**3*(70+7*z),u**3*(5-3*z)+3*u*u*t*(32-8*z)+3*u*t*t*(32-8*z)+t**3*(5-3*z)];};
  for(let row=0;row<4;row++){const p=[];for(let i=0;i<=90;i++){const t=i/90,z=.15+row*.22+.045*Math.sin(t*56+row*1.4);p.push(ring(t,z));}c.collar.layers.splice(-1,0,line(p,'#B5DCE8',.3,'all'));}
  add('Paris FC','home',c,'Navy shirt with pale-blue shoulder tapes. Continuous irregular blue/white wave ornament now bends along the real cuff curves and the original round collar, replacing clipped disconnected zigzags.');
}
{
  const c=previous('Rennes','home');
  const t=await ink('Rennes','home',{box:[230,209,55,252],mode:'dark',threshold:3.5,width:68,blur:5});
  for(const x of [55,124])for(const y of [10,96])c.layers.push(...placeTrace(t,{x,y,width:19,height:85,color:'#BB202C',clip:'body',opacity:.55}));
  for(const side of ['leftSleeve','rightSleeve'])for(const x of [11,154])c.layers.push(...placeTrace(t,{x,y:19,width:33,height:70,color:'#BB202C',clip:side,opacity:.6}));
  add('Rennes','home',c,'Tonal architectural drawing now includes source-derived small herringbone and beam detail, repeated onto the sleeve fields. Red ground, black round ring and black cuffs retained.','The source central ornamental panels and their exact spacing still differ from the structural drawing; keep the revision as a draft.');
}
{
  const c=previous('Toulouse','away');c.layers=c.layers.filter(l=>l.type==='rect');
  const fields=[['M47 110C65 125 86 101 104 140C120 163 129 165 145 199H47Z',47,113,107,200],['M154 89C128 93 139 128 123 150C112 171 147 176 153 199Z',150,93,125,180]];
  for(const [d,x1,y1,x2,y2]of fields)c.layers.push(path(d,{type:'linearGradient',x1,y1,x2,y2,stops:[{offset:0,color:'#F3B7D0'},{offset:.07,color:'#F96391'},{offset:.15,color:'#DB255E'},{offset:.23,color:'#A14380'},{offset:.38,color:'#612D78'},{offset:.56,color:'#4F296E'},{offset:.7,color:'#AD548F'},{offset:.8,color:'#F15388'},{offset:.9,color:'#714080'},{offset:1,color:'#47235F'}]},'body'));
  add('Toulouse','away',c,'Pale pink pinstriped shirt with corrected broad purple lower-left field and narrower right-side wave, using several pink/magenta/violet gradient transitions. Plain pale sleeves and base ring retained.','The wave edges remain harder than the diffuse source print; layered soft transition geometry still needs refinement.');
}
{
  const c=previous('Troyes','home');c.layers=c.layers.filter(l=>l.clip==='leftSleeve'||l.clip==='rightSleeve');
  const t=await ink('Troyes','home',{box:[444,797,540,550],mode:'dark',threshold:7,width:280});
  for(const y of [-15,92])c.layers.push(...placeTrace(t,{x:48,y,width:104,height:107,color:'#174D8A',opacity:.72}));
  add('Troyes','home',c,'Blue angular field now follows observed hooked facets, thin outlined triangles and stacked bars from the lower-front reference. Plain blue sleeves and white collar/cuff/underarm details retained.','The upper motif placement is a repeated crop and needs a complete source map before activation.');
}
{
  const c=previous('Troyes','away');c.layers=[];
  for(const reflect of [p=>p,mirror])for(let k=0;k<11;k++){
    const p=[];for(let i=0;i<=70;i++){const y=i*200/70,x=42+k*3.1+14*(1-Math.exp(-y/31));p.push([x,y]);}
    c.layers.push(line(reflect(p),k>6?'#D9C5A7':'#CDBB9F',k>6?1.6:.22,'body',k>6?.5:.58));
  }
  neck(c,[['#272C2A',.6],['#EFE6D5',2.6],['#272C2A',.4]]);
  add('Troyes','away',c,'Ivory shirt with two groups of tan lines curving inward from shoulders and then running nearly straight to the hem. Four broader pale-tan bands border each inner group; sleeves stay plain, with fine dark trim.');
}
