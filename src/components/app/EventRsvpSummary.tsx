import type { EventGuest } from "@/lib/data/guests";
import type { RsvpResponse } from "@/lib/data/rsvp-responses";
import { guestDisplayLabel } from "@/lib/invitation-paths";

interface EventRsvpSummaryProps {
  guests: EventGuest[];
  responses: RsvpResponse[];
  missingTable?: boolean;
}

function attendanceLabel(attendance: RsvpResponse["attendance"] | "pending") {
  switch (attendance) {
    case "yes":
      return "Attending";
    case "no":
      return "Can't make it";
    case "unknown":
      return "Responded";
    default:
      return "Awaiting";
  }
}

function attendanceClass(attendance: RsvpResponse["attendance"] | "pending") {
  switch (attendance) {
    case "yes":
      return "bg-[#e8f6ee] text-[#1f6b3f]";
    case "no":
      return "bg-[#fff1f1] text-[#9a2a2a]";
    case "unknown":
      return "bg-soft-grey text-black";
    default:
      return "bg-soft-grey text-grey";
  }
}

export function EventRsvpSummary({
  guests,
  responses,
  missingTable = false,
}: EventRsvpSummaryProps) {
  const byGuest = new Map(responses.map((r) => [r.guestId, r]));
  const yes = responses.filter((r) => r.attendance === "yes").length;
  const no = responses.filter((r) => r.attendance === "no").length;
  const pending = guests.length - responses.length;

  return (
    <section className="rounded-[28px] border border-black/[0.07] bg-white p-5 shadow-[0_2px_4px_rgba(0,0,0,0.03)] sm:p-7">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-black">RSVPs</h2>
        <p className="mt-1 text-sm text-grey">
          Responses from personalised invitation links.
        </p>
      </div>

      {missingTable ? (
        <p className="rounded-2xl bg-soft-grey px-4 py-3 text-sm text-black/75">
          Run{" "}
          <code className="rounded bg-white px-1.5 py-0.5 text-xs">
            supabase/migrations/008_event_rsvp_responses.sql
          </code>{" "}
          in Supabase, then refresh.
        </p>
      ) : guests.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-black/10 bg-soft-grey/50 px-4 py-8 text-center text-sm text-grey">
          Add guests and send invites to collect RSVPs.
        </p>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-2xl bg-[#e8f6ee] px-3 py-3">
              <p className="text-xl font-bold text-black">{yes}</p>
              <p className="mt-0.5 text-xs text-grey">Attending</p>
            </div>
            <div className="rounded-2xl bg-[#fff1f1] px-3 py-3">
              <p className="text-xl font-bold text-black">{no}</p>
              <p className="mt-0.5 text-xs text-grey">Declined</p>
            </div>
            <div className="rounded-2xl bg-soft-grey px-3 py-3">
              <p className="text-xl font-bold text-black">{Math.max(pending, 0)}</p>
              <p className="mt-0.5 text-xs text-grey">Awaiting</p>
            </div>
          </div>

          <ul className="divide-y divide-black/[0.06] rounded-2xl border border-black/[0.06]">
            {guests.map((guest) => {
              const response = byGuest.get(guest.id);
              const status = response?.attendance ?? "pending";
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
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${attendanceClass(status)}`}
                  >
                    {attendanceLabel(status)}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
