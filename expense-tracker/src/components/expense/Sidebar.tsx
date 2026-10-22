import { Link, useRouterState } from "@tanstack/react-router";
import { BarChart3, Lightbulb, LayoutDashboard, ListOrdered, Settings, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { isDemoMode } from "@/services/api";

export const NAV = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/transactions", label: "Transactions", icon: ListOrdered },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/insights", label: "Insights", icon: Lightbulb },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <Wallet className="h-5 w-5" />
        </div>
        <span className="font-display text-lg font-semibold text-sidebar-accent-foreground">Expense Tracker</span>
      </div>
      <nav className="flex-1 space-y-1 px-3" aria-label="Main">
        {NAV.map(({ to, label, icon: Icon }) => {
          const active = path === to;
          return (
            <Link
              key={to}
              to={to}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="m-4 rounded-lg border border-sidebar-border p-3 text-xs">
        <div className="flex items-center gap-2 font-medium text-sidebar-accent-foreground">
          <span className={cn("h-2 w-2 rounded-full", isDemoMode ? "bg-warning" : "bg-success")} />
          {isDemoMode ? "Demo mode" : "Backend connected"}
        </div>
        <p className="mt-1 opacity-70">
          {isDemoMode ? "Using sample data stored in this browser." : "Data loaded from your server."}
        </p>
      </div>
    </div>
  );
}
