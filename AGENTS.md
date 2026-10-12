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
- The class-set form emails the owner directly via a server function using Resend (RESEND_API_KEY secret); book suggestions are stored in Lovable Cloud via server functions only, and each new one is also emailed to the owner via the same Resend helper (src/lib/email.server.ts).
- Suggestion and class-set tables have RLS on with no public policies, so visitors can never read submissions. The site runs on Vercel without a database service key: public form writes go from server functions (after validation) to the `forms` edge function in supabase/functions, authenticated by the shared FORMS_SECRET (set in Lovable Cloud and Vercel). Edge functions and migrations are deployed by asking Lovable; pushing alone does not deploy them.
- The /admin dashboard signs in with Lovable Cloud auth (email + password) and is authorized only by the signed-in user's id being in the site_admins table, checked inside the `admin` edge function; never by name or email.
- Use real cover/interior artwork from the uploaded PDFs only; never generated substitutes for product art.
- Book images and sample PDFs are real files in src/assets imported through Vite (not CDN pointers), so the site also works when hosted outside Lovable (e.g. Vercel).
