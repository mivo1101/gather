import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import type {
  StockImage,
  StockImageOrientation,
  StockImagePage,
} from "@/lib/data/stock-images";

export const runtime = "nodejs";

type UnsplashPhoto = {
  id: string;
  width: number;
  height: number;
  color: string | null;
  description: string | null;
  alt_description: string | null;
  urls: {
    small: string;
    regular: string;
  };
  links: {
    html: string;
    download_location: string;
  };
  user: {
    name: string;
    links: {
      html: string;
    };
  };
};

type UnsplashSearchResponse = {
  total: number;
  total_pages: number;
  results: UnsplashPhoto[];
};

function toStockImage(photo: UnsplashPhoto): StockImage {
  return {
    id: photo.id,
    width: photo.width,
    height: photo.height,
    color: photo.color,
    description:
      photo.alt_description || photo.description || "Unsplash photograph",
    thumbnailUrl: photo.urls.small,
    imageUrl: photo.urls.regular,
    photoUrl: photo.links.html,
    downloadLocation: photo.links.download_location,
    photographer: {
      name: photo.user.name,
      profileUrl: photo.user.links.html,
    },
  };
}

export async function GET(request: NextRequest) {
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

  const query = request.nextUrl.searchParams.get("query")?.trim() || "celebration";
  const page = Math.max(
    1,
    Number.parseInt(request.nextUrl.searchParams.get("page") || "1", 10) || 1,
  );
  const requestedOrientation =
    request.nextUrl.searchParams.get("orientation") || "all";
  const orientation: StockImageOrientation =
    requestedOrientation === "landscape" ||
    requestedOrientation === "portrait" ||
    requestedOrientation === "squarish"
      ? requestedOrientation
      : "all";

  const url = new URL("https://api.unsplash.com/search/photos");
  url.searchParams.set("query", query);
  url.searchParams.set("page", String(page));
  url.searchParams.set("per_page", "18");
  url.searchParams.set("content_filter", "high");
  if (orientation !== "all") url.searchParams.set("orientation", orientation);

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Client-ID ${accessKey}`,
        "Accept-Version": "v1",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorBody = (await response.json().catch(() => null)) as
        | { errors?: string[] }
        | null;
      return NextResponse.json(
        {
          error:
            errorBody?.errors?.[0] ||
            `Unsplash search failed with status ${response.status}.`,
        },
        { status: response.status },
      );
    }

    const data = (await response.json()) as UnsplashSearchResponse;
    const result: StockImagePage = {
      photos: data.results.map(toStockImage),
      page,
      totalPages: data.total_pages,
      hasMore: page < data.total_pages,
      requestsRemaining: Number.isFinite(
        Number(response.headers.get("x-ratelimit-remaining")),
      )
        ? Number(response.headers.get("x-ratelimit-remaining"))
        : null,
    };
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unsplash is temporarily unavailable.",
      },
      { status: 502 },
    );
  }
}
