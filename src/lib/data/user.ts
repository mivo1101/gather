import { redirect } from "next/navigation";
import { auth } from "@/auth";
import type { User } from "./types";
import { getStoredUserProfile } from "./users-db";
import { getGreeting } from "./user-utils";

export { getGreeting };

function splitName(fullName?: string | null): {
  firstName: string;
  lastName: string;
} {
  const parts = (fullName ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return { firstName: "there", lastName: "" };
  }
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: "" };
  }
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

/**
 * Returns the signed-in user from the Auth.js session.
 * Redirects to /signin when there is no active session.
 */
export async function getCurrentUser(): Promise<User> {
  const session = await auth();

  if (!session?.user) {
    redirect("/signin");
  }

  const userId = session.user.id || session.user.email || "unknown";
  const storedProfile = await getStoredUserProfile(userId);
  const { firstName, lastName } = splitName(
    storedProfile?.name || session.user.name,
  );

  return {
    id: userId,
    firstName,
    lastName,
    email: session.user.email ?? "",
    avatarUrl: storedProfile?.image || session.user.image || null,
  };
}
