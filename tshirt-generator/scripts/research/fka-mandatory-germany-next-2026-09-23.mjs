import {saveProfiles} from './fka-save-profiles.mjs';
import {base,neck,cuffs,shoulderBands,path,rect,poly} from './png-paint-helpers.mjs';

// Source-specific geometry measured from the saved front views, not team presets.
const profiles=[];
const add=(name,variant,make,observations)=>profiles.push({country:'Germany',name,variant,make,observations});
const gradient=(a,b,y1=0,y2=200)=>({type:'linearGradient',x1:0,y1,x2:0,y2,stops:[{offset:0,color:a},{offset:1,color:b}]});
const underarms=(c,color)=>c.layers.push(path('M46 59L53 75L49 86L40 80Z',color,'leftSleeve'),path('M154 59L147 75L151 86L160 80Z',color,'rightSleeve'));

add('Bayer Leverkusen','home',()=>{
  const c=base('#1D2022');
  for(const [x,w] of [[70,19],[112,19]])c.layers.push(poly([[x+4,23],[x+w-2,23],[x+w+1,197],[x-7,197]],'#B8203A','body'));
  c.layers.push(rect(0,66,200,30,'#1D2022','body'));
  c.layers.push(path('M26 34L47 26L54 80L47 88L20 80Z','#B8203A','leftSleeve'),path('M174 34L153 26L146 80L153 88L180 80Z','#B8203A','rightSleeve'));
  for(const [start,end] of [[63,90],[114,139]]){
    let d='';
    for(let row=0;row<15;row++)for(let x=start+(row%2)*2.2;x<end;x+=4.4){
      const y=128+row*4.8,s=.22+row*.082;
      // Widening crosses fill the lower red panels; each is kept inside its column.
      if(x<100&&(x-s*1.5<74-(y-23)*11/174||x+s*1.5>87+(y-23)*3/174))continue;
      if(x>100&&(x-s*1.5<116-(y-23)*11/174||x+s*1.5>129+(y-23)*3/174))continue;
      d+=`M${x-s/2} ${y-s*1.5}h${s}v${s}h${s}v${s}h-${s}v${s}h-${s}v-${s}h-${s}v-${s}h${s}Z`;
    }
    c.layers.push(path(d,'#591828','body',.78));
  }
  neck(c,[['#1D2022',3],['#A62036',.5]]);
  return c;
},'Black yoke and central column, two red columns interrupted by a broad black chest band, red inner sleeves and progressively larger dark crosses towards the hem. Source crosses are simplified to their four-arm geometry; colors are image estimates.');

add('Borussia Dortmund','away',()=>{
  const c=base('#262425','#EAEAE6','#EAEAE6');
  // Asymmetric lightning edges traced separately; a repeating sawtooth is inaccurate here.
  for(const points of [
    [[44,19],[83,0],[98,0],[48,35],[57,27],[43,38]],
    [[45,48],[130,4],[153,4],[102,39],[112,41],[80,62],[46,84]],
    [[46,104],[153,56],[153,72],[126,91],[136,94],[111,110],[126,113],[92,136],[106,130],[48,163],[72,145],[64,143],[77,132],[68,130],[81,117],[71,115],[153,74]],
    [[48,179],[135,137],[121,149],[154,133],[154,146],[108,178],[118,180],[94,197],[52,197],[62,184]],
  ])c.layers.push(poly(points,'#383538','body'));
  cuffs(c,[[3.2,'#E8E8E3'],[1.05,'#252425']]);
  neck(c,[['#EAEAE6',1.1],['#272526',2.3]]);
  return c;
},'Charcoal front with individually mapped, unequal diagonal lightning bands and plain sleeves. White cuff stripes have dark terminal edges. White/black source collar colors tint only the existing round ring; no polo flaps or placket.');

add('Mainz 05','home',()=>{
  const c=base('#E42222','#DD2523','#EDEDE8');
  let d='';
  for(let x=48;x<158;x+=13)for(let y=5;y<202;y+=28){
    d+=`M${x} ${y}l6.5 14-6.5 14-6.5-14Z M${x} ${y+.8}l-6.1 13.2 6.1 13.2 6.1-13.2Z`;
  }
  c.layers.push(path(d,'#F45A49','body',.28));
  cuffs(c,[[6,'#F0EFEB']]);
  return c;
},'Red shirt with a fine tonal diamond lattice and broad white sleeve ends. Repeated club initials, numbers and badge motifs inside the diamonds, plus manufacturer shoulder marks, are intentionally omitted as lettering/emblems.');

add('Mainz 05','away',()=>{
  const c=base('#F1F2F0');
  let d='';
  const zones=[[0,34],[47,77],[101,129],[151,181],[182,212]];
  for(let column=0;column<38;column++){
    const x=49+column*2.7,shift=(column<19?column:38-column)*.92;
    for(const [a,b] of zones){const y=a+shift;d+=`M${x} ${y}h.18v${b-a}h-.18Z M${x+.45} ${y+1.5}h.1v${b-a-3}h-.1Z`;}
  }
  c.layers.push(path(d,'#D6DADC','body',.47));
  underarms(c,'#C51819');
  c.layers.push(path('M49 168L51 163L50 183L49 187Z','#C51819','body'),path('M151 168L149 163L150 183L151 187Z','#C51819','body'));
  neck(c,[['#F1F2F0',3],['#C71E21',.6]]);
  return c;
},'White torso with fine gray vertical ribs grouped into broken zigzag-height fields, plain sleeves, red underarm inserts and small lower side tabs. Red/white neck colors stay on the original ring; source shoulder brand dots omitted.');

add('Schalke 04','home',()=>{
  const c=base('#173E7B','#244984','#244984');
  c.layers.push(rect(48,0,104,197,gradient('#143666','#22518B'),'body'));
  for(let column=0;column<5;column++){
    const x=48+column*21;
    c.layers.push(poly([[x,23],[x+21,23],[x+10.5,64]],gradient('#173B70','#4066AC',23,64),'body'));
    for(let row=0;row<6;row++){
      const y=64+row*23;
      if((column+row)%2===0)c.layers.push(rect(x,y,21,23,gradient('#36599A','#1C427D',y,y+23),'body'));
    }
  }
  for(const [x,mirror] of [[47,false],[153,true]])for(const y of [64,110,156,194])c.layers.push(poly([[x,y-4],[x+(mirror?-10:10),y],[x,y+4]],'#486BB0','body',.75));
  shoulderBands(c,'#71A5D6',{count:2,width:1.5,gap:1.1,end:36,inset:2.5});
  cuffs(c,[[3,'#2A4D90']]);
  return c;
},'Blue shirt with tall triangular tonal panels above the chest, alternating shaded rectangular blocks below, and pointed side ends. Two light blue shoulder tapes follow the PNG shoulder seam; tonal block gradients preserve the source layout without copying fabric lighting.');

add('TSG Hoffenheim','home',()=>{
  const c=base('#1B60A6','#193552','#183452');
  c.colors.leftSleeve=c.colors.rightSleeve='#ECEFEE';
  for(let column=0;column<12;column++){
    const x=49+column*8.6,color=column%2?'#3577B6':'#174F90';
    c.layers.push(rect(x,14,.35,184,color,'body'));
    let d='';
    for(let row=-1;row<12;row++){
      const y=25+row*16+(column%2)*8;
      // The source's decorative forked branches, not the separately omitted badges.
      d+=`M${x+2} ${y}h.8v3l2.6 2.4v1l-2.6-2.3v1.8l2.6 2.4v1l-2.6-2.3v5.2l-2 2.1v-1.2l1.2-1.3V${y+3.8}l-1.6-1.5v-1.1L${x+2} ${y+2.7}Z`;
    }
    c.layers.push(path(d,color,'body',.8));
  }
  c.layers.push(path('M28 20L76 3L75 15Q60 20 44 26L37 44Z','#ECEFEE'),path('M172 20L124 3L125 15Q140 20 156 26L163 44Z','#ECEFEE'));
  neck(c,[['#E9ECE8',.4],['#1C3558',2.6],['#E9ECE8',.5]]);
  cuffs(c,[[5,'#1C3558'],[1.1,'#E6EBEB'],[.4,'#2767A4']]);
  return c;
},'Blue torso with alternating narrow blue pinlines and staggered forked branch motifs, white sleeves and white raglan shoulder inserts. Navy collar/cuffs carry fine pale edges. The geometric branch field is adapted from the front reference; emblems and sponsor marks omitted.');

add('TSG Hoffenheim','away',()=>{
  const c=base('#E9E5DA','#252B3D','#252B3D');
  // Unequal pale, shallow oblique brush fields observed across body and sleeves.
  for(const [y,depth,slope] of [[19,9,12],[42,8,15],[76,6,13],[104,12,10],[130,9,14],[154,11,14],[180,7,12]]){
    for(let line=0;line<8;line++){
      const top=y+line*depth/8;
      c.layers.push(poly([[18,top],[183,top+slope],[176,top+slope+.55],[23,top+.45]],'#F4F1E8','all',.45+(line%3)*.12));
    }
  }
  c.layers.push(path('M76 4Q61 16 44 20Q38 25 39 47L38.5 46Q37 25 43 19Q61 15 75.5 3Z','#252B3D'),path('M124 4Q139 16 156 20Q162 25 161 47L161.5 46Q163 25 157 19Q139 15 124.5 3Z','#252B3D'));
  neck(c,[['#252B3D',2.6],['#EFEADF',.6]]);
  cuffs(c,[[3.4,'#252B3D'],[.7,'#EFEADF']]);
  return c;
},'Warm ivory shirt with low-contrast oblique pale brush bands across torso and sleeves, fine dark raglan piping and navy/ivory neck and cuff edges. Brush microtexture is simplified; the observed band directions and unequal spacing are retained.');

add('Werder Bremen','home',()=>{
  const c=base('#EDF0EB','#086B46','#078054');
  c.colors.leftSleeve=c.colors.rightSleeve='#087C52';
  c.layers.push(path('M29 21L78 2L77 15Q64 14 45 39Z','#087C52'),path('M171 21L122 2L123 15Q136 14 155 39Z','#087C52'));
  for(const x of [67,113]){
    c.layers.push(rect(x,0,20,197,'#088457','body'));
    let d='';
    for(let row=0;row<23;row++)for(let col=0;col<3;col++){
      const xx=x+col*6.6,y=row*9;
      d+=`M${xx} ${y}l3.2 4.6 3.2-4.6v3l-3.2 4.6-3.2-4.6Z`;
    }
    c.layers.push(path(d,'#319266','body',.25));
  }
  c.layers.push(rect(0,75,200,21,'#EDF0EB','body'));
  neck(c,[['#F0F0E6',.55],['#086B46',2.8],['#E0E8CE',.45]]);
  // Pale chevrons follow the sewn round collar; the manufacturer shoulder marks are absent.
  let d='';
  for(let x=73;x<128;x+=2.6){const y=6+15.5*Math.sqrt(Math.max(0,1-((x-100)/29)**2));d+=`M${x} ${y-.5}l1.1 .35-.5 1.3-.65-.15.35-.85-.7-.25Z`;}
  c.collar.layers.splice(-1,0,path(d,'#E3E9D6'));
  return c;
},'White front with two green columns, a clear white horizontal chest gap and smaller, closely spaced tonal chevrons within each column. Green raglan shoulders/sleeves and pale chevron trim mapped onto the existing round collar; no shoulder manufacturer marks.');

add('Werder Bremen','away',()=>{
  const c=base('#103B30','#123F32','#123F32');
  for(let x=13;x<189;x+=1.4)c.layers.push(rect(x,0,.17,200,'#234B3D','all',.55));
  cuffs(c,[[3.1,'#123F32'],[.4,'#E6E0C6']]);
  let orange='',cream='';
  for(let x=11;x<49;x+=4.3){
    const y=76.6+(x-12)*.235-2.8;
    for(const mirror of [false,true]){
      const points=[[x,y+2.1],[x+2.15,y+.45],[x+4.3,y+2.9]],p=points.map(([xx,yy])=>[mirror?200-xx:xx,yy]);
      orange+=`M${p[0]}L${p[1]}L${p[2]}Z`;
      const q=[[x,y+2.2],[x+2.15,y+3.8],[x+4.3,y+3]].map(([xx,yy])=>[mirror?200-xx:xx,yy]);
      cream+=`M${q[0]}L${q[1]}L${q[2]}Z`;
    }
  }
  c.detailLayers.push(path(orange,'#E48139'),path(cream,'#E0DEC8'));
  let o='',w='';
  for(let i=0;i<24;i++){
    const a=Math.PI*(i+.1)/24,b=Math.PI*(i+1)/24,m=(a+b)/2;
    const point=(angle,rx,ry)=>[100-rx*Math.cos(angle),5+ry*Math.sin(angle)];
    o+=`M${point(a,29,20)}L${point(m,27,17.8)}L${point(b,29,20)}Z`;
    w+=`M${point(a,26.5,17.3)}L${point(m,28.5,19.5)}L${point(b,26.5,17.3)}Z`;
  }
  c.collar.layers.splice(-1,0,path(o,'#E48139'),path(w,'#E0DEC8'));
  return c;
},'Deep green shirt with fine tonal vertical ribs and orange/cream opposing triangle trim at sleeve ends and neckline. The triangular trim follows the original PNG seams, with the source V-neck shape and manufacturer shoulder chevrons omitted.');

const pending=new Map([
  ['Borussia Dortmund:away','Refine diagonal lightning edge positions and widths; the current comparison remains too angular.'],
  ['TSG Hoffenheim:away','Trace the irregular pale brush microtexture; straight bands alone do not reproduce the source field.'],
]);
for(const p of profiles)p.remaining=pending.get(`${p.name}:${p.variant}`);
await saveProfiles(profiles,'mandatory-germany-next-2026-09-23',{reviewed:process.argv.includes('--reviewed')?profiles.map(p=>`${p.name}:${p.variant}`).filter(k=>!pending.has(k)):[]});
