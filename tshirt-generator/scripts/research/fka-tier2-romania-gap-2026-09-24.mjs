import {makeBatch,base,neck,cuffs,panels} from './tier2-helpers.mjs';
const {add,save}=await makeBatch('tier2-romania-gap-2026-09-24','Romania');
const c=base('#EDD315','#E5CB21');
c.colors.leftSleeve=c.colors.rightSleeve='#E4AC16';
panels(c,[[75,4],[75,11],[49,26],[42,39],[36,27]],'#E9B318');
cuffs(c,[[2.8,'#F0D724']]);neck(c,[['#EBD028',3]]);
add('CS Afumați','home',c,'Yellow body with golden-orange shoulders and sleeves, yellow sleeve ends and existing round neckline. Independent 2026/27 Home match reference checked; no dark folds painted, no sponsor/crest/lettering. Source lists Liga 3, while the preserved workbook Tier 2 identity and membership remain unchanged.');
await save();
