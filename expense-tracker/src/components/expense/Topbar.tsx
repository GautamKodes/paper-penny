import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useExpenses } from "@/hooks/useExpenses";
import { DateRangeFilter } from "./DateRangeFilter";

export function Topbar({ title, subtitle }: { title: string; subtitle: string }) {
  const { openForm } = useExpenses();
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 className="text-2xl font-semibold md:text-3xl">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <DateRangeFilter />
        <Button onClick={() => openForm()}>
          <Plus className="h-4 w-4" /> Add Expense
        </Button>
      </div>
    </div>
  );
}
