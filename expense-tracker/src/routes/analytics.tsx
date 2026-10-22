import { createFileRoute } from "@tanstack/react-router";
import { CategoryBarChart, CategoryPieChart, SpendingTrendChart } from "@/components/expense/Charts";
import { LoadErrorBanner } from "@/components/expense/States";
import { SummaryCards } from "@/components/expense/SummaryCards";
import { Topbar } from "@/components/expense/Topbar";
import { pageHead } from "@/lib/expenses/seo";

export const Route = createFileRoute("/analytics")({
  head: () => pageHead("Analytics", "Category-wise and time-based analysis of your spending."),
  component: () => (
    <>
      <Topbar title="Analytics" subtitle="Category-wise and time-based spending analysis." />
      <LoadErrorBanner />
      <SummaryCards />
      <SpendingTrendChart />
      <div className="grid gap-6 2xl:grid-cols-2">
        <CategoryPieChart />
        <CategoryBarChart />
      </div>
    </>
  ),
});
