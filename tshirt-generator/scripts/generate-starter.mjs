import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const cwd=fileURLToPath(new URL('../starter/shirt-svg/',import.meta.url));
const result=spawnSync(process.execPath,['generate.mjs','presets.json','svg'],{cwd,stdio:'inherit'});
if(result.error)throw result.error;
process.exit(result.status??1);
