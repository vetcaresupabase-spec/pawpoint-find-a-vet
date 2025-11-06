import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, Lock, Star } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import heroVetDashboard from "@/assets/hero-image(1).jpg";

const formSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  clinicName: z.string().min(2, "Clinic name is required"),
  clinicAddress: z.string().min(5, "Clinic address is required"),
  clinicZip: z.string().min(4, "Valid ZIP code is required"),
  clinicCity: z.string().min(2, "City is required"),
  mobile: z.string().min(10, "Valid mobile number is required"),
  email: z.string().email("Valid email address is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  specialty: z.string().min(2, "Please specify your specialty"),
  workType: z.string().min(1, "Please select where you work"),
  consent: z.boolean().refine((val) => val === true, {
    message: "You must agree to be contacted",
  }),
});

interface VetRegistrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "signup" | "demo";
}

export function VetRegistrationDialog({ open, onOpenChange, mode = "signup" }: VetRegistrationDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      clinicName: "",
      clinicAddress: "",
      clinicZip: "",
      clinicCity: "",
      mobile: "",
      email: "",
      password: "",
      specialty: "",
      workType: "",
      consent: false,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    try {
      // Create auth user first
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            role: "vet",
            full_name: `${values.firstName} ${values.lastName}`,
            clinic_name: values.clinicName,
          },
          emailRedirectTo: `${window.location.origin}/vet-dashboard`
        }
      });

      if (authError) {
        console.error("Auth error:", authError);
        toast({
          title: "Registration failed",
          description: authError.message || "Failed to create account. Please try again.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      if (!authData.user) {
        toast({
          title: "Registration failed",
          description: "Could not create user account.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Check if email confirmation is required
      const requiresEmailConfirmation = !authData.session && authData.user;

      // Create clinic record - make it visible in search even if email not confirmed
      const { error: clinicError } = await supabase
        .from("clinics")
        .insert({
          owner_id: authData.user.id,
          name: values.clinicName,
          address_line1: values.clinicAddress,
          postal_code: values.clinicZip,
          city: values.clinicCity,
          phone: values.mobile,
          email: values.email,
          specialties: values.specialty.split(",").map(s => s.trim()),
          verified: false, // Will be verified after onboarding
          is_active: true, // Make visible in search
        });

      if (clinicError) {
        console.error("Clinic creation error:", clinicError);
        console.error("Clinic data attempted:", {
          owner_id: authData.user.id,
          name: values.clinicName,
          city: values.clinicCity,
          email: values.email,
        });
        
        // More detailed error message
        const errorMessage = clinicError.message || "Unknown error occurred";
        toast({
          title: "Registration partially completed",
          description: `Account created but clinic setup failed: ${errorMessage}. Please try logging in and complete onboarding manually.`,
          variant: "destructive",
          duration: 10000,
        });
        setIsSubmitting(false);
        onOpenChange(false);
        return;
      }

      // Small delay to ensure clinic is committed to database
      await new Promise(resolve => setTimeout(resolve, 500));

      setIsSubmitting(false);
      onOpenChange(false);

      // Always navigate to onboarding - clinic is created and user can proceed
      if (requiresEmailConfirmation) {
        toast({
          title: "Registration successful! 🎉",
          description: `Your clinic "${values.clinicName}" has been registered and is now visible in search! Please check your email (${values.email}) and click the confirmation link. You can complete onboarding now or after confirming your email.`,
          duration: 15000,
        });
      } else {
        toast({
          title: "Welcome to Pet2Vet.app! 🎉",
          description: `Your clinic "${values.clinicName}" is now visible in search. Please complete onboarding to set up your full profile.`,
          duration: 8000,
        });
      }
      
      // Navigate to onboarding - clinic is already created
      navigate("/vet-onboarding");
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left side - Form */}
          <div>
            <DialogHeader>
              <DialogTitle className="text-2xl md:text-3xl">
                {mode === "demo" ? "Request a Demo" : "Join Pet2Vet.app — start free for 3 months"}
              </DialogTitle>
              <DialogDescription className="text-base">
                We'll help you attract new clients, manage bookings, and simplify your daily work.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="clinicName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Clinic Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Happy Paws Veterinary Clinic" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="clinicAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Clinic Address</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main Street" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="clinicZip"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ZIP Code</FormLabel>
                        <FormControl>
                          <Input placeholder="10115" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="clinicCity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="Berlin" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="mobile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+49 123 456 7890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="specialty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Specialty / Type of Service</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Dogs, Cats, Exotic Animals, General Practice" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="workType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Where do you work?</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select work type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="independent">Independent Clinic</SelectItem>
                          <SelectItem value="chain">Chain</SelectItem>
                          <SelectItem value="mobile">Mobile Vet</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="consent"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-normal">
                          I agree to be contacted for updates and special offers
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Processing..." : mode === "demo" ? "Request Demo" : "Request My Free Setup"}
                </Button>
              </form>
            </Form>
          </div>

          {/* Right side - Reassurance */}
          <div className="hidden md:flex flex-col justify-center space-y-6 bg-secondary/30 rounded-lg p-6">
            <div>
              <h3 className="text-xl font-semibold mb-4">
                Join hundreds of veterinarians already simplifying their daily work
              </h3>
              <div className="w-full rounded-lg mb-6 overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20">
                <img
                  src={heroVetDashboard}
                  alt="Veterinarian working"
                  className="w-full h-64 rounded-lg object-cover"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Shield className="h-6 w-6 text-primary flex-shrink-0" />
                <div>
                  <p className="font-semibold">GDPR Compliant</p>
                  <p className="text-sm text-muted-foreground">Your data is protected according to EU standards</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Lock className="h-6 w-6 text-primary flex-shrink-0" />
                <div>
                  <p className="font-semibold">Secure Data Hosting</p>
                  <p className="text-sm text-muted-foreground">Your data is securely hosted in Germany</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Star className="h-6 w-6 text-primary flex-shrink-0" />
                <div>
                  <p className="font-semibold">Trusted Reviews</p>
                  <p className="text-sm text-muted-foreground">Rated 4.8/5 by veterinary professionals</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
