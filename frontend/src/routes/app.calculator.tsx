import { createFileRoute } from "@tanstack/react-router";
import { PremiumCalculator } from "@/components/calculator/PremiumCalculator";

export const Route = createFileRoute("/app/calculator")({
  head: () => ({ meta: [{ title: "Premium Calculator — PolicyWise" }, { name: "description", content: "Calculate insurance premiums instantly across all payment frequencies." }] }),
  component: () => (
    <div className="space-y-4">
      <div><h1 className="text-2xl font-bold">Premium calculator</h1><p className="text-sm text-muted-foreground">Estimate your premium for any insurance plan.</p></div>
      <PremiumCalculator />
    </div>
  ),
});
