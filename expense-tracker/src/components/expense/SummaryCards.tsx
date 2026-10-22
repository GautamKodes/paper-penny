import { Crown, Hash, IndianRupee, TrendingDown, TrendingUp, Calculator } from "lucide-react";
import { useExpenses } from "@/hooks/useExpenses";
import { average, highestCategory, periodComparison, total } from "@/lib/expenses/analytics";
import { CATEGORY_META } from "@/lib/expenses/categories";
import { formatINR, pct } from "@/lib/expenses/format";

export function SummaryCards() {
  const { filtered, all, range } = useExpenses();
  const top = highestCategory(filtered);
  const cmp = periodComparison(all, range);
  const TopIcon = top ? CATEGORY_META[top.category].icon : Crown;

  const cards = [
    {
      label: "Total Expenses", value: formatINR(total(filtered)), icon: IndianRupee,
      foot: cmp && cmp.change !== null ? (
        <span className={`inline-flex items-center gap-1 ${cmp.change > 0 ? "text-destructive" : "text-success"}`}>
          {cmp.change > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {pct(Math.abs(cmp.change))} vs previous period
        </span>
      ) : <span>{range.preset === "all" ? "Across all records" : "No prior data to compare"}</span>,
    },
    { label: "Transactions", value: filtered.length.toLocaleString("en-IN"), icon: Hash, foot: <span>Recorded in this period</span> },
    { label: "Average Expense", value: formatINR(Math.round(average(filtered))), icon: Calculator, foot: <span>Per transaction</span> },
    {
      label: "Top Category", value: top ? top.category : "—", icon: TopIcon,
      foot: <span>{top ? `${formatINR(top.total)} · ${pct(top.percent)}` : "No expenses yet"}</span>,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
      {cards.map(({ label, value, icon: Icon, foot }) => (
        <div key={label} className="surface p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">{label}</span>
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary-soft text-primary">
              <Icon className="h-4 w-4" />
            </span>
          </div>
          <div className="tabular mt-3 font-display text-2xl font-semibold">{value}</div>
          <div className="mt-1 text-xs text-muted-foreground">{foot}</div>
        </div>
      ))}
    </div>
  );
}
