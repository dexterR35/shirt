import Icon from "./Icon.jsx";
import { downloadStats, formatDownloads } from "./lib/download-stats.js";

/**
 * Popularity display for a ready kit: a 1–5 star tier, the download count and an
 * up/down trend arrow. Numbers are a placeholder until a shared counter exists
 * (see lib/download-stats.js) — distinct from the review stars used elsewhere,
 * which grade kit correctness, not popularity.
 * @param {{item: object|null, compact?: boolean}} props
 */
export default function DownloadStats({ item, compact = false }) {
  if (!item) return <span className="dl-stats dl-stats-empty">—</span>;
  const { count, tier, trend, trendPct } = downloadStats(item);
  const trendLabel = trend === "flat" ? "steady" : `${trendPct > 0 ? "+" : ""}${trendPct}%`;
  return (
    <span
      className={`dl-stats ${compact ? "compact" : ""}`}
      title={`${count.toLocaleString()} downloads · ${trendLabel} vs last week`}
    >
      <span className="dl-stats-stars" aria-hidden="true">{"★".repeat(tier)}</span>
      <span className="dl-stats-count">{formatDownloads(count)}</span>
      {trend !== "flat" && (
        <Icon name={trend === "up" ? "up" : "down"} size={11} className={`dl-stats-trend ${trend}`} />
      )}
    </span>
  );
}
