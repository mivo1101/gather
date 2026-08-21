import type { EventWorkspace } from "@/lib/data/event-workspaces";
import {
  getEmailSummaryForEvent,
  type EmailDelivery,
} from "@/lib/data/email-campaigns";
import { getGuestsForEvent, type EventGuest } from "@/lib/data/guests";
import { absoluteUrl } from "@/lib/email/invite-email";
import {
  getTransactionalEmailMessageId,
  sendTransactionalEmail,
} from "@/lib/email/send";
import { guestDisplayLabel, guestInvitePath } from "@/lib/invitation-paths";

export interface EventDetailChange {
  label: string;
  previous: string;
  next: string;
}

export interface EventUpdateSendResult {
  sent: number;
  failed: number;
  threaded: number;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderEventUpdateEmail(input: {
  event: EventWorkspace;
  guest: EventGuest;
  changes: EventDetailChange[];
}): { html: string; text: string } {
  const guestName = guestDisplayLabel(input.guest);
  const inviteUrl = absoluteUrl(
    guestInvitePath(input.event.slug, input.guest.token),
  );
  const rows = input.changes
    .map(
      (change) => `
        <tr>
          <td style="padding:12px 12px 12px 0;color:#777;font-size:13px;vertical-align:top;">${escapeHtml(change.label)}</td>
          <td style="padding:12px 0;color:#181818;font-size:14px;line-height:1.5;">
            <span style="color:#999;text-decoration:line-through;">${escapeHtml(change.previous)}</span><br />
            <strong>${escapeHtml(change.next)}</strong>
          </td>
        </tr>`,
    )
    .join("");
  const textChanges = input.changes
    .map(
      (change) =>
        `${change.label}: ${change.previous} → ${change.next}`,
    )
    .join("\n");

  return {
    html: `<!doctype html><html><body style="margin:0;background:#f8f5f3;font-family:Arial,sans-serif;color:#181818;"><div style="display:none;max-height:0;overflow:hidden;">The details for ${escapeHtml(input.event.name)} have changed.</div><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8f5f3;padding:32px 16px;"><tr><td align="center"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#fff;border-radius:20px;padding:32px;"><tr><td><p style="margin:0 0 12px;color:#ff4f9a;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;">Event Update</p><h1 style="margin:0 0 16px;font-size:28px;line-height:1.2;">${escapeHtml(input.event.name)}</h1><p style="margin:0 0 24px;color:#555;font-size:15px;line-height:1.6;">Hi ${escapeHtml(guestName)}, some important event details have changed. Please use the updated information below.</p><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-top:1px solid #eee;border-bottom:1px solid #eee;">${rows}</table><p style="margin:28px 0 0;"><a href="${escapeHtml(inviteUrl)}" style="display:inline-block;border-radius:999px;background:#111;color:#fff;padding:12px 20px;text-decoration:none;font-size:14px;font-weight:700;">View updated invitation</a></p></td></tr></table></td></tr></table></body></html>`,
    text: [
      `Event update: ${input.event.name}`,
      "",
      `Hi ${guestName}, some important event details have changed:`,
      "",
      textChanges,
      "",
      `View the updated invitation: ${inviteUrl}`,
    ].join("\n"),
  };
}

async function threadHeaders(
  delivery: EmailDelivery,
): Promise<Record<string, string> | undefined> {
  if (!delivery.providerMessageId) return undefined;
  try {
    const messageId = await getTransactionalEmailMessageId(
      delivery.providerMessageId,
    );
    if (!messageId) return undefined;
    return {
      "In-Reply-To": messageId,
      References: messageId,
    };
  } catch {
    return undefined;
  }
}

export async function sendEventUpdateEmails(input: {
  event: EventWorkspace;
  changes: EventDetailChange[];
}): Promise<EventUpdateSendResult> {
  const [{ campaign, deliveries }, guests] = await Promise.all([
    getEmailSummaryForEvent(input.event.id),
    getGuestsForEvent(input.event.id),
  ]);
  if (!campaign || input.changes.length === 0) {
    return { sent: 0, failed: 0, threaded: 0 };
  }

  const sentDeliveries = deliveries.filter(
    (delivery) => delivery.status === "sent",
  );
  const guestsById = new Map(guests.map((guest) => [guest.id, guest]));
  let sent = 0;
  let failed = 0;
  let threaded = 0;

  for (const delivery of sentDeliveries) {
    const guest = guestsById.get(delivery.guestId);
    if (!guest) continue;
    try {
      const headers = await threadHeaders(delivery);
      const rendered = renderEventUpdateEmail({
        event: input.event,
        guest,
        changes: input.changes,
      });
      await sendTransactionalEmail({
        to: guest.email,
        subject: headers
          ? `Re: ${campaign.subject}`
          : `Event update: ${input.event.name}`,
        html: rendered.html,
        text: rendered.text,
        replyTo: campaign.replyTo,
        fromName: campaign.senderName,
        headers,
      });
      sent += 1;
      if (headers) threaded += 1;
    } catch {
      failed += 1;
    }
  }

  return { sent, failed, threaded };
}
