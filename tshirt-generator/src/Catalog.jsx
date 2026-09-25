import { useMemo } from "react";
import DataTable, { selectColumn } from "./DataTable.jsx";
import KitThumb from "./KitThumb.jsx";
import DownloadStats from "./DownloadStats.jsx";
import Icon from "./Icon.jsx";
import { COLLECTION_LIMIT, kitItem, revisionKey, variantLabel } from "./lib/catalog.js";

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
  {
    id: "popularity",
    header: "Downloads",
    enableSorting: false,
    enableGlobalFilter: false,
    cell: ({ row }) => <DownloadStats item={row.original.item} compact />,
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
        kit: variantLabel(variant),
        season: slot.kit_season || fact?.season || "",
        brand: fact?.brand || "",
        colors: (fact?.colors || []).join(" / "),
        design: fact?.design || "",
        ready,
        status: ready ? "Ready" : "Not ready",
        item: ready ? kitItem(team, variant) : null,
      };
    });
  });
}

/**
 * Catalog view: a side list of groups (countries, UEFA) with the open group's
 * competitions nested under it, and the reusable DataTable beside it.
 * Controlled by the route: `onSelect(groupId, competitionSlug)` changes the URL.
 * Selected ready shirts are added to the collection together.
 * Shirts already in the collection are skipped when adding, so they do not use a free slot.
 * @param {{data:any, group:any, competition:any, teams:any[], collection:any[],
 *   onAdd:(items:any[])=>void, onSelect:(groupId:string, competitionSlug:string)=>void}} props
 */
export default function Catalog({ data, group, competition, teams, collection, onAdd, onSelect }) {
  const teamsById = useMemo(() => new Map(teams.map((t) => [t.id, t])), [teams]);
  const rows = useMemo(() => shirtRows(competition, teamsById, data.facts), [competition, teamsById, data]);
  const inCollection = useMemo(() => new Set(collection.map(revisionKey)), [collection]);
  const free = COLLECTION_LIMIT - collection.length;

  return (
    <section className="catalog">
      <nav className="catalog-nav" aria-label="Competitions">
        {data.groups.map((g) => {
          const open = g.id === group.id;
          return (
            <div key={g.id} className={`catalog-group ${open ? "open" : ""}`}>
              <button
                className="catalog-group-name"
                aria-expanded={open}
                onClick={() => onSelect(g.id, g.competitions[0].slug)}
              >
                {g.name}
                <Icon name="right" size={13} />
              </button>
              {open && (
                <ul>
                  {g.competitions.map((c) => (
                    <li key={c.id}>
                      <button
                        className={c.id === competition.id ? "active" : ""}
                        aria-current={c.id === competition.id ? "page" : undefined}
                        onClick={() => onSelect(g.id, c.slug)}
                      >
                        <span>{c.name}</span>
                        <small>{c.team_ids.length}</small>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </nav>
      <div className="catalog-main">
        <div className="catalog-heading">
          <small className="eyebrow">{group.name.toUpperCase()}</small>
          <h3>
            {competition.name}
            <span>{competition.team_ids.length} teams · {rows.length} shirts</span>
          </h3>
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
          const tooMany = selected.filter((r) => !inCollection.has(revisionKey(r.item))).length > free;
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
      </div>
    </section>
  );
}
