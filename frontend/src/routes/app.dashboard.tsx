import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowRight, Bell, Calculator, FileText, Heart, MessageCircle, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { policyService, applicationService, notificationService } from "@/services";
import { PolicyCard } from "@/components/policy/PolicyCard";
import { formatDate } from "@/utils/format";

export const Route = createFileRoute("/app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — PolicyWise" }, { name: "description", content: "Your personal PolicyWise dashboard with recommendations, applications and notifications." }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  const { data: recommended = [] } = useQuery({ queryKey: ["policies", "featured"], queryFn: policyService.featured });
  const { data: apps = [] } = useQuery({ queryKey: ["apps"], queryFn: applicationService.list });
  const { data: notifs = [] } = useQuery({ queryKey: ["notifs"], queryFn: notificationService.list });

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="overflow-hidden rounded-3xl border-border/60 p-8 card-elevated">
          <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <div className="text-xs uppercase tracking-widest text-primary">Welcome back</div>
              <h1 className="mt-1 text-3xl font-bold sm:text-4xl">Hi {user?.fullName?.split(" ")[0] || "there"} 👋</h1>
              <p className="mt-2 max-w-xl text-muted-foreground">You have {apps.filter(a => a.status !== "Approved").length} active applications and {notifs.filter(n => !n.read).length} unread notifications.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild><Link to="/app/browse"><Sparkles className="mr-2 h-4 w-4" />Browse policies</Link></Button>
              <Button asChild variant="outline"><Link to="/app/calculator"><Calculator className="mr-2 h-4 w-4" />Calculator</Link></Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Quick actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Calculator, label: "Premium Calculator", to: "/app/calculator" },
          { icon: FileText, label: "My Applications", to: "/app/applications" },
          { icon: Heart, label: "Favourites", to: "/app/favourites" },
          { icon: MessageCircle, label: "AI Assistant", to: "/app/assistant" },
        ].map((q) => (
          <Link key={q.to} to={q.to} className="group">
            <Card className="flex items-center gap-3 rounded-2xl border-border/60 p-4 transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary"><q.icon className="h-5 w-5" /></div>
              <div className="flex-1"><div className="text-sm font-semibold">{q.label}</div><div className="text-xs text-muted-foreground">Open</div></div>
              <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-1" />
            </Card>
          </Link>
        ))}
      </div>

      {/* Recommended */}
      <div>
        <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold">Recommended for you</h2><Button asChild variant="ghost" size="sm"><Link to="/app/browse">All policies <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link></Button></div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {recommended.slice(0, 3).map((p) => <PolicyCard key={p.id} policy={p} />)}
        </div>
      </div>

      {/* Recent activity + notifications */}
      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Card className="rounded-2xl p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">Recent applications</h3>
            <Button asChild variant="ghost" size="sm"><Link to="/app/applications">View all</Link></Button>
          </div>
          <div className="divide-y">
            {apps.slice(0, 3).map((a) => (
              <div key={a.id} className="flex items-center justify-between py-3">
                <div>
                  <div className="text-sm font-medium">{a.policyName}</div>
                  <div className="text-xs text-muted-foreground">{a.id} · {formatDate(a.appliedDate)}</div>
                </div>
                <Badge className={a.status === "Approved" ? "bg-success text-success-foreground" : a.status === "Pending" ? "bg-warning text-warning-foreground" : "bg-primary-soft text-primary"}>{a.status}</Badge>
              </div>
            ))}
          </div>
        </Card>
        <Card className="rounded-2xl p-6">
          <div className="mb-4 flex items-center gap-2"><Bell className="h-4 w-4 text-primary" /><h3 className="font-semibold">Recent notifications</h3></div>
          <ul className="space-y-3">
            {notifs.slice(0, 4).map((n) => (
              <li key={n.id} className="flex items-start gap-3 text-sm">
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.read ? "bg-muted-foreground/40" : "bg-primary"}`} />
                <div className="min-w-0">
                  <div className="truncate font-medium">{n.title}</div>
                  <div className="line-clamp-2 text-xs text-muted-foreground">{n.body}</div>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
