import type { Invitation } from "@/lib/data/types";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function invitationSlug(title: string): string {
  return (
    title
      .trim()
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 72) || "untitled-invitation"
  );
}

export function isInvitationUuid(value: string): boolean {
  try {
    return UUID_PATTERN.test(decodeURIComponent(value));
  } catch {
    return false;
  }
}

/** Extract a UUID from legacy bare-UUID or `title--uuid` route keys. */
export function invitationIdFromLegacyRouteKey(routeKey: string): string | null {
  try {
    const decoded = decodeURIComponent(routeKey);
    if (UUID_PATTERN.test(decoded)) return decoded;
    return decoded.match(
      /(?:^|--)([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$/i,
    )?.[1] ?? null;
  } catch {
    return null;
  }
}

export function invitationEditPath(
  invitation: Pick<Invitation, "slug">,
): string {
  return `/invitations/${invitation.slug}/edit`;
}

export function invitationViewPath(
  invitation: Pick<Invitation, "slug">,
): string {
  return `/invitations/${invitation.slug}`;
}
