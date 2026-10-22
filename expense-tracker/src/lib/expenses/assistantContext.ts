import {
  average, categoryTotals, detectAnomalies, filterByRange, highestExpense, periodComparison, recommendations, total,
} from "./analytics";
import { formatINR, pct } from "./format";
import type { DateRange, Expense } from "./types";

/** Compact analytics summary sent to the backend AI as context. */
export function buildContext(all: Expense[], filtered: Expense[], range: DateRange) {
  return {
    range,
    totalExpenses: total(filtered),
    transactionCount: filtered.length,
    averageExpense: Math.round(average(filtered)),
    categories: categoryTotals(filtered).filter((c) => c.total > 0),
    highestExpense: highestExpense(filtered),
    monthComparison: periodComparison(all, { preset: "month" }),
    anomalies: detectAnomalies(filtered).items,
    recentExpenses: [...filtered].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 50),
  };
}

/** DEMO MODE ONLY: rule-based answers computed from real local analytics (not AI). */
export function demoAnswer(question: string, all: Expense[], filtered: Expense[], range: DateRange): string {
  const q = question.toLowerCase();
  if (!filtered.length) return "There are no expenses in the selected period yet. Add a few and ask again.";
  const cats = categoryTotals(filtered).filter((c) => c.total > 0);
  const top = cats[0]!;

  if (/unusual|anomal|odd|strange/.test(q)) {
    const { items, threshold } = detectAnomalies(filtered);
    if (threshold === null) return "I need at least 5 transactions to spot unusual expenses.";
    if (!items.length) return `Nothing unusual — every expense is below ${formatINR(Math.round(threshold))}.`;
    return `Potentially unusual expenses (above ${formatINR(Math.round(threshold))}):\n` +
      items.map((e) => `• ${e.remarks} — ${formatINR(e.amount)} (${e.category}, ${e.date})`).join("\n");
  }
  if (/compare|last month|previous/.test(q)) {
    const cmp = periodComparison(all, { preset: "month" });
    if (!cmp || cmp.change === null) return `This month so far: ${formatINR(cmp?.current ?? 0)}. There's no data for last month to compare against.`;
    return `This month so far: ${formatINR(cmp.current)} vs ${formatINR(cmp.previous)} in the same days of last month — a ${pct(Math.abs(cmp.change))} ${cmp.change >= 0 ? "increase" : "decrease"}.`;
  }
  if (/food/.test(q)) {
    const f = cats.find((c) => c.category === "Food");
    const base = f ? `Food is ${formatINR(f.total)} (${pct(f.percent)}) of spending across ${f.count} transactions.` : "You have no food expenses in this period.";
    return `${base}\nIdeas: plan weekly groceries, cook in batches, limit takeaway to set days, and set a food budget around 10–15% below your current level.`;
  }
  if (/summar|this month|overview/.test(q)) {
    const m = filterByRange(all, { preset: "month" });
    const mc = categoryTotals(m).filter((c) => c.total > 0);
    if (!m.length) return "No expenses recorded this month yet.";
    return `This month: ${formatINR(total(m))} across ${m.length} transactions (avg ${formatINR(Math.round(average(m)))}).\nTop categories: ${mc.slice(0, 3).map((c) => `${c.category} ${pct(c.percent)}`).join(", ")}.`;
  }
  if (/save|reduce|tips|ways/.test(q)) {
    const recs = recommendations(filtered, all, range);
    return [
      `1. Set a cap for ${top.category}, your largest category (${pct(top.percent)}).`,
      `2. Review recurring bills and subscriptions${cats.find((c) => c.category === "Bills") ? ` — Bills total ${formatINR(cats.find((c) => c.category === "Bills")!.total)}` : ""}.`,
      "3. Use a 24-hour rule before non-essential shopping.",
      ...(recs[0] ? [`\nNote: ${recs[0]}`] : []),
    ].join("\n");
  }
  return `You spend the most on ${top.category}: ${formatINR(top.total)} (${pct(top.percent)} of ${formatINR(total(filtered))}).` +
    (cats[1] ? ` Next is ${cats[1].category} at ${pct(cats[1].percent)}.` : "");
}
