import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Lock, Eye, FileCheck, Users, Globe } from "lucide-react";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Header />

      <div className="container py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy & Security</h1>
            <p className="text-xl text-muted-foreground">
              Your pet's health information and your personal data are protected with the highest standards
            </p>
          </div>

          <div className="space-y-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Lock className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h2 className="text-2xl font-bold mb-3">Data Encryption</h2>
                    <p className="text-muted-foreground mb-3">
                      All data transmitted through PetFinder is encrypted using industry-standard SSL/TLS protocols. 
                      Your pet's medical records, personal information, and payment details are protected with 
                      end-to-end encryption.
                    </p>
                    <ul className="list-disc list-inside text-muted-foreground space-y-2">
                      <li>256-bit encryption for all data in transit</li>
                      <li>Secure data storage with AES encryption</li>
                      <li>Regular security audits and penetration testing</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <FileCheck className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h2 className="text-2xl font-bold mb-3">GDPR Compliance</h2>
                    <p className="text-muted-foreground mb-3">
                      PetFinder is fully compliant with the General Data Protection Regulation (GDPR) and other 
                      international privacy laws. We take your rights seriously.
                    </p>
                    <ul className="list-disc list-inside text-muted-foreground space-y-2">
                      <li>Right to access your data at any time</li>
                      <li>Right to delete your account and all associated data</li>
                      <li>Right to export your data in a portable format</li>
                      <li>Right to opt-out of marketing communications</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Eye className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h2 className="text-2xl font-bold mb-3">Data Collection & Usage</h2>
                    <p className="text-muted-foreground mb-3">
                      We only collect data necessary to provide you with the best veterinary care experience. 
                      Your information is never sold or shared without your explicit consent.
                    </p>
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold mb-1">What we collect:</h3>
                        <ul className="list-disc list-inside text-muted-foreground space-y-1">
                          <li>Contact information (name, email, phone)</li>
                          <li>Pet information (name, species, medical history)</li>
                          <li>Appointment and booking details</li>
                          <li>Payment information (processed securely by third-party providers)</li>
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">How we use it:</h3>
                        <ul className="list-disc list-inside text-muted-foreground space-y-1">
                          <li>Facilitate appointments and communication with veterinarians</li>
                          <li>Send appointment reminders and updates</li>
                          <li>Improve our services and user experience</li>
                          <li>Comply with legal obligations</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Users className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h2 className="text-2xl font-bold mb-3">Data Sharing</h2>
                    <p className="text-muted-foreground mb-3">
                      Your data is shared only with the veterinarians you choose to book with, and only the 
                      information necessary for providing care.
                    </p>
                    <ul className="list-disc list-inside text-muted-foreground space-y-2">
                      <li>Veterinarians see only relevant pet and contact information</li>
                      <li>You control what information is visible on your profile</li>
                      <li>We never share your data with advertisers or third parties</li>
                      <li>Medical records are shared only with your explicit consent</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Globe className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h2 className="text-2xl font-bold mb-3">Data Location & Storage</h2>
                    <p className="text-muted-foreground mb-3">
                      All data is stored on secure servers within the European Union, ensuring compliance with 
                      EU privacy regulations and data sovereignty requirements.
                    </p>
                    <ul className="list-disc list-inside text-muted-foreground space-y-2">
                      <li>Servers located in EU data centers</li>
                      <li>Regular backups for data protection</li>
                      <li>99.9% uptime guarantee</li>
                      <li>Disaster recovery protocols in place</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold mb-3">Questions About Privacy?</h2>
                <p className="text-muted-foreground mb-4">
                  If you have any questions about how we protect your privacy or want to exercise your data rights, 
                  please contact our Data Protection Officer.
                </p>
                <p className="text-muted-foreground">
                  <strong>Email:</strong> privacy@petfinder.com<br />
                  <strong>Last updated:</strong> October 2025
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
