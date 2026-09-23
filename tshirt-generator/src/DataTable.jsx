import { useEffect } from "react";
import {
  createFilteredRowModel,
  createSortedRowModel,
  filterFn_includesString,
  globalFilteringFeature,
  columnFilteringFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_text,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";

/** Features every DataTable has: sorting, one search box across columns, row selection. */
export const dataTableFeatures = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric, text: sortFn_text },
  columnFilteringFeature,
  globalFilteringFeature,
  filteredRowModel: createFilteredRowModel(),
  filterFns: { includesString: filterFn_includesString },
  rowSelectionFeature,
});

/**
 * Reusable TanStack table: sortable headers, a search box, checkbox multi-select
 * (Shift-click selects a range) and an actions slot that receives the selected rows.
 * Keep `data` and `columns` stable (memoized) between renders.
 * @param {{data:any[], columns:any[], getRowId:(row:any)=>string, canSelect?:(row:any)=>boolean,
 *   searchPlaceholder?:string, emptyText?:string, resetKey?:string,
 *   actions?:(selected:any[], clear:()=>void)=>any, label:string}} props
 */
export default function DataTable({ data, columns, getRowId, canSelect, searchPlaceholder = "Search…", emptyText = "No rows.", resetKey, actions, label }) {
  const table = useTable({
    features: dataTableFeatures,
    data,
    columns,
    getRowId,
    enableRowSelection: canSelect ? (row) => canSelect(row.original) : true,
    globalFilterFn: "includesString",
  });
  // A new data set (e.g. another tab) starts with no selection and no search.
  useEffect(() => {
    table.resetRowSelection(true);
    table.resetGlobalFilter(true);
    table.resetSorting(true);
  }, [resetKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const rows = table.getRowModel().rows;
  const selected = table.getSelectedRowModel().rows.map((r) => r.original);
  const clear = () => table.resetRowSelection(true);
  return (
    <div className="data-table">
      <div className="data-table-bar">
        <input
          type="search"
          className="data-table-search"
          aria-label={`Search ${label}`}
          placeholder={searchPlaceholder}
          value={table.state.globalFilter ?? ""}
          onChange={(e) => table.setGlobalFilter(e.target.value)}
        />
        {actions?.(selected, clear)}
      </div>
      <div className="data-table-scroll">
        <table aria-label={label}>
          <thead>
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id}>
                {group.headers.map((header) => {
                  const sorted = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      aria-sort={sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : undefined}
                      style={header.column.columnDef.size ? { width: header.column.columnDef.size } : undefined}
                    >
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <button className="sort-button" onClick={header.column.getToggleSortingHandler()}>
                          <table.FlexRender header={header} />
                          <span className="sort-mark">{sorted === "asc" ? "▲" : sorted === "desc" ? "▼" : ""}</span>
                        </button>
                      ) : (
                        <table.FlexRender header={header} />
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className={`${row.getIsSelected() ? "selected" : ""} ${row.getCanSelect() ? "" : "unavailable"}`}>
                {row.getAllCells().map((cell) => (
                  <td key={cell.id}>
                    <table.FlexRender cell={cell} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <p className="data-table-empty">{emptyText}</p>}
      </div>
    </div>
  );
}

/** Checkbox column for DataTable: header selects all selectable rows, cells use the range-aware handler. */
export const selectColumn = {
  id: "select",
  size: 36,
  enableSorting: false,
  enableGlobalFilter: false,
  header: ({ table }) => (
    <input
      type="checkbox"
      aria-label="Select all"
      checked={table.getIsAllRowsSelected()}
      ref={(el) => el && (el.indeterminate = table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected())}
      onChange={table.getToggleAllRowsSelectedHandler()}
    />
  ),
  cell: ({ row }) => (
    <input
      type="checkbox"
      aria-label="Select row"
      checked={row.getIsSelected()}
      disabled={!row.getCanSelect()}
      onChange={row.getToggleSelectedHandler()}
    />
  ),
};
