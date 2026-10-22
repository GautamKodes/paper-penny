import { CATEGORIES, type Category, type DateRange, type Expense } from "./types";

/** Local-date ISO (YYYY-MM-DD), avoiding UTC shifts. */
export const toISO = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const parseISO = (s: string): Date | null => {
  if (!/^\d{4}-\d{2}-\d{2}/.test(s ?? "")) return null;
  const d = new Date(s.slice(0, 10) + "T00:00:00");
  return Number.isNaN(d.getTime()) ? null : d;
};

export const isValidExpense = (e: Expense) =>
  !!e && Number.isFinite(e.amount) && e.amount > 0 && parseISO(e.date) !== null;

const startOfWeek = (d: Date) => {
  const r = new Date(d);
  const day = (r.getDay() + 6) % 7; // Monday start
  r.setDate(r.getDate() - day);
  r.setHours(0, 0, 0, 0);
  return r;
};

/** Resolve a range to concrete [from, to] ISO bounds (inclusive). null = unbounded. */
export function resolveRange(range: DateRange, now = new Date()): { from: string | null; to: string | null } {
  const today = toISO(now);
  switch (range.preset) {
    case "today":
      return { from: today, to: today };
    case "week":
      return { from: toISO(startOfWeek(now)), to: today };
    case "month":
      return { from: toISO(new Date(now.getFullYear(), now.getMonth(), 1)), to: today };
    case "custom":
      return { from: range.from || null, to: range.to || null };
    default:
      return { from: null, to: null };
  }
}

/** Previous equivalent period of same length, or null when unbounded. */
export function previousRange(range: DateRange, now = new Date()): { from: string; to: string } | null {
  const { from, to } = resolveRange(range, now);
  if (!from || !to) return null;
  const f = parseISO(from)!;
  const t = parseISO(to)!;
  if (range.preset === "month") {
    const pf = new Date(f.getFullYear(), f.getMonth() - 1, 1);
    const lastDay = new Date(f.getFullYear(), f.getMonth(), 0).getDate();
    const pt = new Date(f.getFullYear(), f.getMonth() - 1, Math.min(t.getDate(), lastDay));
    return { from: toISO(pf), to: toISO(pt) };
  }
  const days = Math.round((t.getTime() - f.getTime()) / 86400000) + 1;
  const pt = new Date(f);
  pt.setDate(pt.getDate() - 1);
  const pf = new Date(pt);
  pf.setDate(pf.getDate() - (days - 1));
  return { from: toISO(pf), to: toISO(pt) };
}

export function filterByBounds(list: Expense[], from: string | null, to: string | null) {
  return list.filter((e) => {
    if (!isValidExpense(e)) return false;
    const d = e.date.slice(0, 10);
    if (from && d < from) return false;
    if (to && d > to) return false;
    return true;
  });
}

export const filterByRange = (list: Expense[], range: DateRange, now = new Date()) => {
  const { from, to } = resolveRange(range, now);
  return filterByBounds(list, from, to);
};

export const total = (list: Expense[]) =>
  Math.round(list.reduce((s, e) => s + (Number.isFinite(e.amount) ? e.amount : 0), 0) * 100) / 100;

export const average = (list: Expense[]) => (list.length ? total(list) / list.length : 0);

export interface CategoryStat {
  category: Category;
  total: number;
  count: number;
  percent: number;
}

export function categoryTotals(list: Expense[]): CategoryStat[] {
  const sum = total(list);
  return CATEGORIES.map((category) => {
    const items = list.filter((e) => e.category === category);
    const t = total(items);
    return { category, total: t, count: items.length, percent: sum ? (t / sum) * 100 : 0 };
  }).sort((a, b) => b.total - a.total);
}

export const highestCategory = (list: Expense[]) => {
  const c = categoryTotals(list).filter((c) => c.total > 0);
  return c[0] ?? null;
};

export const lowestCategory = (list: Expense[]) => {
  const c = categoryTotals(list).filter((c) => c.total > 0);
  return c.length ? c[c.length - 1] : null;
};

export const highestExpense = (list: Expense[]) =>
  list.reduce<Expense | null>((m, e) => (!m || e.amount > m.amount ? e : m), null);

export type Granularity = "daily" | "weekly" | "monthly";

/** Groups by full date / ISO week start / year-month so different months never merge. */
export function trendSeries(list: Expense[], g: Granularity) {
  const map = new Map<string, number>();
  for (const e of list) {
    const d = parseISO(e.date);
    if (!d) continue;
    let key: string;
    if (g === "daily") key = toISO(d);
    else if (g === "weekly") key = toISO(startOfWeek(d));
    else key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    map.set(key, (map.get(key) ?? 0) + e.amount);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => ({ key, label: trendLabel(key, g), total: Math.round(value * 100) / 100 }));
}

function trendLabel(key: string, g: Granularity) {
  if (g === "monthly") {
    const [y = 0, m = 1] = key.split("-").map(Number);
    return new Date(y, m - 1, 1).toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
  }
  const d = parseISO(key)!;
  const s = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
  return g === "weekly" ? `Wk ${s}` : s;
}

/** Percent change vs previous equivalent period; null when not comparable. */
export function periodComparison(all: Expense[], range: DateRange, now = new Date()) {
  const prev = previousRange(range, now);
  if (!prev) return null;
  const current = total(filterByRange(all, range, now));
  const previous = total(filterByBounds(all, prev.from, prev.to));
  if (previous <= 0) return { current, previous, change: null as number | null };
  return { current, previous, change: ((current - previous) / previous) * 100 };
}

/**
 * Potential anomalies: amount > median * 2.5 AND above mean + 1.5 * stdDev.
 * Requires at least 5 transactions to be meaningful.
 */
export function detectAnomalies(list: Expense[]) {
  if (list.length < 5) return { items: [] as Expense[], threshold: null as number | null };
  const amounts = list.map((e) => e.amount).sort((a, b) => a - b);
  const mid = Math.floor(amounts.length / 2);
  const median = amounts.length % 2 ? amounts[mid]! : (amounts[mid - 1]! + amounts[mid]!) / 2;
  const mean = average(list);
  const sd = Math.sqrt(amounts.reduce((s, a) => s + (a - mean) ** 2, 0) / amounts.length);
  const threshold = Math.max(median * 2.5, mean + 1.5 * sd);
  return { items: list.filter((e) => e.amount > threshold).sort((a, b) => b.amount - a.amount), threshold, median };
}

export function recommendations(list: Expense[], all: Expense[], range: DateRange, now = new Date()): string[] {
  if (list.length < 3) return [];
  const out: string[] = [];
  const cats = categoryTotals(list).filter((c) => c.total > 0);
  if (cats[0]) out.push(`${cats[0].category} accounts for ${cats[0].percent.toFixed(0)}% of your recorded expenses.`);
  if (cats[1]) out.push(`${cats[1].category} is your second-highest spending category at ${cats[1].percent.toFixed(0)}%.`);
  const cmp = periodComparison(all, range, now);
  if (cmp && cmp.change !== null) {
    const dir = cmp.change >= 0 ? "increased" : "decreased";
    out.push(`Your spending ${dir} by ${Math.abs(cmp.change).toFixed(0)}% compared with the previous equivalent period.`);
  }
  if (cats[0] && cats[0].percent >= 30)
    out.push(`Consider setting a monthly spending limit for ${cats[0].category}, since it takes a large share of your budget.`);
  const an = detectAnomalies(list);
  if (an.items.length)
    out.push(`${an.items.length} transaction${an.items.length > 1 ? "s are" : " is"} well above your typical amount — worth reviewing.`);
  const small = list.filter((e) => e.amount < average(list) * 0.3);
  if (small.length >= 5)
    out.push(`You have ${small.length} small purchases. Small, frequent spends add up — batching them can help.`);
  return out;
}
