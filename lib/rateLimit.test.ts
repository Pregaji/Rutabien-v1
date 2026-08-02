import { describe, expect, it } from "vitest";
import { rateLimit } from "./rateLimit";

describe("rateLimit", () => {
  it("allows requests up to the limit, then blocks", () => {
    const key = `test-${Math.random()}`;
    for (let i = 0; i < 5; i++) {
      expect(rateLimit(key, { limit: 5, windowMs: 60_000 }).ok).toBe(true);
    }
    const sixth = rateLimit(key, { limit: 5, windowMs: 60_000 });
    expect(sixth.ok).toBe(false);
    expect(sixth.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("tracks distinct keys independently", () => {
    const keyA = `a-${Math.random()}`;
    const keyB = `b-${Math.random()}`;
    for (let i = 0; i < 3; i++) rateLimit(keyA, { limit: 3, windowMs: 60_000 });
    expect(rateLimit(keyA, { limit: 3, windowMs: 60_000 }).ok).toBe(false);
    expect(rateLimit(keyB, { limit: 3, windowMs: 60_000 }).ok).toBe(true);
  });

  it("resets after the window elapses", async () => {
    const key = `reset-${Math.random()}`;
    expect(rateLimit(key, { limit: 1, windowMs: 20 }).ok).toBe(true);
    expect(rateLimit(key, { limit: 1, windowMs: 20 }).ok).toBe(false);
    await new Promise((r) => setTimeout(r, 30));
    expect(rateLimit(key, { limit: 1, windowMs: 20 }).ok).toBe(true);
  });
});
