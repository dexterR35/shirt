import {saveProfiles} from './fka-save-profiles.mjs';
import {base,neck,cuffs,shoulderBands,path,rect,poly} from './png-paint-helpers.mjs';

const profiles=[];
const add=(name,variant,make,observations)=>profiles.push({country:'Romania',name,variant,make,observations});
const n=x=>+x.toFixed(3);

add('Dinamo București','away',()=>{
  const c=base('#EEEDDF','#BD2933','#BD2933');
  for(const x of [21,46,72,98,124,150,176])c.layers.push(rect(x,0,9,200,'#E3E0CC'));
  neck(c,[['#C02B35',1.1],['#241F20',1],['#C02B35',1.1]]);
  cuffs(c,[[4.8,'#C02B35'],[3.4,'#241F20'],[1.1,'#C02B35']]);
  c.layers.push(path('M46 60Q53 72 47 82L44 73Z','#BC2330','leftSleeve'),path('M154 60Q147 72 153 82L156 73Z','#BC2330','rightSleeve'));
  return c;
},'Ivory shirt with pale cream vertical bands continuing across sleeves, red/black/red collar and cuff edging, and small red underarm inserts. Very faint printed mottling within the ivory fields is not yet traced; the draft retains only the original PNG fabric texture.');

add('FC Botoșani','away',()=>{
  const c=base('#EB2638');
  c.colors.leftSleeve=c.colors.rightSleeve=c.colors.leftCuff=c.colors.rightCuff='#F36E6C';
  c.layers.push(path('M16 40L24 23L78 2L77 16Q51 17 47 54L35 67Z','#EB2638','leftSleeve'),path('M184 40L176 23L122 2L123 16Q149 17 153 54L165 67Z','#EB2638','rightSleeve'));
  for(let row=0;row<70;row++){
    let d='';
    for(let col=0;col<26;col++){
      const x=49+col*4.1,y=3+row*2.8+.8*Math.sin(col*.8+row*.05);
      const strength=.2+.8*(.5+.5*Math.sin(col*.48+row*.08));
      const h=n(.4+1.1*strength);
      for(const offset of [0,.6,1.2])d+=`M${n(x+offset)} ${n(y)}h.23v${h}h-.23Z`;
    }
    c.layers.push(path(d,'#F37372','body',.32));
  }
  c.layers.push(path('M67 12Q64 25 52 32Q44 37 48 55Q52 68 47 79Q41 62 40 48Q38 32 46 25Z','#F3F1E9'),path('M133 12Q136 25 148 32Q156 37 152 55Q148 68 153 79Q159 62 160 48Q162 32 154 25Z','#F3F1E9'));
  shoulderBands(c,'#F3F1E9',{count:2,width:1.2,gap:.8,end:37,inset:2.4});
  return c;
},'Red body with small grouped vertical knit-like ticks, coral lower sleeves, red upper sleeves and curved white raglan inserts. Two white shoulder tapes are placed inside the PNG shoulder seam. The repeated tick field is adapted from the saved image, not an imported team palette.');

add('Oțelul Galați','away',()=>{
  const c=base('#103B54','#12384D','#143D54');
  // Faded hexagon field across upper chest and two lower side columns.
  for(let row=0;row<48;row++){
    let d='';
    for(let col=0;col<24;col++){
      const x=49+col*4.5+(row%2)*2.25,y=13+row*3.85;
      if(y>70&&x>75&&x<129)continue;
      if(y>177)continue;
      const points=Array.from({length:6},(_,k)=>[n(x+1.8*Math.cos(k*Math.PI/3)),n(y+1.8*Math.sin(k*Math.PI/3))]);
      d+=`M${points.map(p=>p.join(' ')).join('L')}Z`;
    }
    if(d)c.layers.push(path(d,row<15?'#18455F':'#1B4D68','body',row<15?.3:.35));
  }
  c.layers.push(path('M46 40Q37 57 30 82L46 85Q51 81 52 77L56 129Q45 111 43 96L39 77Z','#E1E5E2'),path('M154 40Q163 57 170 82L154 85Q149 81 148 77L144 129Q155 111 157 96L161 77Z','#E1E5E2'));
  c.layers.push(path('M75 13Q48 17 43 35L42.4 34.6Q47.4 16.4 74.8 12.4Z','#DCE4E3'),path('M125 13Q152 17 157 35L157.6 34.6Q152.6 16.4 125.2 12.4Z','#DCE4E3'));
  c.layers.push(path('M55 122Q55 160 51 197H50.4Q54.4 160 54.4 122Z','#E1E5E2','body'),path('M145 122Q145 160 149 197H149.6Q145.6 160 145.6 122Z','#E1E5E2','body'));
  shoulderBands(c,'#E6EBE7',{count:2,width:1.3,gap:.9,end:40,inset:2.5});
  neck(c,[['#173C51',2.9],['#E3E8E5',.4]]);
  cuffs(c,[[.7,'#E5E9E5']]);
  return c;
},'Deep navy-teal shirt with a faint hexagon field, pale underarm/side inserts, thin pale raglan and lower side piping, white shoulder tapes and thin cuff edges. Source resolution limits fine mesh detail; the drawn field and insert boundaries still need closer comparison.');

add('Sepsi OSK','away',()=>{
  const c=base('#EFF1EF');
  const shapes=[
    [[54,10],[58,32],[65,18]],[[66,9],[68,24],[74,17]],[[42,25],[46,38],[52,31]],[[74,27],[66,42],[80,38]],[[82,21],[85,39],[88,33]],[[95,26],[100,37],[90,35]],[[119,10],[116,30],[128,23]],[[131,17],[126,40],[136,30]],[[143,22],[149,43],[155,34]],
    [[57,41],[55,60],[66,51]],[[73,47],[82,57],[79,44]],[[88,45],[91,65],[94,62]],[[102,45],[107,57],[114,54]],[[132,44],[127,60],[139,52]],[[145,50],[141,70],[150,67]],
    [[52,73],[60,89],[67,75]],[[73,74],[77,90],[81,85]],[[84,79],[96,92],[93,78]],[[114,74],[115,92],[121,84]],[[130,73],[134,91],[141,87]],[[144,89],[153,99],[145,103]],
    [[57,98],[52,116],[65,110]],[[71,101],[67,120],[77,114]],[[88,96],[91,114],[97,108]],[[107,105],[105,121],[114,117]],[[126,106],[122,124],[133,118]],[[139,112],[148,125],[151,109]],
    [[52,130],[64,139],[58,148]],[[67,133],[77,142],[80,131]],[[85,125],[82,146],[93,139]],[[105,137],[101,154],[115,148]],[[125,131],[129,151],[136,141]],[[146,132],[137,151],[151,145]],
    [[58,153],[65,168],[68,156]],[[78,153],[71,170],[81,162]],[[88,164],[95,177],[95,163]],[[111,155],[116,177],[119,161]],[[130,160],[123,179],[135,170]],[[145,157],[144,176],[153,166]],
    [[50,181],[59,197],[68,185]],[[76,180],[70,199],[85,190]],[[95,181],[90,198],[102,194]],[[115,184],[125,196],[126,179]],[[137,180],[132,196],[147,193]],
    [[26,32],[31,47],[36,38]],[[32,45],[39,57],[37,43]],[[16,59],[29,64],[21,70]],[[29,66],[35,80],[38,70]],[[41,63],[40,76],[47,72]],
    [[169,31],[165,48],[175,41]],[[160,42],[155,59],[168,53]],[[181,54],[176,68],[186,65]],[[165,63],[170,81],[173,70]],
    [[49,18],[53,28],[56,16]],[[59,29],[63,37],[67,33]],[[78,12],[81,24],[85,16]],[[103,25],[106,35],[110,30]],[[136,10],[141,19],[145,14]],
    [[48,47],[51,59],[54,53]],[[63,54],[65,64],[69,57]],[[75,60],[78,69],[82,62]],[[98,59],[102,69],[106,64]],[[116,60],[121,70],[124,63]],[[136,59],[139,68],[142,61]],
    [[59,66],[60,76],[65,70]],[[79,71],[82,77],[85,68]],[[98,76],[105,84],[102,72]],[[122,83],[128,95],[129,84]],[[145,75],[150,83],[153,76]],
    [[53,91],[55,100],[59,94]],[[78,94],[83,101],[85,93]],[[97,117],[102,127],[102,116]],[[135,98],[142,105],[142,97]],[[144,125],[150,131],[150,123]],
    [[53,120],[61,128],[63,118]],[[77,121],[78,131],[84,127]],[[92,131],[97,140],[99,128]],[[117,123],[120,133],[123,126]],
    [[63,144],[70,152],[73,143]],[[84,150],[89,157],[94,151]],[[102,158],[104,169],[107,162]],[[138,148],[140,157],[145,150]],
    [[53,167],[59,174],[62,164]],[[80,169],[85,180],[87,170]],[[113,175],[118,184],[121,176]],[[136,173],[141,180],[144,172]],
    [[28,25],[31,33],[35,27]],[[37,35],[39,43],[43,38]],[[22,45],[25,55],[29,49]],[[18,71],[22,79],[25,74]],[[157,28],[162,35],[163,27]],[[172,45],[176,51],[178,43]],[[154,63],[157,73],[162,67]],[[178,73],[181,80],[185,72]],
  ];
  for(const [i,points] of shapes.entries())c.layers.push(poly(points,i%3===0?'#CED4D4':'#DFE3E1','all',.75));
  for(const [x,y] of [[67,60],[122,95],[95,143],[103,181]]){
    for(let j=0;j<3;j++)c.layers.push(poly([[x+j*2,y],[x+7+j*2,y-10],[x+6+j*2,y-5]],'#D0D6D4','body',.75));
  }
  shoulderBands(c,'#E0E4E3',{count:3,width:1,gap:.8,end:35,inset:2.5});
  cuffs(c,[[2.5,'#E4E8E5'],[1.9,'#EFF1EF']]);
  return c;
},'White shirt with pale scattered triangular shards of different sizes, several grouped narrow slashes and pale shoulder tapes. Visible fragments are placed individually across body and sleeves; all sponsor, city and club emblems are omitted.');

const pending=new Map([
  ['Dinamo București:away','Trace the faint ivory printed mottling inside the broad pale stripes; stripes and trim alone remain incomplete.'],
  ['Oțelul Galați:away','Refine the fading hexagon field and pale mesh insert shapes using a clearer front reference.'],
]);
for(const p of profiles)p.remaining=pending.get(`${p.name}:${p.variant}`);
await saveProfiles(profiles,'mandatory-romania-next-2026-09-23',{reviewed:process.argv.includes('--reviewed')?profiles.map(p=>`${p.name}:${p.variant}`).filter(k=>!pending.has(k)):[]});
