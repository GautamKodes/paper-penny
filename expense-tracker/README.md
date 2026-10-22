# Expense Tracker – Expense Recording and Categorization

Frontend only. Runs in **Demo mode** (sample data kept in your browser) until a backend URL is set.

## Run locally
```bash
bun install        # or: npm install
bun run dev        # or: npm run dev   → http://localhost:8080
bunx vitest run    # calculation tests
```

## Connect the backend
Create `.env`:
```
VITE_API_BASE_URL=http://localhost:5000
VITE_CHAT_ENDPOINT=/api/chat   # optional
```
All URLs and HTTP details live in `src/services/api.ts`.

### To confirm with the backend developer (marked `CONFIRM` in api.ts)
| Purpose | Assumed | Payload / response |
|---|---|---|
| List | `GET /api/expenses` | array, or `{data:[...]}` / `{expenses:[...]}` |
| Create | `POST /api/expenses` | body `{amount, category, date, remarks}` → created expense |
| Update | `PUT /api/expenses/:id` | same body |
| Delete | `DELETE /api/expenses/:id` | 204 or JSON |
| AI chat | `POST /api/chat` | body `{message, history, context}` → `{reply: string}` |

- ID field: `id` (or `_id`, auto-mapped). Date format: `YYYY-MM-DD`. Errors: `{message}` or `{error}`.
- The AI provider key (Gemini/OpenAI) must stay on the backend.

## What works where
- **Demo mode:** add/edit/delete, filters, all charts, insights, anomalies, recommendations, and a *rule-based* assistant (clearly labeled, not AI).
- **Needs backend:** persistent shared storage and real AI answers.

## Structure
```
src/
  services/api.ts                 Only place for endpoints, HTTP, demo store
  hooks/useExpenses.tsx           Shared state: records, date range, CRUD, form dialog
  lib/expenses/
    types.ts                      4-property contract + categories
    analytics.ts                  Totals, category %, trends, period comparison, anomalies, recommendations
    validation.ts                 Form validation
    assistantContext.ts           Analytics context sent to AI + demo answers
    format.ts / categories.ts / mock.ts / seo.ts
  components/expense/
    AppShell, Sidebar, Topbar, DateRangeFilter, SummaryCards, ExpenseForm,
    ExpenseTable, Charts (Pie/Bar/Trend), SpendingInsights (+Unusual, Recommendations),
    AIChatPanel, States
  routes/  index (Overview), transactions, analytics, insights, settings
  test/analytics.test.ts
```
