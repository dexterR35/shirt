import { useEffect, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router";
import Catalog from "../Catalog.jsx";
import PageHeader from "../PageHeader.jsx";
import { loadJson } from "../lib/kit-config.js";

let competitions;
/** Loaded once per page visit and shared by every catalog route. */
function loadCompetitions() {
  competitions ??= loadJson("/catalog/competitions.json").catch((e) => {
    competitions = undefined;
    throw e;
  });
  return competitions;
}

/**
 * Catalog page (/catalog/:groupId/:competitionSlug). The URL picks the tab; a missing
 * or unknown group/competition is replaced by the first valid one.
 */
export default function CatalogPage() {
  const { catalog, selection, addMany } = useOutletContext();
  const { groupId, competitionSlug } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null),
    [error, setError] = useState("");
  useEffect(() => {
    loadCompetitions().then(setData, (e) => setError(e.message));
  }, []);
  const group = data?.groups.find((g) => g.id === groupId);
  const competition = group?.competitions.find((c) => c.slug === competitionSlug);
  useEffect(() => {
    if (!data || competition) return;
    const g = group || data.groups[0];
    navigate(`/catalog/${g.id}/${g.competitions[0].slug}`, { replace: true });
  }, [data, group, competition, navigate]);

  const crumbs = [{ label: "Catalog", to: "/catalog" }];
  if (group) crumbs.push({ label: group.name, to: `/catalog/${group.id}` });
  if (competition) crumbs.push({ label: competition.name });
  return (
    <>
      <PageHeader
        crumbs={crumbs}
        title="Every competition. Every shirt."
        counts={catalog.counts}
      />
      {error ? (
        <p className="catalog-message">{error}</p>
      ) : !competition ? (
        <p className="catalog-message">Loading competitions…</p>
      ) : (
        <Catalog
          data={data}
          group={group}
          competition={competition}
          teams={catalog.teams}
          collectionSize={selection.length}
          onAdd={addMany}
          onSelect={(g, c) => navigate(`/catalog/${g}/${c}`)}
        />
      )}
    </>
  );
}
