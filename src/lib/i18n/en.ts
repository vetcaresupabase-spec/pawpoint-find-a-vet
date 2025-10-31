export const en = {
  dashboard: {
    today: {
      title: "Today's Appointments",
      noAppointments: "No appointments scheduled for today",
      totalAppointments: "Total Appointments",
      filters: {
        all: "All",
        confirmed: "Confirmed",
        checkedIn: "Checked In",
        noShow: "No Show",
      },
      actions: {
        checkIn: "Check In",
        markNoShow: "Mark No Show",
        viewDetails: "View Details",
      },
      confirmNoShow: {
        title: "Mark as No Show?",
        description: "This will mark the appointment as a no-show. This action can be undone.",
        confirm: "Confirm No Show",
        cancel: "Cancel",
      },
    },
    services: {
      title: "Services",
      addService: "Add Service",
      noServices: "No services added yet",
      form: {
        name: "Service Name",
        namePlaceholder: "e.g., General Checkup",
        description: "Description",
        descriptionPlaceholder: "Brief description of the service",
        duration: "Duration (minutes)",
        priceMin: "Min Price (€)",
        priceMax: "Max Price (€)",
        save: "Save Service",
        cancel: "Cancel",
      },
      deleteConfirm: {
        title: "Deactivate Service?",
        description: "This service will be hidden from new bookings but existing appointments will remain.",
        confirm: "Deactivate",
        cancel: "Cancel",
      },
    },
    hours: {
      title: "Opening Hours",
      save: "Save Hours",
      saved: "Hours saved successfully",
      days: {
        sunday: "Sunday",
        monday: "Monday",
        tuesday: "Tuesday",
        wednesday: "Wednesday",
        thursday: "Thursday",
        friday: "Friday",
        saturday: "Saturday",
      },
      closed: "Closed",
      addTimeRange: "Add Time Range",
      removeTimeRange: "Remove",
    },
    staff: {
      title: "Staff",
      addStaff: "Add Staff Member",
      noStaff: "No staff members yet",
      roles: {
        vet: "Veterinarian",
        assistant: "Assistant",
        technician: "Technician",
        reception: "Reception",
        nurse: "Nurse",
        admin: "Admin",
      },
      form: {
        name: "Name",
        email: "Email",
        role: "Role",
        save: "Save",
        cancel: "Cancel",
      },
    },
    analytics: {
      title: "Analytics",
      last30Days: "Last 30 Days",
      last7Days: "Last 7 Days",
      totalAppointments: "Total Appointments",
      uniqueOwners: "Unique Pet Owners",
      failedAppointments: "Failed Appointments",
      trendTitle: "Booking Trend (14 Days)",
      noData: "No data available",
    },
  },
  common: {
    loading: "Loading...",
    error: "An error occurred",
    success: "Success",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    add: "Add",
    close: "Close",
  },
};

export type TranslationKeys = typeof en;




