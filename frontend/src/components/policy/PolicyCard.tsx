import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Heart, ShieldCheck, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { favouriteService } from "@/services";
import type { Policy } from "@/types";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface Props { policy: Policy; onToggleFav?: (id: string) => void; }

export function PolicyCard({ policy, onToggleFav }: Props) {
  const [fav, setFav] = useState(false);
  useEffect(() => { setFav(favouriteService.has(policy.id)); }, [policy.id]);

  const toggle = () => {
    favouriteService.toggle(policy.id);
    setFav((v) => !v);
    onToggleFav?.(policy.id);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -3 }} transition={{ duration: 0.25 }}>
      <Card className="group relative flex h-full flex-col overflow-hidden rounded-2xl border-border/60 p-0 card-elevated">
        <div className="relative h-32 overflow-hidden bg-hero-gradient">
          <div className="absolute left-4 top-4 flex items-center gap-2">
            <Badge className="bg-white/80 text-primary shadow-sm dark:bg-white/10">{policy.category}</Badge>
            {policy.featured && <Badge className="bg-warning/90 text-warning-foreground"><Sparkles className="mr-1 h-3 w-3" />Popular</Badge>}
          </div>
          <button aria-label="Save policy" onClick={toggle} className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-background/70 backdrop-blur transition hover:scale-105">
            <Heart className={cn("h-4 w-4", fav ? "fill-destructive text-destructive" : "text-muted-foreground")} />
          </button>
          <div className="absolute bottom-3 left-4 flex items-center gap-2 text-xs text-primary/80">
            <ShieldCheck className="h-4 w-4" /> {policy.code}
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-3 p-5">
          <div>
            <h3 className="text-lg font-semibold leading-tight">{policy.name}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{policy.tagline}</p>
          </div>
          <ul className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <li>Age: <span className="text-foreground">{policy.minAge}–{policy.maxAge}</span></li>
            <li>Term: <span className="text-foreground">{policy.minTerm}–{policy.maxTerm}y</span></li>
            <li className="col-span-2">Min cover: <span className="text-foreground">₹{policy.minSumAssured.toLocaleString("en-IN")}</span></li>
          </ul>
          <div className="mt-auto flex items-center justify-between pt-2">
            <div className="text-xs text-muted-foreground">★ {policy.rating.toFixed(1)} · {policy.popularity}% popularity</div>
            <Button asChild size="sm" variant="ghost" className="text-primary hover:text-primary">
              <Link to="/policies/$id" params={{ id: policy.id }}>View <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
