import { parseISO } from "./analytics";
import { CATEGORIES, type Category, type ExpenseInput } from "./types";

export type FormErrors = Partial<Record<keyof ExpenseInput, string>>;

export function validateExpense(raw: { amount: string; category: string; date: string; remarks: string }) {
  const errors: FormErrors = {};
  const amount = Number(raw.amount);
  if (raw.amount.trim() === "") errors.amount = "Amount is required.";
  else if (!Number.isFinite(amount) || amount <= 0) errors.amount = "Amount must be greater than zero.";
  if (!CATEGORIES.includes(raw.category as Category)) errors.category = "Please choose a category.";
  if (!raw.date) errors.date = "Date is required.";
  else if (!parseISO(raw.date)) errors.date = "Enter a valid date.";
  const remarks = raw.remarks.trim();
  if (!remarks) errors.remarks = "Remarks are required.";
  const ok = Object.keys(errors).length === 0;
  const value: ExpenseInput | null = ok
    ? { amount: Math.round(amount * 100) / 100, category: raw.category as Category, date: raw.date, remarks }
    : null;
  return { errors, value };
}
