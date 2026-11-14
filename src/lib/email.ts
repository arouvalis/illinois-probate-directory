export const OWNER_EMAIL = "arouvalis@gmail.com";
const FROM_EMAIL = "Illinois Probate Directory <noreply@illinoisprobatedirectory.com>";

export async function sendEmail({
  to = OWNER_EMAIL,
  subject,
  text,
  replyTo,
}: {
  to?: string;
  subject: string;
  text: string;
  replyTo?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;

  if (!RESEND_API_KEY) {
    // On the live site a missing key must be an error: otherwise the visitor
    // would be told "sent" when nothing was. Locally we just log the email.
    if (process.env.NODE_ENV === "production" && process.env.ALLOW_EMAIL_LOG_ONLY !== "1") {
      console.error("RESEND_API_KEY is not set; email not sent:", subject);
      return { ok: false, error: "We couldn't send your message. Please try again or call instead." };
    }
    console.log(`=== EMAIL (no RESEND_API_KEY) ===`);
    console.log(`To: ${to}${replyTo ? `\nReply-To: ${replyTo}` : ""}`);
    console.log(`Subject: ${subject}`);
    console.log(text);
    return { ok: true };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [to],
      ...(replyTo ? { reply_to: replyTo } : {}),
      subject,
      text,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Resend error:", err);
    return { ok: false, error: "We couldn't send your message. Please try again or call instead." };
  }

  return { ok: true };
}

export function ctTimestamp() {
  return new Date().toLocaleString("en-US", { timeZone: "America/Chicago" }) + " CT";
}
