"use client";

import * as THREE from "three";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  EffectComposer,
  DepthOfField,
  Noise,
  Vignette,
} from "@react-three/postprocessing";

const CRUSH = 46;
const FMAX = 60;
const RAMP = 22;
const CRACK_START = 36;
const CRACK_SPREAD = 43;
const SHATTER_DELAY = 0.08;
const BURST_DURATION = 1.2;
const RETURN_DURATION = 1.05;

function seededRandom(seed) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function eggify(geo) {
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const y = THREE.MathUtils.clamp(p.getY(i), -1, 1);
    const z = p.getZ(i);

    // A full ovoid profile: narrower at the crown, fullest below center,
    // and rounder at the base. This preserves a smooth pole at both ends.
    const taper = 1 - 0.2 * y - 0.035 * y * y;
    const lowerBulge = 1 + 0.025 * Math.exp(-Math.pow((y + 0.42) / 0.34, 2));
    const radius = 0.8 * taper * lowerBulge;

    p.setX(i, x * radius);
    p.setZ(i, z * radius * 0.985);
    p.setY(i, y * 1.08);
  }
  geo.computeVertexNormals();
  return geo;
}

function makeShadowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(256, 128, 8, 256, 128, 238);
  gradient.addColorStop(0, "rgba(43, 40, 36, 0.34)");
  gradient.addColorStop(0.35, "rgba(43, 40, 36, 0.16)");
  gradient.addColorStop(0.72, "rgba(43, 40, 36, 0.045)");
  gradient.addColorStop(1, "rgba(43, 40, 36, 0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

function makeShell() {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 512;
  const g = c.getContext("2d");
  const random = seededRandom(7241);

  const speckles = [];
  for (let i = 0; i < 105; i++)
    speckles.push([
      random() * 512,
      random() * 512,
      0.45 + random() * 1.35,
      0.025 + random() * 0.065,
    ]);

  const seeds = [];
  for (let i = 0; i < 7; i++)
    seeds.push([140 + random() * 230, 120 + random() * 270]);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;

  const crackPath = (x, y, n, len, angle = random() * Math.PI * 2) => {
    g.beginPath();
    g.moveTo(x, y);
    let a = angle;
    for (let k = 0; k < n; k++) {
      a += (random() - 0.5) * 1.05;
      const step = len * (0.72 + random() * 0.52);
      x += Math.cos(a) * step;
      y += Math.sin(a) * step;
      g.lineTo(x, y);
    }
    g.stroke();
  };

  const draw = (stage) => {
    g.fillStyle = "#fffdf8";
    g.fillRect(0, 0, 512, 512);
    for (const s of speckles) {
      g.fillStyle = "rgba(150,136,112," + s[3] + ")";
      g.beginPath();
      g.arc(s[0], s[1], s[2], 0, 6.28);
      g.fill();
    }
    if (stage > 0) {
      g.strokeStyle = "rgba(62,58,52," + (stage === 1 ? 0.18 : 0.38) + ")";
      g.lineWidth = stage === 1 ? 0.55 : 0.85;
      const n = stage === 1 ? 3 : 7;
      for (let i = 0; i < n; i++) {
        const angle = random() * Math.PI * 2;
        crackPath(seeds[i][0], seeds[i][1], 4 + stage * 2, 3.5 + stage * 2, angle);
        if (stage === 2) {
          crackPath(
            seeds[i][0],
            seeds[i][1],
            3,
            4.5,
            angle + (random() > 0.5 ? 0.75 : -0.75)
          );
        }
      }
    }
    tex.needsUpdate = true;
  };

  draw(0);
  return { tex, draw };
}

function makeShardMeshes() {
  const random = seededRandom(9137);
  const meshes = [];
  const bands = [
    { start: 0, end: 0.5, count: 5 },
    { start: 0.5, end: 1.08, count: 7 },
    { start: 1.08, end: 1.72, count: 8 },
    { start: 1.72, end: 2.35, count: 7 },
    { start: 2.35, end: Math.PI, count: 5 },
  ];

  for (let bandIndex = 0; bandIndex < bands.length; bandIndex++) {
    const band = bands[bandIndex];
    const offset = bandIndex % 2 === 0 ? 0 : Math.PI / band.count;
    for (let i = 0; i < band.count; i++) {
      const phiLen = (Math.PI * 2) / band.count;
      const geo = new THREE.SphereGeometry(
        1,
        7,
        6,
        offset + i * phiLen,
        phiLen * 1.035,
        band.start,
        (band.end - band.start) * 1.025
      );
      eggify(geo);
      geo.computeBoundingBox();
      const center = new THREE.Vector3();
      geo.boundingBox.getCenter(center);
      geo.translate(-center.x, -center.y, -center.z);

      const material = new THREE.MeshPhysicalMaterial({
        color: "#fffaf0",
        roughness: 0.44,
        clearcoat: 0.12,
        side: THREE.DoubleSide,
        transparent: true,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(geo, material);
      mesh.position.copy(center);

      const outward = new THREE.Vector3(center.x, center.y * 0.42, center.z).normalize();
      const speed = 0.9 + random() * 1.15;
      const velocity = outward.multiplyScalar(speed);
      velocity.y += 0.5 + random() * 1.35;

      mesh.userData = {
        velocity,
        spin: new THREE.Vector3(
          (random() - 0.5) * 8,
          (random() - 0.5) * 7,
          (random() - 0.5) * 8
        ),
        homePosition: center.clone(),
        homeQuaternion: new THREE.Quaternion(),
        returnPosition: null,
        returnQuaternion: null,
      };
      meshes.push(mesh);
    }
  }
  return meshes;
}

export default function World({ sim, lowPower }) {
  const egg = useRef();
  const eggMaterial = useRef();
  const group = useRef();
  const dust = useRef();
  const shards = useRef([]);

  const shell = useMemo(() => makeShell(), []);
  const shadowTexture = useMemo(() => makeShadowTexture(), []);
  const geo = useMemo(
    () => eggify(new THREE.SphereGeometry(1, lowPower ? 64 : 96, lowPower ? 64 : 96)),
    [lowPower]
  );

  const dustGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = [];
    for (let i = 0; i < 70; i++)
      pos.push(
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 3 - 0.5
      );
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    return g;
  }, []);

  const setStage = (n) => {
    if (n !== sim.stage) {
      sim.stage = n;
      shell.draw(n);
    }
  };

  const clearShards = () => {
    for (const s of shards.current) {
      group.current.remove(s);
      s.geometry.dispose();
      s.material.dispose();
    }
    shards.current = [];
  };

  const resetWorld = () => {
    sim.state = "idle";
    sim.f = 0;
    sim.ey = 0;
    sim.evy = 0;
    sim.shatterAt = 0;
    setStage(0);
    clearShards();
    if (egg.current) {
      egg.current.visible = true;
      egg.current.position.set(0, 0, 0);
      egg.current.rotation.z = 0;
    }
    if (eggMaterial.current) eggMaterial.current.opacity = 1;
    sim.hideStamp();
    sim.idleShown = false;
    sim.lastAct = sim.t;
    sim.say(sim.defaults.msg, sim.defaults.sub);
  };

  const crush = () => {
    sim.state = "crushed";
    setStage(2);
    sim.sound.stopStrain();
    sim.sound.crack();
    sim.say(
      "Too hard — " + sim.f.toFixed(1) + " N.",
      "the motion looked the same. the force did not."
    );
    sim.shatterAt = sim.t + SHATTER_DELAY;
    const fAt = sim.f;
    sim.f = 0;
    return fAt;
  };

  useFrame((st, dt0) => {
    if (!sim.hud || !sim.say || !sim.sound) return;
    const dt = Math.min(0.05, dt0 || 0.016);
    sim.t += dt;
    const e = egg.current;
    if (!e) return;

    if (sim.state === "held") {
      if (sim.f < FMAX) sim.f += dt * RAMP;
      if (sim.f > CRACK_SPREAD) setStage(2);
      else if (sim.f > CRACK_START) setStage(1);
      sim.sound.strain(sim.f / FMAX);
      if (sim.f >= CRUSH) {
        sim.f = CRUSH;
        crush();
      }
    }

    if ((sim.state === "slipped" || sim.state === "success") && sim.t > sim.resetAt) {
      resetWorld();
    }

    if (sim.state === "crushed" && sim.t >= sim.shatterAt) {
      if (shards.current.length === 0) {
        e.visible = false;
        const meshes = makeShardMeshes();
        for (const mesh of meshes) group.current.add(mesh);
        shards.current = meshes;
      }

      const elapsed = sim.t - sim.shatterAt;
      if (elapsed < BURST_DURATION) {
        for (const shard of shards.current) {
          const u = shard.userData;
          u.velocity.y -= 6.8 * dt;
          shard.position.addScaledVector(u.velocity, dt);
          shard.rotation.x += u.spin.x * dt;
          shard.rotation.y += u.spin.y * dt;
          shard.rotation.z += u.spin.z * dt;

          if (shard.position.y < -1.12) {
            shard.position.y = -1.12;
            u.velocity.y = Math.abs(u.velocity.y) * 0.28;
            u.velocity.x *= 0.78;
            u.velocity.z *= 0.78;
            u.spin.multiplyScalar(0.82);
          }
        }
      } else {
        const returnProgress = Math.min(1, (elapsed - BURST_DURATION) / RETURN_DURATION);
        const eased = 1 - Math.pow(1 - returnProgress, 3);
        const shellBlend = THREE.MathUtils.smoothstep(returnProgress, 0.58, 1);

        if (shellBlend > 0) {
          setStage(0);
          e.visible = true;
          if (eggMaterial.current) eggMaterial.current.opacity = shellBlend;
        }

        for (const shard of shards.current) {
          const u = shard.userData;
          if (!u.returnPosition) {
            u.returnPosition = shard.position.clone();
            u.returnQuaternion = shard.quaternion.clone();
          }
          shard.position.lerpVectors(u.returnPosition, u.homePosition, eased);
          shard.quaternion.slerpQuaternions(u.returnQuaternion, u.homeQuaternion, eased);
          shard.material.opacity = 1 - shellBlend;
        }
        if (returnProgress >= 1) resetWorld();
      }
    }

    if (sim.state === "slipped") {
      sim.evy -= 9 * dt;
      sim.ey += sim.evy * dt;
      if (sim.ey < -0.62) {
        sim.ey = -0.62;
        sim.evy = -sim.evy * 0.35;
        if (!sim.bounced) {
          sim.bounced = true;
          sim.sound.thud();
        }
      }
      e.rotation.z += dt * 0.8;
    } else if (sim.state !== "crushed") {
      sim.ey += (0 - sim.ey) * 0.08;
      e.rotation.z *= 0.95;
    }

    const forceRatio = Math.min(1, sim.f / FMAX);
    const jit =
      sim.state === "held" && !sim.reduced
        ? forceRatio * (sim.f > CRACK_START ? 0.035 : 0.02)
        : 0;
    e.position.set(
      (Math.random() - 0.5) * jit,
      sim.ey +
        (sim.reduced ? 0 : Math.sin(sim.t * 1.1) * 0.022) +
        (Math.random() - 0.5) * jit,
      0
    );
    e.rotation.y = sim.t * 0.14;

    const br = sim.reduced ? 1 : 1 + Math.sin(sim.t * 0.9) * 0.008;
    const sq = sim.state === "held" ? forceRatio * 0.15 : 0;
    e.scale.x += ((1 - sq) * br - e.scale.x) * 0.2;
    e.scale.y += ((1 + sq * 0.55) * br - e.scale.y) * 0.2;
    e.scale.z += ((1 + sq * 0.55) * br - e.scale.z) * 0.2;

    if (dust.current && !sim.reduced) {
      const dp = dust.current.geometry.attributes.position;
      for (let i = 0; i < 70; i++) {
        let yy = dp.getY(i) + dt * 0.03;
        if (yy > 2) yy = -2;
        dp.setY(i, yy);
      }
      dp.needsUpdate = true;
    }

    if (!sim.reduced) {
      st.camera.position.x += ((sim.px - 0.5) * 0.35 - st.camera.position.x) * 0.04;
      st.camera.position.y +=
        (0.6 + (0.5 - sim.py) * 0.2 - st.camera.position.y) * 0.04;
      st.camera.lookAt(0, -0.05, 0);
    }

    if (sim.state === "idle" && !sim.idleShown && sim.t - sim.lastAct > 12) {
      sim.idleShown = true;
      sim.say("Still intact. Robots average 4 seconds.", "press & hold to grip");
    }

    sim.nds += (Math.min(1, sim.f / FMAX) * 100 - sim.nds) * 0.25;
    if (sim.hud.needle.current)
      sim.hud.needle.current.style.bottom = sim.nds + "%";
    if (sim.hud.readout.current)
      sim.hud.readout.current.textContent = sim.f.toFixed(1);
  });

  return (
    <>
      <color attach="background" args={["#f4f2ed"]} />
      <hemisphereLight args={["#fffdf8", "#c9c4ba", 1.18]} />
      <ambientLight intensity={0.82} />
      <directionalLight
        position={[2.5, 4, 3]}
        intensity={1.05}
        color="#fff9ed"
      />
      <directionalLight position={[-3, 1, -2]} intensity={0.22} color="#dde4ee" />
      <directionalLight position={[-1, 0.4, -3]} intensity={0.4} color="#ffe9d0" />

      <mesh ref={egg} geometry={geo}>
        <meshPhysicalMaterial
          ref={eggMaterial}
          map={shell.tex}
          color="#fffefb"
          roughness={0.36}
          metalness={0}
          clearcoat={0.2}
          clearcoatRoughness={0.58}
          emissive="#f6f1e8"
          emissiveIntensity={0.08}
          transparent
        />
      </mesh>

      <group ref={group} />

      <points ref={dust} geometry={dustGeo}>
        <pointsMaterial
          color="#b8b4a8"
          size={0.016}
          transparent
          opacity={0.5}
          sizeAttenuation
        />
      </points>

      <sprite position={[0, -1.02, -0.55]} scale={[2.85, 0.66, 1]}>
        <spriteMaterial
          map={shadowTexture}
          transparent
          opacity={0.72}
          depthWrite={false}
          toneMapped={false}
        />
      </sprite>

      {!sim.reduced && !lowPower && (
        <EffectComposer>
          <DepthOfField focusDistance={0.09} focalLength={0.04} bokehScale={2.5} />
          <Noise opacity={0.04} />
          <Vignette darkness={0.28} eskil={false} />
        </EffectComposer>
      )}
    </>
  );
}
