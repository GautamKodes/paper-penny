import { useState } from "react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { useExpenses } from "@/hooks/useExpenses";
import { categoryTotals, trendSeries, type Granularity } from "@/lib/expenses/analytics";
import { CATEGORY_META } from "@/lib/expenses/categories";
import { formatINR, formatINRCompact, pct } from "@/lib/expenses/format";
import { Card, EmptyState } from "./States";

const tipStyle = {
  background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 10,
  boxShadow: "var(--shadow-pop)", fontSize: 12,
};

export function CategoryPieChart() {
  const { filtered } = useExpenses();
  const data = categoryTotals(filtered).filter((c) => c.total > 0);
  return (
    <Card title="Category distribution">
      {data.length === 0 ? <EmptyState title="No data for this period" /> : (
        <div className="grid items-center gap-4 sm:grid-cols-[180px_1fr]">
          <div className="h-[180px]">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={data} dataKey="total" nameKey="category" innerRadius={52} outerRadius={84} paddingAngle={2} stroke="none">
                  {data.map((d) => <Cell key={d.category} fill={CATEGORY_META[d.category].color} />)}
                </Pie>
                <Tooltip contentStyle={tipStyle}
                  formatter={(v: number, _n, p: any) => [`${formatINR(v)} (${pct(p.payload.percent)})`, p.payload.category]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="space-y-2 text-sm">
            {data.map((d) => (
              <li key={d.category} className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: CATEGORY_META[d.category].color }} />
                <span className="flex-1">{d.category}</span>
                <span className="tabular font-medium">{formatINR(d.total)}</span>
                <span className="tabular w-12 text-right text-muted-foreground">{pct(d.percent)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}

export function CategoryBarChart() {
  const { filtered } = useExpenses();
  const data = categoryTotals(filtered);
  const max = data[0]?.total ?? 0;
  return (
    <Card title="Category comparison">
      {max === 0 ? <EmptyState title="No data for this period" /> : (
        <div className="h-72">
          <ResponsiveContainer>
            <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
              <CartesianGrid horizontal={false} stroke="var(--border)" />
              <XAxis type="number" tickFormatter={formatINRCompact} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="category" width={96} tick={{ fontSize: 12, fill: "var(--foreground)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tipStyle} cursor={{ fill: "var(--muted)" }} formatter={(v: number) => [formatINR(v), "Spent"]} />
              <Bar dataKey="total" radius={[0, 6, 6, 0]} barSize={18}>
                {data.map((d) => (
                  <Cell key={d.category} fill={d.total === max ? "var(--primary)" : "var(--chart-8)"} fillOpacity={d.total === max ? 1 : 0.45} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}

export function SpendingTrendChart() {
  const { filtered } = useExpenses();
  const [g, setG] = useState<Granularity>("daily");
  const data = trendSeries(filtered, g);
  return (
    <Card title="Spending trend" action={
      <div role="tablist" aria-label="Granularity" className="flex rounded-lg bg-muted p-0.5 text-xs">
        {(["daily", "weekly", "monthly"] as Granularity[]).map((x) => (
          <button key={x} role="tab" aria-selected={g === x} onClick={() => setG(x)}
            className={`rounded-md px-3 py-1 font-medium capitalize transition-colors ${g === x ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            {x}
          </button>
        ))}
      </div>
    }>
      {data.length === 0 ? <EmptyState title="No data for this period" /> : (
        <div className="h-64">
          <ResponsiveContainer>
            <AreaChart data={data} margin={{ left: 0, right: 8, top: 8 }}>
              <defs>
                <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="var(--border)" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} minTickGap={16} />
              <YAxis tickFormatter={formatINRCompact} width={56} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tipStyle} formatter={(v: number) => [formatINR(v), "Spent"]} />
              <Area type="monotone" dataKey="total" stroke="var(--primary)" strokeWidth={2} fill="url(#trendFill)" dot={data.length < 20} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
