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

## Stack

- Next.js 14 (app router)
- react-three-fiber + drei (3D egg and interaction)
- @react-three/postprocessing (depth of field, film grain, vignette)
- WebAudio (synthesized strain / crack / thud / certification chime — no audio files)
- Fonts: Instrument Serif (voice) + JetBrains Mono (instrument labels)

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
