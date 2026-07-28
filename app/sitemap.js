import { SITE } from "../lib/seo";

export default function sitemap() {
  const modified = new Date(SITE.modified);
  return [
    {
      url: SITE.url,
      lastModified: modified,
      changeFrequency: "weekly",
      priority: 1,
      images: [`${SITE.url}/opengraph-image.png`],
    },
    {
      url: `${SITE.url}/touchstone`,
      lastModified: modified,
      changeFrequency: "weekly",
      priority: 0.9,
      images: [`${SITE.url}/opengraph-image.png`],
    },
    {
      url: `${SITE.url}/touchstone/detailed`,
      lastModified: modified,
      changeFrequency: "monthly",
      priority: 0.7,
      images: [
        `${SITE.url}/touchstone/plate-band.webp`,
        `${SITE.url}/touchstone/plate-sleeve.webp`,
        `${SITE.url}/touchstone/plate-force.webp`,
      ],
    },
  ];
}
