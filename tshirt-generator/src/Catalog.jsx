import { useMemo } from "react";
import DataTable, { selectColumn } from "./DataTable.jsx";
import KitThumb from "./KitThumb.jsx";

const COLLECTION_LIMIT = 10;
const EMPTY = [];

/** One row per shirt (team × Home/Away); only ready shirts can be selected. */
const columns = [
  selectColumn,
  {
    id: "shirt",
    header: "Shirt",
    size: 64,
    enableSorting: false,
    enableGlobalFilter: false,
    cell: ({ row }) => <KitThumb item={row.original.item} label={`${row.original.team} ${row.original.kit} shirt`} />,
  },
  {
    accessorKey: "team",
    header: "Team",
    cell: ({ row }) => (
      <span className="cell-team">
        <strong>{row.original.team}</strong>
        <small>{row.original.country}</small>
      </span>
    ),
  },
  { accessorKey: "kit", header: "Kit" },
  { accessorKey: "season", header: "Season" },
  { accessorKey: "brand", header: "Brand" },
  { accessorKey: "colors", header: "Colors", enableSorting: false },
  { accessorKey: "design", header: "Design" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <span className={`cell-status ${row.original.ready ? "ready" : ""}`}>{row.original.status}</span>,
  },
];

function shirtRows(competition, teamsById, facts) {
  if (!competition) return EMPTY;
  return competition.team_ids.flatMap((id) => {
    const team = teamsById.get(id);
    if (!team) return [];
    return ["home", "away"].map((variant) => {
      const slot = team.kits[variant], fact = facts[id]?.[variant], ready = slot.status === "ready";
      return {
        id: `${id}:${variant}`,
        team: team.name,
        country: team.country_name,
        kit: variant === "home" ? "Home" : "Away",
        season: slot.kit_season || fact?.season || "",
        brand: fact?.brand || "",
        colors: (fact?.colors || []).join(" / "),
        design: fact?.design || "",
        ready,
        status: ready ? "Ready" : "Not ready",
        item: ready ? { ...slot, team_id: id, team_name: team.name, country_name: team.country_name, variant } : null,
      };
    });
  });
}

/**
 * Catalog view: competition group tabs and sub-tabs over the reusable DataTable.
 * Controlled by the route: `onSelect(groupId, competitionSlug)` changes the URL.
 * Selected ready shirts are added to the collection together.
 * @param {{data:any, group:any, competition:any, teams:any[], collectionSize:number,
 *   onAdd:(items:any[])=>void, onSelect:(groupId:string, competitionSlug:string)=>void}} props
 */
export default function Catalog({ data, group, competition, teams, collectionSize, onAdd, onSelect }) {
  const teamsById = useMemo(() => new Map(teams.map((t) => [t.id, t])), [teams]);
  const rows = useMemo(() => shirtRows(competition, teamsById, data.facts), [competition, teamsById, data]);
  const free = COLLECTION_LIMIT - collectionSize;

  return (
    <section className="catalog">
      <div className="catalog-tabs" role="tablist" aria-label="Competition groups">
        {data.groups.map((g) => (
          <button
            key={g.id}
            role="tab"
            aria-selected={g.id === group.id}
            className={g.id === group.id ? "active" : ""}
            onClick={() => onSelect(g.id, g.competitions[0].slug)}
          >
            {g.name}
          </button>
        ))}
      </div>
      <div className="catalog-subtabs" role="tablist" aria-label={`${group.name} competitions`}>
        {group.competitions.map((c) => (
          <button
            key={c.id}
            role="tab"
            aria-selected={c.id === competition.id}
            className={c.id === competition.id ? "active" : ""}
            onClick={() => onSelect(group.id, c.slug)}
          >
            {c.name}
            <span>{c.team_ids.length}</span>
          </button>
        ))}
      </div>
      <DataTable
        label={competition.name}
        data={rows}
        columns={columns}
        getRowId={(row) => row.id}
        canSelect={(row) => row.ready}
        resetKey={competition.id}
        searchPlaceholder="Search team, brand, color…"
        emptyText="No shirts match."
        actions={(selected, clear) => {
          const tooMany = selected.length > free;
          return (
            <div className="catalog-actions">
              <span className={tooMany ? "over" : ""}>
                {selected.length} selected · {Math.max(free, 0)} of {COLLECTION_LIMIT} collection slots free
              </span>
              <button
                className="primary"
                disabled={!selected.length || tooMany}
                title={tooMany ? "Select fewer shirts or remove some from the collection" : undefined}
                onClick={() => {
                  onAdd(selected.map((r) => r.item));
                  clear();
                }}
              >
                Add {selected.length || ""} to collection
              </button>
            </div>
          );
        }}
      />
    </section>
  );
}
