import { Card } from "@/components/ui/card";
import type { ReactNode } from "react";

export function EmptyState({ icon, title, description, action }: { icon?: ReactNode; title: string; description?: string; action?: ReactNode }) {
  return (
    <Card className="flex flex-col items-center justify-center gap-3 rounded-2xl border-dashed p-12 text-center">
      {icon && <div className="grid h-14 w-14 place-items-center rounded-2xl bg-muted text-muted-foreground">{icon}</div>}
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && <p className="max-w-md text-sm text-muted-foreground">{description}</p>}
      {action}
    </Card>
  );
}
