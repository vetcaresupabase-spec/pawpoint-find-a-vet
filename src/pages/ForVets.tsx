import { useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Users, BellRing, Calendar, Star, Shield, TrendingUp, Lock, FileCheck, Database, Check } from "lucide-react";
import { VetRegistrationDialog } from "@/components/VetRegistrationDialog";

const ForVets = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"signup" | "demo">("signup");
  const benefits = [
    { icon: Users, title: "Attract new clients", description: "Be visible to local pet owners searching online." },
    { icon: BellRing, title: "Reduce no-shows", description: "Automatic reminders keep your schedule full." },
    { icon: Calendar, title: "Simplify your calendar", description: "Manage appointments from any device." },
    { icon: Star, title: "Build trust", description: "Verified reviews and clinic profiles boost credibility." },
    { icon: Shield, title: "Data security", description: "GDPR-compliant and encrypted platform." },
    { icon: TrendingUp, title: "Grow smarter", description: "Access insights and performance reports." },
  ];

  const steps = [
    { number: "01", title: "Sign up and create your clinic profile", description: "Takes less than 5 minutes to get started." },
    { number: "02", title: "Connect your calendar and set availability", description: "Sync with your existing tools or use ours." },
    { number: "03", title: "Start receiving bookings instantly", description: "Pet owners can find and book you right away." },
    { number: "04", title: "Manage, track, and grow your practice", description: "Access powerful tools and insights." },
  ];

  const pricing = [
    {
      name: "Basic",
      price: "€49.99",
      period: "/month",
      description: "Core features and online booking.",
      features: ["Online booking system", "Calendar management", "Automatic reminders", "Basic analytics", "Email support"],
    },
    {
      name: "Premium",
      price: "€79.99",
      period: "/month",
      description: "Advanced tools, analytics, and support.",
      features: ["Everything in Basic", "Advanced analytics", "Priority support", "Custom branding", "Review management", "Multiple staff accounts"],
      highlighted: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "pricing",
      description: "For multi-clinic setups.",
      features: ["Everything in Premium", "Multi-location management", "Dedicated account manager", "Custom integrations", "API access"],
    },
  ];

  const security = [
    { icon: Lock, title: "Encrypted & Secure", description: "End-to-end data protection." },
    { icon: FileCheck, title: "Full Control", description: "You own your clinic data and can export anytime." },
    { icon: Database, title: "GDPR-Compliant", description: "Hosted securely within the EU." },
  ];

  const faqs = [
    {
      question: "Can I integrate my existing calendar?",
      answer: "Yes! PetFinder integrates with popular calendar systems including Google Calendar, Outlook, and Apple Calendar. You can also use our built-in calendar system.",
    },
    {
      question: "What happens after my free trial?",
      answer: "After your 3-month free trial, you can choose to continue with one of our paid plans or cancel anytime. No credit card required during the trial period.",
    },
    {
      question: "Do I need technical knowledge to use it?",
      answer: "Not at all! PetFinder is designed to be user-friendly and intuitive. Our onboarding process guides you through setup, and our support team is always ready to help.",
    },
    {
      question: "Can multiple vets in one clinic share the same account?",
      answer: "Yes! Our Premium and Enterprise plans support multiple staff accounts, allowing each veterinarian to manage their own schedule within your clinic's profile.",
    },
    {
      question: "How do I receive booking notifications?",
      answer: "You'll receive instant notifications via email and SMS (if enabled). You can also check your dashboard anytime for new bookings and updates.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Header />

      {/* Hero Section */}
      <section className="container py-20 md:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Grow your clinic. Focus on care. We handle the rest.
              </h1>
              <p className="text-xl text-muted-foreground">
                Join PetFinder and let pet owners find, book, and manage visits while you reduce no-shows and attract new clients.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button 
                size="lg" 
                className="text-lg px-8"
                onClick={() => {
                  setDialogMode("signup");
                  setDialogOpen(true);
                }}
              >
                Start free for 3 months
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8"
                onClick={() => {
                  setDialogMode("demo");
                  setDialogOpen(true);
                }}
              >
                Request a Demo
              </Button>
            </div>
          </div>
          <div className="relative aspect-square lg:aspect-auto">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl animate-pulse" />
            <img
              src="/placeholder.svg"
              alt="Veterinarian with pet"
              className="relative rounded-3xl shadow-2xl w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Why veterinarians love PetFinder
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <Card key={index} className="border-2 hover:border-primary transition-colors">
                <CardContent className="pt-6">
                  <Icon className="h-12 w-12 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Social Proof */}
      <section className="bg-secondary/30 py-20">
        <div className="container">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-16">
            Trusted by vets and pet owners across Europe
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "Since joining PetFinder, we've cut cancellations in half and gained new clients every week.",
                author: "Dr. Marie Laurent",
                clinic: "Happy Paws Clinic, Paris",
              },
              {
                quote: "The platform is intuitive and my staff loves it. It's saved us hours of phone calls.",
                author: "Dr. Hans Mueller",
                clinic: "Tierklinik Berlin",
              },
              {
                quote: "Best decision for our practice. The analytics help us understand our clients better.",
                author: "Dr. Sofia Romano",
                clinic: "Clinica Veterinaria Milano",
              },
            ].map((testimonial, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <Star className="h-8 w-8 text-primary fill-primary mb-4" />
                  <p className="text-lg mb-4 italic">"{testimonial.quote}"</p>
                  <div>
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.clinic}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container py-20">
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-16">
          How it works
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="text-6xl font-bold text-primary/20 mb-4">{step.number}</div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-secondary/30 py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Start free for 3 months
            </h2>
            <p className="text-xl text-muted-foreground">
              Then choose the plan that fits your clinic. Cancel anytime within the first 3 months.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricing.map((plan, index) => (
              <Card key={index} className={plan.highlighted ? "border-primary border-2 shadow-xl scale-105" : ""}>
                <CardContent className="pt-6">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <p className="text-muted-foreground mb-6">{plan.description}</p>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full" 
                    variant={plan.highlighted ? "default" : "outline"}
                    onClick={() => {
                      setDialogMode("signup");
                      setDialogOpen(true);
                    }}
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-center text-muted-foreground mt-8">
            Join now — no credit card required
          </p>
        </div>
      </section>

      {/* Security */}
      <section className="container py-20">
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-16">
          Your clients' data, always protected
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {security.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="text-center">
                <Icon className="h-16 w-16 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-secondary/30 py-20">
        <div className="container max-w-3xl">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-16">
            Frequently asked questions
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-lg">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container py-20">
        <div className="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl p-12 md:p-20 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Ready to simplify your clinic?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join hundreds of veterinarians who trust PetFinder
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            <Button 
              size="lg" 
              className="text-lg px-8"
              onClick={() => {
                setDialogMode("signup");
                setDialogOpen(true);
              }}
            >
              Start Free for 3 Months
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8"
              onClick={() => {
                setDialogMode("demo");
                setDialogOpen(true);
              }}
            >
              Talk to Us
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            No hidden fees. Cancel anytime.
          </p>
        </div>
      </section>

      <VetRegistrationDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen}
        mode={dialogMode}
      />
    </div>
  );
};

export default ForVets;
