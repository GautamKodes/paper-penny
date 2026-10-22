import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { expenseApi } from "@/services/api";
import { filterByRange } from "@/lib/expenses/analytics";
import type { DateRange, Expense, ExpenseInput } from "@/lib/expenses/types";

interface Ctx {
  all: Expense[];
  filtered: Expense[];
  range: DateRange;
  setRange: (r: DateRange) => void;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  create: (i: ExpenseInput) => Promise<void>;
  update: (id: string, i: ExpenseInput) => Promise<void>;
  remove: (id: string) => Promise<void>;
  formOpen: boolean;
  editing: Expense | null;
  openForm: (e?: Expense) => void;
  closeForm: () => void;
}

const ExpenseContext = createContext<Ctx | null>(null);

export function ExpenseProvider({ children }: { children: ReactNode }) {
  const [all, setAll] = useState<Expense[]>([]);
  const [range, setRange] = useState<DateRange>({ preset: "all" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await expenseApi.list();
      // de-duplicate by id to avoid double counting
      setAll([...new Map(list.map((e) => [e.id, e])).values()]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load expenses");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const create = useCallback(async (i: ExpenseInput) => {
    await expenseApi.create(i);
    await reload();
  }, [reload]);
  const update = useCallback(async (id: string, i: ExpenseInput) => {
    await expenseApi.update(id, i);
    await reload();
  }, [reload]);
  const remove = useCallback(async (id: string) => {
    await expenseApi.remove(id);
    await reload();
  }, [reload]);

  const filtered = useMemo(() => filterByRange(all, range), [all, range]);

  const value: Ctx = {
    all, filtered, range, setRange, loading, error, reload, create, update, remove,
    formOpen, editing,
    openForm: (e) => { setEditing(e ?? null); setFormOpen(true); },
    closeForm: () => { setFormOpen(false); setEditing(null); },
  };
  return <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>;
}

export function useExpenses() {
  const c = useContext(ExpenseContext);
  if (!c) throw new Error("useExpenses must be used within ExpenseProvider");
  return c;
}
