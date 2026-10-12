import { createFileRoute } from "@tanstack/react-router";
import { Inquiries } from "@/components/admin/panels";
import { PageTitle } from "@/components/admin/shell";
import { useAdminData, useSetStatus } from "@/components/admin/use-admin";

export const Route = createFileRoute("/admin/school-orders")({ component: SchoolOrdersPage });

function SchoolOrdersPage() {
  const q = useAdminData();
  const { saving, setStatus } = useSetStatus();
  if (!q.data) return null;
  return (
    <>
      <PageTitle title="School orders" subtitle="Class-set inquiries from teachers and schools" />
      <Inquiries rows={q.data.inquiries} saving={saving} onStatus={(id, s) => setStatus("class_set", id, s)} />
    </>
  );
}
