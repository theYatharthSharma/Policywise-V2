import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const schema = z.object({
  fullName: z.string().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Minimum 6 characters"),
  confirm: z.string().min(6),
  terms: z.boolean().refine((v) => v, "Please accept the terms"),
}).refine((d) => d.password === d.confirm, { message: "Passwords do not match", path: ["confirm"] });

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create an account — PolicyWise" },
      { name: "description", content: "Create your PolicyWise account to browse policies, apply and manage insurance online." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const { register: signup } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async (v) => {
    await signup(v.fullName, v.email, v.password);
    toast.success("Account created", { description: "Welcome to PolicyWise!" });
    navigate({ to: "/app/dashboard" });
  });

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center p-6 sm:p-10">
        <Card className="w-full max-w-md rounded-2xl border-border/60 p-8 card-elevated">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Create your account</h1>
            <p className="mt-1 text-sm text-muted-foreground">Free forever. No credit card required.</p>
          </div>
          <form onSubmit={onSubmit} className="space-y-4">
            <div><Label>Full name</Label><Input {...register("fullName")} className="mt-1" />{errors.fullName && <p className="mt-1 text-xs text-destructive">{errors.fullName.message}</p>}</div>
            <div><Label>Email</Label><Input type="email" {...register("email")} className="mt-1" />{errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}</div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label>Password</Label><Input type="password" {...register("password")} className="mt-1" />{errors.password && <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>}</div>
              <div><Label>Confirm</Label><Input type="password" {...register("confirm")} className="mt-1" />{errors.confirm && <p className="mt-1 text-xs text-destructive">{errors.confirm.message}</p>}</div>
            </div>
            <label className="flex items-start gap-2 text-sm text-muted-foreground">
              <Checkbox {...register("terms")} className="mt-0.5" /> <span>I agree to the <a href="#" className="text-primary">Terms</a> and <a href="#" className="text-primary">Privacy Policy</a>.</span>
            </label>
            {errors.terms && <p className="text-xs text-destructive">{errors.terms.message}</p>}
            <Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting ? "Creating…" : "Create account"}</Button>
          </form>
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account? <Link to="/login" className="text-primary hover:underline">Log in</Link>
          </div>
        </Card>
      </div>
      <div className="relative hidden overflow-hidden bg-primary text-primary-foreground lg:block">
        <div className="absolute inset-0 bg-hero-gradient opacity-40" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/15"><Shield className="h-5 w-5" /></div>
            <span className="font-semibold">PolicyWise</span>
          </Link>
          <div>
            <h2 className="text-4xl font-extrabold leading-tight">Insurance, thoughtfully designed for you.</h2>
            <p className="mt-3 max-w-md text-primary-foreground/80">Everything you need to compare, calculate and apply — in one clean, modern experience.</p>
          </div>
          <div className="text-xs text-primary-foreground/70">© {new Date().getFullYear()} PolicyWise Demo</div>
        </div>
      </div>
    </div>
  );
}
