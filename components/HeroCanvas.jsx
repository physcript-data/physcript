"use client";

import { Canvas } from "@react-three/fiber";
import World from "./World";

/* WebGL only. Split out of Hero so that the text layer around it can be
   rendered on the server — this component is the only part that genuinely
   cannot exist without a browser, so it is the only part loaded client-side. */
export default function HeroCanvas({ sim, coarse }) {
  return (
    <Canvas
      dpr={coarse ? 1 : [1, 2]}
      camera={{ position: [0, 0.6, 4.6], fov: 32, near: 0.1, far: 50 }}
      gl={{
        antialias: !coarse,
        powerPreference: coarse ? "low-power" : "high-performance",
      }}
    >
      <World sim={sim} lowPower={coarse} />
    </Canvas>
  );
}
