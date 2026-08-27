import LongSheet from "../../../components/LongSheet";
import "../sheet.css";
import {
  SITE,
  KEYWORDS,
  breadcrumb,
  techArticle,
  graph,
} from "../../../lib/seo";

const TITLE =
  "Touchstone v3 — measuring contact force from human demonstrations";
const DESC =
  "The full technical sheet for Touchstone v3: why force is invisible in video, the five sensing categories and the handheld transfer standard that make it measurable, the Record and its five fields, the seven-layer compiler, the pre-registered validation including the predictions that failed, and the five kill gates that could still end each part of it.";

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
      "Force is invisible in video. Touchstone measures it, states how far it can be trusted, and makes it portable across robot bodies — including the parts of that claim that have failed so far.",
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
      <LongSheet />
    </>
  );
}
