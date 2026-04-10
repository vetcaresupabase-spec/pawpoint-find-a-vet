import { isNativeApp } from "./platform";
import { FEATURES } from "@/config/features";

const NOTIFICATION_IDS = {
  DAILY_QUIZ_REMINDER: 9001,
  STREAK_WARNING: 9002,
} as const;

async function getLocalNotifications() {
  const { LocalNotifications } = await import("@capacitor/local-notifications");
  return LocalNotifications;
}

export async function scheduleDailyQuizReminder(): Promise<void> {
  if (!isNativeApp() || !FEATURES.GAMIFICATION) return;

  try {
    const LocalNotifications = await getLocalNotifications();

    const { display } = await LocalNotifications.requestPermissions();
    if (display !== "granted") return;

    await LocalNotifications.cancel({
      notifications: [{ id: NOTIFICATION_IDS.DAILY_QUIZ_REMINDER }],
    });

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);

    await LocalNotifications.schedule({
      notifications: [
        {
          id: NOTIFICATION_IDS.DAILY_QUIZ_REMINDER,
          title: "Daily Pet Quiz",
          body: "Your daily quiz is ready! Answer correctly to earn PawPoints and keep your streak alive.",
          schedule: { at: tomorrow, every: "day", allowWhileIdle: true },
          smallIcon: "ic_stat_paw",
          largeIcon: "ic_launcher",
          sound: "default",
        },
      ],
    });
  } catch {
    // non-critical
  }
}

export async function sendStreakWarning(currentStreak: number): Promise<void> {
  if (!isNativeApp() || !FEATURES.GAMIFICATION || currentStreak < 3) return;

  try {
    const LocalNotifications = await getLocalNotifications();

    const { display } = await LocalNotifications.requestPermissions();
    if (display !== "granted") return;

    await LocalNotifications.cancel({
      notifications: [{ id: NOTIFICATION_IDS.STREAK_WARNING }],
    });

    const tonight = new Date();
    tonight.setHours(20, 0, 0, 0);

    if (tonight <= new Date()) return;

    await LocalNotifications.schedule({
      notifications: [
        {
          id: NOTIFICATION_IDS.STREAK_WARNING,
          title: "Don't lose your streak!",
          body: `You're on a ${currentStreak}-day streak. Complete today's quiz before midnight to keep it going!`,
          schedule: { at: tonight, allowWhileIdle: true },
          smallIcon: "ic_stat_paw",
          largeIcon: "ic_launcher",
          sound: "default",
        },
      ],
    });
  } catch {
    // non-critical
  }
}

export async function cancelGamificationNotifications(): Promise<void> {
  if (!isNativeApp()) return;

  try {
    const LocalNotifications = await getLocalNotifications();
    await LocalNotifications.cancel({
      notifications: Object.values(NOTIFICATION_IDS).map((id) => ({ id })),
    });
  } catch {
    // non-critical
  }
}
