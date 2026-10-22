import { toISO } from "./analytics";
import type { Category, Expense } from "./types";

/** DEMO DATA ONLY — used when no backend URL is configured. Never merged with real data. */
const seed: [number, Category, number, string][] = [
  [0, "Food", 420, "Lunch with team"],
  [1, "Travel", 180, "Metro card recharge"],
  [2, "Shopping", 2499, "Running shoes"],
  [3, "Bills", 1199, "Mobile postpaid bill"],
  [4, "Food", 260, "Groceries"],
  [5, "Entertainment", 649, "Movie tickets"],
  [6, "Education", 1500, "Online course"],
  [8, "Food", 340, "Dinner takeaway"],
  [10, "Healthcare", 850, "Pharmacy"],
  [12, "Travel", 1250, "Cab to airport"],
  [14, "Bills", 2300, "Electricity bill"],
  [16, "Food", 510, "Cafe & snacks"],
  [19, "Shopping", 899, "Books"],
  [22, "Others", 300, "Gift wrapping"],
  [25, "Food", 450, "Weekend brunch"],
  [28, "Travel", 3200, "Train tickets home"],
  [33, "Bills", 1199, "Mobile postpaid bill"],
  [36, "Food", 380, "Groceries"],
  [40, "Entertainment", 499, "Streaming subscription"],
  [44, "Bills", 2100, "Electricity bill"],
  [48, "Shopping", 1799, "Backpack"],
  [52, "Food", 620, "Birthday dinner"],
  [57, "Education", 12500, "Semester exam fees"],
  [62, "Healthcare", 400, "Doctor consultation"],
  [70, "Food", 300, "Groceries"],
];

export function demoExpenses(now = new Date()): Expense[] {
  return seed.map(([daysAgo, category, amount, remarks], i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    return { id: `demo-${i + 1}`, amount, category, date: toISO(d), remarks };
  });
}
