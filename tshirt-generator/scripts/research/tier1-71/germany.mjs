import {add,previous,base,neck,cuffs,shoulderBands,sidePiping,path,rect,poly,line,hatch,n,mirror,circle,gradient,network} from './shared.mjs';

add('Bayer Leverkusen','away',()=>{
  const c=base('#CDDFE1','#536E7C','#507889');c.colors.leftSleeve=c.colors.rightSleeve='#6E9CB6';
  for(const m of [false,true])for(let group=0;group<5;group++){
    const x=29+group*9,y=25-group*3;
    for(let k=0;k<5;k++){
      const pts=[];for(let i=0;i<=60;i++){const a=i*Math.PI/30,r=6+k*1.7+1.2*Math.sin(a*3+group);pts.push([x+r*Math.cos(a),y+r*.7*Math.sin(a)]);}
      c.layers.push(line(m?mirror(pts):pts,k%2?'#BCD6DA':'#254C71',.4,'all',.85));
    }
  }
  c.layers.push(path('M49 31Q100 17 151 31L151 197H49Z','#CDDFE1','body'));cuffs(c,[[2,'#C7DBDA'],[.8,'#507889']]);return c;
},'Pale ice-blue body with navy/blue mineral-like swirling raglan shoulder and sleeve panels, slate collar and pale cuff edging.', 'The swirling mineral contours require direct tracing; current shoulder contour study is incomplete.');

add('Borussia Dortmund','away',()=>{
  const c=base('#252426','#E7E8E3','#E7E8E3');
  const polygons=[
    [[44,17],[71,7],[61,22],[71,19],[44,38]],
    [[46,53],[132,8],[154,9],[106,37],[116,39],[76,65],[48,86]],
    [[47,106],[155,58],[155,72],[87,110],[97,112],[83,123],[92,125],[70,142],[47,153]],
    [[151,89],[141,101],[151,102],[132,119],[143,120],[124,135],[133,129],[152,119]],
    [[47,174],[139,135],[128,145],[154,135],[154,146],[105,181],[117,183],[101,197],[53,197],[65,184]],
  ];
  for(const p of polygons)c.layers.push(poly(p,'#363438','body'));
  neck(c,[['#E7E8E3',.9],['#252426',2.5]]);cuffs(c,[[3.1,'#E7E8E3'],[1,'#252426']]);return c;
},'Charcoal torso with separately traced unequal diagonal lightning fields, corrected discontinuous sawtooth edges and plain black sleeves. White cuff stripes and black/white color on the sewn neckline; no polo flaps or placket.');

add('Borussia Mönchengladbach','home',()=>{
  const c=base('#F0F2EF','#148A4A');
  for(let row=0;row<100;row++){
    let d='';for(let col=0;col<59;col++){
      const x=47+col*1.8,y=4+row*1.95;
      const xx=x-48,bend=.0018*xx*xx;
      const fields=[[75-.67*xx+bend,5],[137-.6*xx+bend,3],[173-.65*xx+bend,6],[188-.64*xx+bend,2],[210-.6*xx+bend,2.5],[222-.41*xx+bend,4]];
      const strength=Math.max(...fields.map(([a,b])=>Math.exp(-(((y-a)/b)**2))));
      if(strength>.04)d+=circle(x,y,.06+.45*strength);
    }if(d)c.layers.push(path(d,'#6EA48C','body',.57));
  }
  neck(c,[['#128A48',.8],['#1C2923',1],['#1A974E',1.3]]);
  c.layers.push(path('M46 60Q53 75 50 88L43 79Z','#0B9156','leftSleeve'),path('M154 60Q147 75 150 88L157 79Z','#0B9156','rightSleeve'));return c;
},'White shirt with diffuse green halftone sweeps running obliquely across the torso, green/black neck bands and green underarm inserts. The green passages are dot fields with soft density transitions.');

add('FC Augsburg','home',()=>{
  const c=base('#EDE7D9','#6B2730','#225548');
  const veins=[[[43,10],[61,24],[59,44],[72,59],[68,75],[84,91],[77,117],[91,133],[83,157],[91,181],[85,199]],[[93,4],[92,30],[109,49],[101,72],[116,96],[111,122],[127,146],[120,173],[135,195]],[[143,18],[134,39],[146,60],[132,83],[145,105],[133,122],[148,144],[140,164],[149,183]],[[18,36],[32,41],[33,58],[46,72]],[[182,34],[168,45],[174,62],[151,76]],[[50,102],[65,98],[77,117],[94,107],[111,122]],[[58,161],[70,146],[83,157],[101,151],[120,173]],[[68,75],[54,73],[43,62]],[[109,49],[123,53],[134,39]],[[101,72],[86,69],[72,59]],[[91,133],[108,137],[111,122]]];
  for(const [i,points]of veins.entries()){
    c.layers.push(line(points,'#B4A8A0',.22,'all',.65));
    for(let k=1;k<points.length;k++){const [x,y]=points[k];c.layers.push(line([[x,y],[x+(k%2?4:-4),y-6],[x+(k%2?7:-7),y-8]],'#C3B5AA',.12,'all',.65));}
  }
  sidePiping(c,'#7B2D32',1.7);neck(c,[['#245347',.65],['#CBB565',.55],['#7E3035',2]]);cuffs(c,[[4.5,'#275849'],[3.4,'#CDBA72'],[2.3,'#7F3037']]);return c;
},'Warm ivory shirt with thin branching marble veins, claret side edges, and green/gold/claret cuff and neck bands. Vein anchors are individually placed rather than repeating a generic tile.', 'The marble source contains a denser fine branch network; add remaining fine cracks before marking ready.');

add('FC Augsburg','away',()=>{
  const c=base('#087D88','#08717A','#066D78');
  for(let row=0;row<13;row++)for(let col=0;col<11;col++){
    const x=9+col*18+(row%2)*4,y=row*16;
    c.layers.push(path(`M${x} ${y}l4 2 3-5 5 3-1 4 6 3-4 4-4-1-2 4-5-3-4 2-1-5 3-3Z`,'#115C6C','all',.46));
  }neck(c,[['#C6A957',.65],['#0B7680',2.4]]);cuffs(c,[[2.1,'#C5AA57'],[.8,'#086F7B']]);return c;
},'Teal shirt with darker organic mineral print, fine gold neckline/cuff borders and otherwise matching sleeves.', 'Trace the actual irregular mineral texture; the current color/layout study does not reproduce its boundaries.');

add('RB Leipzig','away',()=>{
  const c=base('#DF2024','#142B52','#152B4F');
  const branches=[[[100,25],[84,36],[70,49],[55,56]],[[100,25],[118,34],[135,47],[150,52]],[[71,59],[72,83],[67,105],[61,132],[56,163],[53,195]],[[126,61],[130,87],[135,111],[138,138],[146,171],[151,195]],[[58,45],[70,32],[82,29],[100,25],[117,28],[135,37],[148,46]]];
  for(const points of branches){c.layers.push(line(points,'#E87848',.35,'body',.65));for(let i=1;i<points.length;i++){
    const [x,y]=points[i];for(let k=0;k<4;k++)c.layers.push(line([[x,y+k*2],[x-6,y-7+k*3],[x-9,y-6+k*2],[x,y+k*2],[x+7,y-5+k*3],[x+11,y-4+k*2]],'#EB8050',.2,'body',.55));
  }}
  neck(c,[['#EDC745',.85],['#182C51',1.6],['#EDC745',.6]]);cuffs(c,[[2.6,'#E3C047'],[.9,'#182A4B']]);return c;
},'Red shirt with gold/navy trim and fine golden branching outlines concentrated around the chest and sides.', 'Trace the full source branching figure and chest network; the current line skeleton is incomplete and cannot be treated as verified artwork.');

add('SC Paderborn','home',()=>{
  const c=base('#151718','#246EAA');neck(c,[['#2978B5',2.3],['#171C22',1]]);cuffs(c,[[.8,'#297BB9']]);
  c.layers.push(line([[76,9],[57,17],[35,24]],'#2875B1',.38,'all'),line([[124,9],[143,17],[165,24]],'#2875B1',.38,'all'));return c;
},'Black shirt with blue collar color, thin blue raglan piping and blue sleeve edging. The tonal repeating field is made from club shields, club initials and year numerals; those emblems/lettering are intentionally omitted along with the chest and shoulder branding.');

add('TSG Hoffenheim','away',()=>{
  const c=previous('TSG Hoffenheim','away');c.layers=c.layers.filter(l=>l.type==='path');
  for(let row=0;row<120;row++){
    let d='';const yy=row*1.8;
    for(let col=0;col<25;col++){
      const x=10+col*7.6+(row%3)*1.4,y=yy+col*2.4-29,phase=(row*7+col*11)%13;
      if(phase<4)continue;
      d+=line([[x,y],[x+2+phase*.2,y+1.1],[x+3+phase*.24,y+1.9]],'#F7F4EC',.22+(phase%3)*.1,'all').d;
    }if(d)c.layers.push(path(d,'#F7F4EC','all',.7));
  }
  for(let col=0;col<95;col++){
    let d='';const x=8+col*1.95;for(let row=0;row<28;row++){const y=6+row*7.1+(col%5);if((row+col)%4)d+=`M${n(x)} ${n(y)}h.13v${2+row%3}h-.13Z`;}
    c.layers.push(path(d,'#F4F1E8','all',.55));
  }return c;
},'Warm ivory shirt with dense broken pale brush strokes and tiny vertical weave marks, navy raglan piping and navy/ivory trim. The earlier straight brush bands are replaced by interrupted fine texture matching the source scale.');

add('Union Berlin','home',()=>{
  const c=base('#ED302C','#ED302C','#ED302C');
  for(let row=-1;row<7;row++){
    const y=12+row*33,points=[];
    for(let col=0;col<10;col++){
      const x=46+col*11,shift=4*Math.sin((x-46)/106*Math.PI);points.push([x,y-shift],[x+5.5,y-7-shift],[x+11,y-shift]);
      c.layers.push(rect(x+2,y-shift,2.6,14,'#F1573D','body',.48));
      c.layers.push(rect(x+7,y-shift,2.6,14,'#F1573D','body',.48));
    }
    c.layers.push(line(points,'#F55F42',.6,'body',.58));
    for(let k=0;k<2;k++){
      const pts=[];for(let i=0;i<20;i++){const x=45+i*5.7;pts.push([x,y+17+k*6+(i%2)*5]);}c.layers.push(line(pts,'#F36245',.55,'body',.65));
    }
  }
  shoulderBands(c,'#F0EAE2',{count:2,width:1.4,gap:1,end:36,inset:2.5});neck(c,[['#EA332F',2.7],['#F2EDE7',.45]]);cuffs(c,[[.8,'#F0EBE3']]);return c;
},'Red torso with tonal architectural rows of pointed arches, narrow columns and triangular connecting trusses. Fine pale cuff/neck edges and pale shoulder tapes follow the source; sleeves keep their original PNG construction.');

add('VfB Stuttgart','away',()=>{
  const c=base('#C9162B');
  for(let row=0;row<12;row++)for(let col=0;col<9;col++){
    const x=9+col*21+(row%2)*6,y=row*18;
    c.layers.push(path(`M${x} ${y}q9-9 14-3l-5 5 3 7-5 5-8-1 6-5-3-3 5-4Z`,'#AA1929','all',.48));
  }
  c.layers.push(rect(0,61,200,26,'#F0EEEC','body'));neck(c,[['#EDEBE6',.7],['#C91A2B',2.5],['#EDEBE6',.5]]);cuffs(c,[[.8,'#EEE8E3']]);return c;
},'Red shirt with a pale horizontal chest band, fine pale collar/cuff edging and a darker organic all-over field.', 'The source tonal organic shapes need full contour tracing; current fragment study does not qualify as the finished print.');
