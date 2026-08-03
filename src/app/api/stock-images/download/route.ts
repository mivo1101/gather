import { NextResponse } from "next/server";
import { auth } from "@/auth";

export const runtime = "nodejs";

function isUnsplashDownloadLocation(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname === "api.unsplash.com" &&
      /^\/photos\/[^/]+\/download$/.test(url.pathname)
    );
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "You must be signed in." }, { status: 401 });
  }

  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    return NextResponse.json(
      { error: "Unsplash is not configured." },
      { status: 503 },
    );
  }

  const body = (await request.json().catch(() => null)) as
    | { downloadLocation?: string }
    | null;
  const downloadLocation = body?.downloadLocation?.trim() || "";
  if (!isUnsplashDownloadLocation(downloadLocation)) {
    return NextResponse.json(
      { error: "Invalid Unsplash download location." },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(downloadLocation, {
      headers: {
        Authorization: `Client-ID ${accessKey}`,
        "Accept-Version": "v1",
      },
      cache: "no-store",
    });
    if (!response.ok) {
      return NextResponse.json(
        { error: "Could not register this Unsplash selection." },
        { status: response.status },
      );
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not register this Unsplash selection.",
      },
      { status: 502 },
    );
  }
}
