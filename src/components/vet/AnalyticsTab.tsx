import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { TrendingUp, Users, Calendar, XCircle } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface AnalyticsData {
  total_appointments: number;
  last_7_days: number;
  failed_appointments: number;
  unique_owners: number;
}

interface TrendData {
  date: string;
  count: number;
}

export const AnalyticsTab = ({ clinicId }: { clinicId: string }) => {
  // Fetch analytics summary
  const { data: analytics } = useQuery({
    queryKey: ["clinicAnalytics", clinicId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_clinic_analytics", {
        p_clinic_id: clinicId,
        p_days: 30,
      });
      if (error) throw error;
      return data as AnalyticsData;
    },
  });

  // Fetch booking trend
  const { data: trend = [] } = useQuery({
    queryKey: ["bookingTrend", clinicId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_booking_trend", {
        p_clinic_id: clinicId,
        p_days: 14,
      });
      if (error) throw error;
      return (data || []).map((d: any) => ({
        date: new Date(d.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        count: Number(d.count),
      })) as TrendData[];
    },
  });

  const stats = [
    {
      title: "Total Appointments",
      value: analytics?.total_appointments || 0,
      subtitle: "Last 30 days",
      icon: Calendar,
      color: "text-blue-600",
    },
    {
      title: "This Week",
      value: analytics?.last_7_days || 0,
      subtitle: "Last 7 days",
      icon: TrendingUp,
      color: "text-green-600",
    },
    {
      title: "Unique Pet Owners",
      value: analytics?.unique_owners || 0,
      subtitle: "Last 30 days",
      icon: Users,
      color: "text-purple-600",
    },
    {
      title: "Failed Appointments",
      value: analytics?.failed_appointments || 0,
      subtitle: "Canceled or no-show",
      icon: XCircle,
      color: "text-red-600",
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Analytics</h2>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="p-6">
            <div className="flex items-center justify-between mb-2">
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div className="text-3xl font-bold mb-1">{stat.value}</div>
            <div className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {stat.subtitle}
            </div>
          </Card>
        ))}
      </div>

      {/* Booking Trend Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Booking Trend (14 Days)</h3>
        {trend.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#8884d8"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No data available
          </div>
        )}
      </Card>
    </div>
  );
};






