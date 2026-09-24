import {previous,path,poly,rect,neck,cuffs,shoulderBands,add,ink,grad,line} from './shared.mjs';
{
  const c=await previous('Crystal Palace','away');c.layers=c.layers.filter(l=>l.type==='polygon'||l.d?.startsWith('M32')||l.d?.startsWith('M168'));
  const spec={box:[138,175,357,806],width:360,mode:'light',threshold:2.8,blur:6,close:1,exclude:[[136,205,64,78],[344,208,67,80],[196,284,119,108],[128,397,284,64],[131,863,32,105],[431,588,65,394]]};
  c.layers.unshift(...await ink('Crystal Palace','away',spec,{x:48,y:23,width:104,height:174,color:'#424B53',opacity:.7}));
  // Continue oblique feather tips through the removed sponsor areas.
  for(const[x,y,w,h]of [[58,31,9,9],[107,32,12,8],[77,54,9,13],[88,59,9,12],[72,71,9,13],[99,74,11,10],[118,69,10,12]]){
    c.layers.push(path(`M${x} ${y+h}Q${x+w*.15} ${y+h*.3} ${x+w} ${y}Q${x+w*.75} ${y+h*.65} ${x} ${y+h}Z`,'#414A52','body',.65));
  }
  for(const[x,clip,box]of [[12,'leftSleeve',[87,281,53,143]],[151,'rightSleeve',[540,219,99,214]]])c.layers.unshift(...await ink('Crystal Palace','away',{box,width:130,mode:'light',threshold:3,blur:8,close:1},{x,y:22,width:37,height:57,color:'#424B53',opacity:.65,clip}));
  add('Crystal Palace','England','away',c,'Full feather field mapped from the complete source front, including the lower eagle-plumage contours and upper diagonal feather direction. Source-covered gaps continue observed feather tips, sleeves use independent clean fragments. Red/blue shoulder/cuff trim and blue lower side insert retained; fine stippling simplified.');
}
{
  const c=await previous('Nottingham Forest','home');c.layers=[];c.detailLayers=[];
  for(const k of ['body','leftSleeve','rightSleeve'])c.colors[k]='#BC171F';
  const spec={box:[186,145,332,494],width:290,mode:'light',threshold:3.2,blur:25,close:1,exclude:[[219,218,92,62],[426,199,59,93],[213,323,276,90]]};
  c.layers.push(...await ink('Nottingham Forest','home',spec,{x:48,y:22,width:104,height:137,color:grad('#D92930','#BE1922',48,22,150,167),opacity:.75}));
  // Broad connecting islands visible above/below the sponsor continue beneath it.
  c.layers.push(path('M91 62Q103 58 109 64L103 71L112 76L107 82L93 79L88 70Z','#CC222B','body',.65));
  shoulderBands(c,'#F7F6F1',{count:2,width:1.4,gap:.8,inset:5,end:46});cuffs(c,[[6,'#D9232B']]);neck(c,[['#D9232B',1]]);
  add('Nottingham Forest','England','home',c,'Full upper and middle tonal red camouflage mapped in place rather than repeating a lower crop. Broad red islands fade toward the hem; sponsor-covered connection is reconstructed between observed boundaries. White paired shoulder tapes and brighter red cuffs/ring retained. Fine blurred edges are simplified.');
}
{
  const c=await previous('Bayer Leverkusen','away');c.layers=[];c.detailLayers=[];const light='#C9DEE0';
  for(const k of ['body','leftSleeve','rightSleeve'])c.colors[k]=light;
  for(const[box,x,clip]of [[[157,213,69,64],12,'leftSleeve'],[[750,172,67,89],168,'rightSleeve']])for(const[threshold,color]of [[63,'#87B7C7'],[112,'#4D819F'],[163,'#264B70'],[198,'#192D50']])c.layers.push(...await ink('Bayer Leverkusen','away',{box,width:150,mode:'inverse',threshold},{x,y:46,width:25,height:38,color,clip}));
  // Independent left/right source fields; never mirror one small sleeve patch.
  for(const[box,x,excludes]of [
    [[80,28,324,387],12,[[77,274,85,124],[290,178,95,66]]],
    [[565,28,326,387],121,[[816,264,81,138],[576,155,129,106]]]
  ])for(const [threshold,color]of [[63,'#87B7C7'],[112,'#4D819F'],[163,'#264B70'],[198,'#192D50']]){
    c.layers.push(...await ink('Bayer Leverkusen','away',{box,width:240,mode:'inverse',threshold,exclude:excludes},{x,y:2,width:67,height:81,color,clip:'all'}));
  }
  // Common-base raglan boundary keeps the observed pale central panel plain.
  c.layers.push(path('M68 26Q100 19 132 26Q144 31 148 47L152 74L152 202L48 202L48 74L52 47Q56 31 68 26Z',light,'body'));
  cuffs(c,[[4.4,'#49829A'],[2.5,'#9BC9D3'],[.5,'#2F617B']]);
  for(const right of [false,true]){let d='';for(let j=0;j<40;j++){const u=j/40,x=12+32.5*u,y=76.6+11*u-2.5;d+=`M${right?200-x:x} ${y}l${right?-.55:.55} -1.1 ${right?-.5:.5} 1.1 ${right?.5:-.5} 1.1Z`;}c.detailLayers.push(path(d,'#D0E4E6',right?'rightSleeve':'leftSleeve'));}
  neck(c,[['#506F7E',1]]);
  add('Bayer Leverkusen','Germany','away',c,'Asymmetric left and right mineral shoulder/sleeve fields mapped separately from the full reference, replacing reflected patch repeats. Four blue ink levels preserve large cells and veins. Pale central raglan panel and fine zigzag cuff trim restored; original round collar retained. Branding-covered gaps omitted and fine vein detail simplified.');
}
{
  const c=await previous('RB Leipzig','away');c.layers=[];
  c.layers.push(...await ink('RB Leipzig','away',{box:[360,281,744,1160],width:500,mode:'light',threshold:4,blur:9,exclude:[[450,385,140,110],[845,375,190,130],[460,575,520,235],[358,1320,42,91],[1054,1370,41,37]]},{x:48,y:25,width:104,height:172,color:'#EF8069',opacity:.65}));
  for(let row=0;row<9;row++)for(let col=0;col<12;col++){
    const x=63+col*5.7+(row%2)*2,y=68+row*4.7;
    if(x<131)c.layers.push(line([[x,y],[x+3.7,y+4],[x+5,y-.7],[x,y]],'#EF8069',.17,'body',.45));
  }
  // Connect the actual branch network across the logo/sponsor occlusions.
  const edges=[[[68,35],[79,40],[85,34],[90,45],[104,40],[113,48],[126,37]],[[84,61],[74,77],[78,95],[73,110]],[[114,57],[121,73],[113,84],[118,102]],[[84,61],[96,67],[107,62],[121,73]],[[78,95],[91,86],[103,96],[113,84]],[[91,86],[96,67]],[[103,96],[107,62]]];
  for(const e of edges){c.layers.push(line(e,'#EF8069',.28,'body',.55));for(let i=1;i<e.length;i++){const a=e[i-1],b=e[i],mid=[(a[0]+b[0])/2,(a[1]+b[1])/2];c.layers.push(line([a,[mid[0]+3,mid[1]-3],b,[mid[0]-2,mid[1]+3],a],'#EF8069',.18,'body',.55));}}
  add('RB Leipzig','Germany','away',c,'Entire branching figure mapped from the full front with its upper network and lower limbs in place. Observed branch directions continue through the areas hidden by branding; prior disconnected repeated chest fragments removed. Yellow/navy trim retained; fine line texture simplified.');
}
