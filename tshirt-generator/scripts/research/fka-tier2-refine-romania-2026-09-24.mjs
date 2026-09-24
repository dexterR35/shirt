import {refinementBatch,base,neck,cuffs,rect,path,poly,panels,line,tapes,gradient,sidePiping} from './tier2-refinement-helpers.mjs';
const {scope,add,ink,save}=await refinementBatch('tier2-refine-romania-2026-09-24',['romania']);
for(const r of scope){let c=structuredClone(r.config);c.layers=[];
 if(r.name==='ASA Târgu Mureș'){
  for(const [ox,oy,w,h]of [[38,4,50,40],[115,144,34,56],[9,66,22,15],[166,65,24,17]])for(let i=0;i<18;i++){const x=ox+(i*7.9)%w,y=oy+(i*3.7)%(h*.4),len=h*.35+(i%4)*h*.13;c.layers.push(poly([[x,y],[x+1.1,y-.3],[x+1.6,y+len],[x+.1,y+len+2]],'#214FA4','all'));for(let j=0;j<3;j++)c.layers.push(rect(x-1.5,y+3+j*6,3.5,1.2,'#2152A7','all'));}
  add(r,c,'Red with dense uneven clusters of thin blue vertical strokes and short cross-strokes at the left shoulder and right lower front; matching fragmented blue sleeve-end print. Match-photo perspective limits exact stroke positions; cluster placement and scale corrected.');
 }
 if(r.name==='Chindia Târgoviște'){
  c.layers.push(poly([[33,23],[76,4],[100,18],[124,4],[167,23],[137,24],[100,35],[63,24]],'#E53730','all'));
  neck(c,[['#1379BE',3]]);add(r,c,'Royal blue with a broad red upper-chest chevron yoke joining the shoulder strips, blue sewn neckline and blue sleeves. The photographed V seam is adapted only as color on the existing round neck; crossed arms obscure the center but visible body remains blue.');
 }
 if(r.name==='Concordia Chiajna'){
  c.colors.body='#EFF0E8';await ink(c,r,{box:[181,104,346,674],width:500,mode:'green',threshold:12,smooth:.5,repairs:[{target:[215,186,104,66],source:[210,330,104,66]},{target:[400,182,91,86],source:[405,410,91,86]}]},{x:49,y:4,width:102,height:195,color:'#5A9666'});
  add(r,c,'White front with green asymmetric fan, angular ribbons and fine converging triangular lines mapped from the full source front. Solid green sleeves, white cuffs and round collar. Crest and brand removed with small manually continued neighboring graphic sections; no repeated lower-front crop.');
 }
 if(r.name==='CSM Reșița'){
  c=base('#CC2431','#C42631');tapes(c,'#202C3D',3,1.2);sidePiping(c,'#EAE8EE',.45);
  add(r,c,'Red shirt with three narrow dark shoulder tapes and pale curved side piping. Close inspection identifies the dark torso diagonals as folds/shadow rather than a repeated printed pattern, so the rejected body graphic is removed; fabric shading comes solely from base.png.');
 }
 if(r.name==='Gloria Bistrița'&&r.variant==='home'){
  for(const x of [55,76,97,118,139])c.layers.push(rect(x,25,9,175,gradient([[0,'#CB2835'],[.3,'#23232A'],[1,'#20232A']],0,25,0,180),'body'));
  c.layers.push(rect(0,0,200,40,gradient([[0,'#202630'],[.8,'#202630'],[1,'#CB2835']],0,0,0,40),'body'));
  c.colors.leftSleeve=c.colors.rightSleeve=c.colors.leftCuff=c.colors.rightCuff='#202630';
  add(r,c,'Black upper yoke and sleeves transitioning into a red torso with five narrow dark lower-front stripes. Large stylized club animal and lettering omitted; source match folds and exact gradient transition adapted to shared fabric.');
 }
 if(r.name==='Gloria Bistrița'&&r.variant==='away'){
  c.layers.push(rect(0,0,200,200,gradient([[0,'#C9D7E5'],[.2,'#B9CEE0'],[.5,'#1875C8'],[1,'#084DAF']]),'all'));
  for(const x of [55,76,97,118,139])c.layers.push(rect(x,70,9,130,gradient([[0,'#598CBD'],[.3,'#165AB7'],[1,'#103B94']],0,70,0,200),'body'));
  c.detailLayers=[];cuffs(c,[[1,'#236ABC']]);add(r,c,'Pale blue upper shirt fading into royal blue body and sleeves with five darker lower-front vertical bars. Blue neckline, source animal emblem and repeated miniature club motifs omitted. Independent Away gradient and striping corrected.');
 }
 if(r.name==='Metaloglobus București'){
  for(const side of ['leftSleeve','rightSleeve'])for(const p of [[[0,29],[43,16],[49,27],[19,36],[30,40],[2,45]],[[0,47],[45,35],[49,46],[25,49],[33,54],[1,62]],[[3,68],[49,49],[46,65],[26,70],[32,76],[9,81]]])c.layers.push(poly(p.map(([x,y])=>[side==='leftSleeve'?x:200-x,y]),'#169CD4',side));
  cuffs(c,[[4,'#124C77']]);add(r,c,'Deep blue plain body with broad bright cyan jagged sleeve ribbons, separated by irregular dark steps, and dark sleeve ends. Source sleeve geometry redrawn individually instead of applying identical thin straight bands.');
 }
 if(r.name==='Politehnica Timișoara'){
  c.layers.push(rect(0,0,200,22,'#503592','body'));
  for(const y of [47,94,141,188]){c.layers.push(rect(49,y,102,21,'#51338C','body'));for(let x=49;x<153;x+=14)c.layers.push(line([[x,y+13],[x+7,y+4],[x+14,y+13],[x+7,y+19],[x,y+13]],'#422776',.6,'body',.6));}
  add(r,c,'White with purple shoulder yoke and four broad purple hoops, including a partial bottom hoop, at the source spacing. Faint angular diamond outlines inside purple bars; white sleeves with purple cuffs and neckline. Match perspective adapted without painting physical folds.');
 }
 if(r.name==='SC Popești-Leordeni'){
  const col=r.variant==='home'?'#A42D36':'#C8CDCF',opacity=r.variant==='home'?.52:.3;let seed=78231;const rnd=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};
  for(let i=0;i<440;i++){const x=rnd()*200,y=rnd()*200,len=5+rnd()*13;c.layers.push(line([[x,y],[x+len*.5,y-len*.7],[x+len*.37,y-len*.3],[x+len*.7,y-len]],col,.2+rnd()*.3,'all',opacity));}
  if(r.variant==='away'){c.detailLayers=[];cuffs(c,[[.8,'#EEEFEA']]);}
  add(r,c,`${r.variant==='home'?'Red with darker red':'White with faint grey'} scattered fine angular scratch strokes across front and sleeves, replacing oversized traced blobs. Independent source establishes color, density and diagonal direction; exact print behind crossed arms is adapted. Matching sewn collar and sleeves; no copied grain or shadow.`);
 }
 if(r.name==='SCM Râmnicu Vâlcea'){
  c=base('#293B46','#B72F3C');c.layers.push(rect(49,47,102,1,'#B32C3A','body'),poly([[49,45],[62,70],[74,112],[80,154],[151,157],[151,161],[75,160],[67,117],[54,84]],'#8E2C37','body'),poly([[51,101],[76,128],[105,145],[145,154],[129,149],[95,136],[69,118]],'#AC303B','body'));
  panels(c,[[75,5],[68,12],[62,19],[75,18],[84,23]],'#9C293C');cuffs(c,[[3,'#D3363B']]);
  add(r,c,'Dark charcoal-blue front and sleeves with fine red chest line, irregular muted red curved/angular lower-front ribbons and red shoulder accents, collar and cuffs. Corrected the unsupported regular red/blue stripes; small match reference limits exact hidden ribbon edges.');
 }
 if(r.name==='Steaua București'){
  for(let y=15;y<198;y+=18){c.layers.push(rect(94,y,2.6,18,'#B0293E','body'),rect(103,y,2.6,18,'#B0293E','body'),rect(y%36<18?97:100,y,3,9,'#B0293E','body'));}
  for(const mirror of [false,true])for(let y=0;y<72;y+=4)for(let x=17;x<79-y*.48;x+=4){const xx=mirror?200-x:x,opacity=Math.max(.06,.88-y/78);if((Math.round(x/4)+y/4)%2===0)c.layers.push(rect(xx,y,3.8,3.8,'#D5E1E9','all',opacity));}
  for(const side of ['left','right'])for(let y=120;y<195;y+=4)for(let x=49;x<59;x+=3.3){if((Math.floor(y/4)+Math.floor(x/3.3))%2===0)c.layers.push(rect(side==='left'?x:200-x,y,3.2,3.9,'#CADAE4','body',.52));}
  add(r,c,'Blue with narrow central red broken ladder stripe, pale checker fields fading down both shoulder/sleeve tops and pale checked lower side strips. Checks now reach the visible sleeve and side areas; plain dark-blue existing collar ring, sponsor and crest excluded.');
 }
}
await save();
