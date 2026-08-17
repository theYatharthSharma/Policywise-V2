import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Grid3x3, List, Search, SlidersHorizontal } from "lucide-react";
import { z } from "zod";
import { PublicNav } from "@/components/layout/PublicNav";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { PolicyCard } from "@/components/policy/PolicyCard";
import { policyService } from "@/services/policy.service";
import { CATEGORIES } from "@/data/mockData";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { EmptyState } from "@/components/common/EmptyState";
import { ListSkeleton } from "@/components/common/LoadingSkeleton";
import { FloatingChat } from "@/components/chat/FloatingChat";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const searchSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
});

export const Route = createFileRoute("/policies")({
  head: () => ({
    meta: [
      { title: "Browse Insurance Policies — PolicyWise" },
      { name: "description", content: "Search, filter and compare insurance policies across term, endowment, ULIP, pension, child and health categories." },
    ],
  }),
  validateSearch: (s) => searchSchema.parse(s),
  component: PoliciesPage,
});

function PoliciesPage() {
  const { q: qInit = "", category: catInit = "all" } = Route.useSearch();
  const [q, setQ] = useState(qInit);
  const [category, setCategory] = useState(catInit);
  const [age, setAge] = useState<number | null>(null);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sort, setSort] = useState("popular");
  const navigate = useNavigate();

  const { data = [], isLoading } = useQuery({
    queryKey: ["policies", q, category, age],
    queryFn: () => policyService.search(q, { category, age: age || undefined }),
  });

  const sorted = useMemo(() => {
    const s = [...data];
    if (sort === "popular") s.sort((a, b) => b.popularity - a.popularity);
    if (sort === "rating") s.sort((a, b) => b.rating - a.rating);
    if (sort === "name") s.sort((a, b) => a.name.localeCompare(b.name));
    return s;
  }, [data, sort]);

  return (
    <div className="flex min-h-screen flex-col">
      <PublicNav />
      <section className="border-b bg-hero-gradient">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <div className="text-xs uppercase tracking-widest text-primary">Policies</div>
          <h1 className="mt-1 text-3xl font-bold sm:text-4xl">Find the right insurance policy for you</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">Browse across categories, filter by age and premium, and save favourites to compare later.</p>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[280px_1fr]">
        {/* Filters */}
        <Card className="h-fit rounded-2xl border-border/60 p-5">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold"><SlidersHorizontal className="h-4 w-4" /> Filters</div>
          <div className="space-y-5">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Search</label>
              <div className="relative mt-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={q} onChange={(e) => { setQ(e.target.value); navigate({ to: "/policies", search: { q: e.target.value, category } as never, replace: true }); }} className="pl-9" placeholder="Search…" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Category</label>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Badge onClick={() => setCategory("all")} className={cn("cursor-pointer", category === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>All</Badge>
                {CATEGORIES.map((c) => (
                  <Badge key={c.key} onClick={() => setCategory(c.key)} className={cn("cursor-pointer", category === c.key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>{c.label}</Badge>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between"><label className="text-xs font-medium text-muted-foreground">Age</label><span className="text-xs">{age ?? "Any"}</span></div>
              <Slider value={[age ?? 0]} min={0} max={80} step={1} onValueChange={(v) => setAge(v[0] || null)} className="mt-2" />
            </div>
            <Button variant="outline" className="w-full" onClick={() => { setQ(""); setCategory("all"); setAge(null); }}>Reset filters</Button>
          </div>
        </Card>

        <div>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-muted-foreground">{sorted.length} policies found</div>
            <div className="flex items-center gap-2">
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="h-9 w-[160px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Most popular</SelectItem>
                  <SelectItem value="rating">Highest rated</SelectItem>
                  <SelectItem value="name">Name (A–Z)</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex overflow-hidden rounded-md border">
                <button aria-label="Grid view" onClick={() => setView("grid")} className={cn("px-2 py-1.5", view === "grid" && "bg-muted")}><Grid3x3 className="h-4 w-4" /></button>
                <button aria-label="List view" onClick={() => setView("list")} className={cn("px-2 py-1.5", view === "list" && "bg-muted")}><List className="h-4 w-4" /></button>
              </div>
            </div>
          </div>

          {isLoading ? (
            <ListSkeleton />
          ) : sorted.length === 0 ? (
            <EmptyState icon={<Search className="h-6 w-6" />} title="No policies match your filters" description="Try adjusting search terms or clearing filters." />
          ) : view === "grid" ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {sorted.map((p) => <PolicyCard key={p.id} policy={p} />)}
            </div>
          ) : (
            <div className="space-y-3">
              {sorted.map((p) => (
                <Card key={p.id} className="flex items-center gap-4 rounded-2xl border-border/60 p-4">
                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary text-sm font-semibold">{p.code.split("-")[1]}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2"><span className="font-semibold">{p.name}</span><Badge className="bg-muted text-muted-foreground">{p.category}</Badge></div>
                    <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">{p.tagline}</p>
                  </div>
                  <Button asChild size="sm"><a href={`/policies/${p.id}`}>View</a></Button>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <PublicFooter />
      <FloatingChat />
    </div>
  );
}
