import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

const BASE = "https://samenterprises.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: {
    default:  "SAM Enterprises — Premium UPVC Windows & Doors Chennai",
    template: "%s — SAM Enterprises",
  },
  description:
    "Custom-fabricated UPVC windows and doors engineered for energy efficiency, acoustic comfort, and lasting elegance. Serving Chennai and South India since 2008.",
  keywords: [
    "UPVC windows Chennai", "UPVC doors Chennai", "sliding windows",
    "casement windows", "folding doors", "french doors",
    "SAM Enterprises", "window manufacturer Chennai", "South India UPVC",
  ],
  authors:  [{ name: "SAM Enterprises", url: BASE }],
  creator:  "SAM Enterprises",
  publisher:"SAM Enterprises",
  robots: {
    index:          true,
    follow:         true,
    googleBot: {
      index:              true,
      follow:             true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet":       -1,
    },
  },
  openGraph: {
    type:        "website",
    locale:      "en_IN",
    url:         BASE,
    siteName:    "SAM Enterprises",
    title:       "SAM Enterprises — Premium UPVC Windows & Doors",
    description: "Custom-fabricated UPVC windows and doors. Energy efficient, acoustically superior, and built to last.",
    images: [{ url: `${BASE}/og-image.png`, width: 1200, height: 630, alt: "SAM Enterprises" }],
  },
  twitter: {
    card:        "summary_large_image",
    title:       "SAM Enterprises — Premium UPVC Windows & Doors",
    description: "Custom-fabricated UPVC windows and doors for South India.",
    images:      [`${BASE}/og-image.png`],
  },
  alternates: { canonical: BASE },
  icons: {
    icon:    "/logo.png",
    apple:   "/logo.png",
    shortcut:"/logo.png",
  },
};

export const viewport: Viewport = {
  width:              "device-width",
  initialScale:       1,
  maximumScale:       5,
  themeColor:         "#ffffff",
};

// JSON-LD for Organization
const orgJsonLd = {
  "@context":   "https://schema.org",
  "@type":      "LocalBusiness",
  name:         "SAM Enterprises",
  url:          BASE,
  logo:         `${BASE}/logo.png`,
  image:        `${BASE}/og-image.png`,
  description:  "Premium UPVC window and door manufacturer in Chennai, South India.",
  address: {
    "@type":           "PostalAddress",
    streetAddress:     "42 Industrial Estate, Phase II",
    addressLocality:   "Chennai",
    addressRegion:     "Tamil Nadu",
    postalCode:        "600096",
    addressCountry:    "IN",
  },
  geo: {
    "@type":     "GeoCoordinates",
    latitude:    13.0827,
    longitude:   80.2707,
  },
  contactPoint: {
    "@type":       "ContactPoint",
    telephone:     "+91-98765-43210",
    contactType:   "customer service",
    areaServed:    "IN",
    availableLanguage: ["English", "Tamil"],
  },
  sameAs: [
    "https://www.facebook.com/samenterprises",
    "https://www.instagram.com/samenterprises",
    "https://www.linkedin.com/company/samenterprises",
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
