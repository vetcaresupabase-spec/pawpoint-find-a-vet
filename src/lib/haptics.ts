import { isNativeApp } from "./platform";

type HapticType = "light" | "medium" | "heavy" | "success" | "warning" | "error";

export async function triggerHaptic(type: HapticType = "light") {
  if (!isNativeApp()) return;

  try {
    const { Haptics, ImpactStyle, NotificationType } = await import(
      "@capacitor/haptics"
    );

    switch (type) {
      case "light":
        return Haptics.impact({ style: ImpactStyle.Light });
      case "medium":
        return Haptics.impact({ style: ImpactStyle.Medium });
      case "heavy":
        return Haptics.impact({ style: ImpactStyle.Heavy });
      case "success":
        return Haptics.notification({ type: NotificationType.Success });
      case "warning":
        return Haptics.notification({ type: NotificationType.Warning });
      case "error":
        return Haptics.notification({ type: NotificationType.Error });
    }
  } catch {
    /* haptics unavailable */
  }
}
