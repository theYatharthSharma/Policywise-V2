import { apiFetch } from "@/lib/api";
import type { PremiumEstimate, PremiumInput } from "@/types";

interface PremiumEstimateApiShape {
  yearly: number;
  half_yearly: number;
  quarterly: number;
  monthly: number;
  formula_version: string;
}

export const calculatorService = {
  estimate: async (input: PremiumInput): Promise<PremiumEstimate> => {
    if (!input.policyId) {
      throw new Error("A policy must be selected to estimate premium");
    }
    const data = await apiFetch<PremiumEstimateApiShape>("/calculator/estimate", {
      method: "POST",
      body: {
        age: input.age,
        gender: input.gender,
        policy_id: input.policyId,
        term: input.term,
        sum_assured: input.sumAssured,
      },
    });
    return {
      yearly: data.yearly,
      halfYearly: data.half_yearly,
      quarterly: data.quarterly,
      monthly: data.monthly,
    };
  },
};
