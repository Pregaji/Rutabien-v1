import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { RUTABIEN_COLORS } from "./colors";

// Guards against the exact failure mode that already happened once
// (app/opengraph-image.tsx shipped the old #1B3A3E for a while after the
// app-wide color moved to #14181A, with nothing catching it): parses the
// real CSS variables out of globals.css and asserts they match the
// hardcoded copies in lib/colors.ts used by contexts that can't read CSS
// custom properties (email HTML, next/og images).
function readCssVar(css: string, name: string): string {
  const match = css.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`));
  if (!match) throw new Error(`--${name} not found in globals.css`);
  return match[1].toLowerCase();
}

describe("RUTABIEN_COLORS matches app/globals.css", () => {
  const css = readFileSync(join(__dirname, "../app/globals.css"), "utf-8");

  it("primary matches --rb-teal", () => {
    expect(RUTABIEN_COLORS.primary.toLowerCase()).toBe(readCssVar(css, "rb-teal"));
  });

  it("accent matches --rb-orange", () => {
    expect(RUTABIEN_COLORS.accent.toLowerCase()).toBe(readCssVar(css, "rb-orange"));
  });

  it("bg matches --rb-bg", () => {
    expect(RUTABIEN_COLORS.bg.toLowerCase()).toBe(readCssVar(css, "rb-bg"));
  });

  it("text matches --rb-text", () => {
    expect(RUTABIEN_COLORS.text.toLowerCase()).toBe(readCssVar(css, "rb-text"));
  });

  it("onDark.body matches --rb-on-teal-body", () => {
    expect(RUTABIEN_COLORS.onDark.body.toLowerCase()).toBe(readCssVar(css, "rb-on-teal-body"));
  });

  it("onDark.accent matches --rb-on-teal-accent", () => {
    expect(RUTABIEN_COLORS.onDark.accent.toLowerCase()).toBe(readCssVar(css, "rb-on-teal-accent"));
  });
});
