import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Clock, DollarSign } from "lucide-react";
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
import { 
  useServices, 
  useCreateService, 
  useUpdateService, 
  useDeleteService,
  type Service,
  type CreateServiceData 
} from "@/hooks/useServices";
import { toast } from "@/hooks/use-toast";

const DEFAULT_CATEGORIES = [
  'Wellness & Preventive Care',
  'Diagnostics & Imaging',
  'Dental Care',
  'Surgery & Anesthesia',
  'Medical Consults & Chronic Care',
  'Urgent & End-of-Life Care',
] as const;

interface ServiceForm extends CreateServiceData {
  price_min_str: string;
  price_max_str: string;
}

export const ServicesTab = ({ clinicId }: { clinicId: string }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [form, setForm] = useState<ServiceForm>({
    name: "",
    description: "",
    category: "",
    duration_minutes: 30,
    price_min_str: "",
    price_max_str: "",
  });

  // When category changes, auto-fill the service name with category name (unless editing)
  const handleCategoryChange = (newCategory: string) => {
    setForm(prev => ({
      ...prev,
      category: newCategory,
      // Only auto-fill name if it's empty or matches the previous category
      name: !prev.name || DEFAULT_CATEGORIES.includes(prev.name as any) 
        ? newCategory 
        : prev.name
    }));
  };

  // Use hooks
  const { data: services = [], isLoading } = useServices(clinicId);
  const createService = useCreateService(clinicId);
  const updateService = useUpdateService(clinicId);
  const deleteService = useDeleteService(clinicId);

  // Helper functions
  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      category: "",
      duration_minutes: 30,
      price_min_str: "",
      price_max_str: "",
    });
  };

  const openEditDialog = (service: Service) => {
    setEditingService(service);
    setForm({
      name: service.name,
      description: service.description || "",
      category: service.category || "",
      duration_minutes: service.duration_minutes,
      price_min_str: service.price_min?.toString() || "",
      price_max_str: service.price_max?.toString() || "",
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.category) {
      toast({
        title: "Missing required fields",
        description: "Please select a category and enter a service name.",
        variant: "destructive",
      });
      return;
    }

    const serviceData: CreateServiceData = {
      name: form.name.trim(),
      description: form.description?.trim() || undefined,
      category: form.category,
      duration_minutes: form.duration_minutes,
      price_min: form.price_min_str ? parseFloat(form.price_min_str) : undefined,
      price_max: form.price_max_str ? parseFloat(form.price_max_str) : undefined,
    };

    if (editingService) {
      updateService.mutate({ id: editingService.id, ...serviceData });
    } else {
      createService.mutate(serviceData);
    }
    
    setDialogOpen(false);
    setEditingService(null);
    resetForm();
  };

  const handleToggleActive = (service: Service) => {
    updateService.mutate({
      id: service.id,
      is_active: !service.is_active,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading services...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Services</h2>
          <p className="text-muted-foreground">
            Manage your clinic's services and pricing
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Service
        </Button>
      </div>

      {services.length === 0 ? (
        <Card className="p-8 text-center">
          <h3 className="text-lg font-semibold mb-2">No services yet</h3>
          <p className="text-muted-foreground mb-4">
            Add your first service to start accepting bookings
          </p>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Service
          </Button>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4 font-semibold">Service Name</th>
                  <th className="text-left p-4 font-semibold">Category</th>
                  <th className="text-left p-4 font-semibold">Duration</th>
                  <th className="text-left p-4 font-semibold">Price Range</th>
                  <th className="text-left p-4 font-semibold">Status</th>
                  <th className="text-right p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  <tr 
                    key={service.id} 
                    className={`border-b hover:bg-muted/50 transition-colors ${!service.is_active ? 'opacity-50' : ''}`}
                  >
                    <td className="p-4">
                      <div>
                        <div className="font-medium">{service.name}</div>
                        {service.description && (
                          <div className="text-sm text-muted-foreground mt-1">
                            {service.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-muted-foreground">
                        {service.category || '—'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{service.duration_minutes} min</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-sm">
                        {(service.price_min || service.price_max) ? (
                          <>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {service.price_min && service.price_max
                                ? `€${service.price_min}-${service.price_max}`
                                : service.price_min
                                ? `€${service.price_min}+`
                                : `€${service.price_max}`}
                            </span>
                          </>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={service.is_active}
                          onCheckedChange={() => handleToggleActive(service)}
                        />
                        <span className="text-sm text-muted-foreground">
                          {service.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(service)}
                          title="Edit service"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteDialog(service.id)}
                          title="Delete service"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add/Edit Service Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingService ? "Edit Service" : "Add New Service"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4">
            <div>
              <label className="text-sm font-medium">Category *</label>
              <Select
                value={form.category}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category first" />
                </SelectTrigger>
                <SelectContent>
                  {DEFAULT_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Selecting a category will auto-fill the service name (you can edit it)
              </p>
            </div>

            <div>
              <label className="text-sm font-medium">Service Name *</label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Will auto-fill from category (editable)"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief description of the service"
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Duration (minutes) *</label>
              <Input
                type="number"
                value={form.duration_minutes}
                onChange={(e) => setForm({ ...form, duration_minutes: parseInt(e.target.value) || 30 })}
                min="1"
                max="480"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Min Price (€)</label>
                <Input
                  type="number"
                  value={form.price_min_str}
                  onChange={(e) => setForm({ ...form, price_min_str: e.target.value })}
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Max Price (€)</label>
                <Input
                  type="number"
                  value={form.price_max_str}
                  onChange={(e) => setForm({ ...form, price_max_str: e.target.value })}
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={createService.isPending || updateService.isPending || !form.name.trim() || !form.category}
            >
              {(createService.isPending || updateService.isPending) ? "Saving..." : editingService ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Service</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this service? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteDialog) {
                  deleteService.mutate(deleteDialog);
                  setDeleteDialog(null);
                }
              }}
              disabled={deleteService.isPending}
            >
              {deleteService.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};