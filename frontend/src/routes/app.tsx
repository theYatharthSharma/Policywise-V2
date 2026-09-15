import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { FloatingChat } from "@/components/chat/FloatingChat";
import { useAuth } from "@/context/AuthContext";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

function AppLayout() {
  const { user, ready } = useAuth();
  const navigate = useNavigate();
  useEffect(() => { if (ready && !user) navigate({ to: "/login" }); }, [ready, user, navigate]);
  if (!ready) return null;
  return (
    <AppShell>
      <Outlet />
      <FloatingChat />
    </AppShell>
  );
}
