import { Link } from "react-router";
import Icon from "./Icon.jsx";

/**
 * Shared page header: breadcrumb, title, then the season line.
 * Crumbs with `to` are links; the last crumb is the current page.
 * @param {{crumbs:{label:string,to?:string}[], title:string, counts?:{teams:number,countries:number}}} props
 */
export default function PageHeader({ crumbs, title, counts }) {
  return (
    <div className="page-heading">
      <div>
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <ol>
            {crumbs.map((c, i) => {
              const last = i === crumbs.length - 1;
              return (
                <li key={`${i}-${c.label}`}>
                  {last || !c.to ? (
                    <span aria-current={last ? "page" : undefined}>{c.label}</span>
                  ) : (
                    <Link to={c.to}>{c.label}</Link>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
        <h1>{title}</h1>
        <div className="season-label">
          <span className="live-dot" />
          2026 / 27 COLLECTION
        </div>
      </div>
      {counts && (
        <div className="catalog-summary">
          <Icon name="globe" />
          <span>
            <strong>{counts.teams}</strong> teams
            <span className="summary-divider">/</span>
            <strong>{counts.countries}</strong> countries
          </span>
        </div>
      )}
    </div>
  );
}
