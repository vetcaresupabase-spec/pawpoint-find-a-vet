import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Users,
  Star,
  TrendingUp,
  Settings,
  Bell,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const VetDashboard = () => {
  const stats = [
    { label: "Today's Appointments", value: "8", icon: Calendar, color: "text-primary" },
    { label: "Total Clients", value: "234", icon: Users, color: "text-secondary" },
    { label: "Average Rating", value: "4.8", icon: Star, color: "text-accent" },
    { label: "Monthly Revenue", value: "€4,200", icon: DollarSign, color: "text-primary" },
  ];

  const upcomingAppointments = [
    {
      id: 1,
      time: "09:00",
      petOwner: "Sarah Mueller",
      petName: "Max",
      petType: "Dog",
      service: "General Checkup",
      status: "confirmed",
    },
    {
      id: 2,
      time: "10:30",
      petOwner: "Hans Schmidt",
      petName: "Luna",
      petType: "Cat",
      service: "Vaccination",
      status: "confirmed",
    },
    {
      id: 3,
      time: "14:00",
      petOwner: "Maria Rossi",
      petName: "Charlie",
      petType: "Dog",
      service: "Dental Care",
      status: "pending",
    },
    {
      id: 4,
      time: "15:30",
      petOwner: "Jean Dupont",
      petName: "Bella",
      petType: "Cat",
      service: "General Checkup",
      status: "confirmed",
    },
  ];

  const recentClients = [
    { name: "Max Mueller", lastVisit: "2 days ago", visits: 12 },
    { name: "Luna Schmidt", lastVisit: "1 week ago", visits: 8 },
    { name: "Charlie Rossi", lastVisit: "2 weeks ago", visits: 15 },
    { name: "Bella Dupont", lastVisit: "3 days ago", visits: 6 },
  ];

  const recentReviews = [
    {
      author: "Sarah M.",
      rating: 5,
      date: "Yesterday",
      text: "Excellent care for my dog Max. Very professional and caring.",
    },
    {
      author: "Hans S.",
      rating: 5,
      date: "3 days ago",
      text: "Luna felt comfortable right away. Highly recommend!",
    },
    {
      author: "Maria R.",
      rating: 4,
      date: "1 week ago",
      text: "Good service, but wait time was a bit long.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Header />
      
      {/* Dashboard Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Welcome back, Dr. Schmidt!</h1>
              <p className="text-muted-foreground">Here's what's happening with your clinic today</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
              <Button size="sm" className="bg-accent hover:bg-accent/90">
                Upgrade to Premium
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-3xl font-bold mt-1">{stat.value}</p>
                    </div>
                    <Icon className={`h-12 w-12 ${stat.color} opacity-80`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="appointments" className="space-y-6">
          <TabsList>
            <TabsTrigger value="appointments">
              <Calendar className="h-4 w-4 mr-2" />
              Appointments
            </TabsTrigger>
            <TabsTrigger value="clients">
              <Users className="h-4 w-4 mr-2" />
              Clients
            </TabsTrigger>
            <TabsTrigger value="reviews">
              <Star className="h-4 w-4 mr-2" />
              Reviews
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <TrendingUp className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Today's Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/30 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <Clock className="h-5 w-5 text-primary mx-auto mb-1" />
                          <p className="text-sm font-semibold">{appointment.time}</p>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="text-lg font-bold">
                            {appointment.petName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold">{appointment.petName}</p>
                          <p className="text-sm text-muted-foreground">
                            {appointment.petType} • {appointment.petOwner}
                          </p>
                          <p className="text-sm text-muted-foreground">{appointment.service}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={appointment.status === "confirmed" ? "default" : "secondary"}>
                          {appointment.status === "confirmed" ? (
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                          ) : (
                            <Clock className="h-3 w-3 mr-1" />
                          )}
                          {appointment.status}
                        </Badge>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Clients Tab */}
          <TabsContent value="clients" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Clients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentClients.map((client, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/30 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="text-lg font-bold">{client.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-semibold">{client.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Last visit: {client.lastVisit} • {client.visits} total visits
                          </p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        View Profile
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentReviews.map((review, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{review.author}</p>
                          <div className="flex">
                            {Array.from({ length: review.rating }).map((_, i) => (
                              <Star key={i} className="h-4 w-4 text-primary fill-primary" />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{review.date}</p>
                      </div>
                      <p className="text-muted-foreground">{review.text}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="aspect-[2/1] bg-secondary/30 rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">Analytics Chart Placeholder</p>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">This Month</p>
                      <p className="text-2xl font-bold">127 appointments</p>
                      <p className="text-sm text-primary">+12% from last month</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">New Clients</p>
                      <p className="text-2xl font-bold">34</p>
                      <p className="text-sm text-primary">+8% from last month</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Cancellation Rate</p>
                      <p className="text-2xl font-bold">3.2%</p>
                      <p className="text-sm text-primary">-2% from last month</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="font-semibold">Profile Settings</h3>
                    <p className="text-sm text-muted-foreground">
                      Manage your clinic profile, availability, and services
                    </p>
                    <Button variant="outline">Edit Profile</Button>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold">Notification Preferences</h3>
                    <p className="text-sm text-muted-foreground">
                      Choose how you want to receive booking notifications
                    </p>
                    <Button variant="outline">Manage Notifications</Button>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold">Team Management</h3>
                    <p className="text-sm text-muted-foreground">
                      Add and manage team members (Premium feature)
                    </p>
                    <Button variant="outline">Invite Team Members</Button>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold">Subscription</h3>
                    <p className="text-sm text-muted-foreground">
                      Free trial • 89 days remaining
                    </p>
                    <Button>Upgrade to Premium</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default VetDashboard;
