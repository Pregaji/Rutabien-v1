import type { MetadataRoute } from "next";

const SITE_URL = process.env.APP_URL ?? "https://rutabien.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Authenticated app screens, the admin panel, and API routes have no
      // reason to be crawled - matches the protected-path list in proxy.ts
      // plus /admin and /api, which proxy.ts doesn't cover (auth is
      // enforced separately for those, see lib/adminAuth.ts).
      disallow: [
        "/dashboard",
        "/roadmap",
        "/documents",
        "/bienvenido",
        "/lawyer",
        "/live-support",
        "/eu-route",
        "/before-apply",
        "/translation/orders",
        "/admin",
        "/api",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
