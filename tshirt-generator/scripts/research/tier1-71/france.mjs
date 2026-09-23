import {add,previous,base,neck,cuffs,shoulderBands,sidePiping,path,rect,poly,line,hatch,n,mirror,circle,gradient,network,trimPattern} from './shared.mjs';

add('Le Havre','home',()=>{
  const c=base('#243A54','#172E48','#223A56');c.colors.leftSleeve=c.colors.rightSleeve='#243A54';
  c.layers.push(rect(48,0,52,200,gradient('#9ED9F0','#142A46',0,20,0,175),'body'),rect(100,0,53,200,gradient('#1B304C','#93D2EC',0,25,0,175),'body'));
  for(let x=49;x<153;x+=5)c.layers.push(rect(x,0,1.2,200,'#ABDDF0','body',.16));
  c.layers.push(path('M25 20L75 4 70 22 50 42 38 70 17 64Z','#253B54'),path('M175 20L125 4 130 22 150 42 162 70 183 64Z','#253B54'));
  neck(c,[['#172D44',2.6],['#AD9E60',.3]]);return c;
},'Opposing sky-blue/navy vertical gradients divided at the center, fine tonal vertical ribs, plain navy raglan shoulders and sleeves, navy collar with a fine muted-gold inner edge. Source polo shape is adapted onto the original round ring.');

add('Lens','away',()=>{
  const c=base('#1D2022','#1B2023','#1C2123');
  for(let row=-1;row<7;row++)for(let col=0;col<4;col++){
    const x=34+col*35,y=row*34+(col%2)*12;
    c.layers.push(poly([[x,y+17],[x+17.5,y],[x+35,y+17],[x+35,y+51],[x+17.5,y+34],[x,y+51]],gradient('#555656','#222527',x,y+13,x+35,y+40),'body'));
    c.layers.push(poly([[x+17.5,y],[x+35,y+17],[x+35,y+51],[x+17.5,y+34]],gradient('#4B4C4C','#222527',x+18,y,x+35,y+45),'body',.6));
  }
  shoulderBands(c,'#58AA77',{count:2,width:1.3,gap:1,end:35,inset:2.5});neck(c,[['#56AB79',.7],['#192224',2.5]]);cuffs(c,[[1.1,'#57AD79']]);return c;
},'Black shirt with staggered charcoal faceted arrow/hexagonal fields and subtle directional gradients, green shoulder tapes and narrow green collar/cuff edges.');

add('Lille','away',()=>{
  const c=base('#F1F1EC','#EBEFEA','#EEF0EB');sidePiping(c,'#1B3F93',1.6);
  for(let k=0;k<120;k++)c.layers.push(line([[45,k*2.7],[155,k*2.7-40]],'#DFE4E1',.14,'body',.25));
  neck(c,[['#EDEFE8',.3],['#25458C',2.7],['#BE3545',.4]]);
  trimPattern(c,'#C03A4C','blocks');cuffs(c,[[4.2,'#25458C'],[.6,'#1F4496']]);
  for(const m of [false,true])for(let i=0;i<17;i++){
    const x=15+i*2,y=77+(x-12)*.23;const p=[[x,y-3],[x+1.3,y-2.7],[x+1.3,y-1.5],[x,y-1.8]];
    c.detailLayers.push(poly(m?mirror(p):p,i%2?'#C83C4F':'#6683B1',m?'rightSleeve':'leftSleeve'));
  }return c;
},'White shirt with a faint diagonal jacquard, blue side piping and small alternating blue/red geometric marks on the white cuff and original collar ring; no additional polo collar.');

add('Lorient','home',()=>{
  const c=base('#F06C31','#252A2B','#242728');
  for(let col=0;col<4;col++){
    const x=40+col*31;let d=`M${x} -5`;
    for(let row=0;row<9;row++){const y=row*26;d+=`L${x+12} ${y+8}L${x+2} ${y+20}L${x+17} ${y+22}`;}
    for(let row=8;row>=0;row--){const y=row*26;d+=`L${x+28} ${y+22}L${x+13} ${y+20}L${x+23} ${y+8}`;}d+='Z';
    c.layers.push(path(d,gradient('#F49438','#F6BC54',0,0,0,195),'body',.8));
  }neck(c,[['#F0EFEB',.7],['#24292A',2.5]]);cuffs(c,[[4.4,'#F1EFE9'],[3.1,'#26282A'],[.5,'#EDEBE5']]);return c;
},'Orange shirt with four broad stepped golden zigzag columns, plain orange sleeves, black/white collar and black cuff bands bordered by white.');

add('Lorient','away',()=>{
  const c=base('#ECE6D6','#20211F','#20211F');
  for(let row=-1;row<10;row++)for(let col=0;col<5;col++){
    const x=43+col*27+(row%2)*13.5,y=10+row*25;let d='';
    for(let petal=0;petal<6;petal++){
      const a=petal*Math.PI/3,pts=[];for(let i=0;i<42;i++){const t=i/41*Math.PI*2,r=1+6*i/41;pts.push([x+Math.cos(a)*4+r*Math.cos(t+a),y+Math.sin(a)*4+r*Math.sin(t+a)]);}
      d+=line(pts,'#BEB39B',.2,'body').d;
    }c.layers.push(path(d,'#BEB39B','body',.65));
  }
  cuffs(c,[[4.7,'#20211F'],[.8,'#DDD5C1']]);neck(c,[['#20221F',2.7],['#D8CFB8',.5]]);trimPattern(c,'#C8BFA6');return c;
},'Warm ivory shirt with pale-gold radial scroll rosettes and black collar/cuffs carrying narrow pale ornamental marks.', 'Refine the interlocking scroll topology and cuff ornament against the saved source; the radial study is not a complete trace.');

add('Lyon','home',()=>{
  const c=base('#F2F1EB','#235CAA','#235CAA');c.colors.leftSleeve=c.colors.rightSleeve='#245EA7';
  for(let x=49;x<153;x+=3.4)c.layers.push(rect(x,0,.14,200,'#D7DDD8','body',.25));
  for(const [x,color]of [[91,'#D42D35'],[100,'#245EA6']]){c.layers.push(rect(x,0,9,73,color,'body'),rect(x,98,9,102,color,'body'));}
  for(let x=91;x<109;x+=.7)c.layers.push(poly([[x,70],[x+.5,70],[x+.2,75+(Math.round(x*10)%4)]],x<100?'#D52E36':'#245EA7','body'));
  c.layers.push(path('M25 20L74 5 70 22 53 33 45 77 17 68Z','#245EA7'),path('M175 20L126 5 130 22 147 33 155 77 183 68Z','#245EA7'));
  shoulderBands(c,'#E1403E',{count:2,width:1.5,gap:1.1,end:35,inset:2.5});neck(c,[['#CCAE67',.65],['#215AAA',2.5]]);cuffs(c,[[.55,'#C9AA68']]);return c;
},'White fine-ribbed torso, royal-blue raglan sleeves, two red shoulder tapes and narrow central red/blue columns interrupted across the sponsor zone. Fine gold border colors the existing round neckline.');

add('Marseille','away',()=>{
  const c=base('#202B37','#9ECDD8','#9DCDD8');
  for(let row=0;row<13;row++)for(let col=0;col<9;col++){
    const x=8+col*23+(row%2)*7,y=row*18,pts=[[x,y],[x+7,y-4],[x+10,y+2],[x+18,y+1],[x+21,y+7],[x+12,y+9],[x+15,y+15],[x+5,y+12],[x,y+15],[x-4,y+7]];
    c.layers.push(hatch(pts,'#527786',.65,.23,0,'all',.6));
  }cuffs(c,[[1.4,'#9DCBD7']]);return c;
},'Charcoal/navy shirt with blue broken map-like print formed from thin horizontal hatch lines and pale cyan collar/cuff edges.', 'Replace the provisional islands with the source camouflage contours; hatch scale and color are established but the field is unfinished.');

add('Monaco','away',()=>{
  const c=base('#753941','#70353E','#753941');cuffs(c,[[4.2,'#753941'],[1.5,'#E8E2D7'],[.6,'#BAA66C']]);return c;
},'Claret body, sleeves and original collar, with thin off-white and muted-gold cuff edges. The tonal all-over pattern consists of repeated intertwined A/S/M club initials; all lettering and club monograms are intentionally omitted, along with the chest branding.');

add('Paris FC','home',()=>{
  const c=base('#203758','#203E60','#254569');shoulderBands(c,'#A5D4E9',{count:2,width:1.4,gap:1.1,end:35,inset:2.5});
  neck(c,[['#243E5E',2.8],['#A7D2E5',.5]]);trimPattern(c,'#AACFE0');cuffs(c,[[4.4,'#284E72'],[.6,'#A6CFE2']]);
  for(const m of [false,true])for(let j=0;j<15;j++){
    const x=14+j*2.4,y=77+(x-12)*.23,p=[[x,y-3.4],[x+1.8,y-2.7],[x+.5,y-1.4],[x+2,y-.3],[x+1.3,y+.2],[x-.5,y-1.1],[x+.9,y-2.4],[x-.5,y-2.9]];
    c.detailLayers.push(poly(m?mirror(p):p,'#ACD0E1',m?'rightSleeve':'leftSleeve'));
  }return c;
},'Plain navy shirt with pale blue shoulder tapes and blue wavy geometric ornament restricted to the collar and cuff bands.');

add('Rennes','home',()=>{
  const c=base('#DC252D','#202120','#222221');
  const ink='#BE2930';
  for(const x of [53,69,84,116,131,147]){
    c.layers.push(rect(x,17,.4,180,ink,'body',.8));
    for(let y=22;y<194;y+=8)c.layers.push(line([[x,y],[x+7,y+5],[x,y+8]],ink,.35,'body',.8));
  }
  for(const y of [37,67,117,164,184]){
    c.layers.push(rect(47,y,106,.6,ink,'body',.8));let pts=[];for(let x=48;x<153;x+=5)pts.push([x,y+3+(Math.round(x/5)%2)*5]);c.layers.push(line(pts,ink,.3,'body',.8));
  }
  for(const y of [75,97,133,151])for(const x of [89,103])network(c,[[[x,y],[x+9,y],[x+9,y+14],[x,y+14],[x,y]],[[x+4.5,y],[x+4.5,y+14]],[[x,y+7],[x+9,y+7]]],ink,.25,'body',.8);
  for(let y=22;y<60;y+=7)for(let x=88;x<113;x+=7)c.layers.push(line([[x,y],[x+3.5,y+3.5],[x,y+7],[x-3.5,y+3.5],[x,y]],ink,.2,'body',.8));
  cuffs(c,[[3.6,'#222322']]);return c;
},'Red shirt with black collar/cuffs and a tonal architectural field of framed windows, herringbone columns, small diamonds and cross-braced beams.', 'Complete the fine architectural panels and their sleeve continuation; the saved structural trace remains incomplete.');

add('Rennes','away',()=>{
  const c=base('#EFEFEC','#202221','#202221');c.layers.push(rect(88,0,24,200,'#292B29','body'),rect(47,65,106,27,'#292B29','body'));
  for(let row=0;row<52;row++){
    const y=24+row*3.25,x=88-(row%4)*.2,len=1+(row*7%11)*.23;
    c.layers.push(poly([[x,y],[x+len,y+.3],[x+.6,y+.65],[x+len*.5,y+.9],[x-.5,y+1.2]],'#EFEFEC','body'),poly([[112.4,y+1],[110.8-len*.4,y+1.5],[112.4,y+2.3]],'#EFEFEC','body'));
  }
  for(let col=0;col<53;col++){const x=47+col*2;c.layers.push(poly([[x,64.5],[x+.5,66+(col%5)*.7],[x+1.4,64.5]],'#EFEFEC','body'),poly([[x,92.5],[x+.7,90-(col%4)*.7],[x+1.2,92.5]],'#EFEFEC','body'));}
  for(let i=0;i<31;i++){const x=48+(i*17%104),y=65+(i*7%26);c.layers.push(rect(x,y,1+(i%4),.18,'#EFEFEC','body',.65));}
  for(let col=0;col<19;col++){
    const x=88+col*1.27;let d='';for(let row=0;row<25;row++){
      const y=15+row*7.4+(col%3)*2;if(y>60&&y<97)continue;
      if((col*7+row)%5<2)d+=line([[x,y],[x+.23,y+3.2],[x-.08,y+5+(row%3)]],'#EFEFEC',.15+(col%4)*.1,'body').d;
    }if(d)c.layers.push(path(d,'#EFEFEC','body',.85));
  }
  cuffs(c,[[4,'#232522']]);return c;
},'White shirt with a wide black cross, distressed fine brush edges and small white interruptions, plain white sleeves and black collar/cuffs.');

add('Toulouse','away',()=>{
  const c=base('#F1E7E9','#EEE0E2','#EBDFE3');
  for(const x of [65,88,111,134])c.layers.push(rect(x,0,.2,200,'#DFB9C4','body',.7));
  const bands=[['M47 109Q92 134 106 200H94Q82 143 47 127Z','#C2A5C7'],['M47 124Q79 148 93 200H75Q67 159 47 146Z','#8E58A4'],['M47 149Q67 166 75 200H57Q53 182 47 171Z','#AC488C'],['M153 77Q104 129 91 200H102Q115 139 153 100Z','#CCB7D4'],['M153 101Q117 150 109 200H128Q131 158 153 131Z','#9258A2'],['M153 132Q135 169 135 200H149Q143 176 153 159Z','#AA448C']];
  for(const[d,col]of bands)c.layers.push(path(d,gradient('#EBC0D5',col,0,85,0,195),'body',.82));return c;
},'Very pale pink shirt with fine pink vertical pinlines and sweeping purple/magenta printed passages rising from the lower sides.', 'Refine soft wave boundaries and overlapping color fades; the current lower-body layout is a study of the source, not a completed trace.');

add('Troyes','home',()=>{
  const c=base('#246DB2','#EEEDE7','#EEEDE7');
  const shapes=[[[46,20],[87,9],[75,26],[65,28],[77,48],[64,43]],[[94,8],[104,14],[88,38],[95,42],[83,56],[75,49]],[[127,12],[145,21],[124,38],[135,41],[113,61],[107,54],[121,36],[112,31]],[[47,47],[65,64],[57,80],[74,67],[77,76],[52,94]],[[91,55],[105,59],[96,79],[111,87],[96,102],[83,91],[94,83],[82,76]],[[133,58],[152,49],[145,75],[133,74],[143,89],[130,98],[124,85]],[[50,108],[75,92],[83,105],[65,122],[78,126],[60,140],[50,137]],[[100,103],[118,95],[116,120],[128,131],[113,146],[100,135],[109,125],[95,118]],[[144,111],[152,107],[151,134],[141,149],[133,140]],[[61,149],[76,136],[92,144],[78,165],[92,172],[80,187],[67,177],[75,164]],[[115,155],[129,145],[140,158],[124,173],[139,185],[126,198],[115,179],[104,168]],[[47,177],[64,185],[68,197],[49,197]]];
  for(const[i,p]of shapes.entries()){c.layers.push(poly(p,i%3?'#205794':'#357CBD','body',.85));c.layers.push(line([...p,p[0]],'#174C88',.3,'body',.7));}
  network(c,[[[53,45],[101,18],[77,56],[53,45]],[[78,100],[122,67],[104,112],[78,100]],[[94,174],[146,143],[117,190],[94,174]]],'#1F5390',.7,'body',.8);
  c.layers.push(poly([[47,58],[52,77],[46,89],[40,78]],'#EEEEEA','leftSleeve'),poly([[153,58],[148,77],[154,89],[160,78]],'#EEEEEA','rightSleeve'));cuffs(c,[[4,'#EEEDE7']]);return c;
},'Royal-blue body with separately drawn angular graffiti facets, nested outline triangles and darker hooked forms, plain blue sleeves, white underarm inserts and white collar/cuffs.', 'The source angular field needs additional smaller facets and corrected overlaps; preserve this manual trace as draft until the entire motif map matches.');

add('Troyes','away',()=>{
  const c=base('#EAE5D8','#242A2B','#272C2D');
  for(const m of [false,true])for(let j=0;j<11;j++){
    const pts=[];for(let i=0;i<=54;i++){const y=i*3.7,x=50+j*2.1+16*Math.sin(Math.min(y,125)/125*Math.PI/2);pts.push([m?200-x:x,y]);}
    c.layers.push(line(pts,'#CBB294',j%4===0?.45:.2,'body',.6));
  }
  for(const x of [82,93,104,115])c.layers.push(path(`M${x-8} 0Q${x+2} 70 ${x} 200H${x+3}Q${x+5} 70 ${x-5} 0Z`,'#F1EBDD','body',.75));
  neck(c,[['#222829',.8],['#E9E1D2',2],['#242A2B',.45]]);cuffs(c,[[.85,'#272D2E']]);return c;
},'Ivory shirt with fine tan vertical curves bending around the waist, occasional wider pale lines, plain ivory sleeves and narrow dark neckline/cuff edges.');
