import { createFileRoute } from "@tanstack/react-router";
import { Suggestions } from "@/components/admin/panels";
import { PageTitle } from "@/components/admin/shell";
import { useAdminData, useSetStatus } from "@/components/admin/use-admin";

export const Route = createFileRoute("/admin/suggestions")({ component: SuggestionsPage });

function SuggestionsPage() {
  const q = useAdminData();
  const { saving, setStatus } = useSetStatus();
  if (!q.data) return null;
  return (
    <>
      <PageTitle title="Book suggestions" subtitle="Ideas from readers, parents and teachers" />
      <Suggestions rows={q.data.suggestions} saving={saving} onStatus={(id, s) => setStatus("suggestion", id, s)} />
    </>
  );
}
