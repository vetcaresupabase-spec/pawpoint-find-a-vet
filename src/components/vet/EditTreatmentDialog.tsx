import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface EditTreatmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  treatment: any;
  onSuccess?: () => void;
}

export function EditTreatmentDialog({
  open,
  onOpenChange,
  treatment,
  onSuccess,
}: EditTreatmentDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amendmentNotes, setAmendmentNotes] = useState("");
  
  // Form state
  const [diagnosis, setDiagnosis] = useState("");
  const [subjective, setSubjective] = useState("");
  const [objective, setObjective] = useState("");
  const [assessment, setAssessment] = useState("");
  const [plan, setPlan] = useState("");
  const [notes, setNotes] = useState("");

  // Load treatment data when dialog opens
  useEffect(() => {
    if (treatment && open) {
      setDiagnosis(treatment.diagnosis || "");
      setSubjective(treatment.subjective || "");
      setObjective(treatment.objective || "");
      setAssessment(treatment.assessment || "");
      setPlan(treatment.plan || "");
      setNotes(treatment.notes || "");
      setAmendmentNotes("");
    }
  }, [treatment, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amendmentNotes.trim()) {
      toast({
        title: "Amendment Notes Required",
        description: "Please provide a reason for editing this treatment record.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare updates
      const updates = {
        diagnosis,
        subjective,
        objective,
        assessment,
        plan,
        notes,
      };

      // Call RPC function to update with audit
      const { error } = await supabase.rpc("update_treatment_with_audit", {
        p_treatment_id: treatment.id,
        p_amendment_notes: amendmentNotes,
        p_updates: updates,
      });

      if (error) throw error;

      toast({
        title: "Treatment Updated",
        description: "Treatment record has been successfully updated.",
      });

      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error("Error updating treatment:", error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update treatment record.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!treatment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Treatment Record</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Treatment for {treatment.pet_name || "Unknown Pet"} on{" "}
            {new Date(treatment.treatment_date).toLocaleDateString()}
          </p>
          {treatment.amendment_count > 0 && (
            <p className="text-xs text-amber-600">
              This record has been amended {treatment.amendment_count} time(s)
            </p>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="soap" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="soap">SOAP Notes</TabsTrigger>
              <TabsTrigger value="additional">Additional Info</TabsTrigger>
            </TabsList>

            <TabsContent value="soap" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="diagnosis">Diagnosis *</Label>
                <Input
                  id="diagnosis"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="Primary diagnosis"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subjective">Subjective (S)</Label>
                <Textarea
                  id="subjective"
                  value={subjective}
                  onChange={(e) => setSubjective(e.target.value)}
                  placeholder="What the owner tells you - symptoms, history, concerns..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="objective">Objective (O)</Label>
                <Textarea
                  id="objective"
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  placeholder="What you observe - physical exam findings, vital signs, test results..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="assessment">Assessment (A)</Label>
                <Textarea
                  id="assessment"
                  value={assessment}
                  onChange={(e) => setAssessment(e.target.value)}
                  placeholder="Your clinical interpretation - diagnosis, differential diagnoses..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="plan">Plan (P)</Label>
                <Textarea
                  id="plan"
                  value={plan}
                  onChange={(e) => setPlan(e.target.value)}
                  placeholder="Treatment plan - medications, procedures, follow-up..."
                  rows={3}
                />
              </div>
            </TabsContent>

            <TabsContent value="additional" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional information or observations..."
                  rows={4}
                />
              </div>

              <div className="p-4 bg-muted rounded-lg space-y-2">
                <p className="text-sm font-medium">Original Treatment Information</p>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Created: {new Date(treatment.created_at).toLocaleString()}</p>
                  <p>Type: {treatment.treatment_type}</p>
                  {treatment.amended_at && (
                    <p>Last Amended: {new Date(treatment.amended_at).toLocaleString()}</p>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Amendment Notes - Required */}
          <div className="space-y-2 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <Label htmlFor="amendmentNotes" className="text-amber-900">
              Amendment Notes * (Required)
            </Label>
            <Textarea
              id="amendmentNotes"
              value={amendmentNotes}
              onChange={(e) => setAmendmentNotes(e.target.value)}
              placeholder="Explain why you're editing this record (e.g., 'Correcting medication dosage typo' or 'Adding additional findings from follow-up call')"
              rows={2}
              required
              className="bg-white"
            />
            <p className="text-xs text-amber-700">
              All amendments are logged for audit purposes. Please be specific about what changed and why.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
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
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

