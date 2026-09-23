import { useEffect, useMemo, useRef, useState } from "react";
import PngShirtPreview from "./PngShirtPreview.jsx";
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
    [customColors, setCustomColors] = useState(null),
    [selection, setSelection] = useState([]),
    [busy, setBusy] = useState(false),
    [notice, setNotice] = useState(""),
    [background, setBackground] = useState("grid"),
    [tab, setTab] = useState("studio");
  const request = useRef(0),
    controller = useRef(null),
    cache = useRef(new Map());
  useEffect(() => {
    let alive = true;
    json("/catalog/manifest.json")
      .then((data) => {
        if (alive) {
          setCatalog(data);
          setCandidateId(
            data.teams.find((t) => t.kits.home.status === "ready")?.id ||
              data.teams[0]?.id || "",
          );
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
          Number(Object.values(b.kits).some((k) => k.status === "ready")) -
          Number(Object.values(a.kits).some((k) => k.status === "ready")),
      ),
    [catalog, country, query],
  );
  const candidate = catalog?.teams.find((t) => t.id === candidateId),
    slot = candidate?.kits[variant];
  const previewConfig = useMemo(() => customColors
    ? {...(appliedConfig || neutralConfig()), colors: customColors}
    : appliedConfig, [appliedConfig, customColors]);
  const selectedIndex = active
    ? selection.findIndex((s) => revisionKey(s) === revisionKey(active))
    : -1;
  function choose(team) {
    setCandidateId(team.id);
    setVariant("home");
    setNotice("");
  }
  async function activate(item) {
    const sequence = ++request.current;
    controller.current?.abort();
    controller.current = new AbortController();
    setBusy(true);
    setNotice("");
    try {
      const key = `${revisionKey(item)}:${item.png_layout_revision || 'original'}`;
      let config = cache.current.get(key);
      if (!config) {
        const details = await json(item.details_path, controller.current.signal);
        config = kitPreviewConfig(details, item);
        cache.current.set(key, config);
      }
      if (request.current === sequence) {
        setActive(item);
        setAppliedConfig(config);
        setCustomColors(null);
      }
    } catch (e) {
      if (e.name !== "AbortError" && request.current === sequence)
        setNotice(e.message);
    } finally {
      if (request.current === sequence) setBusy(false);
    }
  }
  async function apply() {
    if (!candidate || slot?.status !== "ready") return;
    await activate({
      ...slot,
      team_id: candidate.id,
      team_name: candidate.name,
      country_name: candidate.country_name,
      variant,
    });
  }
  function add() {
    if (!candidate || slot?.status !== "ready") return;
    const item = {
      ...slot,
      team_id: candidate.id,
      team_name: candidate.name,
      country_name: candidate.country_name,
      variant,
    };
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
  const master = () => {
    request.current++;
    controller.current?.abort();
    setActive(null);
    setAppliedConfig(null);
    setCustomColors(null);
    setBusy(false);
  };
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
                <small>Discovery searches</small>
                <strong>{catalog.counts.discovery_searched}</strong>
                <p>Searches still require visual review</p>
              </article>
            </div>
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
                    onClick={() => choose(t)}
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
              <div className="candidate-panel">
                <div className="candidate-heading">
                  <div>
                    <small>SELECTED TEAM</small>
                    <h3>{candidate?.name || "Choose a team"}</h3>
                  </div>
                  <Icon name="shirt" size={22} />
                </div>
                <div className="variant-switch" aria-label="Kit variant">
                  {["home", "away"].map((v) => (
                    <button
                      key={v}
                      aria-pressed={variant === v}
                      onClick={() => setVariant(v)}
                      className={variant === v ? "active" : ""}
                    >
                      {v === "home" ? "Home" : "Away"}
                      {candidate?.kits[v].status === "ready" && (
                        <span className="ready-dot" />
                      )}
                    </button>
                  ))}
                </div>
                <div className="candidate-status">
                  <Status status={slot?.status} />
                  <span>{slot?.kit_season || "Season unverified"}</span>
                </div>
                {slot?.status !== "ready" && (
                  <p className="availability">
                    {slot?.reason || "The kit artwork is under review."}
                  </p>
                )}
                <button
                  className="primary apply"
                  onClick={apply}
                  disabled={busy || slot?.status !== "ready"}
                >
                  Apply kit
                  <Icon name="arrow" size={18} />
                </button>
                <button
                  className="secondary add-button"
                  onClick={add}
                  disabled={slot?.status !== "ready" || busy}
                >
                  <Icon name="plus" size={17} />
                  Add to collection
                </button>
              </div>
            </aside>
            <section className="preview-panel" aria-label="Shirt preview">
              <div className="preview-toolbar">
                <div>
                  <span className="step">02</span>
                  <h2>Kit preview</h2>
                </div>
                <span className="format-badge">
                  PNG BASE
                  <span />
                  TRANSPARENT
                </span>
              </div>
              <div className={`canvas ${background}`}>
                <div className="canvas-topline">
                  <span>
                    <span className="live-dot" />
                    {customColors ? "CUSTOM COLORS" : active ? "TEAM COLOR PREVIEW" : "ORIGINAL PNG"}
                  </span>
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
                <div className="shirt-stage" aria-busy={busy}>
                  <PngShirtPreview config={previewConfig} label={active ? `${active.team_name} ${active.variant} shirt` : "Original PNG shirt"}/>
                </div>
                <div className="canvas-caption">
                  <span className="caption-kicker">
                    {active
                      ? `${active.country_name} / ${active.kit_season}`
                      : "THE ORIGINAL SILHOUETTE"}
                  </span>
                  <h2>
                    {active
                      ? active.team_name
                      : "A familiar shape. A fresh canvas."}
                  </h2>
                  <p>
                    {active
                      ? `${active.variant === "home" ? "Home" : "Away"} · ${customColors ? "Custom colors" : "Adapted to your PNG base"}`
                      : "Original highlights, fabric folds, and transparent edges."}
                  </p>
                  {!active && (
                    <span className="neutral-note">
                      {customColors ? "Custom design · not a verified team kit" : "Original PNG · no team colors applied"}
                    </span>
                  )}
                </div>
                <span className="dimension-label">8000 × 5000 SOURCE · PNG</span>
              </div>
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
              <details className="color-studio">
                <summary>Try your own colors</summary>
                <p>Body color sits beneath any team pattern. Choose a blank shirt to start a new design.</p>
                <div className="color-fields">
                  {Object.entries({body:"Body",leftSleeve:"Left sleeve",rightSleeve:"Right sleeve",collar:"Collar",leftCuff:"Left cuff",rightCuff:"Right cuff"}).map(([key,label])=><label key={key}>{label}<input type="color" aria-label={`${label} color`} value={(customColors || appliedConfig?.colors || neutralConfig().colors)[key]} onChange={e=>setCustomColors({...((customColors || appliedConfig?.colors) || neutralConfig().colors),[key]:e.target.value})}/></label>)}
                </div>
                <button className="secondary" onClick={master}>Blank shirt</button>
                <button className="secondary" onClick={()=>setCustomColors(null)} disabled={!customColors}>Reset colors</button>
              </details>
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
              <p className="collection-intro">
                Keep your favorite kits together.
                <br />
                Compare Home and Away designs.
              </p>
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
                  <p>
                    Add a ready Home or Away kit
                    <br />
                    to start your collection.
                  </p>
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
              <div className="source-card">
                <span className="eyebrow">BUILT FROM THE ORIGINAL</span>
                <h3>
                  One shape.
                  <br />
                  Every team's identity.
                </h3>
                <p>
                  Your supplied shirt is the foundation. Kit colors and patterns
                  are researched independently, Home and Away.
                </p>
                <button onClick={master}>
                  View original master
                  <Icon name="arrow" size={15} />
                </button>
              </div>
              <details className="evidence">
                <summary>
                  <Icon name="info" size={16} />
                  Sources & verification
                </summary>
                <p>
                  {active
                    ? active.png_layout_revision
                      ? "Shoulder bands, collar and cuff colors have been checked against the saved references. Your PNG keeps its original round neckline and fabric folds. Other fabric patterns may still be approximate."
                      : "Colors and patterns come from the cited kit research. This preview adapts them to your PNG base and keeps its round collar; the adapted layout still needs review."
                    : "Your original 8000 × 5000 PNG supplies the fabric, stitching, shading and transparency. Colors and patterns are editable shapes combined with those original pixels."}
                </p>
                {active && <Evidence path={active.details_path} />}
                <p>
                  {catalog.counts.ready} of {catalog.counts.slots} kit layouts researched.
                </p>
                <p>Download sizes and formats will be added later.</p>
                <button onClick={() => setTab("coverage")}>
                  Explore coverage →
                </button>
              </details>
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
      <footer>
        <span>
          <span className="footer-mark">✳</span> Made for the colors we follow.
        </span>
        <span>
          {catalog.counts.ready} researched layouts
          <span className="footer-dot">·</span>735 teams in the source catalog
        </span>
      </footer>
    </div>
  );
}
function Evidence({ path }) {
  const [data, setData] = useState(null),
    [error, setError] = useState("");
  useEffect(() => {
    let alive = true;
    setData(null);
    setError("");
    json(path)
      .then((v) => alive && setData(v))
      .catch((e) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, [path]);
  return error ? (
    <p>{error}</p>
  ) : data ? (
    <>
      <ul>
        {(Array.isArray(data.references) ? data.references : []).map((r, i) => (
          <li key={i}>
            <a href={r.page_url} target="_blank" rel="noreferrer">
              {r.publisher} · {data.variant} ↗
            </a>
          </li>
        ))}
      </ul>
      <p>
        Reviewed by {data.visual_review?.reviewed_by} ·{" "}
        {data.visual_review?.reviewed_at?.slice(0, 10)}
      </p>
    </>
  ) : (
    <p>Loading source details…</p>
  );
}
