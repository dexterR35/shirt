import fs from 'node:fs/promises';
import sharp from 'sharp';

/** Illustrative fixtures, not a claim to reproduce undocumented Sports layouts. */
export async function buildNetbetProof(out) {
  const txt=(x,y,size,value,color)=>`<text x="${x}" y="${y}" font-family="Arial,sans-serif" font-size="${size}" fill="${color}">${value}</text>`;
  let svg='<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="750"><rect width="1200" height="750" fill="#0A1225"/>';
  svg+=txt(40,50,27,'Default jersey · component and surface checks','#FFFFFF');
  svg+=txt(40,82,14,'Illustrative slots: 24 px listing, 48 px fixture, 64 px event header. UX review pending.','#A8B2C0');
  const layers=[];
  for(const [i,s] of [{name:'NAVY',bg:'#0A1225',ink:'#FFFFFF',muted:'#A8B2C0',variant:'on-dark'}, {name:'CHARCOAL',bg:'#1E1E1E',ink:'#FFFFFF',muted:'#A8B2C0',variant:'on-dark'}, {name:'WHITE',bg:'#FFFFFF',ink:'#182F47',muted:'#56687A',variant:'on-light'}].entries()) {
    const x=40+i*380;
    svg+=`<rect x="${x}" y="118" width="360" height="560" rx="16" fill="${s.bg}" stroke="#56687A"/>`;
    svg+=txt(x+24,153,13,s.name,s.muted);
    svg+=txt(x+24,201,18,'Competition listing',s.ink);
    svg+=txt(x+24,244,13,'19:45',s.muted)+txt(x+115,244,15,'Club A',s.ink)+txt(x+210,244,15,'Club B',s.ink);
    svg+=txt(x+24,320,18,'Homepage fixture',s.ink)+txt(x+24,350,13,'Today · 19:45',s.muted);
    svg+=txt(x+90,394,15,'Club A',s.ink)+txt(x+175,394,15,'Club B',s.ink);
    svg+=txt(x+24,478,18,'Event detail',s.ink)+txt(x+111,536,18,'Club A – Club B',s.ink)+txt(x+111,562,13,'Kick-off 19:45',s.muted);
    svg+=txt(x+24,648,12,'Transparent assets · no image background',s.muted);
    for(const [size,px,py] of [[24,x+80,225],[24,x+275,225],[48,x+28,365],[48,x+280,365],[64,x+25,508]]) {
      const input=await fs.readFile(`${out}/assets/jersey-generic-netbet-${s.variant}-r003-${size}.png`);
      layers.push({input,left:px,top:py});
    }
  }
  svg+=txt(40,720,14,'Preserve mapped team jerseys and national flags. Use the generic only for an unmapped club.','#A8B2C0')+'</svg>';
  await sharp(Buffer.from(svg)).composite(layers).png().toFile(`${out}/component-previews.png`);
}
