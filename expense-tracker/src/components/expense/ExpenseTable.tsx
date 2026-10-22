import { useMemo, useState } from "react";
import { ArrowDownUp, Pencil, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useExpenses } from "@/hooks/useExpenses";
import { CATEGORY_META } from "@/lib/expenses/categories";
import { formatDate, formatINR } from "@/lib/expenses/format";
import { CATEGORIES, type Expense } from "@/lib/expenses/types";
import { EmptyState } from "./States";

type SortKey = "date-desc" | "date-asc" | "amount-desc" | "amount-asc";

export function CategoryBadge({ category }: { category: Expense["category"] }) {
  const { icon: Icon, color } = CATEGORY_META[category] ?? CATEGORY_META.Others;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
      <Icon className="h-3.5 w-3.5" style={{ color }} /> {category}
    </span>
  );
}

export function ExpenseTable({ limit, compact }: { limit?: number; compact?: boolean }) {
  const { filtered, loading, openForm, remove } = useExpenses();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [sort, setSort] = useState<SortKey>("date-desc");
  const [toDelete, setToDelete] = useState<Expense | null>(null);
  const [deleting, setDeleting] = useState(false);

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    let r = filtered.filter((e) => (cat === "all" || e.category === cat) && (!s || e.remarks.toLowerCase().includes(s)));
    r = [...r].sort((a, b) => {
      switch (sort) {
        case "date-asc": return a.date.localeCompare(b.date);
        case "amount-desc": return b.amount - a.amount;
        case "amount-asc": return a.amount - b.amount;
        default: return b.date.localeCompare(a.date);
      }
    });
    return limit ? r.slice(0, limit) : r;
  }, [filtered, q, cat, sort, limit]);

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await remove(toDelete.id);
      toast.success("Expense deleted");
      setToDelete(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      {!compact && (
        <div className="mb-4 flex flex-wrap gap-2">
          <div className="relative min-w-48 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input aria-label="Search remarks" placeholder="Search remarks…" className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <Select value={cat} onValueChange={setCat}>
            <SelectTrigger className="w-44" aria-label="Filter by category"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger className="w-48" aria-label="Sort"><ArrowDownUp className="h-4 w-4" /><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">Date: newest first</SelectItem>
              <SelectItem value="date-asc">Date: oldest first</SelectItem>
              <SelectItem value="amount-desc">Amount: high to low</SelectItem>
              <SelectItem value="amount-asc">Amount: low to high</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {rows.length === 0 ? (
        loading ? <div className="space-y-2">{[0, 1, 2].map((i) => <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />)}</div>
          : <EmptyState title="No expenses found" hint="Add an expense or adjust your filters and date range." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="py-2 pr-4 font-medium">Date</th>
                <th className="py-2 pr-4 font-medium">Remarks</th>
                <th className="py-2 pr-4 font-medium">Category</th>
                <th className="py-2 pr-4 text-right font-medium">Amount</th>
                <th className="py-2 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((e) => (
                <tr key={e.id} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="whitespace-nowrap py-3 pr-4 text-muted-foreground">{formatDate(e.date)}</td>
                  <td className="py-3 pr-4 font-medium">{e.remarks}</td>
                  <td className="py-3 pr-4"><CategoryBadge category={e.category} /></td>
                  <td className="tabular whitespace-nowrap py-3 pr-4 text-right font-semibold">{formatINR(e.amount)}</td>
                  <td className="whitespace-nowrap py-3 text-right">
                    <Button size="icon" variant="ghost" aria-label={`Edit ${e.remarks}`} onClick={() => openForm(e)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" aria-label={`Delete ${e.remarks}`} onClick={() => setToDelete(e)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this expense?</AlertDialogTitle>
            <AlertDialogDescription>
              {toDelete && `${toDelete.remarks} — ${formatINR(toDelete.amount)} on ${formatDate(toDelete.date)}. This cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => { e.preventDefault(); confirmDelete(); }} disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
