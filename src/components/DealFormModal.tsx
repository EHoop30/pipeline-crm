import { useEffect, useState, type FormEvent } from "react";
import {
  addActivity,
  createCompany,
  createDeal,
  deleteDeal,
  listActivities,
  updateDeal,
} from "../lib/api";
import { formatDateTime } from "../lib/format";
import {
  ACTIVITY_KINDS,
  STAGES,
  STAGE_LABELS,
  type ActivityKind,
  type Activity,
  type Company,
  type Deal,
  type Stage,
} from "../lib/types";
import { Modal } from "./Modal";

interface Props {
  open: boolean;
  deal: Deal | null; // null = create mode
  companies: Company[];
  onClose: () => void;
  onSaved: () => void;
}

export function DealFormModal({ open, deal, companies, onClose, onSaved }: Props) {
  const editing = deal !== null;

  const [title, setTitle] = useState("");
  const [companyId, setCompanyId] = useState<string>("");
  const [valueDollars, setValueDollars] = useState("");
  const [stage, setStage] = useState<Stage>("lead");
  const [expectedClose, setExpectedClose] = useState("");
  const [notes, setNotes] = useState("");

  const [localCompanies, setLocalCompanies] = useState<Company[]>(companies);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activityKind, setActivityKind] = useState<ActivityKind>("note");
  const [activityBody, setActivityBody] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLocalCompanies(companies);
  }, [companies]);

  useEffect(() => {
    if (!open) return;
    setError(null);
    if (deal) {
      setTitle(deal.title);
      setCompanyId(deal.company_id ?? "");
      setValueDollars((deal.value_cents / 100).toString());
      setStage(deal.stage);
      setExpectedClose(deal.expected_close ?? "");
      setNotes(deal.notes ?? "");
      listActivities(deal.id).then(setActivities).catch(() => setActivities([]));
    } else {
      setTitle("");
      setCompanyId("");
      setValueDollars("");
      setStage("lead");
      setExpectedClose("");
      setNotes("");
      setActivities([]);
    }
  }, [open, deal]);

  const addCompany = async () => {
    const name = window.prompt("New company name");
    if (!name?.trim()) return;
    try {
      const company = await createCompany(name.trim());
      setLocalCompanies((prev) =>
        [...prev, company].sort((a, b) => a.name.localeCompare(b.name)),
      );
      setCompanyId(company.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add company.");
    }
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const input = {
      title: title.trim(),
      company_id: companyId || null,
      value_cents: Math.round((parseFloat(valueDollars) || 0) * 100),
      stage,
      expected_close: expectedClose || null,
      notes: notes.trim() || null,
    };
    try {
      if (deal) {
        await updateDeal(deal.id, input);
      } else {
        await createDeal(input);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the deal.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!deal) return;
    if (!window.confirm("Delete this deal? This cannot be undone.")) return;
    setBusy(true);
    try {
      await deleteDeal(deal.id);
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete the deal.");
    } finally {
      setBusy(false);
    }
  };

  const submitActivity = async (e: FormEvent) => {
    e.preventDefault();
    if (!deal || !activityBody.trim()) return;
    try {
      const created = await addActivity(deal.id, activityKind, activityBody.trim());
      setActivities((prev) => [created, ...prev]);
      setActivityBody("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add activity.");
    }
  };

  const inputClass =
    "mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500";

  return (
    <Modal open={open} onClose={onClose} title={editing ? "Edit deal" : "New deal"}>
      <form onSubmit={save} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-slate-700">Title</label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Company</label>
          <div className="flex gap-2">
            <select
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              className={inputClass}
            >
              <option value="">Unassigned</option>
              {localCompanies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={addCompany}
              className="mt-1 whitespace-nowrap rounded-md border border-slate-300 px-3 text-sm text-slate-700 hover:bg-slate-50"
            >
              + New
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700">Value (USD)</label>
            <input
              type="number"
              min="0"
              step="1"
              value={valueDollars}
              onChange={(e) => setValueDollars(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Stage</label>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value as Stage)}
              className={inputClass}
            >
              {STAGES.map((s) => (
                <option key={s} value={s}>
                  {STAGE_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Expected close
          </label>
          <input
            type="date"
            value={expectedClose}
            onChange={(e) => setExpectedClose(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Notes</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={inputClass}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex items-center justify-between pt-1">
          {editing ? (
            <button
              type="button"
              onClick={remove}
              disabled={busy}
              className="text-sm font-medium text-red-600 hover:underline"
            >
              Delete
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="rounded-md bg-brand-500 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60"
            >
              {busy ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </form>

      {editing && (
        <div className="mt-6 border-t border-slate-200 pt-4">
          <h3 className="text-sm font-semibold text-slate-800">Activity</h3>
          <form onSubmit={submitActivity} className="mt-2 flex gap-2">
            <select
              value={activityKind}
              onChange={(e) => setActivityKind(e.target.value as ActivityKind)}
              className="rounded-md border border-slate-300 px-2 py-2 text-sm"
            >
              {ACTIVITY_KINDS.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
            <input
              value={activityBody}
              onChange={(e) => setActivityBody(e.target.value)}
              placeholder="Log a call, email, or note..."
              className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="rounded-md border border-slate-300 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Add
            </button>
          </form>

          <ul className="mt-3 space-y-2">
            {activities.map((a) => (
              <li key={a.id} className="rounded-md bg-slate-50 px-3 py-2 text-sm">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-medium uppercase text-slate-500">{a.kind}</span>
                  <span>{formatDateTime(a.created_at)}</span>
                </div>
                <p className="mt-1 text-slate-700">{a.body}</p>
              </li>
            ))}
            {activities.length === 0 && (
              <li className="text-sm text-slate-400">No activity logged yet.</li>
            )}
          </ul>
        </div>
      )}
    </Modal>
  );
}
