import { supabase } from "@/integrations/supabase/client";

export type Clinic = {
  id: string;
  name: string;
  description: string | null;
  city: string | null;
  address_line1: string | null;
  address_line2: string | null;
  phone: string | null;
  email: string | null;
  languages: string[] | null;
  specialties: string[] | null;
  verified: boolean;
};

export async function searchClinics(params: {
  city?: string;
  specialty?: string;
  language?: string;
  onlyOpenNow?: boolean;
}) {
  let query = supabase.from("clinics").select("*", { count: "exact" });

  if (params.city) {
    query = query.ilike("city", `%${params.city}%`);
  }
  if (params.specialty) {
    query = query.contains("specialties", [params.specialty]);
  }
  if (params.language) {
    query = query.contains("languages", [params.language]);
  }
  // onlyOpenNow: naive filter using today's weekday and current time window
  if (params.onlyOpenNow) {
    const now = new Date();
    const day = ["sun","mon","tue","wed","thu","fri","sat"][now.getDay()];
    // join via RPC: fetch clinic_ids that have hours today covering now
    const { data: openIds } = await supabase
      .from("clinic_hours")
      .select("clinic_id, day, opens, closes")
      .eq("day", day as any);

    if (openIds && openIds.length > 0) {
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      const current = `${hh}:${mm}:00`;
      const set = new Set(
        openIds
          .filter((r: any) => r.opens <= current && current <= r.closes)
          .map((r: any) => r.clinic_id)
      );
      if (set.size > 0) {
        query = query.in("id", Array.from(set));
      } else {
        // ensure empty
        query = query.eq("id", "00000000-0000-0000-0000-000000000000");
      }
    }
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Clinic[];
}

export async function getClinicProfile(id: string) {
  const [{ data: clinic }, { data: services }, { data: hours }, { data: photos }, { data: reviews } ] = await Promise.all([
    supabase.from("clinics").select("*").eq("id", id).single(),
    supabase.from("clinic_services").select("*").eq("clinic_id", id),
    supabase.from("clinic_hours").select("*").eq("clinic_id", id),
    supabase.from("clinic_photos").select("*").eq("clinic_id", id),
    supabase.from("clinic_reviews").select("*").eq("clinic_id", id).order("created_at", { ascending: false })
  ]);
  return { clinic, services, hours, photos, reviews };
}

export async function placeHold(params: { clinicId: string; serviceId?: string; start: string; end: string; }) {
  const { data, error } = await supabase.rpc("place_hold", {
    p_clinic: params.clinicId,
    p_owner: (await supabase.auth.getUser()).data.user?.id,
    p_start: params.start,
    p_end: params.end,
    p_service: params.serviceId ?? null,
  });
  if (error) throw error;
  return data as string; // appointment id
}

export async function confirmAppointment(params: { appointmentId: string; }) {
  const { error } = await supabase.rpc("confirm_appointment", {
    p_id: params.appointmentId,
    p_owner: (await supabase.auth.getUser()).data.user?.id,
  });
  if (error) throw error;
}






