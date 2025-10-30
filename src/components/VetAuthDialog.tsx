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

const authSchema = z.object({
  email: z.string().email("Valid email address is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

interface VetAuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VetAuthDialog({ open, onOpenChange }: VetAuthDialogProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const loginForm = useForm<z.infer<typeof authSchema>>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signupForm = useForm<z.infer<typeof authSchema>>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Reset forms when switching between login/signup modes
  useEffect(() => {
    loginForm.reset();
    signupForm.reset();
  }, [isLogin]);

  const onLogin = async (values: z.infer<typeof authSchema>) => {
    setIsSubmitting(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });
    if (error) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
      setIsSubmitting(false);
      return;
    }
    toast({ title: "Welcome!", description: "Login successful." });
    setIsSubmitting(false);
    onOpenChange(false);
    navigate("/vet-dashboard");
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

  const onSignup = async (values: z.infer<typeof authSchema>) => {
    setIsSubmitting(true);
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: { role: "vet" },
        emailRedirectTo: `${window.location.origin}/vet-dashboard`
      }
    });
    if (error) {
      toast({ title: "Signup failed", description: error.message, variant: "destructive" });
      setIsSubmitting(false);
      return;
    }
    if (!data.user) {
      toast({ title: "Signup failed", description: "Could not create vet account.", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }
    toast({ title: "Vet account created!", description: "Welcome to PawPoint." });
    setIsSubmitting(false);
    onOpenChange(false);
    navigate("/vet-dashboard");
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
              
              <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" autoComplete="off" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Logging in..." : "Log in"}
              </Button>
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
              <FormField
                control={signupForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" autoComplete="off" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create vet account"}
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
