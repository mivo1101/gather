import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type {
  RsvpConfig,
  RsvpQuestion,
  InvitationPage,
} from "@/lib/data/invitation-content";
import type { Invitation } from "@/lib/data/types";
import { getPersonalisedInvite } from "@/lib/data/personalised-invites";
import { getEventWorkspaceForUser } from "@/lib/data/event-workspaces";

export type RsvpAttendance = "yes" | "no" | "unknown";
export type RsvpAnswerValue = string | string[];

const FALLBACK_RSVP_THEME: RsvpConfig["theme"] = {
  background: "#ffffff",
  surface: "#f6f6f6",
  accent: "#1F2D22",
  text: "#1F2D22",
  muted: "#8E8E93",
  buttonStyle: "pill",
  headingFont: "playfair",
  bodyFont: "urbanist",
};

/** True when a design page has Yes/No or form widgets guests can answer. */
export function pageHasAnswerWidgets(page: InvitationPage): boolean {
  return page.elements.some(
    (el) =>
      el.type === "widget" &&
      el.widget &&
      (el.widget.kind === "attend" ||
        el.widget.kind === "short_text" ||
        el.widget.kind === "single_choice" ||
        el.widget.kind === "multi_choice"),
  );
}

/** Prefer dedicated RSVP pages; otherwise build questions from canvas widgets. */
export function rsvpConfigFromInvitation(
  invitation: Invitation,
): RsvpConfig | null {
  const dedicated = invitation.content.pages.find(
    (page) => page.kind === "rsvp" && page.rsvpConfig,
  );
  if (dedicated?.rsvpConfig) return dedicated.rsvpConfig;

  const questions: RsvpQuestion[] = [];
  for (const page of invitation.content.pages) {
    for (const el of page.elements) {
      if (el.type !== "widget" || !el.widget) continue;
      const widget = el.widget;
      if (widget.kind === "attend") {
        questions.push({
          id: el.id,
          type: "attend",
          label: widget.label,
          yesLabel: widget.yesLabel,
          noLabel: widget.noLabel,
          required: widget.required !== false,
        });
      } else if (widget.kind === "short_text") {
        questions.push({
          id: el.id,
          type: "short_text",
          label: widget.label,
          placeholder: widget.placeholder,
          required: Boolean(widget.required),
        });
      } else if (widget.kind === "single_choice") {
        questions.push({
          id: el.id,
          type: "single_choice",
          label: widget.label,
          required: Boolean(widget.required),
          options: widget.options,
        });
      } else if (widget.kind === "multi_choice") {
        questions.push({
          id: el.id,
          type: "multi_choice",
          label: widget.label,
          required: Boolean(widget.required),
          options: widget.options,
        });
      }
    }
  }

  if (questions.length === 0) return null;
  return {
    title: "RSVP",
    note: "Please respond soon",
    theme: FALLBACK_RSVP_THEME,
    questions,
  };
}

export interface RsvpResponse {
  id: string;
  eventId: string;
  guestId: string;
  attendance: RsvpAttendance;
  answers: Record<string, RsvpAnswerValue>;
  submittedAt: string;
  updatedAt: string;
}

interface RsvpRow {
  id: string;
  event_id: string;
  guest_id: string;
  attendance: RsvpAttendance;
  answers: Record<string, RsvpAnswerValue> | null;
  submitted_at: string;
  updated_at: string;
}

const COLUMNS =
  "id, event_id, guest_id, attendance, answers, submitted_at, updated_at";

function mapRow(row: RsvpRow): RsvpResponse {
  return {
    id: row.id,
    eventId: row.event_id,
    guestId: row.guest_id,
    attendance: row.attendance,
    answers: row.answers ?? {},
    submittedAt: row.submitted_at,
    updatedAt: row.updated_at,
  };
}

function formatRsvpDbError(message: string): string {
  const lower = message.toLowerCase();
  if (
    lower.includes("event_rsvp_responses") &&
    (lower.includes("does not exist") ||
      lower.includes("could not find") ||
      lower.includes("schema cache"))
  ) {
    return "Missing RSVP table. Run supabase/migrations/008_event_rsvp_responses.sql.";
  }
  return message;
}

export function deriveAttendance(
  questions: RsvpQuestion[],
  answers: Record<string, RsvpAnswerValue>,
): RsvpAttendance {
  const attend = questions.find((q) => q.type === "attend");
  if (!attend) return "unknown";
  const value = answers[attend.id];
  if (value === "yes" || value === "no") return value;
  return "unknown";
}

export function validateRsvpAnswers(
  config: RsvpConfig,
  answers: Record<string, RsvpAnswerValue>,
): string | null {
  for (const question of config.questions) {
    const required =
      question.type === "attend" ? true : Boolean(question.required);
    const value = answers[question.id];
    const empty =
      value === undefined ||
      value === null ||
      (typeof value === "string" && !value.trim()) ||
      (Array.isArray(value) && value.length === 0);

    if (required && empty) {
      return `Please answer "${question.label || "this question"}".`;
    }

    if (
      question.type === "attend" &&
      value &&
      value !== "yes" &&
      value !== "no"
    ) {
      return "Attendance reply must be yes or no.";
    }
  }
  return null;
}

export async function getRsvpResponseForGuest(
  guestId: string,
): Promise<RsvpResponse | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("event_rsvp_responses")
    .select(COLUMNS)
    .eq("guest_id", guestId)
    .maybeSingle();

  if (error) throw new Error(formatRsvpDbError(error.message));
  return data ? mapRow(data as RsvpRow) : null;
}

export async function getRsvpResponsesForEvent(
  eventId: string,
): Promise<RsvpResponse[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("event_rsvp_responses")
    .select(COLUMNS)
    .eq("event_id", eventId)
    .order("submitted_at", { ascending: true });

  if (error) throw new Error(formatRsvpDbError(error.message));
  return ((data ?? []) as RsvpRow[]).map(mapRow);
}

export async function getRsvpResponsesForEventForUser(input: {
  userId: string;
  eventId: string;
}): Promise<RsvpResponse[]> {
  const event = await getEventWorkspaceForUser(input.userId, input.eventId);
  if (!event || event.id !== input.eventId) {
    throw new Error("Event not found.");
  }
  return getRsvpResponsesForEvent(event.id);
}

/** Upsert RSVP for a guest identified by invite token + event slug. */
export async function submitRsvpByInviteToken(input: {
  eventSlug: string;
  token: string;
  answers: Record<string, RsvpAnswerValue>;
}): Promise<RsvpResponse> {
  const invite = await getPersonalisedInvite(input.eventSlug, input.token);
  if (!invite) {
    throw new Error("Invitation not found.");
  }

  const config = rsvpConfigFromInvitation(invite.invitation);
  if (!config) {
    throw new Error("This invitation does not have RSVP questions.");
  }

  const validationError = validateRsvpAnswers(config, input.answers);
  if (validationError) throw new Error(validationError);

  const attendance = deriveAttendance(config.questions, input.answers);
  const now = new Date().toISOString();
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("event_rsvp_responses")
    .upsert(
      {
        event_id: invite.event.id,
        guest_id: invite.guest.id,
        attendance,
        answers: input.answers,
        submitted_at: now,
        updated_at: now,
      },
      { onConflict: "guest_id" },
    )
    .select(COLUMNS)
    .single();

  if (error || !data) {
    throw new Error(
      formatRsvpDbError(error?.message ?? "Failed to save RSVP."),
    );
  }

  return mapRow(data as RsvpRow);
}
