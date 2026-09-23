import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PngShirtPreview from "./PngShirtPreview.jsx";
import Icon from "./Icon.jsx";
import Modal from "./Modal.jsx";
import PartHighlight from "./PartHighlight.jsx";
import {loadReviews, saveReview, reviewKey, emptyReview, teamReviewSummary} from "./lib/reviews.js";
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
  downloadBlob,
} from "./lib/catalog.js";
import {EXPORT_SIZES, renderPng, exportFilename, zipFiles} from "./lib/export.js";

/** Team review badge in the list: ✓ both shirts approved, ! a shirt denied, plus average stars. */
function TeamBadge({ summary }) {
  if (!summary) return null;
  return (
    <span className={`team-badge ${summary.status}`} title={summary.label} aria-label={summary.label}>
      {summary.status === "approved" && <span className="team-badge-mark">✓</span>}
      {summary.status === "denied" && <span className="team-badge-mark">!</span>}
      {summary.rating !== null && <span>★ {summary.rating}</span>}
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
    [reviews, setReviews] = useState({}),
    [denyOpen, setDenyOpen] = useState(false),
    [denyNote, setDenyNote] = useState(""),
    [queueOpen, setQueueOpen] = useState(false),
    [exportSize, setExportSize] = useState(2048),
    [exporting, setExporting] = useState(""),
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
    loadReviews().then(setReviews, () => {});
  }, []);
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
  const review = active ? reviews[reviewKey(active)] || emptyReview(active) : null;
  function updateReview(change) {
    try {
      setReviews((all) => saveReview(all, reviewKey(active), {...review, ...change}));
      return true;
    } catch (e) {
      setNotice(e.message);
      return false;
    }
  }
  function openDeny() {
    setDenyNote(review?.status === "denied" ? review.notes : "");
    setDenyOpen(true);
  }
  function deny() {
    if (updateReview({status: "denied", notes: denyNote.trim()})) setDenyOpen(false);
  }
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
        setDenyOpen(false);
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
      setQueueOpen(true);
      setNotice(candidate.name + " " + variant + " added to your collection.");
    } catch (e) {
      setNotice(e.message);
    }
  }
  /** The config a queued kit downloads with: its saved layout plus any saved color edits. */
  async function exportConfig(item) {
    const key = `${revisionKey(item)}:${item.png_layout_revision || "original"}`;
    let saved = cache.current.get(key);
    if (!saved) {
      const details = await json(item.details_path);
      saved = {config: kitPreviewConfig(details, item), equipment: equipmentForKit(details.equipment, item)};
      cache.current.set(key, saved);
    }
    const edits = savedEdits.current.get(key);
    return {config: edits ? applyEdits(saved.config, edits) : saved.config, custom: !!edits};
  }
  /** Render every queued kit at the chosen size; download them one by one or as one ZIP. */
  async function downloadQueue(asZip) {
    if (!selection.length || exporting) return;
    const files = [];
    try {
      for (const [i, item] of selection.entries()) {
        setExporting(`Preparing ${i + 1} / ${selection.length}…`);
        const {config, custom} = await exportConfig(item);
        files.push({name: exportFilename(item, exportSize, custom), blob: await renderPng(config, exportSize)});
      }
      if (asZip) {
        setExporting("Zipping…");
        downloadBlob(await zipFiles(files), `tshirt-kits-${files.length}-${exportSize}px.zip`);
      } else {
        // Space the downloads out so the browser accepts each file.
        for (const f of files) {
          downloadBlob(f.blob, f.name);
          await new Promise((r) => setTimeout(r, 250));
        }
      }
      setNotice(`${files.length} kit${files.length > 1 ? "s" : ""} downloaded at ${exportSize} px.`);
    } catch (e) {
      setNotice(e.message || "The download could not be prepared.");
    } finally {
      setExporting("");
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
    setDenyOpen(false);
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
                    <TeamBadge summary={teamReviewSummary(t, reviews)} />
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
                  <small className="eyebrow">SELECTED TEAM</small>
                  <h3>{candidate?.name || "Choose a team"}</h3>
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
                <div className="review-approve">
                  <label className={`approve-check ${review?.status === "approved" ? "approved" : ""}`}>
                    <input
                      type="checkbox"
                      checked={review?.status === "approved"}
                      disabled={!review || review.status === "approved"}
                      onChange={() => updateReview({status: "approved"})}
                    />
                    {review?.status === "approved" ? `Approved${review.sample ? " (sample)" : ""}` : "Approve"}
                  </label>
                  <button
                    className={`secondary deny-button ${review?.status === "denied" ? "denied" : ""}`}
                    disabled={!review}
                    onClick={openDeny}
                  >
                    {review?.status === "denied" ? "Denied" : "Deny"}
                  </button>
                </div>
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
                <div className="stars" role="radiogroup" aria-label="Rating">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      role="radio"
                      aria-checked={review?.rating === n}
                      aria-label={`${n} star${n > 1 ? "s" : ""}`}
                      className={n <= (review?.rating || 0) ? "on" : ""}
                      disabled={!review}
                      onClick={() => updateReview({rating: n})}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              {denyOpen && review && (
                <div className="deny-form">
                  <label>
                    What needs to change on this shirt?
                    <textarea
                      value={denyNote}
                      maxLength={2000}
                      rows={3}
                      placeholder="e.g. shoulder stripes too thin, collar should be navy…"
                      onChange={(e) => setDenyNote(e.target.value)}
                      autoFocus
                    />
                  </label>
                  <div className="deny-actions">
                    <button className="secondary" onClick={() => setDenyOpen(false)}>Cancel</button>
                    <button className="primary" disabled={!denyNote.trim()} onClick={deny}>Save denial</button>
                  </div>
                </div>
              )}
              {!denyOpen && review?.status === "denied" && (
                <p className="deny-note">
                  <strong>Needs changes{review.sample ? " (sample)" : ""}:</strong> {review.notes}
                </p>
              )}
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
            <aside className="details-panel">
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
        <section className={`queue ${queueOpen ? "open" : ""}`} aria-label="Collection">
          <button className="queue-head" aria-expanded={queueOpen} onClick={() => setQueueOpen((o) => !o)}>
            <Icon name="layers" size={16} />
            <span>Collection</span>
            <span className="count-pill">{selection.length}/10</span>
            <Icon name={queueOpen ? "down" : "up"} size={15} />
          </button>
          {queueOpen && (
            <div className="queue-body">
              {selection.length ? (
                <div className="collection-list">
                  {selection.map((item, i) => (
                    <div
                      className={`collection-item ${selectedIndex === i ? "current" : ""}`}
                      key={revisionKey(item)}
                    >
                      <button onClick={() => activate(item)} disabled={busy}>
                        <Icon name="shirt" size={22} />
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
                <p className="queue-empty">Use “Add to collection” to queue up to 10 kits for download.</p>
              )}
              <div className="queue-actions">
                <select
                  aria-label="Download size"
                  value={exportSize}
                  onChange={(e) => setExportSize(Number(e.target.value))}
                  disabled={!!exporting}
                >
                  {EXPORT_SIZES.map((size) => (
                    <option key={size} value={size}>{size} px · PNG</option>
                  ))}
                </select>
                <button className="secondary" disabled={!selection.length || !!exporting} onClick={() => downloadQueue(false)}>
                  <Icon name="download" size={15} />
                  Download
                </button>
                <button className="primary" disabled={!selection.length || !!exporting} onClick={() => downloadQueue(true)}>
                  ZIP
                </button>
              </div>
              {exporting && <p className="queue-progress" aria-live="polite">{exporting}</p>}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
