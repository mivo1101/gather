import { getSupabaseAdmin } from "@/lib/supabase/admin";

export interface UpsertUserInput {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
}

/** Create or update the app user row when someone signs in with Google. */
export async function upsertUser(input: UpsertUserInput): Promise<void> {
  const supabase = getSupabaseAdmin();

  const { error } = await supabase.from("users").upsert(
    {
      id: input.id,
      email: input.email,
      name: input.name ?? null,
      image: input.image ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );

  if (error) {
    throw new Error(`Failed to upsert user: ${error.message}`);
  }
}
