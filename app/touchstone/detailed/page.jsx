import Touchstone from "../../../components/Touchstone";
import "../touchstone.css";
import {
  SITE,
  KEYWORDS,
  breadcrumb,
  techArticle,
  graph,
} from "../../../lib/seo";

const TITLE =
  "Touchstone v0.1 — measuring contact force from human demonstrations";
const DESC =
  "The full technical sheet for Touchstone v0.1: why force is invisible in video, how contact force is measured from the world instead of the hand, how a demonstration is certified against a known standard, and how the same recorded job is compiled onto a five-digit hand, a three-finger gripper or a parallel jaw.";

export const metadata = {
  title: TITLE,
  description: DESC,
  keywords: KEYWORDS.detailed,
  alternates: { canonical: "/touchstone/detailed" },
  openGraph: {
    title: `${TITLE} | Physcript`,
    description: DESC,
    url: "/touchstone/detailed",
    siteName: SITE.name,
    locale: "en_US",
    type: "article",
    publishedTime: SITE.published,
    modifiedTime: SITE.modified,
  },
  twitter: {
    card: "summary_large_image",
    title: `${TITLE} | Physcript`,
    description:
      "Force is invisible in video. Touchstone measures it, certifies it, and makes it portable across robot bodies.",
  },
};

export default function TouchstoneDetailedPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: graph([
            techArticle({
              path: "/touchstone/detailed",
              headline: TITLE,
              description: DESC,
              keywords: KEYWORDS.detailed,
            }),
            breadcrumb([
              { name: "Physcript", path: "/" },
              { name: "Touchstone", path: "/touchstone" },
              { name: "The long sheet", path: "/touchstone/detailed" },
            ]),
          ]),
        }}
      />
      <Touchstone />
    </>
  );
}
