import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Bell, CheckCheck, CheckCircle2, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { notificationService } from "@/services";
import { formatDate } from "@/utils/format";
import { EmptyState } from "@/components/common/EmptyState";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/notifications")({
  head: () => ({ meta: [{ title: "Notifications — PolicyWise" }, { name: "description", content: "All your policy, application and account notifications in one place." }] }),
  component: NotificationsPage,
});

const icons = { info: Info, success: CheckCircle2, warning: AlertTriangle } as const;

function NotificationsPage() {
  const { data = [] } = useQuery({ queryKey: ["notifs"], queryFn: notificationService.list });
  const [local, setLocal] = useState(data);
  // sync when data loads
  if (local.length === 0 && data.length > 0) setLocal(data);
  const [tab, setTab] = useState("all");
  const filtered = local.filter((n) => tab === "all" ? true : tab === "unread" ? !n.read : n.read);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-2xl font-bold">Notifications</h1><p className="text-sm text-muted-foreground">Stay on top of your policy activity.</p></div>
        <Button variant="outline" size="sm" onClick={() => setLocal((l) => l.map((n) => ({ ...n, read: true })))}><CheckCheck className="mr-2 h-4 w-4" /> Mark all as read</Button>
      </div>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
          <TabsTrigger value="read">Read</TabsTrigger>
        </TabsList>
      </Tabs>
      {filtered.length === 0 ? (
        <EmptyState icon={<Bell className="h-6 w-6" />} title="No notifications" description="You're all caught up!" />
      ) : (
        <div className="grid gap-3">
          {filtered.map((n) => {
            const Icon = icons[n.type];
            return (
              <Card key={n.id} className={cn("flex gap-4 rounded-2xl border-border/60 p-4", !n.read && "ring-1 ring-primary/20")}>
                <div className={cn("mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl",
                  n.type === "success" ? "bg-success/10 text-success" : n.type === "warning" ? "bg-warning/10 text-warning" : "bg-primary-soft text-primary")}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="truncate text-sm font-semibold">{n.title}</div>
                    <div className="shrink-0 text-xs text-muted-foreground">{formatDate(n.date)}</div>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
