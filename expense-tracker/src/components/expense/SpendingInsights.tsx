import { AlertTriangle, ArrowDownRight, ArrowUpRight, Lightbulb } from "lucide-react";
import { useExpenses } from "@/hooks/useExpenses";
import {
  average, categoryTotals, detectAnomalies, highestCategory, highestExpense, lowestCategory, periodComparison, recommendations,
} from "@/lib/expenses/analytics";
import { CATEGORY_META } from "@/lib/expenses/categories";
import { formatDate, formatINR, pct } from "@/lib/expenses/format";
import { Card, EmptyState } from "./States";

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg bg-muted/60 p-4">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="tabular mt-1 font-display text-lg font-semibold">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

export function SpendingInsights() {
  const { filtered, all, range } = useExpenses();
  if (!filtered.length) return <Card title="Spending insights"><EmptyState title="No expenses in this period" hint="Add expenses to see insights." /></Card>;
  const hi = highestCategory(filtered)!;
  const lo = lowestCategory(filtered)!;
  const big = highestExpense(filtered)!;
  const cmp = periodComparison(all, range);
  const cats = categoryTotals(filtered).filter((c) => c.total > 0);

  return (
    <Card title="Spending insights">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <Stat label="Highest category" value={hi.category} sub={`${formatINR(hi.total)} · ${pct(hi.percent)}`} />
        <Stat label="Lowest category" value={lo.category} sub={`${formatINR(lo.total)} · ${pct(lo.percent)}`} />
        <Stat label="Largest expense" value={formatINR(big.amount)} sub={`${big.remarks} · ${formatDate(big.date)}`} />
        <Stat label="Average per transaction" value={formatINR(Math.round(average(filtered)))} sub={`${filtered.length} transactions`} />
        <div className="rounded-lg bg-muted/60 p-4 sm:col-span-2">
          <div className="text-xs font-medium text-muted-foreground">Vs previous equivalent period</div>
          {!cmp ? <p className="mt-1 text-sm">Pick a bounded date range (e.g. This Month) to compare periods.</p>
            : cmp.change === null ? <p className="mt-1 text-sm">No expenses recorded in the previous period, so no comparison is shown.</p>
            : (
              <div className={`mt-1 flex items-center gap-2 font-display text-lg font-semibold ${cmp.change > 0 ? "text-destructive" : "text-success"}`}>
                {cmp.change > 0 ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
                {pct(Math.abs(cmp.change))} {cmp.change > 0 ? "increase" : "decrease"}
                <span className="text-xs font-normal text-muted-foreground">({formatINR(cmp.previous)} → {formatINR(cmp.current)})</span>
              </div>
            )}
        </div>
      </div>
      <div className="mt-5">
        <div className="mb-2 text-xs font-medium text-muted-foreground">Contribution by category</div>
        <div className="flex h-3 overflow-hidden rounded-full bg-muted">
          {cats.map((c) => <div key={c.category} title={`${c.category} ${pct(c.percent)}`} style={{ width: `${c.percent}%`, background: CATEGORY_META[c.category].color }} />)}
        </div>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
          {cats.map((c) => (
            <span key={c.category} className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ background: CATEGORY_META[c.category].color }} />
              {c.category} <span className="tabular text-muted-foreground">{pct(c.percent)}</span>
            </span>
          ))}
        </div>
      </div>
    </Card>
  );
}

export function UnusualSpending() {
  const { filtered } = useExpenses();
  const { items, threshold } = detectAnomalies(filtered);
  return (
    <Card title="Potential unusual expenses">
      {threshold === null ? (
        <p className="text-sm text-muted-foreground">At least 5 transactions are needed to detect unusual spending.</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nothing stands out — all expenses are within your typical range (below {formatINR(Math.round(threshold))}).</p>
      ) : (
        <>
          <ul className="space-y-2">
            {items.map((e) => (
              <li key={e.id} className="flex items-center gap-3 rounded-lg bg-warning-soft p-3 text-sm">
                <AlertTriangle className="h-4 w-4 shrink-0 text-warning" />
                <span className="flex-1"><span className="font-medium">{e.remarks}</span> <span className="text-muted-foreground">· {e.category} · {formatDate(e.date)}</span></span>
                <span className="tabular font-semibold">{formatINR(e.amount)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">
            Flagged when an expense exceeds {formatINR(Math.round(threshold))} (the higher of 2.5× your median or mean + 1.5 standard deviations). These are potential anomalies, not confirmed problems.
          </p>
        </>
      )}
    </Card>
  );
}

export function Recommendations() {
  const { filtered, all, range } = useExpenses();
  const recs = recommendations(filtered, all, range);
  return (
    <Card title="Recommendations">
      {recs.length === 0 ? (
        <p className="text-sm text-muted-foreground">More expense records are needed (at least 3 in this period) to generate reliable recommendations.</p>
      ) : (
        <ul className="space-y-2">
          {recs.map((r) => (
            <li key={r} className="flex gap-3 rounded-lg bg-primary-soft p-3 text-sm">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {r}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
