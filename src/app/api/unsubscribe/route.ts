// Unsubscribe from campaign emails.
//
//   POST {"t": token}        the button on /unsubscribe
//   POST ?t=token            the "Unsubscribe" button mail programs show
//                            (List-Unsubscribe one-click, RFC 8058)
//   GET  ?t=token            answers only "is this a link we sent, yes or no".
//                            The sender script asks this before a real send, so
//                            a batch never goes out with links that do not work.
//
// Opening a link (GET) never unsubscribes anyone: mail security scanners open
// every link in an email.
import { NextResponse } from "next/server";
import { lookupUnsubscribeToken, recordUnsubscribe } from "@/lib/unsubscribe";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const found = await lookupUnsubscribeToken(new URL(req.url).searchParams.get("t"));
    return NextResponse.json({ valid: found !== null });
  } catch (err) {
    console.error("Unsubscribe check error:", err);
    return NextResponse.json({ valid: false, error: "The database could not be reached." }, { status: 503 });
  }
}

export async function POST(req: Request) {
  try {
    const fromQuery = new URL(req.url).searchParams.get("t");
    let token: unknown = fromQuery;
    if (!fromQuery) {
      const body = await req.json().catch(() => ({}));
      token = (body as { t?: unknown }).t;
    }
    const found = await lookupUnsubscribeToken(token);
    if (!found) return NextResponse.json({ error: "This link is not valid." }, { status: 404 });
    await recordUnsubscribe(found, fromQuery ? "one-click" : "page");
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Unsubscribe API error:", err);
    return NextResponse.json({ error: "Something went wrong on our side. Please try again in a minute." }, { status: 500 });
  }
}
