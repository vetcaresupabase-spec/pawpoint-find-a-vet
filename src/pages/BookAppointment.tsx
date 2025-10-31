import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format, addDays, startOfDay, isSameDay, setHours, setMinutes, isPast } from "date-fns";
import { ArrowLeft, ChevronLeft, ChevronRight, MapPin, Euro } from "lucide-react";
import { useActiveServices } from "@/hooks/useServices";

// Service categories
const ALLOWED_CATEGORIES = [
  'Wellness & Preventive Care',
  'Diagnostics & Imaging',
  'Dental Care',
  'Surgery & Anesthesia',
  'Medical Consults & Chronic Care',
  'Urgent & End-of-Life Care',
] as const;

interface Service {
  id: string;
  clinic_id: string;
  name: string;
  description: string | null;
  category: string | null;
  duration_minutes: number;
  price_min: number | null;
  price_max: number | null;
  is_active: boolean;
}

interface TimeSlot {
  start: string; // ISO datetime
  end: string;
  available: boolean;
}

interface Clinic {
  id: string;
  name: string;
  city: string;
  address_line1: string;
  specialties: string[];
}

interface ClinicException {
  id: string;
  clinic_id: string;
  date: string; // YYYY-MM-DD
  is_closed: boolean;
  reason: string | null;
  time_ranges: { start: string; end: string }[] | null;
}

interface ClinicHours {
  clinic_id: string;
  weekday: number; // 0 = Sunday, 6 = Saturday
  is_open: boolean;
  time_ranges: { start: string; end: string }[];
}

// Helper functions
const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const isPastSlot = (isoDateTime: string) => {
  return new Date(isoDateTime).getTime() < Date.now();
};

const formatTimeSlot = (isoDateTime: string) => {
  return new Date(isoDateTime).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });
};

export default function BookAppointment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const clinicId = searchParams.get("clinicId");

  // Check for state restoration from query params
  const preselectedDate = searchParams.get("date");
  const preselectedTime = searchParams.get("time");
  const preselectedServiceId = searchParams.get("serviceId");

  const [user, setUser] = useState<any>(null);
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string>(preselectedServiceId || "");
  
  // Use the services hook for real-time updates
  const { data: services = [], isLoading: servicesLoading } = useActiveServices(clinicId);
  
  // Calendar state
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(startOfToday());
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [weekDays, setWeekDays] = useState<Date[]>([]);
  const [timeSlotsByDay, setTimeSlotsByDay] = useState<Map<string, TimeSlot[]>>(new Map());
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [exceptions, setExceptions] = useState<ClinicException[]>([]);
  const [clinicHours, setClinicHours] = useState<ClinicHours[]>([]);
  
  // Form state
  const [petName, setPetName] = useState("");
  const [petType, setPetType] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch clinic, services, and exceptions
  useEffect(() => {
    if (!clinicId) {
      toast({
        title: "Invalid clinic",
        description: "No clinic selected.",
        variant: "destructive",
      });
      navigate("/search");
      return;
    }

    const fetchData = async () => {
      // Fetch clinic
      const { data: clinicData, error: clinicError } = await supabase
        .from("clinics" as any)
        .select("*")
        .eq("id", clinicId)
        .single();

      if (clinicError || !clinicData) {
        toast({ title: "Error", description: "Clinic not found.", variant: "destructive" });
        navigate("/search");
        return;
      }

      setClinic(clinicData as unknown as Clinic);

      // Fetch exceptions (future dates only)
      const today = format(new Date(), "yyyy-MM-dd");
      const { data: exceptionsData, error: exceptionsError } = await supabase
        .from("clinic_exceptions" as any)
        .select("*")
        .eq("clinic_id", clinicId)
        .gte("date", today)
        .order("date");

      if (!exceptionsError && exceptionsData) {
        setExceptions(exceptionsData as unknown as ClinicException[]);
        console.log("Loaded exceptions:", exceptionsData);
      }

      // Fetch regular hours
      const { data: hoursData, error: hoursError } = await supabase
        .from("clinic_hours_new" as any)
        .select("*")
        .eq("clinic_id", clinicId)
        .order("weekday");

      if (!hoursError && hoursData) {
        setClinicHours(hoursData as unknown as ClinicHours[]);
        console.log("Loaded clinic hours:", hoursData);
      }
    };

    fetchData();
  }, [clinicId, navigate]);

  // Helper function to check if a time slot is within exception time ranges
  const isSlotInExceptionRange = (slotTime: string, timeRanges: { start: string; end: string }[]): boolean => {
    if (!timeRanges || timeRanges.length === 0) return false;
    
    const slotDate = new Date(slotTime);
    const slotHourMin = format(slotDate, "HH:mm");
    
    return timeRanges.some(range => {
      return slotHourMin >= range.start && slotHourMin < range.end;
    });
  };

  // Helper function to check if a time slot is within regular hours
  const isSlotInRegularHours = (slotTime: string, dayOfWeek: number): boolean => {
    const dayHours = clinicHours.find(h => h.weekday === dayOfWeek);
    
    if (!dayHours || !dayHours.is_open || !dayHours.time_ranges || dayHours.time_ranges.length === 0) {
      return false;
    }
    
    const slotDate = new Date(slotTime);
    const slotHourMin = format(slotDate, "HH:mm");
    
    return dayHours.time_ranges.some(range => {
      return slotHourMin >= range.start && slotHourMin < range.end;
    });
  };

  // Generate week days and time slots
  useEffect(() => {
    const today = startOfToday();
    const days: Date[] = [];
    
    // Generate 7 days starting from current week start
    for (let i = 0; i < 7; i++) {
      const day = addDays(currentWeekStart, i);
      // Only include today and future dates
      if (day.getTime() >= today.getTime()) {
        days.push(day);
      }
    }
    
    setWeekDays(days);

    // Generate time slots for each day
    const slotsMap = new Map<string, TimeSlot[]>();
    
    days.forEach((day) => {
      const dayKey = format(day, "yyyy-MM-dd");
      const dayOfWeek = day.getDay(); // 0 = Sunday, 6 = Saturday
      
      // Check if this day has an exception
      const exception = exceptions.find(ex => ex.date === dayKey);
      
      // If the day is closed entirely by exception, no slots
      if (exception && exception.is_closed) {
        slotsMap.set(dayKey, []);
        return;
      }
      
      // Check if clinic is open on this day of week (regular hours)
      const dayHours = clinicHours.find(h => h.weekday === dayOfWeek);
      if (!dayHours || !dayHours.is_open) {
        slotsMap.set(dayKey, []);
        return;
      }
      
      const slots: TimeSlot[] = [];
      const isToday = isSameDay(day, new Date());
      
      // Generate slots from 8:00 to 18:00 in 15-minute intervals
      for (let hour = 8; hour < 18; hour++) {
        for (let minute of [0, 15, 30, 45]) {
          const slotDate = setMinutes(setHours(day, hour), minute);
          const slotEnd = new Date(slotDate.getTime() + 30 * 60 * 1000); // 30 min duration
          
          const startISO = slotDate.toISOString();
          const endISO = slotEnd.toISOString();
          
          // Slot is unavailable if it's in the past
          const pastSlot = isPastSlot(startISO);
          
          // Check availability based on regular hours
          let available = !pastSlot && isSlotInRegularHours(startISO, dayOfWeek);
          
          // Exceptions override regular hours
          if (exception && !exception.is_closed && exception.time_ranges) {
            // Special hours exception - BLOCK slots within the exception time ranges
            if (isSlotInExceptionRange(startISO, exception.time_ranges)) {
              available = false; // Block this slot
            }
          }
          
          slots.push({
            start: startISO,
            end: endISO,
            available,
          });
        }
      }
      
      slotsMap.set(dayKey, slots);
    });
    
    setTimeSlotsByDay(slotsMap);
  }, [currentWeekStart, exceptions, clinicHours]);

  // Restore state from URL params
  useEffect(() => {
    if (preselectedDate && preselectedTime && timeSlotsByDay.size > 0) {
      const slots = timeSlotsByDay.get(preselectedDate);
      if (slots) {
        const slot = slots.find(s => s.start.includes(preselectedTime));
        if (slot && slot.available) {
          setSelectedSlot(slot);
        }
      }
    }
  }, [preselectedDate, preselectedTime, timeSlotsByDay]);

  // Group services by category
  const groupedServices = services.reduce((acc, service) => {
    const category = service.category || 'Other Services';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(service);
    return acc;
  }, {} as Record<string, Service[]>);

  console.log("Grouped services:", groupedServices);
  console.log("Services count:", services.length);
  console.log("Selected service ID:", selectedServiceId);
  console.log("Selected slot:", selectedSlot);
  console.log("Pet name:", petName);

  const handlePreviousWeek = () => {
    const newWeekStart = addDays(currentWeekStart, -7);
    const today = startOfToday();
    // Don't allow going before today
    if (newWeekStart.getTime() >= today.getTime()) {
      setCurrentWeekStart(newWeekStart);
    }
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, 7));
  };

  const toggleDayExpanded = (dayKey: string) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(dayKey)) {
      newExpanded.delete(dayKey);
    } else {
      newExpanded.add(dayKey);
    }
    setExpandedDays(newExpanded);
  };

  const handleSlotClick = (slot: TimeSlot) => {
    if (slot.available && !isPastSlot(slot.start)) {
      setSelectedSlot(slot);
    }
  };

  const handleBookingAction = async () => {
    // If not logged in, redirect to login with state
    if (!user) {
      const qs = new URLSearchParams({
        clinicId: clinicId || '',
        date: selectedSlot ? selectedSlot.start.slice(0, 10) : '',
        time: selectedSlot ? selectedSlot.start.slice(11, 16) : '',
        serviceId: selectedServiceId,
        redirectTo: window.location.pathname + window.location.search,
      });
      
      toast({
        title: "Login required",
        description: "Please log in to complete your booking.",
      });
      
      // Open login dialog instead of navigating away
      // The PetOwnerAuthDialog will handle the login
      return;
    }

    // User is logged in: validate and book
    if (!selectedServiceId || !selectedSlot || !petName) {
      toast({
        title: "Missing information",
        description: "Please select a service, time slot, and enter your pet's name.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    const service = services.find((s) => s.id === selectedServiceId);
    const duration = service?.duration_minutes || 30;

    // Parse ISO datetime to get date and time components
    const slotStart = new Date(selectedSlot.start);
    const appointmentDate = format(slotStart, "yyyy-MM-dd");
    const startTime = format(slotStart, "HH:mm:ss");
    
    const slotEnd = new Date(selectedSlot.end);
    const endTime = format(slotEnd, "HH:mm:ss");

    const { error } = await supabase.from("bookings" as any).insert({
      clinic_id: clinicId,
      service_id: selectedServiceId,
      pet_owner_id: user.id,
      pet_name: petName,
      pet_type: petType || null,
      appointment_date: appointmentDate,
      start_time: startTime,
      end_time: endTime,
      duration_minutes: duration,
      status: "pending",
      notes: notes || null,
    });

    setSubmitting(false);

    if (error) {
      console.error("Booking error:", error);
      toast({
        title: "Booking failed",
        description: error.message || "Could not create booking. Please try again.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Booked!",
      description: "Check your email for confirmation.",
    });

    navigate("/pet-owner-dashboard");
  };

  if (!clinic) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
        <Header />
        <div className="container py-20 text-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const isFirstWeek = isSameDay(currentWeekStart, startOfToday());

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Header />

      <div className="container py-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="grid lg:grid-cols-[350px_1fr] gap-6">
          {/* Left Sidebar - Clinic Info & Form */}
          <div className="space-y-4">
            <Card className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-teal-100 to-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl font-bold text-teal-600">
                    {clinic.name.split(' ').map(w => w.charAt(0)).join('').slice(0, 2)}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-bold">{clinic.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {clinic.specialties?.join(", ") || "Veterinary Clinic"}
                  </p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <MapPin className="h-3 w-3" />
                    <span>{clinic.address_line1}, {clinic.city}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {/* Service Selection with Categories */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Service *</label>
                  <Select 
                    value={selectedServiceId} 
                    onValueChange={(value) => {
                      console.log("Service selected:", value);
                      setSelectedServiceId(value);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.length === 0 ? (
                        <div className="p-2 text-sm text-muted-foreground">No services available</div>
                      ) : Object.entries(groupedServices).length > 0 ? (
                        Object.entries(groupedServices).map(([category, items]) => (
                          <SelectGroup key={category}>
                            <SelectLabel>{category}</SelectLabel>
                            {items.map((service) => (
                              <SelectItem key={service.id} value={service.id}>
                                {service.name} ({service.duration_minutes} min)
                                {service.price_min && service.price_max && 
                                  ` - €${service.price_min}-${service.price_max}`}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        ))
                      ) : (
                        services.map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.name} ({service.duration_minutes} min)
                            {service.price_min && service.price_max && 
                              ` - €${service.price_min}-${service.price_max}`}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {services.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {services.length} service{services.length !== 1 ? 's' : ''} available
                    </p>
                  )}
                </div>

                {/* Pet Information */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Pet Name *</label>
                  <Input
                    value={petName}
                    onChange={(e) => setPetName(e.target.value)}
                    placeholder="e.g., Max"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Pet Type</label>
                  <Input
                    value={petType}
                    onChange={(e) => setPetType(e.target.value)}
                    placeholder="e.g., Dog, Cat"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Additional Notes</label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any special requests or information"
                    rows={3}
                  />
                </div>

                {/* Selected Slot Display */}
                {selectedSlot && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-medium text-blue-900">Selected Appointment:</p>
                    <p className="text-sm text-blue-700">
                      {format(new Date(selectedSlot.start), "EEEE, MMMM d, yyyy")} at{" "}
                      {formatTimeSlot(selectedSlot.start)}
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  onClick={handleBookingAction}
                  className="w-full bg-teal-600 hover:bg-teal-700"
                  size="lg"
                  disabled={submitting || !selectedServiceId || !selectedSlot || !petName}
                >
                  {submitting ? "Booking..." : user ? "Book appointment" : "Login to Book"}
                </Button>
                
                {/* Debug info */}
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Service selected: {selectedServiceId ? "✓" : "✗"}</p>
                  <p>Time slot selected: {selectedSlot ? "✓" : "✗"}</p>
                  <p>Pet name: {petName ? "✓" : "✗"}</p>
                </div>
                
                {!user && (
                  <p className="text-xs text-center text-muted-foreground">
                    You can view available slots, but login is required to complete booking
                  </p>
                )}
              </div>
            </Card>

            {/* Payment Info */}
            <Card className="p-4 bg-muted/50">
              <div className="flex items-start gap-2">
                <Euro className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">Payment Information</p>
                  <p className="text-muted-foreground">
                    Publicly and privately insured persons as well as self-payers
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Side - Calendar */}
          <Card className="p-6" data-lov-id="src\pages\BookAppointment.tsx:367:10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                {format(currentWeekStart, "MMMM yyyy")}
              </h2>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={handlePreviousWeek}
                  disabled={isFirstWeek}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={handleNextWeek}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Week Grid */}
            <div className="grid grid-cols-7 gap-3" data-lov-id="src\pages\BookAppointment.tsx:383:12">
              {weekDays.map((day) => {
                const dayKey = format(day, "yyyy-MM-dd");
                const slots = timeSlotsByDay.get(dayKey) || [];
                const exception = exceptions.find(ex => ex.date === dayKey);
                const isToday = isSameDay(day, new Date());
                const isExpanded = expandedDays.has(dayKey);
                const displaySlots = isExpanded ? slots : slots.slice(0, 6);
                const hasMore = slots.length > 6;
                const isClosed = exception && exception.is_closed;
                const hasSpecialHours = exception && !exception.is_closed && exception.time_ranges;

                return (
                  <div key={dayKey} className="flex flex-col">
                    {/* Day Header */}
                    <div className="text-center mb-3">
                      <div className={`text-sm font-medium ${isToday ? "text-primary" : "text-muted-foreground"}`}>
                        {format(day, "EEEE")}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(day, "MMM d")}
                      </div>
                      {/* Exception Badge - Only show for closed days */}
                      {exception && isClosed && (
                        <div className="text-xs mt-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                          Closed
                        </div>
                      )}
                    </div>

                    {/* Closed Day Message */}
                    {isClosed ? (
                      <div className="flex-1 flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-500 text-center font-medium mb-1">Unavailable</p>
                        {exception.reason && (
                          <p className="text-xs text-gray-400 text-center">{exception.reason}</p>
                        )}
                      </div>
                    ) : (
                      /* Time Slots - Show all slots normally, availability controlled by special hours */
                      <div className="space-y-2 flex-1 relative">
                        {slots.length === 0 ? (
                          <div className="text-xs text-gray-400 text-center py-4">
                            No slots available
                          </div>
                        ) : (
                          displaySlots.map((slot, slotIndex) => {
                            const isSelected = selectedSlot?.start === slot.start;
                            const disabled = !slot.available || isPastSlot(slot.start);
                            const isInBlockedRange = exception && hasSpecialHours && exception.time_ranges && 
                                                    isSlotInExceptionRange(slot.start, exception.time_ranges);
                            
                            // Check if this is the first blocked slot in the range
                            const isFirstBlockedSlot = isInBlockedRange && (slotIndex === 0 || 
                              !displaySlots[slotIndex - 1] || 
                              !(exception && hasSpecialHours && exception.time_ranges && 
                                isSlotInExceptionRange(displaySlots[slotIndex - 1].start, exception.time_ranges)));

                            return (
                              <div key={slot.start} className="relative">
                                <button
                                  onClick={() => handleSlotClick(slot)}
                                  disabled={disabled}
                                  className={`w-full px-3 py-2 text-sm rounded-md transition-all ${
                                    isSelected
                                      ? "bg-blue-600 text-white font-medium shadow-sm"
                                      : disabled
                                      ? isInBlockedRange
                                        ? "bg-amber-50 text-amber-600 cursor-not-allowed border border-amber-200"
                                        : "bg-gray-50 text-gray-400 cursor-not-allowed"
                                      : slot.available
                                      ? "bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 hover:border-blue-300"
                                      : "bg-gray-50 text-gray-400 cursor-not-allowed"
                                  }`}
                                >
                                  {isInBlockedRange ? formatTimeSlot(slot.start) : (slot.available ? formatTimeSlot(slot.start) : "—")}
                                </button>
                                
                                {/* Overlay reason on the first blocked slot */}
                                {isFirstBlockedSlot && exception.reason && exception.time_ranges && (
                                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                                    <div className="bg-amber-100 border border-amber-300 rounded px-2 py-1 text-xs text-amber-900 italic shadow-sm">
                                      {exception.time_ranges.map((range, i) => (
                                        <div key={i} className="font-semibold">{range.start} - {range.end}</div>
                                      ))}
                                      <div className="text-amber-800">{exception.reason}</div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Single "Show more appointments" button for all days */}
            {weekDays.some(day => {
              const dayKey = format(day, "yyyy-MM-dd");
              const slots = timeSlotsByDay.get(dayKey) || [];
              return slots.length > 6;
            }) && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => {
                    // Toggle all days at once
                    const newExpanded = new Set(expandedDays);
                    const hasAnyExpanded = weekDays.some(day => 
                      expandedDays.has(format(day, "yyyy-MM-dd"))
                    );
                    
                    if (hasAnyExpanded) {
                      // Collapse all
                      setExpandedDays(new Set());
                    } else {
                      // Expand all days that have more than 6 slots
                      weekDays.forEach(day => {
                        const dayKey = format(day, "yyyy-MM-dd");
                        const slots = timeSlotsByDay.get(dayKey) || [];
                        if (slots.length > 6) {
                          newExpanded.add(dayKey);
                        }
                      });
                      setExpandedDays(newExpanded);
                    }
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium"
                >
                  {weekDays.some(day => expandedDays.has(format(day, "yyyy-MM-dd")))
                    ? "Show fewer"
                    : "Show more appointments"}
                </button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
