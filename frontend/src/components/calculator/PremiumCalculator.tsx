import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Calculator as CalcIcon, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { calculatorService } from "@/services/calculator.service";
import { formatCurrency } from "@/utils/format";
import { POLICIES } from "@/data/mockData";
import type { PremiumEstimate } from "@/types";

interface Props { compact?: boolean; }

export function PremiumCalculator({ compact }: Props) {
  const [age, setAge] = useState(30);
  const [gender, setGender] = useState<"Male" | "Female" | "Other">("Male");
  const [policyId, setPolicyId] = useState<string>("jeevan-anand");
  const [term, setTerm] = useState(20);
  const [sumAssured, setSumAssured] = useState(1000000);
  const [estimate, setEstimate] = useState<PremiumEstimate | null>(null);
  const [loading, setLoading] = useState(false);

  const policyOptions = useMemo(() => POLICIES, []);

  const onCalc = async () => {
    setLoading(true);
    const est = await calculatorService.estimate({ age, gender, policyId, term, sumAssured });
    setEstimate(est);
    setLoading(false);
  };

  return (
    <Card className="rounded-2xl border-border/60 card-elevated">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary-soft text-primary"><CalcIcon className="h-4 w-4" /></span>
          Premium Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Age</Label>
              <Input type="number" min={0} max={90} value={age} onChange={(e) => setAge(+e.target.value || 0)} />
            </div>
            <div>
              <Label>Gender</Label>
              <Select value={gender} onValueChange={(v) => setGender(v as never)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {!compact && (
            <div>
              <Label>Policy</Label>
              <Select value={policyId} onValueChange={setPolicyId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {policyOptions.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          <div>
            <div className="flex justify-between"><Label>Policy term</Label><span className="text-sm text-muted-foreground">{term} yrs</span></div>
            <Slider value={[term]} min={5} max={40} step={1} onValueChange={(v) => setTerm(v[0])} className="mt-2" />
          </div>
          <div>
            <div className="flex justify-between"><Label>Sum assured</Label><span className="text-sm text-muted-foreground">{formatCurrency(sumAssured)}</span></div>
            <Slider value={[sumAssured]} min={100000} max={10000000} step={100000} onValueChange={(v) => setSumAssured(v[0])} className="mt-2" />
          </div>
          <Button onClick={onCalc} disabled={loading} className="w-full">
            <Sparkles className="mr-2 h-4 w-4" /> {loading ? "Calculating…" : "Calculate premium"}
          </Button>
        </div>
        <motion.div layout className="grid gap-3 rounded-2xl bg-primary-soft/60 p-5 dark:bg-primary-soft/40">
          <div className="text-xs uppercase tracking-widest text-primary">Estimated premium</div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Yearly", key: "yearly" },
              { label: "Half-Yearly", key: "halfYearly" },
              { label: "Quarterly", key: "quarterly" },
              { label: "Monthly", key: "monthly" },
            ].map((k) => (
              <div key={k.key} className="rounded-xl bg-background/70 p-3">
                <div className="text-[11px] text-muted-foreground">{k.label}</div>
                <div className="mt-1 text-lg font-semibold">
                  {estimate ? formatCurrency(estimate[k.key as keyof PremiumEstimate]) : "—"}
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Illustrative only. Final premium depends on underwriting, riders, and product terms.
          </p>
        </motion.div>
      </CardContent>
    </Card>
  );
}
