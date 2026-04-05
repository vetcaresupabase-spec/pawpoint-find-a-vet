import { PushNotifications } from "@capacitor/push-notifications";
import { isNativeApp } from "./platform";

export async function initialisePushNotifications(): Promise<void> {
  if (!isNativeApp()) {
    return;
  }

  const permissionStatus = await PushNotifications.requestPermissions();

  if (permissionStatus.receive !== "granted") {
    console.warn("[PushNotifications] Permission denied by user");
    return;
  }

  await PushNotifications.register();

  PushNotifications.addListener("registration", (token) => {
    // TODO: Save this token to Supabase against the user's profile
    console.log("[PushNotifications] Device token:", token.value);
  });

  PushNotifications.addListener("registrationError", (error) => {
    console.error("[PushNotifications] Registration error:", error);
  });

  PushNotifications.addListener(
    "pushNotificationReceived",
    (notification) => {
      console.log("[PushNotifications] Received:", notification);
    }
  );

  PushNotifications.addListener(
    "pushNotificationActionPerformed",
    (action) => {
      // TODO: Handle navigation to the relevant booking or appointment
      console.log("[PushNotifications] Action performed:", action);
    }
  );
}
