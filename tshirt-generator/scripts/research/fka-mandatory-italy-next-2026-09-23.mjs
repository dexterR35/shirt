import {saveProfiles} from './fka-save-profiles.mjs';
import {base,neck,cuffs,path,rect,poly} from './png-paint-helpers.mjs';

const profiles=[];
const add=(name,variant,make,observations)=>profiles.push({country:'Italy',name,variant,make,observations});
const n=x=>+x.toFixed(3);
const circle=(x,y,r)=>`M${n(x-r)} ${n(y)}a${r} ${r} 0 1 0 ${2*r} 0a${r} ${r} 0 1 0 -${2*r} 0Z`;

add('Atalanta','away',()=>{
  const c=base('#F0F1EF');
  const dark='#192335',blue='#006AC0';
  // Discontinuous geometric ribbon across the upper front and both sleeves.
  const tiles=[
    [dark,[[39,20],[58,9],[86,32],[80,32],[80,29],[69,29],[69,41],[57,45],[45,35]]],
    [blue,[[38,21],[47,18],[69,34],[69,42],[59,42],[47,31],[41,29]]],
    [dark,[[70,42],[80,42],[90,50],[102,43],[102,37],[116,29],[142,46],[135,46],[135,55],[145,65],[134,66],[124,58],[115,58],[104,65],[95,65],[89,61],[89,53],[80,53]]],
    [blue,[[80,42],[90,50],[103,43],[116,38],[124,44],[124,54],[114,53],[103,57],[103,65],[92,56],[89,53],[80,53]]],
    [dark,[[24,29],[30,33],[37,26],[45,39],[44,43],[40,40],[33,47],[28,42],[22,43],[18,37]]],
    [blue,[[21,32],[30,34],[36,28],[38,32],[36,47],[30,42],[29,37],[21,36]]],
    [dark,[[37,47],[45,56],[40,66],[45,70],[42,80],[35,78],[34,68],[31,61]]],
    [blue,[[35,48],[39,51],[40,63],[35,69],[34,64],[33,55]]],
    [dark,[[161,24],[168,32],[161,39],[157,42],[153,36]]],
    [blue,[[168,32],[175,42],[174,45],[168,36]]],
    [dark,[[147,44],[155,40],[161,48],[172,43],[180,52],[174,62],[159,63],[147,68],[143,60]]],
    [blue,[[145,50],[156,46],[161,50],[170,47],[167,54],[155,57],[150,54]]],
  ];
  for(const [color,points] of tiles)c.layers.push(poly(points,color));
  for(const [x,y,w,h] of [[47,23,11,12],[69,29,11,13],[80,48,10,11],[91,37,11,12],[103,43,11,12],[135,45,10,12]])c.layers.push(rect(x,y,w,h,'#F0F1EF'));
  c.layers.push(poly([[89,48],[91,48],[91,45],[102,45],[102,50],[94,55],[89,52]],blue));
  return c;
},'White shirt with an asymmetric interlocking navy/blue ribbon across the upper chest and sleeves, broken by white square cutouts. Each visible ribbon segment is mapped separately; the lower body, collar and cuffs remain white.');

add('Lazio','away',()=>{
  const c=base('#F0F1EE');
  const stripe=(x,y,end,color,width)=>{
    const rise=(end-x)*.39;
    c.layers.push(path(`M${x} ${y}Q${x+(end-x)*.55} ${y+rise*.44} ${end} ${y+rise}L${end} ${y+rise+width}Q${x+(end-x)*.55} ${y+rise*.44+width} ${x} ${y+width}Z`,color,'body'));
  };
  for(const y of [-30,-8,17,43,69,91,114,139,161,185])stripe(45,y,156,'#87B5E5',.48);
  const segments=[[48,4,90],[57,8,122],[132,9,156],[48,22,71],[49,40,83],[84,49,112],[121,52,149],[50,66,120],[126,76,156],[57,86,91],[48,106,106],[100,110,147],[46,129,130],[60,150,95],[111,149,156],[51,177,121],[128,179,156]];
  for(const [x,y,end] of segments)stripe(x,y,end,'#25324B',.22);
  for(let row=0;row<29;row++){const x=[46,55,47,78][row%4],end=[150,128,155,147][row%4];stripe(x,-35+row*8,end,'#C9CDD0',.17);}
  neck(c,[['#F0F1EE',1.5],['#182946',1.2],['#8FB8E7',.65]]);
  cuffs(c,[[2.8,'#1B2B45'],[.85,'#8DB5E3']]);
  return c;
},'White body with fine downward-sloping blue, gray and navy lines of unequal length. Plain white sleeves, navy/pale-blue cuff edges and matching colors on the original round collar. Source photo fold-induced waviness is supplied by the PNG rather than drawn as extra folds.');

add('Monza','away',()=>{
  const c=base('#ECEEEF','#B84152');
  // Small gray dots form broad undulating fields, fading between successive bands.
  for(let row=-4;row<89;row++){
    let d='';
    for(let column=0;column<76;column++){
      const x=10+column*2.4,y=row*2.5+9*Math.sin(x/12+row*.075);
      const strength=.5+.5*Math.cos(row*.22+1.7*Math.sin(x*.075));
      const r=n(.07+.4*strength**2);
      d+=circle(x,y,r);
    }
    c.layers.push(path(d,'#B9C2C7','all',.58));
  }
  return c;
},'Pale gray-white shirt with fine gray dotted wave fields across front and sleeves, burgundy collar color and plain sleeve ends. Dot placement follows the observed undulation and fading density; the source polo collar is represented only by color on the existing sewn ring.');

add('Parma','away',()=>{
  const c=base('#F9D840','#0D3F7B','#0D3F7B');
  const bands=[[43,72],[103,133],[161,188]];
  for(const [a,b] of bands)c.layers.push(rect(0,a,200,b-a,'#07538D','body'));
  for(let row=-1;row<74;row++){
    const y=row*2.9;let yellow='',blue='';
    for(let column=0;column<65;column++){
      const x=6+column*2.95,phase=(x-100)/23,warp=2.3*Math.cos(phase+Math.sin(y/24));
      const yy=y+warp,slant=-.32*Math.sin(phase),points=[[x-.7,yy-.8-slant],[x+.7,yy-.8+slant],[x+.65,yy+.8+slant],[x-.65,yy+.8-slant]];
      const d=`M${points.map(p=>p.map(n).join(' ')).join('L')}Z`;
      if(bands.some(([a,b])=>yy>a+.9&&yy<b-.9))blue+=d;else yellow+=d;
    }
    if(yellow)c.layers.push(path(yellow,'#FFE980','all',.57));
    if(blue)c.layers.push(path(blue,'#2675AB','body',.75));
  }
  // Restore yellow sleeve tile fields where the torso hoops do not extend.
  for(const side of ['leftSleeve','rightSleeve'])for(let row=8;row<30;row++){
    let d='';for(let x=10;x<191;x+=3){const y=row*2.9+2*Math.cos((x-100)/23);d+=`M${x} ${n(y)}h1.4v1.6h-1.4Z`;}
    c.layers.push(path(d,'#FFE980',side,.48));
  }
  cuffs(c,[[5,'#103C76']]);
  return c;
},'Yellow shirt with three broad blue torso hoops, navy collar and sleeve ends. A small warped square mosaic covers both yellow and blue fields; sleeves remain yellow without torso hoops. Tile microgeometry is a vector adaptation of the observed curved rows.');

add('Torino','home',()=>{
  const c=base('#651329','#631A2B');
  // Interlocking octagonal/diamond lattice, assembled from the source's small square stitches.
  for(let row=-1;row<26;row++){
    let d='';
    for(let column=0;column<22;column++){
      const x=9+column*8.6,y=5+row*8.6;
      const points=[[0,2.5],[.6,1.8],[1.3,1.1],[2,.5],[2.8,0],[3.6,.5],[4.3,1.1],[5,1.8],[5.6,2.5],[5.6,3.3],[5,4],[4.3,4.7],[3.6,5.3],[2.8,5.8],[2,5.3],[1.3,4.7],[.6,4],[0,3.3],[6.4,6.4],[7.2,7.2],[6.4,7.2],[7.2,6.4]];
      for(const [dx,dy] of points)d+=`M${n(x+dx)} ${n(y+dy)}h.43v.43h-.43Z`;
    }
    c.layers.push(path(d,'#9C4859','all',.52));
  }
  c.layers.push(path('M33 19L38 17L41 24L37 26Z','#E4DEDC'),path('M167 19L162 17L159 24L163 26Z','#E4DEDC'));
  cuffs(c,[[2.6,'#6A1A2D']]);
  return c;
},'Burgundy shirt with a fine stitched geometric lattice across torso and sleeves, burgundy collar/cuffs and short pale shoulder seam inserts. The octagonal field is rebuilt from small square elements; all club/manufacturer/sponsor marks are removed.');

add('Udinese','away',()=>{
  const c=base('#173F72','#254A77','#234A76');
  for(let row=-1;row<16;row++)for(let column=0;column<7;column++){
    const x=45+column*16.3,y=13+row*13;
    c.layers.push(poly([[x,y+13],[x+8.15,y],[x+8.15,y+8]],'#207BB1','body'));
    c.layers.push(poly([[x+8.15,y],[x+16.3,y+13],[x+8.15,y+8]],'#175E94','body'));
    c.layers.push(poly([[x,y+13],[x+8.15,y+8],[x+16.3,y+13]],'#123F74','body'));
  }
  // Plain blue raglan panels and thin gold piping sit above the geometric torso field.
  for(const [d,color] of [
    ['M28 20L76 3L75 15Q59 20 44 25L37 45Z','#254A77'],
    ['M172 20L124 3L125 15Q141 20 156 25L163 45Z','#254A77'],
    ['M76 14Q59 18 44 24Q39 28 41 53L40.4 54Q38.4 28 43.5 23.4Q59 17.4 75.8 13.4Z','#DACB70'],
    ['M124 14Q141 18 156 24Q161 28 159 53L159.6 54Q161.6 28 156.5 23.4Q141 17.4 124.2 13.4Z','#DACB70'],
  ])c.layers.push(path(d,color));
  c.layers.push(path('M49 78Q54 130 51 197H50.4Q53.4 130 48.4 78Z','#DACB70','body'),path('M151 78Q146 130 149 197H149.6Q146.6 130 151.6 78Z','#DACB70','body'));
  neck(c,[['#DDD07B',.5],['#254A77',2.4],['#E7E9E4',.6]]);
  cuffs(c,[[4.8,'#DADDDC'],[4.25,'#254A77'],[.85,'#DACB70']]);
  return c;
},'Blue torso with repeated faceted three-tone triangular diamonds, plain blue raglan shoulders/sleeves, gold seam piping and gold/white trim. Pattern density follows the saved front reference; the original round collar remains physically unchanged.');

add('Milan','away',()=>{
  const c=base('#EFF0EF','#C5162B','#C5162B');
  const shapes=[
    'M23 20Q55 35 78 2Q70 36 43 43Q31 46 21 43Z',
    'M30 47Q69 39 95 3Q86 43 56 53Q40 61 28 58Z',
    'M39 66Q75 54 104 21Q98 63 65 71Q48 74 39 70Z',
    'M46 97Q81 96 106 82Q129 96 160 86Q157 101 138 103Q115 108 106 94Q93 111 73 109Z',
    'M44 126Q65 112 88 110Q72 135 45 141Z',
    'M57 140Q91 144 109 128Q126 135 155 125Q146 146 112 139Q94 154 72 150Z',
    'M93 151Q120 151 128 133Q135 146 156 148L158 156Q143 158 130 146Q124 161 103 165Z',
    'M45 166Q58 175 78 163Q95 180 133 167Q115 190 82 176Q70 191 47 178Z',
    'M110 172Q133 167 157 166L157 182Q138 189 119 180Z',
    'M46 186Q62 200 85 184Q99 197 115 191Q109 206 84 195L46 202Z',
    'M151 28Q176 30 185 37L185 43Q169 39 153 37Z',
    'M150 49Q164 57 188 50L190 58Q164 64 152 59Z',
    'M14 63Q28 76 44 67L47 73Q31 81 11 73Z',
  ];
  for(const d of shapes)c.layers.push(path(d,'#D5DADE','all',.46));
  neck(c,[['#CC1731',.6],['#202426',2],['#CC1731',.6]]);
  cuffs(c,[[4.3,'#CC1731'],[3.3,'#202426'],[.75,'#CC1731']]);
  return c;
},'White shirt with broad pale feather-like curved facets, red/black/red neck and cuff borders. This draft captures the principal curves, but the feather overlap boundaries still need closer source tracing before release.');

const pending=new Map([
  ['Milan:away','Trace additional feather overlap edges and graduated shading; current flat facets are incomplete.'],
  ['Parma:away','Rebuild the small square field along the source concentric arcs; the current wavy grid is too uniform.'],
  ['Monza:away','Refine the curved dot trajectories and fading zones; the current field is still too regular compared with the source.'],
]);
for(const p of profiles)p.remaining=pending.get(`${p.name}:${p.variant}`);
await saveProfiles(profiles,'mandatory-italy-next-2026-09-23',{reviewed:process.argv.includes('--reviewed')?profiles.map(p=>`${p.name}:${p.variant}`).filter(k=>!pending.has(k)):[]});
