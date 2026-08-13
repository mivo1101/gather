import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type DateFormat = "day_month_year" | "month_day_year" | "iso";

export interface UserSettings {
  timezone: string;
  language: string;
  dateFormat: DateFormat;
  emailRsvpUpdates: boolean;
  emailDeliveryIssues: boolean;
  emailEventReminders: boolean;
  emailProductUpdates: boolean;
}

export const DEFAULT_USER_SETTINGS: UserSettings = {
  timezone: "Australia/Melbourne",
  language: "en-AU",
  dateFormat: "day_month_year",
  emailRsvpUpdates: true,
  emailDeliveryIssues: true,
  emailEventReminders: true,
  emailProductUpdates: false,
};

interface UserSettingsRow {
  timezone: string;
  language: string;
  date_format: DateFormat;
  email_rsvp_updates: boolean;
  email_delivery_issues: boolean;
  email_event_reminders: boolean;
  email_product_updates: boolean;
}

function fromRow(row: UserSettingsRow): UserSettings {
  return {
    timezone: row.timezone,
    language: row.language,
    dateFormat: row.date_format,
    emailRsvpUpdates: row.email_rsvp_updates,
    emailDeliveryIssues: row.email_delivery_issues,
    emailEventReminders: row.email_event_reminders,
    emailProductUpdates: row.email_product_updates,
  };
}

export async function getUserSettings(userId: string): Promise<UserSettings> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("user_settings")
    .select(
      "timezone, language, date_format, email_rsvp_updates, email_delivery_issues, email_event_reminders, email_product_updates",
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load user settings: ${error.message}`);
  }

  return data ? fromRow(data as UserSettingsRow) : DEFAULT_USER_SETTINGS;
}

export async function saveUserSettings(
  userId: string,
  settings: UserSettings,
): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("user_settings").upsert(
    {
      user_id: userId,
      timezone: settings.timezone,
      language: settings.language,
      date_format: settings.dateFormat,
      email_rsvp_updates: settings.emailRsvpUpdates,
      email_delivery_issues: settings.emailDeliveryIssues,
      email_event_reminders: settings.emailEventReminders,
      email_product_updates: settings.emailProductUpdates,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (error) {
    throw new Error(`Failed to save user settings: ${error.message}`);
  }
}
