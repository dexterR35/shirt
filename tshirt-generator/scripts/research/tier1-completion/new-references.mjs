import {base,path,poly,rect,neck,cuffs,add,ink,line} from './shared.mjs';
{
  const c=base('#F7F7F5','#223966','#223966');
  for(const x of [54,91,128])c.layers.push(rect(x,0,18,200,'#223966','body'));
  for(const mirror of [false,true])c.layers.push(poly([[23,18],[33,23],[41,83],[29,86],[17,70]].map(([x,y])=>[mirror?200-x:x,y]),'#223966',mirror?'rightSleeve':'leftSleeve'));
  cuffs(c,[[5,'#223966']]);
  add('Real Sociedad','Spain','home',c,'Archive season-listing image independently identifies 2026/27 Home: three broad navy body stripes on white, striped sleeves, navy round ring and cuffs. Listing is retained as evidence because the detail page returns 404; unobserved equipment fields remain null.');
}
{
  const c=base('#24272A','#202326','#202326');
  for(let row=-1;row<45;row++){
    let d='';for(let col=-1;col<30;col++){
      const x=col*7+(row%2)*3.5,y=row*5;
      d+=`M${x} ${y}l5 3.8 1.9-.4-5.4-4.1Z`;
    }c.layers.push(path(d,row%2?'#303336':'#2C3033','all',.75));
  }
  add('Real Sociedad','Spain','away',c,'Archive season-listing image independently identifies 2026/27 Away: charcoal shirt with repeated small diagonal tonal slashes across body and sleeves, dark plain cuffs and original round ring. Exact fine woven texture simplified; unavailable detail fields remain null.');
}
{
  const c=base('#124F88','#EBD342','#EBD342');neck(c,[['#EBD342',2],['#1C527C',.3],['#EBD342',1]]);cuffs(c,[[5,'#EBD342'],[2.7,'#1C527C'],[2.2,'#EBD342']]);
  // Angular fracture network observed on the front, continued across covered areas.
  const paths=[[[51,28],[91,57],[71,93],[119,122],[85,161],[111,200]],[[143,18],[106,63],[140,94],[104,132],[151,168]],[[48,66],[75,70],[103,37],[150,51]],[[48,110],[83,114],[111,81],[153,108]],[[48,149],[80,146],[113,176],[151,153]],[[49,187],[79,181],[121,149],[153,197]],[[66,19],[65,39],[50,50]],[[119,24],[136,47],[121,76]],[[57,87],[81,67],[85,109]],[[144,119],[130,140],[149,146]]];
  for(const p of paths)c.layers.push(line(p,'#143E6C',.8,'body',.6));
  for(const [x,clip]of [[13,'leftSleeve'],[154,'rightSleeve']])c.layers.push(...await ink('Petrolul Ploiești','away',{box:[282,651,420,360],width:260,mode:'dark',threshold:2,blur:16},{x,y:20,width:33,height:60,color:'#143E6C',opacity:.55,clip}));
  c.layers.push(poly([[49,80],[54,93],[51,129]],'#EBD342','body'),poly([[151,80],[146,93],[149,129]],'#EBD342','body'));
  add('Petrolul Ploiești','Romania','away',c,'2025/26 Away fallback for equipment in 2026: blue field with tonal angular fracture lines, yellow collar/cuffs with a fine blue stripe, small yellow underarm inserts. Source season is retained as 2025/26, never relabeled 2026/27. Original round collar construction used.');
}
