import {refinementBatch,base,neck,cuffs,rect,path,poly,panels,line,tapes,gradient} from './tier2-refinement-helpers.mjs';
const {scope,add,ink,save}=await refinementBatch('tier2-refine-germany-2026-09-24',['germany']);
function joined(c,lines){let d='',last;for(const l of lines){if(d.length+l.d.length>18000){c.layers.push({...last,d});d='';}d+=l.d;last=l;}if(d)c.layers.push({...last,d});}
for(const r of scope){let c=structuredClone(r.config);c.layers=[];
 if(r.name==='1. FC Kaiserslautern'){
  const cells=[[[8,37],[14,32],[16,21],[25,25],[31,21],[36,29],[30,36],[31,44],[22,47],[16,41],[8,37]],[[16,41],[15,53],[21,59],[28,56],[35,63],[44,60],[46,48],[39,43],[31,44]],[[8,52],[15,53],[13,64],[19,72],[29,69],[28,56]],[[29,69],[35,63],[44,68],[47,78],[35,82],[29,76],[29,69]],[[36,29],[40,23],[49,23],[55,16],[64,18],[67,10],[74,9],[73,17],[63,25],[59,34],[49,36],[46,48]],[[44,60],[48,56],[50,44],[59,34]]];
  for(const p of cells)for(const mirror of [false,true])c.layers.push(line(p.map(([x,y])=>[mirror?200-x:x,y]),'#B34440',.45,'all'));
  add(r,c,'Dark navy body with thin red connected irregular map outlines covering both sleeves and upper raglan, reconstructed from the visible source map geometry. Cream collar/cuffs with fine red edges; no tiled chest graphic.');
 }
 if(r.name==='1. FC Nürnberg'){
  await ink(c,r,{box:[330,240,650,1220],width:600,mode:'dark',threshold:3,blur:9,smooth:.7,repairs:[{target:[380,350,150,115],source:[410,930,150,115]},{target:[795,340,140,145],source:[740,1110,140,145]},{target:[380,520,580,145],source:[360,940,580,145]}]},{x:49,y:9,width:102,height:191,color:'#711F30'});
  for(const [x,clip]of [[0,'leftSleeve'],[151,'rightSleeve']])await ink(c,r,{box:[120,350,190,260],width:250,mode:'dark',threshold:4,blur:8},{x,y:23,width:49,height:62,color:'#711F30',clip});
  tapes(c,'#ECE9E0',3);add(r,c,'Red torso with flowing dark claret diagonal wave stripes and variable-width curved fields mapped from the full source front. Three pale shoulder tapes, pale collar and cuff edges. Obscured branding areas use adjacent unbranded print at matching scale; broad block approximation removed.');
 }
 if(r.name==='Arminia Bielefeld'){
  const lines=[];const mesh=[[[49,8],[88,6],[60,46]],[[88,6],[113,23],[60,46]],[[113,23],[151,10],[145,52]],[[60,46],[113,23],[99,75]],[[113,23],[145,52],[99,75]],[[49,48],[60,46],[61,98]],[[60,46],[99,75],[61,98]],[[99,75],[145,52],[149,109]],[[61,98],[99,75],[96,125]],[[49,104],[61,98],[96,125]],[[96,125],[149,109],[130,155]],[[61,98],[96,125],[49,158]],[[49,158],[96,125],[103,186]],[[96,125],[130,155],[103,186]],[[130,155],[151,158],[149,198]]];
  for(const dx of [0,51])for(const dy of [0,100])for(let i=0;i<mesh.length;i++){const [a,b,z]=mesh[i].map(([x,y])=>[49+(x-49)*.5+dx,y*.5+dy]);for(let t=.04;t<1;t+=.07)lines.push(line([[a[0]+(z[0]-a[0])*t,a[1]+(z[1]-a[1])*t],[b[0]+(z[0]-b[0])*t,b[1]+(z[1]-b[1])*t]],'#4773A0',.22,'body',.6));}joined(c,lines);
  add(r,c,'Royal blue with fine straight parallel lines clipped into irregular triangular facets across the front. The observed changing line direction replaces the broken grain trace; solid blue sleeves, white collar and cuffs with fine dark edging. Tessellation adapted to the common fabric shape.');
 }
 if(r.name==='FC St. Pauli'){
  await ink(c,r,{box:[293,170,520,835],width:520,mode:'inverse',threshold:145,smooth:.7,exclude:[[370,315,105,80],[302,904,52,54],[770,919,43,86]],repairs:[{target:[407,460,288,95],source:[300,553,288,95]},{target:[645,303,88,93],source:[695,221,88,93]}]},{x:49,y:8,width:102,height:192,color:'#48362D'});
  add(r,c,'White with source-mapped jagged brown diagonal slashes, fine branching tips and lower lightning-like strokes. Pale white sleeves and collar; logos removed with local reconstruction of obscured slashes, without copying photographed fabric.');
 }
 if(r.name==='Greuther Fürth'){
  const ls=[];for(let col=0;col<24;col++)for(let row=0;row<20;row++){const x=col*9-4,y=row*11+(col%2)*5.5-10;for(let j=0;j<9;j++)ls.push(line([[x-4,y+j*.7],[x,y+5+j*.7],[x+4,y+j*.7]],'#288F63',.27,'all',.8));}joined(c,ls);
  panels(c,[[49,76],[53,82],[50,101],[48,94]],'#DDE7CE');
  add(r,c,'Deep green with narrow staggered hanging shell/kite cells made of nested fine green V lines across body and sleeves. Cells are taller and narrower than the rejected diamond grid; cream underarm inserts, narrow neck edge and cuffs follow source.');
 }
 if(r.name==='Hertha BSC'){
  c.layers.push(rect(49,0,102,200,gradient([[0,'#152039'],[.42,'#152039'],[.65,'#25588A'],[.84,'#9BC9E9'],[1,'#D0E5F0']]),'body'));
  c.layers.push(path('M49 126Q83 104 151 86L151 108Q91 122 49 163Z',gradient([[0,'#193457'],[.6,'#467FAD'],[1,'#CBE5F4']],0,82,0,164),'body'));
  c.layers.push(path('M49 80Q64 130 151 165L151 183Q73 158 49 100Z',gradient([[0,'#162943'],[.28,'#3B6491'],[.58,'#A6CFEA'],[.74,'#D9ECF6'],[1,'#598EC0']],49,80,151,184),'body'));
  c.layers.push(path('M94 143Q107 162 111 177Q121 193 151 199L151 210H135Q100 178 94 143Z',gradient([[0,'#73ADCF'],[1,'#203653']],90,140,140,205),'body'));
  add(r,c,'Navy upper shirt and sleeves with two broad overlapping pale-blue curved ribbons on the lower torso, soft color transitions and the separate dark curled lower-right wedge. Curves placed from the full front instead of uniform diagonal stripes; thin pale neckline edge.');
 }
 if(r.name==='Karlsruher SC'){
  const ls=[];for(let y=-2;y<200;y+=10)for(let x=49;x<154;x+=8){ls.push(path(`M${x+.6} ${y+.5}H${x+6.7}V${y+6.8}ZM${x+.6} ${y+2.1}L${x+6.4} ${y+8.5}H${x+.6}Z`,'#3370BD','body',.55));}joined(c,ls);
  add(r,c,'Royal-blue torso with dense tonal clipped quadrilateral cells and diagonal cut-outs, at the observed small repeat scale. Solid blue sleeves and the source double pale cuff/neck edging retained. Tiny cell corners simplified on the shared silhouette.');
 }
 if(r.name==='VfL Bochum'&&r.variant==='home'){
  for(let i=0;i<11;i++){const y=-128+i*24;c.layers.push(path(`M49 ${y}Q57 ${y+75} 130 ${y+131}Q142 ${y+121} 151 ${y+109}L151 ${y+111}Q142 ${y+124} 130 ${y+133}Q55 ${y+80} 49 ${y+4}Z`,gradient([[0,'#244B72'],[.5,'#21557D'],[1,'#133049']],49,0,151,200),'body'));}
  neck(c,[['#8FAFE0',3],['#ECEFF0',.55]]);add(r,c,'Navy with gently curved narrow blue diagonal ribbons converging into off-center V points on the right, following the source sweep. Dark sleeves, pale blue collar/cuffs with fine white edges. Ribbons replace the hard uniform zigzag grid.');
 }
 if(r.name==='VfL Bochum'&&r.variant==='away'){
  c.layers.push(rect(49,0,102,200,gradient([[0,'#559CDF'],[.48,'#9BC3E8'],[1,'#E3E0EF']]),'body'));
  for(let x=50;x<152;x+=1.7)c.layers.push(rect(x,0,.55,200,gradient(x<100?[[0,'#599CDB'],[.28,'#70ACE0'],[.7,'#D3D9ED'],[1,'#E8E3EE']]:[[0,'#ABD0F0'],[.6,'#A5C3E5'],[1,'#D9DDED']]),'body'));
  cuffs(c,[[5,'#122B4C'],[4.3,'#609BD3'],[.6,'#102846']]);
  for(const side of ['left','right']){let d='';for(let i=0;i<14;i++){const x=7+i*3.3,y=74+(x-10)*.23,xx=side==='left'?x:200-x;d+=`M${xx} ${y}l2 1-2 2 3 1-1 2-4-1 1-3Z`;}c.detailLayers.push(path(d,'#122C4B',`${side}Sleeve`));}
  neck(c,[['#69A5DE',3.7],['#152F51',.6]]);let d='';for(let i=0;i<31;i++){const a=Math.PI*(.08+i*.028),x=100+29*Math.cos(a),y=4+16*Math.sin(a);d+=`M${x} ${y}l2 1-2 1 2 2-3-1-1-2Z`;}c.collar.layers.push({...path(d,'#15324F'),id:'observed-navy-facets'});
  add(r,c,'Sky-blue front fading into pale lavender, asymmetric fine pinlines with stronger upper-right and lower-left contrast. White sleeves; dark/blue irregular faceted cuff and collar bands replace the plain trim. All collar facets clipped to the existing round fabric ring.');
 }
 if(r.name==='VfL Osnabrück'){
  const ls=[];for(let col=0;col<8;col++)for(let row=-1;row<9;row++){const x=48+col*14,y=row*29-col*6;for(let j=1;j<10;j++){const t=j/10;ls.push(line(col%2?[[x,y+t*27],[x+13,y-6+t*27]]:[[x+t*13,y-t*6],[x+t*13,y+27-t*6]],'#AC97C9',.3,'body',.72));}}joined(c,ls);
  add(r,c,'Purple with staggered parallelogram panels of alternating vertical and rising diagonal fine pale lines. White sleeves and collar, purple cuffs. The tessellation follows the source changing line directions rather than a single vertical grid.');
 }
 if(r.name==='VfL Wolfsburg'){
  const bolts=[[[64,0],[66,12],[73,26],[77,32],[74,45],[78,56],[91,65],[94,81],[99,102],[97,118],[92,132],[79,139],[69,150],[67,156],[72,171],[65,185],[61,200]],[[140,2],[137,15],[132,23],[124,35],[122,48],[117,55],[111,64],[109,77],[101,98],[106,117],[112,130],[119,142],[126,148],[125,161],[130,174],[135,187],[131,200]]];
  function rough(pts){const out=[];for(let i=0;i<pts.length-1;i++){const [x,y]=pts[i],[xx,yy]=pts[i+1],n=Math.ceil(Math.hypot(xx-x,yy-y)/1.2);for(let j=0;j<n;j++){const t=j/n,delta=Math.sin((i*31+j)*2.31)*.65;out.push([x+(xx-x)*t+delta,y+(yy-y)*t]);}}out.push(pts.at(-1));return out;}
  for(const pts of bolts)for(const [w,col,opacity]of [[10,'#619752',.07],[7,'#77B257',.13],[4.5,'#9BCE6E',.2],[1.3,'#A3D673',.95]])c.layers.push(line(rough(pts),col,w,'body',opacity));
  const branches=[[[74,45],[67,43],[62,44],[59,42],[53,44],[49,43]],[[74,25],[69,21],[64,21],[62,18],[59,20],[54,16]],[[91,65],[86,66],[82,70],[77,72]],[[94,81],[93,68],[94,65],[92,61],[94,59],[92,56]],[[79,139],[78,146],[80,151]],[[69,150],[61,153],[58,150],[54,153],[51,152]],[[67,156],[65,171],[60,174],[56,181],[51,180]],[[72,171],[77,178],[80,177],[83,184],[82,187],[87,193]],[[122,48],[127,48],[132,50],[135,47],[138,51],[143,50]],[[117,55],[118,66],[124,65],[127,69],[133,68]],[[112,130],[109,133],[112,144],[115,148]],[[125,161],[128,164],[132,163],[139,174],[140,179]],[[130,174],[138,172],[143,181],[141,188],[147,196]]];
  for(const p of branches)c.layers.push(line(rough(p),'#9BCD75',.23,'body',.9));panels(c,[[49,115],[53,132],[49,149]],'#97D976');
  add(r,c,'Dark green with two source-positioned lime lightning trunks, fine jagged branches and layered flat-color glow. Trunks continue through logo-obscured center using visible endpoints; fine branch placement adapted by hand. Solid dark sleeves and pale lime round neckline, no repeated lightning crop or source photo shading.');
 }
}
await save();
