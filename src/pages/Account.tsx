import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PageBreadcrumbs } from "@/components/PageBreadcrumbs";

const AccountSkeleton = () => (
  <div className="container py-8">
    <Skeleton className="h-9 w-40 mb-6" />
    <Card>
      <CardContent className="p-6 space-y-4">
        <div>
          <Skeleton className="h-4 w-16 mb-2" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div>
          <Skeleton className="h-4 w-28 mb-2" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-24" />
        </div>
      </CardContent>
    </Card>
  </div>
);

const Account = () => {
  const [email, setEmail] = useState<string>("");
  const [displayName, setDisplayName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (user) {
        setEmail(user.email ?? "");
        setDisplayName((user.user_metadata as any)?.full_name ?? "");
      }
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    const { error } = await supabase.auth.updateUser({ data: { full_name: displayName } });
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Saved", description: "Profile updated." });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
        <Header />
        <AccountSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Header />
      <div className="container py-8">
        <PageBreadcrumbs items={[{ label: "My Account" }]} className="mb-4" />
        <h1 className="text-3xl font-bold mb-6">My Account</h1>
        <Card>
          <CardContent className="p-6 space-y-4">
            <div>
              <label htmlFor="account-email" className="text-sm font-medium text-muted-foreground mb-1 block">Email</label>
              <Input id="account-email" value={email} readOnly />
            </div>
            <div>
              <label htmlFor="account-display-name" className="text-sm font-medium text-muted-foreground mb-1 block">Display name</label>
              <Input id="account-display-name" value={displayName} onChange={e => setDisplayName(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Button onClick={save}>Save changes</Button>
              <Button variant="outline" onClick={() => supabase.auth.signOut()}>Log out</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Account;
