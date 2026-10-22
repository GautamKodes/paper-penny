import { useState, type ReactNode } from "react";
import { Menu, Sparkles, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Toaster } from "@/components/ui/sonner";
import { ExpenseProvider } from "@/hooks/useExpenses";
import { AIChatPanel } from "./AIChatPanel";
import { ExpenseForm } from "./ExpenseForm";
import { Sidebar } from "./Sidebar";

export function AppShell({ children }: { children: ReactNode }) {
  const [navOpen, setNavOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  return (
    <ExpenseProvider>
      <div className="flex min-h-screen w-full">
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 lg:block"><Sidebar /></aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center gap-2 border-b bg-card px-4 py-3 lg:hidden">
            <Button size="icon" variant="ghost" aria-label="Open menu" onClick={() => setNavOpen(true)}><Menu className="h-5 w-5" /></Button>
            <Wallet className="h-5 w-5 text-primary" />
            <span className="font-display font-semibold">Expense Tracker</span>
          </header>
          <main className="mx-auto w-full max-w-6xl flex-1 space-y-6 p-4 md:p-6 lg:p-8">{children}</main>
        </div>

        <aside className="sticky top-0 hidden h-screen w-[360px] shrink-0 border-l xl:block"><AIChatPanel /></aside>
      </div>

      <Sheet open={navOpen} onOpenChange={setNavOpen}>
        <SheetContent side="left" className="w-64 border-0 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <Sidebar onNavigate={() => setNavOpen(false)} />
        </SheetContent>
      </Sheet>
      <Sheet open={chatOpen} onOpenChange={setChatOpen}>
        <SheetContent side="right" className="w-full p-0 sm:max-w-md">
          <SheetTitle className="sr-only">AI Expense Assistant</SheetTitle>
          <AIChatPanel />
        </SheetContent>
      </Sheet>
      <Button onClick={() => setChatOpen(true)} aria-label="Open AI assistant"
        className="fixed bottom-5 right-5 z-40 h-14 w-14 rounded-full shadow-pop xl:hidden" size="icon">
        <Sparkles className="h-6 w-6" />
      </Button>

      <ExpenseForm />
      <Toaster position="top-center" />
    </ExpenseProvider>
  );
}
