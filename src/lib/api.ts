import { supabase } from "./supabase";
import type { Activity, ActivityKind, Company, Deal, DealInput } from "./types";

const DEAL_SELECT = "*, company:companies(id, name)";

export async function listDeals(): Promise<Deal[]> {
  const { data, error } = await supabase
    .from("deals")
    .select(DEAL_SELECT)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Deal[];
}

export async function getDeal(id: string): Promise<Deal> {
  const { data, error } = await supabase
    .from("deals")
    .select(DEAL_SELECT)
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as Deal;
}

export async function createDeal(input: DealInput): Promise<Deal> {
  const { data: userData } = await supabase.auth.getUser();
  const owner_id = userData.user?.id ?? null;
  const { data, error } = await supabase
    .from("deals")
    .insert({ ...input, owner_id, created_by: owner_id })
    .select(DEAL_SELECT)
    .single();
  if (error) throw error;
  return data as Deal;
}

export async function updateDeal(
  id: string,
  patch: Partial<DealInput>,
): Promise<Deal> {
  const { data, error } = await supabase
    .from("deals")
    .update(patch)
    .eq("id", id)
    .select(DEAL_SELECT)
    .single();
  if (error) throw error;
  return data as Deal;
}

export async function deleteDeal(id: string): Promise<void> {
  const { error } = await supabase.from("deals").delete().eq("id", id);
  if (error) throw error;
}

export async function listCompanies(): Promise<Company[]> {
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .order("name");
  if (error) throw error;
  return (data ?? []) as Company[];
}

export async function createCompany(name: string): Promise<Company> {
  const { data: userData } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("companies")
    .insert({ name, created_by: userData.user?.id ?? null })
    .select("*")
    .single();
  if (error) throw error;
  return data as Company;
}

export async function listActivities(dealId: string): Promise<Activity[]> {
  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .eq("deal_id", dealId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Activity[];
}

export async function addActivity(
  dealId: string,
  kind: ActivityKind,
  body: string,
): Promise<Activity> {
  const { data: userData } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("activities")
    .insert({ deal_id: dealId, kind, body, created_by: userData.user?.id ?? null })
    .select("*")
    .single();
  if (error) throw error;
  return data as Activity;
}
