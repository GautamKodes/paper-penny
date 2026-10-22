import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useExpenses } from "@/hooks/useExpenses";
import { toISO } from "@/lib/expenses/analytics";
import { validateExpense, type FormErrors } from "@/lib/expenses/validation";
import { CATEGORIES } from "@/lib/expenses/types";

export function ExpenseForm() {
  const { formOpen, editing, closeForm, create, update } = useExpenses();
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [remarks, setRemarks] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!formOpen) return;
    setAmount(editing ? String(editing.amount) : "");
    setCategory(editing?.category ?? "");
    setDate(editing?.date ?? toISO(new Date()));
    setRemarks(editing?.remarks ?? "");
    setErrors({});
    setSubmitError(null);
  }, [formOpen, editing]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { errors: errs, value } = validateExpense({ amount, category, date, remarks });
    setErrors(errs);
    if (!value) return;
    setSaving(true);
    setSubmitError(null);
    try {
      if (editing) await update(editing.id, value);
      else await create(value);
      toast.success(editing ? "Expense updated" : "Expense saved");
      closeForm();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Could not save expense");
    } finally {
      setSaving(false);
    }
  };

  const field = (id: keyof FormErrors) => (errors[id] ? { "aria-invalid": true, "aria-describedby": `${id}-err` } : {});
  const Err = ({ id }: { id: keyof FormErrors }) =>
    errors[id] ? <p id={`${id}-err`} className="text-xs text-destructive">{errors[id]}</p> : null;

  return (
    <Dialog open={formOpen} onOpenChange={(o) => !o && !saving && closeForm()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Expense" : "Add Expense"}</DialogTitle>
          <DialogDescription>Record the amount, category, date and remarks.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input id="amount" type="number" inputMode="decimal" step="0.01" min="0" placeholder="0.00"
              value={amount} onChange={(e) => setAmount(e.target.value)} {...field("amount")} />
            <Err id="amount" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category" {...field("category")}><SelectValue placeholder="Select a category" /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Err id="category" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} {...field("date")} />
            <Err id="date" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea id="remarks" rows={2} maxLength={200} placeholder="e.g. Lunch with friends"
              value={remarks} onChange={(e) => setRemarks(e.target.value)} {...field("remarks")} />
            <Err id="remarks" />
          </div>
          {submitError && <p role="alert" className="rounded-md bg-destructive/10 p-2 text-sm text-destructive">{submitError}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeForm} disabled={saving}>Cancel</Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save Expense
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
