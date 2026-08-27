# Physcript — SEO map and plan

Everything implemented so far is invisible to a reader: metadata, structured
data, robots, sitemap, and one rendering fix. No page copy or heading was
changed.

---

## 1. The thing that mattered most

The homepage was rendering **zero HTML** to crawlers.

`app/page.jsx` loaded `Hero` through `dynamic(..., { ssr: false })`, which
means the server sent an empty document. Every word on the landing page —
the wordmark, "Force is invisible in videos. We record it.", "Robots crush
this every day.", the MVP-0 link — existed only after JavaScript executed.

Google can render JavaScript, but it does so on a delayed second pass that is
not guaranteed for a site with no authority yet. Bing is weaker at it. Social
scrapers, Ahrefs, and most AI crawlers do not run JS at all. For a brand-new
domain trying to win its own name, this was the single largest blocker.

**Fixed** by moving only the WebGL `<Canvas>` into a client-only child
(`components/HeroCanvas.jsx`). The text layer now server-renders. The
`coarse` pointer state was changed to initialise `false` so server and client
agree on first paint — the real value is still read in the existing effect.

Crawlers now receive:

```
[physcript] · Force is invisible in videos. We record it. · sound on ·
contact · Robots crush this every day. · press & hold to grip · release
inside the window · N 46 0.0 · 2.1 N TARGET RANGE · MVP-0 · IN PROGRESS →
```

One consequence worth knowing: the text now appears immediately and the 3D
egg fades in behind it, instead of the page being blank until everything
loads. The final appearance is identical.

---

## 2. Query map

### Tier 1 — Brand. You should own these outright.

`physcript` · `physcri.pt` · `physcript robotics` · `physcript ai` ·
`physcript touchstone` · `touchstone force data` · `what is physcript` ·
`physcript force data`

These are winnable because nobody else competes for them. The levers are the
`Organization` schema with `alternateName`, a server-rendered homepage, and
confirmed profiles (see §5 — currently the weakest point).

### Tier 2 — Category. Realistic within months, with content.

`force data for robots` · `robot force dataset` · `contact force dataset
robotics` · `force-labelled manipulation data` · `certified force data` ·
`calibrated force data robotics` · `grip force dataset` · `manipulation force
data` · `tactile dataset robot` · `robot grasping force dataset` · `force data
collection robotics` · `physical AI data` · `force layer physical AI`

### Tier 3 — Problem-aware. The most winnable, highest-converting.

`why do robots crush objects` · `robots crush objects grip force` · `how to
measure grip force human demonstration` · `video cannot capture force` ·
`force is invisible in video` · `measuring contact force without gloves` ·
`glove-free force capture` · `markerless force measurement grasping` · `how
much force does a robot grip with` · `capturing force data from human
demonstrations` · `how do robots learn grip force`

Your existing copy already speaks this language, which is why these are the
best near-term targets.

### Tier 4 — Technical and research. Low volume, very high intent.

`embodiment gap robot learning` · `cross-embodiment transfer manipulation` ·
`force closure transfer robot hand` · `wrench data manipulation dataset` ·
`contact point force annotation` · `retargeting human grasp to robot hand` ·
`grasp transfer parallel jaw three finger` · `force closure feasibility
check` · `imitation learning contact force` · `VLA model force data` ·
`LeRobot force data format` · `RLDS contact force` · `robot manipulation
dataset provenance` · `calibration traceability robot data` · `metrology
robot dataset`

### Tier 5 — Comparison and alternative.

`alternatives to teleoperation data collection` · `teleoperation vs human
demonstration data` · `UMI gripper alternative` · `DexCap alternative` ·
`mocap glove alternative force` · `data collection for robot foundation
models`

### Tier 6 — Commercial.

`buy robot manipulation dataset` · `license force dataset robotics` · `robot
data collection startup` · `force data provider robotics`

---

## 3. Page targeting

| Route | Primary intent | Title |
|---|---|---|
| `/` | Brand + category head terms | Physcript — force data for robot manipulation |
| `/touchstone` | The atlas: how it works, cross-embodiment, certification, the kill gates | Touchstone — the whole system on one sheet |
| `/touchstone/detailed` | Deep technical, Tier 3–4 long tail, published validation results | Touchstone v3 — measuring contact force from human demonstrations |

Titles lead with the distinguishing noun rather than the brand, because
nobody is searching the brand yet. Once brand volume exists, revisit.

---

## 4. What was implemented

- **Homepage SSR fix** (above) — the highest-impact item.
- **Root metadata**: title template, expanded description, authors, creator,
  publisher, category, `formatDetection`, explicit `robots` directives
  including `max-image-preview: large` and `max-snippet: -1` so Google may
  show full snippets and large thumbnails.
- **Structured data** (`lib/seo.js`, injected as JSON-LD):
  - `Organization` with `alternateName`, `logo`, `slogan`, `email`, and a
    23-entry `knowsAbout` list. `knowsAbout` is what places a small site in a
    topic graph and makes it eligible for niche queries it has no backlinks
    for — the most useful single field here.
  - `WebSite` linked to the organisation by `@id`.
  - `TechArticle` on both Touchstone routes, with `about` entities linked to
    Wikipedia for concept disambiguation, plus `datePublished` /
    `dateModified`.
  - `BreadcrumbList` on both, which is what produces the breadcrumb trail in
    search results instead of a raw URL.
- **robots.txt**: explicit allow, `host`, sitemap reference, and a named
  allow-list for answer engines (GPTBot, ClaudeBot, PerplexityBot, Applebot,
  CCBot and others). For a niche this technical, an AI answer citing you is a
  realistic and valuable referral path.
- **sitemap.xml**: real `lastModified`, per-route `changeFrequency` and
  priority, and image entries for the plates.
- **OG/Twitter image alt text** via `opengraph-image.alt.txt` and
  `twitter-image.alt.txt`.

---

## 5. What is still missing — and it is the important part

Metadata gets a site *indexed correctly*. It does not get it *ranked* for
competitive terms. Ranking for anything in Tier 2 and above needs two things
this site does not yet have:

1. **Confirmed entity profiles.** `sameAs` is deliberately empty — publishing
   URLs that do not resolve is worse than publishing none. The moment a
   GitHub org, LinkedIn company page, or X account exists, add them to
   `SAME_AS` in `lib/seo.js`. This is the strongest remaining lever for
   owning the query "physcript".

2. **Indexable text on the subjects you want to rank for.** The two Touchstone
   pages are genuinely substantive, and that is a real asset. But Tier 2–4
   terms are won by pages that address them directly. Since you have asked me
   not to change any visible copy, that is out of scope here — but be clear
   that this is the ceiling. Nothing in `<head>` will outrank a page that
   actually answers the question.

Other items worth doing, in rough priority order:

- **Google Search Console + Bing Webmaster Tools.** Submit the sitemap,
  request indexing. Nothing happens until a crawler is told the site exists.
  Add the verification token to `metadata.verification` in `app/layout.jsx`.
- **A few authoritative inbound links.** For this niche: a LeRobot or
  Hugging Face community post, an arXiv preprint, a Show HN, a robotics
  newsletter. Three good links beat three hundred bad ones.
- **Run a real Lighthouse pass.** The SSR fix should improve LCP
  substantially, but Core Web Vitals are a live ranking input and I cannot
  measure them from here.
- **Consider a `/glossary` or short writeups** targeting Tier 3 questions
  directly. This is the highest-leverage content work available, and it
  requires new pages rather than edits to existing ones.

---

## 6. Honest expectation

You asked to be the top result for anything related to force data collection.
For **`physcript`** and close brand variants, that is achievable and the work
above is most of what it takes. For **Tier 3 long-tail questions**, it is
plausible within a few months given the quality of the existing writing. For
head terms like **`force data`** or **`robot manipulation data`**, metadata
alone will not do it at any timescale — those are won with sustained
publishing and links, and anyone promising otherwise is guessing.
