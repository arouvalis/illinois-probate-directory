"use client";

import { useState, useEffect } from "react";

interface Props {
  website: string | null;
  name: string | null;
}

function NamePlaceholder({ name }: { name: string | null }) {
  const text = name ?? "Attorney";
  const len = text.length;
  const fontSize =
    len <= 18 ? "1.5rem" :
    len <= 30 ? "1.2rem" :
    len <= 42 ? "1rem" :
    "0.8rem";

  return (
    <div className="h-48 bg-navy-800 flex items-center justify-center p-6">
      <p
        className="text-white font-serif font-bold text-center leading-snug"
        style={{ fontSize, wordBreak: "break-word" }}
      >
        {text}
      </p>
    </div>
  );
}

type State =
  | { phase: "loading" }
  | { phase: "image"; url: string }
  | { phase: "placeholder" };

export default function AttorneyPhoto({ website, name }: Props) {
  const [state, setState] = useState<State>(
    website ? { phase: "loading" } : { phase: "placeholder" }
  );

  useEffect(() => {
    if (!website) {
      setState({ phase: "placeholder" });
      return;
    }

    setState({ phase: "loading" });

    fetch(`/api/og-image?website=${encodeURIComponent(website)}`)
      .then((r) => r.json())
      .then((data: { url: string | null }) => {
        if (data.url) {
          setState({ phase: "image", url: data.url });
        } else {
          setState({ phase: "placeholder" });
        }
      })
      .catch(() => setState({ phase: "placeholder" }));
  }, [website]);

  if (state.phase === "placeholder") {
    return <NamePlaceholder name={name} />;
  }

  if (state.phase === "loading") {
    return (
      <div className="h-48 bg-navy-800 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-navy-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // phase === "image"
  return (
    <div className="h-48 bg-navy-50 flex items-center justify-center p-8 border-b border-gray-100">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={state.url}
        alt={`${name ?? "Attorney"} firm image`}
        onError={() => setState({ phase: "placeholder" })}
        className="max-h-28 max-w-full object-contain"
      />
    </div>
  );
}
