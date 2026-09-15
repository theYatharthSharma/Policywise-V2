import { WifiOff } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/**
 * Shown when a useQuery fails (e.g. the backend API is unreachable),
 * instead of silently falling back to an empty list. Distinct from the
 * router's notFoundComponent (wrong URL) and errorComponent (render
 * crash) in __root.tsx — this covers the "data fetch failed" case those
 * two don't catch, since these queries run client-side in the component
 * body rather than in a route loader.
 */
export function ConnectionErrorState({
  onRetry,
  title = "Couldn't load this",
  description = "We couldn't reach the server. Check that the API is running and try again.",
}: {
  onRetry: () => void;
  title?: string;
  description?: string;
}) {
  return (
    <Card className="flex flex-col items-center justify-center gap-3 rounded-2xl border-dashed p-12 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-destructive/10 text-destructive">
        <WifiOff className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      <Button variant="outline" onClick={onRetry}>Try again</Button>
    </Card>
  );
}
