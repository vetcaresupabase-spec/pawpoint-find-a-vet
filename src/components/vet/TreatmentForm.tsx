import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, X, Stethoscope, Syringe, Pill, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

// Zod schema for treatment form
const treatmentSchema = z.object({
  treatment_type: z.enum([
    "examination",
    "vaccination",
    "deworming",
    "antiparasitic",
    "surgery",
    "dental",
    "diagnostics",
    "medication",
    "other",
  ]),
  diagnosis: z.string().optional(),
  
  // SOAP Notes
  subjective: z.string().optional(),
  objective: z.string().optional(),
  assessment: z.string().optional(),
  plan: z.string().optional(),
  
  // Vaccination
  vaccine_type: z.string().optional(),
  vaccine_batch_number: z.string().optional(),
  vaccine_expiry_date: z.string().optional(),
  vaccine_manufacturer: z.string().optional(),
  next_vaccination_due: z.string().optional(),
  
  // Deworming
  deworming_product: z.string().optional(),
  deworming_dose: z.string().optional(),
  deworming_date: z.string().optional(),
  next_deworming_due: z.string().optional(),
  
  // Antiparasitic
  antiparasitic_product: z.string().optional(),
  antiparasitic_type: z.enum([
    "flea_treatment",
    "tick_treatment",
    "heartworm_prevention",
    "combination",
    "other",
  ]).optional(),
  antiparasitic_dose: z.string().optional(),
  antiparasitic_date: z.string().optional(),
  next_antiparasitic_due: z.string().optional(),
  
  // Medications
  medications: z.array(z.object({
    name: z.string().min(1, "Medication name is required"),
    dosage: z.string().optional(),
    frequency: z.string().optional(),
    duration: z.string().optional(),
    instructions: z.string().optional(),
  })).optional(),
  
  // Diagnostic Tests
  diagnostic_tests: z.array(z.object({
    test_type: z.string().min(1, "Test type is required"),
    results: z.string().optional(),
    notes: z.string().optional(),
  })).optional(),
  
  // Certificates
  certificates: z.array(z.object({
    type: z.string().min(1, "Certificate type is required"),
    number: z.string().optional(),
    issue_date: z.string().optional(),
    expiry_date: z.string().optional(),
  })).optional(),
  
  // Vital Signs
  vital_signs: z.object({
    temperature: z.string().optional(),
    heart_rate: z.string().optional(),
    respiratory_rate: z.string().optional(),
    weight_kg: z.string().optional(),
    body_condition_score: z.string().optional(),
    notes: z.string().optional(),
  }).optional(),
  
  // Follow-up
  follow_up_instructions: z.string().optional(),
  follow_up_date: z.string().optional(),
  
  // General notes
  notes: z.string().optional(),
});

type TreatmentFormData = z.infer<typeof treatmentSchema>;

interface TreatmentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  petId: string;
  clinicId: string;
  petName: string;
  onSuccess?: () => void;
}

export function TreatmentForm({
  open,
  onOpenChange,
  bookingId,
  petId,
  clinicId,
  petName,
  onSuccess,
}: TreatmentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TreatmentFormData>({
    resolver: zodResolver(treatmentSchema),
    defaultValues: {
      treatment_type: "examination",
      medications: [],
      diagnostic_tests: [],
      certificates: [],
      vital_signs: {},
    },
  });

  const medicationFields = useFieldArray({
    control: form.control,
    name: "medications",
  });

  const diagnosticFields = useFieldArray({
    control: form.control,
    name: "diagnostic_tests",
  });

  const certificateFields = useFieldArray({
    control: form.control,
    name: "certificates",
  });

  const treatmentType = form.watch("treatment_type");

  const onSubmit = async (data: TreatmentFormData) => {
    setIsSubmitting(true);
    try {
      // Prepare data for RPC function call (matching function parameter names)
      const treatmentData = {
        p_booking_id: bookingId || null,
        p_pet_id: petId,
        p_clinic_id: clinicId,
        p_treatment_type: data.treatment_type,
        p_diagnosis: data.diagnosis || null,
        
        // SOAP Notes
        p_subjective: data.subjective || null,
        p_objective: data.objective || null,
        p_assessment: data.assessment || null,
        p_plan: data.plan || null,
        
        // Vaccination
        p_vaccine_type: data.vaccine_type || null,
        p_vaccine_batch_number: data.vaccine_batch_number || null,
        p_deworming_product: data.deworming_product || null,
        p_antiparasitic_product: data.antiparasitic_product || null,
        
        // Complex fields
        p_certificates: data.certificates && data.certificates.length > 0 ? data.certificates : null,
        p_medications: data.medications && data.medications.length > 0 ? data.medications : null,
        p_diagnostic_tests: data.diagnostic_tests && data.diagnostic_tests.length > 0 ? data.diagnostic_tests : null,
        p_vital_signs: data.vital_signs && Object.keys(data.vital_signs).length > 0 ? data.vital_signs : null,
        
        // Follow-up
        p_follow_up_instructions: data.follow_up_instructions || null,
        p_follow_up_date: data.follow_up_date || null,
        p_notes: data.notes || null,
      };

      // Call the RPC function to create treatment
      const { data: treatmentId, error } = await supabase.rpc('create_treatment_with_audit', treatmentData);

      if (error) {
        console.error("Error creating treatment:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to create treatment record.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Treatment Recorded",
        description: "Treatment has been successfully recorded and added to medical history.",
      });

      form.reset();
      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error creating treatment:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create treatment record.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5" />
            Start Treatment - {petName}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="soap" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="soap">SOAP Notes</TabsTrigger>
                <TabsTrigger value="eu">EU Entries</TabsTrigger>
                <TabsTrigger value="medications">Medications</TabsTrigger>
                <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
                <TabsTrigger value="vitals">Vital Signs</TabsTrigger>
              </TabsList>

              {/* Basic Info Card - Always Visible */}
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-lg">Treatment Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="treatment_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Treatment Type *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select treatment type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="examination">Examination</SelectItem>
                            <SelectItem value="vaccination">Vaccination</SelectItem>
                            <SelectItem value="deworming">Deworming</SelectItem>
                            <SelectItem value="antiparasitic">Antiparasitic Treatment</SelectItem>
                            <SelectItem value="surgery">Surgery</SelectItem>
                            <SelectItem value="dental">Dental</SelectItem>
                            <SelectItem value="diagnostics">Diagnostics</SelectItem>
                            <SelectItem value="medication">Medication</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="diagnosis"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Diagnosis</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Routine checkup, URI" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* SOAP Notes Tab */}
              <TabsContent value="soap" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      SOAP Clinical Notes
                    </CardTitle>
                    <FormDescription>
                      Standard clinical note format: Subjective, Objective, Assessment, Plan
                    </FormDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="subjective"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            S - Subjective <span className="text-muted-foreground font-normal">(Patient history, owner observations)</span>
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Owner reports: pet has been lethargic for 2 days, decreased appetite..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="objective"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            O - Objective <span className="text-muted-foreground font-normal">(Physical exam findings, test results)</span>
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Physical exam: Temp 39.5°C, heart rate elevated, slight dehydration..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="assessment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            A - Assessment <span className="text-muted-foreground font-normal">(Clinical impressions, diagnosis)</span>
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Assessment: Suspected upper respiratory infection. Rule out other causes..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="plan"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            P - Plan <span className="text-muted-foreground font-normal">(Treatment plan, medications, follow-up)</span>
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Plan: Prescribe antibiotics, supportive care, recheck in 7 days..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* EU Entries Tab */}
              <TabsContent value="eu" className="space-y-4">
                {/* Vaccination Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Syringe className="h-5 w-5" />
                      Vaccination
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="vaccine_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vaccine Type</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., DHPPi, Rabies" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="vaccine_batch_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Batch Number</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., ABC123456" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="vaccine_manufacturer"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Manufacturer</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Zoetis, Merial" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="vaccine_expiry_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expiry Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="next_vaccination_due"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Next Vaccination Due</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Deworming Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Pill className="h-5 w-5" />
                      Deworming
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="deworming_product"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Drontal Plus" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="deworming_dose"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dose</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 1 tablet (based on weight)" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="deworming_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date Administered</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="next_deworming_due"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Next Deworming Due</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Antiparasitic Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Pill className="h-5 w-5" />
                      Antiparasitic Treatment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="antiparasitic_product"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Frontline, Bravecto" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="antiparasitic_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="flea_treatment">Flea Treatment</SelectItem>
                              <SelectItem value="tick_treatment">Tick Treatment</SelectItem>
                              <SelectItem value="heartworm_prevention">Heartworm Prevention</SelectItem>
                              <SelectItem value="combination">Combination</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="antiparasitic_dose"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dose</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 1 pipette, 1 tablet" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="antiparasitic_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date Administered</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="next_antiparasitic_due"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Next Treatment Due</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Certificates Section */}
                <Card>
                  <CardHeader>
                    <CardTitle>Certificates & Documentation</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {certificateFields.fields.map((field, index) => (
                      <Card key={field.id} className="p-4">
                        <div className="flex items-start justify-between mb-4">
                          <h4 className="font-medium">Certificate {index + 1}</h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => certificateFields.remove(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`certificates.${index}.type`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Certificate Type *</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., EU Pet Passport, Health Certificate" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`certificates.${index}.number`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Certificate Number</FormLabel>
                                <FormControl>
                                  <Input placeholder="Certificate number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`certificates.${index}.issue_date`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Issue Date</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`certificates.${index}.expiry_date`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Expiry Date</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </Card>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => certificateFields.append({ type: "", number: "", issue_date: "", expiry_date: "" })}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Certificate
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Medications Tab */}
              <TabsContent value="medications" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Prescribed Medications</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {medicationFields.fields.map((field, index) => (
                      <Card key={field.id} className="p-4">
                        <div className="flex items-start justify-between mb-4">
                          <h4 className="font-medium">Medication {index + 1}</h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => medicationFields.remove(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`medications.${index}.name`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Medication Name *</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., Amoxicillin 250mg" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`medications.${index}.dosage`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Dosage</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., 10mg/kg" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`medications.${index}.frequency`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Frequency</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., Twice daily" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`medications.${index}.duration`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Duration</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., 7 days" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`medications.${index}.instructions`}
                            render={({ field }) => (
                              <FormItem className="col-span-2">
                                <FormLabel>Instructions</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Special instructions for administration..."
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </Card>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => medicationFields.append({ name: "", dosage: "", frequency: "", duration: "", instructions: "" })}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Medication
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Diagnostics Tab */}
              <TabsContent value="diagnostics" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Diagnostic Tests</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {diagnosticFields.fields.map((field, index) => (
                      <Card key={field.id} className="p-4">
                        <div className="flex items-start justify-between mb-4">
                          <h4 className="font-medium">Test {index + 1}</h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => diagnosticFields.remove(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`diagnostic_tests.${index}.test_type`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Test Type *</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., Blood test, X-ray, Urine analysis" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`diagnostic_tests.${index}.results`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Results</FormLabel>
                                <FormControl>
                                  <Input placeholder="Test results..." {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`diagnostic_tests.${index}.notes`}
                            render={({ field }) => (
                              <FormItem className="col-span-2">
                                <FormLabel>Notes</FormLabel>
                                <FormControl>
                                  <Textarea placeholder="Additional notes about the test..." {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </Card>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => diagnosticFields.append({ test_type: "", results: "", notes: "" })}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Diagnostic Test
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Vital Signs Tab */}
              <TabsContent value="vitals" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Vital Signs & Measurements</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="vital_signs.temperature"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Temperature (°C)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.1" placeholder="e.g., 38.5" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="vital_signs.heart_rate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Heart Rate (bpm)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="e.g., 120" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="vital_signs.respiratory_rate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Respiratory Rate (bpm)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="e.g., 30" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="vital_signs.weight_kg"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Weight (kg)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.1" placeholder="e.g., 15.5" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="vital_signs.body_condition_score"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Body Condition Score (1-9)</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" max="9" placeholder="e.g., 5" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="vital_signs.notes"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Vital Signs Notes</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Additional observations about vital signs..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Follow-up Section */}
                <Card>
                  <CardHeader>
                    <CardTitle>Follow-up Instructions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="follow_up_instructions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Follow-up Instructions</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="e.g., Recheck in 7 days, monitor appetite, return if symptoms worsen..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="follow_up_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Follow-up Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* General Notes */}
                <Card>
                  <CardHeader>
                    <CardTitle>Additional Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea
                              placeholder="Any additional notes or observations..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <DialogFooter>
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
                Save Treatment Record
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
