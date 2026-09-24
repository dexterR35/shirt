import {previous,base,path,poly,rect,neck,cuffs,shoulderBands,add,ink,grad,line} from './shared.mjs';
{
  const c=await previous('FC Argeș','home');c.layers=c.layers.filter(l=>l.type==='rect'&&l.width===15||l.type==='polygon');
  c.layers.unshift(...await ink('FC Argeș','home',{box:[218,173,230,548],width:260,mode:'dark',threshold:1.4,blur:10,close:1,exclude:[[218,172,65,84],[306,173,45,62],[375,178,73,88],[214,302,237,73]]},{x:65,y:23,width:71,height:175,color:'#C8CAC7',opacity:.28}));
  c.layers.push(...await ink('FC Argeș','home',{box:[239,577,181,110],width:200,mode:'dark',threshold:1.4,blur:10},{x:67,y:66,width:66,height:24,color:'#C8CAC7',opacity:.22}));
  add('FC Argeș','Romania','home',c,'Pale full-height architectural scene now includes the upper front and lower building placement, between purple side columns. Branding is explicitly masked; the narrow sponsor gap continues a matching architectural section. White sleeves, purple cuff borders and original ring retained. Fine photographic scene detail remains simplified.');
}
{
  const c=base('#20475E','#20475E','#20475E');
  for(let row=0;row<36;row++){let d='';for(let col=0;col<22;col++){
    const x=47+col*5+(row%2)*2.5,y=22+row*4.8,r=2.15;
    d+=`M${x-r} ${y}l${r/2} ${-r*.866}h${r}l${r/2} ${r*.866}l${-r/2} ${r*.866}h${-r}Z`;
  }c.layers.push(path(d,grad('#153B54','#254C63',50,22,150,195),'body',row<15?.55:.3));}
  // The central source field is softer than the side hexagon columns.
  c.layers.push(rect(78,56,44,142,grad('#20475E','#20475E',78,56,122,198),'body',.65));
  for(const right of [false,true]){
    const map=p=>p.map(([x,y])=>[right?200-x:x,y]);
    c.layers.push(poly(map([[47,41],[41,60],[36,81],[44,87],[53,129],[55,108],[50,81]]),'#DCE3E2'));
    let d='';for(let j=0;j<32;j++){const y=49+j*2.1,x=40+(y-49)*.14;d+=line(map([[x,y],[x+7,y+2]]),'#8BA2AA',.16,'all',.5).d;}c.layers.push(path(d,'#8BA2AA','all',.5));
    c.layers.push(line(map([[77,9],[66,15],[58,23],[51,35],[48,44]]),'#DDE5E6',.7,'all'));
    c.layers.push(line(map([[53,124],[54,145],[51,173],[49,198]]),'#DDE5E6',.6,'body'));
  }
  shoulderBands(c,'#E3E9E8',{count:2,width:1.1,gap:.8,inset:4.2,end:45});cuffs(c,[[.8,'#E3E9E8']]);
  add('Oțelul Galați','Romania','away',c,'Live archive detail page confirms 26-27 Away. Tonal navy hexagons rebuilt at source scale with a softer central field; broad pale mesh gussets and fine side/raglan seams now follow the observed underarm-to-waist boundaries. Paired shoulder tapes, cuff edging and the original round ring retained.');
}
{
  const c=await previous('Asteras Tripolis','home');c.layers=[];
  c.layers.push(...await ink('Asteras Tripolis','home',{box:[164,145,389,710],width:360,mode:'dark',threshold:2.7,blur:14,close:1,exclude:[[185,198,91,47],[418,176,90,65],[174,257,353,132]]},{x:48,y:23,width:104,height:175,color:'#D4B125',opacity:.62}));
  // Shoulder/sleeve panels use independently inspected unbranded source areas.
  for(const [x,box,clip]of [[12,[94,185,71,199],'leftSleeve'],[151,[555,162,60,184],'rightSleeve']])c.layers.push(...await ink('Asteras Tripolis','home',{box,width:110,mode:'dark',threshold:3,blur:8,close:1},{x,y:20,width:37,height:63,color:'#D4B125',opacity:.6,clip}));
  c.layers.push(...await ink('Asteras Tripolis','home',{box:[230,464,242,127],width:210,mode:'dark',threshold:3,blur:10,close:1},{x:64,y:53,width:70,height:30,color:'#D4B125',opacity:.57}));
  add('Asteras Tripolis','Greece','home',c,'Full yellow tonal illustration mapped from the model front, replacing one repeated lower fragment. Independent sleeves retain their visible print; removed sponsor space continues observed tonal shapes. Royal-blue cuffs and existing round ring retained. Perspective and fine hatch are simplified to the common base.');
}
for(const v of ['home','away']){
  const home=v==='home',c=await previous('Panetolikos',v),color=home?'#D6A31B':'#143355';c.layers=[];
  const spec=home?{box:[274,247,337,880],width:350,mode:'dark',threshold:4,blur:7,exclude:[[228,346,425,116],[218,233,88,107],[578,227,108,130]]}:{box:[355,245,277,880],width:300,mode:'dark',threshold:5,blur:7,exclude:[[259,338,463,121],[630,210,118,145]]};
  c.layers.push(...await ink('Panetolikos',v,spec,{x:69,y:27,width:65,height:170,color,opacity:.75}));
  // Continue the hatched neck/shoulder contour through the source sponsor.
  const shapes=[[[87,43],[94,42],[101,48],[107,50],[114,54],[119,62],[113,67],[105,65],[97,58],[91,60],[84,57]],[[83,59],[95,60],[98,67],[88,76],[73,77],[76,68]]];
  for(const pts of shapes){const us=pts.map(([x,y])=>x+y);let d='';for(let u=Math.min(...us);u<Math.max(...us);u+=1.2){const hits=[];for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length],ua=a[0]+a[1],ub=b[0]+b[1];if((ua<=u&&ub>u)||(ub<=u&&ua>u)){const t=(u-ua)/(ub-ua);hits.push([a[0]+t*(b[0]-a[0]),a[1]+t*(b[1]-a[1])]);}}hits.sort((a,b)=>a[0]-b[0]);for(let i=0;i+1<hits.length;i+=2)d+=line([hits[i],hits[i+1]],color,.16).d;}c.layers.push(path(d,color,'body',.68));}
  for(const right of [false,true]){
    c.layers.push(rect(right?135:64,21,.6,177,color,'body',.55));
    for(let j=0;j<11;j++){const y=89+j*10,x=48+(y>144?-1:1);c.layers.push(poly([[x,y],[x+3,y+4],[x+3,y+10],[x,y+6]].map(([a,b])=>[right?200-a:a,b]),home?'#164B8A':'#E7BD25','body'));}
  }
  if(!home)for(const side of ['leftSleeve','rightSleeve']){let d='';for(let y=17;y<86;y+=1.1)d+=line([[0,y],[200,y-29]],'#132F54',.23,side).d;for(let s=0;s<d.length;){let e=Math.min(s+18000,d.length);if(e<d.length)e=d.lastIndexOf('Z',e)+1;c.layers.push(path(d.slice(s,e),'#132F54',side,.35));s=e;}}
  add('Panetolikos','Greece',v,c,`Independent ${home?'yellow/blue Home':'blue/gold Away'} Titormos field mapped as a full composition, with hatched contours joined through the removed sponsor and completed diagonal side stripes. Away sleeve hatch restored. Greek lettering, badge and logos omitted. Hidden connecting contours are reconstructed, not claimed as directly visible evidence.`);
}
