import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const website = req.nextUrl.searchParams.get("website");
  if (!website) return NextResponse.json({ url: null });

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(website, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; IllinoisProbateDirectory/1.0; +https://illinoisprobatedirectory.com)",
        Accept: "text/html",
      },
      redirect: "follow",
    });
    clearTimeout(timeout);

    if (!res.ok) return NextResponse.json({ url: null });

    const html = await res.text();

    // Match og:image in either attribute order
    const match =
      html.match(
        /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i
      ) ||
      html.match(
        /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i
      );

    if (match && match[1]) {
      const raw = match[1].trim();
      // Resolve relative URLs against the fetched URL
      const base = res.url || website;
      const resolved = raw.startsWith("http") ? raw : new URL(raw, base).href;
      return NextResponse.json(
        { url: resolved },
        { headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600" } }
      );
    }
  } catch {
    // timeout, DNS failure, etc.
  }

  return NextResponse.json(
    { url: null },
    { headers: { "Cache-Control": "public, max-age=3600" } }
  );
}
