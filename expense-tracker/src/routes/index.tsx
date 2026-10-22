import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { CategoryPieChart, SpendingTrendChart } from "@/components/expense/Charts";
import { ExpenseTable } from "@/components/expense/ExpenseTable";
import { Recommendations } from "@/components/expense/SpendingInsights";
import { Card, LoadErrorBanner } from "@/components/expense/States";
import { SummaryCards } from "@/components/expense/SummaryCards";
import { Topbar } from "@/components/expense/Topbar";
import { pageHead } from "@/lib/expenses/seo";

export const Route = createFileRoute("/")({
  head: () => pageHead("Expense Overview", "Understand your spending and make smarter decisions."),
  component: Overview,
});

function Overview() {
  return (
    <>
      <Topbar title="Expense Overview" subtitle="Understand your spending. Make smarter decisions." />
      <LoadErrorBanner />
      <SummaryCards />
      <div className="grid gap-6 2xl:grid-cols-2">
        <SpendingTrendChart />
        <CategoryPieChart />
      </div>
      <Card title="Recent transactions" action={
        <Link to="/transactions" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
          View all <ArrowRight className="h-4 w-4" />
        </Link>
      }>
        <ExpenseTable limit={5} compact />
      </Card>
      <Recommendations />
    </>
  );
}
