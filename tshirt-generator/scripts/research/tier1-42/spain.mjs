import {add,previous,base,neck,cuffs,path,rect,line,poly,mirror} from './shared.mjs';
import {ink,tileTrace,placeTrace} from './ink.mjs';
{
  const c=previous('Deportivo Alavés','home');c.layers=c.layers.filter(l=>l.type==='rect');
  const t=await ink('Deportivo Alavés','home',{box:[351,453,61,443],mode:'light',threshold:7,width:60});
  for(const x of [49,84,119])for(const y of [-20,96])c.layers.push(...placeTrace(t,{x,y,width:16,height:116,color:'#2486C7',clip:'body',opacity:.65}));
  add('Deportivo Alavés','home',c,'Blue columns now contain actual angular crowd/fragment contours from the independent Home photograph. White torso gaps, plain blue sleeves, white cuff bands and blue round PNG collar retained.');
}
{
  const c=previous('Deportivo Alavés','away');c.layers=[];
  const t=await ink('Deportivo Alavés','away',{box:[302,394,191,335],mode:'light',threshold:7,width:190});
  tileTrace(c,t,{width:64,height:112,color:'#877A82',opacity:.6,x:-15,y:-12,reflect:true});
  add('Deportivo Alavés','away',c,'Actual fine topographic contour lines replace overlapping invented closed rings. Pink trim and charcoal base retained; line color estimated from the 26-27 Away image.','Contour extraction is source-backed, but joins between repeated fragments still interrupt the full map topology.');
}
{
  const c=previous('Osasuna','home');c.layers=[];
  const t=await ink('Osasuna','home',{box:[232,255,151,87],mode:'light',threshold:5,width:140});
  for(let y=14;y<200;y+=34)for(let x=42;x<157;x+=37)c.layers.push(...placeTrace(t,{x,y,width:37,height:34,color:'#F0423B',opacity:y<74?.7:.12}));
  // Scrolls on the navy seam trim, still bounded by the original PNG curves.
  for(const side of ['leftSleeve','rightSleeve']){let d='';for(let x=14;x<45;x+=5){const xx=side==='leftSleeve'?x:200-x,yy=76.6+(x-12)*.265-2;d+=`M${xx} ${yy}c-1-2 2-3 2-1c0 1-1 1-1 0c0 1 2 1 2-1c0-3-4-2-3 1Z`;}c.detailLayers.push(path(d,'#4669A4',side));}
  add('Osasuna','home',c,'Observed red scroll contours replace repeated generic curl primitives. Print is strongest across the chest and fades down the torso; navy cuffs contain blue scroll accents.','A clean complete scroll repeat and its exact upper-chest arrangement are still needed; the cropped patch is an intermediate reconstruction.');
}
{
  const c=previous('Osasuna','away');c.layers=c.layers.slice(0,1);const lower=await ink('Osasuna','away',{box:[266,632,222,271],mode:'dark',threshold:2.8,width:190,blur:5});
  for(let y=82;y<198;y+=57)for(let x=47;x<153;x+=47)c.layers.push(...placeTrace(lower,{x,y,width:47,height:57,color:'#CBD0C7',clip:'body',opacity:.32}));
  // Replace four-point stars with the source eight-point leaf rosettes.
  for(let row=0;row<2;row++)for(let col=0;col<6;col++){const x=54+col*18,y=34+row*18,p=[];for(let i=0;i<16;i++){const a=i*Math.PI/8,r=i%2?2.7:6.9;p.push([x+r*Math.cos(a),y+r*Math.sin(a)]);}c.layers.push(poly(p,'#D9E5DC','body',.65),line(Array.from({length:33},(_,i)=>[x+8.4*Math.cos(i*Math.PI/16),y+8.4*Math.sin(i*Math.PI/16)]),'#D9E5DC',.32,'body',.65));}
  c.detailLayers=[];cuffs(c,[[3.3,'#1D2938']]);
  for(const reflect of [p=>p,mirror])for(let i=0;i<10;i++){const t=i/10,u=1-t,x=u**3*12+3*u*u*t*24+3*u*t*t*36+t**3*44.5,y=u**3*76.6+3*u*u*t*81.2+3*u*t*t*86.5+t**3*85.6-2.7;c.detailLayers.push(poly(reflect([[x,y],[x+1.7,y+.5],[x+1.7,y+2],[x,y+1.5]]),'#74B5C0'));}
  add('Osasuna','away',c,'Ivory body now includes faint source-derived circular woven detail below the pale-blue chest panel. Eight-point leaf rosettes replace four-point stars; navy ring and square-accent cuffs retained.');
}
{
  const c=previous('Real Betis','away');c.layers=[];
  const t=await ink('Real Betis','away',{box:[190,410,147,340],mode:'light',threshold:7,width:120});
  for(let x=46;x<155;x+=48)for(let y=-10;y<200;y+=110)c.layers.push(...placeTrace(t,{x,y,width:48,height:110,color:'#419666',clip:'body',opacity:.77}));
  c.layers.push(rect(100,0,100,200,'#139564','body',.22));
  add('Real Betis','away',c,'Dense acanthus ornament now uses the observed leaf and curl silhouettes from the left front. Two green front halves, plain darker sleeves and original dark green ring retained.');
}
