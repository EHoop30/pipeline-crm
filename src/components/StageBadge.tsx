import { STAGE_LABELS, type Stage } from "../lib/types";

const styles: Record<Stage, string> = {
  lead: "bg-slate-100 text-slate-700",
  qualified: "bg-blue-100 text-blue-700",
  proposal: "bg-amber-100 text-amber-800",
  won: "bg-green-100 text-green-700",
  lost: "bg-red-100 text-red-700",
};

export function StageBadge({ stage }: { stage: Stage }) {
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${styles[stage]}`}
    >
      {STAGE_LABELS[stage]}
    </span>
  );
}
