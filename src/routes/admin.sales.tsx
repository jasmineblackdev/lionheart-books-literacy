import { createFileRoute } from "@tanstack/react-router";
import { Sales } from "@/components/admin/panels";
import { PageTitle } from "@/components/admin/shell";
import { useAdminData, withDefaults } from "@/components/admin/use-admin";

export const Route = createFileRoute("/admin/sales")({ component: SalesPage });

function SalesPage() {
  const q = useAdminData();
  if (!q.data) return null;
  const { sales, clicks } = withDefaults(q.data);
  return (
    <>
      <PageTitle title="Sales" subtitle="Payhip digital sales, Amazon paperback sales and Buy on Amazon clicks" />
      <Sales sales={sales} clicks={clicks} />
    </>
  );
}
