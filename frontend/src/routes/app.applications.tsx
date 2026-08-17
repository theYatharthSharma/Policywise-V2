import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { CheckCircle2, Circle, FileText, Phone, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { applicationService } from "@/services";
import { formatDate } from "@/utils/format";
import { EmptyState } from "@/components/common/EmptyState";

export const Route = createFileRoute("/app/applications")({
  head: () => ({ meta: [{ title: "My Applications — PolicyWise" }, { name: "description", content: "Track your policy applications and their approval timeline." }] }),
  component: ApplicationsPage,
});

const statusColor: Record<string, string> = {
  Approved: "bg-success text-success-foreground",
  Pending: "bg-warning text-warning-foreground",
  "Under Review": "bg-primary-soft text-primary",
  Rejected: "bg-destructive text-destructive-foreground",
};

function ApplicationsPage() {
  const { data: apps = [] } = useQuery({ queryKey: ["apps"], queryFn: applicationService.list });
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const filtered = apps.filter((a) => (filter === "all" || a.status === filter) && (a.policyName + a.id).toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">My applications</h1><p className="text-sm text-muted-foreground">Track your applications in real time.</p></div>
      <div className="grid gap-3 sm:grid-cols-[1fr_200px]">
        <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" placeholder="Search by policy or ID…" /></div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Under Review">Under Review</SelectItem>
            <SelectItem value="Approved">Approved</SelectItem>
            <SelectItem value="Rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {filtered.length === 0 ? (
        <EmptyState icon={<FileText className="h-6 w-6" />} title="No applications yet" description="Once you apply for a policy, it will appear here." />
      ) : (
        <div className="grid gap-5">
          {filtered.map((a) => (
            <Card key={a.id} className="rounded-2xl border-border/60 p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-xs text-muted-foreground">{a.id}</div>
                  <div className="mt-0.5 text-lg font-semibold">{a.policyName}</div>
                  <div className="text-xs text-muted-foreground">Applied {formatDate(a.appliedDate)}</div>
                </div>
                <Badge className={statusColor[a.status]}>{a.status}</Badge>
              </div>
              <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_260px]">
                <div>
                  <div className="mb-3 text-xs font-semibold uppercase text-muted-foreground">Timeline</div>
                  <ol className="relative space-y-4 border-l border-border pl-6">
                    {a.timeline.map((t) => (
                      <li key={t.label} className="relative">
                        <span className={`absolute -left-[26px] top-0.5 grid h-5 w-5 place-items-center rounded-full ${t.done ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"}`}>
                          {t.done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3 w-3" />}
                        </span>
                        <div className="text-sm font-medium">{t.label}</div>
                        <div className="text-xs text-muted-foreground">{t.date}</div>
                      </li>
                    ))}
                  </ol>
                </div>
                <div className="rounded-xl bg-muted/40 p-4">
                  <div className="text-xs font-semibold uppercase text-muted-foreground">Assigned agent</div>
                  <div className="mt-2 text-sm font-medium">{a.agent.name}</div>
                  <div className="text-xs text-muted-foreground">{a.agent.email}</div>
                  <Button size="sm" variant="outline" className="mt-3 w-full"><Phone className="mr-2 h-4 w-4" />{a.agent.phone}</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
