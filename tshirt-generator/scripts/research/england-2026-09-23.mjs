// Source-specific artwork studies. Re-running may update drafts only.
import fs from 'node:fs/promises';
import sharp from 'sharp';
import {neutralConfig,renderShirt,SURFACE_VERSION} from '../../src/lib/shirt-renderer.js';
const read=async p=>JSON.parse(await fs.readFile(p,'utf8'));
const teams=await read('data/normalized/teams.json');
const path=(d,fill,clip='all',opacity=1)=>({type:'path',d,fill,clip,opacity});
const rect=(x,y,width,height,fill,clip='all',opacity=1)=>({type:'rect',x,y,width,height,fill,clip,opacity});
const poly=(points,fill,clip='all',opacity=1)=>({type:'polygon',points,fill,clip,opacity});
const n=v=>+v.toFixed(3);
function base(body,collar,cuff=collar){const c=neutralConfig(body);c.colors.collar=collar;c.colors.leftCuff=c.colors.rightCuff=cuff;c.collar={shape:'round'};c.detailLayers=[];return c}
function round(c,outer,inner,inside=c.colors.body){c.collar={shape:'custom',layers:[path('M81.5 3Q100 0 118.5 3C118 17 110 23 100 23C89 23 82 17 81.5 3Z',outer),path('M84 3Q100 2 116 3C116 14 109 20 100 20C91 20 84 14 84 3Z',inner),path('M86 3Q100 4 114 3C113 13 108 17 100 17C92 17 87 13 86 3Z',inside)]}}
function cuffEdges(c,color,depth=1.8,offset=0){c.detailLayers.push(path(`M18 ${n(81-offset-depth)}Q32 ${n(87-offset-depth)} 47 ${n(90-offset-depth)}L47 ${n(90-offset)}Q32 ${n(87-offset)} 18 ${n(81-offset)}Z`,color,'leftSleeve'),path(`M152 ${n(90-offset-depth)}Q167 ${n(87-offset-depth)} 182 ${n(81-offset-depth)}L182 ${n(81-offset)}Q167 ${n(87-offset)} 152 ${n(90-offset)}Z`,color,'rightSleeve'))}
function shoulders(c,color){for(let i=0;i<3;i++){const y=i*3.8;c.layers.push(path(`M80 ${3+y}Q68 ${12+y} 46 ${21+y}Q35 ${26+y} 29 ${48+y}L30.2 ${48.5+y}Q36 ${27.5+y} 46.5 ${22.5+y}Q68.5 ${13.5+y} 81 ${4+y}Z`,color),path(`M120 ${3+y}Q132 ${12+y} 154 ${21+y}Q165 ${26+y} 171 ${48+y}L169.8 ${48.5+y}Q164 ${27.5+y} 153.5 ${22.5+y}Q131.5 ${13.5+y} 119 ${4+y}Z`,color))}}
const pending=[];
async function save(name,variant,key,c,observations,page,image,local,extra={}){const team=teams.find(t=>t.name===name&&t.country_name==='England');if(!team)throw Error(name);const r={schemaVersion:1,team_id:team.id,team_name:name,country_name:'England',variant,kit_season:extra.season||'2026/27',revision:extra.revision||'r001',status:'draft',surface_version:SURFACE_VERSION,references:[{publisher:extra.publisher||`${name} official store`,page_url:page,image_url:image,local_path:local,checked_at:new Date().toISOString(),source_type:'official',variant,kit_season:extra.season||'2026/27'}],color_evidence:{basis:'Estimated visually from the saved official front photograph; not published official HEX or textile color specifications.',official_hex:false,values:c.colors},observations,omitted:'Club emblems, sponsors, manufacturer logo symbols, lettering, badges and tiny textile weave. Observed garment trim is retained.',research_log:[{date:new Date().toISOString(),action:'Reviewed correct-season official product page and front photographs; traced observed panel layout on the mandatory reference-front-2 master.'}],config:c};
const f=`data/kits/${team.id}-${variant}-${r.revision}.json`;try{const old=await read(f);if(old.status==='ready'){console.log('Preserved ready',key);return}}catch(e){if(e.code!=='ENOENT')throw e}await fs.writeFile(f,JSON.stringify(r,null,2)+'\n');const svg=renderShirt(c,`${name} · ${r.kit_season} · ${variant}`);await fs.writeFile(`artifacts/continuation-2026-09-23/${key}.svg`,svg);await sharp(Buffer.from(svg),{density:144}).png().toFile(`artifacts/continuation-2026-09-23/${key}.png`);pending.push({key,path:f,local});}
const shopRef=async(key,i)=>{const p=await read(`artifacts/${key}-product.json`);return ['https:'+p.images[i],`data/research/references/${key}-2026-27-${i}.webp`]};
// Brentford away: sixteen fine vertical body lines, diagonal sleeve lines, cream ribbing.
{
const c=base('#20202F','#E6DBCA');round(c,'#E6DBCA','#E6DBCA','#DDD3C4');
for(let x=49;x<153;x+=6.7)c.layers.push(rect(x,0,.32,201,'#D7CFC2','body',.85));
for(let x=11;x<73;x+=6.5){c.layers.push(poly([[x+17,15],[x+17.35,15],[x-6,94],[x-6.35,94]],'#D7CFC2','leftSleeve',.85),poly([[200-x-17,15],[200-x-17.35,15],[206-x,94],[206.35-x,94]],'#D7CFC2','rightSleeve',.85))}
await save('Brentford','away','brentford-away',c,'Navy body and sleeves with evenly spaced thin cream vertical pinstripes; sleeve lines run diagonally with the sleeve grain. Broad cream crew neckline and cream cuffs.','https://shop.brentfordfc.com/kit/2627-away-kit/adult/5835_brentford-2627-adult-authentic-away-shirt.html','https://shop.brentfordfc.com/siteimg/prodhires/5835-515.jpg','data/research/references/brentford-away-2026-27.jpg');
}
// Brentford home: broad white centre stripe, two red columns, yellow piping.
{
const c=base('#D50930','#19161A');c.layers.push(rect(45,0,16,202,'#F3EFF3','body'),rect(86.5,0,27,202,'#F3EFF3','body'),rect(139,0,17,202,'#F3EFF3','body'));
// Subtle woven waves observed across both stripe colors, rendered as filled curves.
for(let y=0;y<201;y+=3.2)c.layers.push(path(`M0 ${n(y)}C26 ${n(y-9)} 42 ${n(y+9)} 68 ${n(y)}S109 ${n(y-9)} 132 ${n(y)}S174 ${n(y+9)} 201 ${n(y)}L201 ${n(y+.38)}C174 ${n(y+9.38)} 157 ${n(y+.38)} 132 ${n(y+.38)}S91 ${n(y-8.62)} 68 ${n(y+.38)}S26 ${n(y-8.62)} 0 ${n(y+.38)}Z`,'#FFFFFF','all',.055));
c.layers.push(path('M51 72Q57 105 56 137L54 194L57 195L59 137Q59 105 54 71Z','#EAB23A','body'),path('M149 72Q143 105 144 137L146 194L143 195L141 137Q141 105 146 71Z','#EAB23A','body'));
round(c,'#19161A','#EAB23A','#EFECEE');cuffEdges(c,'#EAB23A',2.5);
await save('Brentford','home','brentford-home',c,'Red with a broad central white stripe and white outer torso stripes. Plain red sleeves; subtle curving tonal jacquard across the shirt. Black crew collar and cuffs with honey-yellow edges; yellow side piping. Official design is retained for two seasons, 2026–2028.','https://shop.brentfordfc.com/kit/2628-home-kit/adult/5834_brentford-2628-adult-authentic-home-shirt.html','https://shop.brentfordfc.com/siteimg/prodhires/5834-511.jpg','data/research/references/brentford-home-2026-28.jpg',{season:'2026–2028'});
}
// Newcastle home: concentric widths around a broad central black column.
{
const c=base('#F1EFF0','#111419');
const bands=[[94,12],[88,3],[83,1.4],[78,2],[63,1.4],[58,2.3],[50,5],[40,8]];
for(const [x,w]of bands){c.layers.push(rect(x,0,w,202,'#111419'));if(x!==94)c.layers.push(rect(200-x-w,0,w,202,'#111419'))}
// Sleeve columns follow the sleeve grain independently of torso stripes.
for(const [x,w]of [[20,3],[26,1.3],[31,2],[38,1.5],[43,5]]){c.layers.push(poly([[x+12,16],[x+12+w,16],[x-4+w,94],[x-4,94]],'#111419','leftSleeve'),poly([[188-x,16],[188-x-w,16],[204-x-w,94],[204-x,94]],'#111419','rightSleeve'))}
// Light blue outer shoulder tape and collar/cuff edges.
c.layers.push(path('M81 2L59 14L43 22Q34 26 28 49L30 50Q37 29 45 26L62 18L83 5Z','#74BBD0'),path('M119 2L141 14L157 22Q166 26 172 49L170 50Q163 29 155 26L138 18L117 5Z','#74BBD0'));
shoulders(c,'#F1EFF0');round(c,'#111419','#74BBD0','#111419');cuffEdges(c,'#74BBD0',1.5);
await save('Newcastle United','home','newcastle-home',c,'White ground with broad central black stripe, narrow graduated black pinstripes and wider outer black columns. The motif continues on both sleeves. Black crew collar/cuffs with sky-blue edge, sky-blue shoulder seam and white shoulder tapes.','https://shop.newcastleunited.com/products/newcastle-united-adidas-26-27-home-shirt',...await shopRef('newcastle-home',4));
}
// Newcastle away: seven horizontal rows of castellated fabric motifs.
{
const c=base('#142639','#101B2A');
for(let row=0;row<7;row++){const y=22+row*26;c.layers.push(rect(0,y,200,3,'#234057','all',.50));for(let x=3+(row%2)*8;x<200;x+=18){c.layers.push(poly([[x,y+3],[x+3,y+3],[x+3,y+7],[x+7,y+7],[x+7,y+3],[x+10,y+3],[x+10,y+12],[x+7,y+12],[x+7,y+17],[x+3,y+17],[x+3,y+12],[x,y+12]],'#234057','all',.55))}}
shoulders(c,'#EDECEE');c.collar={shape:'custom',layers:[path('M81 3Q100 1 119 3L116 13L100 30L84 13Z','#EEEDEF'),path('M83 3Q100 2 117 3L114 12L100 27L86 12Z','#101B2A'),path('M85 3Q100 3 115 3L113 11L100 23L87 11Z','#6AB4C5'),path('M88 3Q100 4 112 3L111 10L100 19L89 10Z','#142639')]};
cuffEdges(c,'#6AB4C5',1.9);cuffEdges(c,'#EEEDEF',1.3,4.7);
await save('Newcastle United','away','newcastle-away',c,'Dark navy base with seven tonal blue horizontal repeat bands and castellated block motifs across torso and sleeves. V-neck has outer white, navy middle and sky-blue inner border. Navy cuffs have white stripe above sky-blue edge; white shoulder tapes.','https://shop.newcastleunited.com/products/newcastle-united-adidas-26-27-away-shirt',...await shopRef('newcastle-away',0));
}
// Forest away: source-specific tonal diagonal leaf/chevron fields, dark green and red trim.
{
const c=base('#12342B','#082A21');
for(let col=0;col<6;col++)for(let row=0;row<5;row++){const x=col*35-9+(row%2)*11,y=row*49-15;let d='';for(let j=0;j<16;j++){const yy=y+j*2.6,w=15*Math.sin(Math.PI*(j+.7)/17);d+=`M${n(x)} ${n(yy+9)}L${n(x-w)} ${n(yy)}L${n(x-w)} ${n(yy+.6)}L${n(x)} ${n(yy+9.6)}L${n(x+w)} ${n(yy)}L${n(x+w)} ${n(yy-.6)}Z `}c.layers.push(path(d,'#1D493A','all',.38))}
shoulders(c,'#EF163C');c.collar={shape:'custom',layers:[path('M81 3Q100 0 119 3Q119 18 102 25Q83 22 81 3Z','#082A21'),path('M84 3Q100 2 116 3Q113 15 97 21L87 17Q82 11 84 3Z','#EA1235'),path('M87 3Q100 4 113 3Q112 13 99 18L90 15Q87 10 87 3Z','#12342B'),path('M114 9Q110 17 94 23L90 23Q106 17 114 7Z','#EF163C')]};cuffEdges(c,'#EF163C',1.8);
await save('Nottingham Forest','away','forest-away',c,'Deep forest green with large subtle overlapping diagonal fern/herringbone fields on body and sleeves. Red shoulder tapes, wrap-over green neckline with red piping, green cuffs with red edge. Tonal pattern placement remains an approximation pending closer tracing.','https://shop.nottinghamforest.co.uk/products/nffc-26-27-away-shirt',...await shopRef('forest-away',2));
}
// Manchester United home: plain red fabric, polo collar, white-black-white cuff piping.
{
const c=base('#CC1232','#BE1230','#EEEFF1');shoulders(c,'#F0F0F2');
c.layers.push(path('M57 21Q66 11 80 6L82 8Q67 18 58 28Z','#DE2540'),path('M143 21Q134 11 120 6L118 8Q133 18 142 28Z','#DE2540'));
c.collar={shape:'custom',layers:[path('M82 2L100 12L118 2L122 20L109 25L100 15L91 25L78 20Z','#C21130'),path('M82 2L78 20L80 21L84 3Z','#F4F1F0'),path('M85 3L81 21L83 22L87 4Z','#1A1B20'),path('M88 4L84 22L86 23L90 5Z','#F4F1F0'),path('M118 2L122 20L120 21L116 3Z','#F4F1F0'),path('M115 3L119 21L117 22L113 4Z','#1A1B20'),path('M112 4L116 22L114 23L110 5Z','#F4F1F0'),rect(99,15,2,20,'#BD102B')]};
cuffEdges(c,'#191A20',1.2,1.5);cuffEdges(c,'#CE1232',1,4);
const images=await read('artifacts/manutd-home-images.json');
await save('Manchester United','home','manutd-home',c,'Solid red torso and sleeves, slightly brighter shoulder insert, white shoulder tapes. Red fold-over polo collar with white/black/white edging on both flaps and short tonal placket. White cuffs with thin black middle line and red upper edge.','https://store.manutd.com/en-gb/p/manchester-united-2627-home-jersey-5743',images[0],'data/research/references/manutd-home-2026-27-0.jpg');
}
// Manchester United away: blue flowing tonal channels and red/white V-neck.
{
const c=base('#0D3E98','#0D3E98','#0D3E98');
for(let band=-1;band<10;band++)for(let j=0;j<4;j++){const x=band*21+j*1.5,w=j===0?.45:.22;c.layers.push(path(`M${x} -5C${x+8} 20 ${x+8} 40 ${x+2} 65C${x-4} 90 ${x-4} 110 ${x+2} 135C${x+8} 160 ${x+8} 182 ${x} 205L${x+w} 205C${x+8+w} 182 ${x+8+w} 160 ${x+2+w} 135C${x-4+w} 110 ${x-4+w} 90 ${x+2+w} 65C${x+8+w} 40 ${x+8+w} 20 ${x+w} -5Z`,'#74A6E0','all',.19))}
shoulders(c,'#D41A39');c.collar={shape:'custom',layers:[path('M81 3Q100 0 119 3L116 14L100 31L84 14Z','#174594'),path('M83 3Q100 2 117 3L114 13L100 27L86 13Z','#EAECEE'),path('M85 3Q100 3 115 3L112 12L100 24L88 12Z','#CF1536'),path('M88 3Q100 4 112 3L110 11L100 20L90 11Z','#13459D')]};cuffEdges(c,'#D41A39',2.1);cuffEdges(c,'#EEEFF2',1.3,2.1);
const images=await read('artifacts/manutd-away-images.json');await save('Manchester United','away','manutd-away',c,'Royal blue body and sleeves with slender groups of wavy vertical tonal channels. Blue V-neck has white middle and red inner edging; cuffs have white line above red edge; red shoulder tapes.','https://store.manutd.com/en-gb/p/manchester-united-2627-away-jersey-5752',images[5],'data/research/references/manutd-away-2026-27-5.jpg');
}
// Ipswich home: replace earlier generic fans with narrow nested diamond lattice.
{
const c=base('#10398E','#101D42');
for(let y=-10;y<200;y+=30)for(let x=12;x<201;x+=23){let d='';for(const w of [11.5,8.9,6.6,4.5,2.6]){const t=.65;d+=`M${x} ${y}L${x+w} ${y+15}L${x} ${y+30}L${x-w} ${y+15}ZM${x} ${y+1.2}L${x-w+t} ${y+15}L${x} ${y+28.8}L${x+w-t} ${y+15}Z `}c.layers.push(path(d,'#4A6EB5','all',.26))}
round(c,'#101D42','#E7EAF0','#101D42');cuffEdges(c,'#E7EAF0',.9);
const old=await read('data/kits/team_e5d01d1e2dafaef8522d-home-r002.json');const ref=old.references.find(r=>r.local_path.includes('front'));await save('Ipswich Town','home','ipswich-home',c,'Royal blue ground. Rows of elongated, nested tonal diamonds form pointed fans across the body and sleeves, approximately four full diamonds across the torso. Navy crew collar with thin white inner piping; navy cuffs with thin white edge. No white side panels are visible in this front product photo.',ref.page_url,ref.image_url,ref.local_path,{revision:'r003'});
}

// Liverpool away: white front, double red V-neck bands and double red cuffs.
{
const c=base('#EEF0F3','#EEF0F3','#EEF0F3');shoulders(c,'#B52040');
c.collar={shape:'custom',layers:[path('M81 3Q100 1 119 3L116 13L100 29L84 13Z','#B52040'),path('M83 3Q100 2 117 3L114 12L100 26L86 12Z','#EEF0F3'),path('M85 3Q100 3 115 3L112 11L100 23L88 11Z','#B52040'),path('M87 3Q100 4 113 3L110 10L100 20L90 10Z','#EEF0F3')]};
cuffEdges(c,'#B52040',1.1,.7);cuffEdges(c,'#B52040',2.1,3.3);
const urls=await read('artifacts/liverpool-away-images.json');await save('Liverpool','away','liverpool-away',c,'White short-sleeve shirt with red shoulder tapes, two red bands around a white V-neck and two red cuff bands separated by white. Unprinted front is otherwise white; crest/sponsor/lettering omitted.','https://www.adidas.co.uk/liverpool-fc-26-27-away-jersey/KA6860.html',urls[3],'data/research/references/liverpool-away-adidas-3.jpg',{publisher:'adidas official manufacturer store'});
}

await fs.writeFile('artifacts/continuation-2026-09-23/pending.json',JSON.stringify(pending,null,2));
const thumbs=[];for(const [i,p]of pending.entries()){thumbs.push({input:await sharp(`artifacts/continuation-2026-09-23/${p.key}.png`).resize(360,360).flatten({background:'#dddde1'}).png().toBuffer(),left:i%3*360,top:Math.floor(i/3)*360})}
if(thumbs.length)await sharp({create:{width:1080,height:Math.ceil(thumbs.length/3)*360,channels:3,background:'#dddde1'}}).composite(thumbs).png().toFile('artifacts/continuation-2026-09-23/review-grid.png');
console.log(pending.map(p=>p.key));
