import {add,previous,base,neck,cuffs,shoulderBands,sidePiping,path,rect,poly,line,hatch,n,mirror,circle,gradient} from './shared.mjs';

add('Atlético de Madrid','home',()=>{
  const c=base('#F2EEE6','#172F62','#172F62');
  for(const x of [13,47,81,115,149,183]){
    c.layers.push(rect(x,0,17,200,'#C91930'),rect(x+1.7,0,.38,200,'#851B2B'),rect(x+14.5,0,.38,200,'#851B2B'),rect(x+20,0,.42,200,'#C91930'));
    let d='';for(const y of [-4,54,119,180])d+=`M${x+7.5} ${y}v17l-1.6 1.5v3l2.6 1.6 2.6-1.6v-3l-1.6-1.5V${y}h-.4v17.2l1.6 1.5v2.6l-2.2 1.4-2.2-1.4v-2.6l1.6-1.5V${y}Z`;
    c.layers.push(path(d,'#8F1B2B'));
  }cuffs(c,[[4,'#162D60']]);return c;
},'Red/ivory columns continuing on sleeves, narrow red border pinlines and fine elongated fork motifs within red stripes. Source stripe/motif spacing revised; navy collar and cuffs remain on the PNG seams.');

add('Deportivo Alavés','home',()=>{
  const c=base('#F0F2F1','#0A5CB1','#EFF1EF');c.colors.leftSleeve=c.colors.rightSleeve='#085DAF';
  for(const x of [49,84,119]){
    c.layers.push(rect(x,0,16,200,'#096DBA','body'));
    for(let row=0;row<36;row++)c.layers.push(path(`M${x+1} ${row*5.6}h4v2h3v-1h4v3h3v2h-5v-1h-3v1h-4v-3h-2Z`,'#1455A4','body',.55));
  }
  neck(c,[['#075DB0',2.8],['#EDEFEA',.5]]);cuffs(c,[[5,'#EEF1F0'],[.6,'#065AA6']]);return c;
},'White torso with three blue columns containing tonal fragmented print, solid blue sleeves, blue original collar and white sleeve-end bands.', 'Trace the specific city/fragment print inside the blue stripes; the current bounded pattern study is not sufficiently source-specific.');

add('Deportivo Alavés','away',()=>{
  const c=base('#252527','#E8BCCC','#E8BCCC');
  const centers=[[23,26,11,23],[67,17,15,22],[114,20,15,28],[170,37,19,28],[80,65,20,30],[128,99,19,34],[51,134,15,38],[99,157,26,30],[147,183,14,30]];
  for(const [cx,cy,rx,ry]of centers)for(let ring=0;ring<7;ring++){
    const pts=[];for(let i=0;i<=90;i++){const a=i*Math.PI/45,r=1+ring*.14+.12*Math.sin(3*a+cx)+.08*Math.cos(7*a);pts.push([cx+rx*r*Math.cos(a),cy+ry*r*Math.sin(a)]);}
    c.layers.push(line(pts,ring%3===0?'#95828B':'#625D63',ring%3===0?.21:.13,'all',.7));
  }cuffs(c,[[4.3,'#E8BCCC']]);return c;
},'Near-black shirt with pale thin contour-map lines across body and sleeves, pink cuff bands and pink original collar.', 'Resolve overlapping contour groups and match the actual contour topology; current source-color contour study remains a draft.');

add('Elche','away',()=>{
  const c=base('#251241','#321850','#8D4EA1');
  for(let row=-7;row<68;row++){
    let d='';for(let col=0;col<87;col++){
      const x=7+col*2.15,y=row*3.3+6.5*Math.sin(x*.16+row*.012)+2.3*Math.sin(row*.15),r=.57+.11*Math.sin(row*.1+x*.05);
      d+=circle(x,y,r);
    }c.layers.push(path(d,'#AF77BA','all',.8));
  }cuffs(c,[[5,'#8A4B9D']]);return c;
},'Deep purple shirt with closely spaced lavender dots following alternating wave bands across front and sleeves, purple collar and lighter purple cuffs. Gold badge/sponsor marks are omitted.');

add('Espanyol','away',()=>{
  const c=base('#E93430','#1C61A2','#1B5C9E');
  for(let row=-1;row<15;row++)for(let col=0;col<9;col++){
    const x=44+col*13,y=row*15,p=[[x,y+15],[x+6.5,y],[x+13,y+15]];
    c.layers.push(line([...p,p[0]],'#F2664B',.45,'body',.65));
    c.layers.push(line([[x+3,y+15],[x+6.5,y+7],[x+10,y+15]],'#F2664B',.25,'body',.55));
  }
  for(const side of ['leftSleeve','rightSleeve'])for(const [y,color]of [[44,'#EFF0E9'],[53,'#1B5D9B'],[62,'#EFF0E9'],[71,'#1B5D9B']])c.layers.push(rect(0,y,200,9,color,side));
  neck(c,[['#145BA2',1],['#F0F0E9',.7],['#C93434',.8],['#F0F0E9',.7]]);
  shoulderBands(c,'#EEEFEA',{count:1,width:1.8,end:36,inset:3});cuffs(c,[[3,'#195C98']]);return c;
},'Bright red geometric lattice torso with three blue/white lower-sleeve bands, white shoulder arc and blue/white/red neck edging. Kelme paw shoulder marks are omitted as manufacturer branding.');

for(const variant of ['home','away'])add('Getafe',variant,()=>{
  const home=variant==='home',body=home?'#0755AB':'#752334',accent=home?'#276FC0':'#98404B',lineColor=home?'#104789':'#652032';
  const c=base(body,home?'#173249':'#FFFFFF',home?'#173249':'#ECECEF');
  for(let row=0;row<39;row++){
    let d='',facets='';for(let col=0;col<36;col++){
      const x=9+col*5.1,y=9+row*5.05,p=[[x,y],[x+5.1,y],[x+3.5,y+4.7],[x,y+4.7]];
      d+=line([...p,p[0],[x+3.5,y+4.7],[x+1.9,y+1.1],[x+5.1,y]],lineColor,.23,'all').d;
      facets+=`M${n(x)} ${n(y)}l5.1 0-1.6 4.7Z`;
    }c.layers.push(path(facets,accent,'all',.42),path(d,lineColor,'all',.9));
  }
  for(const y of [42,83,122,162])c.layers.push(poly([[44,y],[154,y-13],[154,y-8],[44,y+5]],accent,'body',.22));
  neck(c,home?[[body,2.2],['#243B4B',1]]:[[body,2.8],['#EDEDED',.5]]);cuffs(c,[[5,home?'#233B4F':'#ECECEF']]);return c;
},`${variant==='home'?'Royal blue':'Claret'} independent reference with fine skewed triangular tessellation and subtle oblique tonal bands across front/sleeves. ${variant==='home'?'Dark navy':'White'} cuff edges; collar colors mapped onto the existing round neck.`);

add('Osasuna','home',()=>{
  const c=base('#D80E2B','#213D7B','#213D7B');
  for(let row=0;row<8;row++)for(let col=0;col<6;col++){
    const x=49+col*19,y=18+row*25;
    c.layers.push(path(`M${x} ${y}c-7-12 9-17 11-8c1 5-4 8-7 5c-2-2 0-5 2-4c-2-1-3 1-2 3c3 2 6-1 5-5c-2-6-12-2-8 7l4 6c4 6-4 12-8 7c-3-4 2-7 4-4c-2-1-4 1-2 3c3 3 7-1 4-5Z`,'#ED3A36','body',row<3?.65:.15));
  }neck(c,[['#223D7A',3],['#DC1730',.4]]);cuffs(c,[[4.6,'#223D7A']]);return c;
},'Red front with larger tonal scrolls over the upper chest and faint scroll continuation below, plain red sleeves and navy collar/cuffs.', 'Trace the source scroll contours and upper motif arrangement; current scroll primitives are only a construction study.');

add('Osasuna','away',()=>{
  const c=base('#EAEDE3','#1D2938','#1D2938');
  c.layers.push(path('M36 23Q100 28 164 23L151 68Q100 61 49 68Z','#A3C5CA','body'));
  for(let row=0;row<3;row++)for(let col=0;col<7;col++){
    const x=45+col*18,y=25+row*18;let d='';
    d+=circle(x,y,8)+circle(x,y,7.6);
    // Opposing leaves inside the circular rosettes in the source chest panel.
    for(const p of [[[x,y-6],[x+2,y-1],[x+6,y],[x+1,y+2],[x,y+6],[x-2,y+1],[x-6,y],[x-1,y-2]]])c.layers.push(poly(p,'#D9E5DC','body',.56));
    c.layers.push(line(Array.from({length:33},(_,i)=>[x+8*Math.cos(i*Math.PI/16),y+8*Math.sin(i*Math.PI/16)]),'#D9E5DC',.32,'body',.7));
  }
  cuffs(c,[[3,'#1D2938']]);for(const m of [false,true])for(let x=14;x<46;x+=3.6){const y=74.4+(x-12)*.245;c.detailLayers.push(poly((m?mirror:p=>p)([[x,y],[x+2.1,y+.5],[x+2.1,y+2],[x,y+1.5]]),'#6AAEB8'));}
  return c;
},'Ivory body with a pale blue chest panel of circular leaf rosettes, dark collar and dark cuffs containing pale blue square accents.', 'Source also has faint circular woven motifs over the lower body; those and the exact chest rosette structure need further tracing.');

for(const variant of ['home','away'])add('Rayo Vallecano',variant,()=>{
  const home=variant==='home',body=home?'#F0F0E9':'#C52623',sash=home?'#D51E21':'#ECECE5',edge=home?'#DBB33E':'#1F2021';
  const c=base(body,home?'#D62327':'#26292A','#15191B');c.colors.leftSleeve=c.colors.rightSleeve='#1A1D1F';
  const bolt=[[131,9],[144,21],[137,42],[146,38],[115,89],[112,72],[78,160],[75,139],[60,175],[66,181],[49,187],[48,171]];
  c.layers.push(poly(bolt,sash,'body'),line([...bolt,bolt[0]],edge,1.8,'body'));
  for(const m of [false,true])c.layers.push(path(m?'M125 7Q158 16 158 40L152 34Q145 17 122 13Z':'M75 7Q42 16 42 40L48 34Q55 17 78 13Z',home?'#DDB742':'#E6E5DE'));
  shoulderBands(c,home?'#D8AE39':'#EAEAE3',{count:2,width:1.1,gap:1,end:36,inset:2.5});
  cuffs(c,[[3.2,home?'#D5B13C':'#CB302E'],[1.2,home?'#CF292E':'#171B1C']]);c.layers.push(rect(0,193,200,4,edge,'body'),rect(0,196,200,3,'#C7282A','body'));return c;
},`${variant==='home'?'White/red/gold':'Red/white/black'} lightning sash with three large notches rather than repeated sawteeth, black sleeves, curved contrasting shoulder inserts and cuff/hem borders. The large tonal club crest is deliberately omitted.`);

add('Real Betis','away',()=>{
  const c=base('#0D583C','#174C32','#194E35');
  for(let row=0;row<13;row++)for(let col=0;col<8;col++){
    const x=45+col*15,y=row*16;
    c.layers.push(path(`M${x} ${y}c-7-5-6-12 0-10c4 2 1 6-1 4c3 4 7-3 11-1c7 4 1 10-2 6c5 1 4-5 0-5c-3 0-4 4-7 4c3 3 6 8 3 12c-2 2-5 0-3-2c1 3 3 0 2-2Z`,'#389567','body',.53));
  }c.layers.push(rect(100,0,100,200,'#087C4D','body',.22));neck(c,[['#184C32',3],['#91A66C',.4]]);return c;
},'Dark green shirt with two subtly different front halves, dense light-green scrolling floral ornament and dark green sleeves/trim.', 'The source acanthus/floral shapes need direct tracing; current curls capture color distribution but are not verified ornament.');

add('Real Madrid','away',()=>{
  const c=base('#124547','#16474A','#173F41');
  for(let row=0;row<68;row++){
    let d='';for(let col=0;col<69;col++){
      const x=8+col*2.8+(row%2)*1.4,y=row*3;
      d+=line([[x,y],[x+.75,y+1.2],[x,y+2.4],[x-.75,y+1.2],[x,y]],'#30818A',.23,'all').d;
      d+=`M${n(x-.16)} ${n(y+.6)}h.32v1.2h-.32Z`;
    }c.layers.push(path(d,'#30818A','all',.7));
  }
  shoulderBands(c,'#DAE5D2',{count:2,width:1.15,gap:.85,end:31,inset:2.5});neck(c,[['#DCE6D4',.55],['#18484B',2.4],['#DCE6D4',.55]]);cuffs(c,[[3.8,'#133F41']]);return c;
},'Deep teal shirt with dense tiny turquoise open-diamond knit across front and sleeves, pale shoulder tapes and pale-edged dark neckline. Corrected sleeve ends are dark teal, not the pale cuff bands of the earlier draft.');
