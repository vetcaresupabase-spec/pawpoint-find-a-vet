import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { format, parseISO } from "date-fns";
import { Calendar, Stethoscope, FileText, User, Building2, AlertCircle, Edit, Printer } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EditTreatmentDialog } from "./EditTreatmentDialog";

interface TreatmentRecord {
  id: string;
  treatment_date: string;
  treatment_type: string;
  diagnosis: string | null;
  subjective: string | null;
  objective: string | null;
  assessment: string | null;
  plan: string | null;
  vet_name: string;
  clinic_name: string;
  created_at: string;
  medications?: any[];
  diagnostic_tests?: any[];
  certificates?: any[];
  vital_signs?: any;
  follow_up_instructions?: string;
  follow_up_date?: string;
  notes?: string;
  vaccine_type?: string;
  deworming_product?: string;
  antiparasitic_product?: string;
}

interface TreatmentRecordsProps {
  petId: string;
  petName?: string;
  readOnly?: boolean; // For pet owner view
}

export function TreatmentRecords({ petId, petName, readOnly = false }: TreatmentRecordsProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTreatment, setSelectedTreatment] = useState<any>(null);
  const { data: treatments = [], isLoading, error } = useQuery({
    queryKey: ["petTreatments", petId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_pet_treatments", {
        p_pet_id: petId,
      });

      if (error) {
        console.error("Error fetching treatments:", error);
        throw error;
      }

      // For each treatment, fetch full details if user has access
      const fullTreatments = await Promise.all(
        (data || []).map(async (treatment: any) => {
          // Fetch full treatment details
          const { data: fullData, error: fetchError } = await supabase
            .from("treatments")
            .select("*")
            .eq("id", treatment.id)
            .single();

          if (fetchError || !fullData) {
            return treatment; // Return basic info if full access denied
          }

          // Log view for audit trail
          await supabase.rpc("log_treatment_view", {
            p_treatment_id: treatment.id,
          });

          return { ...treatment, ...fullData };
        })
      );

      return fullTreatments as TreatmentRecord[];
    },
    enabled: !!petId,
  });

  const getTreatmentTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      examination: "bg-blue-500/10 text-blue-700 border-blue-200",
      vaccination: "bg-green-500/10 text-green-700 border-green-200",
      deworming: "bg-orange-500/10 text-orange-700 border-orange-200",
      antiparasitic: "bg-purple-500/10 text-purple-700 border-purple-200",
      surgery: "bg-red-500/10 text-red-700 border-red-200",
      dental: "bg-yellow-500/10 text-yellow-700 border-yellow-200",
      diagnostics: "bg-cyan-500/10 text-cyan-700 border-cyan-200",
      medication: "bg-pink-500/10 text-pink-700 border-pink-200",
      other: "bg-gray-500/10 text-gray-700 border-gray-200",
    };
    return colors[type] || colors.other;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-muted-foreground">Loading treatment records...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load treatment records. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  if (treatments.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Stethoscope className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No treatment records found for {petName}.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Treatment Records - {petName}
          {readOnly && (
            <Badge variant="outline" className="ml-auto">
              Read Only
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px]">
          <div className="space-y-4">
            {treatments.map((treatment) => (
              <Card key={treatment.id} className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge className={getTreatmentTypeBadge(treatment.treatment_type)}>
                          {treatment.treatment_type.charAt(0).toUpperCase() + treatment.treatment_type.slice(1)}
                        </Badge>
                        {treatment.diagnosis && (
                          <span className="text-sm font-medium">{treatment.diagnosis}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(parseISO(treatment.treatment_date), "MMM dd, yyyy 'at' HH:mm")}
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {treatment.vet_name}
                        </div>
                        <div className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {treatment.clinic_name}
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons (Vet Only) */}
                    {!readOnly && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedTreatment(treatment);
                            setEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            window.print();
                          }}
                        >
                          <Printer className="h-4 w-4 mr-1" />
                          Print
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="soap" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="soap">SOAP</TabsTrigger>
                      <TabsTrigger value="details">Details</TabsTrigger>
                      <TabsTrigger value="medications">Medications</TabsTrigger>
                      <TabsTrigger value="followup">Follow-up</TabsTrigger>
                    </TabsList>

                    {/* SOAP Notes Tab */}
                    <TabsContent value="soap" className="space-y-3 mt-4">
                      {treatment.subjective && (
                        <div>
                          <h4 className="text-sm font-semibold mb-1">Subjective</h4>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {treatment.subjective}
                          </p>
                        </div>
                      )}
                      {treatment.objective && (
                        <div>
                          <h4 className="text-sm font-semibold mb-1">Objective</h4>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {treatment.objective}
                          </p>
                        </div>
                      )}
                      {treatment.assessment && (
                        <div>
                          <h4 className="text-sm font-semibold mb-1">Assessment</h4>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {treatment.assessment}
                          </p>
                        </div>
                      )}
                      {treatment.plan && (
                        <div>
                          <h4 className="text-sm font-semibold mb-1">Plan</h4>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {treatment.plan}
                          </p>
                        </div>
                      )}
                      {!treatment.subjective && !treatment.objective && !treatment.assessment && !treatment.plan && (
                        <p className="text-sm text-muted-foreground italic">No SOAP notes recorded.</p>
                      )}
                    </TabsContent>

                    {/* Details Tab */}
                    <TabsContent value="details" className="space-y-3 mt-4">
                      {/* Vital Signs */}
                      {treatment.vital_signs && Object.keys(treatment.vital_signs).length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold mb-2">Vital Signs</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            {treatment.vital_signs.temperature && (
                              <div>
                                <span className="text-muted-foreground">Temperature: </span>
                                <span className="font-medium">{treatment.vital_signs.temperature}°C</span>
                              </div>
                            )}
                            {treatment.vital_signs.heart_rate && (
                              <div>
                                <span className="text-muted-foreground">Heart Rate: </span>
                                <span className="font-medium">{treatment.vital_signs.heart_rate} bpm</span>
                              </div>
                            )}
                            {treatment.vital_signs.respiratory_rate && (
                              <div>
                                <span className="text-muted-foreground">Respiratory Rate: </span>
                                <span className="font-medium">{treatment.vital_signs.respiratory_rate} bpm</span>
                              </div>
                            )}
                            {treatment.vital_signs.weight_kg && (
                              <div>
                                <span className="text-muted-foreground">Weight: </span>
                                <span className="font-medium">{treatment.vital_signs.weight_kg} kg</span>
                              </div>
                            )}
                            {treatment.vital_signs.body_condition_score && (
                              <div>
                                <span className="text-muted-foreground">BCS: </span>
                                <span className="font-medium">{treatment.vital_signs.body_condition_score}/9</span>
                              </div>
                            )}
                          </div>
                          {treatment.vital_signs.notes && (
                            <p className="text-sm text-muted-foreground mt-2">
                              {treatment.vital_signs.notes}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Vaccination */}
                      {treatment.vaccine_type && (
                        <div>
                          <h4 className="text-sm font-semibold mb-2">Vaccination</h4>
                          <div className="text-sm space-y-1">
                            <div><span className="text-muted-foreground">Type: </span><span className="font-medium">{treatment.vaccine_type}</span></div>
                            {treatment.vaccine_batch_number && (
                              <div><span className="text-muted-foreground">Batch: </span><span className="font-medium">{treatment.vaccine_batch_number}</span></div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Deworming */}
                      {treatment.deworming_product && (
                        <div>
                          <h4 className="text-sm font-semibold mb-2">Deworming</h4>
                          <div className="text-sm space-y-1">
                            <div><span className="text-muted-foreground">Product: </span><span className="font-medium">{treatment.deworming_product}</span></div>
                            {treatment.deworming_dose && (
                              <div><span className="text-muted-foreground">Dose: </span><span className="font-medium">{treatment.deworming_dose}</span></div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Antiparasitic */}
                      {treatment.antiparasitic_product && (
                        <div>
                          <h4 className="text-sm font-semibold mb-2">Antiparasitic Treatment</h4>
                          <div className="text-sm space-y-1">
                            <div><span className="text-muted-foreground">Product: </span><span className="font-medium">{treatment.antiparasitic_product}</span></div>
                            {treatment.antiparasitic_type && (
                              <div><span className="text-muted-foreground">Type: </span><span className="font-medium">{treatment.antiparasitic_type.replace('_', ' ')}</span></div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Diagnostic Tests */}
                      {treatment.diagnostic_tests && Array.isArray(treatment.diagnostic_tests) && treatment.diagnostic_tests.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold mb-2">Diagnostic Tests</h4>
                          <div className="space-y-2">
                            {treatment.diagnostic_tests.map((test: any, idx: number) => (
                              <div key={idx} className="text-sm border-l-2 border-l-blue-200 pl-2">
                                <div className="font-medium">{test.test_type}</div>
                                {test.results && <div className="text-muted-foreground">{test.results}</div>}
                                {test.notes && <div className="text-muted-foreground text-xs mt-1">{test.notes}</div>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Certificates */}
                      {treatment.certificates && Array.isArray(treatment.certificates) && treatment.certificates.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold mb-2">Certificates</h4>
                          <div className="space-y-2">
                            {treatment.certificates.map((cert: any, idx: number) => (
                              <div key={idx} className="text-sm border-l-2 border-l-green-200 pl-2">
                                <div className="font-medium">{cert.type}</div>
                                {cert.number && <div className="text-muted-foreground">#{cert.number}</div>}
                                {cert.issue_date && (
                                  <div className="text-muted-foreground text-xs">
                                    Issued: {format(parseISO(cert.issue_date), "MMM dd, yyyy")}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* General Notes */}
                      {treatment.notes && (
                        <div>
                          <h4 className="text-sm font-semibold mb-2">Additional Notes</h4>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{treatment.notes}</p>
                        </div>
                      )}
                    </TabsContent>

                    {/* Medications Tab */}
                    <TabsContent value="medications" className="mt-4">
                      {treatment.medications && Array.isArray(treatment.medications) && treatment.medications.length > 0 ? (
                        <div className="space-y-3">
                          {treatment.medications.map((med: any, idx: number) => (
                            <Card key={idx} className="p-3">
                              <div className="font-medium mb-2">{med.name}</div>
                              <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                                {med.dosage && <div>Dosage: {med.dosage}</div>}
                                {med.frequency && <div>Frequency: {med.frequency}</div>}
                                {med.duration && <div>Duration: {med.duration}</div>}
                              </div>
                              {med.instructions && (
                                <div className="text-sm text-muted-foreground mt-2">
                                  <span className="font-medium">Instructions: </span>
                                  {med.instructions}
                                </div>
                              )}
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">No medications prescribed.</p>
                      )}
                    </TabsContent>

                    {/* Follow-up Tab */}
                    <TabsContent value="followup" className="mt-4">
                      {treatment.follow_up_instructions || treatment.follow_up_date ? (
                        <div className="space-y-3">
                          {treatment.follow_up_date && (
                            <div>
                              <h4 className="text-sm font-semibold mb-1">Follow-up Date</h4>
                              <p className="text-sm">{format(parseISO(treatment.follow_up_date), "MMMM dd, yyyy")}</p>
                            </div>
                          )}
                          {treatment.follow_up_instructions && (
                            <div>
                              <h4 className="text-sm font-semibold mb-1">Instructions</h4>
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {treatment.follow_up_instructions}
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">No follow-up instructions.</p>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      
      {/* Edit Treatment Dialog */}
      <EditTreatmentDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        treatment={selectedTreatment}
        onSuccess={() => {
          // Refetch treatments after successful edit
          window.location.reload(); // Simple refresh for now
        }}
      />
    </Card>
  );
}
