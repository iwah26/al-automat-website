import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import "./globals.css";

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  display: "swap",
  variable: "--font-heebo",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://al-automat.co.il"),
  title: "על אוטומט | אוטומציות, בוטים ו-AI לעסקים",
  description:
    "על אוטומט בונה תהליכים עסקיים חכמים — אוטומציות, בוטים, CRM ו-AI שעובדים בשבילך 24/7.",
  icons: {
    icon: "/logo-square.svg",
    shortcut: "/logo-square.svg",
    apple: "/logo-square.svg",
  },
  openGraph: {
    title: "על אוטומט | אוטומציות, בוטים ו-AI לעסקים",
    description:
      "על אוטומט בונה תהליכים עסקיים חכמים — אוטומציות, בוטים, CRM ו-AI שעובדים בשבילך 24/7.",
    locale: "he_IL",
    type: "website",
    url: "https://al-automat.co.il",
    siteName: "על אוטומט",
  },
  twitter: {
    card: "summary_large_image",
    title: "על אוטומט | אוטומציות, בוטים ו-AI לעסקים",
    description:
      "על אוטומט בונה תהליכים עסקיים חכמים — אוטומציות, בוטים, CRM ו-AI שעובדים בשבילך 24/7.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "על אוטומט",
  description:
    "בניית תהליכים עסקיים חכמים — אוטומציות, בוטים, CRM ו-AI לעסקים קטנים ובינוניים בישראל.",
  url: "https://al-automat.co.il",
  telephone: "+97226233170",
  inLanguage: "he",
  address: {
    "@type": "PostalAddress",
    addressCountry: "IL",
  },
  knowsAbout: [
    "אוטומציות עסקיות",
    "בוטים לוואטסאפ",
    "CRM",
    "תהליכי AI",
    "Claude Code",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl" className={heebo.variable}>
      <body className="font-heebo antialiased">
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
