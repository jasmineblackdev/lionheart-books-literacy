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
- The class-set form uses a mailto handoff, no backend; the brief forbids unnecessary databases.
- Use real cover/interior artwork from the uploaded PDFs only; never generated substitutes for product art.
