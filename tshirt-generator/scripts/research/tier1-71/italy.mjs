import {add,previous,base,neck,cuffs,shoulderBands,sidePiping,path,rect,poly,line,hatch,n,mirror,circle,gradient,network} from './shared.mjs';

add('Cagliari','home',()=>{
  const c=base('#91313A','#92353D','#95363D');c.layers.push(rect(100,0,100,200,'#1B2A44','body'));c.colors.leftSleeve='#1B2A44';c.colors.rightSleeve='#96323A';
  const shifts=[0,4,-3,2,-2,3,-4,1,2,-1,0,3];
  for(let row=0;row<12;row++)for(let col=0;col<5;col++){
    const x=47+col*21.6,y=row*18,a=[x+shifts[row],y],b=[x+21.6+shifts[(row+2)%12],y+1],d=[x+shifts[(row+1)%12],y+18],e=[x+21.6+shifts[(row+3)%12],y+19],m=[x+7+(row%3)*2,y+7+(col%3)*2];
    for(const [i,p]of [[a,b,m],[a,m,d],[b,e,m],[d,m,e]].entries()){
      // Split every crossing facet at the actual straight center seam.
      for(const left of [true,false]){
        const out=[];for(let j=0;j<p.length;j++){
          const a=p[j],b=p[(j+1)%p.length],inside=q=>left?q[0]<=100:q[0]>=100;
          if(inside(a))out.push(a);if(inside(a)!==inside(b))out.push([100,a[1]+(b[1]-a[1])*(100-a[0])/(b[0]-a[0])]);
        }
        if(out.length>2)c.layers.push(poly(out,left?['#A23940','#852C34','#A44145','#91313A'][(i+row)%4]:['#23374F','#152239','#29394E','#1C2A43'][(i+row)%4],'body',.48));
      }
    }
  }
  c.collar.layers.splice(-1,0,rect(100,0,100,40,'#1B2A44'));cuffs(c,[[3.6,'#96333B'],[.8,'#18273D']]);c.colors.rightCuff='#1B2A44';
  shoulderBands(c,'#E6E2DE',{count:1,width:.45,end:26,inset:3});return c;
},'Claret viewer-left and navy viewer-right front with a low-contrast irregular triangular mosaic, reversed sleeve colors, split-color original collar and fine pale shoulder piping. The source polo construction is omitted.');

add('Fiorentina','home',()=>{
  const c=base('#642E99','#5D298C','#EDEBE9');
  const center=[100,102];
  for(const radius of [15,17,20,23,36,38,42,49,52,58,62,79,82,86,96]){
    const p=[[100,102-radius],[100+radius,102],[100,102+radius],[100-radius,102],[100,102-radius]];
    c.layers.push(line(p,'#432174',radius%2?.26:.55,'body',.9));
  }
  for(const radius of [29,45,70,91])for(let edge=0;edge<4;edge++)for(let t=.05;t<1;t+=.1){
    const corners=[[100,102-radius],[100+radius,102],[100,102+radius],[100-radius,102]],a=corners[edge],b=corners[(edge+1)%4],x=a[0]+(b[0]-a[0])*t,y=a[1]+(b[1]-a[1])*t;
    let d='';for(const [dx,dy]of [[-1.7,0],[1.7,0],[0,-1.7],[0,1.7]])d+=line([[x+dx,y+dy-1.2],[x+dx+1.2,y+dy],[x+dx,y+dy+1.2],[x+dx-1.2,y+dy],[x+dx,y+dy-1.2]],'#452277',.23,'body').d;
    c.layers.push(path(d,'#452277','body'));
  }
  neck(c,[['#5A2788',2.5],['#EDEBE9',.6]]);cuffs(c,[[4,'#EDEBE9'],[.45,'#693493']]);return c;
},'Purple torso with a central nested diamond handkerchief pattern, narrow geometric border lines and small four-diamond floral chains; plain purple sleeves and white cuff edges.', 'Add the smallest border ornament and corner fill details; the central geometry is traced but the source ornament remains denser.');

for(const variant of ['home','away'])add('Frosinone',variant,()=>{
  const h=variant==='home',body=h?'#EBC44C':'#E9E6DE',blue=h?'#26649D':'#152534',ink=h?'#CBAE46':'#D5D2CA';const c=base(body,blue,blue);
  const edges=[[[53,45],[53,28],[72,28],[72,42],[90,42],[90,20],[109,20],[109,43],[132,43],[132,29],[146,29],[146,60]],[[48,68],[72,65],[80,75],[111,69],[123,80],[149,73]],[[53,122],[53,101],[72,100],[72,123],[83,123],[83,91],[105,92],[105,125],[126,123],[126,98],[144,98],[144,128]],[[48,157],[72,151],[79,160],[101,153],[127,157],[149,148]],[[59,195],[59,175],[76,171],[77,191],[100,191],[100,165],[120,164],[120,195]]];
  network(c,edges,ink,.22,'all',.4);for(const [x,y]of [[58,34],[97,27],[136,36],[58,107],[89,99],[132,107],[66,178],[108,172]])c.layers.push(rect(x,y,3,7,ink,'body',.3));
  cuffs(c,h?[[4.7,blue]]:[[3.1,'#172633'],[2.2,'#D4B53B'],[.8,'#172633']]);neck(c,h?[[blue,3]]:[[body,1],['#182632',.6],['#D5B641',.6],['#182632',.6]]);
  c.layers.push(poly([[64,11],[53,20],[70,13]],blue),poly([[136,11],[147,20],[130,13]],blue));return c;
},`${variant==='home'?'Yellow/blue':'Off-white/navy/gold'} independently observed kit with a fine tonal illustrated architectural field, shoulder slivers and source-specific trim colors.`, 'The full illustrated field is not yet traced; the saved draft contains only structural outline studies, not a verified scene.');

add('Milan','away',()=>{
  const c=previous('Milan','away');
  for(const l of c.layers)if(l.fill==='#D5DADE'){l.fill=gradient('#EEF0EF','#CAD1D4',0,30,160,195);l.opacity=.55;}
  for(const d of ['M48 85Q66 94 89 72Q82 95 67 98Q58 98 48 92Z','M80 119Q108 111 134 110Q125 120 99 127Q92 129 80 119Z','M105 141Q129 139 150 136L150 143Q129 153 117 145Z','M58 159Q74 155 86 145Q75 168 58 168L48 161Z','M81 179Q105 195 132 180Q119 195 100 195Z'])c.layers.push(path(d,gradient('#F0F1F0','#CBD1D4',0,70,180,210),'body',.45));
  return c;
},'White shirt with revised overlapping pale feather facets and soft printed gradients, red/black/red collar and sleeve borders. Extra secondary overlaps replace the earlier isolated flat bands.', 'Compare the complete feather contours; upper-right feather passages and some lower overlaps still differ from the source.');

add('Monza','away',()=>{
  const c=base('#ECEEEF','#B64152');
  // Dot tracks bend together, with broad blank valleys between concentrated wave crests.
  for(let row=-8;row<95;row++){
    let d='';for(let col=0;col<92;col++){
      const u=6+col*2.1,v=row*2.2,phase=u/13+.58*Math.sin(v/37),x=u+1.5*Math.sin(v/29),y=v+9*Math.sin(phase);
      const envelope=Math.pow(.5+.5*Math.cos(v*.105+1.15*Math.cos(u/19)),1.5),r=.09+.36*envelope;
      d+=circle(x,y,r);
    }c.layers.push(path(d,'#B6C0C5','all',.62));
  }return c;
},'White-gray shirt with small gray dots arranged along curved wave tracks, varying dot sizes and blank valleys; burgundy collar color remains on the original ring.','Dot-field phase and fading zones still need direct geometric tracing; retain as a draft if the source comparison remains visibly different.');

add('Parma','away',()=>{
  const c=base('#F7D641','#103E79','#103E79'),bands=[[43,72],[103,133],[161,188]];
  for(const [a,b]of bands)c.layers.push(rect(0,a,200,b-a,'#07538D','body'));
  for(let repeat=0;repeat<4;repeat++)for(let ring=1;ring<42;ring++){
    const cy=repeat*60-8,r=ring*2.85;let yellow='',blue='';
    for(let a=.04;a<Math.PI;a+=2.8/r){
      const x=100+r*Math.cos(a),y=cy+r*Math.sin(a);if(y<repeat*60||y>repeat*60+60||x<6||x>194)continue;
      const pts=[[-.7,-.8],[.7,-.8],[.7,.8],[-.7,.8]].map(([dx,dy])=>[n(x+dx*Math.sin(a)+dy*Math.cos(a)),n(y-dx*Math.cos(a)+dy*Math.sin(a))]);
      const d=`M${pts.map(p=>p.join(' ')).join('L')}Z`;if(bands.some(([lo,hi])=>y>=lo&&y<=hi))blue+=d;else yellow+=d;
    }
    if(yellow)c.layers.push(path(yellow,'#FFE884','all',.62));if(blue)c.layers.push(path(blue,'#FFE884','all',.62),path(blue,'#2379AF','body',.8));
  }
  cuffs(c,[[5,'#103E79']]);return c;
},'Yellow shirt with three broad blue torso hoops, navy collar/cuffs and small square tiles following concentric arcs. The earlier straight/wavy tile grid is replaced by curved radial rows matching the source mosaic structure.');

for(const variant of ['home','away'])add('Sassuolo',variant,()=>{
  const h=variant==='home',body=h?'#12834D':'#EDF0EB',ink=h?'#0B6760':'#D5DAD5',c=base(body,h?'#1BA457':'#F0F1EA',h?'#1CA45C':'#F0F1EA');
  for(let row=0;row<36;row++)for(let col=0;col<9;col++){
    const x=10+col*21+(row%2)*7,y=row*6;
    c.layers.push(path(`M${x} ${y}l3-2 2 3 3-1 1 3 4-1-1 3-4 1-2-2-2 3-3-2 1-2-3-1Z`,ink,'all',h?.6:.65));
  }
  if(h)for(const x of [22,47,72,97,122,147,172])c.layers.push(rect(x,0,10,200,'#202B29'));
  if(!h){sidePiping(c,'#16895A',1.7);neck(c,[['#EEF0EB',1.2],['#168B5B',.6],['#EEF0EB',1.3]]);}
  cuffs(c,h?[[3,'#179C57']]:[[1.6,'#168B5B'],[.7,'#EDF0EB']]);return c;
},`${variant==='home'?'Green shirt with black columns and darker blue-green organic print':'White shirt with pale gray organic print and fine green trim'}. Source-specific major color layout is saved independently.`, 'Replace the provisional organic fragments with the actual leafy pattern contours; colors and stripe placement alone do not complete this kit.');

add('Venezia','away',()=>{
  const c=base('#F3EDD9','#292925','#252623');
  for(const m of [false,true]){
    const color=m?'#178763':'#F17D3C';
    for(let i=0;i<5;i++){
      const x=29+i*8,y=21-i*3.5,p=[[x-9,y+23],[x,y-8],[x+9,y+4],[x+6,y+24]];
      c.layers.push(poly(m?mirror(p):p,gradient('#28362B',color,m?180:20,10,m?130:70,48)));
    }
    const d=m?'M151 81Q139 120 144 195H153V80Z':'M49 81Q61 120 56 195H47V80Z';
    c.layers.push(path(d,gradient('#25312B',color,0,90,0,153),'body'));
    c.layers.push(line((m?mirror:p=>p)([[74,17],[44,29],[23,67]]),'#282923',2,'all'));
    c.layers.push(line((m?mirror:p=>p)([[74,17],[44,29],[23,67]]),m?'#ED975B':'#40A88A',.6,'all'));
    c.layers.push(path(m?'M150 84Q140 130 145 197H146Q141 130 151 84Z':'M50 84Q60 130 55 197H54Q59 130 49 84Z','#292923','body'));
  }
  neck(c,[['#252723',2.8],['#D39453',.45]]);cuffs(c,[[1.4,'#292923']]);c.layers.push(rect(0,195,200,3,'#292923','body'));return c;
},'Ivory body with orange viewer-left and green viewer-right scalloped gradient shoulder/side panels, thin contrasting piping, black cuff/hem edges and dark collar.','Refine the scalloped fan silhouettes and fade-to-ivory transitions; current panel study does not yet match all source boundaries.');
