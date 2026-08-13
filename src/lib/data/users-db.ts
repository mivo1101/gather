import { getSupabaseAdmin } from "@/lib/supabase/admin";

export interface UpsertUserInput {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
}

export interface StoredUserProfile {
  name: string | null;
  image: string | null;
}

export async function getStoredUserProfile(
  userId: string,
): Promise<StoredUserProfile | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("users")
    .select("name, image")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load user profile: ${error.message}`);
  }

  return data;
}

export async function updateUserProfile(
  userId: string,
  name: string,
): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("users")
    .update({ name, updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (error) {
    throw new Error(`Failed to update user profile: ${error.message}`);
  }
}

/** Create or update the app user row when someone signs in with Google. */
export async function upsertUser(input: UpsertUserInput): Promise<void> {
  const supabase = getSupabaseAdmin();

  const { data: existing } = await supabase
    .from("users")
    .select("name")
    .eq("id", input.id)
    .maybeSingle();

  const { error } = await supabase.from("users").upsert(
    {
      id: input.id,
      email: input.email,
      name: existing?.name ?? input.name ?? null,
      image: input.image ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );

  if (error) {
    throw new Error(`Failed to upsert user: ${error.message}`);
  }
}
