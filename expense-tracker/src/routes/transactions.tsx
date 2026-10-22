import { createFileRoute } from "@tanstack/react-router";
import { ExpenseTable } from "@/components/expense/ExpenseTable";
import { Card, LoadErrorBanner } from "@/components/expense/States";
import { Topbar } from "@/components/expense/Topbar";
import { pageHead } from "@/lib/expenses/seo";

export const Route = createFileRoute("/transactions")({
  head: () => pageHead("Transactions", "View, search, sort, edit and delete your recorded expenses."),
  component: () => (
    <>
      <Topbar title="Transactions" subtitle="Search, sort, edit and manage every expense." />
      <LoadErrorBanner />
      <Card><ExpenseTable /></Card>
    </>
  ),
});
