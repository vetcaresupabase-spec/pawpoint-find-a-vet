import { useState, useEffect } from "react";
import { WifiOff } from "lucide-react";

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const goOffline = () => setIsOffline(true);
    const goOnline = () => setIsOffline(false);

    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);

    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div
      role="alert"
      className="fixed top-0 left-0 right-0 z-[200] flex items-center justify-center gap-2 bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground"
      style={{ paddingTop: `max(0.5rem, env(safe-area-inset-top))` }}
    >
      <WifiOff className="h-4 w-4 shrink-0" />
      You're offline. Some features may be unavailable.
    </div>
  );
}
