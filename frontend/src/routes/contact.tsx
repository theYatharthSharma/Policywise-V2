import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import { PublicNav } from "@/components/layout/PublicNav";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FAQS } from "@/data/mockData";
import { toast } from "sonner";
import { FloatingChat } from "@/components/chat/FloatingChat";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact & Support — PolicyWise" },
      { name: "description", content: "Get in touch with PolicyWise support. Contact form, FAQ, phone and email." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicNav />
      <section className="border-b bg-hero-gradient">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <div className="text-xs uppercase tracking-widest text-primary">Support</div>
          <h1 className="mt-1 text-3xl font-bold sm:text-4xl">We're here to help</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">FAQs, direct contact, or a message — whichever works best for you.</p>
        </div>
      </section>
      <section className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_1fr]">
        <div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { icon: Phone, label: "Call", v: "1800-123-4567" },
              { icon: Mail, label: "Email", v: "support@policywise.demo" },
              { icon: MapPin, label: "Office", v: "Yogakshema, Mumbai" },
            ].map((c) => (
              <Card key={c.label} className="rounded-2xl p-5">
                <c.icon className="h-5 w-5 text-primary" />
                <div className="mt-2 text-xs text-muted-foreground">{c.label}</div>
                <div className="text-sm font-semibold">{c.v}</div>
              </Card>
            ))}
          </div>
          <div className="mt-6">
            <h3 className="mb-3 text-sm font-semibold">FAQ</h3>
            <Accordion type="single" collapsible className="rounded-2xl border bg-card">
              {FAQS.map((f, i) => (
                <AccordionItem key={f.q} value={String(i)} className="px-4">
                  <AccordionTrigger className="text-left text-sm">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
        <Card className="rounded-2xl p-6">
          <div className="text-sm font-semibold">Send us a message</div>
          <form onSubmit={(e) => { e.preventDefault(); toast.success("Message sent!", { description: "We'll get back within one business day." }); }} className="mt-4 grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className="text-xs text-muted-foreground">Name</label><Input className="mt-1" required /></div>
              <div><label className="text-xs text-muted-foreground">Email</label><Input type="email" className="mt-1" required /></div>
            </div>
            <div><label className="text-xs text-muted-foreground">Subject</label><Input className="mt-1" /></div>
            <div><label className="text-xs text-muted-foreground">Message</label><Textarea rows={5} className="mt-1" required /></div>
            <div className="flex justify-end"><Button type="submit">Send message</Button></div>
          </form>
          <div className="mt-6 h-40 w-full rounded-xl bg-hero-gradient" aria-hidden />
        </Card>
      </section>
      <PublicFooter />
      <FloatingChat />
    </div>
  );
}
