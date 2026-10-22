import { createFileRoute } from "@tanstack/react-router";
import { Recommendations, SpendingInsights, UnusualSpending } from "@/components/expense/SpendingInsights";
import { LoadErrorBanner } from "@/components/expense/States";
import { Topbar } from "@/components/expense/Topbar";
import { pageHead } from "@/lib/expenses/seo";

export const Route = createFileRoute("/insights")({
  head: () => pageHead("Insights", "Spending patterns, unusual expenses and practical recommendations."),
  component: () => (
    <>
      <Topbar title="Insights" subtitle="Patterns, potential anomalies and recommendations." />
      <LoadErrorBanner />
      <SpendingInsights />
      <div className="grid gap-6 2xl:grid-cols-2">
        <Recommendations />
        <UnusualSpending />
      </div>
    </>
  ),
});
