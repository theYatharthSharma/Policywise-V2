import type { Policy, Application, AppNotification, ChatMessage } from "@/types";

export const POLICIES: Policy[] = [
  {
    id: "jeevan-anand",
    code: "LIC-915",
    name: "LIC Jeevan Anand",
    category: "Endowment",
    tagline: "Lifetime protection with guaranteed savings",
    description:
      "A participating non-linked plan offering an attractive combination of protection and savings, with cover continuing throughout life after the policy term.",
    minAge: 18, maxAge: 50, minTerm: 15, maxTerm: 35, minSumAssured: 100000,
    benefits: ["Guaranteed additions", "Whole-life coverage", "Loan facility", "Tax benefits under 80C & 10(10D)"],
    eligibility: ["Age 18–50 years", "Minimum sum assured ₹1,00,000", "Medical check-up may apply"],
    documents: ["Aadhaar / PAN", "Address proof", "Income proof", "Recent photograph"],
    featured: true, rating: 4.7, popularity: 92,
  },
  {
    id: "tech-term",
    code: "LIC-854",
    name: "LIC Tech Term",
    category: "Term",
    tagline: "Pure protection at affordable premiums",
    description: "A non-linked, non-participating online term insurance plan providing financial protection to the insured's family in case of unfortunate demise.",
    minAge: 18, maxAge: 65, minTerm: 10, maxTerm: 40, minSumAssured: 5000000,
    benefits: ["High cover, low premium", "Two benefit options", "Special rates for women", "Optional accident rider"],
    eligibility: ["Age 18–65 years", "Minimum cover ₹50,00,000"],
    documents: ["PAN", "Aadhaar", "Income proof", "Medical questionnaire"],
    featured: true, rating: 4.8, popularity: 96,
  },
  {
    id: "new-jeevan-shanti",
    code: "LIC-858",
    name: "New Jeevan Shanti",
    category: "Pension",
    tagline: "Guaranteed lifelong annuity income",
    description: "A single premium plan wherein the policyholder has an option of choosing Deferred Annuity for Single/Joint life.",
    minAge: 30, maxAge: 79, minTerm: 1, maxTerm: 12, minSumAssured: 150000,
    benefits: ["Guaranteed rates", "Deferment period", "Death benefit", "Loan available"],
    eligibility: ["Age 30–79 years", "Purchase price min ₹1,50,000"],
    documents: ["Aadhaar", "PAN", "Bank details"],
    featured: true, rating: 4.5, popularity: 78,
  },
  {
    id: "sanchay-plus",
    code: "LIC-865",
    name: "LIC Bima Jyoti",
    category: "Endowment",
    tagline: "Guaranteed additions every year",
    description: "A non-linked, non-participating, individual, limited premium payment life insurance savings plan.",
    minAge: 90, maxAge: 60, minTerm: 15, maxTerm: 20, minSumAssured: 100000,
    benefits: ["Guaranteed additions ₹50/₹1000", "Death & maturity benefit", "Rider options"],
    eligibility: ["Age 90 days – 60 years"],
    documents: ["Aadhaar", "PAN", "Address proof"],
    rating: 4.4, popularity: 71,
  },
  {
    id: "jeevan-tarun",
    code: "LIC-834",
    name: "LIC Jeevan Tarun",
    category: "Child",
    tagline: "Secure your child's future & dreams",
    description: "Specially designed to meet the educational and other needs of growing children through annual survival benefits.",
    minAge: 0, maxAge: 12, minTerm: 13, maxTerm: 25, minSumAssured: 75000,
    benefits: ["Survival benefits from age 20", "Maturity benefit at 25", "Optional premium waiver rider"],
    eligibility: ["Child age 90 days – 12 years"],
    documents: ["Child's birth certificate", "Parent's ID", "Address proof"],
    rating: 4.6, popularity: 82,
  },
  {
    id: "new-endowment",
    code: "LIC-914",
    name: "LIC New Endowment Plan",
    category: "Endowment",
    tagline: "Savings + protection made simple",
    description: "A participating non-linked plan offering an attractive combination of protection and saving features.",
    minAge: 8, maxAge: 55, minTerm: 12, maxTerm: 35, minSumAssured: 100000,
    benefits: ["Bonus additions", "Loan facility", "Rider options"],
    eligibility: ["Age 8–55 years"],
    documents: ["Aadhaar", "PAN", "Income proof"],
    rating: 4.3, popularity: 68,
  },
  {
    id: "cancer-cover",
    code: "LIC-905",
    name: "LIC Cancer Cover",
    category: "Health",
    tagline: "Comprehensive cover against cancer",
    description: "A regular premium payment health insurance plan providing financial protection in case of diagnosis of specified stages of cancer.",
    minAge: 20, maxAge: 65, minTerm: 10, maxTerm: 30, minSumAssured: 1000000,
    benefits: ["Early & major stage benefit", "Premium waiver", "Income benefit"],
    eligibility: ["Age 20–65 years"],
    documents: ["Medical reports", "Aadhaar", "PAN"],
    rating: 4.5, popularity: 74,
  },
  {
    id: "smart-pension",
    code: "LIC-879",
    name: "LIC Smart Pension",
    category: "Pension",
    tagline: "Retire with steady, guaranteed income",
    description: "A single premium annuity plan with multiple annuity options for individuals and NPS subscribers.",
    minAge: 18, maxAge: 100, minTerm: 1, maxTerm: 20, minSumAssured: 100000,
    benefits: ["Multiple annuity options", "Joint life option", "Top-up facility"],
    eligibility: ["Age 18+"],
    documents: ["Aadhaar", "PAN", "Bank proof"],
    rating: 4.4, popularity: 66,
  },
];

export const CATEGORIES: { key: string; label: string; icon: string }[] = [
  { key: "Term", label: "Term Insurance", icon: "shield" },
  { key: "Endowment", label: "Endowment", icon: "landmark" },
  { key: "ULIP", label: "ULIP", icon: "trending-up" },
  { key: "Pension", label: "Pension", icon: "wallet" },
  { key: "Child", label: "Child Plans", icon: "baby" },
  { key: "Health", label: "Health", icon: "heart-pulse" },
];

export const APPLICATIONS: Application[] = [
  {
    id: "APP-2024-0918",
    policyId: "jeevan-anand",
    policyName: "LIC Jeevan Anand",
    status: "Under Review",
    appliedDate: "2026-06-14",
    agent: { name: "Rohit Sharma", phone: "+91 98765 43210", email: "rohit.s@licindia.in" },
    timeline: [
      { label: "Application Submitted", date: "2026-06-14", done: true },
      { label: "Documents Verified", date: "2026-06-16", done: true },
      { label: "Medical Review", date: "2026-06-22", done: false },
      { label: "Policy Issuance", date: "—", done: false },
    ],
  },
  {
    id: "APP-2024-0771",
    policyId: "tech-term",
    policyName: "LIC Tech Term",
    status: "Approved",
    appliedDate: "2026-03-02",
    agent: { name: "Priya Nair", phone: "+91 90000 22112", email: "priya.n@licindia.in" },
    timeline: [
      { label: "Application Submitted", date: "2026-03-02", done: true },
      { label: "Documents Verified", date: "2026-03-04", done: true },
      { label: "Medical Review", date: "2026-03-10", done: true },
      { label: "Policy Issued", date: "2026-03-15", done: true },
    ],
  },
  {
    id: "APP-2024-0602",
    policyId: "jeevan-tarun",
    policyName: "LIC Jeevan Tarun",
    status: "Pending",
    appliedDate: "2026-07-10",
    agent: { name: "Amit Verma", phone: "+91 99887 55311", email: "amit.v@licindia.in" },
    timeline: [
      { label: "Application Submitted", date: "2026-07-10", done: true },
      { label: "Documents Verified", date: "—", done: false },
    ],
  },
];

export const NOTIFICATIONS: AppNotification[] = [
  { id: "n1", title: "Premium due in 5 days", body: "Your Jeevan Anand premium of ₹12,450 is due on 05 Aug.", type: "warning", read: false, date: "2026-07-21" },
  { id: "n2", title: "Application approved", body: "Your Tech Term application APP-2024-0771 has been approved.", type: "success", read: false, date: "2026-07-18" },
  { id: "n3", title: "New plan available", body: "Explore the newly launched Smart Pension plan for retirement.", type: "info", read: true, date: "2026-07-15" },
  { id: "n4", title: "Agent assigned", body: "Priya Nair is now assigned as your relationship manager.", type: "info", read: true, date: "2026-07-10" },
];

export const CHAT_STARTERS = [
  "Explain Jeevan Anand in simple terms",
  "Compare Tech Term vs New Endowment",
  "Recommend a policy for a 30-year-old parent",
  "What does 'sum assured' mean?",
];

export const CHAT_HISTORY_SEED: ChatMessage[] = [
  {
    id: "seed-1",
    role: "assistant",
    content: "Hi! I'm your PolicyWise assistant. Ask me anything about policies, premiums, claims or eligibility — I'll help you decide.",
    createdAt: new Date().toISOString(),
  },
];

export const TRUST_STATS = [
  { label: "Active Policies", value: "290M+" },
  { label: "Happy Customers", value: "250M+" },
  { label: "Years of Trust", value: "68+" },
  { label: "Claims Settled", value: "98.6%" },
];

export const FAQS = [
  { q: "How do I apply for a policy?", a: "Browse policies, pick one that fits, and click 'Apply'. Fill the guided form and upload documents — an agent will follow up in 24 hours." },
  { q: "Can I calculate my premium before applying?", a: "Yes. Use the Premium Calculator with your age, term and sum assured to see an instant estimate across payment frequencies." },
  { q: "How do I track my application?", a: "Head to 'My Applications' in your dashboard for real-time status and timeline." },
  { q: "Is my data secure?", a: "All personal data is encrypted in transit and at rest, following industry-standard security practices." },
];
