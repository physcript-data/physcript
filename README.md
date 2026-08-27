# Physcript landing page

One page, no scroll. A porcelain egg you try to hold: too gentle it slips, too hard it shatters, just right and you get the force reading robots never had.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Production

Production deployments come from the `main` branch of
`physcript-data/physcript` through Vercel. The canonical domain is
`https://physcri.pt`.

No environment variables or custom Vercel build settings are required.

## Pages

- `/` — the landing page: a porcelain egg you try to hold. Untouched by the
  Touchstone rebuild.
- `/touchstone` — **the atlas**. The whole v3 system as one navigable map:
  two gaps → the thesis → seven capture elements → four compiler layers →
  the Record → two consuming layers → deploy, with the five kill gates
  hanging beneath it, each tethered to exactly what it can kill. Plus the
  scroll-scrubbed embodiment morph and the Record drawn as an instrument
  trace.
- `/touchstone/detailed` — **the long sheet**. Nine movements, seven figures,
  the full argument including the pre-registered predictions that failed.

Both Touchstone sheets are built from `components/sheet-kit.jsx` (reveal,
self-measuring paths, scroll scrubbing, counters, sheet furniture). The
atlas graph lives as pure data in `components/atlas-map.js`; the long
sheet's drawings live in `components/sheet-figs.jsx`.

### Disclosure

The Touchstone sheets are held to the vault's `07 Pitch/What Not To Reveal`.
Block categories, the Record schema, the artifact's purpose, all market and
competitor numbers, the kill-gate philosophy and the validation results
(including the misses) are published. The L1 fusion loop, the artifact's
mechanism and range, the sensor zoning and timing scheme, line-item BOM and
the numeric gate thresholds are not. Keep it that way when editing copy.

## Stack

- Next.js 14 (app router)
- react-three-fiber + drei (3D egg and interaction)
- @react-three/postprocessing (depth of field, film grain, vignette)
- WebAudio (synthesized strain / crack / thud / certification chime — no audio files)
- Fonts: Instrument Serif (voice) + JetBrains Mono (instrument labels)
- No animation library: the Touchstone sheets use stroke-dash draws,
  `offset-path` packets, IntersectionObserver reveals and a rAF scroll
  scrubber, all hand-written

## Interaction spec

- Press and hold anywhere: grip force ramps at 22 N/s.
- Release below 12 N: slip, drop, and bounce.
- Release from 12 N up to the fracture threshold: successful reading.
- Hairline cracks begin at 36 N, spread at 43 N, and shatter at 46 N.
- Idle for 12 seconds: "Still intact. Robots average 4 seconds."
- `prefers-reduced-motion` disables tremble, dust, parallax, and post-processing
- Coarse-pointer devices use a lower-resolution mesh, 1x DPR, and no post-processing.

## Tuning

All force constants live at the top of `components/Hero.jsx` (SAFE_MIN) and `components/World.jsx` (CRUSH, FMAX, RAMP). Copy strings are in those two files as well. Contact email is in `Hero.jsx`.
