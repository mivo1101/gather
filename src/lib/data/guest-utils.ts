/**
 * Pure guest helpers and types shared by the browser and the server.
 *
 * Kept apart from `guests.ts` so client components never pull in Supabase or
 * node:crypto - importing those from a client component made webpack ship a
 * ~318 kB Node crypto polyfill to the browser.
 */

export const FREE_RECIPIENT_LIMIT = 10;

export const GUEST_PREFIX_OPTIONS = [
  "",
  "Mr",
  "Mrs",
  "Ms",
  "Miss",
  "Mx",
  "Dr",
] as const;

export type GuestPrefix = (typeof GUEST_PREFIX_OPTIONS)[number];

export interface EventGuest {
  id: string;
  eventId: string;
  prefix: string;
  displayName: string;
  email: string;
  token: string;
  createdAt: string;
  updatedAt: string;
}

export interface GuestDraft {
  id?: string;
  prefix: string;
  displayName: string;
  email: string;
}

export interface GuestFieldError {
  row: number;
  field: "prefix" | "displayName" | "email" | "form";
  message: string;
}

export interface GuestValidationResult {
  ok: boolean;
  errors: GuestFieldError[];
  recipientCount: number;
  guests: GuestDraft[];
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function createEmptyGuestDraft(): GuestDraft {
  return { prefix: "", displayName: "", email: "" };
}

export function guestRecipientCount(guests: GuestDraft[]): number {
  const emails = new Set(
    guests
      .map((guest) => guest.email.trim().toLowerCase())
      .filter(Boolean),
  );
  return emails.size;
}

export function validateGuestDrafts(
  drafts: GuestDraft[],
  options?: { limit?: number; requireAtLeastOne?: boolean },
): GuestValidationResult {
  const limit = options?.limit ?? FREE_RECIPIENT_LIMIT;
  const errors: GuestFieldError[] = [];
  const normalised: GuestDraft[] = [];
  const seenEmails = new Map<string, number>();

  drafts.forEach((draft, index) => {
    const prefix = draft.prefix.trim();
    const displayName = draft.displayName.trim();
    const email = draft.email.trim();
    const blank = !prefix && !displayName && !email;

    if (blank) return;

    if (!displayName) {
      errors.push({
        row: index,
        field: "displayName",
        message: "Display name is required.",
      });
    }

    if (!email) {
      errors.push({
        row: index,
        field: "email",
        message: "Email is required.",
      });
    } else if (!EMAIL_PATTERN.test(email)) {
      errors.push({
        row: index,
        field: "email",
        message: "Enter a valid email address.",
      });
    } else {
      const key = email.toLowerCase();
      const prior = seenEmails.get(key);
      if (prior !== undefined) {
        errors.push({
          row: index,
          field: "email",
          message: "This email is already used by another guest.",
        });
      } else {
        seenEmails.set(key, index);
      }
    }

    normalised.push({
      id: draft.id,
      prefix,
      displayName,
      email,
    });
  });

  const recipientCount = seenEmails.size;
  if (recipientCount > limit) {
    errors.push({
      row: -1,
      field: "form",
      message: `Free accounts can invite up to ${limit} email recipients.`,
    });
  }

  if (options?.requireAtLeastOne && normalised.length === 0) {
    errors.push({
      row: -1,
      field: "form",
      message: "Add at least one guest to continue.",
    });
  }

  return {
    ok: errors.length === 0,
    errors,
    recipientCount,
    guests: normalised,
  };
}
