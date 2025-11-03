import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { 
  User, 
  Calendar, 
  Heart, 
  Sparkles, 
  Shield, 
  FileText, 
  Scale, 
  CreditCard, 
  Stethoscope,
  AlertTriangle,
  Phone,
  MapPin,
  Clock,
  Info
} from "lucide-react";
import { differenceInYears, differenceInMonths, parseISO } from "date-fns";

interface PetDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  petName: string;
}

interface SharedPetInfo {
  pet_id: string;
  name: string;
  pet_type: string;
  breed: string;
  date_of_birth?: string;
  sex: string;
  neutered_spayed: string;
  owner_name: string;
  photo_url?: string;
  microchip_number?: string;
  eu_passport_number?: string;
  color_markings?: string;
  weight_kg?: number;
  weight_date?: string;
  height_withers_cm?: number;
  known_conditions?: string[];
  allergies?: string[];
  insurance_provider?: string;
  insurance_policy_number?: string;
  primary_vet_clinic_name?: string;
  primary_vet_phone?: string;
  emergency_clinic_name?: string;
  emergency_clinic_phone?: string;
  notes?: string;
  completeness_score?: number;
}

export function PetDetailsDialog({ open, onOpenChange, bookingId, petName }: PetDetailsDialogProps) {
  const [petInfo, setPetInfo] = useState<SharedPetInfo | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && bookingId) {
      fetchPetInfo();
    }
  }, [open, bookingId]);

  const fetchPetInfo = async () => {
    setLoading(true);
    try {
      // First, get the booking to find the shared_pet_id
      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .select("shared_pet_id, pet_info_shared")
        .eq("id", bookingId)
        .single();

      if (bookingError || !booking || !booking.shared_pet_id || !booking.pet_info_shared) {
        console.error('Booking not found or pet not shared:', bookingError);
        setPetInfo(null);
        setLoading(false);
        return;
      }

      // Try using the RPC function first
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_shared_pet_info', {
        booking_id_param: bookingId
      });

      if (!rpcError && rpcData) {
        setPetInfo(rpcData);
        setLoading(false);
        return;
      }

      // Fallback: Fetch pet directly if RPC function fails
      console.warn('RPC function failed, trying direct fetch:', rpcError);
      const { data: petData, error: petError } = await supabase
        .from("pets")
        .select("*")
        .eq("id", booking.shared_pet_id)
        .single();

      if (petError || !petData) {
        console.error('Error fetching pet directly:', petError);
        toast({
          title: "Error",
          description: "Failed to load pet information.",
          variant: "destructive",
        });
        setPetInfo(null);
        return;
      }

      // Transform pet data to match SharedPetInfo interface
      const transformedPetInfo: SharedPetInfo = {
        pet_id: petData.id,
        name: petData.name || "",
        pet_type: petData.pet_type || "",
        breed: petData.breed || "",
        date_of_birth: petData.date_of_birth || undefined,
        sex: petData.sex || "Unknown",
        neutered_spayed: petData.neutered_spayed || "Unknown",
        owner_name: petData.owner_name || "",
        photo_url: petData.photo_url || undefined,
        microchip_number: petData.microchip_number || undefined,
        eu_passport_number: petData.eu_passport_number || undefined,
        color_markings: petData.color_markings || undefined,
        weight_kg: petData.weight_kg || undefined,
        weight_date: petData.weight_date || undefined,
        height_withers_cm: petData.height_withers_cm || undefined,
        known_conditions: (() => {
          if (!petData.known_conditions) return undefined;
          if (Array.isArray(petData.known_conditions)) return petData.known_conditions;
          if (typeof petData.known_conditions === 'string') {
            try {
              return JSON.parse(petData.known_conditions);
            } catch {
              return [petData.known_conditions];
            }
          }
          return undefined;
        })(),
        allergies: (() => {
          if (!petData.allergies) return undefined;
          if (Array.isArray(petData.allergies)) return petData.allergies;
          if (typeof petData.allergies === 'string') {
            try {
              return JSON.parse(petData.allergies);
            } catch {
              return [petData.allergies];
            }
          }
          return undefined;
        })(),
        insurance_provider: petData.insurance_provider || undefined,
        insurance_policy_number: petData.insurance_policy_number || undefined,
        primary_vet_clinic_name: petData.primary_vet_clinic_name || undefined,
        primary_vet_phone: petData.primary_vet_phone || undefined,
        emergency_clinic_name: petData.emergency_clinic_name || undefined,
        emergency_clinic_phone: petData.emergency_clinic_phone || undefined,
        notes: petData.notes || undefined,
        completeness_score: petData.completeness_score || undefined,
      };

      setPetInfo(transformedPetInfo);
    } catch (error) {
      console.error('Error fetching pet info:', error);
      toast({
        title: "Error",
        description: "Failed to load pet information.",
        variant: "destructive",
      });
      setPetInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dateOfBirth: string) => {
    const dob = parseISO(dateOfBirth);
    const years = differenceInYears(new Date(), dob);
    
    if (years > 0) {
      return `${years} year${years > 1 ? "s" : ""} old`;
    }
    
    const months = differenceInMonths(new Date(), dob);
    if (months > 0) {
      return `${months} month${months > 1 ? "s" : ""} old`;
    }
    
    return "Less than a month old";
  };

  const getPetTypeColor = (type: string) => {
    switch (type) {
      case "Dog":
        return "bg-blue-500/10 text-blue-700 border-blue-200/50";
      case "Cat":
        return "bg-purple-500/10 text-purple-700 border-purple-200/50";
      case "Ferret":
        return "bg-orange-500/10 text-orange-700 border-orange-200/50";
      default:
        return "bg-gray-500/10 text-gray-700 border-gray-200/50";
    }
  };

  const defaultPhoto = petInfo ? `https://api.dicebear.com/7.x/shapes/svg?seed=${petInfo.pet_id}` : "";

  if (!petInfo && !loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Pet Information - {petName}</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Pet information has not been shared for this appointment.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Pet Information - {petInfo?.name || petName}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading pet information...</p>
          </div>
        ) : petInfo ? (
          <div className="space-y-6">
            {/* Pet Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-row gap-4">
                  {/* Photo */}
                  <div className="flex-shrink-0">
                    <div className="w-24 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden border-2 border-gray-300 shadow-md">
                      <img
                        src={petInfo.photo_url || defaultPhoto}
                        alt={petInfo.name || "Pet"}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="mt-2">
                      <Badge className={`${getPetTypeColor(petInfo.pet_type)} text-xs font-medium border shadow-sm`}>
                        {petInfo.pet_type}
                      </Badge>
                    </div>
                  </div>

                  {/* Basic Info */}
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">
                      {petInfo.name || "Unnamed Pet"}
                    </h3>
                    <p className="text-lg text-gray-600 font-medium mb-4">{petInfo.breed}</p>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Owner</p>
                          <p className="text-sm font-semibold">{petInfo.owner_name}</p>
                        </div>
                      </div>

                      {petInfo.date_of_birth && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Age</p>
                            <p className="text-sm font-semibold">{calculateAge(petInfo.date_of_birth)}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Sex</p>
                          <p className="text-sm font-semibold">{petInfo.sex}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Neutered/Spayed</p>
                          <p className="text-sm font-semibold">{petInfo.neutered_spayed}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Information Tabs */}
            <Tabs defaultValue="medical" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="medical">Medical</TabsTrigger>
                <TabsTrigger value="identification">ID & Passport</TabsTrigger>
                <TabsTrigger value="contacts">Contacts</TabsTrigger>
                <TabsTrigger value="physical">Physical</TabsTrigger>
              </TabsList>

              {/* Medical Tab */}
              <TabsContent value="medical" className="space-y-4">
                {/* Health Alerts */}
                {((petInfo.known_conditions && petInfo.known_conditions.length > 0) || 
                  (petInfo.allergies && petInfo.allergies.length > 0)) && (
                  <Card className="border-red-200 bg-red-50/50">
                    <CardHeader>
                      <CardTitle className="text-red-800 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Health Alerts
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {petInfo.known_conditions && petInfo.known_conditions.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-red-700 mb-2">Known Conditions</p>
                          <div className="flex flex-wrap gap-2">
                            {petInfo.known_conditions.map((condition, idx) => (
                              <Badge key={idx} variant="outline" className="bg-red-100 text-red-800 border-red-300">
                                {condition}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {petInfo.allergies && petInfo.allergies.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-red-700 mb-2">Allergies</p>
                          <div className="flex flex-wrap gap-2">
                            {petInfo.allergies.map((allergy, idx) => (
                              <Badge key={idx} variant="outline" className="bg-red-100 text-red-800 border-red-300">
                                {allergy}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Insurance */}
                {petInfo.insurance_provider && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Insurance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-medium">{petInfo.insurance_provider}</p>
                      {petInfo.insurance_policy_number && (
                        <p className="text-sm text-muted-foreground">Policy: {petInfo.insurance_policy_number}</p>
                      )}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Identification Tab */}
              <TabsContent value="identification" className="space-y-4">
                <div className="grid gap-4">
                  {petInfo.microchip_number && (
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Shield className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="font-medium">Microchip</p>
                            <p className="text-sm font-mono text-muted-foreground">{petInfo.microchip_number}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {petInfo.eu_passport_number && (
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="font-medium">EU Pet Passport</p>
                            <p className="text-sm text-muted-foreground">{petInfo.eu_passport_number}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              {/* Contacts Tab */}
              <TabsContent value="contacts" className="space-y-4">
                <div className="grid gap-4">
                  {petInfo.primary_vet_clinic_name && (
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Stethoscope className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div>
                            <p className="font-medium">Primary Vet</p>
                            <p className="text-sm text-muted-foreground">{petInfo.primary_vet_clinic_name}</p>
                            {petInfo.primary_vet_phone && (
                              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                <Phone className="h-3 w-3" />
                                {petInfo.primary_vet_phone}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {petInfo.emergency_clinic_name && (
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                          <div>
                            <p className="font-medium">Emergency Clinic</p>
                            <p className="text-sm text-muted-foreground">{petInfo.emergency_clinic_name}</p>
                            {petInfo.emergency_clinic_phone && (
                              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                <Phone className="h-3 w-3" />
                                {petInfo.emergency_clinic_phone}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              {/* Physical Tab */}
              <TabsContent value="physical" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {petInfo.weight_kg && (
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Scale className="h-5 w-5 text-gray-600" />
                          <div>
                            <p className="font-medium">Weight</p>
                            <p className="text-sm text-muted-foreground">{petInfo.weight_kg} kg</p>
                            {petInfo.weight_date && (
                              <p className="text-xs text-muted-foreground">
                                <Clock className="h-3 w-3 inline mr-1" />
                                {petInfo.weight_date}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {petInfo.height_withers_cm && (
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-5 w-5 flex items-center justify-center">
                            <span className="text-gray-600 text-sm">📏</span>
                          </div>
                          <div>
                            <p className="font-medium">Height</p>
                            <p className="text-sm text-muted-foreground">{petInfo.height_withers_cm} cm</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {petInfo.color_markings && (
                    <Card className="col-span-2">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="h-5 w-5 flex items-center justify-center mt-0.5">
                            <span className="text-gray-600 text-sm">🎨</span>
                          </div>
                          <div>
                            <p className="font-medium">Color & Markings</p>
                            <p className="text-sm text-muted-foreground">{petInfo.color_markings}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            {/* Notes */}
            {petInfo.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Additional Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{petInfo.notes}</p>
                </CardContent>
              </Card>
            )}

            {/* Completeness Score */}
            {petInfo.completeness_score !== undefined && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">Profile Completeness</p>
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 transition-all"
                          style={{ width: `${petInfo.completeness_score}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold">{petInfo.completeness_score}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Pet information has not been shared for this appointment.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
