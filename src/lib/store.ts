// Small key-value store for things that must change on the live site without a
// redeploy: verified attorney emails and the "verify your listing" requests.
//
// On Vercel the site's files are read-only, so data/attorney-records.json can
// only change with a new deployment. This talks to an Upstash Redis database
// (Vercel dashboard -> Storage -> Upstash for Redis) over its REST API, using
// the environment variables Vercel adds when the database is connected.
//
// Server-side only. Never import from a "use client" component.

type Command = Array<string | number>;

function config(): { url: string; token: string } | null {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url: url.replace(/\/+$/, ""), token } : null;
}

// Local development only: with no database configured, keep values in memory
// so the flow can be clicked through with `npm run dev`.
const devFallback = process.env.NODE_ENV !== "production";
const g = globalThis as unknown as { __ipdMemoryStore?: Map<string, string> };
const memory = (g.__ipdMemoryStore ??= new Map<string, string>());

export function storeConfigured(): boolean {
  return config() !== null || devFallback;
}

// Preview deployments and the live site keep separate data, so a test approval
// on a preview can never change where real leads go.
const PREFIX = `ipd:${process.env.VERCEL_ENV || (process.env.NODE_ENV === "production" ? "production" : "development")}:`;

async function run(command: Command): Promise<unknown> {
  const cfg = config();
  if (!cfg) throw new Error("Store is not configured");
  const res = await fetch(cfg.url, {
    method: "POST",
    headers: { Authorization: `Bearer ${cfg.token}`, "Content-Type": "application/json" },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  const data = (await res.json().catch(() => null)) as { result?: unknown; error?: string } | null;
  if (!res.ok || !data || data.error) throw new Error(`Store error: ${data?.error ?? res.status}`);
  return data.result;
}

export async function storeGet<T>(key: string): Promise<T | null> {
  const raw = config() ? ((await run(["GET", PREFIX + key])) as string | null) : devFallback ? memory.get(PREFIX + key) ?? null : null;
  if (typeof raw !== "string") return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/** ttlSeconds: the value deletes itself after this long. Omit to keep it. */
export async function storeSet(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
  const raw = JSON.stringify(value);
  if (config()) {
    await run(ttlSeconds ? ["SET", PREFIX + key, raw, "EX", ttlSeconds] : ["SET", PREFIX + key, raw]);
  } else if (devFallback) {
    memory.set(PREFIX + key, raw);
  } else {
    throw new Error("Store is not configured");
  }
}

export async function storeDelete(key: string): Promise<void> {
  if (config()) await run(["DEL", PREFIX + key]);
  else memory.delete(PREFIX + key);
}

/** Adds one to a counter that resets after ttlSeconds, and returns the new count. */
export async function storeCount(key: string, ttlSeconds: number): Promise<number> {
  if (!config()) {
    const n = Number(memory.get(PREFIX + key) ?? 0) + 1;
    memory.set(PREFIX + key, String(n));
    return n;
  }
  const n = Number(await run(["INCR", PREFIX + key]));
  if (n === 1) await run(["EXPIRE", PREFIX + key, ttlSeconds]);
  return n;
}
