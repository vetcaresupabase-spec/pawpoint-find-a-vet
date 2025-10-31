import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { TodayTab } from "@/components/vet/TodayTab";
import { ServicesTab } from "@/components/vet/ServicesTab";
import { OpeningHoursTab } from "@/components/vet/OpeningHoursTab";
import { StaffTab } from "@/components/vet/StaffTab";
import { AnalyticsTab } from "@/components/vet/AnalyticsTab";
import {
  Calendar,
  Bell,
  DollarSign,
  Clock,
  Briefcase,
  Users,
  BarChart3,
  MapPin,
  Phone,
  Mail,
  Edit,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ClinicData {
  id: string;
  name: string;
  city: string;
  address_line1: string;
  phone: string;
  email: string;
  specialties: string[];
}

const VetDashboard = () => {
  const navigate = useNavigate();
  const [clinicId, setClinicId] = useState<string | null>(null);
  const [clinic, setClinic] = useState<ClinicData | null>(null);
  const [vetName, setVetName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/");
        return;
      }

      // Check if user is a vet
      const userRole = user.user_metadata?.role;
      if (userRole !== "vet") {
        toast({
          title: "Access Denied",
          description: "You must be a vet to access this page.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      // Get vet name from user metadata or profile
      const fullName = user.user_metadata?.full_name || user.user_metadata?.name || "Doctor";
      setVetName(fullName);

      // Fetch user's clinic with details
      const { data: clinicData, error } = await supabase
        .from("clinics")
        .select("id, name, city, address_line1, phone, email, specialties")
        .eq("owner_id", user.id)
        .single();

      if (error || !clinicData) {
        toast({
          title: "No Clinic Found",
          description: "Please complete clinic onboarding first.",
          variant: "destructive",
        });
        navigate("/vet-onboarding");
        return;
      }

      setClinicId(clinicData.id);
      setClinic(clinicData);
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!clinicId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Header />
      
      {/* Dashboard Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container py-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">Welcome back, {vetName}!</h1>
              <p className="text-muted-foreground mb-3">Here's what's happening with your clinic today</p>
              
              {/* Clinic Details Card */}
              {clinic && (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border max-w-2xl">
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-base">{clinic.name}</h3>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => navigate("/vet-onboarding")}
                        title="Edit profile"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      {clinic.address_line1 && clinic.city && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{clinic.address_line1}, {clinic.city}</span>
                        </div>
                      )}
                      
                      {clinic.phone && (
                        <div className="flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5" />
                          <span>{clinic.phone}</span>
                        </div>
                      )}
                      
                      {clinic.email && (
                        <div className="flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5" />
                          <span>{clinic.email}</span>
                        </div>
                      )}
                    </div>
                    
                    {clinic.specialties && clinic.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {clinic.specialties.map((specialty, index) => (
                          <span 
                            key={index}
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => toast({ title: "Notifications", description: "No new notifications" })}
              >
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
              <Button 
                size="sm" 
                className="bg-accent hover:bg-accent/90"
                onClick={() => toast({ title: "Upgrade to Premium", description: "Premium features coming soon!" })}
              >
                Upgrade to Premium
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Main Content Tabs */}
        <Tabs defaultValue="today" className="space-y-6">
          <TabsList>
            <TabsTrigger value="today">
              <Calendar className="h-4 w-4 mr-2" />
              Today
            </TabsTrigger>
            <TabsTrigger value="services">
              <Briefcase className="h-4 w-4 mr-2" />
              Services
            </TabsTrigger>
            <TabsTrigger value="hours">
              <Clock className="h-4 w-4 mr-2" />
              Opening Hours
            </TabsTrigger>
            <TabsTrigger value="staff">
              <Users className="h-4 w-4 mr-2" />
              Staff
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Today Tab */}
          <TabsContent value="today">
            <TodayTab clinicId={clinicId} />
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services">
            <ServicesTab clinicId={clinicId} />
          </TabsContent>

          {/* Opening Hours Tab */}
          <TabsContent value="hours">
            <OpeningHoursTab clinicId={clinicId} />
          </TabsContent>

          {/* Staff Tab */}
          <TabsContent value="staff">
            <StaffTab clinicId={clinicId} />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <AnalyticsTab clinicId={clinicId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default VetDashboard;
