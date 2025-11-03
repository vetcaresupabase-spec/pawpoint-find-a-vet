import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface ExportMedicalRecordsPDFProps {
  petId: string;
  petName: string;
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg";
}

export function ExportMedicalRecordsPDF({
  petId,
  petName,
  variant = "default",
  size = "default",
}: ExportMedicalRecordsPDFProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Fetch pet details
      const { data: pet, error: petError } = await supabase
        .from("pets")
        .select("*")
        .eq("id", petId)
        .single();

      if (petError) throw petError;

      // Fetch treatments
      const { data: treatments, error: treatmentsError } = await supabase
        .from("treatments")
        .select(`
          *,
          clinics(name),
          profiles:created_by(full_name)
        `)
        .eq("pet_id", petId)
        .order("treatment_date", { ascending: false });

      if (treatmentsError) throw treatmentsError;

      // Fetch prescriptions
      const { data: prescriptions, error: prescriptionsError } = await supabase
        .from("prescriptions")
        .select("*")
        .eq("pet_id", petId)
        .order("created_at", { ascending: false });

      if (prescriptionsError) throw prescriptionsError;

      // Generate HTML for PDF
      const htmlContent = generatePDFHTML(pet, treatments || [], prescriptions || []);

      // Create a new window for printing
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        throw new Error("Please allow pop-ups to export PDF");
      }

      printWindow.document.write(htmlContent);
      printWindow.document.close();

      // Wait for content to load then print
      printWindow.onload = () => {
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          // Don't close automatically - let user save/print
        }, 500);
      };

      toast({
        title: "Export Ready",
        description: "Use the print dialog to save as PDF or print.",
      });
    } catch (error: any) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export medical records.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleExport}
      disabled={isExporting}
    >
      {isExporting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Preparing...
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          Export PDF
        </>
      )}
    </Button>
  );
}

function generatePDFHTML(pet: any, treatments: any[], prescriptions: any[]): string {
  const today = format(new Date(), "MMMM dd, yyyy");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Medical Records - ${pet.name}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          padding: 40px;
          line-height: 1.6;
          color: #333;
        }
        
        .header {
          border-bottom: 3px solid #2563eb;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        
        .header h1 {
          color: #2563eb;
          font-size: 28px;
          margin-bottom: 5px;
        }
        
        .header .subtitle {
          color: #666;
          font-size: 14px;
        }
        
        .pet-info {
          background: #f8fafc;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
        }
        
        .info-item {
          display: flex;
          flex-direction: column;
        }
        
        .info-label {
          font-size: 12px;
          color: #666;
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 0.5px;
        }
        
        .info-value {
          font-size: 16px;
          color: #000;
          margin-top: 3px;
        }
        
        .section {
          margin-bottom: 40px;
          page-break-inside: avoid;
        }
        
        .section-title {
          font-size: 20px;
          color: #1e40af;
          margin-bottom: 15px;
          padding-bottom: 8px;
          border-bottom: 2px solid #e5e7eb;
        }
        
        .treatment-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-left: 4px solid #2563eb;
          padding: 20px;
          margin-bottom: 20px;
          page-break-inside: avoid;
        }
        
        .treatment-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 15px;
        }
        
        .treatment-type {
          background: #2563eb;
          color: white;
          padding: 4px 12px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }
        
        .treatment-date {
          font-size: 14px;
          color: #666;
        }
        
        .treatment-diagnosis {
          font-size: 18px;
          font-weight: 600;
          color: #000;
          margin-bottom: 15px;
        }
        
        .soap-section {
          margin-bottom: 15px;
        }
        
        .soap-label {
          font-size: 14px;
          font-weight: 600;
          color: #1e40af;
          margin-bottom: 5px;
        }
        
        .soap-text {
          font-size: 14px;
          color: #333;
          white-space: pre-wrap;
          line-height: 1.5;
        }
        
        .medications-list {
          background: #f1f5f9;
          padding: 15px;
          border-radius: 6px;
          margin-top: 10px;
        }
        
        .medication-item {
          margin-bottom: 10px;
          padding-bottom: 10px;
          border-bottom: 1px solid #cbd5e1;
        }
        
        .medication-item:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }
        
        .medication-name {
          font-weight: 600;
          font-size: 14px;
          color: #000;
        }
        
        .medication-details {
          font-size: 13px;
          color: #555;
          margin-top: 3px;
        }
        
        .footer {
          margin-top: 50px;
          padding-top: 20px;
          border-top: 2px solid #e5e7eb;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
        
        .no-data {
          font-style: italic;
          color: #999;
          text-align: center;
          padding: 20px;
        }
        
        @media print {
          body {
            padding: 20px;
          }
          
          .treatment-card {
            page-break-inside: avoid;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🐾 EU Pet Passport - Medical Records</h1>
        <div class="subtitle">Generated on ${today}</div>
      </div>
      
      <div class="pet-info">
        <div class="info-item">
          <div class="info-label">Pet Name</div>
          <div class="info-value">${pet.name || "N/A"}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Species & Breed</div>
          <div class="info-value">${pet.pet_type || "N/A"} - ${pet.breed || "N/A"}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Date of Birth</div>
          <div class="info-value">${pet.date_of_birth ? format(new Date(pet.date_of_birth), "MMMM dd, yyyy") : "N/A"}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Sex</div>
          <div class="info-value">${pet.sex || "N/A"}${pet.neutered_spayed === "Yes" ? " (Neutered/Spayed)" : ""}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Microchip Number</div>
          <div class="info-value">${pet.microchip_number || "N/A"}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Owner</div>
          <div class="info-value">${pet.owner_name || "N/A"}</div>
        </div>
      </div>
      
      ${treatments && treatments.length > 0 ? `
        <div class="section">
          <h2 class="section-title">Treatment History (${treatments.length} Records)</h2>
          ${treatments.map((t: any) => `
            <div class="treatment-card">
              <div class="treatment-header">
                <span class="treatment-type">${t.treatment_type || "Treatment"}</span>
                <span class="treatment-date">${t.treatment_date ? format(new Date(t.treatment_date), "MMM dd, yyyy") : "N/A"}</span>
              </div>
              
              ${t.diagnosis ? `<div class="treatment-diagnosis">${t.diagnosis}</div>` : ""}
              
              ${t.subjective ? `
                <div class="soap-section">
                  <div class="soap-label">Subjective (S)</div>
                  <div class="soap-text">${t.subjective}</div>
                </div>
              ` : ""}
              
              ${t.objective ? `
                <div class="soap-section">
                  <div class="soap-label">Objective (O)</div>
                  <div class="soap-text">${t.objective}</div>
                </div>
              ` : ""}
              
              ${t.assessment ? `
                <div class="soap-section">
                  <div class="soap-label">Assessment (A)</div>
                  <div class="soap-text">${t.assessment}</div>
                </div>
              ` : ""}
              
              ${t.plan ? `
                <div class="soap-section">
                  <div class="soap-label">Plan (P)</div>
                  <div class="soap-text">${t.plan}</div>
                </div>
              ` : ""}
              
              ${t.medications && Array.isArray(t.medications) && t.medications.length > 0 ? `
                <div class="soap-section">
                  <div class="soap-label">Medications Prescribed</div>
                  <div class="medications-list">
                    ${t.medications.map((med: any) => `
                      <div class="medication-item">
                        <div class="medication-name">${med.medication_name || "Medication"}</div>
                        <div class="medication-details">
                          ${med.dosage ? `Dosage: ${med.dosage}` : ""}
                          ${med.frequency ? ` | Frequency: ${med.frequency}` : ""}
                          ${med.duration ? ` | Duration: ${med.duration}` : ""}
                        </div>
                      </div>
                    `).join("")}
                  </div>
                </div>
              ` : ""}
              
              <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #666;">
                <strong>Clinic:</strong> ${t.clinics?.name || "Unknown Clinic"} | 
                <strong>Veterinarian:</strong> ${t.profiles?.full_name || "Unknown"}
              </div>
            </div>
          `).join("")}
        </div>
      ` : `
        <div class="section">
          <h2 class="section-title">Treatment History</h2>
          <div class="no-data">No treatment records found.</div>
        </div>
      `}
      
      ${prescriptions && prescriptions.length > 0 ? `
        <div class="section">
          <h2 class="section-title">Active Prescriptions</h2>
          <div class="medications-list">
            ${prescriptions.filter((p: any) => p.status === "active").map((p: any) => `
              <div class="medication-item">
                <div class="medication-name">${p.medication_name}</div>
                <div class="medication-details">
                  Dosage: ${p.dosage} | Frequency: ${p.frequency} | Duration: ${p.duration}
                  ${p.refills_remaining > 0 ? ` | Refills: ${p.refills_remaining}` : ""}
                </div>
                ${p.instructions ? `<div style="margin-top: 5px; font-size: 12px;">${p.instructions}</div>` : ""}
              </div>
            `).join("")}
          </div>
        </div>
      ` : ""}
      
      <div class="footer">
        <p>This document was generated from PawPoint Medical Records System</p>
        <p>All information is confidential and should be handled according to data protection regulations</p>
      </div>
    </body>
    </html>
  `;
}

