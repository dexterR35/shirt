import {previous,path,poly,rect,neck,cuffs,add,ink,grad,line} from './shared.mjs';
{
  const c=await previous('Osasuna','home');c.layers=[];c.detailLayers=[];
  for(const y of [7,48,106,148])for(const x of [34,79,124]){
    c.layers.push(...await ink('Osasuna','home',{box:[235,266,140,80],width:230,mode:'light',threshold:2,blur:11},{x,y,width:45,height:42,color:grad('#F44948',c.colors.body,x,y,x,y+42),opacity:y<48?.42:y<90?.17:.035}));
  }
  cuffs(c,[[5.6,'#273D74']]);neck(c,[['#273D74',1]]);
  for(const right of [false,true]){for(let j=0;j<9;j++){
    const u=.03+j*.107,x=12+32.5*u,y=76.6+11*u-2.6,p=[];
    for(let i=0;i<45;i++){const t=i/44,r=1.25*(1-t*.8),a=t*Math.PI*3.1;p.push([right?200-x-r*Math.cos(a):x+r*Math.cos(a),y+r*Math.sin(a)]);}
    c.detailLayers.push(line(p,'#4763A0',.4,right?'rightSleeve':'leftSleeve'));
  }}
  add('Osasuna','Spain','home',c,'Large upper scrolling ornament reconstructed from the clean source scroll unit with near-invisible lower continuation, replacing the narrow fragmented crop. Blue cuffs carry pale scrolls aligned to the cuff curve. The source polo construction is adapted to the existing blue round collar.');
}
for(const v of ['home','away']){
  const c=await previous('Frosinone',v),home=v==='home';c.layers=c.layers.filter(l=>l.type==='polygon');
  if(home)c.colors.body=c.colors.leftSleeve=c.colors.rightSleeve='#EFD17D';
  const underlay={box:home?[292,565,320,310]:[327,636,350,350],width:300,mode:'dark',threshold:2.3,blur:8};
  c.layers.unshift(...await ink('Frosinone',v,underlay,{x:49,y:28,width:102,height:82,color:home?'#D5AF5E':'#CCC8C1',opacity:home?.24:.18}));
  for(const[x,clip]of [[13,'leftSleeve'],[152,'rightSleeve']])c.layers.unshift(...await ink('Frosinone',v,underlay,{x,y:27,width:35,height:58,color:home?'#D5AF5E':'#CCC8C1',opacity:.18,clip}));
  if(!home)c.layers.push(path('M49 77L55 101L52 125Z','#243C52','body'),path('M151 77L145 101L148 125Z','#243C52','body'));
  const spec=home?{box:[237,205,439,765],width:360,mode:'dark',threshold:1.7,blur:8,close:1,exclude:[[258,279,140,56],[549,248,119,135],[283,423,351,111],[223,902,85,50]]}:{box:[270,235,489,875],width:360,mode:'dark',threshold:1.4,blur:8,close:1,exclude:[[304,291,163,56],[636,278,108,155],[319,472,387,119],[256,1035,79,52]]};
  c.layers.unshift(...await ink('Frosinone',v,spec,{x:48,y:23,width:104,height:173,color:home?'#D5AF5E':'#CCC8C1',opacity:home?.46:.32}));
  // Matching architectural line fragments continue the source scene behind branding.
  for(const [x,y]of [[60,42],[110,43],[70,76],[92,76],[114,76]]){
    const col=home?'#D5AF5E':'#CCC8C1';
    for(const e of [[[x,y+13],[x,y],[x+5,y-3],[x+10,y],[x+10,y+13]],[[x,y+3],[x+10,y+3]],[[x+3,y+3],[x+3,y+12]],[[x+7,y+3],[x+7,y+12]]])c.layers.push(line(e,col,.2,'body',home?.3:.2));
  }
  add('Frosinone','Italy',v,c,`Independent ${home?'golden Home':'ivory Away'} architectural field mapped over the full front instead of a repeated lower scene. Fine building lines and upper field recovered; small branding-covered portions are continued with the observed columns/roof structure. Source shoulder wedges, cuffs and original round ring retained; micro-detail simplified.`);
}
