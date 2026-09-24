import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import {refinementBatch,base,neck,cuffs,rect,path,poly,panels,line,sidePiping} from './tier2-refinement-helpers.mjs';
import {tracePatch,tileTrace,placeTrace} from './tier1-42/trace.mjs';
const batch='tier3-england-b-2026-09-24';
const rows=JSON.parse(await fs.readFile('artifacts/footballkitarchive/league-one-b-2026-27/source-order.json'));
const scope=await Promise.all(rows.map(async r=>({...r,country:'England',key:`${r.name}:${r.variant}`,reference_path:r.reference,reference_sha256:crypto.createHash('sha256').update(await fs.readFile(r.reference)).digest('hex')})));
const {add,ink,save}=await refinementBatch(batch,[],scope);
const white='#F3F2F1',black='#171A20';
const strips=(c,xs,width,color,clip='body')=>xs.forEach(x=>c.layers.push(rect(x,0,width,200,color,clip)));
const cap=(c,color)=>panels(c,[[76,1],[73,14],[49,25],[37,27],[30,20],[47,12]],color);
const shoulderLines=(c,color)=>{for(let i=0;i<3;i++)panels(c,[[75,5+i*2.8],[75,6.5+i*2.8],[35,27+i*2.8],[35,25.5+i*2.8]],color);};
const tile=async(c,r,box,width,height,color,options={})=>{const {mode='dark',threshold=3,blur=8,min=0,max=255,clip='all',opacity=1,samples=240,x=0,y=0}=options;const trace=await tracePatch({reference:r.reference_path,box,width:samples,mode,threshold,blur,min,max});tileTrace(c,trace,{x:x>0?x-width:x,y,width,height,color,clip,opacity,reflect:true});return `Discrete constant-color contours from branding-free crop [${box}], ${samples}px sampling, ${width} × ${height} unit reflected repetition; hidden print placement is adapted, and source fabric pixels are not embedded.`;};
for(const r of scope){let c,notes;
if(r.name==='Huddersfield Town'&&r.variant==='home'){
 c=base('#047ECD');notes=await tile(c,r,[607,838,91,420],14.5,65,'#076ABF',{threshold:3,min:40,max:155,clip:'body',samples:91});
 for(const x of [49,78,107,136]){c.layers.push(rect(x-1,0,13.5,200,'#DF243A','body'),rect(x,0,11.5,200,white,'body'));}cap(c,'#037FC2');neck(c,[[black,4],['#DD2940',.7]]);
 notes='Blue with four white torso stripes finely edged red, tonal blue abstract curved print in the blue bands, solid blue shoulder caps/sleeves, black ring with thin red edge. '+notes;
}
if(r.name==='Huddersfield Town'&&r.variant==='away'){
 c=base(black);c.colors.leftSleeve=c.colors.rightSleeve=c.colors.leftCuff=c.colors.rightCuff='#E9161D';
 const t=await tracePatch({reference:r.reference_path,box:[580,1020,190,420],width:90,mode:'light',threshold:1.6,min:15,max:65});
 for(const x of [47,86,139])for(let y=0;y<200;y+=60)c.layers.push(...placeTrace(t,{x,y,width:28,height:60,color:'#252735',clip:'body',opacity:.5}));
 strips(c,[61,114],25,'#E9161D');neck(c,[[black,3],['#E9161D',.55]]);
 notes='Red sleeves and broad alternating red/black torso stripes with central black. Faint angular lines traced from clean black lower-front crop [580,1020,190,420], reduced to a single dark ink and confined behind red panels. Stripe edges normalized from the flat front. Black/red existing neckline; all branding omitted.';
}
if(r.name==='Leicester City'&&r.variant==='home'){
 c=base('#234BAA',white);notes=await tile(c,r,[400,930,570,420],100,73.7,'#164781',{threshold:3.5,min:30,max:135,samples:360,x:49});
 shoulderLines(c,white);cuffs(c,[[3.5,white],[.8,'#234BAA']]);notes='Royal blue with darker ornamental dragon/floral vertical columns, three white shoulder strips and white cuff/ring trim. The decorative dragon print is distinct from the fox crest, which is removed. '+notes;
}
if(r.name==='Leicester City'&&r.variant==='away'){
 c=base('#491B2C',white);notes=await tile(c,r,[395,945,570,390],98,67,'#542333',{mode:'light',threshold:2.2,min:30,max:110,samples:300,x:49});shoulderLines(c,'#B99F5F');cuffs(c,[[4,white],[.8,'#491B2C']]);notes='Claret with faint ornamental damask, gold three-strip shoulder trim, white ring and white cuffs with claret edge. '+notes;
}
if(r.name==='Leyton Orient'&&r.variant==='home'){
 c=base('#E7433D');strips(c,[62,117],17,white);neck(c,[['#E7433D',4],[white,.5]]);cuffs(c,[[.65,white]]);notes='Red with two broad white torso stripes either side of the red centre, plain red sleeves and very fine white inner collar/cuff edges. Repeated white Meyba manufacturer marks on the shoulders are deliberately removed; no imitation tape is substituted.';
}
if(r.name==='Leyton Orient'&&r.variant==='away'){
 c=base('#F2F1F5','#CA253F');cuffs(c,[[4.3,'#B82540']]);let d='';
 for(let y=30;y<=66;y+=2.8){const half=(67-y)*1.2;for(let x=100-half;x<=100+half;x+=2.8){const size=.2+.8*(y-30)/36;d+=`M${x.toFixed(2)} ${y}h${size.toFixed(2)}v${size.toFixed(2)}h-${size.toFixed(2)}Z`;}}c.layers.push(path(d,'#D52B43','body'));
 notes='White with red cuff bands and red ring; the chest has a downward-pointing field of red square dots, fading smaller upward. Dot spacing is adapted from the independent source. Repeated manufacturer monograms on the sides, memorial hem text and all chest marks are omitted.';
}
if(r.name==='Luton Town'&&r.variant==='home'){
 c=base('#F03D18',black);c.colors.leftSleeve=c.colors.rightSleeve='#222329';
 for(let x=-200;x<200;x+=13){const points=[];for(let y=0;y<=205;y+=1)points.push([x-y*.48+2.8*Math.sin(y*Math.PI/10),y]);c.layers.push(line(points,'#A5261C',.65));}
 cap(c,'#222329');neck(c,[[white,1],[black,1],[white,1],['#F03D18',.6]]);cuffs(c,[[3.6,white],[2.7,black],[1.8,white],[.8,'#F03D18']]);notes='Orange front with closely spaced dark red diagonal sinusoidal lines, black sleeves/shoulder cap and layered white/black/orange trim. The archive explicitly labels this 26-27 (Carry-over), which is preserved. Source is a flat illustration; wave amplitude/spacing adapted to the common silhouette. Branding removed.';
}
if(r.name==='Luton Town'&&r.variant==='away'){
 c=base(white);strips(c,Array.from({length:90},(_,i)=>i*2.3),.25,'#E8E7E8','all');neck(c,[[black,1],[white,.6],[black,1],['#ED662E',1]]);cuffs(c,[[4.1,black],[2.7,white],[1.9,black],[.9,'#ED662E']]);notes='White with extremely fine tonal vertical rib lines and black/white/orange neck and cuff trim. The source V shape is adapted only as color bands in the existing PNG round ring. All black sponsor/crest/manufacturer elements removed.';
}
if(r.name==='Mansfield Town'&&r.variant==='home'){
 c=base('#F7BB31','#18477C');
 for(let y=12;y<128;y+=10)for(let x=0;x<200;x+=10)if((Math.floor(x/10)+Math.floor((y-12)/10))%2===0)c.layers.push(rect(x,y,10,10,'#E7A025','all',Math.max(.06,.55*(1-(y-12)/116))));
 for(const ps of [[[75,6],[42,20],[32,29]],[[125,6],[158,20],[168,29]]])c.layers.push(line(ps,'#18477C',.8,'all'));neck(c,[['#18477C',4],['#F7BB31',.6]]);cuffs(c,[[5,'#18477C'],[2.7,'#F7BB31'],[1.7,'#18477C']]);sidePiping(c,'#18477C',.6);
 notes='Gold with a fading tonal checker field over the upper body/sleeves, blue piping and blue/gold cuff and ring colors. Every repeated stag-head emblem inside the checker squares is removed, as are crest, sponsor and manufacturer. Source polo construction is not drawn over the PNG. Fade simplified to flat opacity steps.';
}
if(r.name==='Mansfield Town'&&r.variant==='away'){
 c=base(white,'#1A2237');cap(c,'#1A2237');cuffs(c,[[5,'#1A2237']]);sidePiping(c,'#1A2237',2.6);
 notes='White body/sleeves with navy shoulder inserts, cuffs, side trim and recolored round ring. Close inspection established that the repeated pale cyan shapes are stag-head outlines from the team emblem; they are all deliberately omitted, not treated as geographic decoration. Fabric mesh remains supplied by the original PNG. All other branding removed.';
}
if(r.name==='MK Dons'&&r.variant==='home'){
 c=base(white);neck(c,[['#BAA56F',1],[white,1],['#BAA56F',1]]);cuffs(c,[[4.6,'#BAA56F'],[3.8,white],[2.8,'#BAA56F']]);
 notes='White shirt with gold/white neck and cuff trim. Close inspection revealed that the faint all-over circular print consists entirely of MK Dons badges and lettering; all are removed. Small angular white cuff border details are represented by gold/white trim bands on the common cuff/ring; physical collar and original fabric remain unchanged. Reebok and sponsor marks removed.';
}
if(r.name==='MK Dons'&&r.variant==='away'){
 c=base('#211F22',black);await ink(c,r,{box:[215,150,430,790],width:570,mode:'light',threshold:3.8,blur:8,min:20,max:110,repairs:[{target:[258,238,100,70],source:[324,620,100,70]},{target:[520,216,100,102],source:[320,710,100,102]}],exclude:[[215,862,64,76],[550,865,95,70]]},{x:49,y:12,width:102,height:183,color:'#602633'});
 const sleeve=await tracePatch({reference:r.reference_path,box:[255,600,340,245],width:300,mode:'light',threshold:3.8,blur:8,min:20,max:110});for(const clip of ['leftSleeve','rightSleeve'])tileTrace(c,sleeve,{x:0,y:0,width:81,height:58.4,color:'#602633',clip});notes='Dark red ink traced from the full torso, with two measured clean-print repairs for the chest marks and excluded hem labels. Sleeve print extends the clean lower-front crop [255,600,340,245] at matching scale. No reflected tile seams on the torso; source lighting remains excluded.';
 neck(c,[[black,3],[white,.4]]);cuffs(c,[[4,black],[2.2,'#BCA16E'],[1.6,black],[.9,white],[.45,black]]);notes='Black/charcoal with a dark red linked angular arch pattern and fine vertical hatch lines; gold/white thin cuff edges and dark ring. '+notes;
}
if(r.name==='Notts County'&&r.variant==='home'){
 c=base('#151B1D',white);for(const [x,w]of [[45,12],[86,28],[143,12]])c.layers.push(rect(x,0,w,200,white,'body'));for(const x of [59,62,80,83,116,119,137,140])c.layers.push(rect(x,0,.65,200,white,'body'));cap(c,'#151B1D');cuffs(c,[[4,white]]);notes='Black shirt with a broad central white stripe and white side bands, bounded by paired fine companion lines; solid black sleeves/shoulders, white ring and white cuffs. Stripe positions/spacing follow the saved front. All sponsor and badges removed.';
}
if(r.name==='Notts County'&&r.variant==='away'){
 c=base('#F5B5D4','#F5B5D4');cuffs(c,[[3.4,'#262631']]);neck(c,[['#F5B5D4',4],['#262631',.4]]);notes='Plain pale pink body/sleeves with black cuff edge and a thin black neckline edge adapted from the dark rear-neck portion. Archive sponsor metadata says David James while the pictured front shows University of Nottingham; this discrepancy is retained as a source limitation and neither sponsor is painted.';
}
if(r.name==='Oxford United'&&r.variant==='home'){
 c=base('#FFE326','#182434');c.layers.push(rect(0,56,200,34,'#182434','body'));for(const y of [55,58,87,90])c.layers.push(rect(0,y,200,.65,'#FFE326','body'));cap(c,'#182434');neck(c,[['#182434',4],['#FFE326',.7]]);cuffs(c,[[3.8,'#182434'],[3.1,'#FFE326'],[2.4,'#182434'],[1.6,'#FFE326'],[.8,'#182434']]);notes='Yellow with one broad navy chest band finely edged by yellow lines, navy shoulder caps, navy/yellow cuff trim and recolored ring. Repeated Macron shoulder emblems and sponsor/bull crest are omitted; no source V-neck overlay.';
}
if(r.name==='Oxford United'&&r.variant==='away'){
 c=base('#F0F3F2');for(const y of [27,52,77,102,127,152,177]){c.layers.push(rect(0,y,200,.75,'#142A3C','all'),rect(0,y+.9,200,.55,'#E2C926','all'));}neck(c,[['#142A3C',1],[white,1],['#E2C926',.6],[white,1],['#142A3C',.6]]);cuffs(c,[[3.8,'#142A3C'],[2.9,white],[2.1,'#E2C926'],[1.4,white],[.7,'#142A3C']]);notes='White with seven fine paired navy/yellow horizontal lines, extending over the sleeves where visible, and layered navy/white/yellow trim on cuffs and original ring. All logos and sponsor removed; line spacing normalized from the source.';
}
if(r.name==='Peterborough United'&&r.variant==='home'){
 c=base('#0359C5',white);panels(c,[[75,4],[73,11],[42,26],[36,34],[35,27],[44,20]],white);cuffs(c,[[4,white]]);sidePiping(c,white,.7);notes='Plain royal blue with broad white upper-shoulder inserts, white ring/cuffs and narrow white underarm/side piping. Source is relatively low resolution; panel boundaries follow the visible front, without adding unseen detail. Sponsor, badge and Puma marks removed.';
}
if(r.name==='Peterborough United'&&r.variant==='away'){
 c=base('#212027',black);notes=await tile(c,r,[221,410,265,315],98,116.5,'#24232A',{mode:'light',threshold:1,min:20,max:58,samples:240,x:49});notes='Black/charcoal with a very faint all-over irregular contour/scroll print, black ring and cuffs. Salmon areas are exclusively branding and omitted. '+notes;
}
if(r.name==='Plymouth Argyle'&&r.variant==='home'){
 c=base('#133539',white);strips(c,Array.from({length:32},(_,i)=>i*6.5),.36,'#B6CDCA','all');notes='Deep forest-green body/sleeves with closely spaced fine pale vertical pinlines and off-white existing ring. Stripes continue across sleeves; original cloth shading retained. All sponsor, badge and Puma marks omitted.';
}
if(r.name==='Plymouth Argyle'&&r.variant==='away'){
 c=base('#F0F0F2',white);notes=await tile(c,r,[386,825,560,580],100,103.6,'#AFC3CF',{mode:'dark',threshold:3.4,min:70,max:218,samples:360,x:49});notes='White with a fine broken, wavy herringbone-like field of blue-grey and pale cyan vertical lines across body and sleeves; plain white ring. The finest two print colors are reduced to one muted ink while keeping the observed fragmented forms. '+notes;
}
if(r.name==='Reading'&&r.variant==='home'){
 c=base('#F0F1EF','#315C8F');for(const [y,h]of [[25,19],[62,24],[102,20],[140,21],[180,20]]){c.layers.push(rect(0,y,200,h,'#315C8F','all'),rect(0,y-.6,200,.8,'#C34651','all'),rect(0,y+h,200,.8,'#C34651','all'));}neck(c,[['#315C8F',3],[white,.7],['#C34651',.55]]);cuffs(c,[[2,white],[.65,'#C34651']]);notes='White with five blue horizontal hoops, finely edged red and continued across sleeves; blue/white/red ring colors and white cuffs with red edge. Archive front is a flat illustration. Its fine mesh is not repainted; the original PNG supplies fabric. All markings omitted.';
}
if(r.name==='Reading'&&r.variant==='away'){
 c=base('#202B43');for(const y of [33,78,123,168])c.layers.push(rect(0,y,200,22,'#242F47','all'));
 notes=await tile(c,r,[218,405,232,310],99,132,'#2B354C',{mode:'light',threshold:1.6,min:20,max:70,samples:220,x:49,opacity:.8});neck(c,[['#202B43',3],['#87B7B0',.65]]);cuffs(c,[[.8,white]]);sidePiping(c,'#87B7B0',.6);notes='Navy with faint broad tonal hoops and an irregular tonal botanical/abstract print, pale green inner neck line/side seam and fine white cuff edges. Flat source illustration; all green/silver logos removed. '+notes;
}
if(r.name==='Sheffield Wednesday'&&r.variant==='home'){
 c=base(white,'#0864BC');strips(c,[56,91,126],17,'#0864BC');strips(c,[13,165],16,'#0864BC','all');cuffs(c,[[2.4,white]]);notes='White with three broad royal-blue torso stripes including the centre, and broad blue sleeve panels. Source blue polo collar becomes only blue recoloring of the PNG round ring. Yellow crest/manufacturer marks and sponsor removed. Stripe spacing normalized from the independent front.';
}
if(r.name==='Sheffield Wednesday'&&r.variant==='away'){
 c=base('#FBE029');for(const x of [52,82,112,142]){c.layers.push(rect(x,0,3.8,200,'#202828','body'),rect(x+1.55,0,.65,200,white,'body'));}notes='Yellow with four narrow black torso stripes, each split by a fine white centre line; plain yellow sleeves/cuffs/ring. Exact stripe grouping retained, logos and sponsor removed, physical collar construction left to the original PNG.';
}
if(r.name==='Stevenage'&&r.variant==='home'){
 c=base('#F4F4F3','#E64348');panels(c,[[75,3],[74,7],[37,24],[35,28],[32,23],[46,16]],'#E64348');cuffs(c,[[3.4,'#E64348']]);sidePiping(c,'#E64348',2);
 notes='White with red shoulder inserts, collar ring, cuffs and underarm edges. The large pale repeated heraldic deer motifs are deliberately removed with the team emblems. This leaves the unbranded white field rather than copying emblem-derived decoration. Sponsor, Puma marks and anniversary text removed.';
}
if(r.name==='Stevenage'&&r.variant==='away'){
 c=base('#15151B','#3B3B47');cuffs(c,[[3.5,'#3B3B47']]);notes='Plain near-black body and sleeves with charcoal ring/cuffs. Every cyan area in the front is a sponsor, crest or manufacturer mark and is omitted. No invented texture.';
}
if(r.name==='Stockport County'&&r.variant==='home'){
 c=base('#285E92');notes=await tile(c,r,[218,420,234,310],100,132.5,'#548EA9',{mode:'light',threshold:3.5,min:45,max:155,samples:360,x:49});notes+=' '+await tile(c,r,[218,420,234,310],100,132.5,'#815473',{mode:'red',threshold:-3,min:40,max:145,samples:320,x:49});notes='Blue with irregular fine cyan/red diagonal and vertical broken line groups, blue cuffs/ring. Source is a flat illustration; separate light-ink/red-channel masks preserve the observed multicolor print forms without sponsor pixels. '+notes;
}
if(r.name==='Stockport County'&&r.variant==='away'){
 c=base('#1C1F20','#484B50');cap(c,'#484B50');cuffs(c,[[4,'#484B50']]);notes='Plain black body/sleeves with charcoal upper shoulder inserts, ring and cuff edges. Source flat illustration adapted to the PNG; all white crest, sponsor and manufacturer graphics removed.';
}
if(r.name==='Wigan Athletic'&&r.variant==='home'){
 c=base('#075BB3');strips(c,[53,86,119],16,'#0850A1');neck(c,[[white,1.2],['#075BB3',2],[white,1.2]]);cuffs(c,[[4.4,white],[3.1,'#075BB3'],[1.1,white]]);notes='Blue with three darker broad vertical torso stripes and solid blue sleeves; white/blue/white ring bands and double white cuff edges. All sponsor, crest and manufacturer marks removed; blue tones are visually estimated.';
}
if(r.name==='Wigan Athletic'&&r.variant==='away'){
 c=base('#36353D',black);cuffs(c,[[4,black]]);
 for(const [ps,col,w]of [
 [[[52,7],[59,33],[62,60],[69,82],[64,108],[63,138],[75,173],[80,200]],'#454853',.65],
 [[[82,3],[80,30],[83,52],[81,68],[70,88],[78,113],[91,131],[104,138]],'#464A56',.7],
 [[[55,120],[70,129],[97,136],[115,131],[130,125],[151,131]],'#262A32',.75],
 [[[68,127],[84,143],[91,168],[94,191],[92,200]],'#232932',.65],
 [[[118,23],[113,50],[116,73],[113,91],[120,114],[119,126],[128,145],[128,171],[132,185],[149,193]],'#292C34',.75],
 [[[59,162],[85,169],[108,168],[134,167],[152,164]],'#272B33',.75],
 [[[139,7],[130,26],[134,51],[145,66],[155,68]],'#454B56',.65],
 [[[105,136],[106,160],[112,181],[120,194],[120,203]],'#292C34',.65]
 ])c.layers.push(line(ps,col,w));
 for(const clip of ['leftSleeve','rightSleeve'])for(const x of [10,24,39,159,174,190])c.layers.push(line([[x,14],[x+3,44],[x+8,65],[x+5,89]],'#2B2E37',.7,clip));
 notes='Charcoal with sparse irregular branching dark and grey curved lines, manually measured from the clean front and reconnected through removed sponsor regions. Line placement adapts to the straight common torso; no source fabric shadows are traced. Black cuffs/ring; branding removed.';
}
if(r.name==='Wycombe Wanderers'&&r.variant==='home'){
 c=base('#8CC4E2','#1F2F4A');c.colors.leftSleeve=c.colors.rightSleeve='#1F2F4A';c.layers.push(rect(0,0,100,100,'#1F2F4A','body'),rect(100,100,100,100,'#1F2F4A','body'));
 for(const [dx,dy]of [[49,9],[100,105]])for(const [p,col]of [[[[0,0],[45,12],[24,13],[0,7]],'#8CC4E2'],[[[3,15],[47,29],[28,30],[38,25],[0,21]],'#9DD9EA'],[[[0,35],[50,48],[19,44],[31,40],[0,40]],'#8CC4E2'],[[[10,51],[47,64],[29,64],[37,59],[1,56]],'#9DD9EA'],[[[0,70],[49,82],[15,80],[25,75],[0,76]],'#8CC4E2']])c.layers.push(poly(p.map(([x,y])=>[x+dx,y+dy]),col,'body'));
 cap(c,'#1F2F4A');cuffs(c,[[3,'#1F2F4A']]);notes='Sky-blue/navy quartered torso, with jagged pale-blue angular shards confined to top-left and bottom-right navy quarters. Navy sleeves/ring/cuffs. Source illustration adapted by measured closed polygons; repeated Hummel shoulder chevrons and all branding omitted.';
}
if(r.name==='Wycombe Wanderers'&&r.variant==='away'){
 c=base('#EF565E');for(let y=10;y<200;y+=20)for(let x=0;x<200;x+=20)c.layers.push(poly([[x,y],[x+18,y],[x+18,y+8],[x+10,y+8],[x+10,y+19],[x,y+19]],'#D94C56','all',.4));
 neck(c,[['#EF565E',4],['#F47276',.5]]);cuffs(c,[[1.5,'#E45059']]);notes='Coral-pink with tonal stepped angular blocks across torso/sleeves, pink ring/cuffs. Shape and approximately twenty-unit repeat derived from the independent flat source illustration. All black branding and repeated Hummel shoulder chevrons removed.';
}
if(!c||!notes)throw Error('Missing paint '+r.key);
add(r,c,notes+' All palette values are visual estimates. Paint adapts the observed color layout to the unchanged original PNG; no second physical collar is drawn.');
}
await save();
