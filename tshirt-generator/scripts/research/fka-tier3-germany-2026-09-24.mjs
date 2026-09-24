import fs from 'node:fs/promises';import crypto from 'node:crypto';
import {refinementBatch,base,neck,cuffs,rect,path,poly,panels,line,sidePiping} from './tier2-refinement-helpers.mjs';
import {tracePatch,tileTrace,placeTrace} from './tier1-42/trace.mjs';
const batch='tier3-germany-2026-09-24';const rows=JSON.parse(await fs.readFile('artifacts/footballkitarchive/3-liga-2026-27/source-order.json'));
const scope=await Promise.all(rows.map(async r=>({...r,country:'Germany',key:`${r.name}:${r.variant}`,reference_path:r.reference,reference_sha256:crypto.createHash('sha256').update(await fs.readFile(r.reference)).digest('hex')})));
const {add,ink,save}=await refinementBatch(batch,[],scope);const white='#F3F3F1',black='#181B20';
const stripes=(c,xs,w,col,clip='body')=>xs.forEach(x=>c.layers.push(rect(x,0,w,200,col,clip)));
const cap=(c,col)=>panels(c,[[76,1],[73,14],[49,25],[37,27],[30,20],[47,12]],col);
const tapes=(c,col)=>{for(let i=0;i<3;i++)panels(c,[[75,5+i*2.8],[75,6.5+i*2.8],[35,27+i*2.8],[35,25.5+i*2.8]],col);};
const raglanLine=(c,col,w=.6)=>{for(const ps of [[[75,10],[51,21],[42,38],[48,70]],[[125,10],[149,21],[158,38],[152,70]]])c.layers.push(line(ps,col,w,'all'));};
const tile=async(c,r,box,w,h,col,{samples=240,mode='dark',threshold=3,blur=8,min=0,max=255,clip='body',opacity=1,reflect=false,x=49,y=0}={})=>{const t=await tracePatch({reference:r.reference_path,box,width:samples,mode,threshold,blur,min,max});tileTrace(c,t,{x:x-w,y,width:w,height:h,color:col,clip,opacity,reflect});return `Discrete constant-color ink from clean crop [${box}], sampled ${samples}px and repeated at ${w} × ${h} internal units; hidden print placement is adapted. No source fabric/photo pixels are embedded.`;};
const packed=(c,layers,col,clip='body',opacity=1)=>{let d='';for(const layer of layers){if(d.length+layer.d.length>18000){c.layers.push(path(d,col,clip,opacity));d='';}d+=layer.d;}if(d)c.layers.push(path(d,col,clip,opacity));};
for(const r of scope){let c,n;
if(r.name==='1. FC Saarbrücken'&&r.variant==='home'){
 c=base('#0984C1','#13232D');stripes(c,Array.from({length:19},(_,i)=>49+i*5.7),.45,'#13232D');c.colors.leftSleeve=c.colors.rightSleeve=black;cap(c,black);cuffs(c,[[2.7,'#F6D43F']]);neck(c,[['#13232D',3],['#F6D43F',.5],['#0984C1',.7]]);n='Blue torso with fine black pinstripes, solid black shoulder caps/sleeves, yellow cuff edges and dark-blue/yellow ring colors. Source pinlines are straightened; all marks removed.';
}
if(r.name==='1. FC Saarbrücken'&&r.variant==='away'){
 c=base(white,black);cuffs(c,[[4.4,black],[3.3,'#1164AA'],[1.1,black]]);panels(c,[[48,76],[54,79],[57,147],[49,161],[48,128]],black);panels(c,[[49,79],[53,80],[55,139],[51,145]],'#1164AA');n='White with black neckline, blue/black cuff bands and black side insert edged blue. The saved worn front and two additional public gallery views show the front/side trim; hidden rear/side construction is not inferred. Plain body, all sponsors and emblems removed.';
}
if(r.name==='Alemannia Aachen'&&r.variant==='home'){
 c=base('#E9B950',black);for(const x of [53,76,99,122,145]){c.layers.push(rect(x,0,11,200,'#262724','body'),rect(x+13,0,.65,200,'#262724','body'));}
 for(let y=0;y<200;y+=4.3)for(const x of [53,76,99,122,145])if(Math.floor(y/20)%3!==1)c.layers.push(poly([[x,y+4],[x+11,y-5],[x+11,y-3.9],[x,y+5.1]],'#C5A052','body',.8));
 c.layers.push(rect(0,62,200,29,'#E9B950','body'));neck(c,[[black,1],['#E9B950',.6],[black,1],['#E9B950',.6]]);cuffs(c,[[4,black],[3.2,'#E9B950'],[2.5,black],[1.7,'#E9B950'],[.9,black]]);n='Gold with five black vertical torso stripes and narrow companion lines, a plain gold sponsor break, diagonal gold distress strokes within portions of the black, and black/gold multi-line cuffs/ring. Distress density adapted from the saved flat front; repeated Capelli shoulder marks removed.';
}
if(r.name==='Alemannia Aachen'&&r.variant==='away'){
 c=base('#1C2028');const aux={...r,reference_path:'artifacts/footballkitarchive/3-liga-2026-27/additional/aachen-away-3.jpg'};n=await tile(c,aux,[373,575,300,330],65,71.5,'#292D34',{samples:300,mode:'light',threshold:2.3,min:20,max:80,clip:'all'});cuffs(c,[[4,'#D5AB32'],[3.3,black],[2.2,'#D5AB32'],[1.5,black],[.7,'#D5AB32']]);neck(c,[[black,4],['#D5AB32',.45]]);c.layers.push(path('M48 195Q100 198 152 195V197Q100 200 48 197Z','#D5AB32','body'));n='Black with faint tonal damask, fine gold hem edge and black/gold striped cuffs. The first archive thumbnail is poor; an independently observed close-up on the same detail page resolves the print, with another gallery image confirming collar/cuff colors. Source crop URL is saved in additional/sources.json. '+n;
}
if(r.name==='FC Ingolstadt'&&r.variant==='home'){
 c=base('#B6272D',black);for(const [ps,col]of [[[[49,9],[86,0],[85,55],[50,77]],'#992229'],[[[85,55],[121,30],[121,90],[85,115]],'#9F242B'],[[[121,90],[152,71],[151,125],[121,146]],'#91212A'],[[[49,135],[86,113],[87,166],[49,185]],'#93212A'],[[[88,166],[122,144],[121,200],[88,200]],'#A12329']])c.layers.push(poly(ps,col,'body'));n='Five large angled tonal quadrilaterals measured from the front; their fine internal print is reduced.';c.colors.leftSleeve=c.colors.rightSleeve=black;cap(c,black);raglanLine(c,white,.4);cuffs(c,[[1,white],[.55,black]]);sidePiping(c,black,6);panels(c,[[49,181],[56,192],[56,200],[49,196]],white);n='Red angular tonal torso field with black raglan sleeves/sides, thin white armhole/cuff piping and small white hem wedges. '+n;
}
if(r.name==='FC Ingolstadt'&&r.variant==='away'){
 c=base(white,black);for(const x of [62,88,114])c.layers.push(rect(x,0,13,200,'#25262B','body'));c.layers.push(rect(0,55,200,29,white,'body'));sidePiping(c,'#25262B',5);raglanLine(c,'#BB3843',.5);cuffs(c,[[3.3,black]]);panels(c,[[49,179],[56,190],[56,200],[49,200]],'#BD2832');n='White with three broad charcoal/black vertical stripes interrupted by the white sponsor field, dark side inserts, red raglan hairline and red lower-side wedges; black collar/cuffs. Fine low-contrast irregular ink in the black stripes is reduced; no printed marks or source fabric shading retained.';
}
if(r.name==='Fortuna Düsseldorf'&&r.variant==='home'){
 c=base(white,white);const t=await tracePatch({reference:r.reference_path,box:[239,898,441,167],width:360,mode:'red',threshold:25,min:25,max:245});for(const y of [8,58,109,159])c.layers.push(...placeTrace(t,{x:49,y,width:102,height:37,color:'#C71636',clip:'body'}));for(const clip of ['leftSleeve','rightSleeve'])c.layers.push(...placeTrace(t,{x:0,y:53,width:200,height:25,color:'#C71636',clip}));panels(c,[[75,4],[74,6],[34,28],[32,25]],black);n='White with four broad red speckled hoops, fading toward the left, plain white ring/cuffs and one broad black shoulder line on each side. Red binary ink extracted from clean bottom hoop crop [239,898,441,167] at 360px, reused at matched hoop scale and adapted over sleeve band; sponsor and crest regions never enter the trace. Fine speckle is reduced for vector paint.';
}
if(r.name==='Fortuna Düsseldorf'&&r.variant==='away'){
 c=base('#EEEFE9');tapes(c,'#BC2C36');neck(c,[['#BC2C36',1],[white,4]]);cuffs(c,[[2.2,'#BC2C36']]);n='Off-white field with three fine red shoulder strips, red cuff edge and white/red ring colors. The source white polo flap is not painted over the original round collar. All red crest/manufacturer/sponsor elements omitted.';
}
if(r.name==='Fortuna Köln'&&r.variant==='home'){
 c=base('#762036');for(const x of [56,79,102,125,148])for(let i=0;i<4;i++)c.layers.push(rect(x+i*1.8,0,.5,200,'#962D47','body',.7));cuffs(c,[[3,'#651A2E']]);n='Claret with five clusters of fine lighter claret vertical lines and solid dark-claret cuff/ring. Tonal grouping measured from the front; source reflections are left to the original fabric. All sponsors and insignia removed.';
}
if(r.name==='Fortuna Köln'&&r.variant==='away'){
 c=base(white);for(const [y,h,col]of [[53,43,black],[55,39,white],[57,35,'#E6252F']])c.layers.push(rect(0,y,200,h,col,'body'));neck(c,[[black,1],[white,.6],['#E6252F',1],[white,.6],[black,.5]]);n='White with a wide red chest band edged white/black above and below, plain white sleeves/cuffs, black/white/red ring trim. Collar flaps omitted and sponsor break is not invented; white HIT lettering removed from the red band.';
}
if(r.name==='Hansa Rostock'&&r.variant==='home'){
 c=base(white,white);c.colors.leftSleeve=c.colors.rightSleeve='#087ABA';for(const [x,w]of [[46,8],[68,12],[93,14],[120,13],[145,8]]){c.layers.push(rect(x,0,w,34,'#087ABA','body'),rect(x,90,w,110,'#087ABA','body'));}
 for(const [x,y,w,h]of [[54,84,14,40],[80,150,13,40],[107,130,13,37],[133,85,12,50],[54,7,14,12],[133,5,12,14]])c.layers.push(rect(x,y,w,h,'#07639D','body'));cap(c,'#087ABA');cuffs(c,[[4.5,white]]);n='White with blue sleeves, block-ended blue vertical strips at the shoulders and lower body, plus darker blue rectangular interruptions within the white channels. Broad white chest field retained with all sponsor blue removed. Unequal block heights measured individually from the saved front, not replaced by a regular stripe preset.';
}
if(r.name==='Hansa Rostock'&&r.variant==='away'){
 c=base(white);neck(c,[['#0B6DAB',.6],[white,4]]);cuffs(c,[[.9,'#0B6DAB']]);n='Plain white with fine blue cuff/collar edge. Source white polo collar is adapted only to ring colors; blue shoulder areas are repeated Reebok logos and are removed with sponsor/badge.';
}
if(r.name==='Jahn Regensburg'&&r.variant==='home'){
 c=base(white,'#771123');c.colors.leftSleeve=c.colors.rightSleeve='#9F1028';stripes(c,[84],32,'#CB1936');panels(c,[[76,3],[72,12],[43,26],[31,60],[26,79],[17,76],[27,28],[44,13]],'#BF1832');cuffs(c,[[4,white],[1.1,'#9F1028']]);n='White with one broad red central stripe, red/claret raglan sleeves and claret ring, off-white cuff band with red edge. Close inspection shows the stripe print includes letters and heraldic emblems: those are all removed with manufacturer shoulder marks and sponsor, preserving the red stripe itself.';
}
if(r.name==='Jahn Regensburg'&&r.variant==='away'){
 c=base('#E81320','#811528');const ls=[];for(let y=-15;y<220;y+=13)for(let x=48;x<153;x+=5)ls.push(line([[x,y],[x+3,y+6],[x+1,y+13],[x+4,y+20]],'#A1222D',.23));const cross=ls.map(l=>({...l,d:l.d.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g,(_,x,y)=>`${(200-Number(x)).toFixed(3)} ${y}`)}));packed(c,[...ls,...cross],'#A1222D');cuffs(c,[[.7,'#811528']]);sidePiping(c,'#811528',4);n='Red with dense thin claret broken diamond/zigzag linework on torso, plain red sleeves, claret side accents and collar ring. Pattern step and spacing measured from the saved Away front; all sponsor/crest and repeated shoulder emblems removed.';
}
if(r.name==='MSV Duisburg'&&r.variant==='home'){
 c=base(white);for(const [y,h]of [[32,31],[96,36],[163,28]]){c.layers.push(rect(0,y,200,h,'#15548E','body'));for(let x=46;x<154;x+=2.7)c.layers.push(poly([[x,y],[x+1.3,y],[x+5,y+h],[x+3.7,y+h]],white,'body'));}tapes(c,'#15548E');neck(c,[['#15548E',.7],[white,3],['#15548E',.6]]);cuffs(c,[[1.3,'#15548E']]);n='White with three broad blue hoops made of closely spaced white slanting cuts, three blue shoulder stripes and narrow blue collar/cuff edges. Two worn gallery fronts establish the pattern; torso lines are straightened to common geometry and continued behind removed sponsor. Branding omitted.';
}
if(r.name==='MSV Duisburg'&&r.variant==='away'){
 c=base('#171E2B');let d='';for(let y=18;y<201;y+=3.4)for(let x=53;x<148;x+=3.4){const opacityScale=.7+.3*Math.cos(x/30);const s=2.45*opacityScale;d+=`M${x.toFixed(2)} ${y.toFixed(2)}h${s.toFixed(2)}v${s.toFixed(2)}h-${s.toFixed(2)}Z`;if(d.length>16000){c.layers.push(path(d,'#245A99','body'));d='';}}if(d)c.layers.push(path(d,'#245A99','body'));c.colors.leftSleeve=c.colors.rightSleeve=black;tapes(c,'#CACDD6');neck(c,[['#CACDD6',3],['#1E3459',1]]);cuffs(c,[[2.6,'#CACDD6'],[.8,'#1E3459']]);n='Black/navy with a dense blue square-grid torso field, solid dark sleeves and silver/blue collar/cuff trim plus three silver shoulder strips. Two worn source fronts establish square spacing and field extent; square brightness simplified to one flat ink with minor size variation. All white logos/sponsor removed.';
}
if(r.name==='Preußen Münster'&&r.variant==='home'){
 c=base('#087A42',white);c.colors.leftSleeve=c.colors.rightSleeve=black;cap(c,black);stripes(c,[57,77,97,117,137],.6,'#178A51');c.colors.leftCuff=c.colors.rightCuff=black;n='Green body with subtle green vertical panel lines, black sleeves/cuffs/shoulders and white ring. Every faint repeated eagle badge in the torso and Jako shoulder symbols is removed, along with the chest branding.';
}
if(r.name==='Preußen Münster'&&r.variant==='away'){
 c=base(white);for(const x of [49,76,103,130])for(const [y,h]of [[0,59],[98,102]]){c.layers.push(rect(x,y,22,h,'#B4D8C4','body'),rect(x+.6,y+.6,20.8,h-1.2,white,'body'));}n='White with four fine pale-green rectangular outlines above and below a plain white chest field. The grey all-over forms inside these rectangles are enlarged eagle-wing fragments from the club emblem; all are removed. Plain white sleeves/cuffs/ring; no polo flaps or sponsor paint.';
}
if(r.name==='Rot-Weiss Essen'&&r.variant==='home'){
 c=base('#E92435',white);n=await tile(c,r,[328,752,468,490],98,102.6,'#CF2838',{mode:'dark',threshold:3.3,min:20,max:180,samples:320,clip:'all'});cuffs(c,[[4,white]]);n='Red with a faint street-map line field across the body/sleeves, white collar and cuffs. Street topology adapted from unobscured lower-front ink; all labels, crests, shoulder dots and sponsor excluded. '+n;
}
if(r.name==='Rot-Weiss Essen'&&r.variant==='away'){
 c=base('#18202B');stripes(c,Array.from({length:140},(_,i)=>i*1.5),.22,'#2B3443','all');neck(c,[[white,1],[black,.5],[white,1],[black,.5],[white,1]]);cuffs(c,[[5,white],[4,black],[3.2,white],[2.3,black],[1.5,white]]);n='Near-black with fine tonal vertical rib lines and white/black multi-line cuff/neck trim. Both archive action photographs were checked; print/panel visibility is limited by the worn pose, and side/rear details are not inferred. All sponsor and insignia removed.';
}
if(r.name==='SC Verl'&&r.variant==='home'){
 c=base('#EFF0F2');n=await tile(c,r,[587,646,190,320],40,67.4,'#E3E5E9',{mode:'dark',threshold:2.5,min:140,max:242,samples:210,clip:'all'});c.layers.push(rect(94,14,12,39,'#25272A','body'),rect(94,91,12,110,'#25272A','body'));neck(c,[[black,3],[white,1]]);n='White with a faint diagonal fragmented tonal print and one black central stripe interrupted by the original white chest field. Black/white ring colors; plain white sleeves/cuffs. '+n;
}
if(r.name==='SC Verl'&&r.variant==='away'){
 c=base('#15181C');neck(c,[['#BFC7CA',3],[black,.6]]);cuffs(c,[[5,'#BFC7CA'],[.8,black]]);raglanLine(c,'#BFC7CA',.65);n='Plain black with pale grey ring/cuff bands and thin curved pale raglan piping. Source folded collar becomes only existing-ring color; all white logos and sponsor removed.';
}
if(r.name==='Sonnenhof Großaspach'&&r.variant==='home'){
 c=base('#B91926',white);for(let y=-15,row=0;y<220;y+=31,row++)for(let x=-10+(row%2)*25;x<225;x+=50){c.layers.push(poly([[x,y],[x+25,y+15.5],[x,y+31]],'#A51722','all'),poly([[x+25,y+15.5],[x+50,y],[x+50,y+31]],'#AD1823','all'));}n='Red with darker paired triangular/polygonal tessellation, plain red cuffs and white ring. Large observed triangles are reconstructed as flat tonal closed shapes; their fine dot screen is reduced, without tracing fabric shadows.';
}
if(r.name==='Sonnenhof Großaspach'&&r.variant==='away'){
 c=base('#F2CF17');const ls=[];for(const clip of ['leftSleeve','rightSleeve'])for(let x=-35;x<230;x+=1.8)ls.push(line([[x,0],[x+30,47],[x+23,90]],'#D5B72C',.3,clip));for(const clip of ['leftSleeve','rightSleeve'])packed(c,ls.filter(l=>l.clip===clip),'#D5B72C',clip,.6);n='Yellow torso with fine tonal angular linework on the sleeves, yellow ring/cuffs. Visible sleeve line density retained as flat ink; black crest, sponsor and manufacturer removed.';
}
if(r.name==='SV Meppen'&&r.variant==='home'){
 c=base(white,'#074CAB');cap(c,'#074CAB');c.colors.leftSleeve=c.colors.rightSleeve='#074CAB';c.layers.push(poly([[0,48],[53,59],[53,76],[0,64]],white,'leftSleeve'),poly([[147,59],[200,48],[200,64],[147,76]],white,'rightSleeve'));cuffs(c,[[4,'#074CAB']]);sidePiping(c,'#074CAB',2.4);n='White with royal-blue shoulder/sleeve panels and ring/cuffs; a white diagonal middle-sleeve band cuts through each blue sleeve. Fine blue side inserts; all Jako and sponsor/crest graphics removed.';
}
if(r.name==='SV Meppen'&&r.variant==='away'){
 c=base('#074CAB',white);panels(c,[[75,3],[75,6],[35,27],[32,23]],white);c.layers.push(poly([[0,38],[53,50],[53,67],[0,55]],white,'leftSleeve'),poly([[147,50],[200,38],[200,55],[147,67]],white,'rightSleeve'));cuffs(c,[[4,'#074CAB']]);n='Independent Away front: blue torso and sleeves with white narrow shoulder strip, wide white diagonal mid-sleeve inserts, blue lower sleeve/cuffs and white ring. This differs from a simple reversal of the Home panels. All branding removed.';
}
if(r.name==='SV Wehen Wiesbaden'&&r.variant==='home'){
 c=base('#D72D32');cuffs(c,[[3.8,black]]);sidePiping(c,black,5);neck(c,[['#D72D32',4],[black,.45]]);n='Red field with black cuffs and black side inserts. The apparent pale torso pinstripes in the worn source are columns of tiny lettering; those are removed under the lettering-free requirement. The black rear-neck insert is adapted as a thin inner ring edge. All sponsor and chest/sleeve marks omitted.';
}
if(r.name==='SV Wehen Wiesbaden'&&r.variant==='away'){
 c=base('#F0F0F3');cap(c,'#343A48');sidePiping(c,'#343A48',7);cuffs(c,[[4.2,'#343A48']]);neck(c,[['#343A48',2],[white,1]]);panels(c,[[49,179],[58,167],[58,175],[49,188]],white);n='White with charcoal shoulder inserts, cuffs and broad underarm/side panels, small white lower-side diagonal cuts and charcoal/white neckline. Fine tonal stripe sheen in the photo is left to original PNG fabric. All branding and lettering removed.';
}
if(r.name==='TSG Hoffenheim II'&&r.variant==='home'){
 c=base('#2463A3','#162E50');stripes(c,Array.from({length:12},(_,i)=>49+i*9),.6,'#3776B1');c.colors.leftSleeve=c.colors.rightSleeve=white;cap(c,white);raglanLine(c,'#162E50',.55);neck(c,[['#162E50',4],[white,.65]]);cuffs(c,[[5,'#162E50'],[1.5,white],[.7,'#162E50']]);n='Reserve-team page independently identifies this Home shirt: blue torso with subtle panel pinlines, contrasting white sleeves/shoulders, navy/white ring/cuff trim. Repeated heraldic antler figures in the blue field are removed with badges, manufacturer and syNeo sponsor. No first-team evidence substitution.';
}
if(r.name==='TSG Hoffenheim II'&&r.variant==='away'){
 c=base('#E4E0D5','#202738');n=await tile(c,r,[326,800,432,425],98,96.4,'#F0EEE7',{mode:'light',threshold:3,min:110,max:244,samples:280,clip:'all'});neck(c,[['#202738',1],[white,.8],['#202738',1]]);cuffs(c,[[4,'#202738'],[1.1,white],[.5,'#202738']]);raglanLine(c,'#202738',.6);n='Independently sourced reserve Away: off-white/stone with pale diagonal brush-like streaks and navy fine raglan piping plus navy/off-white cuff/ring trim. '+n;
}
if(r.name==='TSV Havelse'){
 const home=r.variant==='home',body=home?'#AD3437':'#25282A',detail=home?'#8B3539':'#3D4042';c=base(body);for(const clip of ['leftSleeve','rightSleeve']){const ls=[];for(let x=-25;x<225;x+=2)ls.push(line([[x,0],[x+22,47],[x+12,90]],detail,.38,clip));packed(c,ls,detail,clip,.75);}n=(home?'Muted red/claret':'Black/charcoal')+' with fine angular tonal sleeve bands and plain torso/ring/cuffs. Independent Nike source front used for this variant; material weave and shadows are supplied by the unchanged PNG. Sponsor metadata is absent, preserved as null; Nike and team badge removed.';
}
if(r.name==='VfB Stuttgart II'&&r.variant==='home'){
 c=base(white);c.layers.push(rect(0,61,200,25,'#C61631','body'));for(const clip of ['leftSleeve','rightSleeve']){c.layers.push(rect(0,43,200,60,'#C61631',clip));let d='';for(let y=22;y<45;y+=2.2)for(let x=0;x<200;x+=2.2){const size=(y-20)/25*1.8;d+=`M${x.toFixed(2)} ${y.toFixed(2)}h${size.toFixed(2)}v${size.toFixed(2)}h-${size.toFixed(2)}Z`;if(d.length>16000){c.layers.push(path(d,'#C61631',clip));d='';}}if(d)c.layers.push(path(d,'#C61631',clip));}c.colors.leftCuff=c.colors.rightCuff='#C61631';neck(c,[[white,4],['#C61631',.5]]);n='Independently sourced reserve Home: white body with a red chest band and red sleeves fading through fine dots into white shoulders, white ring with fine red edge. Gradient dot size adapted to the common sleeves; repeated Jako shoulder marks, crest and LBBW lettering removed.';
}
if(r.name==='VfB Stuttgart II'&&r.variant==='away'){
 c=base('#C6A35A');c.layers.push(rect(0,64,200,26,black,'body'));neck(c,[['#C6A35A',4],[black,.4]]);cuffs(c,[[1.3,black],[.7,'#C6A35A']]);n='Reserve Away independently saved from its own kit page: muted gold with one broad black chest band, gold ring and fine black/gold cuff edge. Metallic appearance reduced to estimated flat gold over original fabric. Jako shoulder marks, VfB badge and LBBW sponsor removed; absent release date remains null.';
}
if(r.name==='Viktoria Köln'&&r.variant==='home'){
 c=base('#141E28');c.layers.push(poly([[57,8],[99,164],[147,9],[106,86]],'#D6C8D4','body'),poly([[57,8],[99,161],[146,9],[106,88]],'#A61D43','body'));cuffs(c,[[3,black]]);n='Black/navy with a large red asymmetric V-shaped sash edged by a very fine pale line, extending deep down the torso. The V is chest print, not a second physical collar. Source is a worn photo; subtle tonal hatch marks are reduced, and obscured lower/side placement is adapted. All sponsor and marks removed.';
}
if(r.name==='Viktoria Köln'&&r.variant==='away'){
 c=base('#BB102C');neck(c,[['#BB102C',1],[white,.5],['#BB102C',1],[white,.5],['#BB102C',1]]);cuffs(c,[[3.2,white],[.6,'#BB102C']]);n='Plain deep red with twin fine white ring lines and white cuff edge. Source white outer cuff patches are adapted to the common cuffs. All sponsor/manufacturer/club marks removed.';
}
if(r.name==='Waldhof Mannheim'&&r.variant==='home'){
 c=base('#2C64AA',black);stripes(c,[82],36,black);c.colors.leftSleeve=c.colors.rightSleeve=black;cuffs(c,[[4,'#2C64AA']]);neck(c,[[black,3],['#2C64AA',1]]);n='Royal blue with one broad central black stripe, black sleeves and blue cuff bands; black/blue ring recoloring. Source is a low-resolution worn photo, so hidden rear and side detail is not claimed. Sponsor, crest and sleeve marks removed.';
}
if(r.name==='Waldhof Mannheim'&&r.variant==='away'){
 c=base('#E1EBE6','#5B9CB3');for(let y=17;y<200;y+=9.6)c.layers.push(rect(0,y,200,.28,'#A9C4C4','all'));cuffs(c,[[5.3,'#5B9CB3'],[2.6,'#307593']]);c.layers.push(path('M48 194Q100 197 152 194V202H48Z','#5B9CB3','body'));n='Pale white/mint field with many very fine pale blue horizontal pinlines, sky-blue ring/cuff trim with darker cuff edge and pale blue hem. Worn hanger image used for color layout; folds and exact hidden-side joins are not copied. All logos/sponsor lettering omitted.';
}
if(r.name==='Würzburger Kickers'&&r.variant==='home'){
 c=base('#ED2140','#84243A');cuffs(c,[[4.8,'#84243A']]);for(const x of [50,60,70,80,90,100])for(const [y,h]of [[7,30],[119,83]]){c.layers.push(rect(x,y,5,h,'#B32829','body'),rect(x+2,y+5,3,h-5,'#982023','body'));}n='Bright red with claret ring/cuffs and six short dark red/gold overlapping vertical bars at upper-left, repeated as long bars below the sponsor field on left lower torso. Locations and staggering measured from the independent illustration; right torso left plain. Jako shoulder dots and all branding removed.';
}
if(r.name==='Würzburger Kickers'&&r.variant==='away'){
 c=base('#0C151B','#414A4D');let d='';for(let y=17,row=0;y<200;y+=3.45,row++)for(let x=49+(row%2)*2;x<153;x+=4){const cx=x,cy=y;const outer=[],inner=[];for(let k=0;k<6;k++){const a=(k*60+30)*Math.PI/180;outer.push([cx+2*Math.cos(a),cy+2*Math.sin(a)]);inner.unshift([cx+1.65*Math.cos(a),cy+1.65*Math.sin(a)]);}const centre=[],hole=[];for(let k=0;k<6;k++){const a=(k*60+30)*Math.PI/180;centre.push([cx+.88*Math.cos(a),cy+.88*Math.sin(a)]);hole.unshift([cx+.55*Math.cos(a),cy+.55*Math.sin(a)]);}d+=`M${centre.map(p=>p.map(v=>v.toFixed(2)).join(' ')).join('L')}Z M${hole.map(p=>p.map(v=>v.toFixed(2)).join(' ')).join('L')}Z`;d+=`M${outer.map(p=>p.map(v=>v.toFixed(2)).join(' ')).join('L')}Z M${inner.map(p=>p.map(v=>v.toFixed(2)).join(' ')).join('L')}Z`;if(d.length>16000){c.layers.push(path(d,'#44494A','body'));d='';}}if(d)c.layers.push(path(d,'#44494A','body'));cuffs(c,[[4.8,'#414A4D']]);n='Black with a closely spaced thin grey hexagonal torso grid, continued through the removed sponsor; solid black sleeves and charcoal ring/cuffs. Hexagon scale and field extent measured from the saved Away illustration. All lettering/emblems and repeated Jako shoulder marks removed.';
}
if(!c||!n)throw Error('Unpainted '+r.key);add(r,c,n+' Colors are visual estimates. Common-silhouette adaptation preserves the original PNG fabric/alpha and physical round collar.');
}
await save();
