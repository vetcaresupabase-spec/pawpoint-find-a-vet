import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { triggerHaptic } from "@/lib/haptics";
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
  Brain,
  CheckCircle2,
  Flame,
  Star,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { AddPetDialogComprehensive } from "@/components/AddPetDialogComprehensive";
import { EditPetDialog } from "@/components/EditPetDialog";
import { PetCard } from "@/components/PetCard";
import { TreatmentRecords } from "@/components/vet/TreatmentRecords";
import { ExportMedicalRecordsPDF } from "@/components/pet-owner/ExportMedicalRecordsPDF";
import { LeaderboardCard } from "@/components/gamification/LeaderboardCard";
import { DailyQuizModal } from "@/components/gamification/DailyQuizModal";
import { useGamification } from "@/hooks/useGamification";

const PetOwnerDashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAddPetDialog, setShowAddPetDialog] = useState(false);
  const [showEditPetDialog, setShowEditPetDialog] = useState(false);
  const [selectedPet, setSelectedPet] = useState<any>(null);
  const [selectedPetForRecords, setSelectedPetForRecords] = useState<any>(null);
  const [showMedicalRecords, setShowMedicalRecords] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
  const [deletePetId, setDeletePetId] = useState<string | null>(null);
  const { enabled: gamificationEnabled, dailyQuestion, answeredToday, quizLoading, stats } = useGamification();

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
      
      if (error) return [];
      
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
      
      if (error) return [];
      
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

  const handleDeletePet = (petId: string) => {
    triggerHaptic("warning");
    setDeletePetId(petId);
  };

  const confirmDeletePet = async () => {
    if (!deletePetId) return;

    const { error } = await supabase
      .from("pets")
      .delete()
      .eq("id", deletePetId);

    setDeletePetId(null);

    if (error) {
      triggerHaptic("error");
      toast({
        title: "Failed to delete pet",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    triggerHaptic("success");
    toast({
      title: "Pet deleted",
      description: "Your pet has been removed from your profile",
    });

    queryClient.invalidateQueries({ queryKey: ["userPets", user?.id] });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
        <Header />
        <div className="border-b bg-background/95">
          <div className="container py-6 space-y-3">
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="container py-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-36" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setShowMedicalRecords(!showMedicalRecords)}>
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

          {gamificationEnabled && (quizLoading ? (
            <Card className="transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-36" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : dailyQuestion ? (
            <Card
              className="hover:shadow-lg transition-all duration-300 cursor-pointer border-primary/30 bg-primary/5 relative overflow-hidden"
              onClick={() => setQuizOpen(true)}
            >
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center relative">
                    <Brain className="h-6 w-6 text-primary" />
                    <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-primary animate-pulse" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">Daily Quiz</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {dailyQuestion.category} &middot; <span className="capitalize">{dailyQuestion.difficulty}</span>
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-flex items-center gap-0.5 text-xs font-medium text-yellow-600 dark:text-yellow-400">
                        <Star className="h-3 w-3 fill-current" />
                        +10 pts
                      </span>
                      {stats && stats.current_streak > 0 && (
                        <span className="inline-flex items-center gap-0.5 text-xs font-medium text-orange-500">
                          <Flame className="h-3 w-3" />
                          {stats.current_streak}-day streak
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : answeredToday ? (
            <Card
              className="hover:shadow-lg transition-all duration-300 cursor-pointer border-primary/30 bg-primary/10"
              onClick={() => setQuizOpen(true)}
            >
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    {answeredToday.is_correct ? (
                      <CheckCircle2 className="h-6 w-6 text-primary" />
                    ) : (
                      <XCircle className="h-6 w-6 text-destructive" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">Daily Quiz</p>
                      <Badge variant={answeredToday.is_correct ? "default" : "destructive"} className="text-[10px] px-1.5 py-0">
                        {answeredToday.is_correct ? "Correct" : "Incorrect"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Tap to review your answer</p>
                    <div className="flex items-center gap-2 mt-1">
                      {answeredToday.is_correct && (
                        <span className="inline-flex items-center gap-0.5 text-xs font-medium text-yellow-600 dark:text-yellow-400">
                          <Star className="h-3 w-3 fill-current" />
                          +10 pts earned
                        </span>
                      )}
                      {stats && stats.current_streak > 0 && (
                        <span className="inline-flex items-center gap-0.5 text-xs font-medium text-orange-500">
                          <Flame className="h-3 w-3" />
                          {stats.current_streak}-day streak
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null)}
        </div>

        {/* Medical Records Section */}
        {showMedicalRecords && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Medical Records</CardTitle>
            </CardHeader>
            <CardContent>
              {petsLoading ? (
                <div className="flex gap-2 py-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-28 rounded-md" />
                  ))}
                </div>
              ) : pets.length > 0 ? (
                <div className="space-y-6">
                  {/* Pet Selector */}
                  <div className="flex flex-wrap gap-2">
                    {pets.map((pet: any) => (
                      <Button
                        key={pet.id}
                        variant={selectedPetForRecords?.id === pet.id ? "default" : "outline"}
                        onClick={() => setSelectedPetForRecords(pet)}
                        className="flex items-center gap-2"
                      >
                        {pet.photo_url && (
                          <img
                            src={pet.photo_url}
                            alt={pet.name}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                        )}
                        <span>{pet.name}</span>
                      </Button>
                    ))}
                  </div>

                  {/* Display Treatment Records for Selected Pet */}
                  {selectedPetForRecords ? (
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">
                          Medical History for {selectedPetForRecords.name}
                        </h3>
                        <ExportMedicalRecordsPDF
                          petId={selectedPetForRecords.id}
                          petName={selectedPetForRecords.name}
                          variant="outline"
                          size="sm"
                        />
                      </div>
                      <TreatmentRecords 
                        petId={selectedPetForRecords.id}
                        petName={selectedPetForRecords.name}
                        readOnly={true}
                      />
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Select a pet above to view their medical history
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No pets added yet</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add your first pet to start tracking their medical records.
                  </p>
                  <Button onClick={() => setShowAddPetDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Pet
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Gamification Leaderboard */}
        {gamificationEnabled && (
          <div className="mb-8">
            <LeaderboardCard />
          </div>
        )}

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
                  <div className="space-y-4 py-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                        <div className="text-center space-y-1">
                          <Skeleton className="h-5 w-5 mx-auto" />
                          <Skeleton className="h-4 w-10" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-40" />
                          <Skeleton className="h-3 w-24" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                        <Skeleton className="h-6 w-20 rounded-full" />
                      </div>
                    ))}
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
                  <div className="grid grid-cols-1 gap-4">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-12 w-12 rounded-full" />
                          <div className="space-y-2">
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : pets.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {pets.map((pet: any) => (
                      <PetCard
                        key={pet.id}
                        pet={pet}
                        onEdit={(pet) => {
                          setSelectedPet(pet);
                          setShowEditPetDialog(true);
                        }}
                        onDelete={handleDeletePet}
                        onSharingChange={(petId, enabled) => {
                          // Invalidate queries to refresh pet data
                          queryClient.invalidateQueries({ queryKey: ["userPets"] });
                        }}
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

      {/* Add Pet Dialog - Comprehensive */}
      <AddPetDialogComprehensive
        open={showAddPetDialog}
        onOpenChange={setShowAddPetDialog}
        onSuccess={handleAddPetSuccess}
      />

      {/* Edit Pet Dialog */}
      <EditPetDialog
        open={showEditPetDialog}
        onOpenChange={setShowEditPetDialog}
        pet={selectedPet}
        onSuccess={handleAddPetSuccess}
      />

      {/* Daily Quiz Modal */}
      {gamificationEnabled && (
        <DailyQuizModal open={quizOpen} onOpenChange={setQuizOpen} />
      )}

      {/* Delete Pet Confirmation */}
      <AlertDialog open={!!deletePetId} onOpenChange={(open) => !open && setDeletePetId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this pet?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All data associated with this pet will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeletePet} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PetOwnerDashboard;
