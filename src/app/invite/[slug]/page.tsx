import type { Metadata } from "next";
import Link from "next/link";
import { GuestInviteViewer } from "@/components/invitation/GuestInviteViewer";
import { getPersonalisedInvite } from "@/lib/data/personalised-invites";
import { getRsvpResponseForGuest } from "@/lib/data/rsvp-responses";
import { Logo } from "@/components/ui/Logo";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ t?: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { t } = await searchParams;
  if (!t) return { title: "Invitation · Gather" };

  try {
    const invite = await getPersonalisedInvite(slug, t);
    if (!invite) return { title: "Invitation · Gather" };
    return {
      title: `${invite.event.name} · Gather`,
      description: `You're invited to ${invite.event.name}.`,
    };
  } catch {
    return { title: "Invitation · Gather" };
  }
}

export default async function GuestInvitePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ t?: string }>;
}) {
  const { slug } = await params;
  const { t: token } = await searchParams;

  if (!token?.trim()) {
    return (
      <InviteError
        title="Personal link needed"
        message="Open the invitation from your email link so we can show your personalised card."
      />
    );
  }

  let invite;
  try {
    invite = await getPersonalisedInvite(slug, token);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("event_guests") || message.includes("Missing")) {
      return (
        <InviteError
          title="Invite not ready"
          message="This invitation is still being set up. Please try again shortly."
        />
      );
    }
    throw error;
  }

  if (!invite) {
    return (
      <InviteError
        title="Invitation not found"
        message="This link may be incorrect or no longer valid. Ask your host for a new invite."
      />
    );
  }

  let rsvpResponse = null;
  try {
    rsvpResponse = await getRsvpResponseForGuest(invite.guest.id);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (!message.includes("Missing RSVP table")) {
      throw error;
    }
  }

  return (
    <GuestInviteViewer
      invitation={invite.invitation}
      eventName={invite.event.name}
      eventSlug={invite.event.slug}
      eventDate={invite.event.eventDate}
      timezone={invite.event.timezone}
      venue={invite.event.venue}
      address={invite.event.address}
      guest={invite.guest}
      rsvpResponse={rsvpResponse}
    />
  );
}

function InviteError({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-br from-signature/[0.12] via-sugar-milk/80 to-soft-grey px-4">
      <Logo href="/" className="mb-8" />
      <div className="w-full max-w-md rounded-[28px] border border-black/[0.07] bg-white p-8 text-center shadow-[0_18px_50px_rgba(0,0,0,0.08)]">
        <h1 className="text-2xl font-bold tracking-tight text-black">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-grey">{message}</p>
        <Link
          href="/"
          className="mt-7 inline-flex rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-black/90"
        >
          Back to Gather
        </Link>
      </div>
    </div>
  );
}
