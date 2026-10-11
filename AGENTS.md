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
- The class-set form uses a mailto handoff (owner chose to keep it); book suggestions are stored in Lovable Cloud via server functions only.
- Suggestion tables have RLS on with no public policies; all reads/writes go through server functions using the admin client after validation, so visitors can never read submissions.
- The admin review page authorizes by Lovable workspace identity userId found in the site_admins table; never by name or email.
- Use real cover/interior artwork from the uploaded PDFs only; never generated substitutes for product art.
- Book images and sample PDFs are real files in src/assets imported through Vite (not CDN pointers), so the site also works when hosted outside Lovable (e.g. Vercel).
