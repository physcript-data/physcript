import { Instrument_Serif, JetBrains_Mono } from "next/font/google";
import "./globals.css";

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
  metadataBase: new URL("https://physcri.pt"),
  title: "Physcript | Force data for physical AI",
  description:
    "The force layer for physical AI. Certified force data for robot manipulation. Try to hold the egg.",
  applicationName: "Physcript",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Physcript | Force data for physical AI",
    description:
      "Robots crush this every day. The force layer for physical AI.",
    url: "/",
    siteName: "Physcript",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Physcript | Force data for physical AI",
    description:
      "Robots crush this every day. The force layer for physical AI.",
  },
};

export const viewport = {
  colorScheme: "light",
  themeColor: "#f1efe9",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${serif.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
