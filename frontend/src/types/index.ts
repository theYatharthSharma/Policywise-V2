export type PolicyCategory = "Term" | "Endowment" | "ULIP" | "Pension" | "Child" | "Health";

export interface Policy {
  id: string;
  name: string;
  code: string;
  category: PolicyCategory;
  tagline: string;
  description: string;
  minAge: number;
  maxAge: number;
  minTerm: number;
  maxTerm: number;
  minSumAssured: number;
  benefits: string[];
  eligibility: string[];
  documents: string[];
  featured?: boolean;
  image?: string;
  rating: number;
  popularity: number;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  nominee?: string;
  avatarUrl?: string;
}

export interface Application {
  id: string;
  policyId: string;
  policyName: string;
  status: "Pending" | "Approved" | "Rejected" | "Under Review";
  appliedDate: string;
  agent: { name: string; phone: string; email: string };
  timeline: { label: string; date: string; done: boolean }[];
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: "info" | "success" | "warning";
  read: boolean;
  date: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  sources?: { title: string; url?: string }[];
}

export interface PremiumInput {
  age: number;
  gender: "Male" | "Female" | "Other";
  policyId?: string;
  term: number;
  sumAssured: number;
}

export interface PremiumEstimate {
  yearly: number;
  halfYearly: number;
  quarterly: number;
  monthly: number;
}
