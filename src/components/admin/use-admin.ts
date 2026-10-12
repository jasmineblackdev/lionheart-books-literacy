import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { loadAdminData, setAdminStatus, type AdminData } from "@/lib/admin-api";

// Shared by every /admin page: one cached load of the dashboard data.
export function useAdminData() {
  return useQuery({ queryKey: ["admin"], queryFn: loadAdminData, retry: false });
}

/** The loaded data with safe defaults (sales/clicks may be missing from an older admin function). */
export function withDefaults(d: AdminData): AdminData {
  return { ...d, sales: d.sales ?? [], clicks: d.clicks ?? { recent: [], totals: {} } };
}

export function useSetStatus() {
  const qc = useQueryClient();
  const [saving, setSaving] = useState<string | null>(null);
  async function setStatus(kind: "suggestion" | "class_set", id: string, status: string) {
    setSaving(id);
    try {
      await setAdminStatus(kind, id, status);
      await qc.invalidateQueries({ queryKey: ["admin"] });
    } catch {
      alert("Couldn't update the status. Please try again.");
    } finally {
      setSaving(null);
    }
  }
  return { saving, setStatus };
}
