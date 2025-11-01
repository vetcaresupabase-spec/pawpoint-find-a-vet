import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface Service {
  id: string;
  clinic_id: string;
  name: string;
  description: string | null;
  category: string | null;
  duration_minutes: number;
  price_min: number | null;
  price_max: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateServiceData {
  name: string;
  description?: string;
  category?: string;
  duration_minutes: number;
  price_min?: number;
  price_max?: number;
}

export interface UpdateServiceData extends Partial<CreateServiceData> {
  is_active?: boolean;
}

// Hook for fetching services
export function useServices(clinicId: string | null) {
  return useQuery({
    queryKey: ["clinic-services", clinicId],
    queryFn: async () => {
      if (!clinicId) return [];
      
      const { data, error } = await supabase
        .from("clinic_services")
        .select("*")
        .eq("clinic_id", clinicId)
        .order("category", { ascending: true })
        .order("name", { ascending: true });

      if (error) throw error;
      return data as Service[];
    },
    enabled: !!clinicId,
  });
}

// Hook for fetching active services (for booking page)
export function useActiveServices(clinicId: string | null) {
  return useQuery({
    queryKey: ["active-services", clinicId],
    queryFn: async () => {
      if (!clinicId) return [];
      
      const { data, error } = await supabase
        .from("clinic_services")
        .select("*")
        .eq("clinic_id", clinicId)
        .eq("is_active", true)
        .order("category", { ascending: true })
        .order("name", { ascending: true });

      if (error) throw error;
      return data as Service[];
    },
    enabled: !!clinicId,
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
  });
}

// Hook for creating services
export function useCreateService(clinicId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (serviceData: CreateServiceData) => {
      const { data, error } = await supabase
        .from("clinic_services")
        .insert({
          clinic_id: clinicId,
          ...serviceData,
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          throw new Error("A service with this name already exists");
        }
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch services
      queryClient.invalidateQueries({ queryKey: ["clinic-services", clinicId] });
      queryClient.invalidateQueries({ queryKey: ["active-services", clinicId] });
      
      toast({
        title: "Service created",
        description: "The service has been added successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating service",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Hook for updating services
export function useUpdateService(clinicId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: { id: string } & UpdateServiceData) => {
      const { data, error } = await supabase
        .from("clinic_services")
        .update(updateData)
        .eq("id", id)
        .eq("clinic_id", clinicId)
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          throw new Error("A service with this name already exists");
        }
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch services
      queryClient.invalidateQueries({ queryKey: ["clinic-services", clinicId] });
      queryClient.invalidateQueries({ queryKey: ["active-services", clinicId] });
      
      toast({
        title: "Service updated",
        description: "The service has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating service",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// Hook for deleting services
export function useDeleteService(clinicId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (serviceId: string) => {
      const { error } = await supabase
        .from("clinic_services")
        .delete()
        .eq("id", serviceId)
        .eq("clinic_id", clinicId);

      if (error) throw error;
    },
    onSuccess: () => {
      // Invalidate and refetch services
      queryClient.invalidateQueries({ queryKey: ["clinic-services", clinicId] });
      queryClient.invalidateQueries({ queryKey: ["active-services", clinicId] });
      
      toast({
        title: "Service deleted",
        description: "The service has been removed successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting service",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}


