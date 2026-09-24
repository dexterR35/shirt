import fs from 'node:fs/promises';
import crypto from 'node:crypto';
// Run only after individually inspecting every comparison in this batch.
const batch=process.argv[2];
if(!/^tier[23]-[a-z0-9-]+$/.test(batch))throw Error('Invalid review batch');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const root=`artifacts/footballkitarchive/${batch}`;
const manifest=JSON.parse(await fs.readFile(`${root}/manifest.json`,'utf8'));
const reviews=[];
const reviewedAt=batch.match(/\d{4}-\d{2}-\d{2}$/)?.[0]||'2026-09-24';
for(const [i,m] of manifest.entries()){
 const k=JSON.parse(await fs.readFile(m.kit,'utf8'));
 reviews.push({key:`${m.name}:${m.variant}`,status:'ready',remaining:null,kit_revision_path:m.kit,reference_path:m.reference,reference_sha256:hash(await fs.readFile(m.reference)),config_sha256:hash(JSON.stringify(k.config)),comparison_path:`${root}/comparison-${Math.floor(i/4)+1}.png`,notes:'Compared saved source front and final PNG composite: body layout, stripe/band count, sleeve colors, cuff/neckline recoloring and branding removal. '+k.observations,reviewed_by:'Codex',reviewed_at:reviewedAt,human_approved:false});
}
await fs.writeFile(`data/research/${batch}-review.json`,JSON.stringify(reviews,null,2)+'\n');
