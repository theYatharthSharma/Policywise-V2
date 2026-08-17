import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, FileText, MessageCircle, Phone, ShieldCheck, Sparkles } from "lucide-react";
import { PublicNav } from "@/components/layout/PublicNav";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { policyService } from "@/services/policy.service";
import { applicationService } from "@/services";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PolicyCard } from "@/components/policy/PolicyCard";
import { PremiumCalculator } from "@/components/calculator/PremiumCalculator";
import { toast } from "sonner";
import { FloatingChat } from "@/components/chat/FloatingChat";
import { useAuth } from "@/context/AuthContext";

export const Route = createFileRoute("/policies/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.id} — Policy Details` },
      { name: "description", content: "View benefits, eligibility, documents required and estimate premium for this policy." },
    ],
  }),
  component: PolicyDetails,
});

function PolicyDetails() {
  const { id } = Route.useParams();
  const { data: policy, isLoading } = useQuery({ queryKey: ["policy", id], queryFn: () => policyService.get(id) });
  const { data: related = [] } = useQuery({ queryKey: ["policy", id, "related"], queryFn: () => policyService.related(id) });
  const { user } = useAuth();
  const navigate = useNavigate();

  const apply = async () => {
    if (!user) { toast.info("Please log in to apply"); navigate({ to: "/login" }); return; }
    if (!policy) return;
    try {
      await applicationService.create(policy.id);
      toast.success("Application started", { description: "An agent will contact you within 24 hours." });
      navigate({ to: "/app/applications" });
    } catch (err) {
      toast.error("Couldn't submit application", { description: err instanceof Error ? err.message : undefined });
    }
  };

  if (isLoading || !policy) return (
    <div className="flex min-h-screen flex-col"><PublicNav /><div className="mx-auto max-w-7xl px-4 py-20">Loading…</div></div>
  );

  return (
    <div className="flex min-h-screen flex-col">
      <PublicNav />

      <section className="relative overflow-hidden bg-hero-gradient">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <Button asChild variant="ghost" size="sm" className="mb-4"><Link to="/policies"><ArrowLeft className="mr-1 h-4 w-4" /> Back to policies</Link></Button>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Badge className="bg-primary/10 text-primary">{policy.category}</Badge>
            <span className="text-muted-foreground">Code: {policy.code}</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">★ {policy.rating.toFixed(1)}</span>
          </div>
          <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">{policy.name}</motion.h1>
          <p className="mt-3 max-w-3xl text-muted-foreground">{policy.description}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button size="lg" onClick={apply}><Sparkles className="mr-2 h-4 w-4" />Apply now</Button>
            <Button size="lg" variant="outline"><Phone className="mr-2 h-4 w-4" />Contact agent</Button>
            <Button size="lg" variant="ghost"><MessageCircle className="mr-2 h-4 w-4" />Ask AI</Button>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_380px]">
        <div>
          <Tabs defaultValue="benefits">
            <TabsList>
              <TabsTrigger value="benefits">Benefits</TabsTrigger>
              <TabsTrigger value="eligibility">Eligibility</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>
            <TabsContent value="benefits">
              <Card className="rounded-2xl p-6">
                <ul className="grid gap-3 sm:grid-cols-2">
                  {policy.benefits.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm"><CheckCircle2 className="mt-0.5 h-4 w-4 text-success" /> {b}</li>
                  ))}
                </ul>
              </Card>
            </TabsContent>
            <TabsContent value="eligibility">
              <Card className="rounded-2xl p-6">
                <ul className="space-y-2">
                  {policy.eligibility.map((e) => (
                    <li key={e} className="flex items-start gap-2 text-sm"><ShieldCheck className="mt-0.5 h-4 w-4 text-primary" /> {e}</li>
                  ))}
                </ul>
              </Card>
            </TabsContent>
            <TabsContent value="documents">
              <Card className="rounded-2xl p-6">
                <ul className="space-y-2">
                  {policy.documents.map((d) => (
                    <li key={d} className="flex items-start gap-2 text-sm"><FileText className="mt-0.5 h-4 w-4 text-muted-foreground" /> {d}</li>
                  ))}
                </ul>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-10">
            <h2 className="mb-4 text-xl font-semibold">Related policies</h2>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {related.map((p) => <PolicyCard key={p.id} policy={p} />)}
            </div>
          </div>
        </div>
        <aside className="space-y-4">
          <PremiumCalculator compact />
          <Card className="rounded-2xl p-5">
            <div className="text-sm font-semibold">Talk to an agent</div>
            <p className="mt-1 text-xs text-muted-foreground">Get personalised advice from a certified insurance advisor.</p>
            <Button className="mt-3 w-full" variant="outline"><Phone className="mr-2 h-4 w-4" /> Request callback</Button>
          </Card>
        </aside>
      </section>

      <PublicFooter />
      <FloatingChat />
    </div>
  );
}
