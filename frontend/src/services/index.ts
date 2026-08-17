export { policyService } from "./policy.service";
export { calculatorService } from "./calculator.service";
export { authService } from "./auth.service";
export { chatService } from "./chat.service";

import { apiFetch } from "@/lib/api";
import type { Application, AppNotification } from "@/types";

interface ApplicationApiShape {
  id: string;
  policy_id: string;
  policy_name: string;
  status: Application["status"];
  applied_date: string;
  agent_name?: string | null;
  agent_phone?: string | null;
  agent_email?: string | null;
  timeline: { label: string; date: string; done: boolean }[];
}

function toApplication(a: ApplicationApiShape): Application {
  return {
    id: a.id,
    policyId: a.policy_id,
    policyName: a.policy_name,
    status: a.status,
    appliedDate: a.applied_date,
    agent: { name: a.agent_name ?? "—", phone: a.agent_phone ?? "—", email: a.agent_email ?? "—" },
    timeline: a.timeline,
  };
}

export const applicationService = {
  list: async (): Promise<Application[]> => {
    const data = await apiFetch<ApplicationApiShape[]>("/applications", { auth: true });
    return data.map(toApplication);
  },
  create: async (policyId: string): Promise<Application> => {
    const data = await apiFetch<ApplicationApiShape>("/applications", {
      method: "POST",
      auth: true,
      body: { policy_id: policyId },
    });
    return toApplication(data);
  },
};

interface NotificationApiShape {
  id: string;
  title: string;
  body: string;
  type: AppNotification["type"];
  read: boolean;
  date: string;
}

function toNotification(n: NotificationApiShape): AppNotification {
  return { id: n.id, title: n.title, body: n.body, type: n.type, read: n.read, date: n.date };
}

export const notificationService = {
  list: async (): Promise<AppNotification[]> => {
    const data = await apiFetch<NotificationApiShape[]>("/notifications", { auth: true });
    return data.map(toNotification);
  },
  markRead: async (id: string): Promise<AppNotification> => {
    const data = await apiFetch<NotificationApiShape>(`/notifications/${id}/read`, {
      method: "PATCH",
      auth: true,
    });
    return toNotification(data);
  },
};

// Favourites stay on localStorage for now — they don't need a login to use,
// and several components call these methods synchronously. Wire this up to
// GET/POST/DELETE /favourites (already built on the backend) once you want
// favourites to persist per-account instead of per-browser.
const FAV_KEY = "lic.favourites";
export const favouriteService = {
  list: (): string[] => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(window.localStorage.getItem(FAV_KEY) || "[]"); } catch { return []; }
  },
  toggle: (id: string): string[] => {
    const curr = favouriteService.list();
    const next = curr.includes(id) ? curr.filter((x) => x !== id) : [...curr, id];
    window.localStorage.setItem(FAV_KEY, JSON.stringify(next));
    return next;
  },
  has: (id: string) => favouriteService.list().includes(id),
};
