"use client";

import { useState } from "react";

/** A button, not just a link, so that email security scanners that open links
 *  cannot unsubscribe someone by accident. */
export function UnsubscribeButton({ token, email }: { token: string; email: string }) {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState("");

  const unsubscribe = async () => {
    setState("loading");
    setError("");
    try {
      const res = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ t: token }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setState("done");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setState("idle");
    }
  };

  if (state === "done") {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6" role="status">
        <p className="font-semibold text-green-800 mb-1">You&apos;re unsubscribed</p>
        <p className="text-green-700 text-sm leading-relaxed">
          We won&apos;t send any more emails like this to {email}. Your listing is not affected.
        </p>
      </div>
    );
  }
  return (
    <div>
      <button
        type="button"
        onClick={unsubscribe}
        disabled={state === "loading"}
        className="bg-navy-700 text-white py-3 px-6 rounded-lg font-semibold hover:bg-navy-800 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {state === "loading" ? "Unsubscribing…" : "Unsubscribe"}
      </button>
      {error && <p className="text-red-600 text-sm mt-3" role="alert">{error}</p>}
    </div>
  );
}
