/** Equipment facts are loaded from saved local JSON with the applied revision. */
export default function EquipmentCard({active,equipment,custom}) {
  const fields = active && [
    ['Team',active.team_name],['Season',equipment?.source_season_label || active.kit_season],
    ['Type',equipment?.type || (active.variant==='home'?'Home':'Away')],
    ['Design',equipment?.design],['Colors',equipment?.colors?.join(' / ')],
    ['Brand',equipment?.brand],['Sponsor',equipment?.sponsor],
    ['Competitions',equipment?.competitions?.join(' · ')],['Release date',equipment?.release_date],
  ];
  return <section className="source-card equipment-card" aria-label="Applied kit details">
    <span className="eyebrow">EQUIPMENT DETAILS</span>
    <h3>{active ? `${active.variant==='home'?'Home':'Away'} kit` : 'Your kit details'}</h3>
    {active ? <>
      {custom && <p className="equipment-custom">Custom colors preview · facts below describe the saved team kit.</p>}
      <dl>{fields.map(([label,value])=><div key={label}><dt>{label}</dt><dd className={value?'':'not-listed'}>{value || (equipment?.source && (equipment.extended_fields_checked || !['Sponsor','Competitions','Release date'].includes(label))?'Not listed':'Not researched')}</dd></div>)}</dl>
      {equipment?.source && <p className="equipment-source"><a href={equipment.source.url} target="_blank" rel="noreferrer">Football Kit Archive ↗</a><br/>Saved locally · checked {equipment.source.extended_fields_checked_at || equipment.source.checked_at}</p>}
    </> : <p>Apply a team kit to see its season, design, colors, brand, sponsor and release date.</p>}
  </section>;
}
