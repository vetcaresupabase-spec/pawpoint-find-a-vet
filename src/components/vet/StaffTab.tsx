import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, User, Mail, Badge as BadgeIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  invite_accepted_at: string | null;
}

interface StaffForm {
  name: string;
  email: string;
  role: string;
}

const ROLES = [
  { value: "vet", label: "Veterinarian" },
  { value: "assistant", label: "Assistant" },
  { value: "technician", label: "Technician" },
  { value: "reception", label: "Reception" },
  { value: "nurse", label: "Nurse" },
  { value: "admin", label: "Admin" },
];

export const StaffTab = ({ clinicId }: { clinicId: string }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<StaffForm>({
    name: "",
    email: "",
    role: "vet",
  });
  const queryClient = useQueryClient();

  // Fetch staff members
  const { data: staff = [], isLoading } = useQuery({
    queryKey: ["clinicStaff", clinicId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clinic_staff")
        .select("*")
        .eq("clinic_id", clinicId)
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data as StaffMember[];
    },
  });

  // Add staff mutation
  const addMutation = useMutation({
    mutationFn: async (values: StaffForm) => {
      const { error } = await supabase.from("clinic_staff").insert({
        clinic_id: clinicId,
        name: values.name,
        email: values.email,
        role: values.role,
        invite_code: crypto.randomUUID(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinicStaff", clinicId] });
      setDialogOpen(false);
      setForm({ name: "", email: "", role: "vet" });
      toast({
        title: "Staff member added",
        description: "An invitation has been sent.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add staff member.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMutation.mutate(form);
  };

  const getRoleLabel = (role: string) => {
    return ROLES.find((r) => r.value === role)?.label || role;
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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Staff</h2>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Staff Member
        </Button>
      </div>

      {staff.length === 0 ? (
        <Card className="p-12 text-center">
          <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No staff members yet</h3>
          <p className="text-muted-foreground mb-4">
            Add staff members to help manage your clinic.
          </p>
          <Button onClick={() => setDialogOpen(true)}>
            Add Your First Staff Member
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {staff.map((member) => (
            <Card key={member.id} className="p-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <span className="font-semibold">{member.name}</span>
                  </div>
                  <Badge variant="secondary">{getRoleLabel(member.role)}</Badge>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{member.email}</span>
                </div>

                {!member.invite_accepted_at && (
                  <Badge variant="outline" className="text-xs">
                    Invitation pending
                  </Badge>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Staff Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Staff Member</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name *</label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Full name"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email *</label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="email@example.com"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Role *</label>
              <Select value={form.role} onValueChange={(value) => setForm({ ...form, role: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={addMutation.isPending}>
                {addMutation.isPending ? "Adding..." : "Add Staff Member"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};






