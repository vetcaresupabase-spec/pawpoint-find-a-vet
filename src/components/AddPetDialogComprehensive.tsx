import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Upload, X, Plus, Trash2 } from "lucide-react";

// Comprehensive Zod schema
const comprehensivePetSchema = z.object({
  // Minimal (Mandatory)
  owner_name: z.string().min(1, "Owner name is required"),
  pet_type: z.enum(["Dog", "Cat", "Ferret", "Other"], {
    required_error: "Pet type is required",
  }),
  breed: z.string().min(1, "Breed is required"),
  name: z.string().optional(),
  date_of_birth: z.string().optional(),
  sex: z.enum(["Male", "Female", "Unknown"]).default("Unknown"),
  neutered_spayed: z.enum(["Yes", "No", "Unknown"]).default("Unknown"),
  photo_url: z.string().optional(),
  
  // ID & Passport
  microchip_number: z.string().optional(),
  microchip_implantation_date: z.string().optional(),
  microchip_location: z.string().optional(),
  tattoo_id: z.string().optional(),
  tattoo_date: z.string().optional(),
  eu_passport_number: z.string().optional(),
  passport_issuing_country: z.string().optional(),
  passport_issue_date: z.string().optional(),
  primary_vet_clinic: z.string().optional(),
  primary_vet_contact: z.string().optional(),
  
  // Health & Wellness
  species_specific_id: z.string().optional(),
  color_markings: z.string().optional(),
  weight_kg: z.string().optional(),
  weight_date: z.string().optional(),
  height_withers_cm: z.string().optional(),
  known_conditions: z.array(z.string()).optional(),
  conditions_notes: z.string().optional(),
  allergies: z.array(z.string()).optional(),
  current_medications: z.array(z.object({
    name: z.string(),
    dose: z.string(),
    schedule: z.string(),
  })).optional(),
  past_surgeries: z.array(z.object({
    name: z.string(),
    date: z.string(),
    notes: z.string(),
  })).optional(),
  diet_brand: z.string().optional(),
  diet_type: z.string().optional(),
  feeding_schedule: z.string().optional(),
  behavior_temperament: z.string().optional(),
  behavior_triggers: z.string().optional(),
  bite_history: z.boolean().default(false),
  behavior_notes: z.string().optional(),
  
  // Ownership & Provenance
  acquired_from: z.enum(["breeder", "rescue", "private", "other"]).optional(),
  breeder_name: z.string().optional(),
  breeder_country: z.string().optional(),
  breeder_contact: z.string().optional(),
  rescue_name: z.string().optional(),
  rescue_country: z.string().optional(),
  rescue_contact: z.string().optional(),
  acquisition_date: z.string().optional(),
  registration_registry: z.string().optional(),
  registration_number: z.string().optional(),
  insurance_provider: z.string().optional(),
  insurance_policy_number: z.string().optional(),
  insurance_emergency_hotline: z.string().optional(),
  
  // Contacts & Emergencies
  primary_vet_clinic_name: z.string().optional(),
  primary_vet_phone: z.string().optional(),
  primary_vet_address: z.string().optional(),
  primary_vet_email: z.string().optional(),
  emergency_clinic_name: z.string().optional(),
  emergency_clinic_phone: z.string().optional(),
  emergency_clinic_address: z.string().optional(),
  alternate_emergency_contact_name: z.string().optional(),
  alternate_emergency_contact_phone: z.string().optional(),
  microchip_registry_name: z.string().optional(),
  microchip_registry_id: z.string().optional(),
  microchip_registry_url: z.string().optional(),
  
  // Travel & Compliance
  countries_visited: z.array(z.string()).optional(),
  intended_travel_countries: z.array(z.string()).optional(),
  travel_notes: z.string().optional(),
  
  // Privacy & Consent
  data_processing_consent: z.boolean().default(false),
  share_with_vets: z.record(z.boolean()).optional(),
  emergency_sharing_enabled: z.boolean().default(false),
  
  notes: z.string().optional(),
});

type ComprehensivePetFormValues = z.infer<typeof comprehensivePetSchema>;

interface AddPetDialogComprehensiveProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddPetDialogComprehensive({ 
  open, 
  onOpenChange, 
  onSuccess 
}: AddPetDialogComprehensiveProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [accordionValue, setAccordionValue] = useState("basics");

  const form = useForm<ComprehensivePetFormValues>({
    resolver: zodResolver(comprehensivePetSchema),
    defaultValues: {
      owner_name: "",
      pet_type: "Dog",
      breed: "",
      name: "",
      date_of_birth: "",
      sex: "Unknown",
      neutered_spayed: "Unknown",
      data_processing_consent: false,
      emergency_sharing_enabled: false,
      bite_history: false,
      known_conditions: [],
      allergies: [],
    },
  });

  const {
    fields: conditionFields,
    append: appendCondition,
    remove: removeCondition,
  } = useFieldArray({
    control: form.control,
    name: "known_conditions",
  });

  const {
    fields: allergyFields,
    append: appendAllergy,
    remove: removeAllergy,
  } = useFieldArray({
    control: form.control,
    name: "allergies",
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }

      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const onSubmit = async (values: ComprehensivePetFormValues) => {
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to add a pet",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      let photoUrl: string | null = null;

      if (photoFile) {
        const fileExt = photoFile.name.split(".").pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `pet-photos/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("pet-photos")
          .upload(filePath, photoFile);

        if (uploadError) {
          console.error("Photo upload error:", uploadError);
        } else {
          const { data: urlData } = supabase.storage
            .from("pet-photos")
            .getPublicUrl(filePath);
          photoUrl = urlData.publicUrl;
        }
      }

      // Prepare data for insert
      const petData: any = {
        owner_id: user.id,
        owner_name: values.owner_name,
        pet_type: values.pet_type,
        breed: values.breed,
        name: values.name || null,
        date_of_birth: values.date_of_birth || null,
        sex: values.sex,
        neutered_spayed: values.neutered_spayed,
        photo_url: photoUrl,
        notes: values.notes || null,
        
        // ID & Passport
        microchip_number: values.microchip_number || null,
        microchip_implantation_date: values.microchip_implantation_date || null,
        microchip_location: values.microchip_location || null,
        tattoo_id: values.tattoo_id || null,
        tattoo_date: values.tattoo_date || null,
        eu_passport_number: values.eu_passport_number || null,
        passport_issuing_country: values.passport_issuing_country || null,
        passport_issue_date: values.passport_issue_date || null,
        primary_vet_clinic: values.primary_vet_clinic || null,
        primary_vet_contact: values.primary_vet_contact || null,
        
        // Health & Wellness
        species_specific_id: values.species_specific_id || null,
        color_markings: values.color_markings || null,
        weight_kg: values.weight_kg ? parseFloat(values.weight_kg) : null,
        weight_date: values.weight_date || null,
        height_withers_cm: values.height_withers_cm ? parseFloat(values.height_withers_cm) : null,
        known_conditions: values.known_conditions || [],
        conditions_notes: values.conditions_notes || null,
        allergies: values.allergies || [],
        current_medications: values.current_medications || null,
        past_surgeries: values.past_surgeries || null,
        diet_brand: values.diet_brand || null,
        diet_type: values.diet_type || null,
        feeding_schedule: values.feeding_schedule || null,
        behavior_temperament: values.behavior_temperament || null,
        behavior_triggers: values.behavior_triggers || null,
        bite_history: values.bite_history,
        behavior_notes: values.behavior_notes || null,
        
        // Ownership
        acquired_from: values.acquired_from || null,
        breeder_name: values.breeder_name || null,
        breeder_country: values.breeder_country || null,
        breeder_contact: values.breeder_contact || null,
        rescue_name: values.rescue_name || null,
        rescue_country: values.rescue_country || null,
        rescue_contact: values.rescue_contact || null,
        acquisition_date: values.acquisition_date || null,
        registration_registry: values.registration_registry || null,
        registration_number: values.registration_number || null,
        insurance_provider: values.insurance_provider || null,
        insurance_policy_number: values.insurance_policy_number || null,
        insurance_emergency_hotline: values.insurance_emergency_hotline || null,
        
        // Contacts
        primary_vet_clinic_name: values.primary_vet_clinic_name || null,
        primary_vet_phone: values.primary_vet_phone || null,
        primary_vet_address: values.primary_vet_address || null,
        primary_vet_email: values.primary_vet_email || null,
        emergency_clinic_name: values.emergency_clinic_name || null,
        emergency_clinic_phone: values.emergency_clinic_phone || null,
        emergency_clinic_address: values.emergency_clinic_address || null,
        alternate_emergency_contact_name: values.alternate_emergency_contact_name || null,
        alternate_emergency_contact_phone: values.alternate_emergency_contact_phone || null,
        microchip_registry_name: values.microchip_registry_name || null,
        microchip_registry_id: values.microchip_registry_id || null,
        microchip_registry_url: values.microchip_registry_url || null,
        
        // Travel
        countries_visited: values.countries_visited || [],
        intended_travel_countries: values.intended_travel_countries || [],
        travel_notes: values.travel_notes || null,
        
        // Privacy
        data_processing_consent: values.data_processing_consent,
        consent_timestamp: values.data_processing_consent ? new Date().toISOString() : null,
        share_with_vets: values.share_with_vets || {},
        emergency_sharing_enabled: values.emergency_sharing_enabled,
      };

      const { error: insertError } = await supabase
        .from("pets")
        .insert(petData);

      if (insertError) {
        console.error("Insert error:", insertError);
        toast({
          title: "Failed to add pet",
          description: insertError.message,
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      toast({
        title: "Pet added successfully!",
        description: `${values.name || "Your pet"} has been added to your profile`,
      });

      form.reset();
      setPhotoFile(null);
      setPhotoPreview(null);
      onOpenChange(false);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast({
        title: "An error occurred",
        description: "Please try again later",
        variant: "destructive",
      });
    }

    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add a Pet - Comprehensive Profile</DialogTitle>
          <DialogDescription>
            Register your pet with full EU Pet Passport compliant details. Only basic fields are required.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Accordion 
              type="single" 
              collapsible 
              value={accordionValue}
              onValueChange={setAccordionValue}
              className="w-full"
            >
              {/* Basics Section - Always visible, expanded by default */}
              <AccordionItem value="basics" className="border-b">
                <AccordionTrigger className="text-base font-semibold">
                  <span className="flex items-center gap-2">
                    <span>Basics</span>
                    <span className="text-xs text-gray-500 font-normal">
                      (Required fields)
                    </span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  {/* Photo */}
                  <div className="space-y-2">
                    <FormLabel>Pet Photo (Square Portrait)</FormLabel>
                    <div className="flex items-start gap-4">
                      {photoPreview ? (
                        <div className="relative">
                          <img
                            src={photoPreview}
                            alt="Pet preview"
                            className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={removePhoto}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                          <Upload className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          className="cursor-pointer"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Upload a square photo (max 5MB)
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="owner_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Owner Name <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="pet_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Pet Type <span className="text-red-500">*</span>
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Dog">Dog</SelectItem>
                              <SelectItem value="Cat">Cat</SelectItem>
                              <SelectItem value="Ferret">Ferret</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="breed"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Breed <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Golden Retriever" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Pet Name <span className="text-yellow-600">(Recommended)</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Max" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="date_of_birth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Date of Birth <span className="text-yellow-600">(Recommended)</span>
                          </FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormDescription className="text-xs">
                            Helps calculate age automatically
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="sex"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sex</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Male">Male</SelectItem>
                              <SelectItem value="Female">Female</SelectItem>
                              <SelectItem value="Unknown">Unknown</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="neutered_spayed"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Neutered/Spayed</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Yes">Yes</SelectItem>
                              <SelectItem value="No">No</SelectItem>
                              <SelectItem value="Unknown">Unknown</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* ID & Passport Section */}
              <AccordionItem value="identification" className="border-b">
                <AccordionTrigger className="text-base font-semibold">
                  ID & Passport (EU Pet Passport)
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="microchip_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Microchip Number</FormLabel>
                          <FormControl>
                            <Input placeholder="ISO 15-digit number" {...field} />
                          </FormControl>
                          <FormDescription className="text-xs">
                            ISO 15-digit format preferred
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="microchip_implantation_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Microchip Implantation Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="microchip_location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Microchip Location</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ""}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select location" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="neck/shoulder">Neck/Shoulder</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="eu_passport_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>EU Pet Passport Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Passport ID" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="passport_issuing_country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Passport Issuing Country</FormLabel>
                          <FormControl>
                            <Input placeholder="ISO country code (e.g., DE, FR, IT)" {...field} />
                          </FormControl>
                          <FormDescription className="text-xs">
                            ISO 3166-1 alpha-2 code
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="passport_issue_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Passport Issue Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="primary_vet_clinic"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary Vet/Issuing Authority</FormLabel>
                          <FormControl>
                            <Input placeholder="Clinic name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="primary_vet_contact"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vet Contact</FormLabel>
                          <FormControl>
                            <Input placeholder="Phone or email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tattoo_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tattoo ID (Legacy)</FormLabel>
                          <FormControl>
                            <Input placeholder="Tattoo identification" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tattoo_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tattoo Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Health & Wellness Section */}
              <AccordionItem value="health" className="border-b">
                <AccordionTrigger className="text-base font-semibold">
                  Health & Wellness
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="species_specific_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Species-Specific ID</FormLabel>
                          <FormControl>
                            <Input placeholder="FCI/Registry number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="color_markings"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Color/Markings</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Golden, White chest" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="weight_kg"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Weight (kg)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.1" placeholder="25.5" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="weight_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Weight Measurement Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="height_withers_cm"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Height/Withers (cm)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.1" placeholder="60.0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Known Conditions */}
                  <div className="space-y-2">
                    <FormLabel>Known Conditions</FormLabel>
                    {conditionFields.map((field, index) => (
                      <div key={field.id} className="flex gap-2">
                        <FormField
                          control={form.control}
                          name={`known_conditions.${index}`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input placeholder="Condition name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeCondition(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendCondition("")}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Condition
                    </Button>
                  </div>

                  <FormField
                    control={form.control}
                    name="conditions_notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Conditions Notes</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Additional notes about conditions..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Allergies */}
                  <div className="space-y-2">
                    <FormLabel>Allergies</FormLabel>
                    {allergyFields.map((field, index) => (
                      <div key={field.id} className="flex gap-2">
                        <FormField
                          control={form.control}
                          name={`allergies.${index}`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input placeholder="Allergen name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeAllergy(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendAllergy("")}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Allergy
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="diet_brand"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Diet Brand</FormLabel>
                          <FormControl>
                            <Input placeholder="Brand name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="diet_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Diet Type</FormLabel>
                          <FormControl>
                            <Input placeholder="Dry/Wet/Raw" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="feeding_schedule"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Feeding Schedule</FormLabel>
                        <FormControl>
                          <Textarea placeholder="e.g., Twice daily, 8am and 6pm" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="behavior_temperament"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Behavior/Temperament</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Describe personality and temperament..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="behavior_triggers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Behavior Triggers</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Things that trigger specific behaviors..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center space-x-2">
                    <FormField
                      control={form.control}
                      name="bite_history"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Bite History</FormLabel>
                            <FormDescription className="text-xs">
                              Has this pet had any bite incidents?
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="behavior_notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Behavior Notes</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Additional behavior information..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </AccordionContent>
              </AccordionItem>

              {/* Contacts & Emergencies Section */}
              <AccordionItem value="contacts" className="border-b">
                <AccordionTrigger className="text-base font-semibold">
                  Contacts & Emergencies
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm">Primary Veterinary Clinic</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="primary_vet_clinic_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Clinic Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Clinic name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="primary_vet_phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input placeholder="+49 30 12345678" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="primary_vet_address"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Input placeholder="Street address" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="primary_vet_email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="clinic@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-sm">24/7 Emergency Clinic</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="emergency_clinic_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Clinic Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Emergency clinic name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="emergency_clinic_phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input placeholder="Emergency phone" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="emergency_clinic_address"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Input placeholder="Emergency clinic address" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-sm">Microchip Registry</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="microchip_registry_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Registry Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Registry name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="microchip_registry_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Login/ID</FormLabel>
                            <FormControl>
                              <Input placeholder="Registry login/ID" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="microchip_registry_url"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Registry URL</FormLabel>
                            <FormControl>
                              <Input type="url" placeholder="https://..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-sm">Alternate Emergency Contact</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="alternate_emergency_contact_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="alternate_emergency_contact_phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input placeholder="Phone number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Ownership & Provenance Section */}
              <AccordionItem value="ownership" className="border-b">
                <AccordionTrigger className="text-base font-semibold">
                  Ownership & Provenance
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="acquired_from"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Acquired From</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select source" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="breeder">Breeder</SelectItem>
                            <SelectItem value="rescue">Rescue/Shelter</SelectItem>
                            <SelectItem value="private">Private Individual</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch("acquired_from") === "breeder" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
                      <FormField
                        control={form.control}
                        name="breeder_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Breeder Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Breeder name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="breeder_country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Breeder Country</FormLabel>
                            <FormControl>
                              <Input placeholder="Country" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="breeder_contact"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Breeder Contact</FormLabel>
                            <FormControl>
                              <Input placeholder="Phone or email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {form.watch("acquired_from") === "rescue" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-purple-50 rounded-lg">
                      <FormField
                        control={form.control}
                        name="rescue_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Rescue/Shelter Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Rescue name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="rescue_country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Rescue Country</FormLabel>
                            <FormControl>
                              <Input placeholder="Country" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="rescue_contact"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Rescue Contact</FormLabel>
                            <FormControl>
                              <Input placeholder="Phone or email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  <FormField
                    control={form.control}
                    name="acquisition_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Acquisition Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="registration_registry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Registration Registry</FormLabel>
                          <FormControl>
                            <Input placeholder="Registry name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="registration_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Registration Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Registration number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-sm">Insurance</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="insurance_provider"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Insurance Provider</FormLabel>
                            <FormControl>
                              <Input placeholder="Provider name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="insurance_policy_number"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Policy Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Policy #" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="insurance_emergency_hotline"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Emergency Hotline</FormLabel>
                            <FormControl>
                              <Input placeholder="24/7 hotline number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Travel & Compliance Section */}
              <AccordionItem value="travel" className="border-b">
                <AccordionTrigger className="text-base font-semibold">
                  Travel & Compliance
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="travel_notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Travel Notes</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Airline rules, crate size requirements, special travel notes..." 
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </AccordionContent>
              </AccordionItem>

              {/* Privacy & Consent Section */}
              <AccordionItem value="privacy" className="border-b">
                <AccordionTrigger className="text-base font-semibold">
                  Privacy & Consent
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="data_processing_consent"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Data Processing Consent</FormLabel>
                            <FormDescription className="text-xs">
                              I consent to the processing of my pet's data in accordance with GDPR regulations
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="emergency_sharing_enabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Emergency Sharing</FormLabel>
                            <FormDescription className="text-xs">
                              Allow showing contact information and microchip number on lost pet posters
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Additional Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any other information you'd like to add..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Pet
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

