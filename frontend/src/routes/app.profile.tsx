import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Camera, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import { initials } from "@/utils/format";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const schema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.string().optional(),
  nominee: z.string().optional(),
});

export const Route = createFileRoute("/app/profile")({
  head: () => ({ meta: [{ title: "Profile — PolicyWise" }, { name: "description", content: "Manage your personal details, nominee information and account settings." }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, update, logout } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    values: {
      fullName: user?.fullName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: user?.address || "",
      nominee: user?.nominee || "",
    },
  });

  const onSubmit = handleSubmit(async (v) => { await update(v); toast.success("Profile updated"); });

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Profile</h1><p className="text-sm text-muted-foreground">Manage your personal information and settings.</p></div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <Card className="rounded-2xl p-6 text-center">
          <div className="relative mx-auto w-fit">
            <Avatar className="h-24 w-24"><AvatarFallback className="bg-primary text-2xl text-primary-foreground">{initials(user?.fullName || "U")}</AvatarFallback></Avatar>
            <button className="absolute bottom-0 right-0 grid h-8 w-8 place-items-center rounded-full border bg-background shadow" aria-label="Change photo"><Camera className="h-4 w-4" /></button>
          </div>
          <div className="mt-4 font-semibold">{user?.fullName}</div>
          <div className="text-xs text-muted-foreground">{user?.email}</div>
          <Separator className="my-5" />
          <div className="text-left text-xs text-muted-foreground">Member since</div>
          <div className="text-left text-sm font-medium">July 2026</div>
        </Card>

        <Card className="rounded-2xl p-6">
          <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2"><Label>Full name</Label><Input className="mt-1" {...register("fullName")} /></div>
            <div><Label>Email</Label><Input className="mt-1" type="email" {...register("email")} /></div>
            <div><Label>Phone</Label><Input className="mt-1" {...register("phone")} /></div>
            <div className="sm:col-span-2"><Label>Address</Label><Input className="mt-1" {...register("address")} /></div>
            <div className="sm:col-span-2"><Label>Nominee</Label><Input className="mt-1" {...register("nominee")} /></div>
            <div className="sm:col-span-2 flex justify-end"><Button type="submit" disabled={isSubmitting}>Save changes</Button></div>
          </form>
        </Card>
      </div>

      <Card className="rounded-2xl p-6">
        <div className="text-sm font-semibold">Change password</div>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          <div><Label>Current</Label><Input type="password" className="mt-1" /></div>
          <div><Label>New</Label><Input type="password" className="mt-1" /></div>
          <div><Label>Confirm</Label><Input type="password" className="mt-1" /></div>
        </div>
        <div className="mt-4 flex justify-end"><Button variant="outline" onClick={() => toast.success("Password updated")}>Update password</Button></div>
      </Card>

      <Card className="rounded-2xl border-destructive/30 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-destructive">Delete account</div>
            <p className="text-xs text-muted-foreground">This will permanently remove your local data. This action cannot be undone.</p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild><Button variant="destructive"><Trash2 className="mr-2 h-4 w-4" />Delete</Button></AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                <AlertDialogDescription>This clears your local session and preferences. You can register again anytime.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={async () => { await logout(); toast.success("Account removed"); navigate({ to: "/" }); }}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </Card>
    </div>
  );
}
