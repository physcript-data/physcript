import { Instrument_Serif, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import {
  SITE,
  KEYWORDS,
  organizationSchema,
  websiteSchema,
  graph,
} from "../lib/seo";

const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Physcript — force data for robot manipulation",
    template: "%s | Physcript",
  },
  description:
    "Physcript measures what video cannot: contact force. Certified, force-labelled manipulation data captured from natural human demonstrations and compiled onto any robot body. The force layer for physical AI.",
  applicationName: SITE.name,
  authors: [{ name: SITE.name, url: SITE.url }],
  creator: SITE.name,
  publisher: SITE.name,
  category: "technology",
  keywords: KEYWORDS.home,
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: "Physcript — force data for robot manipulation",
    description:
      "Robots learned to see from a billion photographs. Nothing ever recorded how hard a hand pressed. Physcript builds the force layer for physical AI.",
    url: "/",
    siteName: SITE.name,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Physcript — force data for robot manipulation",
    description:
      "Robots learned to see from a billion photographs. Nothing ever recorded how hard a hand pressed.",
  },
  formatDetection: { telephone: false, address: false, email: false },
};

export const viewport = {
  colorScheme: "light",
  themeColor: "#f1efe9",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${serif.variable} ${mono.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: graph([organizationSchema(), websiteSchema()]),
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
