import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Calendar, Clock, User, UserCheck, UserX, XCircle } from "lucide-react";

interface TodayAppointment {
  id: string;
  pet_name: string;
  pet_owner_name: string;
  service_name: string | null;
  assigned_staff_name: string | null;
  start_time: string;
  end_time: string;
  status: string;
  checked_in_at: string | null;
  no_show_at: string | null;
}

export const TodayTab = ({ clinicId }: { clinicId: string }) => {
  const [filter, setFilter] = useState<string>("all");
  const [noShowDialog, setNoShowDialog] = useState<string | null>(null);
  const [declineDialog, setDeclineDialog] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch today's appointments
  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["todayAppointments", clinicId],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from("bookings" as any)
        .select(`
          id,
          pet_name,
          pet_type,
          start_time,
          end_time,
          status,
          notes,
          appointment_date,
          pet_owner_id
        `)
        .eq("clinic_id", clinicId)
        .eq("appointment_date", today)
        .order("start_time");
      
      if (error) {
        console.error("Error fetching appointments:", error);
        throw error;
      }

      // Map to expected format
      return (data || []).map((booking: any) => ({
        id: booking.id,
        pet_name: booking.pet_name,
        pet_owner_name: "Pet Owner", // We'll fetch this separately if needed
        service_name: null,
        assigned_staff_name: null,
        start_time: booking.start_time,
        end_time: booking.end_time,
        status: booking.status || "pending",
        checked_in_at: null,
        no_show_at: null,
      })) as TodayAppointment[];
    },
  });

  // Fetch upcoming appointments (future dates)
  const { data: upcomingAppointments = [] } = useQuery({
    queryKey: ["upcomingAppointments", clinicId],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from("bookings" as any)
        .select(`
          id,
          pet_name,
          pet_type,
          start_time,
          end_time,
          status,
          appointment_date
        `)
        .eq("clinic_id", clinicId)
        .gt("appointment_date", today)
        .order("appointment_date")
        .order("start_time")
        .limit(20);
      
      if (error) {
        console.error("Error fetching upcoming appointments:", error);
        throw error;
      }

      return (data || []).map((booking: any) => ({
        ...booking,
        pet_owner_name: "Pet Owner",
        service_name: null,
      }));
    },
  });

  // Check-in mutation
  const checkInMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      const { error } = await supabase
        .from("bookings" as any)
        .update({
          status: "checked_in",
        })
        .eq("id", bookingId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todayAppointments", clinicId] });
      queryClient.invalidateQueries({ queryKey: ["upcomingAppointments", clinicId] });
      // Invalidate all user bookings queries so pet owners see updates
      queryClient.invalidateQueries({ queryKey: ["userBookings"] });
      toast({
        title: "Checked In",
        description: "Patient has been checked in successfully.",
      });
    },
    onError: (error) => {
      console.error("Check-in error:", error);
      toast({
        title: "Error",
        description: "Failed to check in patient.",
        variant: "destructive",
      });
    },
  });

  // No-show mutation
  const noShowMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      const { error } = await supabase
        .from("bookings" as any)
        .update({
          status: "no_show",
        })
        .eq("id", bookingId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todayAppointments", clinicId] });
      queryClient.invalidateQueries({ queryKey: ["upcomingAppointments", clinicId] });
      queryClient.invalidateQueries({ queryKey: ["userBookings"] });
      setNoShowDialog(null);
      toast({
        title: "Marked No Show",
        description: "Appointment has been marked as no-show.",
      });
    },
    onError: (error) => {
      console.error("No-show error:", error);
      toast({
        title: "Error",
        description: "Failed to mark as no-show.",
        variant: "destructive",
      });
    },
  });

  // Decline mutation
  const declineMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      const { data, error } = await supabase
        .from("bookings" as any)
        .update({
          status: "declined",
        })
        .eq("id", bookingId)
        .select();
      
      if (error) {
        console.error("Decline error details:", error);
        throw new Error(error.message || "Failed to decline appointment");
      }
      
      if (!data || data.length === 0) {
        throw new Error("No rows updated. Appointment may not exist or you may not have permission.");
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todayAppointments", clinicId] });
      queryClient.invalidateQueries({ queryKey: ["upcomingAppointments", clinicId] });
      queryClient.invalidateQueries({ queryKey: ["userBookings"] });
      setDeclineDialog(null);
      toast({
        title: "Appointment Declined",
        description: "The appointment has been declined and the pet owner will be notified.",
      });
    },
    onError: (error: Error) => {
      console.error("Decline error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to decline appointment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const filteredAppointments = appointments.filter((apt) => {
    if (filter === "all") return true;
    if (filter === "confirmed") return apt.status === "confirmed";
    if (filter === "checkedIn") return apt.status === "checked_in";
    if (filter === "noShow") return apt.status === "no_show";
    if (filter === "declined") return apt.status === "declined";
    return true;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: "secondary",
      confirmed: "default",
      checked_in: "success",
      completed: "success",
      no_show: "destructive",
      declined: "destructive",
      canceled: "destructive",
    };
    return (
      <Badge variant={variants[status] || "secondary"}>
        {status.replace("_", " ")}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with filters */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Today's Appointments</h2>
        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            All ({appointments.length})
          </Button>
          <Button
            variant={filter === "confirmed" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("confirmed")}
          >
            Confirmed
          </Button>
          <Button
            variant={filter === "checkedIn" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("checkedIn")}
          >
            Checked In
          </Button>
          <Button
            variant={filter === "noShow" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("noShow")}
          >
            No Show
          </Button>
        </div>
      </div>

      {/* Appointments list */}
      {filteredAppointments.length === 0 ? (
        <Card className="p-12 text-center">
          <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No appointments</h3>
          <p className="text-muted-foreground">
            No appointments scheduled for today.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredAppointments.map((apt) => (
            <Card key={apt.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {apt.start_time.slice(0, 5)} - {apt.end_time.slice(0, 5)}
                      </span>
                    </div>
                    {getStatusBadge(apt.status)}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Pet</div>
                      <div className="font-medium">{apt.pet_name}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Owner</div>
                      <div className="font-medium">
                        {apt.pet_owner_name || "N/A"}
                      </div>
                    </div>
                    {apt.service_name && (
                      <div>
                        <div className="text-muted-foreground">Service</div>
                        <div className="font-medium">{apt.service_name}</div>
                      </div>
                    )}
                    {apt.assigned_staff_name && (
                      <div>
                        <div className="text-muted-foreground">Staff</div>
                        <div className="font-medium">{apt.assigned_staff_name}</div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  {apt.status === "confirmed" && (
                    <Button
                      size="sm"
                      onClick={() => checkInMutation.mutate(apt.id)}
                      disabled={checkInMutation.isPending}
                    >
                      <UserCheck className="h-4 w-4 mr-2" />
                      Check In
                    </Button>
                  )}
                  {(apt.status === "confirmed" || apt.status === "pending") && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setNoShowDialog(apt.id)}
                      >
                        <UserX className="h-4 w-4 mr-2" />
                        No Show
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDeclineDialog(apt.id)}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Decline
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* No Show Confirmation Dialog */}
      <AlertDialog
        open={!!noShowDialog}
        onOpenChange={(open) => !open && setNoShowDialog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark as No Show?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the appointment as a no-show. This action can be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => noShowDialog && noShowMutation.mutate(noShowDialog)}
            >
              Confirm No Show
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Decline Confirmation Dialog */}
      <AlertDialog
        open={!!declineDialog}
        onOpenChange={(open) => !open && setDeclineDialog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Decline Appointment?</AlertDialogTitle>
            <AlertDialogDescription>
              This will decline the appointment. The pet owner will see this appointment as declined on their dashboard. This action cannot be easily undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => declineDialog && declineMutation.mutate(declineDialog)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Decline Appointment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Upcoming Appointments Section */}
      <div className="mt-8 pt-8 border-t">
        <h2 className="text-2xl font-bold mb-4">Upcoming Appointments</h2>
        {upcomingAppointments.length === 0 ? (
          <Card className="p-8 text-center">
            <Calendar className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">
              No upcoming appointments scheduled.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {upcomingAppointments.map((apt: any) => (
              <Card key={apt.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {new Date(apt.appointment_date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {apt.start_time.slice(0, 5)} - {apt.end_time.slice(0, 5)}
                        </span>
                      </div>
                      {getStatusBadge(apt.status || "pending")}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Pet</div>
                        <div className="font-medium">{apt.pet_name}</div>
                      </div>
                      {apt.pet_type && (
                        <div>
                          <div className="text-muted-foreground">Type</div>
                          <div className="font-medium">{apt.pet_type}</div>
                        </div>
                      )}
                    </div>
                  </div>
                  {(apt.status === "confirmed" || apt.status === "pending") && (
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDeclineDialog(apt.id)}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Decline
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};




