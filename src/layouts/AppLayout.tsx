import { Outlet, useLocation } from "react-router-dom";
import { Search, Bell } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const TITLES: Record<string, string> = {
  "/": "Overview",
  "/components": "Components",
  "/suppliers": "Suppliers",
  "/alerts": "Risk Alerts",
  "/copilot": "AI Copilot",
};

export default function AppLayout() {
  const { pathname } = useLocation();
  const title = TITLES[pathname] ?? "Helix";
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
            <div className="h-5 w-px bg-border" />
            <h1 className="text-sm font-semibold tracking-tight">{title}</h1>
            <div className="ml-auto flex items-center gap-2">
              <div className="relative hidden md:block">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search components, suppliers…" className="h-8 w-72 rounded-md border-border bg-secondary/50 pl-8 text-xs" />
              </div>
              <Button size="icon" variant="ghost" className="h-8 w-8">
                <Bell className="h-4 w-4" />
              </Button>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">AK</div>
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
