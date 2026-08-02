import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const UPLOAD_BUCKET = "invitation-uploads";
const MAX_FILE_SIZE = 25 * 1024 * 1024;
const ALLOWED_TYPE_PREFIXES = ["image/", "video/", "audio/"];

function safeFileName(name: string): string {
  const normalized = name
    .normalize("NFKD")
    .replace(/[^\w.\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return normalized || "upload";
}

async function ensureUploadBucket() {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase.storage.getBucket(UPLOAD_BUCKET);
  if (data) return;

  const { error } = await supabase.storage.createBucket(UPLOAD_BUCKET, {
    public: true,
    fileSizeLimit: MAX_FILE_SIZE,
    allowedMimeTypes: ["image/*", "video/*", "audio/*"],
  });

  if (error && !error.message.toLowerCase().includes("already exists")) {
    throw error;
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "You must be signed in." }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Choose a file to upload." }, { status: 400 });
    }
    if (
      !file.type ||
      !ALLOWED_TYPE_PREFIXES.some((prefix) => file.type.startsWith(prefix))
    ) {
      return NextResponse.json(
        { error: "Only image, video, and audio files are supported." },
        { status: 415 },
      );
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Files must be 25 MB or smaller." },
        { status: 413 },
      );
    }

    await ensureUploadBucket();

    const supabase = getSupabaseAdmin();
    const path = `${session.user.id}/${crypto.randomUUID()}-${safeFileName(file.name)}`;
    const body = Buffer.from(await file.arrayBuffer());
    const { error } = await supabase.storage
      .from(UPLOAD_BUCKET)
      .upload(path, body, {
        contentType: file.type,
        cacheControl: "31536000",
        upsert: false,
      });

    if (error) throw error;

    const { data } = supabase.storage.from(UPLOAD_BUCKET).getPublicUrl(path);
    return NextResponse.json({
      upload: {
        id: `up_${crypto.randomUUID()}`,
        name: file.name,
        url: data.publicUrl,
        path,
        kind: file.type.startsWith("video/")
          ? "video"
          : file.type.startsWith("audio/")
            ? "audio"
            : "image",
        createdAt: Date.now(),
      },
    });
  } catch (error) {
    console.error("Upload failed", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "The upload could not be saved.",
      },
      { status: 500 },
    );
  }
}
