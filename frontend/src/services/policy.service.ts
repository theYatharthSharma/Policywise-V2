import { apiFetch } from "@/lib/api";
import type { Policy } from "@/types";

// Raw shape returned by the FastAPI backend (snake_case)
interface PolicyApiShape {
  id: string;
  name: string;
  code: string;
  category: string;
  tagline: string;
  description: string;
  min_age: number;
  max_age: number;
  min_term: number;
  max_term: number;
  min_sum_assured: number;
  benefits: string[];
  eligibility: string[];
  documents: string[];
  featured: boolean;
  image?: string | null;
  rating: number;
  popularity: number;
}

function toPolicy(p: PolicyApiShape): Policy {
  return {
    id: p.id,
    name: p.name,
    code: p.code,
    category: p.category as Policy["category"],
    tagline: p.tagline,
    description: p.description,
    minAge: p.min_age,
    maxAge: p.max_age,
    minTerm: p.min_term,
    maxTerm: p.max_term,
    minSumAssured: p.min_sum_assured,
    benefits: p.benefits,
    eligibility: p.eligibility,
    documents: p.documents,
    featured: p.featured,
    image: p.image ?? undefined,
    rating: p.rating,
    popularity: p.popularity,
  };
}

export const policyService = {
  list: async (): Promise<Policy[]> => {
    const data = await apiFetch<PolicyApiShape[]>("/policies");
    return data.map(toPolicy);
  },
  featured: async (): Promise<Policy[]> => {
    const data = await apiFetch<PolicyApiShape[]>("/policies/featured");
    return data.map(toPolicy);
  },
  get: async (id: string): Promise<Policy | undefined> => {
    try {
      const data = await apiFetch<PolicyApiShape>(`/policies/${id}`);
      return toPolicy(data);
    } catch {
      return undefined;
    }
  },
  related: async (id: string): Promise<Policy[]> => {
    const data = await apiFetch<PolicyApiShape[]>(`/policies/${id}/related`);
    return data.map(toPolicy);
  },
  search: async (q: string, filters?: { category?: string; age?: number }): Promise<Policy[]> => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (filters?.category && filters.category !== "all") params.set("category", filters.category);
    if (filters?.age) params.set("age", String(filters.age));
    const data = await apiFetch<PolicyApiShape[]>(`/policies?${params.toString()}`);
    return data.map(toPolicy);
  },
};
