import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Shield } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "At least 6 characters"),
  remember: z.boolean().optional(),
});

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in — PolicyWise" },
      { name: "description", content: "Log in to your PolicyWise account to manage policies, applications and profile." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: "demo@policywise.in", password: "password123", remember: true },
  });

  const onSubmit = handleSubmit(async (v) => {
    await login(v.email, v.password);
    toast.success("Welcome back!");
    navigate({ to: "/app/dashboard" });
  });

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-primary text-primary-foreground lg:block">
        <div className="absolute inset-0 bg-hero-gradient opacity-40" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/15"><Shield className="h-5 w-5" /></div>
            <span className="font-semibold">PolicyWise</span>
          </Link>
          <div>
            <h2 className="text-4xl font-extrabold leading-tight">A modern home for your insurance policies.</h2>
            <p className="mt-3 max-w-md text-primary-foreground/80">Track applications, calculate premiums, save favourites and chat with our AI assistant — all in one place.</p>
          </div>
          <div className="text-xs text-primary-foreground/70">© {new Date().getFullYear()} PolicyWise Demo</div>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10">
        <Card className="w-full max-w-md rounded-2xl border-border/60 p-8 card-elevated">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Welcome back</h1>
            <p className="mt-1 text-sm text-muted-foreground">Log in to your customer portal.</p>
          </div>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input type="email" {...register("email")} className="mt-1" />
              {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div>
              <div className="flex items-center justify-between"><Label>Password</Label><a href="#" className="text-xs text-primary">Forgot?</a></div>
              <div className="relative mt-1">
                <Input type={showPw ? "text" : "password"} {...register("password")} className="pr-10" />
                <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-label="Toggle password">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>}
            </div>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Checkbox {...register("remember")} /> Remember me
            </label>
            <Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting ? "Logging in…" : "Log in"}</Button>
          </form>
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account? <Link to="/register" className="text-primary hover:underline">Create one</Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
