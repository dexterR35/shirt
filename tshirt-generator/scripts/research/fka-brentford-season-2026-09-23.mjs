import fs from 'node:fs/promises';
import {saveProfiles} from './fka-save-profiles.mjs';
const previous=JSON.parse(await fs.readFile('data/kits/png-layouts/team_9729fba9a77388f456d5-home-p001.json','utf8'));
const profiles=[{country:'England',name:'Brentford',variant:'home',make:()=>structuredClone(previous.config),
  observations:'The saved archive independently identifies this red/white striped shirt as 26-27. Its broad white center/side columns, subtle tonal waves, black/yellow neck and cuffs match the existing source-specific PNG paint. This new revision binds that paint to the archive season; the earlier official 2026–2028 revision is preserved unchanged.'}];
await saveProfiles(profiles,'brentford-season-2026-09-23',{reviewed:process.argv.includes('--reviewed')?['Brentford:home']:[]});
