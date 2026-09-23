import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PngShirtPreview from "./PngShirtPreview.jsx";
import Modal from "./Modal.jsx";
import PartHighlight from "./PartHighlight.jsx";
import {editableParts, applyEdits} from "./lib/kit-edit.js";
import {partAt, visiblePartIds} from "./lib/png-preview.js";
import {useZoom, ZOOM_MIN, ZOOM_MAX} from "./lib/use-zoom.js";
import EquipmentCard from "./EquipmentCard.jsx";
import {equipmentForKit} from "./lib/equipment.js";
import {neutralConfig} from "./lib/shirt-renderer.js";
import {kitPreviewConfig} from "./lib/png-layout.js";
import {
  filterTeams,
  addToSelection,
  revisionKey,
} from "./lib/catalog.js";

function Icon({ name, size = 20, ...props }) {
  const paths = {
    shirt: "M8 3 3 5 1 10l4 2 2-3v12h10V9l2 3 4-2-2-5-5-2c0 4-8 4-8 0Z",
    search: "m21 21-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0",
    arrow: "M5 12h14m-6-6 6 6-6 6",
    download: "M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5",
    plus: "M12 5v14M5 12h14",
    minus: "M5 12h14",
    fit: "M4 9V4h5m6 0h5v5m0 6v5h-5m-6 0H4v-5m8-5v2m-1-1h2",
    edit: "M4 20h4L19 9l-4-4L4 16v4Zm9-13 4 4",
    left: "m15 5-7 7 7 7",
    right: "m9 5 7 7-7 7",
    check: "m5 12 4 4L19 6",
    close: "m6 6 12 12M6 18 18 6",
    globe:
      "M21 12H3m9-9c5 5 5 13 0 18-5-5-5-13 0-18ZM21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0",
    layers: "m12 3 10 6-10 6L2 9l10-6Zm-10 11 10 6 10-6",
    link: "m10 13 4-4m-6 7-2 2a4 4 0 0 1-6-6l4-4m12-1 2-2a4 4 0 0 1 6 6l-4 4",
    info: "M12 11v6m0-10v1M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0",
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d={paths[name] || paths.shirt} />
    </svg>
  );
}
const statusLabel = (status) =>
  status === "ready"
    ? "Ready"
    : status === "blocked"
      ? "Reference needed"
      : status === "draft" || status === "drafted" || status === "reviewed"
        ? "In review"
        : "In research";
function Status({ status }) {
  return (
    <span
      className={`status ${status === "ready" ? "ready" : status === "blocked" ? "blocked" : ""}`}
    >
      <span />
      {statusLabel(status)}
    </span>
  );
}
const VIEW_KEY = "tshirt-studio:view";
/** Remember the shown team/variant for this browser tab; storage may be unavailable. */
function readView() {
  try { return JSON.parse(sessionStorage.getItem(VIEW_KEY)); } catch { return null; }
}
function saveView(view) {
  try { sessionStorage.setItem(VIEW_KEY, JSON.stringify(view)); } catch { /* optional */ }
}
function kitItem(team, variant) {
  return {
    ...team.kits[variant],
    team_id: team.id,
    team_name: team.name,
    country_name: team.country_name,
    variant,
  };
}
const json = async (url, signal) => {
  const r = await fetch(url, {signal});
  if (!r.ok) throw Error(`Could not load the local catalog (${r.status}).`);
  return r.json();
};
export default function App() {
  const [catalog, setCatalog] = useState(null),
    [loadError, setLoadError] = useState(""),
    [country, setCountry] = useState(""),
    [query, setQuery] = useState(""),
    [candidateId, setCandidateId] = useState(""),
    [variant, setVariant] = useState("home"),
    [active, setActive] = useState(null),
    [appliedConfig, setAppliedConfig] = useState(null),
    [equipment, setEquipment] = useState(null),
    [editing, setEditing] = useState(false),
    [draft, setDraft] = useState({}),
    [selectedPart, setSelectedPart] = useState(""),
    [visibleIds, setVisibleIds] = useState(null),
    [hoverPart, setHoverPart] = useState(null),
    [, setSavedVersion] = useState(0),
    [selection, setSelection] = useState([]),
    [busy, setBusy] = useState(false),
    [notice, setNotice] = useState(""),
    [background, setBackground] = useState("grid"),
    [tab, setTab] = useState("studio");
  const request = useRef(0),
    controller = useRef(null),
    cache = useRef(new Map()),
    // Saved color edits per kit: kept in memory until the page is refreshed.
    savedEdits = useRef(new Map());
  const zoom = useZoom();
  useEffect(() => {
    let alive = true;
    json("/catalog/manifest.json")
      .then((data) => {
        if (alive) {
          setCatalog(data);
          // Start on the plain base unless this tab already showed a kit.
          const view = readView(),
            team = data.teams.find((t) => t.id === view?.team_id);
          if (team && ["home", "away"].includes(view.variant)) show(team, view.variant);
        }
      })
      .catch((e) => alive && setLoadError(e.message));
    return () => {
      alive = false;
      controller.current?.abort();
    };
  }, []);
  const filtered = useMemo(
    () =>
      filterTeams(catalog?.teams || [], country, query).sort(
        (a, b) =>
          Number(!!b.mandatory) - Number(!!a.mandatory) ||
          Number(Object.values(b.kits).some((k) => k.status === "ready")) -
          Number(Object.values(a.kits).some((k) => k.status === "ready")) ||
          (a.priority_order ?? 9999) - (b.priority_order ?? 9999),
      ),
    [catalog, country, query],
  );
  const candidate = catalog?.teams.find((t) => t.id === candidateId),
    slot = candidate?.kits[variant];
  const editKey = active ? `${revisionKey(active)}:${active.png_layout_revision || "original"}` : "base",
    editBase = useMemo(() => appliedConfig || neutralConfig(), [appliedConfig]),
    allParts = useMemo(() => editableParts(editBase), [editBase]),
    // Hide parts that are fully covered by other paint, e.g. sleeves under a sleeve panel.
    parts = visibleIds ? allParts.filter((p) => visibleIds.has(p.id) || p.id === selectedPart) : allParts,
    edits = editing ? draft : savedEdits.current.get(editKey) || {},
    edited = Object.keys(edits).length > 0;
  const previewConfig = useMemo(() => edited ? applyEdits(editBase, edits) : appliedConfig,
    [appliedConfig, editBase, edited, JSON.stringify(edits)]);
  const part = parts.find((p) => p.id === selectedPart);
  const missing = !active && candidate && slot?.status !== "ready";
  const selectedIndex = active
    ? selection.findIndex((s) => revisionKey(s) === revisionKey(active))
    : -1;
  /** Selecting a team or variant shows it at once; a missing kit shows the plain base. */
  function show(team, v) {
    setCandidateId(team.id);
    setVariant(v);
    setNotice("");
    saveView({ team_id: team.id, variant: v });
    if (team.kits[v].status === "ready") void activate(kitItem(team, v));
    else master();
  }
  async function activate(item) {
    const sequence = ++request.current;
    setCandidateId(item.team_id);
    setVariant(item.variant);
    controller.current?.abort();
    controller.current = new AbortController();
    setBusy(true);
    setNotice("");
    try {
      const key = `${revisionKey(item)}:${item.png_layout_revision || 'original'}`;
      let saved = cache.current.get(key);
      if (!saved) {
        const details = await json(item.details_path, controller.current.signal);
        saved = {config:kitPreviewConfig(details, item), equipment:equipmentForKit(details.equipment,item)};
        cache.current.set(key, saved);
      }
      if (request.current === sequence) {
        setActive(item);
        setAppliedConfig(saved.config);
        setEquipment(saved.equipment);
        setEditing(false);
      }
    } catch (e) {
      if (e.name !== "AbortError" && request.current === sequence)
        setNotice(e.message);
    } finally {
      if (request.current === sequence) setBusy(false);
    }
  }
  function add() {
    if (!candidate || slot?.status !== "ready") return;
    const item = kitItem(candidate, variant);
    try {
      setSelection(addToSelection(selection, item));
      setNotice(candidate.name + " " + variant + " added to your collection.");
    } catch (e) {
      setNotice(e.message);
    }
  }
  function remove(index) {
    const next = selection.filter((_, i) => i !== index);
    setSelection(next);
    if (index === selectedIndex && next.length)
      void activate(next[Math.min(index, next.length - 1)]);
  }
  function master() {
    request.current++;
    controller.current?.abort();
    setActive(null);
    setAppliedConfig(null);
    setEquipment(null);
    setEditing(false);
    setBusy(false);
  }
  function startEdit() {
    zoom.center();
    setDraft({...(savedEdits.current.get(editKey) || {})});
    setSelectedPart(allParts[0]?.id || "");
    setVisibleIds(null);
    setHoverPart(null);
    setEditing(true);
    visiblePartIds(editBase).then(setVisibleIds, () => setVisibleIds(null));
  }
  const cancelEdit = useCallback(() => setEditing(false), []);
  function saveEdit() {
    if (Object.keys(draft).length) savedEdits.current.set(editKey, draft);
    else savedEdits.current.delete(editKey);
    setSavedVersion((n) => n + 1);
    setEditing(false);
  }
  /** The editable part painted under the pointer, or null (outside the shirt). */
  async function partUnderPointer(e) {
    const el = e.currentTarget.querySelector(".shirt-image");
    if (!el?.width) return null;
    const r = el.getBoundingClientRect(), fit = Math.min(r.width, r.height) / el.width,
      px = (e.clientX - r.left - (r.width - el.width * fit) / 2) / fit,
      py = (e.clientY - r.top - (r.height - el.height * fit) / 2) / fit;
    if (px < 0 || py < 0 || px >= el.width || py >= el.height) return null;
    // Transparent pixels are outside the shirt.
    if (el.getContext("2d").getImageData(Math.floor(px), Math.floor(py), 1, 1).data[3] === 0) return null;
    const margin = el.width / 16, span = (el.width * 7) / 8;
    return partAt(editBase, ((px - margin) / span) * 200, ((py - margin) / span) * 200);
  }
  /** In edit mode, clicking the shirt selects the part painted under the pointer. */
  async function pickPart(e) {
    const id = await partUnderPointer(e);
    if (id) setSelectedPart(id);
  }
  async function hoverOver(e) {
    const id = await partUnderPointer(e);
    setHoverPart((current) => (current === id ? current : id));
  }
  if (loadError)
    return (
      <main className="load-state">
        <Icon name="info" size={36} />
        <h1>The studio could not open</h1>
        <p>{loadError}</p>
        <button className="primary" onClick={() => location.reload()}>
          Try again
        </button>
      </main>
    );
  if (!catalog)
    return (
      <main className="load-state">
        <Icon name="shirt" size={40} />
        <p>Opening your kit studio…</p>
      </main>
    );
  return (
    <div className="app">
      <header className="header">
        <a
          href="#"
          className="brand"
          onClick={(e) => {
            e.preventDefault();
            setTab("studio");
          }}
        >
          <span className="brand-mark">
            <Icon name="shirt" size={25} />
          </span>
          <span>
            T-shirt Generator<small>FOOTBALL KIT STUDIO</small>
          </span>
        </a>
        <nav aria-label="Workspace">
          <button
            className={tab === "studio" ? "nav-active" : ""}
            onClick={() => setTab("studio")}
          >
            Studio
          </button>
          <button
            className={tab === "coverage" ? "nav-active" : ""}
            onClick={() => setTab("coverage")}
          >
            Catalog <span>{catalog.counts.teams}</span>
          </button>
        </nav>
        <div className="season-label">
          <span className="live-dot" />
          2026 / 27 COLLECTION
        </div>
      </header>
      <main>
        <div className="page-heading">
          <div>
            <p className="eyebrow">THE BEAUTIFUL GAME, IN EVERY DETAIL</p>
            <h1>
              {tab === "studio"
                ? "Your team. Its true colors."
                : "Every team. Every reference."}
            </h1>
            <p>
              {tab === "studio"
                ? "Choose a team. Keep the fabric. Make the colors yours."
                : "A complete source catalog, with honest progress for every kit."}
            </p>
          </div>
          <div className="catalog-summary">
            <Icon name="globe" />
            <span>
              <strong>{catalog.counts.teams}</strong> teams
              <span className="summary-divider">/</span>
              <strong>{catalog.counts.countries}</strong> countries
            </span>
          </div>
        </div>
        {tab === "coverage" ? (
          <section className="coverage">
            <div className="coverage-stats">
              <article>
                <small>Source teams</small>
                <strong>{catalog.counts.teams}</strong>
                <p>Including 27 reserve teams</p>
              </article>
              <article>
                <small>Researched layouts</small>
                <strong>
                  {catalog.counts.ready}
                  <span> / {catalog.counts.slots}</span>
                </strong>
                <p>Home and Away verified separately</p>
              </article>
              <article>
                <small>Archive references saved</small>
                <strong>{catalog.counts.fka_references_saved || 0}<span> / {catalog.counts.slots}</span></strong>
                <p>Football Kit Archive · image collection</p>
              </article>
            </div>
            {!!catalog.counts.mandatory_teams && <p className="priority-summary">Excel priority: {catalog.counts.mandatory_teams} teams · {catalog.counts.mandatory_ready}/{catalog.counts.mandatory_slots} layouts ready · {catalog.counts.mandatory_references}/{catalog.counts.mandatory_slots} archive references saved.</p>}
            <div className="country-grid">
              {catalog.countries.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setCountry(c.id);
                    setQuery("");
                    setTab("studio");
                  }}
                >
                  <Icon name="globe" />
                  <span>
                    {c.name}
                    <small>{c.team_count} teams</small>
                  </span>
                  <Icon name="right" size={16} />
                </button>
              ))}
            </div>
          </section>
        ) : (
          <div className="workspace">
            <aside className="sidebar">
              <div className="section-title">
                <span className="step">01</span>
                <h2>Find your team</h2>
              </div>
              <label className="field-label" htmlFor="country">
                Country / association
              </label>
              <div className="select-wrap">
                <Icon name="globe" size={17} />
                <select
                  id="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                >
                  <option value="">All countries</option>
                  {catalog.countries.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.team_count})
                    </option>
                  ))}
                </select>
              </div>
              <label className="field-label" htmlFor="search">
                Team
              </label>
              <div className="search-wrap">
                <Icon name="search" size={18} />
                <input
                  id="search"
                  type="search"
                  placeholder="Search for a team…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <div className="list-label">
                <span>{filtered.length} TEAMS</span>
                {(query || country) && (
                  <button
                    onClick={() => {
                      setQuery("");
                      setCountry("");
                    }}
                  >
                    Reset filters
                  </button>
                )}
              </div>
              <div className="team-list" aria-label="Teams">
                {filtered.map((t) => (
                  <button
                    key={t.id}
                    className={`team-row ${candidateId === t.id ? "selected" : ""}`}
                    onClick={() => show(t, "home")}
                    aria-pressed={candidateId === t.id}
                  >
                    <span className="team-monogram">
                      {t.name
                        .replace(/^FC |^AS |^AC /, "")
                        .slice(0, 2)
                        .toUpperCase()}
                    </span>
                    <span className="team-info">
                      <strong>{t.name}</strong>
                      <small>
                        {t.country_name}
                        {t.reserve ? " · Reserves" : ""}
                      </small>
                    </span>
                    {Object.values(t.kits).some((k) => k.status === "ready") ? (
                      <span className="ready-dot" title="A kit is ready" />
                    ) : null}
                    {candidateId === t.id ? (
                      <Icon name="check" size={16} />
                    ) : (
                      <Icon name="right" size={14} />
                    )}
                  </button>
                ))}
                {!filtered.length && (
                  <div className="empty-results">
                    <Icon name="search" size={24} />
                    <p>No teams found</p>
                    <small>Try another name or country.</small>
                  </div>
                )}
              </div>
            </aside>
            <section className="preview-panel" aria-label="Shirt preview">
              <div className="preview-toolbar">
                <div className="candidate-heading">
                  <small>SELECTED TEAM</small>
                  <h3>{candidate?.name || "Choose a team"}</h3>
                  <div className="candidate-status">
                    <Status status={slot?.status} />
                    <span>{slot?.kit_season || "Season unverified"}</span>
                  </div>
                </div>
                <div className="variant-switch" aria-label="Kit variant">
                  {["home", "away"].map((v) => (
                    <button
                      key={v}
                      aria-pressed={variant === v}
                      disabled={!candidate}
                      onClick={() => show(candidate, v)}
                      className={variant === v ? "active" : ""}
                    >
                      {v === "home" ? "Home" : "Away"}
                      {candidate?.kits[v].status === "ready" && (
                        <span className="ready-dot" />
                      )}
                    </button>
                  ))}
                </div>
                <button
                  className="secondary add-button"
                  onClick={add}
                  disabled={slot?.status !== "ready" || busy}
                >
                  <Icon name="plus" size={14} />
                  Add to collection
                </button>
              </div>
              <div className={`canvas ${background}`}>
                <div className="canvas-topline">
                  <button
                    className={`edit-toggle ${editing ? "active" : ""} ${edited && !editing ? "edited" : ""}`}
                    aria-pressed={editing}
                    title={edited ? "Colors edited · not the saved team kit" : "Edit colors"}
                    onClick={editing ? cancelEdit : startEdit}
                    disabled={busy}
                  >
                    <Icon name="edit" size={13} />
                    Edit
                  </button>
                  <div
                    className="background-controls"
                    aria-label="Preview background"
                  >
                    {["grid", "light", "dark"].map((b) => (
                      <button
                        key={b}
                        className={`${b} ${background === b ? "active" : ""}`}
                        aria-label={`${b} background`}
                        aria-pressed={background === b}
                        onClick={() => setBackground(b)}
                      />
                    ))}
                  </div>
                </div>
                <div
                  className={`shirt-stage ${zoom.dragging ? "dragging" : ""} ${editing ? "editing" : ""} ${editing && hoverPart ? "over-part" : ""}`}
                  aria-busy={busy}
                  style={{touchAction: zoom.view.scale === 1 ? "pan-y" : "none"}}
                  {...(editing ? {onClick: pickPart, onPointerMove: hoverOver, onPointerLeave: () => setHoverPart(null)} : zoom.stageProps)}
                >
                  <PngShirtPreview
                    config={previewConfig}
                    cache={!editing}
                    style={{transform: `translate(${zoom.view.x}px, ${zoom.view.y}px) scale(${zoom.view.scale})`}}
                    label={active ? `${active.team_name} ${active.variant} shirt` : "Original PNG shirt"}
                  />
                  {editing && <PartHighlight config={editBase} selected={selectedPart} hover={hoverPart} />}
                </div>
                <div className="canvas-caption">
                  <span className="caption-kicker">
                    {active
                      ? `${active.country_name} / ${active.kit_season}`
                      : missing
                        ? candidate.country_name
                        : "THE ORIGINAL SILHOUETTE"}
                  </span>
                  <h2>
                    {active
                      ? active.team_name
                      : missing
                        ? candidate.name
                        : "A familiar shape. A fresh canvas."}
                  </h2>
                  <p>
                    {active
                      ? active.variant === "home" ? "Home" : "Away"
                      : missing
                        ? `${variant === "home" ? "Home" : "Away"} kit not available yet`
                        : "Original highlights, fabric folds, and transparent edges."}
                  </p>
                  {!active && !missing && (
                    <span className="neutral-note">
                      {edited ? "Custom design · not a verified team kit" : "Original PNG · no team colors applied"}
                    </span>
                  )}
                </div>
                <span className="dimension-label">8000 × 5000 SOURCE · PNG</span>
                {!editing && <div className="zoom-controls" aria-label="Zoom">
                  <button aria-label="Zoom out" onClick={zoom.zoomOut} disabled={zoom.view.scale <= ZOOM_MIN}>
                    <Icon name="minus" size={14} />
                  </button>
                  <span aria-live="polite">{Math.round(zoom.view.scale * 100)}%</span>
                  <button aria-label="Zoom in" onClick={zoom.zoomIn} disabled={zoom.view.scale >= ZOOM_MAX}>
                    <Icon name="plus" size={14} />
                  </button>
                  <button aria-label="Center shirt" onClick={zoom.center} disabled={zoom.view.scale === 1 && !zoom.view.x && !zoom.view.y}>
                    <Icon name="fit" size={14} />
                  </button>
                </div>}
              </div>
              {editing && (
                <Modal
                  title="Edit colors"
                  className="edit-modal"
                  onClose={cancelEdit}
                  footer={<>
                    <button className="secondary" onClick={() => setDraft({})} disabled={!Object.keys(draft).length}>Reset all</button>
                    <button className="secondary" onClick={cancelEdit}>Cancel</button>
                    <button className="primary" onClick={saveEdit}>Save</button>
                  </>}
                >
                  <p className="edit-hint">Click a part on the shirt, or choose it below.</p>
                  <div className="part-list">
                    {parts.map((p) => (
                      <button
                        key={p.id}
                        className={`part-option ${selectedPart === p.id ? "selected" : ""}`}
                        aria-pressed={selectedPart === p.id}
                        onClick={() => setSelectedPart(p.id)}
                        onMouseEnter={() => setHoverPart(p.id)}
                        onMouseLeave={() => setHoverPart(null)}
                      >
                        <span className="swatch" style={{background: draft[p.id] || p.color}} />
                        {p.label}
                        {draft[p.id] && <span className="changed-dot" aria-label="changed" />}
                      </button>
                    ))}
                  </div>
                  {part && (
                    <div className="part-color">
                      <label>
                        {part.label} color
                        <input
                          type="color"
                          aria-label={`${part.label} color`}
                          value={(draft[part.id] || part.color).toLowerCase()}
                          onChange={(e) => setDraft({...draft, [part.id]: e.target.value.toUpperCase()})}
                        />
                      </label>
                      <span className="hex">{draft[part.id] || part.color}</span>
                      <button
                        className="secondary"
                        disabled={!draft[part.id]}
                        onClick={() => { const next = {...draft}; delete next[part.id]; setDraft(next); }}
                      >
                        Reset part
                      </button>
                    </div>
                  )}
                </Modal>
              )}
              <div className="preview-actions">
                <div className="pager">
                  <button
                    aria-label="Previous kit"
                    disabled={selection.length < 2 || busy}
                    onClick={() =>
                      activate(
                        selection[
                          selectedIndex < 0
                            ? selection.length - 1
                            : (selectedIndex - 1 + selection.length) %
                              selection.length
                        ],
                      )
                    }
                  >
                    <Icon name="left" size={17} />
                  </button>
                  <span>
                    {selectedIndex < 0 ? "—" : selectedIndex + 1}
                    <span> / {selection.length || "—"}</span>
                  </span>
                  <button
                    aria-label="Next kit"
                    disabled={!selection.length || busy}
                    onClick={() =>
                      activate(
                        selection[(selectedIndex + 1) % selection.length],
                      )
                    }
                  >
                    <Icon name="right" size={17} />
                  </button>
                </div>
                <button className="download primary" disabled title="Download sizes and formats will be added later">
                  <Icon name="download" size={18} />
                  Download later
                </button>
              </div>
              <div className="preview-notes">
                <span>
                  <Icon name="check" size={14} />
                  Original PNG texture
                </span>
                <span>
                  <Icon name="check" size={14} />
                  No emblems or sponsors
                </span>
                <span>
                  <Icon name="check" size={14} />
                  Transparent edges
                </span>
              </div>
            </section>
            <aside className="collection-panel">
              <div className="section-title">
                <Icon name="layers" size={18} />
                <h2>Your collection</h2>
                <span className="count-pill">{selection.length}/10</span>
              </div>
              {selection.length ? (
                <div className="collection-list">
                  {selection.map((item, i) => (
                    <div
                      className={`collection-item ${selectedIndex === i ? "current" : ""}`}
                      key={revisionKey(item)}
                    >
                      <button onClick={() => activate(item)} disabled={busy}>
                        <Icon name="shirt" size={26} />
                        <span>
                          <strong>{item.team_name}</strong>
                          <small>
                            {item.variant} · {item.kit_season}
                          </small>
                        </span>
                      </button>
                      <button
                        className="remove"
                        aria-label={`Remove ${item.team_name} ${item.variant}`}
                        onClick={() => remove(i)}
                      >
                        <Icon name="close" size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="collection-empty">
                  <span className="empty-icon">
                    <Icon name="shirt" size={33} />
                    <span>+</span>
                  </span>
                  <h3>A squad of your own</h3>
                  <div className="empty-slots">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <span key={n} />
                    ))}
                  </div>
                </div>
              )}
              <button
                className="secondary zip-button"
                disabled
                title="Export sizes and formats will be added later"
              >
                <Icon name="download" size={17} />
                Collection export later
              </button>
              <EquipmentCard active={active} equipment={equipment} custom={edited}/>
            </aside>
          </div>
        )}
        <div
          className={`notice ${notice ? "visible" : ""}`}
          role="status"
          aria-live="polite"
        >
          {notice && (
            <>
              <Icon name="info" size={17} />
              {notice}
              <button
                aria-label="Dismiss message"
                onClick={() => setNotice("")}
              >
                <Icon name="close" size={16} />
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
