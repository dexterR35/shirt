/** Validate saved facts before showing them beside a particular applied kit. */
export function equipmentForKit(equipment,item){
  if(equipment==null)return null;
  if(equipment.variant!==item.variant||equipment.season!==item.kit_season)throw Error('Equipment details do not match the applied kit.');
  for(const key of ['type','season','source_season_label','source_team_name','design','brand','sponsor','release_date']){
    if(equipment[key]!=null&&typeof equipment[key]!=='string')throw Error(`Invalid equipment ${key}.`);
  }
  for(const key of ['colors','competitions'])if(!Array.isArray(equipment[key])||equipment[key].some(v=>typeof v!=='string'))throw Error(`Invalid equipment ${key}.`);
  if(equipment.source){
    let url;try{url=new URL(equipment.source.url);}catch{throw Error('Invalid equipment source.');}
    if(url.protocol!=='https:'||url.hostname!=='www.footballkitarchive.com'||url.username||url.password||!url.pathname.endsWith(`-kit-${equipment.source.kit_id}/`))throw Error('Invalid equipment source.');
  }
  return equipment;
}
