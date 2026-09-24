import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import {refinementBatch,read,base} from './tier2-refinement-helpers.mjs';
const batch='tier2-finland-2026-09-24';
const r=await read('data/research/footballkitarchive/records/research_df8a198d96bfb37c9798.json');
const row={name:r.team_name,country:r.country_name,variant:r.variant,key:`${r.team_name}:${r.variant}`,reference_path:r.local_reference_path,reference_sha256:crypto.createHash('sha256').update(await fs.readFile(r.local_reference_path)).digest('hex')};
const {add,save}=await refinementBatch(batch,[],[row]);
add(row,base('#EFF0E8'),'Independently verified 2026 FC Haka Home. Plain warm-white body, sleeves, existing round collar and same-color cuff bands. The many black areas in the mannequin reference are sponsors, manufacturer marks or the crest and are all omitted. No invented black trim. Garment color visually estimated, avoiding the warm display lighting; original PNG fabric and alpha retained. Literal calendar-year 2026 preserved.');
await save();
