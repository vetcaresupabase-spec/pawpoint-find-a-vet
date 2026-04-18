import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit, Trash2, Calendar, User, Heart, Sparkles, Shield, FileText, Scale, CreditCard, Stethoscope, Share2 } from "lucide-react";
import { differenceInYears, differenceInMonths, parseISO } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";

interface Pet {
  id: string;
  owner_name: string;
  pet_type: string;
  breed: string;
  name?: string;
  date_of_birth?: string;
  sex: string;
  neutered_spayed: string;
  photo_url?: string;
  notes?: string;
  created_at: string;
  // Extended fields
  microchip_number?: string;
  eu_passport_number?: string;
  color_markings?: string;
  weight_kg?: number;
  weight_date?: string;
  height_withers_cm?: number;
  species_specific_id?: string;
  known_conditions?: string[];
  allergies?: string[];
  insurance_provider?: string;
  insurance_policy_number?: string;
  primary_vet_clinic_name?: string;
  primary_vet_phone?: string;
  emergency_clinic_name?: string;
  emergency_clinic_phone?: string;
  completeness_score?: number;
  default_sharing_enabled?: boolean;
}

interface PetCardProps {
  pet: Pet;
  onEdit?: (pet: Pet) => void;
  onDelete?: (petId: string) => void;
  onSharingChange?: (petId: string, enabled: boolean) => void;
}

export function PetCard({ pet, onEdit, onDelete, onSharingChange }: PetCardProps) {
  const [sharingEnabled, setSharingEnabled] = useState(pet.default_sharing_enabled || false);
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
        return "bg-primary/10 text-primary border-primary/20";
      case "Cat":
        return "bg-accent/10 text-accent-foreground border-accent/20";
      case "Ferret":
        return "bg-secondary text-secondary-foreground border-secondary";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const defaultPhoto = `https://api.dicebear.com/7.x/shapes/svg?seed=${pet.id}`;

  const handleSharingToggle = async (enabled: boolean) => {
    try {
      const { error } = await supabase.rpc('update_pet_sharing_preference', {
        pet_id_param: pet.id,
        sharing_enabled: enabled
      });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update sharing preference. Please try again.",
          variant: "destructive",
        });
        return;
      }

      setSharingEnabled(enabled);
      onSharingChange?.(pet.id, enabled);
      
      toast({
        title: enabled ? "Sharing Enabled" : "Sharing Disabled",
        description: enabled 
          ? "Vets will be able to view this pet's details during appointments."
          : "Pet details will not be shared with vets during appointments.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to update sharing preference. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border border-border bg-gradient-to-br from-background to-muted/50">
      <div className="flex flex-row gap-4 p-4">
        {/* Passport-sized Photo Section */}
        <div className="flex-shrink-0 relative">
          <div className="w-24 h-32 bg-gradient-to-br from-muted to-muted/80 rounded-lg overflow-hidden border-2 border-border shadow-md">
            <img
              src={pet.photo_url || defaultPhoto}
              alt={pet.name || "Pet"}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Pet Type Badge - Overlay on photo */}
          <div className="absolute -top-1 -left-1">
            <Badge className={`${getPetTypeColor(pet.pet_type)} text-xs font-medium border shadow-sm`}>
              {pet.pet_type}
            </Badge>
          </div>
        </div>

        {/* Content Section - Horizontal Layout */}
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          {/* Header with Name and Actions */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-foreground truncate">
                {pet.name || "Unnamed Pet"}
              </h3>
              <p className="text-sm text-muted-foreground font-medium mt-0.5">{pet.breed}</p>
            </div>
            
            {/* Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => onEdit?.(pet)} className="cursor-pointer">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Pet
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete?.(pet.id)}
                  className="text-destructive cursor-pointer focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Pet
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Information Grid - Dynamic based on available data */}
          <div className="space-y-2">
            {/* Primary Info Row */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {/* Owner */}
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Owner</p>
                  <p className="text-sm font-semibold text-foreground truncate">{pet.owner_name}</p>
                </div>
              </div>

              {/* Age */}
              {pet.date_of_birth && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Age</p>
                    <p className="text-sm font-semibold text-foreground">{calculateAge(pet.date_of_birth)}</p>
                  </div>
                </div>
              )}

              {/* Sex */}
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Sex</p>
                  <p className="text-sm font-semibold text-foreground">{pet.sex}</p>
                </div>
              </div>

              {/* Neutered/Spayed */}
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Neutered/Spayed</p>
                  <p className="text-sm font-semibold text-foreground">{pet.neutered_spayed}</p>
                </div>
              </div>
            </div>

            {/* Extended Information - Only show if available */}
            {(pet.color_markings || pet.weight_kg || pet.height_withers_cm) && (
              <div className="pt-2 border-t border-border">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  {pet.color_markings && (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 flex items-center justify-center flex-shrink-0">
                        <span className="text-muted-foreground text-xs">🎨</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">Color</p>
                        <p className="text-sm font-semibold text-foreground truncate">{pet.color_markings}</p>
                      </div>
                    </div>
                  )}
                  
                  {pet.weight_kg && (
                    <div className="flex items-center gap-2">
                      <Scale className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">Weight</p>
                        <p className="text-sm font-semibold text-foreground">{pet.weight_kg} kg</p>
                      </div>
                    </div>
                  )}
                  
                  {pet.height_withers_cm && (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 flex items-center justify-center flex-shrink-0">
                        <span className="text-muted-foreground text-xs">📏</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">Height</p>
                        <p className="text-sm font-semibold text-foreground">{pet.height_withers_cm} cm</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ID & Legal - Show if microchip or passport exists */}
            {(pet.microchip_number || pet.eu_passport_number) && (
              <div className="pt-2 border-t border-border">
                <div className="grid grid-cols-1 gap-y-2">
                  {pet.microchip_number && (
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">Microchip</p>
                        <p className="text-sm font-semibold text-foreground font-mono">{pet.microchip_number}</p>
                      </div>
                    </div>
                  )}
                  
                  {pet.eu_passport_number && (
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">EU Passport</p>
                        <p className="text-sm font-semibold text-foreground">{pet.eu_passport_number}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Health Alerts - Show if conditions or allergies exist */}
            {((pet.known_conditions && pet.known_conditions.length > 0) || 
              (pet.allergies && pet.allergies.length > 0)) && (
              <div className="pt-2 border-t border-border">
                <div className="space-y-1">
                  {pet.known_conditions && pet.known_conditions.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Conditions</p>
                      <div className="flex flex-wrap gap-1">
                        {pet.known_conditions.slice(0, 3).map((condition, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {condition}
                          </Badge>
                        ))}
                        {pet.known_conditions.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{pet.known_conditions.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {pet.allergies && pet.allergies.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Allergies</p>
                      <div className="flex flex-wrap gap-1">
                        {pet.allergies.slice(0, 3).map((allergy, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs bg-destructive/10 text-destructive border-destructive/20">
                            {allergy}
                          </Badge>
                        ))}
                        {pet.allergies.length > 3 && (
                          <Badge variant="outline" className="text-xs bg-destructive/10 text-destructive border-destructive/20">
                            +{pet.allergies.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Contacts & Services - Show if available */}
            {(pet.primary_vet_clinic_name || pet.emergency_clinic_name || pet.insurance_provider) && (
              <div className="pt-2 border-t border-border">
                <div className="grid grid-cols-1 gap-y-2">
                  {pet.primary_vet_clinic_name && (
                    <div className="flex items-center gap-2">
                      <Stethoscope className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">Primary Vet</p>
                        <p className="text-sm font-semibold text-foreground truncate">{pet.primary_vet_clinic_name}</p>
                      </div>
                    </div>
                  )}
                  
                  {pet.insurance_provider && (
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">Insurance</p>
                        <p className="text-sm font-semibold text-foreground truncate">{pet.insurance_provider}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Completeness Score */}
            {pet.completeness_score !== undefined && (
              <div className="pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Profile Completeness</p>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all"
                        style={{ width: `${pet.completeness_score}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-foreground">{pet.completeness_score}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Notes Preview */}
          {pet.notes && (
            <div className="pt-2 border-t border-border">
              <p className="text-xs font-medium text-muted-foreground mb-1">Notes</p>
              <p className="text-sm text-foreground line-clamp-2 leading-relaxed">{pet.notes}</p>
            </div>
            )}

          {/* Pet Information Sharing */}
          <div className="pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Share2 className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs font-medium text-foreground">Share with Vets</p>
                  <p className="text-xs text-muted-foreground">Allow vets to view pet details during appointments</p>
                </div>
              </div>
              <Switch
                checked={sharingEnabled}
                onCheckedChange={handleSharingToggle}
                className="data-[state=checked]:bg-primary"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 mt-auto flex gap-2">
            <Button 
              className="flex-1" 
              variant="outline" 
              size="sm" 
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.href = '/search';
                }
              }}
            >
              <Calendar className="h-4 w-4 mr-2" />
              <span className="text-xs">Book Appointment</span>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

