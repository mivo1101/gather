import type { Invitation } from "@/lib/data/types";
import type { EmailCampaignDraft } from "@/lib/data/email-campaigns";
import { guestDisplayLabel, guestInvitePath } from "@/lib/invitation-paths";
import { formatEventDate } from "@/lib/format";

export function appBaseUrl(): string {
  const fromEnv =
    process.env.AUTH_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.VERCEL_URL?.trim();
  if (!fromEnv) return "http://localhost:3000";
  if (fromEnv.startsWith("http://") || fromEnv.startsWith("https://")) {
    return fromEnv.replace(/\/$/, "");
  }
  return `https://${fromEnv.replace(/\/$/, "")}`;
}

export function absoluteUrl(pathOrUrl: string, base = appBaseUrl()): string {
  if (!pathOrUrl) return base;
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return pathOrUrl;
  }
  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${base}${path}`;
}

/** Prefer the first image on the cover page for the email hero. */
export function invitationHeroImageUrl(
  invitation: Invitation | null | undefined,
  base = appBaseUrl(),
): string | null {
  const candidates = listInvitationImageCandidates(invitation, base);
  return candidates[0] ?? null;
}

/** Design images guests might reuse as the email hero photo. */
export function listInvitationImageCandidates(
  invitation: Invitation | null | undefined,
  base = appBaseUrl(),
): string[] {
  if (!invitation) return [];
  const urls: string[] = [];
  const push = (value: string | null | undefined) => {
    const trimmed = value?.trim();
    if (!trimmed) return;
    const absolute = absoluteUrl(trimmed, base);
    if (!urls.includes(absolute)) urls.push(absolute);
  };

  push(invitation.coverImage);
  for (const page of invitation.content.pages) {
    for (const el of page.elements) {
      if (el.type === "image") push(el.content);
    }
  }
  return urls;
}

/** Saved campaign hero, else first design image. */
export function resolveEmailHeroImageUrl(input: {
  heroImageUrl?: string | null;
  invitation?: Invitation | null;
  base?: string;
}): string | null {
  const chosen = input.heroImageUrl?.trim();
  if (chosen) return absoluteUrl(chosen, input.base);
  return invitationHeroImageUrl(input.invitation, input.base);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function bodyToHtml(body: string): string {
  return body
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => {
      const withBreaks = escapeHtml(paragraph).replace(/\n/g, "<br />");
      return `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#3a3a3c;">${withBreaks}</p>`;
    })
    .join("");
}

export function googleCalendarUrl(input: {
  title: string;
  startIso: string | null;
  timezone: string;
  location: string | null;
  details: string;
}): string | null {
  if (!input.startIso) return null;
  const start = new Date(input.startIso);
  if (Number.isNaN(start.getTime())) return null;

  const end = new Date(start.getTime() + 3 * 60 * 60 * 1000);
  const stamp = (date: Date) =>
    date
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}Z$/, "Z");

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: input.title,
    dates: `${stamp(start)}/${stamp(end)}`,
    details: input.details,
  });
  if (input.location) params.set("location", input.location);
  if (input.timezone) params.set("ctz", input.timezone);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export interface InviteEmailRenderInput {
  draft: EmailCampaignDraft;
  event: {
    name: string;
    slug: string;
    eventDate: string | null;
    timezone: string;
    venue: string | null;
    address: string | null;
  };
  guest: {
    prefix?: string | null;
    displayName: string;
    token: string;
  };
  heroImageUrl?: string | null;
  baseUrl?: string;
}

export interface InviteEmailRendered {
  subject: string;
  html: string;
  text: string;
  inviteUrl: string;
  previewGuestName: string;
}

export function renderInviteEmail(
  input: InviteEmailRenderInput,
): InviteEmailRendered {
  const base = input.baseUrl ?? appBaseUrl();
  const guestName = guestDisplayLabel(input.guest);
  const invitePath = guestInvitePath(input.event.slug, input.guest.token);
  const inviteUrl = absoluteUrl(invitePath, base);
  const location = [input.event.venue, input.event.address]
    .filter(Boolean)
    .join(", ");
  const dateLabel = input.event.eventDate
    ? formatEventDate(input.event.eventDate)
    : null;
  const calendarUrl = input.draft.includeCalendar
    ? googleCalendarUrl({
        title: input.event.name,
        startIso: input.event.eventDate,
        timezone: input.event.timezone,
        location: location || null,
        details: `Open your invitation: ${inviteUrl}`,
      })
    : null;

  const subject = input.draft.subject.includes("{{guest_name}}")
    ? input.draft.subject.replaceAll("{{guest_name}}", guestName)
    : input.draft.subject;

  const greetingLine = `${input.draft.greeting.trim()} ${guestName},`;
  const hero = input.heroImageUrl
    ? `<tr>
        <td style="padding:0;">
          <img src="${escapeHtml(input.heroImageUrl)}" alt="" width="560" style="display:block;width:100%;max-width:560px;height:auto;border:0;" />
        </td>
      </tr>`
    : "";

  const summaryBits = [
    dateLabel ? `<strong style="color:#000;">When</strong><br />${escapeHtml(dateLabel)}` : "",
    location
      ? `<strong style="color:#000;">Where</strong><br />${escapeHtml(location)}`
      : "",
  ].filter(Boolean);

  const summaryHtml = summaryBits.length
    ? `<tr>
        <td style="padding:0 32px 8px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
            <tr>
              ${summaryBits
                .map(
                  (bit) =>
                    `<td style="padding:12px 12px 12px 0;vertical-align:top;font-size:14px;line-height:1.5;color:#3a3a3c;width:50%;">${bit}</td>`,
                )
                .join("")}
            </tr>
          </table>
        </td>
      </tr>`
    : "";

  const calendarButton = calendarUrl
    ? `<a href="${escapeHtml(calendarUrl)}" style="display:inline-block;margin:0 8px 8px 0;padding:12px 22px;border-radius:999px;border:1px solid #d8d8dc;background:#ffffff;color:#000000;font-size:14px;font-weight:600;text-decoration:none;">Add to calendar</a>`
    : "";

  const marketingUrl = base;
  const fontStack =
    "'Urbanist',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";
  const brandMark = `<table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:0 0 14px;">
              <tr>
                <td style="vertical-align:middle;padding:0 8px 0 0;">
                  <span style="display:inline-block;width:28px;height:28px;line-height:28px;text-align:center;border-radius:999px;background:#000000;color:#ff60aa;font-size:16px;font-weight:700;font-family:${fontStack};">+</span>
                </td>
                <td style="vertical-align:middle;padding:0;">
                  <span style="font-family:${fontStack};font-size:20px;font-weight:600;letter-spacing:-0.02em;color:#000000;">Gather</span>
                </td>
              </tr>
            </table>`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(subject)}</title>
  <!--[if !mso]><!-->
  <link href="https://fonts.googleapis.com/css2?family=Urbanist:wght@600;700&display=swap" rel="stylesheet" />
  <!--<![endif]-->
</head>
<body style="margin:0;padding:0;background:#f6f6f6;font-family:${fontStack};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
    ${escapeHtml(input.draft.previewText || `You're invited to ${input.event.name}.`)}
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f6f6;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="width:100%;max-width:560px;background:#ffffff;border-radius:24px;overflow:hidden;border:1px solid #ececec;">
          ${hero}
          <tr>
            <td style="padding:28px 32px 8px;font-family:${fontStack};">
              ${brandMark}
              <h1 style="margin:0;font-size:28px;line-height:1.25;color:#000000;font-weight:700;font-family:${fontStack};">${escapeHtml(input.event.name)}</h1>
            </td>
          </tr>
          ${summaryHtml}
          <tr>
            <td style="padding:8px 32px 0;font-family:${fontStack};">
              <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#000000;font-weight:600;">${escapeHtml(greetingLine)}</p>
              ${bodyToHtml(input.draft.body)}
            </td>
          </tr>
          <tr>
            <td style="padding:8px 32px 28px;font-family:${fontStack};">
              <a href="${escapeHtml(inviteUrl)}" style="display:inline-block;margin:0 8px 8px 0;padding:12px 22px;border-radius:999px;background:#000000;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;font-family:${fontStack};"><span style="color:#ff60aa;font-weight:700;">+</span>&nbsp;${escapeHtml(input.draft.ctaLabel)}</a>
              ${calendarButton}
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 28px;border-top:1px solid #f0f0f0;font-family:${fontStack};">
              <p style="margin:20px 0 0;font-size:13px;line-height:1.5;color:#8e8e93;">
                Sent by ${escapeHtml(input.draft.senderName)}.
                Replies go to ${escapeHtml(input.draft.replyTo)}.
              </p>
              <p style="margin:12px 0 0;font-size:12px;line-height:1.5;color:#8e8e93;">
                <a href="${escapeHtml(marketingUrl)}" style="color:#000000;font-weight:600;text-decoration:none;">Gather</a>
                - Every guest is your +1.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = [
    greetingLine,
    "",
    input.draft.body,
    "",
    `${input.draft.ctaLabel}: ${inviteUrl}`,
    calendarUrl ? `Add to calendar: ${calendarUrl}` : "",
    "",
    `Sent by ${input.draft.senderName}.`,
    `Replies go to ${input.draft.replyTo}.`,
    "",
    `Gather - Every guest is your +1: ${marketingUrl}`,
  ]
    .filter((line) => line !== "")
    .join("\n");

  return {
    subject,
    html,
    text,
    inviteUrl,
    previewGuestName: guestName,
  };
}
