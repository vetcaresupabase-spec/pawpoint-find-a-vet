import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SectionConfig {
  id: string;
  label: string;
  fields: string[];
}

export const PET_FORM_SECTIONS: SectionConfig[] = [
  {
    id: "basics",
    label: "Basics",
    fields: ["owner_name", "breed", "name", "date_of_birth"],
  },
  {
    id: "identification",
    label: "ID",
    fields: [
      "microchip_number", "eu_passport_number", "passport_issuing_country",
      "tattoo_id", "primary_vet_clinic",
    ],
  },
  {
    id: "health",
    label: "Health",
    fields: [
      "species_specific_id", "color_markings", "weight_kg", "height_withers_cm",
      "conditions_notes", "diet_brand", "diet_type", "feeding_schedule",
      "behavior_temperament", "behavior_triggers", "behavior_notes",
      "known_conditions", "allergies",
    ],
  },
  {
    id: "contacts",
    label: "Contacts",
    fields: [
      "primary_vet_clinic_name", "primary_vet_phone", "emergency_clinic_name",
      "emergency_clinic_phone", "alternate_emergency_contact_name",
    ],
  },
  {
    id: "ownership",
    label: "Ownership",
    fields: [
      "acquired_from", "acquisition_date", "registration_registry",
      "registration_number", "insurance_provider", "insurance_policy_number",
    ],
  },
  {
    id: "travel",
    label: "Travel",
    fields: ["travel_notes"],
  },
  {
    id: "privacy",
    label: "Privacy",
    fields: ["data_processing_consent", "emergency_sharing_enabled"],
  },
];

export function checkSectionComplete(
  sectionFields: string[],
  formValues: Record<string, unknown>,
): boolean {
  return sectionFields.some((field) => {
    const value = formValues[field];
    if (typeof value === "boolean") return value === true;
    if (Array.isArray(value))
      return value.some((v) => (typeof v === "string" ? v.trim().length > 0 : !!v));
    if (typeof value === "string") return value.trim().length > 0;
    return !!value;
  });
}

interface SectionProgressBarProps {
  sections: { id: string; label: string; isComplete: boolean }[];
  activeSection?: string;
  onSectionClick?: (sectionId: string) => void;
}

export function SectionProgressBar({
  sections,
  activeSection,
  onSectionClick,
}: SectionProgressBarProps) {
  const completedCount = sections.filter((s) => s.isComplete).length;

  return (
    <div className="space-y-1.5 pb-1">
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <span className="font-medium">Section Progress</span>
        <span>
          {completedCount} of {sections.length} started
        </span>
      </div>
      <div className="flex items-start w-full">
        {sections.map((section, index) => (
          <div key={section.id} className="flex items-start flex-1 min-w-0">
            <div className="flex flex-col items-center gap-1 min-w-0">
              <button
                type="button"
                onClick={() => onSectionClick?.(section.id)}
                className="focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full"
                title={section.label}
              >
                <div
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium border-2 transition-all",
                    section.isComplete
                      ? "bg-primary border-primary text-primary-foreground"
                      : activeSection === section.id
                        ? "border-primary text-primary bg-primary/10"
                        : "border-border text-muted-foreground bg-muted",
                  )}
                >
                  {section.isComplete ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    index + 1
                  )}
                </div>
              </button>
              <span
                className={cn(
                  "text-[9px] leading-tight text-center w-full truncate px-0.5",
                  activeSection === section.id
                    ? "text-primary font-medium"
                    : section.isComplete
                      ? "text-foreground"
                      : "text-muted-foreground",
                )}
              >
                {section.label}
              </span>
            </div>
            {index < sections.length - 1 && (
              <div
                className={cn(
                  "h-0.5 flex-1 mt-[11px] min-w-1",
                  section.isComplete ? "bg-primary/50" : "bg-border",
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
