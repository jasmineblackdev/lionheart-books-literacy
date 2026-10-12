<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules
- All book data (titles, ages, Amazon links, previews, sample PDFs) lives in src/lib/site.ts; pages read from it so links stay consistent everywhere.
- Purchase prices, destinations, and availability live in the central book data and render through shared purchase controls so cards and detail pages remain consistent.
- The class-set form emails the owner directly via a server function using Resend (RESEND_API_KEY secret); book suggestions are stored in the site's Supabase database via server functions only, and each new one is also emailed to the owner via the same Resend helper (src/lib/email.server.ts).
- The database is the owner's own Supabase project `gbvsskqxsphkjxjbwbjm` (moved off Lovable Cloud on 2026-10-12). Vercel's VITE_SUPABASE_* / SUPABASE_* env vars point the site at it and override the committed .env, which still names the old Lovable Cloud project for the Lovable editor; supabase/config.toml's project_id is also Lovable's, so always pass `--project-ref`.
- All tables have RLS on with no public policies, so visitors can never read submissions. The site's server code has no database service key: public form writes go from server functions (after validation) to the `forms` edge function, authenticated by the shared FORMS_SECRET (set as a Supabase Edge Function secret and in Vercel).
- Deploy edge functions with `npm run deploy:functions` (runs `npm run test:edge` first). Pushing to GitHub does not deploy them, and asking Lovable would deploy to its old project. Schema changes: add the SQL to supabase/setup/ and have the owner run it in the Supabase SQL Editor (the CLI has no database password).
- `.github/workflows/keepalive.yml` pings the `ping` function daily so the free Supabase project is never paused for inactivity; keep `ping` doing its one database read.
- The /admin dashboard signs in with Supabase Auth (email + password, public sign-ups disabled) and is authorized only by the signed-in user's id being in the site_admins table, checked inside the `admin` edge function; never by name or email.
- Use real cover/interior artwork from the uploaded PDFs only; never generated substitutes for product art.
- Book images and sample PDFs are real files in src/assets imported through Vite (not CDN pointers), so the site also works when hosted outside Lovable (e.g. Vercel).
