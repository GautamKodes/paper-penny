import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/expense/States";
import { useExpenses } from "@/hooks/useExpenses";
import { ENDPOINTS, isDemoMode, resetDemoData } from "@/services/api";
import { pageHead } from "@/lib/expenses/seo";

export const Route = createFileRoute("/settings")({
  head: () => pageHead("Settings", "Backend connection status and demo data controls."),
  component: Settings,
});

function Settings() {
  const { reload } = useExpenses();
  const base = (import.meta.env["VITE_API_BASE_URL"] as string | undefined) || "Not configured";
  return (
    <>
      <div>
        <h1 className="text-2xl font-semibold md:text-3xl">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Connection status and data controls.</p>
      </div>
      <Card title="Backend connection">
        <dl className="grid gap-3 text-sm sm:grid-cols-[180px_1fr]">
          <dt className="text-muted-foreground">Mode</dt><dd className="font-medium">{isDemoMode ? "Demo (local sample data)" : "Connected"}</dd>
          <dt className="text-muted-foreground">API base URL</dt><dd className="font-mono text-xs">{base}</dd>
          <dt className="text-muted-foreground">Expenses endpoint</dt><dd className="font-mono text-xs">{ENDPOINTS.expenses}</dd>
          <dt className="text-muted-foreground">Chat endpoint</dt><dd className="font-mono text-xs">{ENDPOINTS.chat}</dd>
        </dl>
        <p className="mt-4 text-xs text-muted-foreground">Set VITE_API_BASE_URL to connect to the backend. See README for details.</p>
      </Card>
      {isDemoMode && (
        <Card title="Demo data">
          <p className="mb-4 text-sm text-muted-foreground">Demo data is stored only in this browser.</p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={async () => { resetDemoData(); await reload(); toast.success("Sample data restored"); }}>Restore sample data</Button>
            <Button variant="outline" onClick={async () => { resetDemoData(true); await reload(); toast.success("All demo data cleared"); }}>Clear all data</Button>
          </div>
        </Card>
      )}
    </>
  );
}
