import { useState } from "react";
import { DealFormModal } from "../components/DealFormModal";
import { updateDeal } from "../lib/api";
import { formatMoney } from "../lib/format";
import { STAGES, STAGE_LABELS, type Deal, type Stage } from "../lib/types";
import { useCrm } from "../lib/useCrm";

export function BoardPage() {
  const { deals, companies, loading, error, reload } = useCrm();
  const [editing, setEditing] = useState<Deal | null>(null);
  const [creating, setCreating] = useState(false);

  if (loading) return <p className="text-slate-500">Loading...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  const moveDeal = async (deal: Deal, stage: Stage) => {
    await updateDeal(deal.id, { stage });
    reload();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Pipeline board</h1>
        <button
          onClick={() => setCreating(true)}
          className="rounded-md bg-brand-500 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-600"
        >
          New deal
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {STAGES.map((stage) => {
          const stageDeals = deals.filter((d) => d.stage === stage);
          const total = stageDeals.reduce((s, d) => s + d.value_cents, 0);
          return (
            <div key={stage} className="rounded-lg bg-slate-100 p-2">
              <div className="flex items-center justify-between px-1 py-1">
                <span className="text-sm font-semibold text-slate-700">
                  {STAGE_LABELS[stage]}
                </span>
                <span className="text-xs text-slate-500">{stageDeals.length}</span>
              </div>
              <p className="px-1 text-xs text-slate-500">{formatMoney(total)}</p>

              <div className="mt-2 space-y-2">
                {stageDeals.map((deal) => (
                  <div
                    key={deal.id}
                    onClick={() => setEditing(deal)}
                    className="cursor-pointer rounded-md border border-slate-200 bg-white p-3 shadow-sm hover:border-brand-300"
                  >
                    <p className="text-sm font-medium text-slate-900">{deal.title}</p>
                    <p className="text-xs text-slate-500">
                      {deal.company?.name ?? "Unassigned"}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-700">
                        {formatMoney(deal.value_cents)}
                      </span>
                      <select
                        value={deal.stage}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => moveDeal(deal, e.target.value as Stage)}
                        className="rounded border border-slate-200 bg-white px-1 py-0.5 text-xs text-slate-600"
                      >
                        {STAGES.map((s) => (
                          <option key={s} value={s}>
                            {STAGE_LABELS[s]}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
                {stageDeals.length === 0 && (
                  <p className="px-1 py-2 text-xs text-slate-400">No deals</p>
                )}
              </div>
            </div>
          );
        })}
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
