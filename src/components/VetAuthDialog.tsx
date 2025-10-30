import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

interface VetAuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VetAuthDialog({ open, onOpenChange }: VetAuthDialogProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const loginForm = useForm<z.infer<typeof emailOnlySchema>>({
    resolver: zodResolver(emailOnlySchema),
    defaultValues: {
      email: "",
    },
  });

  const signupForm = useForm<z.infer<typeof emailOnlySchema>>({
    resolver: zodResolver(emailOnlySchema),
    defaultValues: {
      email: "",
    },
  });

  // Reset forms when switching between login/signup modes
  useEffect(() => {
    loginForm.reset();
    signupForm.reset();
  }, [isLogin]);

  const onLogin = async (values: z.infer<typeof emailOnlySchema>) => {
    setIsSubmitting(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: values.email,
      options: { emailRedirectTo: `${window.location.origin}/vet-dashboard` }
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
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}/vet-dashboard` } });
    if (error) {
      toast({ title: "Magic link failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Check your email", description: "We sent you a login link." });
    }
    setIsSubmitting(false);
  };

  const onGoogle = async () => {
    setIsSubmitting(true);
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/vet-dashboard` } });
    if (error) {
      toast({ title: "Google sign-in failed", description: error.message, variant: "destructive" });
    }
    setIsSubmitting(false);
  };

  const onSignup = async (values: z.infer<typeof emailOnlySchema>) => {
    setIsSubmitting(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: values.email,
      options: { emailRedirectTo: `${window.location.origin}/vet-dashboard` }
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
            {isLogin ? "Veterinarian Login" : "Join as a Veterinarian"}
          </DialogTitle>
          <DialogDescription>
            {isLogin
              ? "Access your clinic dashboard and manage appointments"
              : "Create your veterinarian account and start accepting bookings"}
          </DialogDescription>
        </DialogHeader>

        {isLogin ? (
          <Form {...loginForm}>
            <form key="vet-login-form" onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
              <FormField
                control={loginForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="your@email.com" autoComplete="off" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send login link"}
              </Button>
              <div className="grid gap-2">
                <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => onMagicLink(loginForm.getValues("email"))}>
                  Send magic link
                </Button>
                <Button type="button" variant="secondary" disabled={isSubmitting} onClick={onGoogle}>
                  Continue with Google
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <Form {...signupForm}>
            <form key="vet-signup-form" onSubmit={signupForm.handleSubmit(onSignup)} className="space-y-4">
              <FormField
                control={signupForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="your@email.com" autoComplete="off" {...field} />
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

        <div className="text-center text-sm">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary hover:underline"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
