import type { MetadataRoute } from "next";

const SITE_URL = process.env.APP_URL ?? "https://rutabien.vercel.app";

// Only public, unauthenticated marketing/entry pages belong here -
// everything under app/(app)/ requires a session (see proxy.ts) and has no
// business being crawled or indexed.
export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/intake", "/access", "/translation", "/sample-roadmap", "/paywall"];

  return routes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
