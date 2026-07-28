import SystemMap from "../../components/SystemMap";
import "./system.css";
import {
  SITE,
  KEYWORDS,
  breadcrumb,
  techArticle,
  graph,
} from "../../lib/seo";

const TITLE = "Touchstone — how robot force data is measured and certified";
const DESC =
  "Touchstone measures contact force at the source and certifies it. Six measurement streams gather on a held object, the measured forces become one record with its own provenance, and that record is recompiled onto any robot hand — with an honest verdict when the grasp cannot be reproduced.";

export const metadata = {
  title: TITLE,
  description: DESC,
  keywords: KEYWORDS.schematic,
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
      "One sheet: the world measures the object, the record is certified, and the force is recompiled per robot body.",
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
              keywords: KEYWORDS.schematic,
            }),
            breadcrumb([
              { name: "Physcript", path: "/" },
              { name: "Touchstone", path: "/touchstone" },
            ]),
          ]),
        }}
      />
      <SystemMap />
    </>
  );
}
