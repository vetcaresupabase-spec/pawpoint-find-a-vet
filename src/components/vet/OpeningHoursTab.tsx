import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2, Clock, Calendar as CalendarIcon, X, AlertCircle, Info } from "lucide-react";
import { format, addDays, startOfDay, isSameDay, parseISO, isAfter, isBefore } from "date-fns";

interface TimeRange {
  start: string;
  end: string;
}

interface DaySchedule {
  weekday: number;
  is_open: boolean;
  time_ranges: TimeRange[];
}

interface Exception {
  id?: string;
  clinic_id?: string;
  date: string; // YYYY-MM-DD
  is_closed: boolean;
  reason?: string;
  time_ranges?: TimeRange[];
}

interface ExceptionForm {
  from_date: string;
  to_date: string;
  is_closed: boolean;
  reason: string;
  time_ranges: TimeRange[];
}

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const OpeningHoursTab = ({ clinicId }: { clinicId: string }) => {
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [exceptionDialog, setExceptionDialog] = useState(false);
  const today = format(new Date(), "yyyy-MM-dd");
  const [exceptionForm, setExceptionForm] = useState<ExceptionForm>({
    from_date: today,
    to_date: today,
    is_closed: true,
    reason: "",
    time_ranges: [],
  });
  const queryClient = useQueryClient();

  // Fetch existing hours
  const { data: existingHours, isLoading } = useQuery({
    queryKey: ["clinicHours", clinicId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clinic_hours_new")
        .select("*")
        .eq("clinic_id", clinicId)
        .order("weekday");
      if (error) throw error;
      return data;
    },
  });

  // Fetch exceptions
  const { data: exceptions = [] } = useQuery({
    queryKey: ["clinicExceptions", clinicId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clinic_exceptions")
        .select("*")
        .eq("clinic_id", clinicId)
        .gte("date", format(new Date(), "yyyy-MM-dd"))
        .order("date");
      if (error) throw error;
      return data as Exception[];
    },
  });

  // Initialize schedule from existing data or defaults
  useEffect(() => {
    if (existingHours) {
      const scheduleMap = new Map(
        existingHours.map((h) => [
          h.weekday,
          {
            weekday: h.weekday,
            is_open: h.is_open,
            time_ranges: h.time_ranges as TimeRange[],
          },
        ])
      );

      const fullSchedule: DaySchedule[] = [];
      for (let i = 0; i < 7; i++) {
        fullSchedule.push(
          scheduleMap.get(i) || {
            weekday: i,
            is_open: false,
            time_ranges: [],
          }
        );
      }
      setSchedule(fullSchedule);
    } else {
      // Default schedule: weekdays 9-17
      setSchedule(
        Array.from({ length: 7 }, (_, i) => ({
          weekday: i,
          is_open: i >= 1 && i <= 5, // Mon-Fri
          time_ranges:
            i >= 1 && i <= 5 ? [{ start: "09:00", end: "17:00" }] : [],
        }))
      );
    }
  }, [existingHours]);

  // Save hours mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      // Validate time ranges
      for (const day of schedule) {
        if (day.is_open) {
          for (const range of day.time_ranges) {
            if (range.start >= range.end) {
              throw new Error(`Invalid time range on ${DAYS[day.weekday]}: start time must be before end time`);
            }
          }
        }
      }

      // Delete existing hours
      await supabase.from("clinic_hours_new").delete().eq("clinic_id", clinicId);

      // Insert new hours
      const rows = schedule.map((day) => ({
        clinic_id: clinicId,
        weekday: day.weekday,
        is_open: day.is_open,
        time_ranges: day.time_ranges,
      }));

      const { error } = await supabase.from("clinic_hours_new").insert(rows);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinicHours", clinicId] });
      toast({
        title: "Hours saved",
        description: "Opening hours have been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Save exception mutation
  const saveExceptionMutation = useMutation({
    mutationFn: async (form: ExceptionForm) => {
      // Validate
      if (!form.is_closed && (!form.time_ranges || form.time_ranges.length === 0)) {
        throw new Error("Please add at least one time range for special hours");
      }

      if (form.from_date > form.to_date) {
        throw new Error("'From' date must be before or equal to 'To' date");
      }

      // Generate all dates in the range
      const from = parseISO(form.from_date);
      const to = parseISO(form.to_date);
      const datesToAdd: Exception[] = [];

      let currentDate = from;
      while (currentDate <= to) {
        datesToAdd.push({
          clinic_id: clinicId,
          date: format(currentDate, "yyyy-MM-dd"),
          is_closed: form.is_closed,
          reason: form.reason || null,
          time_ranges: form.time_ranges || [],
        });
        currentDate = addDays(currentDate, 1);
      }

      // Insert all dates
      const { error } = await supabase
        .from("clinic_exceptions")
        .upsert(datesToAdd, {
          onConflict: "clinic_id,date",
        });

      if (error) throw error;
      
      return datesToAdd.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ["clinicExceptions", clinicId] });
      setExceptionDialog(false);
      const today = format(new Date(), "yyyy-MM-dd");
      setExceptionForm({
        from_date: today,
        to_date: today,
        is_closed: true,
        reason: "",
        time_ranges: [],
      });
      toast({
        title: "Exception(s) saved",
        description: `${count} date(s) have been added.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete exception mutation
  const deleteExceptionMutation = useMutation({
    mutationFn: async (exceptionId: string) => {
      const { error } = await supabase
        .from("clinic_exceptions")
        .delete()
        .eq("id", exceptionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinicExceptions", clinicId] });
      toast({
        title: "Exception deleted",
        description: "Date exception has been removed.",
      });
    },
  });

  const toggleDay = (weekday: number) => {
    setSchedule((prev) =>
      prev.map((day) =>
        day.weekday === weekday
          ? {
              ...day,
              is_open: !day.is_open,
              time_ranges:
                !day.is_open && day.time_ranges.length === 0
                  ? [{ start: "09:00", end: "17:00" }]
                  : day.time_ranges,
            }
          : day
      )
    );
  };

  const addTimeRange = (weekday: number) => {
    setSchedule((prev) =>
      prev.map((day) =>
        day.weekday === weekday
          ? {
              ...day,
              time_ranges: [
                ...day.time_ranges,
                { start: "09:00", end: "17:00" },
              ],
            }
          : day
      )
    );
  };

  const removeTimeRange = (weekday: number, index: number) => {
    setSchedule((prev) =>
      prev.map((day) =>
        day.weekday === weekday
          ? {
              ...day,
              time_ranges: day.time_ranges.filter((_, i) => i !== index),
            }
          : day
      )
    );
  };

  const updateTimeRange = (
    weekday: number,
    index: number,
    field: "start" | "end",
    value: string
  ) => {
    setSchedule((prev) =>
      prev.map((day) =>
        day.weekday === weekday
          ? {
              ...day,
              time_ranges: day.time_ranges.map((tr, i) =>
                i === index ? { ...tr, [field]: value } : tr
              ),
            }
          : day
      )
    );
  };

  const addExceptionTimeRange = () => {
    setExceptionForm((prev) => ({
      ...prev,
      time_ranges: [
        ...(prev.time_ranges || []),
        { start: "09:00", end: "17:00" },
      ],
    }));
  };

  const removeExceptionTimeRange = (index: number) => {
    setExceptionForm((prev) => ({
      ...prev,
      time_ranges: (prev.time_ranges || []).filter((_, i) => i !== index),
    }));
  };

  const updateExceptionTimeRange = (
    index: number,
    field: "start" | "end",
    value: string
  ) => {
    setExceptionForm((prev) => ({
      ...prev,
      time_ranges: (prev.time_ranges || []).map((tr, i) =>
        i === index ? { ...tr, [field]: value } : tr
      ),
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="regular" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="regular">
            <Clock className="h-4 w-4 mr-2" />
            Regular Hours
          </TabsTrigger>
          <TabsTrigger value="exceptions">
            <CalendarIcon className="h-4 w-4 mr-2" />
            Exceptions ({exceptions.length})
          </TabsTrigger>
        </TabsList>

        {/* Regular Hours Tab */}
        <TabsContent value="regular" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Weekly Schedule</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Set your regular opening hours for each day of the week
                  </p>
                </div>
                <Button 
                  onClick={() => saveMutation.mutate()} 
                  disabled={saveMutation.isPending}
                >
                  {saveMutation.isPending ? "Saving..." : "Save Hours"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {schedule.map((day) => (
                  <Card key={day.weekday} className="p-4 border-2">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={day.is_open}
                            onCheckedChange={() => toggleDay(day.weekday)}
                          />
                          <span className="font-semibold text-base">{DAYS[day.weekday]}</span>
                        </div>
                        {!day.is_open && (
                          <Badge variant="secondary">Closed</Badge>
                        )}
                      </div>

                      {day.is_open && (
                        <div className="space-y-2 pl-11">
                          {day.time_ranges.length === 0 ? (
                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                              <AlertCircle className="h-4 w-4" />
                              <span>No time ranges set. Add at least one.</span>
                            </div>
                          ) : (
                            day.time_ranges.map((range, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <Label className="text-xs text-muted-foreground w-12">From</Label>
                                <Input
                                  type="time"
                                  value={range.start}
                                  onChange={(e) =>
                                    updateTimeRange(day.weekday, index, "start", e.target.value)
                                  }
                                  className="w-32"
                                />
                                <Label className="text-xs text-muted-foreground">to</Label>
                                <Input
                                  type="time"
                                  value={range.end}
                                  onChange={(e) =>
                                    updateTimeRange(day.weekday, index, "end", e.target.value)
                                  }
                                  className="w-32"
                                />
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => removeTimeRange(day.weekday, index)}
                                  title="Remove time range"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => addTimeRange(day.weekday)}
                            className="mt-2"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Time Range
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex gap-3">
                  <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-medium mb-1">How it works:</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-800">
                      <li>Toggle days on/off to control when you're available</li>
                      <li>Add multiple time ranges for split shifts (e.g., 9-12, 14-18)</li>
                      <li>Pet owners can only book during these hours</li>
                      <li>Use "Exceptions" tab for holidays or special hours</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Exceptions Tab */}
        <TabsContent value="exceptions" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Date Exceptions</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Set special hours or closures for specific dates (holidays, vacations, etc.)
                  </p>
                </div>
                <Button onClick={() => setExceptionDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Exception
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {exceptions.length === 0 ? (
                <div className="text-center py-12">
                  <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No exceptions set</h3>
                  <p className="text-muted-foreground mb-4">
                    Add date-specific closures or special hours
                  </p>
                  <Button onClick={() => setExceptionDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Exception
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {exceptions.map((exception) => (
                    <Card key={exception.id} className="p-4 border-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                            <span className="font-semibold">
                              {format(parseISO(exception.date), "EEEE, MMMM d, yyyy")}
                            </span>
                            {exception.is_closed ? (
                              <Badge variant="destructive">Closed</Badge>
                            ) : (
                              <Badge variant="secondary">Special Hours</Badge>
                            )}
                          </div>
                          
                          {exception.reason && (
                            <p className="text-sm text-muted-foreground mb-2 ml-8">
                              {exception.reason}
                            </p>
                          )}
                          
                          {!exception.is_closed && exception.time_ranges && exception.time_ranges.length > 0 && (
                            <div className="ml-8 space-y-1">
                              {exception.time_ranges.map((range, idx) => (
                                <div key={idx} className="text-sm flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-muted-foreground" />
                                  <span>{range.start} - {range.end}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => exception.id && deleteExceptionMutation.mutate(exception.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Exception Dialog */}
      <Dialog open={exceptionDialog} onOpenChange={setExceptionDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Date Exception</DialogTitle>
            <DialogDescription>
              Create a closure or set special hours for a specific date
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="from-date">From Date *</Label>
                <Input
                  id="from-date"
                  type="date"
                  value={exceptionForm.from_date}
                  min={format(new Date(), "yyyy-MM-dd")}
                  onChange={(e) => setExceptionForm({ ...exceptionForm, from_date: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="to-date">To Date *</Label>
                <Input
                  id="to-date"
                  type="date"
                  value={exceptionForm.to_date}
                  min={exceptionForm.from_date}
                  onChange={(e) => setExceptionForm({ ...exceptionForm, to_date: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-900">
                <strong>💡 Tip:</strong> Select the same date in both fields for a single day, 
                or choose different dates to mark multiple days unavailable.
              </p>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="is-closed">Closed all day?</Label>
              <Switch
                id="is-closed"
                checked={exceptionForm.is_closed}
                onCheckedChange={(checked) =>
                  setExceptionForm({
                    ...exceptionForm,
                    is_closed: checked,
                    time_ranges: checked ? [] : exceptionForm.time_ranges,
                  })
                }
              />
            </div>

            <div>
              <Label htmlFor="reason">Reason (optional)</Label>
              <Textarea
                id="reason"
                value={exceptionForm.reason}
                onChange={(e) => setExceptionForm({ ...exceptionForm, reason: e.target.value })}
                placeholder="e.g., Holiday, Staff training, Emergency closure"
                className="mt-1"
                rows={2}
              />
            </div>

            {!exceptionForm.is_closed && (
              <div>
                <Label>Special Hours</Label>
                <div className="space-y-2 mt-2">
                  {(exceptionForm.time_ranges || []).map((range, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        type="time"
                        value={range.start}
                        onChange={(e) =>
                          updateExceptionTimeRange(index, "start", e.target.value)
                        }
                        className="w-32"
                      />
                      <span className="text-sm text-muted-foreground">to</span>
                      <Input
                        type="time"
                        value={range.end}
                        onChange={(e) =>
                          updateExceptionTimeRange(index, "end", e.target.value)
                        }
                        className="w-32"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeExceptionTimeRange(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={addExceptionTimeRange}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Time Range
                  </Button>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setExceptionDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => saveExceptionMutation.mutate(exceptionForm)}
              disabled={saveExceptionMutation.isPending}
            >
              {saveExceptionMutation.isPending ? "Saving..." : "Save Exception"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
