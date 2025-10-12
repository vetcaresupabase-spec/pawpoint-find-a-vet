import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Heart,
  User,
  Settings,
  LogOut,
  Clock,
  MapPin,
  Plus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const PetOwnerDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/");
        return;
      }

      setUser(session.user);
      
      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();
      
      setProfile(profileData);
      setLoading(false);
    };

    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged Out",
      description: "You've been successfully logged out.",
    });
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
        <Header />
        <div className="container py-20 text-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Mock data - in real app this would come from database
  const upcomingAppointments = [
    {
      id: 1,
      date: "2025-10-15",
      time: "10:00 AM",
      vet: "Dr. Sarah Mueller",
      clinic: "Happy Paws Veterinary Clinic",
      pet: "Max",
      service: "Annual Checkup",
      status: "confirmed",
    },
    {
      id: 2,
      date: "2025-10-20",
      time: "2:30 PM",
      vet: "Dr. Hans Schmidt",
      clinic: "Tierklinik Berlin Mitte",
      pet: "Luna",
      service: "Vaccination",
      status: "pending",
    },
  ];

  const myPets = [
    {
      id: 1,
      name: "Max",
      species: "Dog",
      breed: "Golden Retriever",
      age: "3 years",
    },
    {
      id: 2,
      name: "Luna",
      species: "Cat",
      breed: "British Shorthair",
      age: "2 years",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Header />
      
      {/* Dashboard Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Welcome back, {profile?.full_name || "Pet Owner"}!</h1>
              <p className="text-muted-foreground">Manage your pets and their appointments</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/search")}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Book Appointment</p>
                  <p className="text-sm text-muted-foreground">Find a vet near you</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => toast({ title: "Add Pet", description: "Pet management coming soon!" })}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <Plus className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="font-semibold">Add a Pet</p>
                  <p className="text-sm text-muted-foreground">Register your new pet</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => toast({ title: "Medical Records", description: "Records management coming soon!" })}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-secondary/30 flex items-center justify-center">
                  <Heart className="h-6 w-6 text-secondary-foreground" />
                </div>
                <div>
                  <p className="font-semibold">Medical Records</p>
                  <p className="text-sm text-muted-foreground">View health history</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="appointments" className="space-y-6">
          <TabsList>
            <TabsTrigger value="appointments">
              <Calendar className="h-4 w-4 mr-2" />
              Appointments
            </TabsTrigger>
            <TabsTrigger value="pets">
              <Heart className="h-4 w-4 mr-2" />
              My Pets
            </TabsTrigger>
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
          </TabsList>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingAppointments.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/30 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <Clock className="h-5 w-5 text-primary mx-auto mb-1" />
                            <p className="text-sm font-semibold">{appointment.time}</p>
                            <p className="text-xs text-muted-foreground">{appointment.date}</p>
                          </div>
                          <div>
                            <p className="font-semibold">{appointment.pet} - {appointment.service}</p>
                            <p className="text-sm text-muted-foreground">{appointment.vet}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                              <MapPin className="h-3 w-3" />
                              <span>{appointment.clinic}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={appointment.status === "confirmed" ? "default" : "secondary"}>
                            {appointment.status}
                          </Badge>
                          <Button size="sm" variant="outline">
                            Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No upcoming appointments</p>
                    <Button onClick={() => navigate("/search")}>Book Your First Appointment</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pets Tab */}
          <TabsContent value="pets" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>My Pets</CardTitle>
                  <Button size="sm" onClick={() => toast({ title: "Add Pet", description: "Pet management coming soon!" })}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Pet
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {myPets.map((pet) => (
                    <Card key={pet.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                          <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                            <span className="text-2xl font-bold">{pet.name.charAt(0)}</span>
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-lg">{pet.name}</p>
                            <p className="text-sm text-muted-foreground">{pet.species} • {pet.breed}</p>
                            <p className="text-sm text-muted-foreground">{pet.age}</p>
                          </div>
                        </div>
                        <Button variant="outline" className="w-full mt-4">
                          View Details
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-semibold">{profile?.full_name || "Not set"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-semibold">{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-semibold">{profile?.phone || "Not set"}</p>
                </div>
                <Button variant="outline" onClick={() => toast({ title: "Edit Profile", description: "Profile editing coming soon!" })}>
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PetOwnerDashboard;
