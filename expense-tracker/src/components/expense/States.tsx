import { AlertTriangle, Inbox, Loader2, RefreshCw } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useExpenses } from "@/hooks/useExpenses";

export function Card({ title, action, children, className = "" }: { title?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`surface p-5 ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-2">
          {title && <h2 className="text-base font-semibold">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
      <Inbox className="h-8 w-8 text-muted-foreground" />
      <p className="font-medium">{title}</p>
      {hint && <p className="max-w-xs text-sm text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function LoadErrorBanner() {
  const { error, loading, reload } = useExpenses();
  if (loading && !error) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading expenses…
      </div>
    );
  }
  if (!error) return null;
  return (
    <div role="alert" className="flex flex-wrap items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
      <AlertTriangle className="h-4 w-4 text-destructive" />
      <span className="flex-1">{error}</span>
      <Button size="sm" variant="outline" onClick={reload}><RefreshCw className="h-4 w-4" /> Retry</Button>
    </div>
  );
}
