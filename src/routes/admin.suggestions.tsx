import { createFileRoute, redirect } from "@tanstack/react-router";

// Old review page; suggestions now live on the /admin dashboard.
export const Route = createFileRoute("/admin/suggestions")({
  beforeLoad: () => {
    throw redirect({ to: "/admin" });
  },
});
