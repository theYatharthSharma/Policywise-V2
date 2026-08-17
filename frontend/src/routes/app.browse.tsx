import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PolicyCard } from "@/components/policy/PolicyCard";
import { ListSkeleton } from "@/components/common/LoadingSkeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { policyService } from "@/services";
import { CATEGORIES } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { z } from "zod";

export const Route = createFileRoute("/app/browse")({
  head: () => ({ meta: [{ title: "Browse Policies — PolicyWise" }, { name: "description", content: "Browse and filter all insurance policies from your customer dashboard." }] }),
  validateSearch: (s) => z.object({ q: z.string().optional() }).parse(s),
  component: BrowsePage,
});

function BrowsePage() {
  const { q: initQ = "" } = Route.useSearch();
  const [q, setQ] = useState(initQ);
  const [cat, setCat] = useState("all");
  const [sort, setSort] = useState("popular");

  const { data = [], isLoading } = useQuery({ queryKey: ["policies", "app", q, cat], queryFn: () => policyService.search(q, { category: cat }) });
  const sorted = useMemo(() => {
    const s = [...data];
    if (sort === "popular") s.sort((a, b) => b.popularity - a.popularity);
    if (sort === "rating") s.sort((a, b) => b.rating - a.rating);
    if (sort === "name") s.sort((a, b) => a.name.localeCompare(b.name));
    return s;
  }, [data, sort]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Browse policies</h1>
        <p className="text-sm text-muted-foreground">Find the right plan for your goals.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-[1fr_180px_180px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search policies…" className="pl-9" />
        </div>
        <Select value={cat} onValueChange={setCat}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {CATEGORIES.map((c) => <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="popular">Most popular</SelectItem>
            <SelectItem value="rating">Highest rated</SelectItem>
            <SelectItem value="name">Name (A–Z)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <Badge onClick={() => setCat("all")} className={cn("cursor-pointer", cat === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>All</Badge>
        {CATEGORIES.map((c) => (
          <Badge key={c.key} onClick={() => setCat(c.key)} className={cn("cursor-pointer", cat === c.key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>{c.label}</Badge>
        ))}
      </div>
      {isLoading ? <ListSkeleton /> : sorted.length === 0 ? (
        <EmptyState icon={<Search className="h-6 w-6" />} title="Nothing found" description="Try broadening your search." />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {sorted.map((p) => <PolicyCard key={p.id} policy={p} />)}
        </div>
      )}
    </div>
  );
}
