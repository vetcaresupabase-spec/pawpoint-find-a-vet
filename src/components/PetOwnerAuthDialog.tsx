import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const emailOnlySchema = z.object({
  email: z.string().email("Valid email address is required"),
});

interface PetOwnerAuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PetOwnerAuthDialog({ open, onOpenChange }: PetOwnerAuthDialogProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const loginForm = useForm<z.infer<typeof emailOnlySchema>>({
    resolver: zodResolver(emailOnlySchema),
    defaultValues: {
      email: "",
    },
  });

  // Reset forms when switching between login/signup modes
  useEffect(() => {
    loginForm.reset();
  }, [isLogin]);

  const onLogin = async (values: z.infer<typeof emailOnlySchema>) => {
    setIsSubmitting(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: values.email,
      options: { emailRedirectTo: `${window.location.origin}/pet-owner-dashboard` }
    });
    if (error) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Check your email", description: "We sent a login link." });
    }
    setIsSubmitting(false);
  };

  const onMagicLink = async (email: string) => {
    setIsSubmitting(true);
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}/pet-owner-dashboard` } });
    if (error) {
      toast({ title: "Magic link failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Check your email", description: "We sent you a login link." });
    }
    setIsSubmitting(false);
  };

  const onGoogle = async () => {
    setIsSubmitting(true);
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/pet-owner-dashboard` } });
    if (error) {
      toast({ title: "Google sign-in failed", description: error.message, variant: "destructive" });
    }
    setIsSubmitting(false);
  };

  const onSignup = async (values: z.infer<typeof emailOnlySchema>) => {
    setIsSubmitting(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: values.email,
      options: { emailRedirectTo: `${window.location.origin}/pet-owner-dashboard` }
    });
    if (error) {
      toast({ title: "Signup failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Check your email", description: "We sent a sign-in link." });
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md pointer-events-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {isLogin ? "Welcome Back" : "Create Your Account"}
          </DialogTitle>
          <DialogDescription>
            {isLogin
              ? "Login to manage your pet's appointments"
              : "Join PetFinder to book appointments with trusted vets"}
          </DialogDescription>
        </DialogHeader>

        {isLogin ? (
          <Form {...loginForm}>
            <form key="login-form" onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
              <FormField
                control={loginForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" autoComplete="off" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send login link"}
              </Button>
            </form>
          </Form>
        ) : (
          <Form {...loginForm}>
            <form key="signup-form" onSubmit={loginForm.handleSubmit(onSignup)} className="space-y-4">
              <FormField
                control={loginForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" autoComplete="off" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Create account (email link)"}
              </Button>
            </form>
          </Form>
        )}

        <div className="space-y-4 text-center text-sm">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary hover:underline"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
          </button>

          {isLogin && (
            <div className="text-muted-foreground">
              Are you a veterinarian?{" "}
              <Link to="/for-vets" className="text-primary hover:underline" onClick={() => onOpenChange(false)}>
                Login as Vet
              </Link>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
