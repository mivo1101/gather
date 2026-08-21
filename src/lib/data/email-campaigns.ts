import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getEventWorkspaceForUser } from "@/lib/data/event-workspaces";

export type EmailDeliveryStatus = "pending" | "sent" | "failed" | "bounced";

export interface EmailCampaign {
  id: string;
  eventId: string;
  subject: string;
  previewText: string;
  senderName: string;
  replyTo: string;
  greeting: string;
  body: string;
  ctaLabel: string;
  includeCalendar: boolean;
  heroImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EmailCampaignDraft {
  subject: string;
  previewText: string;
  senderName: string;
  replyTo: string;
  greeting: string;
  body: string;
  ctaLabel: string;
  includeCalendar: boolean;
  /** Absolute or app-relative URL; empty string means no hero. */
  heroImageUrl: string;
}

export interface EmailDelivery {
  id: string;
  campaignId: string;
  guestId: string;
  status: EmailDeliveryStatus;
  providerMessageId: string | null;
  error: string | null;
  idempotencyKey: string;
  sentAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CampaignRow {
  id: string;
  event_id: string;
  subject: string;
  preview_text: string;
  sender_name: string;
  reply_to: string;
  greeting: string;
  body: string;
  cta_label: string;
  include_calendar: boolean;
  hero_image_url: string | null;
  created_at: string;
  updated_at: string;
}

interface DeliveryRow {
  id: string;
  campaign_id: string;
  guest_id: string;
  status: EmailDeliveryStatus;
  provider_message_id: string | null;
  error: string | null;
  idempotency_key: string;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
}

const CAMPAIGN_COLUMNS =
  "id, event_id, subject, preview_text, sender_name, reply_to, greeting, body, cta_label, include_calendar, hero_image_url, created_at, updated_at";

const DELIVERY_COLUMNS =
  "id, campaign_id, guest_id, status, provider_message_id, error, idempotency_key, sent_at, created_at, updated_at";

function mapCampaign(row: CampaignRow): EmailCampaign {
  return {
    id: row.id,
    eventId: row.event_id,
    subject: row.subject,
    previewText: row.preview_text,
    senderName: row.sender_name,
    replyTo: row.reply_to,
    greeting: row.greeting,
    body: row.body,
    ctaLabel: row.cta_label,
    includeCalendar: row.include_calendar,
    heroImageUrl: row.hero_image_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapDelivery(row: DeliveryRow): EmailDelivery {
  return {
    id: row.id,
    campaignId: row.campaign_id,
    guestId: row.guest_id,
    status: row.status,
    providerMessageId: row.provider_message_id,
    error: row.error,
    idempotencyKey: row.idempotency_key,
    sentAt: row.sent_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function defaultEmailCampaignDraft(input: {
  eventName: string;
  senderName: string;
  replyTo: string;
  heroImageUrl?: string | null;
}): EmailCampaignDraft {
  return {
    subject: `You're invited to ${input.eventName}`,
    previewText: `Open your personalised invitation to ${input.eventName}.`,
    senderName: input.senderName,
    replyTo: input.replyTo,
    greeting: "Dear",
    body: [
      `We would love for you to join us for ${input.eventName}.`,
      "",
      "Open your invitation below for the details and to RSVP.",
    ].join("\n"),
    ctaLabel: "View invitation",
    includeCalendar: true,
    heroImageUrl: input.heroImageUrl?.trim() || "",
  };
}

export function validateEmailCampaignDraft(
  draft: EmailCampaignDraft,
): string | null {
  if (!draft.subject.trim()) return "Subject is required.";
  if (!draft.senderName.trim()) return "Sender name is required.";
  if (!draft.replyTo.trim()) return "Reply-to email is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.replyTo.trim())) {
    return "Reply-to email looks invalid.";
  }
  if (!draft.greeting.trim()) return "Greeting is required.";
  if (!draft.body.trim()) return "Email body is required.";
  if (!draft.ctaLabel.trim()) return "Button label is required.";
  return null;
}

function formatCampaignDbError(message: string): string {
  const lower = message.toLowerCase();
  if (
    lower.includes("hero_image_url") &&
    (lower.includes("does not exist") ||
      lower.includes("could not find") ||
      lower.includes("schema cache"))
  ) {
    return "Missing email hero column. Run supabase/migrations/007_email_hero_image.sql.";
  }
  if (
    (lower.includes("event_email_campaigns") ||
      lower.includes("event_email_deliveries")) &&
    (lower.includes("does not exist") ||
      lower.includes("could not find") ||
      lower.includes("schema cache"))
  ) {
    return "Missing email tables. Run supabase/migrations/006_event_email_campaigns.sql.";
  }
  return message;
}

export async function getEmailCampaignForEvent(
  eventId: string,
): Promise<EmailCampaign | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("event_email_campaigns")
    .select(CAMPAIGN_COLUMNS)
    .eq("event_id", eventId)
    .maybeSingle();

  if (error) {
    throw new Error(formatCampaignDbError(error.message));
  }
  return data ? mapCampaign(data as CampaignRow) : null;
}

export async function upsertEmailCampaignForEvent(input: {
  eventId: string;
  userId: string;
  draft: EmailCampaignDraft;
}): Promise<EmailCampaign> {
  const event = await getEventWorkspaceForUser(input.userId, input.eventId);
  if (!event || event.id !== input.eventId) {
    throw new Error("Event not found.");
  }

  const validationError = validateEmailCampaignDraft(input.draft);
  if (validationError) throw new Error(validationError);

  const payload = {
    event_id: input.eventId,
    subject: input.draft.subject.trim(),
    preview_text: input.draft.previewText.trim(),
    sender_name: input.draft.senderName.trim(),
    reply_to: input.draft.replyTo.trim().toLowerCase(),
    greeting: input.draft.greeting.trim(),
    body: input.draft.body.trim(),
    cta_label: input.draft.ctaLabel.trim(),
    include_calendar: input.draft.includeCalendar,
    hero_image_url: input.draft.heroImageUrl.trim() || null,
    updated_at: new Date().toISOString(),
  };

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("event_email_campaigns")
    .upsert(payload, { onConflict: "event_id" })
    .select(CAMPAIGN_COLUMNS)
    .single();

  if (error || !data) {
    throw new Error(
      formatCampaignDbError(error?.message ?? "Failed to save email draft."),
    );
  }
  return mapCampaign(data as CampaignRow);
}

export async function getDeliveriesForCampaign(
  campaignId: string,
): Promise<EmailDelivery[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("event_email_deliveries")
    .select(DELIVERY_COLUMNS)
    .eq("campaign_id", campaignId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(formatCampaignDbError(error.message));
  }
  return ((data ?? []) as DeliveryRow[]).map(mapDelivery);
}

/** Load the event campaign and its deliveries in one database round trip. */
export async function getEmailSummaryForEvent(eventId: string): Promise<{
  campaign: EmailCampaign | null;
  deliveries: EmailDelivery[];
}> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("event_email_campaigns")
    .select(`${CAMPAIGN_COLUMNS}, event_email_deliveries (${DELIVERY_COLUMNS})`)
    .eq("event_id", eventId)
    .maybeSingle();

  if (error) {
    throw new Error(formatCampaignDbError(error.message));
  }
  if (!data) return { campaign: null, deliveries: [] };

  const row = data as unknown as CampaignRow & {
    event_email_deliveries: DeliveryRow[] | null;
  };
  return {
    campaign: mapCampaign(row),
    deliveries: (row.event_email_deliveries ?? []).map(mapDelivery),
  };
}

/** Stable key so a guest cannot be emailed twice for the same campaign. */
export function deliveryIdempotencyKey(
  campaignId: string,
  guestId: string,
): string {
  return `${campaignId}:${guestId}`;
}

export async function upsertDeliveryRecord(input: {
  campaignId: string;
  guestId: string;
  status: EmailDeliveryStatus;
  providerMessageId?: string | null;
  error?: string | null;
  sentAt?: string | null;
}): Promise<EmailDelivery> {
  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();
  const payload = {
    campaign_id: input.campaignId,
    guest_id: input.guestId,
    status: input.status,
    provider_message_id: input.providerMessageId ?? null,
    error: input.error ?? null,
    idempotency_key: deliveryIdempotencyKey(input.campaignId, input.guestId),
    sent_at: input.sentAt ?? (input.status === "sent" ? now : null),
    updated_at: now,
  };

  const { data, error } = await supabase
    .from("event_email_deliveries")
    .upsert(payload, { onConflict: "campaign_id,guest_id" })
    .select(DELIVERY_COLUMNS)
    .single();

  if (error || !data) {
    throw new Error(
      formatCampaignDbError(error?.message ?? "Failed to save delivery."),
    );
  }
  return mapDelivery(data as DeliveryRow);
}
