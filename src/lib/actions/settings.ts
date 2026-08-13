"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  DEFAULT_USER_SETTINGS,
  getUserSettings,
  saveUserSettings,
  type DateFormat,
} from "@/lib/data/user-settings";
import { updateUserProfile } from "@/lib/data/users-db";

async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");
  return session.user.id;
}

const supportedTimezones = new Set([
  "Australia/Melbourne",
  "Australia/Sydney",
  "Asia/Ho_Chi_Minh",
  "Asia/Singapore",
  "Europe/London",
  "America/New_York",
  "America/Los_Angeles",
]);

const supportedLanguages = new Set(["en-AU", "en-US", "vi-VN"]);
const supportedDateFormats = new Set<DateFormat>([
  "day_month_year",
  "month_day_year",
  "iso",
]);

export async function updateProfileAction(formData: FormData) {
  const userId = await requireUserId();
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();

  if (!firstName || firstName.length > 60 || lastName.length > 80) {
    return { ok: false, message: "Check the name fields and try again." };
  }

  try {
    await updateUserProfile(userId, [firstName, lastName].filter(Boolean).join(" "));
    revalidatePath("/settings");
    revalidatePath("/home");
    return { ok: true, message: "Changes saved." };
  } catch {
    return { ok: false, message: "Couldn’t save your profile. Try again." };
  }
}

export async function updateRegionalSettingsAction(formData: FormData) {
  const userId = await requireUserId();
  const current = await getUserSettings(userId);
  const timezone = String(formData.get("timezone") ?? "");
  const language = String(formData.get("language") ?? "");
  const dateFormat = String(formData.get("dateFormat") ?? "") as DateFormat;

  if (
    !supportedTimezones.has(timezone) ||
    !supportedLanguages.has(language) ||
    !supportedDateFormats.has(dateFormat)
  ) {
    return { ok: false, message: "Check the regional settings and try again." };
  }

  try {
    await saveUserSettings(userId, { ...current, timezone, language, dateFormat });
    revalidatePath("/settings");
    return { ok: true, message: "Changes saved." };
  } catch {
    return { ok: false, message: "Couldn’t save these settings. Try again." };
  }
}

export async function updateNotificationSettingsAction(formData: FormData) {
  const userId = await requireUserId();
  const current = await getUserSettings(userId).catch(
    () => DEFAULT_USER_SETTINGS,
  );

  try {
    await saveUserSettings(userId, {
      ...current,
      emailRsvpUpdates: formData.get("emailRsvpUpdates") === "on",
      emailDeliveryIssues: formData.get("emailDeliveryIssues") === "on",
      emailEventReminders: formData.get("emailEventReminders") === "on",
      emailProductUpdates: formData.get("emailProductUpdates") === "on",
    });
    revalidatePath("/settings");
    return { ok: true, message: "Preferences saved." };
  } catch {
    return { ok: false, message: "Couldn’t save your preferences. Try again." };
  }
}
