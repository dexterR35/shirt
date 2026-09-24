import {previous,base,path,poly,rect,neck,cuffs,add,ink,grad,line,mapped} from './shared.mjs';
{
  const c=await previous('Rennes','home');c.layers=[];const col='#B61828';
  const draw=(p,w=.26,clip='body')=>c.layers.push(line(p,col,w,clip,.6));
  // Full front map: large timber frames, diagonal braces and two central windows.
  for(const x of [49,66,68,81,83,113,115,129,132,150])draw([[x,17],[x,199]],.35);
  for(const y of [30,34,42,104,106,129,132,160,164,176,180,197])draw([[48,y],[152,y]],.36);
  for(const x of [50,68,115,133]){
    const w=x===68||x===115?12:15;
    for(let y=40;y<98;y+=14){draw([[x,y],[x+w/2,y+17],[x+w,y]]);draw([[x+2,y],[x+w/2,y+12],[x+w-2,y]]);}
    for(let xx=x+2;xx<x+w;xx+=2.3)draw([[xx,107],[xx,129]],.18);
    draw([[x,133],[x+w,160],[x,160],[x+w,133]],.4);
    for(let y=179;y<198;y+=6)draw([[x,y],[x+w,y+7]],.25);
  }
  for(const x of [85,100]){
    for(let inset=0;inset<3;inset++)draw([[x+inset,134+inset],[x+12-inset,134+inset],[x+12-inset,158-inset],[x+inset,158-inset],[x+inset,134+inset]],.3);
    draw([[x+6,137],[x+6,155]]);draw([[x+2,143],[x+10,143]]);draw([[x+2,150],[x+10,150]]);
  }
  for(const y of [34,164])for(let x=49;x<150;x+=13)draw([[x,y],[x+13,y+8],[x,y+8],[x+13,y]],.25);
  for(const y0 of [44,179])for(let row=0;row<3;row++)for(let x=85;x<111;x+=6)draw([[x,y0+row*6],[x+3,y0+row*6+5],[x+6,y0+row*6],[x+3,y0+row*6-5],[x,y0+row*6]],.22);
  for(const side of ['leftSleeve','rightSleeve'])for(let y=15;y<84;y+=15){for(let x=12;x<188;x+=14)draw([[x,y],[x+7,y+12],[x+14,y]],.3,side);draw([[0,y+12],[200,y+12]],.4,side);}
  add('Rennes','France','home',c,'Full tonal timber-frame architecture remapped: paired framed windows, herringbone side columns, cross-braced horizontal beams and sleeve continuation. Fine line spacing simplified, logo-covered center continued with the observed panel structure. Black cuffs and existing round ring retained.');
}
{
  const c=await previous('Troyes','home');c.layers=c.layers.filter(l=>l.clip==='leftSleeve'||l.clip==='rightSleeve');
  c.layers.push(...await ink('Troyes','home',{box:[504,885,407,359],width:260,mode:'dark',threshold:3.5,blur:13},{x:63,y:68,width:78,height:36,color:'#1C4D85',opacity:.55}));
  c.layers.push(...await ink('Troyes','home',{box:[357,202,711,1265],width:380,mode:'dark',threshold:3.5,blur:13,close:1,exclude:[[367,262,225,75],[445,401,115,98],[611,390,235,98],[888,235,102,98],[876,382,116,149],[479,594,531,180],[390,1314,78,100],[1007,1315,61,87]]},{x:48,y:20,width:104,height:177,color:'#1C4D85',opacity:.75}));
  // Continue observed hooked bar motifs through areas hidden by source sponsors.
  for(const [x,y,a]of [[64,33,0],[88,49,1],[107,53,0],[65,83,1],[112,84,0]]){
    const p=[[x,y],[x+14,y],[x+18,y+6],[x+6,y+6],[x+6,y+20],[x,y+16]];
    c.layers.push(poly(p.map(([xx,yy])=>a?[xx,yy]:[xx+((yy-y)*.3),yy]),'#1C4D85','body',.64));
    c.layers.push(line([[x-2,y+2],[x-2,y+24],[x+18,y+6]],'#193F74',.28,'body',.7));
  }
  add('Troyes','France','home',c,'Complete body print mapped from the full front, replacing repeated lower fragments. Observed hooked facets, outlined triangles and stacked bars remain in their relative positions; small sponsor-covered sections continue those same forms. Plain blue sleeves and white trim retained. Fine halftone simplified.');
}
{
  const c=await previous('Lorient','home');c.layers=[];
  for(let row=-1;row<7;row++)for(let col=0;col<5;col++){
    const x=40+col*25+(row%2)*8,y=12+row*32+(col%2)*13,w=24+(col%3)*3;
    c.layers.push(poly([[x,y],[x+w,y+18],[x,y+31]],grad('#FFC754',c.colors.body,x,y+23,x+w,y+13),'body',.82));
    if((row+col)%3===0)c.layers.push(poly([[x+w-5,y-8],[x+w+4,y-3],[x+w-5,y+3]],grad('#FFC754',c.colors.body,x+w-5,y-3,x+w+4,y-3),'body',.6));
  }
  add('Lorient','France','home',c,'Orange body with independently redrawn gold triangular wedges, staggered columns and alternating slopes from the reference. Each wedge fades into the cloth as observed; photographic gold grain is simplified. Plain orange sleeves and black/white trim retained.');
}
{
  const c=await previous('Lorient','away');
  // Add the missing interlocking inner curls to the individually drawn cluster.
  for(let row=-1;row<8;row++)for(let col=0;col<4;col++){
    const x=18+col*40+(row%2)*20,y=-3+row*27;
    let d='';for(const[cx,cy,r,turn]of [[29,40,10,1.7],[47,62,9,1.6],[62,42,7,1.6],[77,59,8,1.7],[41,24,6,1.6]]){
      const points=[];for(let j=0;j<48;j++){const t=j/47,rr=r*(1-t*.8),a=t*Math.PI*turn*2;points.push([x+(cx+rr*Math.cos(a))*42/110,y+(cy+rr*Math.sin(a))*40/110]);}
      d+=line(points,'#D5C59D',.22).d;
    }c.layers.push(path(d,'#D5C59D','body',.75));
  }
  // More continuous paired curl detail follows the sewn cuff curve.
  for(const right of [false,true]){let d='';for(let j=0;j<11;j++){
    const points=[];for(let i=0;i<25;i++){const t=i/24,a=t*Math.PI*3,r=.6*(1-t*.6),u=.04+j*.086;const x=12+32.5*u+r*Math.cos(a),y=76.6+11*u-2.2+r*Math.sin(a);points.push([right?200-x:x,y]);}d+=line(points,'#E4DFCF',.19).d;
  }c.detailLayers.push(path(d,'#E4DFCF',right?'rightSleeve':'leftSleeve'));}
  add('Lorient','France','away',c,'Connected paisley clusters now include the missing interlocking inner curls and denser ornamental cuff scrollwork. Cluster spacing and scale match the independently inspected source crop on warm ivory. Fine curves remain an adaptation; plain sleeves and original dark round collar retained.');
}
