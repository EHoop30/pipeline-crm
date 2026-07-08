import { formatMoney } from "../lib/format";
import {
  STAGES,
  STAGE_LABELS,
  STAGE_PROBABILITY,
  type Deal,
  type Stage,
} from "../lib/types";
import { useCrm } from "../lib/useCrm";

function isOpen(d: Deal): boolean {
  return d.stage !== "won" && d.stage !== "lost";
}

function wonThisMonth(d: Deal): boolean {
  if (d.stage !== "won") return false;
  const closed = new Date(d.updated_at);
  const now = new Date();
  return (
    closed.getFullYear() === now.getFullYear() &&
    closed.getMonth() === now.getMonth()
  );
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

export function DashboardPage() {
  const { deals, loading, error } = useCrm();

  if (loading) return <p className="text-slate-500">Loading...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  const openDeals = deals.filter(isOpen);
  const openValue = openDeals.reduce((sum, d) => sum + d.value_cents, 0);
  const weighted = deals.reduce(
    (sum, d) => sum + d.value_cents * STAGE_PROBABILITY[d.stage],
    0,
  );
  const wonValue = deals
    .filter(wonThisMonth)
    .reduce((sum, d) => sum + d.value_cents, 0);

  const byStage: Record<Stage, { count: number; value: number }> = {
    lead: { count: 0, value: 0 },
    qualified: { count: 0, value: 0 },
    proposal: { count: 0, value: 0 },
    won: { count: 0, value: 0 },
    lost: { count: 0, value: 0 },
  };
  for (const d of deals) {
    byStage[d.stage].count += 1;
    byStage[d.stage].value += d.value_cents;
  }
  const maxStageValue = Math.max(1, ...STAGES.map((s) => byStage[s].value));

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>

      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Open pipeline" value={formatMoney(openValue)} />
        <KpiCard label="Weighted pipeline" value={formatMoney(weighted)} />
        <KpiCard label="Won this month" value={formatMoney(wonValue)} />
        <KpiCard label="Open deals" value={openDeals.length.toString()} />
      </div>

      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-slate-800">Pipeline by stage</h2>
        <div className="mt-3 space-y-2">
          {STAGES.map((s) => (
            <div key={s} className="flex items-center gap-3 text-sm">
              <div className="w-20 text-slate-600">{STAGE_LABELS[s]}</div>
              <div className="h-4 flex-1 overflow-hidden rounded bg-slate-100">
                <div
                  className="h-full rounded bg-brand-500"
                  style={{
                    width: `${(byStage[s].value / maxStageValue) * 100}%`,
                  }}
                />
              </div>
              <div className="w-28 text-right text-slate-700">
                {formatMoney(byStage[s].value)}
              </div>
              <div className="w-10 text-right text-slate-400">
                {byStage[s].count}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
