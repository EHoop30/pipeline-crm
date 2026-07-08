import { useCallback, useEffect, useState } from "react";
import { listCompanies, listDeals } from "./api";
import type { Company, Deal } from "./types";

export function useCrm() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setError(null);
    try {
      const [d, c] = await Promise.all([listDeals(), listCompanies()]);
      setDeals(d);
      setCompanies(c);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { deals, companies, loading, error, reload };
}
