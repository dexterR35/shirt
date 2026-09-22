// Native vector master following the supplied 200 x 200 highlight silhouette.
// No embedded PNG, external images, logos or automatic team assignments.
export const TEMPLATE_VERSION = 'reference-front-2';
export const GEOMETRY = Object.freeze({
  outline: 'M84 2.5 C92 2 106 2 114 2.5 C118.5 4.2 124 11.2 134.5 16 L153.8 24 C164.5 28.7 167.8 39.3 171 50.5 L175.8 67.4 C178.4 73 180 77.8 180.5 81.8 Q166.5 88 153 90.1 L148.5 76.3 C147.2 92 145.8 104.8 145.2 117.5 L143.1 134 C142.7 140.8 145.4 146.1 145.8 154.1 L147 185.8 Q147.3 189.9 140.6 192.4 C116.5 201.1 82.3 201.1 58.5 192.4 Q51.4 189.8 52 185.6 L52.8 159.8 C53.1 151.5 55.6 145.3 55.6 137.5 C55.8 118.5 54.3 98.1 51.5 77 L46.2 90 Q31.3 87.7 18.5 81.5 L25.9 56.8 C29.2 43.5 30.9 31.6 43.3 25 L61 17 C72.3 12.3 77.7 5.2 84 2.5 Z',
  torso: 'M55 19.3 L84 2.5 L114 2.5 L145 19.3 C139.7 31.1 142.5 50.2 148.5 76.3 C147.2 92 145.8 104.8 145.2 117.5 L143.1 134 C142.7 140.8 145.4 146.1 145.8 154.1 L147 185.8 Q147.3 189.9 140.6 192.4 C116.5 201.1 82.3 201.1 58.5 192.4 Q51.4 189.8 52 185.6 L52.8 159.8 C53.1 151.5 55.6 145.3 55.6 137.5 C55.8 118.5 54.3 98.1 51.5 77 C56.7 49.9 59.6 33.1 55 19.3 Z',
  leftSleeve: 'M55 19.3 L43.3 25 C30.9 31.6 29.2 43.5 25.9 56.8 L18.5 81.5 Q31.3 87.7 46.2 90 L51.5 77 C56.7 49.9 59.6 33.1 55 19.3 Z',
  rightSleeve: 'M145 19.3 L153.8 24 C164.5 28.7 167.8 39.3 171 50.5 L175.8 67.4 C178.4 73 180 77.8 180.5 81.8 Q166.5 88 153 90.1 L148.5 76.3 C142.5 50.2 139.7 31.1 145 19.3 Z',
  leftCuff: 'M19.8 77.4 Q32.7 83.5 47.5 85.4 L46.2 90 Q31.3 87.7 18.5 81.5 Z',
  rightCuff: 'M152 85.6 Q167.1 83.6 179.2 77.8 L180.5 81.8 Q166.5 88 153 90.1 Z',
  canvasTransform: 'translate(32 32) scale(2.24)'
});
export const patterns = ['solid', 'vertical', 'horizontal', 'halves', 'sash', 'checks'];
const xml=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const num=n=>Number(n.toFixed(4));

export function normalize(input={}){
  const p={id:'shirt-master',name:'Master după referință',body:'#E7EBEE',secondary:'#FFFFFF',sleeves:null,leftSleeve:null,rightSleeve:null,collar:null,cuffs:null,pattern:'solid',patternScope:'body',collarShape:'v',stripeWidth:28,stripeOffset:0,shadingStrength:0.65,width:512,height:512,...input};
  if(!/^[a-z0-9][a-z0-9_-]{0,79}$/.test(p.id))throw Error('Invalid variant ID');
  if(!patterns.includes(p.pattern))throw Error('Unsupported pattern: '+p.pattern);
  if(!['body','all'].includes(p.patternScope))throw Error('Invalid patternScope');
  if(!['round','v'].includes(p.collarShape))throw Error('Invalid collarShape');
  p.sleeves??=p.body;p.leftSleeve??=p.sleeves;p.rightSleeve??=p.sleeves;p.collar??=p.body;p.cuffs??=p.sleeves;
  for(const key of ['body','secondary','sleeves','leftSleeve','rightSleeve','collar','cuffs'])if(!/^#[0-9a-fA-F]{6}$/.test(p[key]))throw Error('Invalid HEX for '+key);
  for(const key of ['width','height'])if(!Number.isInteger(p[key])||p[key]<64||p[key]>8192)throw Error('Invalid export dimension');
  if(!Number.isFinite(p.stripeWidth)||p.stripeWidth<4||p.stripeWidth>160)throw Error('stripeWidth must be 4–160');
  if(!Number.isFinite(p.stripeOffset)||Math.abs(p.stripeOffset)>512)throw Error('stripeOffset must be between -512 and 512');
  if(!Number.isFinite(p.shadingStrength)||p.shadingStrength<0||p.shadingStrength>1)throw Error('shadingStrength must be 0–1');
  return p;
}

function patternMarkup(p,q){
  const w=num(p.stripeWidth/2.24),offset=num(p.stripeOffset/2.24);
  if(p.pattern==='solid')return '';
  if(p.pattern==='halves')return `<rect x="100" width="100" height="200" fill="${p.secondary}"/>`;
  if(p.pattern==='sash')return `<path d="M45 208L151 8" fill="none" stroke="${p.secondary}" stroke-width="${w*2}"/>`;
  if(p.pattern==='vertical')return `<defs><pattern id="${q}repeat" width="${w*2}" height="200" patternUnits="userSpaceOnUse" x="${100-w/2+offset}"><rect width="${w}" height="200" fill="${p.secondary}"/></pattern></defs><rect width="200" height="200" fill="url(#${q}repeat)"/>`;
  if(p.pattern==='horizontal')return `<defs><pattern id="${q}repeat" width="200" height="${w*2}" patternUnits="userSpaceOnUse" y="${24+offset}"><rect width="200" height="${w}" fill="${p.secondary}"/></pattern></defs><rect width="200" height="200" fill="url(#${q}repeat)"/>`;
  return `<defs><pattern id="${q}repeat" width="${w*2}" height="${w*2}" patternUnits="userSpaceOnUse" x="${100+offset}" y="20"><path d="M0 0H${w}V${w}H0Z M${w} ${w}H${2*w}V${2*w}H${w}Z" fill="${p.secondary}"/></pattern></defs><rect width="200" height="200" fill="url(#${q}repeat)"/>`;
}

export function renderShirt(input={},uid=''){
  const p=normalize(input);
  if(uid&&!/^[a-zA-Z0-9_-]+$/.test(uid))throw Error('Invalid SVG ID prefix');
  const q=(uid||p.id)+'-',g=GEOMETRY;
  // High back neckline and internal front neck facing keep the reference outline.
  const collar=p.collarShape==='v'
    ? `<path d="M81.8 4.1L84.8 2.4Q100 4.2 115.2 2.4L118.2 4.1L115.7 12L100 32L84.3 12Z" fill="${p.collar}"/><path d="M85.1 3Q100 5.2 114.9 3L112.7 11L100 26.9L87.3 11Z" fill="${p.body}"/><path d="M85.1 3Q100 5.2 114.9 3L112.7 11L100 26.9L87.3 11Z" fill="#14202B" opacity=".15"/><path d="M83.4 5.5L85.5 11.5L100 30.7L114.5 11.5L116.6 5.5" stroke="#FFFFFF" stroke-opacity=".12" stroke-width=".5"/>`
    : `<path d="M81.8 4.1L84.8 2.4Q100 4.2 115.2 2.4L118.2 4.1C117.5 15.4 110.8 21.1 100 21.5C89.2 21.1 82.5 15.4 81.8 4.1Z" fill="${p.collar}"/><path d="M85.2 3Q100 5.2 114.8 3C114.1 12.7 109 17 100 17.3C91 17 85.9 12.7 85.2 3Z" fill="${p.body}"/><path d="M85.2 3Q100 5.2 114.8 3C114.1 12.7 109 17 100 17.3C91 17 85.9 12.7 85.2 3Z" fill="#14202B" opacity=".15"/><path d="M83.5 4.3C84.6 14.8 90.6 19.8 100 20.1C109.4 19.8 115.4 14.8 116.5 4.3" stroke="#FFFFFF" stroke-opacity=".13" stroke-width=".5"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${p.width}" height="${p.height}" viewBox="0 0 512 512" fill="none" role="img" aria-labelledby="${q}title">
<title id="${q}title">${xml(p.name)}</title>
<desc>Editable vector shirt. Silhouette redrawn from the supplied highlight reference, subtle vector shading and transparent canvas. Generic design study, not a verified team kit. Template ${TEMPLATE_VERSION}.</desc>
<metadata id="${q}configuration">${xml(JSON.stringify({...p,templateVersion:TEMPLATE_VERSION}))}</metadata>
<g transform="${g.canvasTransform}">
<defs>
 <mask id="${q}mask" maskUnits="userSpaceOnUse" x="0" y="0" width="200" height="200"><path d="${g.outline}" fill="#FFFFFF"/></mask>
 <clipPath id="${q}silhouette"><path d="${g.outline}"/></clipPath>
 <clipPath id="${q}torso"><path d="${g.torso}"/></clipPath>
 <linearGradient id="${q}body-light" x1="50" y1="100" x2="150" y2="100" gradientUnits="userSpaceOnUse"><stop stop-color="#132130" stop-opacity=".085"/><stop offset=".12" stop-color="#132130" stop-opacity="0"/><stop offset=".40" stop-color="#FFFFFF" stop-opacity=".025"/><stop offset=".84" stop-color="#132130" stop-opacity="0"/><stop offset="1" stop-color="#132130" stop-opacity=".095"/></linearGradient>
 <linearGradient id="${q}left-light" x1="21" y1="63" x2="58" y2="49" gradientUnits="userSpaceOnUse"><stop stop-color="#FFFFFF" stop-opacity=".065"/><stop offset=".60" stop-color="#132130" stop-opacity="0"/><stop offset="1" stop-color="#132130" stop-opacity=".08"/></linearGradient>
 <linearGradient id="${q}right-light" x1="144" y1="50" x2="181" y2="67" gradientUnits="userSpaceOnUse"><stop stop-color="#132130" stop-opacity=".08"/><stop offset=".5" stop-color="#132130" stop-opacity="0"/><stop offset="1" stop-color="#132130" stop-opacity=".035"/></linearGradient>
 <linearGradient id="${q}hem-light" x1="100" y1="179" x2="100" y2="199" gradientUnits="userSpaceOnUse"><stop stop-color="#14202B" stop-opacity="0"/><stop offset="1" stop-color="#14202B" stop-opacity=".07"/></linearGradient>
 <filter id="${q}soft" x="-30%" y="-20%" width="160%" height="140%" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="1.1"/></filter>
</defs>
<g id="${q}shirt" mask="url(#${q}mask)">
 <g id="${q}base-colors"><rect id="${q}body" width="200" height="200" fill="${p.body}"/><path id="${q}sleeve-left" d="${g.leftSleeve}" fill="${p.leftSleeve}"/><path id="${q}sleeve-right" d="${g.rightSleeve}" fill="${p.rightSleeve}"/></g>
 <g id="${q}pattern" clip-path="url(#${q}${p.patternScope==='body'?'torso':'silhouette'})">${patternMarkup(p,q)}</g>
 <g id="${q}cuffs"><path d="${g.leftCuff}" fill="${p.cuffs}"/><path d="${g.rightCuff}" fill="${p.cuffs}"/></g>
 <g id="${q}shading" opacity="${p.shadingStrength}">
  <path d="${g.torso}" fill="url(#${q}body-light)"/>
  <path d="${g.leftSleeve}" fill="url(#${q}left-light)"/><path d="${g.rightSleeve}" fill="url(#${q}right-light)"/>
  <path d="${g.torso}" fill="url(#${q}hem-light)"/>
  <g filter="url(#${q}soft)" stroke-linecap="round">
   <path d="${p.collarShape==='v'?'M82.5 10L100 32.2L117.5 10':'M81.5 9C84.5 25.4 115.5 25.4 118.5 9'}" stroke="#162331" stroke-width="1.8" stroke-opacity=".055"/>
   <path d="M49.3 57C53.9 64 56.5 75 55.6 88" stroke="#162331" stroke-width="2.6" stroke-opacity=".08"/>
   <path d="M150.6 58C145.8 67 144.7 77 145.4 88" stroke="#162331" stroke-width="2.4" stroke-opacity=".08"/>
   <path d="M58 87C60.8 106 61 120 59.8 135" stroke="#FFFFFF" stroke-width="3" stroke-opacity=".09"/>
   <path d="M141 84C138.7 105 139.3 124 139.4 137" stroke="#FFFFFF" stroke-width="3" stroke-opacity=".08"/>
   <path d="M60 149C58.8 164 59.8 176 63 185" stroke="#152534" stroke-width="2.8" stroke-opacity=".035"/>
   <path d="M135 156C137 169 137.2 180 135.6 188" stroke="#152534" stroke-width="2.7" stroke-opacity=".03"/>
   <path d="M51.8 76C56 84 64.8 87.2 70.8 96" stroke="#152534" stroke-width="2.1" stroke-opacity=".05"/>
   <path d="M147.8 76C142.8 84 135.2 90.2 130.4 98" stroke="#152534" stroke-width="2" stroke-opacity=".045"/>
  </g>
 </g>
 <g id="${q}collar">${collar}</g>
 <g id="${q}seams" stroke="#12212F" stroke-linecap="round" stroke-width=".36" stroke-opacity=".085">
  <path d="M55 19.8C59.3 34.3 56.4 51.2 51.5 76.7M145 19.8C140.6 32.8 142.7 50.5 148.5 76.3"/>
  <path d="M20 77.4Q33.5 83.8 47.4 85.4M152 85.6Q167 83.6 179.2 77.8"/>
  <path d="M53.9 185.8C78.1 197.1 122.5 197.5 145.2 185.8" stroke-opacity=".065"/>
 </g>
 <path id="${q}outline" d="${g.outline}" stroke="#152534" stroke-opacity=".09" stroke-width=".45" stroke-linejoin="round"/>
</g>
</g>
</svg>`;
}
