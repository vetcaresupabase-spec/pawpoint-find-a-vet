import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Check, Calendar, MapPin, Clock, Globe, Upload, CheckCircle2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const VetOnboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);
  const navigate = useNavigate();

  const [clinicDetails, setClinicDetails] = useState({
    description: "",
    languages: [] as string[],
    services: [] as string[],
  });

  const [workingHours, setWorkingHours] = useState({
    monday: { open: "09:00", close: "18:00", enabled: true },
    tuesday: { open: "09:00", close: "18:00", enabled: true },
    wednesday: { open: "09:00", close: "18:00", enabled: true },
    thursday: { open: "09:00", close: "18:00", enabled: true },
    friday: { open: "09:00", close: "18:00", enabled: true },
    saturday: { open: "10:00", close: "14:00", enabled: false },
    sunday: { open: "10:00", close: "14:00", enabled: false },
  });

  const progress = (currentStep / 3) * 100;

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    } else {
      completeOnboarding();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const completeOnboarding = () => {
    toast({
      title: "Your profile is live!",
      description: "Pet owners can now find and book appointments with you.",
    });
    setIsCompleted(true);
  };

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
        <Header />
        <div className="container py-20">
          <Card className="max-w-2xl mx-auto text-center">
            <CardContent className="pt-12 pb-12">
              <CheckCircle2 className="h-20 w-20 text-primary mx-auto mb-6" />
              <h1 className="text-4xl font-bold mb-4">Your profile is live!</h1>
              <p className="text-xl text-muted-foreground mb-8">
                Congratulations! Pet owners can now find and book appointments with you.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" onClick={() => navigate("/vet-dashboard")}>
                  Go to My Dashboard
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/search">Preview My Public Profile</Link>
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-6">
                Want to add more team members?{" "}
                <button className="text-primary hover:underline" onClick={() => alert("Team invitation feature coming soon!")}>
                  Invite your team
                </button>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Header />
      
      <div className="container py-12">
        <div className="max-w-4xl mx-auto">
          {/* Progress Header */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold">Set up your clinic profile</h1>
              <span className="text-sm text-muted-foreground">Step {currentStep} of 3</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step 1: Clinic Details */}
          {currentStep === 1 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Clinic Details</h2>
                    <p className="text-muted-foreground">Tell pet owners about your practice</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <Label htmlFor="description">Clinic Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Tell pet owners what makes your clinic special..."
                      className="min-h-32"
                      value={clinicDetails.description}
                      onChange={(e) => setClinicDetails({ ...clinicDetails, description: e.target.value })}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      This will appear on your public profile
                    </p>
                  </div>

                  <div>
                    <Label>Languages Spoken</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                      {["English", "German", "French", "Spanish", "Italian", "Dutch"].map((lang) => (
                        <div key={lang} className="flex items-center space-x-2">
                          <Checkbox
                            id={lang}
                            checked={clinicDetails.languages.includes(lang)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setClinicDetails({
                                  ...clinicDetails,
                                  languages: [...clinicDetails.languages, lang],
                                });
                              } else {
                                setClinicDetails({
                                  ...clinicDetails,
                                  languages: clinicDetails.languages.filter((l) => l !== lang),
                                });
                              }
                            }}
                          />
                          <Label htmlFor={lang} className="font-normal cursor-pointer">
                            {lang}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Services Offered</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      {[
                        "General Consultation",
                        "Vaccinations",
                        "Surgery",
                        "Dental Care",
                        "Emergency Care",
                        "Grooming",
                        "Pet Nutrition",
                        "Behavioral Consultation",
                      ].map((service) => (
                        <div key={service} className="flex items-center space-x-2">
                          <Checkbox
                            id={service}
                            checked={clinicDetails.services.includes(service)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setClinicDetails({
                                  ...clinicDetails,
                                  services: [...clinicDetails.services, service],
                                });
                              } else {
                                setClinicDetails({
                                  ...clinicDetails,
                                  services: clinicDetails.services.filter((s) => s !== service),
                                });
                              }
                            }}
                          />
                          <Label htmlFor={service} className="font-normal cursor-pointer">
                            {service}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="photo">Clinic Photo or Logo</Label>
                    <div className="mt-2 flex items-center gap-4">
                      <div className="h-24 w-24 rounded-lg bg-secondary flex items-center justify-center">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div>
                        <Button variant="outline" onClick={() => toast({ title: "Upload feature", description: "Image upload coming soon!" })}>
                          Upload Image
                        </Button>
                        <p className="text-sm text-muted-foreground mt-1">
                          JPG, PNG or GIF (max 5MB)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Calendar Connection */}
          {currentStep === 2 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Set Your Availability</h2>
                    <p className="text-muted-foreground">Connect your calendar or set working hours manually</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-4">
                    <Button 
                      variant="outline" 
                      className="h-24 flex-col gap-2"
                      onClick={() => toast({ title: "Google Calendar", description: "Calendar integration coming soon!" })}
                    >
                      <Globe className="h-8 w-8" />
                      <span>Google Calendar</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-24 flex-col gap-2"
                      onClick={() => toast({ title: "Outlook Calendar", description: "Calendar integration coming soon!" })}
                    >
                      <Calendar className="h-8 w-8" />
                      <span>Outlook Calendar</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-24 flex-col gap-2"
                      onClick={() => toast({ title: "Manual Setup", description: "Use the working hours section below to set your availability." })}
                    >
                      <Clock className="h-8 w-8" />
                      <span>Manual Setup</span>
                    </Button>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="font-semibold mb-4">Working Hours</h3>
                    <div className="space-y-3">
                      {Object.entries(workingHours).map(([day, hours]) => (
                        <div key={day} className="flex items-center gap-4">
                          <Checkbox
                            checked={hours.enabled}
                            onCheckedChange={(checked) =>
                              setWorkingHours({
                                ...workingHours,
                                [day]: { ...hours, enabled: checked as boolean },
                              })
                            }
                          />
                          <Label className="w-24 capitalize">{day}</Label>
                          {hours.enabled ? (
                            <>
                              <Input
                                type="time"
                                value={hours.open}
                                onChange={(e) =>
                                  setWorkingHours({
                                    ...workingHours,
                                    [day]: { ...hours, open: e.target.value },
                                  })
                                }
                                className="w-32"
                              />
                              <span>to</span>
                              <Input
                                type="time"
                                value={hours.close}
                                onChange={(e) =>
                                  setWorkingHours({
                                    ...workingHours,
                                    [day]: { ...hours, close: e.target.value },
                                  })
                                }
                                className="w-32"
                              />
                            </>
                          ) : (
                            <span className="text-muted-foreground">Closed</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Profile Review */}
          {currentStep === 3 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Check className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Review Your Profile</h2>
                    <p className="text-muted-foreground">Make sure everything looks good before going live</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-secondary/30 rounded-lg p-6">
                    <h3 className="font-semibold mb-4">Profile Preview</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Clinic Description</p>
                        <p className="mt-1">
                          {clinicDetails.description || "No description added yet"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Languages</p>
                        <p className="mt-1">
                          {clinicDetails.languages.length > 0
                            ? clinicDetails.languages.join(", ")
                            : "No languages selected"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Services</p>
                        <p className="mt-1">
                          {clinicDetails.services.length > 0
                            ? clinicDetails.services.join(", ")
                            : "No services selected"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Availability</p>
                        <p className="mt-1">
                          {Object.entries(workingHours)
                            .filter(([_, hours]) => hours.enabled)
                            .map(([day]) => day)
                            .join(", ") || "No working hours set"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-primary/10 rounded-lg p-4">
                    <p className="text-sm">
                      <strong>Almost there!</strong> Once you complete setup, your profile will be visible to
                      pet owners in your area. You can always edit your profile later from your dashboard.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button variant="outline" onClick={handleBack} disabled={currentStep === 1}>
              Back
            </Button>
            <Button onClick={handleNext}>
              {currentStep === 3 ? "Complete Setup" : "Continue"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VetOnboarding;
