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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { AddPetDialog } from "@/components/AddPetDialog";
import { PetCard } from "@/components/PetCard";

const PetOwnerDashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAddPetDialog, setShowAddPetDialog] = useState(false);

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

  // Fetch user's bookings
  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ["userBookings", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          clinic:clinics(name, city, address_line1),
          service:clinic_services(name)
        `)
        .eq("pet_owner_id", user.id)
        .gte("appointment_date", format(new Date(), "yyyy-MM-dd"))
        .order("appointment_date", { ascending: true })
        .order("start_time", { ascending: true });
      
      if (error) {
        console.error("Error fetching bookings:", error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Fetch user's pets
  const { data: pets = [], isLoading: petsLoading } = useQuery({
    queryKey: ["userPets", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("pets")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching pets:", error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!user?.id,
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged Out",
      description: "You've been successfully logged out.",
    });
    navigate("/");
  };

  const handleAddPetSuccess = () => {
    // Refresh pets list
    queryClient.invalidateQueries({ queryKey: ["userPets", user?.id] });
  };

  const handleDeletePet = async (petId: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this pet? This action cannot be undone.");
    
    if (!confirmed) return;

    const { error } = await supabase
      .from("pets")
      .delete()
      .eq("id", petId);

    if (error) {
      toast({
        title: "Failed to delete pet",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Pet deleted",
      description: "Your pet has been removed from your profile",
    });

    // Refresh pets list
    queryClient.invalidateQueries({ queryKey: ["userPets", user?.id] });
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

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setShowAddPetDialog(true)}>
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
                {bookingsLoading ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Loading appointments...</p>
                  </div>
                ) : bookings.length > 0 ? (
                  <div className="space-y-4">
                    {bookings.map((booking: any) => {
                      const isDeclined = booking.status === "declined";
                      return (
                        <div
                          key={booking.id}
                          className={`flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/30 transition-colors ${
                            isDeclined ? "opacity-60" : ""
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <Clock className="h-5 w-5 text-primary mx-auto mb-1" />
                              <p className={`text-sm font-semibold ${isDeclined ? "line-through" : ""}`}>
                                {booking.start_time?.slice(0, 5)}
                              </p>
                              <p className={`text-xs text-muted-foreground ${isDeclined ? "line-through" : ""}`}>
                                {format(new Date(booking.appointment_date), "MMM dd, yyyy")}
                              </p>
                            </div>
                            <div>
                              <p className={`font-semibold ${isDeclined ? "line-through" : ""}`}>
                                {booking.pet_name} - {booking.service?.name || "General"}
                              </p>
                              <p className={`text-sm text-muted-foreground ${isDeclined ? "line-through" : ""}`}>
                                {booking.pet_type || "Pet"}
                              </p>
                              <div className={`flex items-center gap-2 text-sm text-muted-foreground mt-1 ${isDeclined ? "line-through" : ""}`}>
                                <MapPin className="h-3 w-3" />
                                <span>{booking.clinic?.name || "Clinic"}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge 
                              variant={
                                booking.status === "confirmed" || booking.status === "checked_in" 
                                  ? "default" 
                                  : booking.status === "pending"
                                  ? "secondary"
                                  : "destructive"
                              }
                            >
                              {booking.status.replace("_", " ")}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
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
                  <Button size="sm" onClick={() => setShowAddPetDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Pet
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {petsLoading ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Loading pets...</p>
                  </div>
                ) : pets.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pets.map((pet: any) => (
                      <PetCard
                        key={pet.id}
                        pet={pet}
                        onEdit={(pet) => {
                          toast({
                            title: "Edit Pet",
                            description: "Pet editing coming soon!",
                          });
                        }}
                        onDelete={handleDeletePet}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No pets added yet</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Add your first pet to start managing their health records and appointments.
                    </p>
                    <Button onClick={() => setShowAddPetDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Pet
                    </Button>
                  </div>
                )}
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

      {/* Add Pet Dialog */}
      <AddPetDialog
        open={showAddPetDialog}
        onOpenChange={setShowAddPetDialog}
        onSuccess={handleAddPetSuccess}
      />
    </div>
  );
};

export default PetOwnerDashboard;
