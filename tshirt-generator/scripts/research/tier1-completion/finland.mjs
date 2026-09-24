import {base,path,rect,poly,neck,cuffs,shoulderBands,sidePiping,add,ink,grad} from './shared.mjs';
const register=(name,v,c,n)=>add(name,'Finland',v,c,n+' Independently observed 2026 '+v+' source; estimated colors, branding omitted, original round PNG collar retained.');
for(const v of ['home','away']){
  const home=v==='home',c=base(home?'#171D31':'#E7C517');
  if(home){neck(c,[['#F6F6F2',1]]);cuffs(c,[[3.4,'#F6F6F2']]);}
  register('AC Oulu',v,c,home?'Plain navy shirt with white collar and narrow white cuffs.':'Plain golden-yellow body, sleeves, collar and cuffs.');
}
for(const v of ['home','away']){
  const home=v==='home',c=base(home?'#171B1E':'#CD151C');
  if(home){for(const x of [60,89,118])c.layers.push(rect(x,0,14,200,'#245780','body'));for(const [x,clip]of [[19,'leftSleeve'],[152,'rightSleeve']])c.layers.push(poly([[x,13],[x+12,13],[x+23,91],[x+11,91]],'#245780',clip));neck(c,[['#245780',1]]);}
  register('FC Inter Turku',v,c,home?'Three broad blue front stripes on black, continued on sleeves; blue round collar.':'Red shirt with tonal sleeve panels; no printed body graphic visible.');
}
for(const v of ['home','away']){
  const home=v==='home',primary=home?'#141716':'#F6F7F5',accent=home?'#F6F7F5':'#161918',c=base(primary,accent);
  shoulderBands(c,accent,{count:2,inset:5,width:1.35,gap:.7,end:45});
  c.layers.push(path('M49 118L51 121L54 190L51 196L49 196Z',accent,'body'),path('M151 118L149 121L146 190L149 196L151 196Z',accent,'body'));
  register('FC Lahti',v,c,'Contrasting round collar, two narrow shoulder tapes and small lower side/hem inserts; plain central body and sleeves.');
}
for(const v of ['home','away']){
  const home=v==='home',c=base(home?'#CC191C':'#B8B7B3',home?'#CC191C':'#833D36');
  if(!home){c.colors.leftSleeve=c.colors.rightSleeve=c.colors.leftCuff=c.colors.rightCuff='#833D36';for(let x=55;x<151;x+=12)c.layers.push(rect(x,0,.5,200,'#8E4138','body'));}
  register('FF Jaro',v,c,home?'Plain red shirt and trim.':'Warm grey front with regularly spaced fine red pinstripes, brick-red sleeves and collar.');
}
for(const v of ['home','away']){
  const home=v==='home',c=base(home?'#FAFAF7':'#12233F',home?'#285CAA':'#BF8194');
  if(home){for(const x of [60,90,120])c.layers.push(rect(x,0,14,200,'#285CAA','body'));}
  else for(let x=51;x<151;x+=5.5)c.layers.push(rect(x,0,.55,200,'#BC7D90','body'));
  shoulderBands(c,home?'#285CAA':'#BF8194',{count:2,inset:5,width:1.6,gap:1,end:45});
  register('HJK',v,c,home?'White shirt with three broad blue body stripes and white sleeves, blue collar and twin shoulder tapes.':'Dark navy shirt with fine pink body pinstripes; pink round collar and two shoulder tapes, plain navy sleeves.');
}
for(const v of ['home','away']){
  const home=v==='home',body=home?'#EAD727':'#28597C',contrast=home?'#28597C':'#EAD727',c=base(body,home?'#28597C':body);
  cuffs(c,[[4,contrast]]);
  // Source shows opposing angular lightning columns expanding toward the hem.
  for(const mirror of [false,true])for(let row=0;row<6;row++){
    const y=72+row*21,w=13+row*1.7,x=48;
    const shape=[[x,y],[x+w,y+8],[x+w-7,y-2],[x+w+10,y+18],[x+w+2,y+17],[x+w+11,y+33],[x+3,y+17],[x+9,y+30],[x-3,y+18]];
    c.layers.push(poly(shape.map(([a,b])=>[mirror?200-a:a,b]),contrast,'body'));
    c.layers.push(poly([[x+5,y+2],[x+w+7,y+11],[x+w,y+13],[x+w+10,y+28],[x+7,y+16]].map(([a,b])=>[mirror?200-a:a,b]),home?'#748767':'#AEA743','body',.75));
  }
  register('IF Gnistan',v,c,'Source-specific opposing jagged lightning columns widen down both sides; central front and sleeves stay plain. Independent Home/Away palette and cuff colors.');
}
for(const v of ['home','away']){const c=base(v==='home'?'#F6F7F5':'#34936A');register('IFK Mariehamn',v,c,v==='home'?'Plain white shirt with matching collar and cuffs.':'Plain green shirt with matching collar and cuffs.');}
for(const v of ['home','away']){
  const home=v==='home',c=base(home?'#E4C723':'#138A63',home?'#176850':'#138A63');
  if(home)for(let x=50;x<151;x+=8)c.layers.push(rect(x,0,.36,200,'#AFA92D','body'));
  else for(let row=0;row<13;row++)for(let col=0;col<8;col++)if((row+col)%2===0)c.layers.push(rect(47+col*14,row*16,14,16,'#25936C','body',.7));
  shoulderBands(c,home?'#176850':'#E4CF29',{count:2,inset:5,width:1.35,gap:.8,end:45});cuffs(c,[[home?2.5:1.3,home?'#176850':'#E4CF29']]);
  if(!home)neck(c,[['#138A63',3],['#E4CF29',.8]]);
  register('Ilves',v,c,home?'Yellow body with fine olive pinstripes, green collar/cuffs and paired shoulder tapes.':'Green body with tonal checker squares, plain sleeves, yellow shoulder tapes and thin yellow collar/cuff trim.');
}
for(const v of ['home','away']){
  const home=v==='home',c=base(home?'#E1C12A':'#F6F6F4');
  const spec=home?{box:[221,450,290,247],width:350,mode:'dark',threshold:3,blur:12,min:75}:{box:[208,482,294,245],width:350,mode:'dark',threshold:3,blur:12,min:150};
  for(const [x,y,w,h]of [[51,100,98,92],[51,17,98,83]])c.layers.push(...await ink('KuPS',v,spec,{x,y,width:w,height:h,color:home?'#C3A024':'#DCDFDE',opacity:home?.75:.7,clip:'body'}));
  if(!home)for(const [x,clip]of [[13,'leftSleeve'],[153,'rightSleeve']])c.layers.push(...await ink('KuPS',v,spec,{x,y:33,width:35,height:49,color:'#E0E2E1',opacity:.8,clip}));
  // The Home's shoulder yoke and sleeves are unprinted yellow.
  if(home){c.layers.push(path('M23 21Q50 6 75 3L74 16Q48 22 38 39Z','#E1C12A'),path('M177 21Q150 6 125 3L126 16Q152 22 162 39Z','#E1C12A'));}
  register('KuPS',v,c,home?'Golden diagonal disrupted camo print reproduced from a clean lower-front field; plain yellow sleeves and shoulder yoke.':'White/light-grey irregular branch print mapped independently from the Away reference onto the body and sleeves. Tonal details adapted from a clean source patch.');
}
for(const v of ['home','away']){
  const home=v==='home',c=base(home?'#171918':'#F6F6F3',home?'#B9B474':'#8A2935');
  for(let x=52;x<150;x+=5.9)c.layers.push(rect(x,0,.58,200,home?'#79252C':'#8A2935','body'));
  shoulderBands(c,home?'#B9B474':'#8A2935',{count:2,inset:5,width:1.5,gap:.9,end:45});
  register('SJK',v,c,'Independent black/gold Home or white/burgundy Away base; fine burgundy body pinstripes and two contrasting shoulder tapes. Plain sleeves.');
}
for(const v of ['home','away']){
  const home=v==='home',c=base(home?'#151716':'#E8974B',home?'#F6F6F2':'#E8974B');
  if(home){for(const x of [58,88,118])c.layers.push(rect(x,0,13,200,'#F6F6F2','body'));cuffs(c,[[4,'#F6F6F2']]);}
  else{
    const spec={box:[207,633,307,110],width:230,mode:'dark',threshold:2.5,blur:14,close:1};
    for(let row=0;row<5;row++)c.layers.push(...await ink('TPS',v,spec,{x:49,y:19+row*36,width:102,height:36,color:'#D5813A',opacity:.8,clip:'body'}));
  }
  register('TPS',v,c,home?'Black shirt with three wide white body stripes, white collar and broad white cuff borders.':'Orange shirt with tonal mirrored organic lobes and dotted transition fields; plain orange sleeves and trim. Source print geometry adapted to the common base.');
}
for(const v of ['home','away']){
  const home=v==='home',c=base(home?'#F5F5F2':'#E7C924',home?'#161917':'#E7C924');
  if(home){for(const x of [49,83,117,150])c.layers.push(rect(x,0,17,200,'#161917','body'));c.colors.leftSleeve=c.colors.rightSleeve='#161917';c.layers.push(poly([[30,16],[32,15],[20,85],[18,85]],'#F5F5F2','leftSleeve'),poly([[170,16],[168,15],[180,85],[182,85]],'#F5F5F2','rightSleeve'));}
  register('VPS',v,c,home?'Alternating broad black/white vertical body stripes; black collar and sleeves with a slim white sleeve stripe.':'Plain yellow shirt and matching trim.');
}
