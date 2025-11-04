import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, HelpCircle, BookOpen, Calendar, User, CreditCard, MessageCircle, FileText, Shield, Phone, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const Help = () => {
  const categories = [
    {
      icon: BookOpen,
      title: "Getting Started",
      description: "Learn how to create an account and make your first appointment",
      articles: [
        "How to create an account",
        "Finding a veterinarian",
        "Booking your first appointment",
        "Setting up your pet profile"
      ]
    },
    {
      icon: Calendar,
      title: "Appointments",
      description: "Everything about booking and managing appointments",
      articles: [
        "How to book an appointment",
        "Rescheduling or canceling",
        "Appointment reminders",
        "Viewing appointment history"
      ]
    },
    {
      icon: User,
      title: "Account Management",
      description: "Manage your profile and account settings",
      articles: [
        "Updating your profile",
        "Managing your pets",
        "Changing password",
        "Account security"
      ]
    },
    {
      icon: CreditCard,
      title: "Billing & Payments",
      description: "Information about payments and invoices",
      articles: [
        "Payment methods",
        "Viewing invoices",
        "Refund policy",
        "Payment issues"
      ]
    },
    {
      icon: MessageCircle,
      title: "Communication",
      description: "How to contact veterinarians and support",
      articles: [
        "Messaging veterinarians",
        "Contact support",
        "Feedback and reviews",
        "Emergency contacts"
      ]
    },
    {
      icon: FileText,
      title: "Medical Records",
      description: "Accessing and managing your pet's medical history",
      articles: [
        "Viewing medical records",
        "Downloading records",
        "Sharing records with vets",
        "Record privacy"
      ]
    }
  ];

  const faqs = [
    {
      question: "How do I book an appointment?",
      answer: "Search for a veterinarian in your area, select a clinic, choose a service and time slot, then click 'Book Appointment'. You'll need to log in if you haven't already."
    },
    {
      question: "Can I cancel or reschedule an appointment?",
      answer: "Yes, you can cancel or reschedule appointments from your dashboard. Simply go to 'My Appointments' and select the appointment you want to modify."
    },
    {
      question: "How do I add my pet's information?",
      answer: "After logging in, go to your dashboard and click 'Add Pet'. Fill in your pet's details including name, species, breed, and any medical history."
    },
    {
      question: "Is my pet's medical information secure?",
      answer: "Yes, we take data security seriously. All medical records are encrypted and stored securely. We comply with GDPR and other privacy regulations."
    },
    {
      question: "What should I do in case of an emergency?",
      answer: "Pet2Vet.app is for non-emergency appointments. In case of an emergency, please contact your nearest emergency veterinary clinic or animal hospital immediately."
    },
    {
      question: "How do I contact support?",
      answer: "You can reach our support team by emailing hello@pet2vet.app or using the contact form. We typically respond within 24 hours."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="border-b bg-gradient-to-br from-[#F9F5F1] via-[#F3E3CE]/30 to-[#3FA6A6]/10">
        <div className="container py-16">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
              <HelpCircle className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              How can we help you?
            </h1>
            <p className="text-lg text-muted-foreground">
              Find answers to common questions or browse our help articles
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto mt-8">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for help articles..."
                className="pl-12 h-12 text-base"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="container py-16">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Browse by Category</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{category.title}</CardTitle>
                  </div>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {category.articles.map((article, i) => (
                      <li key={i} className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                        → {article}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-muted/30 py-16">
        <div className="container max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="container py-16">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Still need help?</CardTitle>
              <CardDescription>
                Our support team is here to assist you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start gap-4 p-4 rounded-lg border bg-card">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Email Support</h3>
                    <p className="text-sm text-muted-foreground mb-2">Get help via email</p>
                    <a href="mailto:hello@pet2vet.app" className="text-sm text-primary hover:underline">
                      hello@pet2vet.app
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 rounded-lg border bg-card">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Response Time</h3>
                    <p className="text-sm text-muted-foreground">
                      We typically respond within 24 hours during business days
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>Your privacy is important to us. Read our <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link></span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Help;

