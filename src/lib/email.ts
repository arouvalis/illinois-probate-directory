const TO_EMAIL = "arouvalis@gmail.com";
const FROM_EMAIL = "Illinois Probate Directory <noreply@illinoisprobatedirectory.com>";

export async function sendEmail({
  subject,
  text,
  replyTo,
}: {
  subject: string;
  text: string;
  replyTo?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;

  if (!RESEND_API_KEY) {
    console.log(`=== EMAIL (no RESEND_API_KEY) ===`);
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
      to: [TO_EMAIL],
      ...(replyTo ? { reply_to: replyTo } : {}),
      subject,
      text,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Resend error:", err);
    return { ok: false, error: "Failed to send email." };
  }

  return { ok: true };
}

export function ctTimestamp() {
  return new Date().toLocaleString("en-US", { timeZone: "America/Chicago" }) + " CT";
}
