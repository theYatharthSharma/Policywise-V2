import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Bell, Calculator, Heart, Home, LayoutDashboard, LogOut, MessageCircle, Search, Shield, User, FileText, Sun, Moon } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { initials } from "@/utils/format";
import { NOTIFICATIONS } from "@/data/mockData";
import { cn } from "@/lib/utils";

const items = [
  { to: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/app/browse", label: "Browse Policies", icon: Home },
  { to: "/app/calculator", label: "Premium Calculator", icon: Calculator },
  { to: "/app/assistant", label: "AI Assistant", icon: MessageCircle },
  { to: "/app/applications", label: "My Applications", icon: FileText },
  { to: "/app/favourites", label: "Favourite Policies", icon: Heart },
  { to: "/app/notifications", label: "Notifications", icon: Bell },
  { to: "/app/profile", label: "Profile", icon: User },
];

function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className="flex h-16 items-center gap-2 border-b px-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground"><Shield className="h-5 w-5" /></div>
          {!collapsed && (
            <div className="leading-tight">
              <div className="text-sm font-bold">PolicyWise</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Customer</div>
            </div>
          )}
        </div>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((it) => {
                const active = pathname === it.to;
                const Icon = it.icon;
                return (
                  <SidebarMenuItem key={it.to}>
                    <SidebarMenuButton asChild isActive={active} tooltip={it.label}>
                      <Link to={it.to} className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {!collapsed && <span>{it.label}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

function AppTopBar() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const unread = NOTIFICATIONS.filter((n) => !n.read).length;

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/app/browse", search: { q: query } as never });
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/80 px-3 backdrop-blur-xl sm:px-6">
      <SidebarTrigger className="shrink-0" />
      <form onSubmit={onSearch} className="relative hidden max-w-md flex-1 md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search policies, applications…" className="h-10 rounded-full border-muted bg-muted/40 pl-9" />
      </form>
      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
          {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </Button>
        <Button asChild variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Link to="/app/notifications">
            <Bell className="h-4 w-4" />
            {unread > 0 && <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">{unread}</span>}
          </Link>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full p-1 pr-3 hover:bg-muted">
              <Avatar className="h-8 w-8"><AvatarFallback className="bg-primary text-primary-foreground text-xs">{initials(user?.fullName || "User")}</AvatarFallback></Avatar>
              <div className="hidden text-left text-sm sm:block">
                <div className="font-medium leading-none">{user?.fullName || "Customer"}</div>
                <div className="text-[11px] text-muted-foreground">{user?.email}</div>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild><Link to="/app/profile"><User className="mr-2 h-4 w-4" />Profile</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link to="/app/notifications"><Bell className="mr-2 h-4 w-4" />Notifications</Link></DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={async () => { await logout(); navigate({ to: "/" }); }}>
              <LogOut className="mr-2 h-4 w-4" />Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className={cn("flex min-h-screen w-full bg-muted/30")}>
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <AppTopBar />
          <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
