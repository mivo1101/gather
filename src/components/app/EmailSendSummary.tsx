import { Button } from "@/components/ui/Button";
import type { EmailDelivery } from "@/lib/data/email-campaigns";
import type { EventGuest } from "@/lib/data/guests";
import {
  guestDisplayLabel,
  invitationContinuePath,
} from "@/lib/invitation-paths";
import type { Invitation } from "@/lib/data/types";

interface EmailSendSummaryProps {
  invitation: Invitation;
  eventSlug: string;
  guests: EventGuest[];
  deliveries: EmailDelivery[];
  campaignSubject: string | null;
  missingEmailTable?: boolean;
}

export function EmailSendSummary({
  invitation,
  guests,
  deliveries,
  campaignSubject,
  missingEmailTable = false,
}: EmailSendSummaryProps) {
  const sentCount = deliveries.filter((d) => d.status === "sent").length;
  const failedCount = deliveries.filter(
    (d) => d.status === "failed" || d.status === "bounced",
  ).length;
  const emailHref = `${invitationContinuePath(invitation)}?step=email`;

  return (
    <section className="rounded-[28px] border border-black/[0.07] bg-white p-5 shadow-[0_2px_4px_rgba(0,0,0,0.03)] sm:p-7">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-black">Email and Send</h2>
          <p className="mt-1 text-sm text-grey">
            Compose the invite email, add a photo, preview and send from
            Continue setup.
          </p>
        </div>
        <Button href={emailHref} size="sm">
          {campaignSubject || guests.length > 0 ? "Edit email" : "Compose email"}
        </Button>
      </div>

      {missingEmailTable ? (
        <p className="rounded-2xl bg-soft-grey px-4 py-3 text-sm text-black/75">
          Run{" "}
          <code className="rounded bg-white px-1.5 py-0.5 text-xs">
            supabase/migrations/006_event_email_campaigns.sql
          </code>{" "}
          in Supabase, then refresh.
        </p>
      ) : guests.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-black/10 bg-soft-grey/50 px-4 py-8 text-center text-sm text-grey">
          Add guests first, then continue to compose and send.
        </p>
      ) : (
        <div className="space-y-4">
          <div className="rounded-2xl border border-black/[0.06] bg-soft-grey/40 px-4 py-3 text-sm">
            <p className="font-medium text-black">
              {campaignSubject || "Draft not saved yet"}
            </p>
            <p className="mt-1 text-grey">
              {sentCount > 0
                ? `${sentCount} sent${failedCount > 0 ? ` · ${failedCount} failed` : ""}`
                : `${guests.length} recipient${guests.length === 1 ? "" : "s"} ready to email`}
            </p>
          </div>

          <ul className="divide-y divide-black/[0.06] rounded-2xl border border-black/[0.06]">
            {guests.slice(0, 5).map((guest) => {
              const delivery = deliveries.find((d) => d.guestId === guest.id);
              const status = delivery?.status ?? "not sent";
              return (
                <li
                  key={guest.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-black">
                      {guestDisplayLabel(guest)}
                    </p>
                    <p className="mt-0.5 truncate text-grey">{guest.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${
                        status === "sent"
                          ? "bg-signature/15 text-black"
                          : status === "failed" || status === "bounced"
                            ? "bg-[#fff1f1] text-[#9a2a2a]"
                            : "bg-soft-grey text-grey"
                      }`}
                    >
                      {status}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
          {guests.length > 5 ? (
            <p className="text-xs text-grey">
              +{guests.length - 5} more in Continue setup
            </p>
          ) : null}
        </div>
      )}
    </section>
  );
}
