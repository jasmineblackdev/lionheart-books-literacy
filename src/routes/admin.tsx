import { Outlet, createFileRoute } from "@tanstack/react-router";
import type { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { Msg, SignIn } from "@/components/admin/panels";
import { AdminShell } from "@/components/admin/shell";
import { useAdminData } from "@/components/admin/use-admin";
import { supabase } from "@/integrations/supabase/client";
import { AdminError } from "@/lib/admin-api";

// Layout for every /admin page: sign-in gate, admin check, then the Publisher Studio shell.
export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Publisher Studio | J. B. Lionheart" },
      { name: "description", content: "Private publisher dashboard." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  if (session === undefined) return <p className="p-10 text-center">Loading…</p>;
  if (!session) return <SignIn />;
  return <Authed email={session.user.email ?? ""} />;
}

function Authed({ email }: { email: string }) {
  const q = useAdminData();
  const signOut = () => void supabase.auth.signOut();

  if (q.isLoading) return <p className="p-10 text-center">Loading…</p>;
  if (q.error instanceof AdminError && q.error.code === "not_admin")
    return (
      <Msg title="Not authorized" onSignOut={signOut}>
        {email} isn't on the admin list. Account ID: <code className="break-all">{q.error.userId}</code>
      </Msg>
    );
  if (q.error instanceof AdminError && q.error.code === "signed_out")
    return <Msg title="Signed out" onSignOut={signOut}>Your session ended. Please sign in again.</Msg>;
  if (q.isError || !q.data) return <Msg title="Couldn't load the dashboard" onSignOut={signOut}>Try refreshing the page.</Msg>;

  const isNew = (r: { status: string }) => r.status === "new";
  return (
    <AdminShell email={email} newInquiries={q.data.inquiries.filter(isNew).length} newSuggestions={q.data.suggestions.filter(isNew).length}>
      <Outlet />
    </AdminShell>
  );
}
