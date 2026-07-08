export type Stage = "lead" | "qualified" | "proposal" | "won" | "lost";

export const STAGES: Stage[] = ["lead", "qualified", "proposal", "won", "lost"];

export const STAGE_LABELS: Record<Stage, string> = {
  lead: "Lead",
  qualified: "Qualified",
  proposal: "Proposal",
  won: "Won",
  lost: "Lost",
};

// Rough win probability per stage, used for weighted pipeline on the dashboard.
export const STAGE_PROBABILITY: Record<Stage, number> = {
  lead: 0.1,
  qualified: 0.3,
  proposal: 0.6,
  won: 1,
  lost: 0,
};

export type ActivityKind = "note" | "call" | "email" | "meeting";
export const ACTIVITY_KINDS: ActivityKind[] = ["note", "call", "email", "meeting"];

export interface Company {
  id: string;
  name: string;
  industry: string | null;
  website: string | null;
  created_at: string;
}

export interface Deal {
  id: string;
  company_id: string | null;
  title: string;
  value_cents: number;
  stage: Stage;
  owner_id: string | null;
  expected_close: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  company?: { id: string; name: string } | null;
}

export interface Activity {
  id: string;
  deal_id: string;
  kind: ActivityKind;
  body: string;
  created_at: string;
}

export interface DealInput {
  title: string;
  company_id: string | null;
  value_cents: number;
  stage: Stage;
  expected_close: string | null;
  notes: string | null;
}
