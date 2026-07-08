import { useMemo, useState } from "react";
import { DealFormModal } from "../components/DealFormModal";
import { StageBadge } from "../components/StageBadge";
import { dealsToCsv, downloadCsv } from "../lib/csv";
import { formatDate, formatMoney } from "../lib/format";
import { STAGES, STAGE_LABELS, type Deal, type Stage } from "../lib/types";
import { useCrm } from "../lib/useCrm";

type SortKey = "title" | "company" | "stage" | "value" | "expected_close" | "updated_at";

function sortValue(deal: Deal, key: SortKey): string | number {
  switch (key) {
    case "title":
      return deal.title.toLowerCase();
    case "company":
      return deal.company?.name.toLowerCase() ?? "";
    case "stage":
      return STAGES.indexOf(deal.stage);
    case "value":
      return deal.value_cents;
    case "expected_close":
      return deal.expected_close ?? "";
    case "updated_at":
      return deal.updated_at;
  }
}

export function DealsTablePage() {
  const { deals, companies, loading, error, reload } = useCrm();
  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<Stage | "all">("all");
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({
    key: "updated_at",
    dir: "desc",
  });
  const [editing, setEditing] = useState<Deal | null>(null);
  const [creating, setCreating] = useState(false);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = deals.filter((d) => {
      const matchesQuery =
        !q ||
        d.title.toLowerCase().includes(q) ||
        (d.company?.name.toLowerCase().includes(q) ?? false);
      const matchesStage = stageFilter === "all" || d.stage === stageFilter;
      return matchesQuery && matchesStage;
    });
    const sorted = [...filtered].sort((a, b) => {
      const av = sortValue(a, sort.key);
      const bv = sortValue(b, sort.key);
      if (av < bv) return sort.dir === "asc" ? -1 : 1;
      if (av > bv) return sort.dir === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [deals, query, stageFilter, sort]);

  const toggleSort = (key: SortKey) => {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" },
    );
  };

  const header = (label: string, key: SortKey, extra = "") => (
    <th
      onClick={() => toggleSort(key)}
      className={`cursor-pointer select-none px-3 py-2 text-left font-medium text-slate-500 hover:text-slate-700 ${extra}`}
    >
      {label}
      {sort.key === key && (sort.dir === "asc" ? " up" : " down")}
    </th>
  );

  if (loading) return <p className="text-slate-500">Loading...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-slate-900">Deals</h1>
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title or company"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value as Stage | "all")}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="all">All stages</option>
            {STAGES.map((s) => (
              <option key={s} value={s}>
                {STAGE_LABELS[s]}
              </option>
            ))}
          </select>
          <button
            onClick={() => downloadCsv("deals.csv", dealsToCsv(rows))}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Export CSV
          </button>
          <button
            onClick={() => setCreating(true)}
            className="rounded-md bg-brand-500 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-600"
          >
            New deal
          </button>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide">
            <tr>
              {header("Title", "title")}
              {header("Company", "company")}
              {header("Stage", "stage")}
              {header("Value", "value", "text-right")}
              {header("Close", "expected_close")}
              {header("Updated", "updated_at")}
            </tr>
          </thead>
          <tbody>
            {rows.map((deal) => (
              <tr
                key={deal.id}
                onClick={() => setEditing(deal)}
                className="cursor-pointer border-b border-slate-100 last:border-0 hover:bg-slate-50"
              >
                <td className="px-3 py-2 font-medium text-slate-800">{deal.title}</td>
                <td className="px-3 py-2 text-slate-600">
                  {deal.company?.name ?? "Unassigned"}
                </td>
                <td className="px-3 py-2">
                  <StageBadge stage={deal.stage} />
                </td>
                <td className="px-3 py-2 text-right font-semibold text-slate-700">
                  {formatMoney(deal.value_cents)}
                </td>
                <td className="px-3 py-2 text-slate-600">
                  {formatDate(deal.expected_close)}
                </td>
                <td className="px-3 py-2 text-slate-500">
                  {formatDate(deal.updated_at)}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-slate-400">
                  No deals match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <DealFormModal
        open={creating || editing !== null}
        deal={editing}
        companies={companies}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        onSaved={reload}
      />
    </div>
  );
}
