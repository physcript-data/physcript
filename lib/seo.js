/* ============================================================
   Shared SEO constants and structured-data builders.
   Nothing here renders visible text — it produces <head> metadata
   and JSON-LD, both invisible to a reader.
   ============================================================ */

export const SITE = {
  name: "Physcript",
  url: "https://physcri.pt",
  domain: "physcri.pt",
  email: "pranav@physcri.pt",
  tagline: "The force layer for physical AI",
  founded: "2026",
  published: "2026-07-01",
  modified: "2026-08-23",
};

/* Fill these in as profiles go live — each confirmed profile is a strong
   entity signal for the brand query "physcript". Left empty deliberately:
   publishing a URL that does not resolve is worse than publishing none. */
export const SAME_AS = [];

/* Concepts the organisation is an authority on. Google uses knowsAbout to
   place an entity in a topic graph, which is what makes a small site
   eligible for niche technical queries it has no backlinks for. */
export const KNOWS_ABOUT = [
  "Robot manipulation",
  "Contact force measurement",
  "Grip force",
  "Surface electromyography",
  "Muscle force estimation",
  "Mechanical impedance",
  "Grip stiffness",
  "Conformal prediction",
  "Transfer standard",
  "Force-torque sensing",
  "Tactile sensing",
  "Robot learning",
  "Imitation learning",
  "Learning from demonstration",
  "Cross-embodiment transfer",
  "Dexterous manipulation",
  "Grasp planning",
  "Force closure",
  "Wrench (physics)",
  "Robotics datasets",
  "Physical AI",
  "Embodied AI",
  "Vision-language-action models",
  "Metrology",
  "Calibration traceability",
  "Measurement uncertainty",
  "Data provenance",
  "Robot grippers",
  "Anthropomorphic robot hands",
];

/* Entities with stable identifiers help disambiguate what the page is about.
   Linking to Wikipedia is the conventional way to say "this exact concept". */
export const ABOUT_ENTITIES = [
  {
    "@type": "Thing",
    name: "Robotic manipulation",
    sameAs: "https://en.wikipedia.org/wiki/Robotic_manipulation",
  },
  {
    "@type": "Thing",
    name: "Force-sensing resistor",
    sameAs: "https://en.wikipedia.org/wiki/Force-sensing_resistor",
  },
  {
    "@type": "Thing",
    name: "Robot learning",
    sameAs: "https://en.wikipedia.org/wiki/Robot_learning",
  },
  {
    "@type": "Thing",
    name: "Metrology",
    sameAs: "https://en.wikipedia.org/wiki/Metrology",
  },
  {
    "@type": "Thing",
    name: "Calibration",
    sameAs: "https://en.wikipedia.org/wiki/Calibration",
  },
  {
    "@type": "Thing",
    name: "Electromyography",
    sameAs: "https://en.wikipedia.org/wiki/Electromyography",
  },
  {
    "@type": "Thing",
    name: "Conformal prediction",
    sameAs: "https://en.wikipedia.org/wiki/Conformal_prediction",
  },
];

/* Keyword sets, per page. Google ignores the keywords meta tag, but Bing,
   Yandex, DuckDuckGo's sources and several AI crawlers still read it, and
   it costs nothing. The real targeting work is in the titles and copy. */
export const KEYWORDS = {
  home: [
    "Physcript",
    "physcri.pt",
    "force data",
    "force data for robots",
    "robot manipulation data",
    "contact force dataset",
    "grip force data",
    "physical AI",
    "robot learning data",
    "force layer for physical AI",
    "certified force data",
    "manipulation dataset",
    "robot grasping data",
    "tactile data collection",
  ],
  atlas: [
    "Touchstone",
    "Physcript Touchstone",
    "robot force data collection",
    "how force data is measured",
    "cross-embodiment transfer",
    "embodiment gap robotics",
    "sEMG force estimation",
    "forearm sleeve force capture",
    "grip stiffness measurement",
    "task-space impedance",
    "contact event detection",
    "certified force measurement",
    "calibrated robot dataset",
    "contact force measurement",
    "conformal prediction force",
    "robot manipulation data format",
  ],
  detailed: [
    "Touchstone v3",
    "contact force dataset specification",
    "force-labeled demonstration data",
    "measuring grip force without gloves",
    "muscle-side force sensing",
    "human demonstration data collection",
    "imitation learning force data",
    "wrench data manipulation",
    "calibration traceability robotics",
    "transfer standard robotics",
    "conformal prediction intervals",
    "HD-sEMG force regression",
    "data provenance robot learning",
    "privileged distillation robotics",
    "robot manipulation benchmark",
  ],
};

export const organizationSchema = () => {
  const org = {
    "@type": "Organization",
    "@id": `${SITE.url}/#organization`,
    name: SITE.name,
    alternateName: ["Physcript Robotics", SITE.domain],
    url: SITE.url,
    email: SITE.email,
    foundingDate: SITE.founded,
    logo: {
      "@type": "ImageObject",
      url: `${SITE.url}/icon.png`,
      caption: "Physcript",
    },
    description:
      "Physcript builds the force layer for physical AI: measured, calibrated contact-force data for robot manipulation — captured from the muscle side of a natural human demonstration, carrying a stated interval on every force and stiffness value, and portable across robot bodies.",
    knowsAbout: KNOWS_ABOUT,
    slogan: SITE.tagline,
  };
  if (SAME_AS.length) org.sameAs = SAME_AS;
  return org;
};

export const websiteSchema = () => ({
  "@type": "WebSite",
  "@id": `${SITE.url}/#website`,
  url: SITE.url,
  name: SITE.name,
  description:
    "Certified force data for robot manipulation. Measured from natural human demonstrations, carrying a stated uncertainty, portable across robot bodies.",
  publisher: { "@id": `${SITE.url}/#organization` },
  inLanguage: "en",
});

export const breadcrumb = (trail) => ({
  "@type": "BreadcrumbList",
  itemListElement: trail.map((t, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: t.name,
    item: `${SITE.url}${t.path}`,
  })),
});

export const techArticle = ({ path, headline, description, keywords }) => ({
  "@type": "TechArticle",
  "@id": `${SITE.url}${path}#article`,
  headline,
  description,
  url: `${SITE.url}${path}`,
  inLanguage: "en",
  datePublished: SITE.published,
  dateModified: SITE.modified,
  author: { "@id": `${SITE.url}/#organization` },
  publisher: { "@id": `${SITE.url}/#organization` },
  isPartOf: { "@id": `${SITE.url}/#website` },
  about: ABOUT_ENTITIES,
  keywords: keywords.join(", "),
  image: `${SITE.url}/opengraph-image.png`,
});

/* one graph per page keeps the entities cross-referenced by @id */
export const graph = (nodes) =>
  JSON.stringify({ "@context": "https://schema.org", "@graph": nodes });
