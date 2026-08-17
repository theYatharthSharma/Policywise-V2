import { createFileRoute } from "@tanstack/react-router";
import { PublicNav } from "@/components/layout/PublicNav";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { PremiumCalculator } from "@/components/calculator/PremiumCalculator";
import { FloatingChat } from "@/components/chat/FloatingChat";

export const Route = createFileRoute("/calculator")({
  head: () => ({
    meta: [
      { title: "Premium Calculator — PolicyWise" },
      { name: "description", content: "Estimate insurance policy premiums across monthly, quarterly, half-yearly and yearly payment frequencies." },
    ],
  }),
  component: CalcPage,
});

function CalcPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicNav />
      <section className="border-b bg-hero-gradient">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <div className="text-xs uppercase tracking-widest text-primary">Calculator</div>
          <h1 className="mt-1 text-3xl font-bold sm:text-4xl">Premium calculator</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">See an instant premium estimate. Adjust age, term and sum assured — no signup needed.</p>
        </div>
      </section>
      <section className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6"><PremiumCalculator /></section>
      <PublicFooter />
      <FloatingChat />
    </div>
  );
}
