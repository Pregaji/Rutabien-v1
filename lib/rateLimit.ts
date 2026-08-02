import { NextRequest } from "next/server";

// Fixed-window rate limiting, in-memory. This is a real mitigation against
// naive scripted abuse (the magic-link request and step-up code endpoints
// had no limiting at all before this), but it is per-instance: on Vercel's
// serverless Node runtime each warm instance has its own Map, so a
// determined attacker distributing requests across many cold starts can
// still exceed the limit. For a durable, cross-instance limit, replace this
// with a shared store (e.g. Upstash Redis) - noted here rather than done
// silently since it's an infra dependency this repo doesn't have yet.
const buckets = new Map<string, { count: number; resetAt: number }>();

// Prevent unbounded growth across many distinct IPs/keys over the life of
// a warm instance.
const MAX_TRACKED_KEYS = 5000;

export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

export function rateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number }
): { ok: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    if (buckets.size >= MAX_TRACKED_KEYS) buckets.clear();
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }

  if (existing.count >= limit) {
    return { ok: false, retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000) };
  }

  existing.count += 1;
  return { ok: true };
}
