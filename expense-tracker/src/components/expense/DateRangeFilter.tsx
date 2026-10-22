import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useExpenses } from "@/hooks/useExpenses";
import type { RangePreset } from "@/lib/expenses/types";

const OPTIONS: { v: RangePreset; l: string }[] = [
  { v: "all", l: "All Time" },
  { v: "today", l: "Today" },
  { v: "week", l: "This Week" },
  { v: "month", l: "This Month" },
  { v: "custom", l: "Custom Range" },
];

export function DateRangeFilter() {
  const { range, setRange } = useExpenses();
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={range.preset} onValueChange={(v) => setRange({ ...range, preset: v as RangePreset })}>
        <SelectTrigger className="w-40 bg-card" aria-label="Date range">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {OPTIONS.map((o) => (
            <SelectItem key={o.v} value={o.v}>{o.l}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {range.preset === "custom" && (
        <>
          <Input type="date" aria-label="From date" className="w-40 bg-card" value={range.from ?? ""}
            onChange={(e) => setRange({ ...range, from: e.target.value })} />
          <span className="text-sm text-muted-foreground">to</span>
          <Input type="date" aria-label="To date" className="w-40 bg-card" value={range.to ?? ""} min={range.from}
            onChange={(e) => setRange({ ...range, to: e.target.value })} />
        </>
      )}
    </div>
  );
}
