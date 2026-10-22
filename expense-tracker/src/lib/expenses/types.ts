/** The agreed four-property expense contract. */
export const CATEGORIES = [
  "Food",
  "Travel",
  "Shopping",
  "Bills",
  "Education",
  "Entertainment",
  "Healthcare",
  "Others",
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface ExpenseInput {
  amount: number;
  category: Category;
  date: string; // YYYY-MM-DD
  remarks: string;
}

/** `id` is assigned by the backend (or demo store); confirm its name with the backend developer. */
export interface Expense extends ExpenseInput {
  id: string;
}

export type RangePreset = "all" | "today" | "week" | "month" | "custom";

export interface DateRange {
  preset: RangePreset;
  from?: string;
  to?: string;
}
