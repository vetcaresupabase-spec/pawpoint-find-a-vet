import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { getClinicProfile, placeHold, confirmAppointment } from "@/integrations/supabase/queries";
import { Calendar } from "lucide-react";

const ClinicProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [pendingAppointmentId, setPendingAppointmentId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!id) return;
      setLoading(true);
      try {
        const d = await getClinicProfile(id);
        setData(d);
      } catch (e: any) {
        toast({ title: "Error", description: e.message });
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const onHold = async () => {
    if (!id || !start || !end) {
      toast({ title: "Missing times", description: "Please set start and end." });
      return;
    }
    try {
      const apptId = await placeHold({ clinicId: id, start, end });
      setPendingAppointmentId(apptId);
      toast({ title: "Hold placed", description: "Please confirm to finalize booking." });
    } catch (e: any) {
      toast({ title: "Cannot place hold", description: e.message });
    }
  };

  const onConfirm = async () => {
    if (!pendingAppointmentId) return;
    try {
      await confirmAppointment({ appointmentId: pendingAppointmentId });
      toast({ title: "Confirmed", description: "Your appointment is confirmed." });
      setPendingAppointmentId(null);
    } catch (e: any) {
      toast({ title: "Confirm failed", description: e.message });
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!data?.clinic) return <div className="p-6">Not found</div>;

  const { clinic, services, hours, photos, reviews } = data;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Header />
      <div className="container py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{clinic.name}</h1>
          <Button
            size="lg"
            onClick={() => navigate(`/book-appointment?clinicId=${id}`)}
          >
            <Calendar className="h-5 w-5 mr-2" />
            <span className="text-xs">Book Appointment</span>
          </Button>
        </div>

        <Card>
          <CardContent className="p-6 space-y-2">
            <p>{clinic.description}</p>
            <p className="text-sm text-muted-foreground">{clinic.address_line1} {clinic.city}</p>
            <p className="text-sm text-muted-foreground">Languages: {(clinic.languages || []).join(", ")}</p>
            <p className="text-sm text-muted-foreground">Specialties: {(clinic.specialties || []).join(", ")}</p>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="font-semibold mb-4">Services</h2>
              <ul className="space-y-2">
                {(services || []).map((s: any) => (
                  <li key={s.id} className="flex justify-between">
                    <span>{s.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {s.price_min ? `${s.price_min}` : ""}{s.price_max ? ` - ${s.price_max}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="font-semibold mb-4">Opening hours</h2>
              <ul className="space-y-1">
                {(hours || []).map((h: any) => (
                  <li key={h.id} className="text-sm text-muted-foreground">{h.day}: {h.opens} - {h.closes}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="font-semibold">Book an appointment</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Input type="datetime-local" value={start} onChange={e => setStart(e.target.value)} />
              <Input type="datetime-local" value={end} onChange={e => setEnd(e.target.value)} />
            </div>
            <div className="flex gap-3">
              <Button onClick={onHold}>Place hold</Button>
              <Button variant="outline" disabled={!pendingAppointmentId} onClick={onConfirm}>Confirm</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="font-semibold">Reviews</h2>
            <ul className="space-y-3">
              {(reviews || []).map((r: any) => (
                <li key={r.id} className="text-sm">
                  <span className="font-medium">{r.rating}/5</span> — {r.comment}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClinicProfile;






