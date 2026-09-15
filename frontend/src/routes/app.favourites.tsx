import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { PolicyCard } from "@/components/policy/PolicyCard";
import { EmptyState } from "@/components/common/EmptyState";
import { favouriteService } from "@/services";
import { POLICIES } from "@/data/mockData";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/app/favourites")({
  head: () => ({ meta: [{ title: "Favourite Policies — PolicyWise" }, { name: "description", content: "Your saved policies for easy access and comparison." }] }),
  component: FavouritesPage,
});

function FavouritesPage() {
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => { setIds(favouriteService.list()); }, []);
  const items = POLICIES.filter((p) => ids.includes(p.id));

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Favourite policies</h1><p className="text-sm text-muted-foreground">Your saved plans, all in one place.</p></div>
      {items.length === 0 ? (
        <EmptyState icon={<Heart className="h-6 w-6" />} title="No favourites yet" description="Tap the heart on any policy to save it here."
          action={<Button asChild className="mt-4"><Link to="/app/browse">Browse policies</Link></Button>} />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((p) => <PolicyCard key={p.id} policy={p} onToggleFav={() => setIds(favouriteService.list())} />)}
        </div>
      )}
    </div>
  );
}
