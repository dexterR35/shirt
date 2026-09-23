import {add,previous,base,neck,cuffs,shoulderBands,sidePiping,path,rect,poly,line,hatch,n,mirror,circle,gradient,network} from './shared.mjs';

add('Dinamo București','away',()=>{
  const c=previous('Dinamo București','away');
  for(let row=0;row<30;row++)for(let col=0;col<10;col++){
    const x=14+col*19+(row%2)*6,y=row*7;
    c.layers.push(path(`M${x} ${y}l3-1 1 2 3 1-2 3-3-1-2 2-1-3Z`,'#DCD9C3','all',.16));
  }return c;
},'Ivory and pale-cream vertical bands with faint tonal mottling, red/black/red original collar and cuff borders, red underarm details.', 'The source mottled print is too faint for a faithful contour trace from this image; this remains an explicitly provisional texture study.');

add('FC Argeș','home',()=>{
  const c=base('#ECEBEA','#602C88','#602C88');
  c.layers.push(rect(49,0,15,200,'#633189','body'),rect(136,0,15,200,'#633189','body'),poly([[25,20],[43,12],[70,4],[70,17],[48,27],[34,40]],'#633189'),poly([[175,20],[157,12],[130,4],[130,17],[152,27],[166,40]],'#633189'));
  const ink='#D7D8D5';
  for(const y of [38,93,147]){
    network(c,[[[68,y+25],[68,y+9],[79,y+9],[79,y],[97,y],[97,y+7],[114,y+7],[114,y+1],[128,y+1],[128,y+25]],[[67,y+25],[134,y+25]],[[67,y+30],[134,y+30]]],ink,.3,'body',.6);
    for(let x=73;x<131;x+=9)c.layers.push(rect(x,y+14,3,7,ink,'body',.45));
  }cuffs(c,[[6,'#63318B']]);return c;
},'White shirt with broad purple outer torso columns, purple shoulder panels and purple collar/cuffs. A faint architectural/photo field occupies the white center.', 'The photographic architectural illustration still needs a faithful manual vector interpretation; the current outline study does not reproduce the scene.');

add('Oțelul Galați','away',()=>{
  const c=base('#123C53','#173B4F','#153E54');
  for(let row=0;row<48;row++){
    let d='';for(let col=0;col<26;col++){
      const x=47+col*4.2+(row%2)*2.1,y=15+row*3.7;
      const strength=Math.max(Math.exp(-(((y-35)/31)**2)),Math.exp(-(((x-64)/9)**2)),Math.exp(-(((x-138)/9)**2)))*Math.min(1,(194-y)/18);
      if(strength<.12)continue;const r=1.5*strength;
      d+=`M${Array.from({length:6},(_,k)=>[n(x+r*Math.cos(k*Math.PI/3)),n(y+r*Math.sin(k*Math.PI/3))].join(' ')).join('L')}Z`;
    }if(d)c.layers.push(path(d,'#265571','body',.35));
  }
  for(const m of [false,true]){
    const p=[[45,48],[43,66],[46,82],[52,121],[49,132],[44,109],[39,87],[37,71]];
    c.layers.push(poly(m?mirror(p):p,'#E5E8E3'));
    for(let j=0;j<13;j++){const y=60+j*3.8,pts=[[39,y],[48,y+5]];c.layers.push(line(m?mirror(pts):pts,'#A5B1B3',.16,'all',.65));}
    c.layers.push(line(m?mirror([[72,13],[52,22],[45,33],[43,45]]):[[72,13],[52,22],[45,33],[43,45]],'#DAE3E2',.5,'all'));
    c.layers.push(line(m?mirror([[49,132],[52,156],[49,197]]):[[49,132],[52,156],[49,197]],'#E0E5E1',.55,'body'));
  }
  shoulderBands(c,'#E5E9E4',{count:2,width:1.3,gap:.9,end:37,inset:2.5});neck(c,[['#153B50',2.8],['#E4E9E3',.5]]);cuffs(c,[[.7,'#E6E9E4']]);return c;
},'Deep navy-teal body with faded small hexagons concentrated across the chest and lower side columns, pale curved mesh underarm inserts, thin raglan/side piping and two pale shoulder tapes.', 'The saved source is blurred; the pale mesh insert boundaries and fine hexagon scale still need a clearer reference before approval.');

add('Aris','home',()=>{
  const c=base('#F0D414');
  for(const [i,y]of [25,66,108,150,185].entries()){
    c.layers.push(path(`M47 ${y+2}Q100 ${y-2} 153 ${y+1}V${y+19}Q100 ${y+23} 47 ${y+20}Z`,'#1C201B','body'));
    c.layers.push(path(`M47 ${y+3}Q71 ${y+7} 106 ${y+20}L119 ${y+21}Q85 ${y+7} 47 ${y+1}Z`,'#F0D414','body'));
    c.layers.push(path(`M103 ${y-1}Q128 ${y+5} 153 ${y+17}V${y+13}Q139 ${y+4} 120 ${y-1}Z`,'#F0D414','body'));
  }return c;
},'Yellow shirt with five black torso hoops, each split by slender curved yellow slashes, plain yellow sleeves and matching original collar. Hoop spacing and the paired sweeping cuts are redrawn from the source.');

add('Asteras Tripolis','home',()=>{
  const c=base('#E8BD24','#185A98','#185996');
  for(const[x,y,a]of [[50,28,.4],[113,31,-.8],[80,75,.6],[136,113,-.6],[54,144,.3],[97,180,-.4]]){
    const pts=[];for(let i=0;i<22;i++)pts.push([x+i*Math.cos(a),y+i*Math.sin(a)]);c.layers.push(line(pts,'#CCA426',.65,'all',.7));
    for(let j=1;j<10;j++){const xx=x+j*2*Math.cos(a),yy=y+j*2*Math.sin(a);for(const s of [-1,1])c.layers.push(poly([[xx,yy],[xx+8*Math.cos(a+s),yy+8*Math.sin(a+s)],[xx+3*Math.cos(a),yy+3*Math.sin(a)]],'#D0A622','all',.65));}
  }cuffs(c,[[5.4,'#195899']]);return c;
},'Golden-yellow shirt with blue collar/cuffs and a complex tonal tropical/illustrated print extending over the sleeves.', 'The photographed source only partly reveals the artwork; leaf studies do not reproduce the full illustrated field. Needs direct tracing from a clear unobscured front image.');

add('Atromitos','home',()=>{
  const c=base('#E9ECEE','#17395D','#EAEEF0');
  for(const[x,width,color]of [[47,13,'#A6ADB6'],[61,14,'#183E6B'],[82,15,'#A6ADB6'],[104,15,'#183E6B'],[126,13,'#A6ADB6'],[145,15,'#183E6B']])c.layers.push(hatch([[x,0],[x+width,0],[x+width,200],[x,200]],color,.88,.42,.72,'body'));
  neck(c,[['#173856',2.6],['#E2E7E8',.55]]);return c;
},'White front with navy and gray vertical columns made of fine diagonal hatch lines, plain white sleeves and a navy collar with a narrow white border. Manufacturer shoulder blocks are omitted.');

add('Atromitos','away',()=>{
  const c=base('#69B7E0','#EBEFEB','#6BB6DD');
  for(let i=0;i<480;i++){
    const x=29+(i*37%146),y=-5+(i*23%209),strength=Math.max(Math.exp(-(((y-.8*x+20)/30)**2)),Math.exp(-(((y-.8*x-104)/24)**2)));
    if(strength<.12)continue;const len=8+(i*13%33);
    c.layers.push(line([[x,y],[x+len*.88,y+len]],i%3?'#3289BA':'#A0D1E9',.18+(i%4)*.075,'all',strength*.9));
  }return c;
},'Sky-blue shirt with fine diagonal blue scratches concentrated in two broad oblique fields and white color on the existing collar ring. No separate polo flaps or manufacturer blocks.');

add('Kalamata','away',()=>{
  const c=base('#232625','#232524','#222523');
  const grid=[[[42,8],[69,17],[92,5],[122,14],[148,4],[167,22]],[[26,33],[54,36],[82,29],[109,40],[135,32],[159,46],[180,37]],[[22,62],[46,70],[71,56],[97,72],[126,58],[150,81],[177,64]],[[48,94],[75,88],[98,110],[127,90],[155,113]],[[46,132],[68,119],[95,140],[118,120],[153,139]],[[48,162],[79,150],[100,173],[128,155],[153,177]],[[47,200],[71,185],[100,199],[129,188],[153,200]]];
  for(const p of grid)c.layers.push(line(p,'#171B19',.8,'all',.9));
  for(let row=0;row<grid.length-1;row++)for(let col=0;col<grid[row].length;col++){
    const a=grid[row][col],b=grid[row+1][Math.min(col,grid[row+1].length-1)],d=grid[row+1][Math.min(col+1,grid[row+1].length-1)];
    c.layers.push(line([a,b,d,a],'#191D1B',.55,'all',.85));
  }return c;
},'Black shirt with a sparse near-black network of irregular polygon facets, extending over the sleeves, and plain black collar/cuffs.');

add('Kifisia','away',()=>{
  const c=base('#EFF0ED','#29394E','#26374C');
  const roots=[[[48,10],[58,23],[57,33],[73,40],[79,62],[89,72]],[[84,7],[89,25],[85,33],[97,42],[94,58],[107,70]],[[118,8],[115,25],[125,34],[121,47],[131,67]],[[153,14],[144,25],[148,36],[136,43],[141,59]]];
  for(const pts of roots){c.layers.push(line(pts,gradient('#AAB1AF','#F0F1EE',0,8,0,78),.4,'body',.8));for(let i=1;i<pts.length;i++){
    const[x,y]=pts[i];for(const s of [-1,1])c.layers.push(line([[x,y],[x+s*5,y-3],[x+s*9,y+1],[x+s*12,y-3]],gradient('#ACB2AF','#F0F1EE',0,8,0,75),.19,'body',.8));
  }}neck(c,[['#CBB562',.6],['#293A50',2.7]]);cuffs(c,[[4.3,'#25394F'],[1.7,'#CBB362'],[.6,'#283D54']]);return c;
},'White shirt with pale gray branching marble veins fading below the upper chest, navy collar/cuffs and thin gold trim.', 'Complete the fine secondary vein network and its shoulder reach; the current branch trace is sparser than the source.');

add('OFI Crete','away',()=>{
  const c=base('#EDEAE5','#222321','#242423');
  for(const m of [false,true])for(let j=0;j<4;j++){
    const y=92+j*10.4,tip=79+(j%2)*3,p=[[48,y+6],[52,y+4.8],[54,y+5],[57,y+3.5],[59,y+3.8],[63,y+2.5],[65,y+2.9],[69,y+1.3],[tip,y-1.5],[69,y+4.9],[67,y+6.5],[64,y+6.3],[61,y+7.9],[58,y+7.8],[55,y+9.5],[52,y+9.3],[48,y+11.2]];
    c.layers.push(poly(m?mirror(p):p,'#202321','body'));
  }cuffs(c,[[3.4,'#232421']]);return c;
},'Off-white shirt with four rough-edged black claw slashes on each side below the chest, plain sleeves and black original collar/cuff bands. Slash tips and jagged outer edges are drawn individually.');

for(const variant of ['home','away'])add('Panetolikos',variant,()=>{
  const h=variant==='home',body=h?'#F3D019':'#225EA2',ink=h?'#D9AD22':'#193D6C',trim=h?'#134D87':'#E7C531',c=base(body,trim,trim);
  // Only the legible major contours are traced here. Do not fabricate a completed figure.
  const contours=[[[94,27],[85,31],[80,40],[86,46],[98,45],[104,37],[100,30],[94,27]],[[86,51],[80,66],[92,76],[111,74],[121,88],[118,103],[102,99],[94,88],[77,83]],[[78,101],[86,114],[91,139],[85,157],[78,165],[80,179]],[[95,104],[111,116],[119,135],[111,146],[118,164],[108,182]],[[86,64],[107,58],[114,66],[127,65]]];
  for(const pts of contours)c.layers.push(line(pts,ink,1.4,'body',.65));
  c.layers.push(hatch([[80,47],[103,48],[119,68],[122,102],[104,124],[95,157],[82,181],[73,181],[85,147],[85,109],[76,82]],ink,1.1,.35,-.7,'body',.55));
  cuffs(c,[[5.6,trim]]);neck(c,h?[[trim,3]]:[[body,1],['#E5C230',2]]);sidePiping(c,trim,1);return c;
},`${variant==='home'?'Yellow with navy':'Blue with gold'} trim, with an independently observed large tonal central figurative illustration. Repeating vertical Greek lettering and sponsor/crest marks are omitted.`, 'Complete the central figurative illustration from the source. The saved contours are an unfinished drawing study and must not be offered as a verified kit.');

add('PAOK','away',()=>{
  const c=base('#EEF0F0','#222524','#222524');
  for(const x of [54,76,98,120,142]){
    c.layers.push(rect(x,0,.35,200,'#C9D0D2','body',.55),rect(x+1.8,0,.18,200,'#C9D0D2','body',.55));
    for(let row=0;row<8;row++){
      const y=row*26;c.layers.push(poly([[x+3,y],[x+19,y+9],[x+4,y+24]],'#DCE1E2','body',.6),poly([[x+19,y+9],[x+19,y+27],[x+4,y+24]],'#E6E9E9','body'));
    }
  }
  for(const m of [false,true]){const pts=[[74,13],[56,19],[45,33],[44,62],[48,80]];c.layers.push(line(m?mirror(pts):pts,'#222C31',.55,'all'));}
  neck(c,[['#222625',.75],['#EFF0ED',.6],['#232625',1.7]]);cuffs(c,[[4.5,'#242724'],[1.4,'#EAEEEB'],[.65,'#252925']]);return c;
},'White shirt with very pale triangular facets between paired gray vertical pinlines, narrow dark raglan piping and black/white original collar and cuff bands.');
