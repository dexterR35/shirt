import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import sharp from 'sharp';
import {path,rect,neck,cuffs} from './png-paint-helpers.mjs';
import {tracePatch,placeTrace} from './tier1-42/trace.mjs';
import {saveProfiles} from './fka-save-profiles.mjs';
const read=async p=>JSON.parse(await fs.readFile(p,'utf8'));
const batch='tier1-ornaments-2026-09-24',date='2026-09-24',out=`artifacts/footballkitarchive/${batch}`;
await fs.mkdir(out,{recursive:true});
const predecessors=await read('artifacts/footballkitarchive/tier1-42-2026-09-23/manifest.json');
const profiles=[],scope=[],traces=[];
const n=v=>+v.toFixed(3);
async function prior(name){
  const p=predecessors.find(p=>p.name===name&&p.variant==='away');
  if(p?.status!=='draft')throw Error('Expected fixed draft predecessor');
  const k=await read(p.kit);scope.push({name,variant:'away',previous_kit:p.kit,previous_layout:p.layout,reference:p.reference,source_url:k.references[0].page_url,country:k.country_name});
  return structuredClone(k.config);
}
function add(name,c,observations,remaining){profiles.push({name,variant:'away',country:scope.find(s=>s.name===name).country,make:()=>structuredClone(c),observations,remaining});}
function mapped(d,map){return d.replace(/(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)/g,(_,x,y)=>map(+x,+y).map(n).join(' '));}
function gradient(stops,x1,y1,x2,y2){return {type:'linearGradient',x1,y1,x2,y2,stops:stops.map(([offset,color])=>({offset,color}))};}
/** Sample hand-drawn source curves into filled line segments, without raw SVG stroke. */
function stroke(d,fill,width,map,clip='body'){
  const tokens=d.match(/[MCQLZ]|-?\d+(?:\.\d+)?/g),points=[];let i=0,p=[0,0],start;
  const pair=()=>[+tokens[i++],+tokens[i++]];
  while(i<tokens.length){const cmd=tokens[i++];
    if(cmd==='M'){p=pair();start=p;points.push(p);}
    else if(cmd==='L'){p=pair();points.push(p);}
    else if(cmd==='Z'){p=start;points.push(p);}
    else if(cmd==='C'||cmd==='Q'){
      const a=p,b=pair(),c=pair(),e=cmd==='C'?pair():c;
      for(let j=1;j<=20;j++){const t=j/20,u=1-t;points.push([0,1].map(k=>cmd==='C'?u**3*a[k]+3*u*u*t*b[k]+3*u*t*t*c[k]+t**3*e[k]:u*u*a[k]+2*u*t*b[k]+t*t*c[k]));}p=e;
    }else throw Error('Unsupported source curve');
  }
  const q=points.map(([x,y])=>map(x,y));let result='';
  for(let j=1;j<q.length;j++){const [x,y]=q[j-1],[xx,yy]=q[j],length=Math.hypot(xx-x,yy-y);if(!length)continue;const dx=(yy-y)/length*width/2,dy=(x-xx)/length*width/2;result+=`M${n(x+dx)} ${n(y+dy)}L${n(xx+dx)} ${n(yy+dy)}L${n(xx-dx)} ${n(yy-dy)}L${n(x-dx)} ${n(y-dy)}Z`;}
  return path(result,fill,clip);
}
async function trace(name,spec){
  const reference=scope.find(s=>s.name===name).reference,t=await tracePatch({reference,...spec});
  const preview=`${out}/ink-${name.toLowerCase()}-${traces.length+1}.png`;
  const layers=placeTrace(t,{x:0,y:0,width:400,height:400,color:'#242424'});
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="white"/>${layers.map(l=>`<path d="${l.d}" fill="${l.fill}"/>`).join('')}</svg>`;
  await sharp({create:{width:800,height:400,channels:4,background:'white'}}).composite([
    {input:await sharp(reference).extract({left:spec.box[0],top:spec.box[1],width:spec.box[2],height:spec.box[3]}).resize(400,400).png().toBuffer(),left:0,top:0},
    {input:Buffer.from(svg),left:400,top:0}
  ]).png().toFile(preview);
  traces.push({team:name,variant:'away',reference,source_sha256:crypto.createHash('sha256').update(await fs.readFile(reference)).digest('hex'),...spec,preview,ink_pixels:t.ink_pixels,method:'Observed ink contours from an inspected branding-free crop; estimated fill, no reference image embedded.'});
  return t;
}

{
  const c=await prior('Lorient');c.layers=[];c.detailLayers=[];
  for(const k of ['body','leftSleeve','rightSleeve'])c.colors[k]='#F3EFDF';
  neck(c,[['#171E23',3]]);cuffs(c,[[4,'#192027']]);
  // Retain the unsuccessful threshold study for provenance. Its disconnected
  // strokes are not used in the finished drawing: restore the observed loops.
  await trace('Lorient',{box:[229,529,110,110],width:260,mode:'yellow',threshold:26});
  Object.assign(traces.at(-1),{used_in_final:false,rejection:'The threshold breaks the fine source loops into fragments. Final motifs use manually reconstructed connected curves.'});
  const loops=[
    'M21 14C31 13 38 23 36 29C34 38 27 31 27 26C28 23 23 18 21 18',
    'M18 28C22 38 14 41 13 48C10 59 16 61 21 57C28 48 24 34 18 28Z',
    'M44 29C43 17 48 13 52 12C58 13 60 10 60 8C66 7 66 18 60 21C52 22 49 18 44 29Z',
    'M20 60C32 60 43 69 40 75C38 80 30 74 27 70C25 65 22 64 20 60Z',
    'M58 68C52 50 58 39 64 35C76 22 86 32 79 43C76 48 71 48 67 49C60 53 61 59 63 62C69 72 63 80 61 76C59 74 58 69 58 68Z',
    'M80 34C87 41 79 47 78 52C75 58 81 62 84 56C88 51 84 48 85 44',
    'M74 72Q83 62 93 66Q84 66 79 71Z',
    'M46 81Q57 87 53 96Q55 86 46 81Z',
    'M44 81Q49 88 45 94',
    'M15 23Q19 21 21 28'
  ];
  for(let row=-1;row<8;row++)for(let col=0;col<4;col++){
    const x=18+col*40+(row%2)*20,y=-3+row*27,map=(u,v)=>[x+u*42/110,y+v*40/110];
    for(const d of loops)c.layers.push(stroke(d,'#D5C59D',.25,map));
    let rings='';
    for(const [cx,cy,r]of [[38,48,8],[38,48,4.6],[53,33,4.2],[53,33,2],[69,64,4.7],[69,64,2.3]]){
      const [xx,yy]=map(cx,cy),outer=r*42/110,inner=Math.max(.04,outer-.25);
      rings+=`M${n(xx-outer)} ${n(yy)}a${n(outer)} ${n(outer)} 0 1 0 ${n(2*outer)} 0a${n(outer)} ${n(outer)} 0 1 0 -${n(2*outer)} 0M${n(xx-inner)} ${n(yy)}a${n(inner)} ${n(inner)} 0 1 1 ${n(2*inner)} 0a${n(inner)} ${n(inner)} 0 1 1 -${n(2*inner)} 0`;
    }
    c.layers.push(path(rings,'#D5C59D','body'));
  }
  // Tiny paired scroll-eye ornament follows the existing PNG cuff curve.
  const curve=(u,depth)=>{const v=1-u;return [v*v*v*12+3*v*v*u*24+3*v*u*u*36+u*u*u*44.5,v*v*v*76.6+3*v*v*u*81.2+3*v*u*u*86.5+u*u*u*85.6-depth];};
  for(const right of [false,true]){
    let d='';for(let j=0;j<12;j++)for(const [du,depth,r]of [[0,1.15,.56],[.037,2.6,.54]]){
      const [xx,y]=curve(.025+j*.079+du,depth),x=right?200-xx:xx;
      d+=`M${n(x-r)} ${n(y)}a${r} ${r} 0 1 0 ${2*r} 0a${r} ${r} 0 1 0 -${2*r} 0M${n(x-.32)} ${n(y)}a.32 .32 0 1 1 .64 0a.32 .32 0 1 1 -.64 0`;
    }c.detailLayers.push(path(d,'#E4DFCF',right?'rightSleeve':'leftSleeve',.8));
  }
  add('Lorient',c,'Warm ivory body with the observed three-eye paisley cluster redrawn as connected fine loops and nested rings. Staggered diagonal rows replace the broken threshold mask; sleeves stay plain, and small pale eye/scroll details follow the dark cuffs. Only the original round PNG collar is colored.','Inspect complete motif contours and cuff ornament before activation.');
}

{
  const c=await prior('Milan');c.layers=[];
  for(const k of ['body','leftSleeve','rightSleeve'])c.colors[k]='#F7F7F5';
  const map=(x,y)=>[49+(x-335)*102/695,24+(y-240)*173/1240];
  // Individually mapped pale lobes, drawn against the full front reference.
  // Gradients describe the printed feather facets, not the fabric's lighting.
  const fields=[
    ['M315 370C363 356 416 294 456 225L575 219C548 308 483 342 401 363C367 418 353 449 321 465Z',335,255,440,460],
    ['M324 442C387 440 421 392 442 343C430 428 390 529 337 559L323 553Z',335,365,425,560],
    ['M328 557C382 573 414 594 449 646C404 610 377 614 348 605L331 593Z',380,560,370,647],
    ['M453 592C516 524 555 445 565 370C579 438 563 502 527 564C500 586 478 595 453 592Z',540,400,484,605],
    ['M624 436C725 414 769 326 799 235L877 230C866 326 824 408 751 470L670 509Z',775,245,717,506],
    ['M834 532C916 507 1006 400 1042 284L1050 540C1012 566 910 569 834 532Z',975,395,916,573],
    ['M770 758C862 764 959 747 1035 716L1035 802C942 802 848 788 770 758Z',945,740,938,808],
    ['M760 842C847 866 952 855 1036 833L1035 882C954 914 845 886 760 842Z',890,848,933,891],
    ['M693 926C796 879 893 874 1039 899L1035 950C922 918 824 928 756 971Z',804,911,880,967],
    ['M336 1101C441 1072 545 1007 611 965C564 1047 452 1145 335 1208Z',431,1071,461,1170],
    ['M334 1207C424 1197 495 1154 590 1102C548 1160 512 1202 473 1219C418 1243 366 1239 334 1228Z',429,1200,425,1253],
    ['M667 998C779 1021 900 985 954 947C1000 973 1022 977 1036 978L1037 1032C935 1013 865 1040 824 1057C758 1039 714 1019 667 998Z',873,970,871,1058],
    ['M822 1057C880 1090 970 1109 1036 1104L1037 1192C945 1198 885 1152 822 1057Z',934,1076,936,1189],
    ['M750 1159C846 1210 955 1228 1035 1194L1036 1271C947 1318 834 1256 750 1159Z',891,1171,891,1279],
    ['M590 1214C691 1283 807 1336 889 1327C952 1322 1003 1298 1035 1275L1036 1387C886 1441 710 1352 590 1214Z',765,1230,820,1390],
    ['M336 1251C370 1299 435 1306 477 1295C537 1372 587 1415 659 1455C527 1433 410 1346 366 1305C371 1380 425 1442 481 1486L335 1485Z',430,1280,429,1485]
  ];
  c.layers.push(rect(49,100,102,100,gradient([[0,'#F7F7F5'],[.3,'#F1F3F3'],[1,'#DEE4E6']],0,100,0,200),'body',.8));
  for(const [d,x1,y1,x2,y2]of fields){const a=map(x1,y1),b=map(x2,y2);c.layers.push(path(mapped(d,map),gradient([[0,'#DEE3E5'],[.46,'#E5E8E9'],[1,'#F7F7F5']],...a,...b),'body',.5));}
  for(const d of [
    'M335 1208C444 1183 585 1023 696 971C810 921 943 967 1035 885L1035 948C940 1041 879 989 822 1057C737 1169 685 1201 590 1180C504 1256 404 1320 335 1251Z',
    'M822 1057C897 1098 970 1118 1035 1118L1035 1134C927 1132 854 1100 822 1057Z',
    'M750 1159C840 1202 954 1229 1035 1203L1035 1220C916 1260 802 1205 750 1159Z',
    'M590 1214C689 1282 803 1347 898 1336C963 1330 1007 1308 1035 1291L1035 1311C864 1410 690 1328 590 1214Z',
    'M335 1301C387 1359 513 1435 659 1455C509 1447 389 1401 335 1342Z'
  ])c.layers.push(path(mapped(d,map),gradient([[0,'#F7F7F5'],[1,'#F0F3F3']],49,118,151,192),'body'));
  for(const right of [false,true]){
    const side=right?'rightSleeve':'leftSleeve',m=(x,y)=>[right?200-x:x,y];
    for(const d of ['M10 51Q25 48 48 59Q29 59 20 65Z','M11 66Q29 59 49 70Q27 70 13 76Z','M29 25Q42 31 49 45Q36 42 24 42Z'])c.layers.push(path(mapped(d,m),gradient([[0,'#F7F7F5'],[1,'#D8DEE0']],right?190:10,32,right?151:49,76),side,.68));
  }
  add('Milan',c,'White shirt with individually placed overlapping pale feather facets mapped from the full Away front, including the lower cascading lobes and both sleeves. Source red/black/red cuff and round-collar borders are retained; all branding is omitted.','Compare pale facet arrangement, lower overlaps and sleeve continuation at full view.');
}

{
  const c=await prior('Venezia');c.layers=[];
  const map=(x,y)=>[12+(x-80)*176/1120,(y-80)*197/1000];
  const t=await trace('Venezia',{box:[435,686,327,246],width:200,mode:'dark',threshold:2.1,blur:6});
  for(const y of [32,83,134,185])c.layers.push(...placeTrace(t,{x:60,y,width:81,height:51,color:'#D7CBAE',opacity:.19}));
  const outline='M600 235L539 82Q457 81 422 104Q401 118 408 166Q391 140 366 147Q329 158 292 198Q276 218 286 253Q264 229 240 242Q202 260 179 294Q165 316 184 348Q157 326 138 341L83 381L156 466L319 329Q333 315 347 296Q476 250 600 235Z';
  for(const right of [false,true]){
    const transform=(x,y)=>{const p=map(x,y);return [right?200-p[0]:p[0],p[1]];},accent=right?'#279C79':'#F48B49';
    const a=transform(512,100),b=transform(95,410);
    c.layers.push(path(mapped(outline,transform),gradient([[0,'#292D2B'],[.24,'#303732'],[.55,accent],[.91,'#EEE7D6'],[1,'#F3EDDE']],...a,...b)));
    for(const [d,start,end] of [
      ['M408 166Q391 141 366 147Q326 161 291 201Q280 215 285 247L534 122L543 166L346 278L186 388L182 349Q171 329 176 312Q195 277 239 248Q264 230 284 254L408 166Z',[432,145],[160,396]],
      ['M287 251Q264 230 240 242Q202 260 179 294Q168 313 182 347L353 242L365 271L159 430L95 394L137 345Q157 330 182 348Z',[335,226],[102,400]]
    ]){const aa=transform(...start),bb=transform(...end);c.layers.push(path(mapped(d,transform),gradient([[0,'#333B32'],[.3,accent],[.78,'#F1E7D4'],[1,'#F3EDDE']],...aa,...bb)));}
    // Parallel narrow seams stay inside the observed source panel boundary.
    const seam='M599 230Q468 247 344 291Q330 310 315 326L151 461L160 472L324 337Q339 322 352 303Q470 259 601 243Z';
    c.layers.push(path(mapped(seam,transform),'#302C29'));
    c.layers.push(path(mapped('M599 234Q469 251 348 296Q334 315 319 331L155 465L158 468L322 334Q337 319 351 300Q469 255 600 239Z',transform),right?'#EDA16F':'#54B69A'));
    const side='M334 487Q415 687 414 1066L317 1066L326 745L347 733Q316 724 326 617Z';
    const sa=transform(334,490),sb=transform(334,1058);
    c.layers.push(path(mapped(side,transform),gradient([[0,'#30342F'],[.28,accent],[.68,accent],[1,'#F3EDDE']],...sa,...sb),'body'));
    c.layers.push(path(mapped('M334 488Q421 686 421 1066L404 1066Q405 686 328 503Z',transform),'#302D29','body'));
    c.layers.push(path(mapped('M333 499Q413 686 414 1066L409 1066Q409 686 331 507Z',transform),right?'#F79B64':'#3CAB89','body'));
  }
  // The source yoke meets below a V-neck. Join its shoulder panels beneath
  // the existing round collar without painting a second collar construction.
  c.layers.push(path('M87 17L113 17L112 32Q100 30 88 32Z','#292D2B','body'));
  c.layers.push(path('M90 31Q100 29.5 110 31L110 31.7Q100 30.2 90 31.7Z','#C39F74','body'));
  c.layers.push(rect(0,196,200,2,'#302D29','body'));
  add('Venezia',c,'Ivory body with faint source-derived tonal print. Orange left and green right scalloped panels are redrawn in source image coordinates, including layered diagonal fades, curved side insets and thin colored/black seams. The existing PNG ring retains the trim colors without adding a V-neck.','Check scalloped overlap boundaries and side-panel taper against the source.');
}

await fs.writeFile(`data/research/${batch}-scope.json`,JSON.stringify(scope,null,2)+'\n');
await fs.writeFile(`data/research/${batch}-traces.json`,JSON.stringify({batch,date,traces},null,2)+'\n');
const decisions=process.argv.includes('--reviewed')?await read(`data/research/${batch}-review.json`):[];
if(process.argv.includes('--reviewed')&&(decisions.length!==profiles.length||new Set(decisions.map(d=>d.key)).size!==profiles.length))throw Error('Every profile needs its own decision');
for(const d of decisions){const p=profiles.find(p=>p.name+':'+p.variant===d.key);if(!p||!['ready','draft'].includes(d.status)||!d.notes||!d.comparison_path||d.status==='draft'&&!d.remaining)throw Error('Invalid review');await fs.access(d.comparison_path);p.remaining=d.remaining;}
await saveProfiles(profiles,batch,{date,reviewed:decisions.filter(d=>d.status==='ready').map(d=>d.key)});
