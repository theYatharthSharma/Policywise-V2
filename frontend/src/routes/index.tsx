import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ShieldCheck, Award, Clock, Headphones, Search, MapPin, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PublicNav } from "@/components/layout/PublicNav";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { PolicyCard } from "@/components/policy/PolicyCard";
import { PremiumCalculator } from "@/components/calculator/PremiumCalculator";
import { policyService } from "@/services/policy.service";
import { TRUST_STATS, CATEGORIES } from "@/data/mockData";
import { FloatingChat } from "@/components/chat/FloatingChat";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PolicyWise — Secure Your Future" },
      { name: "description", content: "Explore insurance policies, calculate premiums instantly, apply online and manage your insurance in one modern dashboard." },
    ],
  }),
  component: Index,
});

function Index() {
  const { data: featured = [] } = useQuery({ queryKey: ["policies", "featured"], queryFn: policyService.featured });
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");

  const search = (e: React.FormEvent) => { e.preventDefault(); navigate({ to: "/policies", search: { q, category: cat } as never }); };

  return (
    <div className="flex min-h-screen flex-col">
      <PublicNav />

      {/* HERO */}
      <section className="relative overflow-hidden bg-hero-gradient">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:py-28">
          <div>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1 text-xs font-medium text-primary backdrop-blur">
              <ShieldCheck className="h-3.5 w-3.5" /> Trusted by 250M+ policyholders
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mt-5 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl">
              Secure your future <span className="bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent">with PolicyWise</span>.
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-4 max-w-xl text-lg text-muted-foreground">
              Compare policies, calculate premiums in seconds, and apply online — all in a modern, customer-first experience.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full px-6"><Link to="/policies">Explore Policies <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
              <Button asChild size="lg" variant="outline" className="rounded-full px-6"><Link to="/calculator">Calculate Premium</Link></Button>
            </motion.div>

            {/* Search bar */}
            <motion.form onSubmit={search} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-8 grid gap-2 rounded-2xl border bg-background/80 p-2 shadow-sm backdrop-blur sm:grid-cols-[1fr_auto_auto]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search policies by name, benefit or goal" className="h-11 border-0 pl-9 focus-visible:ring-0" />
              </div>
              <Select value={cat} onValueChange={setCat}>
                <SelectTrigger className="h-11 min-w-[140px] border-0 bg-muted/40"><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {CATEGORIES.map((c) => <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button type="submit" size="lg" className="rounded-xl">Search</Button>
            </motion.form>
          </div>

          {/* Illustration card */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="relative hidden lg:block">
            <Card className="relative overflow-hidden rounded-3xl border-border/60 p-6 card-elevated">
              <div className="absolute inset-0 bg-hero-gradient opacity-70" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-widest text-primary">Illustration</div>
                    <div className="mt-1 text-lg font-semibold">Your protection at a glance</div>
                  </div>
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary text-primary-foreground"><ShieldCheck className="h-5 w-5" /></div>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  {[
                    { l: "Cover", v: "₹50,00,000" },
                    { l: "Premium/mo", v: "₹1,250" },
                    { l: "Term", v: "25 years" },
                    { l: "Category", v: "Term Plan" },
                  ].map((k) => (
                    <div key={k.l} className="rounded-2xl bg-background/80 p-4">
                      <div className="text-[11px] text-muted-foreground">{k.l}</div>
                      <div className="mt-1 text-lg font-semibold">{k.v}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 rounded-2xl bg-background/80 p-4">
                  <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground"><span>Application progress</span><span>72%</span></div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <motion.div initial={{ width: 0 }} animate={{ width: "72%" }} transition={{ duration: 1.2, delay: 0.3 }} className="h-full bg-primary" />
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-primary">Featured</div>
            <h2 className="mt-1 text-3xl font-bold">Policies loved by our customers</h2>
          </div>
          <Button asChild variant="ghost"><Link to="/policies">View all <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {featured.slice(0, 3).map((p) => <PolicyCard key={p.id} policy={p} />)}
        </div>
      </section>

      {/* Why choose */}
      <section className="bg-muted/30 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-xs uppercase tracking-widest text-primary">Why PolicyWise</div>
            <h2 className="mt-1 text-3xl font-bold">A partner you can trust for life</h2>
            <p className="mt-3 text-muted-foreground">India's largest insurer, now with a modern digital experience built for you.</p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-4">
            {[
              { icon: ShieldCheck, title: "Security first", desc: "Bank-grade protection for your personal data." },
              { icon: Award, title: "Largest insurer", desc: "Over 6 decades of trusted service in India." },
              { icon: Headphones, title: "24/7 support", desc: "Talk to a real agent whenever you need." },
              { icon: Clock, title: "Fast claims", desc: "98.6% claim settlement ratio, industry leading." },
            ].map((f) => (
              <Card key={f.title} className="rounded-2xl border-border/60 p-6 card-elevated">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary"><f.icon className="h-5 w-5" /></div>
                <div className="mt-4 font-semibold">{f.title}</div>
                <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Calculator preview */}
      <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6">
        <div className="grid items-start gap-10 lg:grid-cols-2">
          <div>
            <div className="text-xs uppercase tracking-widest text-primary">Instant estimate</div>
            <h2 className="mt-1 text-3xl font-bold">Know your premium in seconds</h2>
            <p className="mt-3 max-w-lg text-muted-foreground">Adjust age, term and sum assured to see an estimate across monthly, quarterly, half-yearly and yearly frequencies.</p>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {TRUST_STATS.map((s) => (
                <div key={s.label} className="rounded-2xl border bg-background p-4">
                  <div className="text-2xl font-bold text-primary">{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <PremiumCalculator compact />
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="bg-muted/30 py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <div className="text-xs uppercase tracking-widest text-primary">Contact</div>
            <h2 className="mt-1 text-3xl font-bold">We're here to help</h2>
            <p className="mt-3 text-muted-foreground">Speak with an expert or visit your nearest branch.</p>
            <div className="mt-6 space-y-3 text-sm">
              <div className="flex items-center gap-3"><Mail className="h-4 w-4 text-primary" /> support@policywise.demo</div>
              <div className="flex items-center gap-3"><Phone className="h-4 w-4 text-primary" /> 1800-123-4567</div>
              <div className="flex items-center gap-3"><MapPin className="h-4 w-4 text-primary" /> Yogakshema, Mumbai — 400021</div>
            </div>
          </div>
          <Card className="rounded-2xl border-border/60 p-6 lg:col-span-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className="text-xs font-medium text-muted-foreground">Full name</label><Input className="mt-1" placeholder="Your name" /></div>
              <div><label className="text-xs font-medium text-muted-foreground">Email</label><Input className="mt-1" type="email" placeholder="you@example.com" /></div>
              <div className="sm:col-span-2"><label className="text-xs font-medium text-muted-foreground">Message</label><Input className="mt-1" placeholder="How can we help?" /></div>
            </div>
            <div className="mt-4 flex justify-end"><Button>Send message</Button></div>
            <div className="mt-6 h-32 w-full rounded-xl bg-hero-gradient" aria-hidden />
          </Card>
        </div>
      </section>

      <PublicFooter />
      <FloatingChat />
    </div>
  );
}
