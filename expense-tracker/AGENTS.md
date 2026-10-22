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

- All backend HTTP lives in src/services/api.ts; demo mode (no VITE_API_BASE_URL) uses a localStorage store there, never mixed with backend data — keeps integration a one-file change.
- Expense calculations live in src/lib/expenses/analytics.ts as pure functions with tests — UI components only render their results.
