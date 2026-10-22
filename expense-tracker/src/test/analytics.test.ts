import { describe, expect, it } from "vitest";
import { categoryTotals, detectAnomalies, periodComparison, trendSeries } from "@/lib/expenses/analytics";
import { validateExpense } from "@/lib/expenses/validation";
import type { Expense } from "@/lib/expenses/types";

const e = (id: string, amount: number, date: string, category: Expense["category"] = "Food"): Expense =>
  ({ id, amount, date, category, remarks: "x" });

describe("expense analytics", () => {
  it("monthly trend does not merge same day number across months", () => {
    const s = trendSeries([e("1", 100, "2026-01-05"), e("2", 50, "2026-02-05")], "monthly");
    expect(s.map((x) => x.total)).toEqual([100, 50]);
  });

  it("category percentages sum to the total", () => {
    const c = categoryTotals([e("1", 75, "2026-01-01"), e("2", 25, "2026-01-02", "Travel")]);
    expect(c[0]).toMatchObject({ category: "Food", percent: 75 });
  });

  it("no comparison change when previous period is empty", () => {
    const now = new Date(2026, 9, 15);
    const r = periodComparison([e("1", 100, "2026-10-10")], { preset: "month" }, now);
    expect(r?.change).toBeNull();
  });

  it("flags only clearly large expenses with 5+ records", () => {
    const list = [100, 120, 90, 110, 105, 5000].map((a, i) => e(String(i), a, "2026-01-01"));
    expect(detectAnomalies(list).items.map((x) => x.amount)).toEqual([5000]);
    expect(detectAnomalies(list.slice(0, 4)).threshold).toBeNull();
  });

  it("rejects zero amount and empty remarks", () => {
    const { errors } = validateExpense({ amount: "0", category: "Food", date: "2026-01-01", remarks: " " });
    expect(errors.amount).toBeDefined();
    expect(errors.remarks).toBeDefined();
  });
});
