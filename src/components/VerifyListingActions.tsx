"use client";

import { useState } from "react";

import { trackEvent } from "@/lib/analytics";

const button =
  "bg-navy-700 text-white py-3 px-6 rounded-lg font-semibold hover:bg-navy-800 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed";

async function post(url: string, body: Record<string, string>) {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Something went wrong.");
  return data;
}

/** The attorney's "yes, this is my email" button. A button, not just a link, so
 *  that email security scanners that open links cannot confirm by accident. */
export function ConfirmEmailButton({ id, sig, email }: { id: string; sig: string; email: string }) {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState("");

  const confirm = async () => {
    setState("loading");
    setError("");
    try {
      const data = await post("/api/verify-listing/confirm", { id, sig });
      if (!data.already) trackEvent("verify_listing_confirmed", { src: data.src, listing: data.slug });
      setState("done");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setState("idle");
    }
  };

  if (state === "done") {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6" role="status">
        <p className="font-semibold text-green-800 mb-1">Email confirmed</p>
        <p className="text-green-700 text-sm leading-relaxed">
          Thank you. Your request has gone to the person who runs the directory for review. Once it is
          approved we&apos;ll email {email}, and inquiries from your listing will be sent to that address.
          Your email is never shown on the site.
        </p>
      </div>
    );
  }
  return (
    <div>
      <button type="button" onClick={confirm} disabled={state === "loading"} className={button}>
        {state === "loading" ? "Confirming…" : "Confirm this email address"}
      </button>
      {error && <p className="text-red-600 text-sm mt-3" role="alert">{error}</p>}
    </div>
  );
}

const REVIEW = {
  approve: { label: "Approve", done: "Approved. Leads for this listing now go to the attorney's email, with you copied. The attorney has been emailed to say so." },
  reject: { label: "Reject", done: "Rejected. Nothing was changed. The attorney was not notified; reply to the approval email if you want to tell them why." },
  revoke: { label: "Stop sending leads to this address", done: "Switched off. Leads for this listing come to you again (CALL THIS ATTORNEY). The attorney was not notified." },
} as const;

/** The site owner's approve / reject / switch-off button. */
export function ReviewButton({ id, sig, action }: { id: string; sig: string; action: keyof typeof REVIEW }) {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const run = async () => {
    setState("loading");
    setError("");
    try {
      const data = await post("/api/verify-listing/review", { id, sig, action });
      setNote(action === "approve" && data.attorneyNotified === false ? " Note: the email telling the attorney could not be sent, so let them know yourself." : "");
      setState("done");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setState("idle");
    }
  };

  if (state === "done") {
    return (
      <p className="bg-green-50 border border-green-200 rounded-xl p-5 text-sm text-green-800" role="status">
        {action === "approve" && note ? REVIEW.approve.done.replace(" The attorney has been emailed to say so.", "") : REVIEW[action].done}
        {note}
      </p>
    );
  }
  return (
    <div>
      <button type="button" onClick={run} disabled={state === "loading"} className={action === "approve" ? button : `${button} !bg-gray-700 hover:!bg-gray-800`}>
        {state === "loading" ? "Working…" : REVIEW[action].label}
      </button>
      {error && <p className="text-red-600 text-sm mt-3" role="alert">{error}</p>}
    </div>
  );
}
