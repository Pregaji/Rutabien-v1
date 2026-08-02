import type { Metadata } from "next";
import { Spectral, Figtree } from "next/font/google";
import "./globals.css";
import { Analytics } from "@/components/Analytics";

// design-reference/*.dc.html (ground truth per CLAUDE.md) loads exactly
// these two families - Spectral for headlines, Figtree for body/UI. This
// had drifted to Fraunces/Work Sans, the same class of bug as the
// off-spec teal color fixed earlier.
const spectral = Spectral({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const figtree = Figtree({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Falls back to the current Vercel URL - update once a custom domain
// (rutabien.com per CLAUDE.md) is live and DNS-verified.
const SITE_URL = process.env.APP_URL ?? "https://rutabien.vercel.app";
const SITE_DESCRIPTION =
  "Rutabien turns Spain's visa and paperwork maze into a clear, personal roadmap - built for international students moving to Barcelona.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Rutabien - Every step, mapped.",
    template: "%s - Rutabien",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "Spain student visa",
    "Barcelona student visa",
    "study in Barcelona",
    "Spain visa requirements",
    "international student Spain",
    "NIE Barcelona",
    "sworn translation Spain",
  ],
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Rutabien",
    title: "Rutabien - Every step, mapped.",
    description: SITE_DESCRIPTION,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rutabien - Every step, mapped.",
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

// Organization + Service, not SoftwareApplication - Rutabien's product is
// guidance/tracking backed by human-reviewed content (see CLAUDE.md "No
// AI-generated roadmap content"), not a piece of downloadable software.
const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "Rutabien",
      url: SITE_URL,
      description: SITE_DESCRIPTION,
    },
    {
      "@type": "Service",
      name: "Rutabien roadmap",
      provider: { "@type": "Organization", name: "Rutabien" },
      areaServed: { "@type": "City", name: "Barcelona" },
      audience: {
        "@type": "Audience",
        audienceType: "International students moving to Barcelona, Spain",
      },
      description: SITE_DESCRIPTION,
      offers: [
        { "@type": "Offer", name: "Essential", priceCurrency: "EUR" },
        { "@type": "Offer", name: "Complete", priceCurrency: "EUR" },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spectral.variable} ${figtree.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }}
        />
        <Analytics />
        {children}
      </body>
    </html>
  );
}
