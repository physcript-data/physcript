import Atlas from "../../components/Atlas";
import "./atlas.css";
import {
  SITE,
  KEYWORDS,
  breadcrumb,
  techArticle,
  graph,
} from "../../lib/seo";

const TITLE = "Touchstone — the whole system on one sheet";
const DESC =
  "The Touchstone atlas: two gaps in robot manipulation data that share one answer, the five sensing blocks and the calibration standard that capture it, the Record — five fields including a stated uncertainty on every force — and the five pre-registered experiments that could end each part of it.";

export const metadata = {
  title: TITLE,
  description: DESC,
  keywords: KEYWORDS.atlas,
  alternates: { canonical: "/touchstone" },
  openGraph: {
    title: `${TITLE} | Physcript`,
    description: DESC,
    url: "/touchstone",
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
      "One sheet: capture, the Record, the compiler, and the five experiments that could kill each part of it.",
  },
};

export default function TouchstonePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: graph([
            techArticle({
              path: "/touchstone",
              headline: TITLE,
              description: DESC,
              keywords: KEYWORDS.atlas,
            }),
            breadcrumb([
              { name: "Physcript", path: "/" },
              { name: "Touchstone", path: "/touchstone" },
            ]),
          ]),
        }}
      />
      <Atlas />
    </>
  );
}
