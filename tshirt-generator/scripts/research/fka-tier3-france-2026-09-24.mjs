import fs from 'node:fs/promises';import crypto from 'node:crypto';
import {refinementBatch,base,neck,cuffs,rect,path,poly,panels,line,sidePiping,gradient} from './tier2-refinement-helpers.mjs';
import {tracePatch,tileTrace} from './tier1-42/trace.mjs';
const batch='tier3-france-2026-09-24',rows=JSON.parse(await fs.readFile('artifacts/footballkitarchive/ligue-3-2026-27/source-order.json'));
const scope=await Promise.all(rows.map(async r=>({...r,country:'France',key:`${r.name}:${r.variant}`,reference_path:r.reference,reference_sha256:crypto.createHash('sha256').update(await fs.readFile(r.reference)).digest('hex')})));
const {add,ink,save}=await refinementBatch(batch,[],scope);const white='#F4F3EF',black='#171B1D';
const stripes=(c,xs,w,col,clip='body')=>xs.forEach(x=>c.layers.push(rect(x,0,w,200,col,clip)));
const tapes=(c,col,count=3)=>{for(let i=0;i<count;i++)panels(c,[[75,4+i*2.7],[75,5.5+i*2.7],[35,28+i*2.7],[35,26.5+i*2.7]],col);};
const tile=async(c,r,box,w,h,col,{samples=220,mode='dark',threshold=3,blur=8,min=0,max=255,clip='body',opacity=1,reflect=false}={})=>{const t=await tracePatch({reference:r.reference_path,box,width:samples,mode,threshold,blur,min,max});tileTrace(c,t,{x:49-w,y:0,width:w,height:h,color:col,clip,opacity,reflect});return `Clean source crop [${box}] segmented into constant-color ink contours (${samples}px sample), repeated at ${w} by ${h} internal units. Hidden repeat placement is adapted; no source photo pixels embedded.`;};
const smoothPoints=p=>{const out=[];for(let i=0;i<p.length-1;i++){const a=p[Math.max(0,i-1)],b=p[i],c=p[i+1],d=p[Math.min(p.length-1,i+2)];for(let k=0;k<12;k++){const t=k/12;out.push([0,1].map(j=>.5*((2*b[j])+(-a[j]+c[j])*t+(2*a[j]-5*b[j]+4*c[j]-d[j])*t*t+(-a[j]+3*b[j]-3*c[j]+d[j])*t*t*t)));}}out.push(p.at(-1));return out;};
const pack=(c,ls,col,clip='body',opacity=1)=>{let d='';for(const l of ls){const p=l.type==='path'?l.d:`M${l.points.map(p=>p.join(' ')).join('L')}Z`;if(d.length+p.length>18000){c.layers.push(path(d,col,clip,opacity));d='';}d+=p;}if(d)c.layers.push(path(d,col,clip,opacity));};
for(const r of scope){let c,n;
if(r.name==='Amiens'){
 c=base('#192426');neck(c,[[white,2],['#B7A18E',1],[white,.8]]);cuffs(c,[[4,'#B7A18E'],[3.3,white],[2,'#B7A18E'],[1.3,white]]);n='Near-black plain body with off-white/brown cuff and ring bands. Outdoor worn source has warm shoulder lighting, not a contrasting shoulder panel. Henley fastener omitted; the original round collar is recolored only. All insignia removed.';
}
if(r.name==='Aubagne Air Bel'&&r.variant==='home'){
 c=base('#172644','#EDDB25');c.layers.push(poly([[121,16],[139,28],[75,199],[55,199]],'#EDDB25','body'));tapes(c,'#283971');c.layers.push(rect(123,177,21,4,'#EDDB25','body'));n='Navy with broad yellow diagonal sash from viewer-right shoulder toward lower left, yellow ring and lower-right rectangular accent, tonal blue shoulder tapes. Sash continues through removed chest sponsorship. Worn photo limits exact hidden side construction.';
}
if(r.name==='Aubagne Air Bel'&&r.variant==='away'){
 c=base(white,'#213F55');tapes(c,'#E4C53C');n='White body/sleeves with navy round ring and narrow yellow shoulder tapes, observed separately from Home. Pale side folds are not painted as stripes; sponsor, badge and manufacturer removed.';
}
if(r.name==='Bastia'&&r.variant==='home'){
 c=base('#0654BC','#103573');stripes(c,Array.from({length:10},(_,i)=>50+i*11.3),.5,'#152F64');stripes(c,[60,83,106,129],10,'#105BBC');tapes(c,'#142D58');c.layers.push(rect(0,62,200,6,white,'body'),rect(0,76,200,6,white,'body'));n='Royal blue torso with subtle alternating blue columns and thin navy pinlines, two separate white chest bars and navy collar/three shoulder tapes. White bars continue through removed shield; sponsor and all crests removed.';
}
if(r.name==='Bastia'&&r.variant==='away'){
 c=base(white);tapes(c,'#084D9A');c.layers.push(rect(0,60,200,20,'#141D29','body'),rect(0,61,200,8,'#005BBC','body'),rect(0,72,200,7,'#005BBC','body'));n='White with a broad black-edged chest band containing two blue bars separated by a black line, three blue shoulder tapes and white neckline/cuffs. Independent Away reference; branding removed.';
}
if(r.name==='Bourg-en-Bresse Péronnas'){
 const home=r.variant==='home';c=base(home?'#086BB5':'#F0F0E5',home?'#11304C':'#F0F0E5');const cols=home?['#AB315C','#B78F81']:['#C56F8C','#D9A183'];
 const paths=[[[45,10],[66,17],[82,28],[85,42],[80,54],[64,62],[48,68]],[[99,11],[102,28],[100,47],[94,57],[77,66],[50,74]],[[139,9],[132,34],[124,54],[119,65],[121,69],[129,62],[145,38],[153,34]],[[49,86],[65,85],[80,88],[91,99],[104,102],[121,89],[143,66],[154,59]],[[49,96],[63,101],[72,120],[82,124],[92,120],[107,116],[125,110],[150,90]],[[51,102],[58,111],[63,132],[72,137],[85,135],[95,127]],[[47,154],[61,149],[75,143],[90,139],[101,137],[101,150],[92,171],[89,200]],[[49,190],[61,173],[80,156],[92,151],[88,174],[81,198]],[[106,195],[114,167],[118,146],[134,130],[151,117]]];
 for(let i=0;i<paths.length;i++)for(const off of (i>3?[0,1.2,2.4]:[0,1.2]))c.layers.push(line(smoothPoints(paths[i].map(([x,y])=>[x+off,y+off])),cols[i%2],.21,'body'));
 if(home)neck(c,[['#11304C',2],[white,.5],['#11304C',1]]);cuffs(c,[[3.7,home?'#0C456F':'#E74A43'],[2.7,home?'#F56837':'#F15B3B'],[1.1,home?'#0C456F':white]]);n=(home?'Blue with navy/white ring and blue/orange cuff bands':'Off-white with white ring and coral/orange thin cuff stripe')+'; fine pink and peach paired contour-like winding lines redrawn from the respective full source. Smooth editable curve ribbons are approximations on the common front; folded fabric is not traced. Remove chevrons, all sponsors, charity illustration and club/manufacturer marks.';
}
if(r.name==='Caen'&&r.variant==='home'){
 c=base('#0062AB',white);stripes(c,[59,84,109,134],13,'#D91436');for(const clip of ['leftSleeve','rightSleeve'])c.layers.push(poly(clip==='leftSleeve'?[[0,19],[25,14],[49,44],[43,62],[9,30]]:[[200,19],[175,14],[151,44],[157,62],[191,30]],'#D91436',clip));cuffs(c,[[5,white]]);n='Blue with four broad red vertical body stripes, red diagonal sleeve insets and white ring/cuffs. Source V/polo white pieces recolor only the existing round neckline. Sponsor, manufacturers and crest removed.';
}
if(r.name==='Caen'&&r.variant==='away'){
 c=base(white,'#172D51');stripes(c,[80,118],.9,'#172D51');sidePiping(c,'#172D51',5);cuffs(c,[[4.5,'#B91F3C']]);n='White with two very narrow navy vertical body lines and broad navy side panels, navy ring and red cuff edges. Lines continue through removed sponsor. No additional physical collar; all logos removed.';
}
if(r.name==='Cannes'){
 const home=r.variant==='home',body=home?'#F32123':'#237394',stripe=home?white:'#121B20';c=base(body);stripes(c,[49,88,127],20,stripe);c.colors.leftSleeve=c.colors.rightSleeve=body;n=(home?'Red with three broad white vertical bands, red sleeves and white shoulder inserts/ring':'Blue with three broad black vertical stripes and black sleeves/shoulder inserts, blue ring')+'. Bands measured from this variant’s source; minor stretch and diagonal perspective adapted. Sponsor and all insignia removed.';if(home)neck(c,[[white,2.2],[body,1]]);else{c.colors.leftSleeve=c.colors.rightSleeve=c.colors.leftCuff=c.colors.rightCuff=stripe;}
}
if(r.name==='Concarneau'&&r.variant==='home'){
 c=base('#096FB6');await ink(c,r,{box:[227,616,425,325],width:330,mode:'dark',threshold:2,blur:11,max:180},{x:50,y:123,width:101,height:72,color:'#116194',clip:'body'});neck(c,[['#E3C14D',.7],['#096FB6',2],['#E3C14D',.7]]);cuffs(c,[[5.4,'#7F1F37'],[4.1,'#E3C14D']]);n='Blue with a low tonal sailing-boat harbour illustration, gold cuff bands separated by a fine claret line and fine gold/blue ring. Lower-front source ink captured without hem patch; photo folds excluded as far as possible. Sailing print continues only across the observed lower body. Shoulder chevrons, crest and sponsor omitted.';
}
if(r.name==='Concarneau'&&r.variant==='away'){
 c=base('#761C32');const ls=[];for(let y=12,row=0;y<200;y+=18,row++)for(let x=49+(row%2)*11;x<153;x+=22){ls.push(line([[x,y],[x+11,y+9],[x+22,y],[x+11,y-9],[x,y]],'#B51C3E',.22));if(row%3===1){ls.push(poly([[x+11,y+1],[x+19,y+1],[x+17,y+3],[x+13,y+3]],'#B51C3E'),poly([[x+14.7,y-6],[x+14.7,y],[x+11,y]],'#B51C3E'),poly([[x+15.5,y-7],[x+19,y],[x+15.5,y]],'#B51C3E'));}}pack(c,ls,'#B51C3E');cuffs(c,[[5,'#DABB64']]);n='Claret with fine red diamond lattice and small sailing forms, plain claret sleeves/ring and gold cuffs. Tiny heritage motifs are reduced to observed sailboat forms; dates/lettering and repeated anchor badge imagery removed, along with chest/shoulder sponsorship. Worn pose limits exact repeat placement.';
}
if(r.name==='Fleury 91'){
 c=base(white,black);c.layers.push(rect(0,52,200,35,black,'body'),rect(0,58,200,21,'#B02530','body'));cuffs(c,[[2.4,black]]);n='White with a broad black chest band containing a red inner band, narrow black neckline/cuff trim. Action-photo perspective adapted; sponsors, repeated Skita shoulder marks and badges removed. Lower body left white.';
}
if(r.name==='La Roche Vendée Football'){
 const home=r.variant==='home';c=base(home?'#CA1735':'#071C43');if(home){const ls=[];for(let y=0,row=0;y<211;y+=18,row++)for(let x=40+(row%2)*13;x<168;x+=26)ls.push(line([[x,y],[x+13,y-6],[x+26,y],[x+26,y+12],[x+13,y+18],[x,y+12],[x,y]],'#BA3044',.25),line([[x,y],[x+13,y+6],[x+26,y]],'#BA3044',.25),line([[x+13,y+6],[x+13,y+18]],'#BA3044',.25));pack(c,ls,'#BA3044');}neck(c,[[white,1],['#112246',.6],[white,.7],['#B81F34',.55],[white,.7]]);cuffs(c,[[4.6,white],[3.5,'#102246'],[2.2,white],[1.1,'#B81F34']]);c.layers.push(rect(0,198,200,2,white,'body'));n=(home?'Red with a fine tonal outlined cube/hexagon lattice':'Navy field; large Vendée double-heart heraldic emblem omitted under the no-emblems rule')+', white/navy/red cuff and ring bands with fine white hem. Sponsors, sleeve patches, Kappa emblems and club branding removed.';
}
if(r.name==='Le Puy'&&r.variant==='home'){
 c=base('#7BC3E0',white);n=await tile(c,r,[363,1010,498,392],91,71.6,'#8CCCE1',{mode:'light',threshold:1.2,blur:20,min:60,max:255,clip:'all',samples:280});cuffs(c,[[5.4,white],[4.3,'#C6AD64'],[1.6,white]]);neck(c,[[white,3],['#C6AD64',.8]]);n='Sky blue with subtle angular herringbone/fragmented diagonals, white/gold cuff and neckline colors. White polo is adapted to the original ring only. '+n;
}
if(r.name==='Le Puy'&&r.variant==='away'){
 c=base('#183F65','#172F4C');stripes(c,[68,113],22,'#164970');c.colors.leftSleeve=c.colors.rightSleeve='#172F4C';cuffs(c,[[4.5,'#77BBDD']]);neck(c,[['#172F4C',3],['#77BBDD',1]]);n='Navy/blue torso with two wide slightly lighter vertical bands and solid navy sleeves, sky-blue cuffs and inner ring accent. Independent Away front; logos and sponsor removed, folded collar restricted to ring recoloring.';
}
if(r.name==='Orléans'){
 const home=r.variant==='home',body=home?'#D5BD55':'#BB142B',trim=home?'#AE1228':'#D9C45F';c=base(body,trim);cuffs(c,[[4.3,trim],[3.5,body],[2.4,trim],[1.1,body]]);n=(home?'Gold/yellow body with red ring and twin fine red cuff lines':'Red body with pale-gold ring and twin fine gold cuff lines')+'. Independently checked source, plain torso/sleeves after removing shoulder chevrons, sponsor and badges. Polo flaps replaced only by ring color.';
}
if(r.name==='Paris 13 Atletico'&&r.variant==='home'){
 c=base('#14371C','#24E800');const grad=gradient([[0,'#14371C'],[.24,'#14BD12'],[.6,'#13C511'],[1,'#15301B']]);for(const x of [51,91,131])c.layers.push(rect(x,0,18,200,grad,'body'));n=await tile(c,r,[350,953,165,290],21,37,'#14341D',{mode:'dark',threshold:14,samples:170});stripes(c,Array.from({length:18},(_,i)=>50+i*6),.25,'#398F2B');panels(c,[[36,50],[47,64],[49,81],[24,75]],'#22E307');cuffs(c,[[3.2,'#22E307'],[1.8,white],[1.1,'#22E307']]);n='Dark green with three broken bright-green vertical graphic columns and fine green pinlines, green underarm sleeve pieces, green/white cuff trim and green ring. Source graphic fragments transcribed without logos; exact lighting/fade is adapted as editable color stops. '+n;
}
if(r.name==='Paris 13 Atletico'&&r.variant==='away'){
 c=base('#181A1B','#2DE400');n=await tile(c,r,[532,950,200,225],39,43.8,'#2C2E2D',{mode:'light',threshold:2.6,min:0,max:80,samples:170});cuffs(c,[[3.2,'#39E31D']]);neck(c,[['#39E31D',3.6]]);n='Black with a very fine tonal linked-curve field, bright-green cuffs and ring. Micro white scribble trim reduced at common-preview scale; no separate neck tab. '+n;

}
if(r.name==='Quevilly Rouen Métropole'&&r.variant==='home'){
 c=base('#F1CD21','#C23120');neck(c,[['#C23120',2],['#EBC72F',.6],['#C23120',1]]);const ls=[];for(const [ys,ye]of [[43,61],[100,199]])for(let y=ys;y<ye;y+=12){ls.push(line([[95,y],[105,y+3],[105,y+9],[95,y+12],[95,y],[103,y+6],[95,y+12]],'#C55324',.4));for(const x of [92,107])ls.push(line([[x,y],[x+2,y+2],[x,y+4],[x+2,y+6],[x,y+8],[x+2,y+10],[x,y+12]],'#C55324',.5));}pack(c,ls,'#C55324');cuffs(c,[[3,'#CF7431'],[2.3,'#E7B52B'],[.7,'#C23120']]);c.layers.push(rect(0,198,200,2,'#C23120','body'));n='Yellow with a narrow red/orange geometric ornamental centre stripe above/below the original chest break, red ring with gold line, thin ornamental cuff/hem edge. Interior ornament simplified to measured polygon web; sponsors and repeated Hummel chevrons removed.';
}
if(r.name==='Quevilly Rouen Métropole'&&r.variant==='away'){
 c=base('#0D2331','#D9B123');const ls=[];for(let y=4,row=0;y<210;y+=31,row++)for(let x=40+(row%2)*10;x<161;x+=29){ls.push(line([[x,y+29],[x,y],[x+23,y],[x+23,y+29],[x,y+29]],'#203645',.2));for(let yy=4;yy<25;yy+=5)for(const xx of [4,12,19])ls.push(line([[x+xx,y+yy],[x+xx+3,y+yy],[x+xx+3,y+yy+3],[x+xx,y+yy+3],[x+xx,y+yy]],'#203645',.18));}pack(c,ls,'#203645');cuffs(c,[[3,'#D9B123']]);n='Dark navy with faint architectural window-grid outlines across the torso and gold ring/cuffs. Tilted source’s city/building motif redrawn as aligned editable line groups; exact fine façade print is simplified. Solid sleeves; all branding removed.';
}
if(r.name==='Rouen'){
 c=base('#D9232F');n=await tile(c,r,[288,420,320,145],52,23.6,'#B91E29',{mode:'dark',threshold:2.5,blur:9,samples:240,min:20,max:230,clip:'all'});neck(c,[[white,.7],['#D9232F',3]]);cuffs(c,[[4,'#D9232F'],[.7,white]]);n='Red with repeating narrow tonal angular chevron columns across torso/sleeves, fine white neckline and cuff edges. Closed-shape pattern measured from source repeat; all white Hummel sleeve marks, badge and sponsor removed.';
}
if(r.name==='Thionville Lusitanos'){
 const home=r.variant==='home',col=home?'#6694B8':'#656A7A',light=home?'#C5CCD5':'#AAAEC0',dark=home?'#456B8C':'#515563';c=base(col,light);neck(c,[[light,1.3],[col,.65],[light,1.3]]);cuffs(c,[[5.2,light],[1.3,col]]);await ink(c,r,home?{box:[133,650,325,200],width:300,mode:'dark',threshold:5,blur:9,max:145,exclude:[[202,792,110,80],[110,822,355,30]]}:{box:[277,774,235,159],width:230,mode:'dark',threshold:5,blur:9,max:145},{x:home?53:65,y:home?146:162,width:home?92:75,height:home?53:41,color:dark,clip:'body'});c.layers.push(poly([[49,120],[129,120],[129,132],[51,196],[49,196]],col,'body'),poly([[129,120],[153,120],[153,201],[145,201],[129,132]],col,'body'),line([[51,196],[129,132],[145,200]],light,.7,'body'));
 n=(home?'Sky blue':'Slate grey')+' with pale ring/cuff bands and a tonal lower-right architectural panel bounded by a pale diagonal. Full source is an angled worn photo: visible city collage reduced to discrete source-ink contours, with cross/obstructions excluded. Enlarged heraldic cross outline, Portuguese cross, sponsors, badges and repeated manufacturer marks omitted; no invented hidden rear print.';
}
if(r.name==='Valenciennes'&&r.variant==='home'){
 c=base('#E52726');neck(c,[[white,1],['#E52726',.7],[white,1]]);cuffs(c,[[5.2,white]]);const ls=[];for(const [x,y,h]of [[60,29,29],[78,45,31],[95,63,30],[113,48,31],[133,30,27]]){ls.push(line([[x,y],[x+6,y+5],[x+6,y+h-5],[x+3,y+h],[x,y+h-5],[x,y]],'#F0D6C7',.3));for(let yy=y+5;yy<y+h-5;yy+=4)ls.push(line([[x,yy],[x+6,yy],[x+3,yy+4],[x,yy]],'#F0D6C7',.22));}pack(c,ls,'#F0D6C7');for(const clip of ['leftSleeve','rightSleeve']){const temp={layers:[]},fine=[];for(let x=5;x<195;x+=5)fine.push(line([[x,75],[x+5,83],[x,87],[x,75]],'#CB5B56',.28,clip));pack(temp,fine,'#CB5B56',clip);c.detailLayers.push(...temp.layers);}n='Red with five staggered pale geometric vertical ornaments forming a descending then ascending chest arrangement, white ring bands and geometric white cuffs. Fine ornament simplified from worn source; club shield over the centre is removed. All sponsorship and chevrons omitted.';
}
if(r.name==='Valenciennes'&&r.variant==='away'){
 c=base('#F0F0E4','#4C1420');sidePiping(c,'#4C1420',9);neck(c,[['#4C1420',1.2],['#E6DDC2',.75],['#4C1420',1.2]]);cuffs(c,[[4.3,'#4C1420'],[2.8,'#E6DDC2'],[1.4,'#4C1420']]);n='Pale cream with claret underarm/side panels and cream/claret multi-line ring/cuffs. The faint all-over source motif consists of historic club emblems/lettered shields; these are removed under the no-emblems requirement, with Toyota/Hummel/crest marks. Independent Away source preserves actual cream color rather than inferring white.';
}
if(r.name==='Versailles'&&r.variant==='home'){
 c=base('#20364B','#142B3A');n=await tile(c,r,[478,717,617,405],101,66.3,'#354B63',{mode:'light',threshold:4,blur:8,samples:320,min:10,max:135,clip:'all'});neck(c,[['#C5A047',.65],['#142B3A',3]]);cuffs(c,[[5,'#142B3A'],[.7,'#C5A047']]);n='Navy with an all-over fine lighter-blue ornamental scroll print and navy/gold ring/cuff trim. Source long sleeves adapted to the common short-sleeve base. '+n;
}
if(r.name==='Versailles'&&r.variant==='away'){
 c=base('#EAE9E5');n=await tile(c,r,[517,894,562,298],99,52.5,'#F3F1EB',{mode:'light',threshold:2,blur:7,samples:270,min:140,max:255,clip:'all'});neck(c,[['#BF9E55',.8],['#1D2B46',2.7],['#BF9E55',.65]]);cuffs(c,[[5,'#1D2B46'],[.9,'#BF9E55']]);n='Off-white with very pale ornamental diamond/scroll lattice, navy cuff/ring bands edged gold. Different print from Home, sourced independently. '+n;
}
if(r.name==='Villefranche-Beaujolais'&&r.variant==='home'){
 c=base('#2B64B5');c.layers.push(path('M75 3Q59 10 48 20Q42 28 48 51Q40 39 42 27Q39 17 59 10Z',white),path('M125 3Q141 10 152 20Q158 28 152 51Q160 39 158 27Q161 17 141 10Z',white));n='Blue with slim curved white shoulder-to-underarm inserts and plain blue cuffs/ring. The white pieces taper to points on torso, independently drawn from flat front. All sponsor/manufacturer/crest marks removed.';
}
if(r.name==='Villefranche-Beaujolais'&&r.variant==='away'){
 c=base('#F88929');tapes(c,white,2);cuffs(c,[[10,white],[6.8,'#F88929'],[4.3,white]]);n='Orange with twin narrow white shoulder tapes and two broad white lower-sleeve/cuff bars separated by orange. Orange ring, plain torso after removing sponsor and badges.';
}
if(!c||!n)throw Error('Unpainted '+r.key);add(r,c,n+' Colors are visual estimates. Original PNG fabric and alpha preserved; only the existing physical round collar is recolored.');
}
await save();
