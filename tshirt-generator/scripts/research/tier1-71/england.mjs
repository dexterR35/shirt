import {add,previous,base,neck,cuffs,shoulderBands,sidePiping,path,rect,poly,line,hatch,n,mirror,circle,gradient} from './shared.mjs';

add('Arsenal','away',()=>{
  const c=base('#132942');
  for(let row=-1;row<9;row++)for(let col=0;col<8;col++){
    const x=col*28+(row%2)*14,y=row*26,p=[[x,y],[x+28,y],[x+14,y+27]];
    c.layers.push(poly(p,gradient('#274F76','#102039',0,y,0,y+27)));
    c.layers.push(hatch(p,'#3C6081',.72,.23,0,'all',.75));
    c.layers.push(poly([[x+5,y+5],[x+23,y+5],[x+14,y+21]],gradient('#102139','#1A3858',0,y+5,0,y+21)));
  }
  neck(c,[['#E6C93D',.7],['#CA2638',2],['#E6C93D',.7]]);
  shoulderBands(c,'#DAB63C',{count:2,width:1.05,gap:.8,end:34,inset:2.4});
  cuffs(c,[[4.6,'#D8B93D'],[3.3,'#162A3D'],[2.6,'#D22C3D'],[.6,'#D8B93D']]);return c;
},'Navy front/sleeves with broad ribbed downward chevrons, finer horizontal hatching and nested dark triangles. Gold shoulder tapes and gold/navy/red cuff edges; gold/red neckline follows only the PNG ring.');

add('Aston Villa','away',()=>{
  const c=base('#292B2D');
  for(let row=0;row<5;row++){
    const y=13+row*43;
    for(let x=10;x<192;x+=13){
      c.layers.push(hatch([[x,y],[x+3,y+15],[x,y+27],[x-3,y+15]],'#56565B',.8,.22,-.9,'all',.5));
    }
    for(let k=0;k<6;k++){
      const pts=[];for(let x=8;x<194;x+=.8)pts.push([x,y+33+3.9*Math.sin(x*.48)+k*.43]);
      c.layers.push(line(pts,'#505056',.15,'all',.7));
    }
  }
  neck(c,[['#D7BD6C',1.15],['#692C42',1.2],['#B4CEE2',.85]]);
  shoulderBands(c,'#D9BE6A',{count:2,width:1.15,gap:.8,end:35,inset:2.4});
  cuffs(c,[[5,'#D4B76C'],[2.9,'#6C3042'],[1.2,'#B1CCDF']]);return c;
},'Charcoal shirt with alternating rows of narrow hatched diamonds and fine undulating lines, gold shoulder tape and gold/claret/pale-blue trim. Pattern rows are independently placed from the saved Away reference.');

add('Bournemouth','away',()=>{
  const c=base('#AAAADE','#524382');
  const tiles=[[[19,13],[53,8],[37,41]],[[56,3],[88,23],[49,37]],[[95,17],[126,4],[136,37]],[[136,18],[181,25],[161,49]],[[10,47],[40,42],[33,80]],[[46,42],[78,60],[38,84]],[[86,37],[118,41],[101,80]],[[127,44],[156,62],[122,88]],[[164,50],[189,53],[173,85]],[[48,89],[78,75],[85,113]],[[87,84],[126,91],[114,121]],[[138,79],[153,115],[116,102]],[[47,121],[74,109],[81,143]],[[86,117],[116,135],[79,153]],[[123,116],[152,128],[139,157]],[[50,159],[82,147],[90,181]],[[93,153],[128,161],[106,191]],[[138,158],[155,189],[116,186]],[[47,188],[77,179],[84,211]]];
  for(const [i,p]of tiles.entries()){
    c.layers.push(poly(p,'#7566AF'));
    c.layers.push(hatch(p,'#D1CDF0',1.6,.65,i%2?.85:-.85));
    const center=p.reduce((a,p)=>[a[0]+p[0]/3,a[1]+p[1]/3],[0,0]);
    c.layers.push(poly(p.map(([x,y])=>[center[0]+(x-center[0])*.52,center[1]+(y-center[1])*.52]),'#5C4D94'));
  }
  return c;
},'Lavender shirt with independently placed angled purple triangles, pale hatch lines and smaller solid purple cores across front and sleeves. Irregular tile boundaries replace the previous regular grid.', 'Compare remaining tile joins and hatch directions at full reference resolution; isolated triangles still leave wider gaps than the source.');

add('Chelsea','away',()=>{
  const c=previous('Chelsea','away');c.detailLayers=[];
  cuffs(c,[[3.7,'#DCC735'],[.55,'#161B1B']]);neck(c,[['#171A19',.4],['#DCC735',2.6],['#171A19',.5]]);
  for(const m of [false,true])for(let x=13;x<47;x+=9){
    const y=73.8+(x-12)*.245;
    for(const offset of [0,1.1])c.detailLayers.push(poly((m?mirror:p=>p)([[x,y+offset],[x+3.4,y+offset+.6],[x+5.5,y+offset-1],[x+8.6,y+offset-.45],[x+6,y+offset+1.5],[x+3.5,y+offset+1.05],[x,y+offset+.45]]),'#161B1B'));
  }
  let d='';
  const point=(a,r)=>[100-r*Math.cos(a),5+(r-9)*Math.sin(a)];
  for(let i=0;i<18;i++){
    const a=Math.PI*(i+.15)/18,b=Math.PI*(i+.85)/18,m=(a+b)/2;
    for(const r of [26.7,28.1]){const p=[point(a,r),point(m,r),point(b,r+.6),point(b,r+1),point(m,r+.4),point(a,r+.4)];d+=`M${p.map(p=>p.map(n).join(' ')).join('L')}Z`;}
  }
  c.collar.layers.splice(-1,0,path(d,'#161B1B'));return c;
},'Black ribbed shirt with fine yellow piping and revised stepped black/yellow cuff and collar tape. The continuous stepped ornament is bent along the original ring and sleeve seams; no extra collar construction.');

add('Coventry City','home',()=>{
  const c=base('#EFF0F0','#18283D');
  for(const x of [16,42,69,96,123,150,177]){c.layers.push(rect(x,0,14,200,'#3197CF'));c.layers.push(rect(x+14.4,0,.45,200,'#173D6A'));}
  for(const x of [16,42,69,96,123,150,177])for(let row=0;row<30;row++){
    const y=row*7;
    c.layers.push(path(`M${x+2} ${y+1}l2 1 1-2 3 2 3-1-1 3 2 2-4 1-2-2-3 1Z`,'#137AAF','all',.55));
  }
  return c;
},'White shirt with narrow sky-blue columns and navy separator pinlines continuing onto sleeves, navy collar, blue mottled print within each blue column.', 'Trace the source floral/mottled blue field; the current bounded texture study is not a verified reproduction.');

add('Crystal Palace','away',()=>{
  const c=base('#1F2429');neck(c,[['#1565BD',1],['#C72B3B',1.6],['#1F2429',.6]]);
  c.layers.push(path('M32 20L76 2L75 9Q52 16 35 25Z','#C72B3B'),path('M168 20L124 2L125 9Q148 16 165 25Z','#1266BE'));
  for(const [x,y,angle]of [[55,24,-.7],[81,34,-.5],[108,41,-.6],[133,24,-.7],[60,64,-.4],[93,67,-.6],[130,75,-.4],[66,97,-.4],[96,101,-.5],[129,116,-.7],[69,137,-.2],[95,148,-.5],[124,162,-.6],[32,40,-.8],[165,45,-.7]]){
    const p=[[x,y+12],[x+10,y],[x+7,y+12],[x,y+16]];c.layers.push(hatch(p,'#505B64',.65,.24,angle,'all',.6));
  }
  c.layers.push(poly([[151,122],[143,183],[134,197],[149,169]],'#1465C2','body'),poly([[49,174],[53,193],[49,197]],'#C52A3D','body'));
  cuffs(c,[[3.2,'#1263BB'],[1.4,'#C82A3E']]);return c;
},'Black/charcoal shirt with fine feather-like strokes, red and blue shoulder/neck accents, matching sleeve edges and an asymmetric blue lower side insert.', 'Trace the complete feather field and lower illustrated forms before release; current feather placements are a partial drawing.');

add('Fulham','away',()=>{
  const c=base('#D92335','#ECEEF0','#ECEEF0');
  for(let row=-1;row<9;row++)for(let col=0;col<9;col++)if((row+col)%2===0){
    const x=col*23-4,y=row*24+3,dx=[0,1,-1.5,1.5][(row+9)%4];
    c.layers.push(poly([[x+4,y],[x+23,y],[x+23,y+4],[x+26+dx,y+4],[x+26+dx,y+16],[x+22,y+16],[x+22,y+24],[x+2,y+24],[x+2,y+20],[x-2+dx,y+20],[x-2+dx,y+7],[x+4,y+7]],'#191C21'));
    let d='';for(let i=0;i<16;i++){const xx=x+4+i*1.15;d+=`M${n(xx)} ${y-.55+(i%3)*.15}h.55v1.5h-.55Z`;}
    c.layers.push(path(d,'#191C21'));
  }
  shoulderBands(c,'#ECEEF0',{count:2,width:1.2,gap:.9,end:35,inset:2.5});cuffs(c,[[4.3,'#ECEEF0']]);return c;
},'Red/black checker field with staggered steps, small uneven edge offsets and fine frayed top edges. White shoulder tape, original collar ring and sleeve ends match the independent Away image.');

add('Manchester City','away',()=>{
  const c=base('#222120','#EED297','#EED297');cuffs(c,[[5,'#EED297']]);c.layers.push(rect(0,194,200,6,'#DDBE7F','body'));
  for(let row=0;row<12;row++){
    for(let col=0;col<12;col++){
      let d='';
      const x=8+col*16+(row%2)*8,y=10+row*17;
      const loop=(cx,cy,rx,ry,tilt=0)=>Array.from({length:25},(_,i)=>{const a=i*Math.PI/12,u=rx*Math.cos(a),v=ry*Math.sin(a);return[x+cx+u*Math.cos(tilt)-v*Math.sin(tilt),y+cy+u*Math.sin(tilt)+v*Math.cos(tilt)];});
      for(const p of [loop(0,-2,1.45,1.5),loop(0,2,1.65,4),loop(-4,-.8,3.3,1.15,.2),loop(4,-.8,3.3,1.15,-.2),[[-1,-3.2],[-2.7,-5],[-3.5,-4.9]].map(([a,b])=>[x+a,y+b]),[[1,-3.2],[2.7,-5],[3.5,-4.9]].map(([a,b])=>[x+a,y+b])])d+=line(p,'#3A3831',.16,'all').d;
      for(const s of [-1,1])for(const yy of [0,1.8,3.4])d+=line([[x+s*1.6,y+yy],[x+s*2.5,y+yy+1.3],[x+s*4,y+yy+1.5]],'#3A3831',.16,'all').d;
      for(const yy of [1,2.6,4.1])d+=line([[x-1.25,y+yy],[x+1.25,y+yy]],'#3A3831',.16,'all').d;
      c.layers.push(path(d,'#3F3C33','all',.85));
    }
  }
  c.layers.push(rect(0,194,200,6,'#DDBE7F','body'),path('M49 86Q56 104 53 119L49 132Z','#E8CC8D','body'),path('M151 86Q144 104 147 119L151 132Z','#E8CC8D','body'));return c;
},'Black shirt with staggered fine outlined worker bees: separate antennae, head, two wings, striped abdomen and three pairs of legs. Pale gold neck/cuffs/hem and underarm inserts retained; all branding omitted.');

add('Nottingham Forest','home',()=>{
  const c=base('#C9252F','#D12B32');
  const p=['M35 25Q52 17 68 27L73 20L91 25L95 33L73 39L61 33L46 38Z','M107 18L130 21L139 34L155 30L165 45L143 46L134 40L115 38Z','M49 51L63 46L78 53L95 50L112 64L100 70L80 61L63 64Z','M119 79L138 69L153 77L146 90L131 91Z','M65 111L85 116L90 127L108 133L101 140L86 133L72 136Z','M120 153L137 150L149 159L141 167L125 166Z'];
  for(const d of p)c.layers.push(path(d,'#E13C3C','all',.48));
  shoulderBands(c,'#F0EDE7',{count:2,width:1.4,gap:.9,end:37,inset:2.5});return c;
},'Red shirt with low-contrast irregular camouflage forms concentrated on the upper body and white shoulder tapes.', 'Map the remaining tonal camouflage boundary fragments from the source; the current drawing is intentionally partial.');

add('Nottingham Forest','away',()=>{
  const c=base('#123C3D');
  for(let row=-2;row<11;row++)for(let col=0;col<11;col++){
    const x=col*18-7,y=row*20+col%2*4.8,p=[[x,y+6.2],[x+13.8,y],[x+20.7,y+15.2],[x+5.5,y+21.4]];
    c.layers.push(hatch(p,'#265153',.85,.35,(row+col)%2?.05:1.52));
    c.layers.push(line([...p,p[0]],'#103638',.45,'all'));
  }
  neck(c,[['#D7353B',1.2],['#153B3C',2]]);shoulderBands(c,'#CC303A',{count:2,width:1.4,gap:.9,end:38,inset:2.5});cuffs(c,[[2,'#D03038']]);return c;
},'Deep green shirt with a tessellated field of skewed quadrilaterals, alternating vertical/horizontal fine hatching, red shoulder tapes, sleeve edges and red-edged round neckline.');

add('Tottenham Hotspur','away',()=>{
  const c=base('#101E34');
  const colors=['#C95057','#C4AFA0','#DB794F','#C5B46D','#356BA9'];
  for(let row=0;row<76;row++)for(let col=0;col<6;col++){
    const x=44+col*19+(row%3)*3,y=9+row*2.6;
    if(y<60&&((col+row)%3!==0))continue;
    const len=y<65?10+(col%3)*3:17+(row%4)*4;
    c.layers.push(poly([[x,y],[x+len,y-len*.94],[x+len-2,y-len*.94+2.5],[x+.3,y+.45]],colors[(row+col)%5],'body'));
  }
  return c;
},'Navy shirt with individually tapered orange, red, cream, gold and blue diagonal streaks, sparse above the chest and dense over the lower torso. Sleeves and original collar remain plain navy.');
