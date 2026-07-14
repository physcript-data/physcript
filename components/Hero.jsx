"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import World from "./World";
import { SoundEngine } from "../lib/sound";

const SAFE_MIN = 12;

const IDLE_MSG = "Robots crush this every day.";
const IDLE_SUB = "press & hold to grip · release inside the window";

export default function Hero() {
  const heroRef = useRef(null);
  const msgRef = useRef(null);
  const subRef = useRef(null);
  const needleRef = useRef(null);
  const readoutRef = useRef(null);
  const stampRef = useRef(null);
  const ringRef = useRef(null);
  const stampValRef = useRef(null);
  const cursorRef = useRef(null);
  const [soundOn, setSoundOn] = useState(true);
  const [coarse, setCoarse] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches
  );

  const sound = useMemo(() => new SoundEngine(), []);
  const sim = useMemo(
    () => ({
      state: "idle",
      f: 0,
      ey: 0,
      evy: 0,
      t: 0,
      resetAt: 0,
      stage: 0,
      px: 0.5,
      py: 0.5,
      lastAct: 0,
      idleShown: false,
      reduced: false,
      bounced: false,
      nds: 0,
    }),
    []
  );

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    sim.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setCoarse(window.matchMedia("(pointer: coarse)").matches);

    const say = (m, s) => {
      const M = msgRef.current;
      const S = subRef.current;
      if (!M || !S) return;
      M.style.opacity = 0;
      S.style.opacity = 0;
      setTimeout(() => {
        if (!msgRef.current) return;
        msgRef.current.textContent = m;
        subRef.current.textContent = s;
        msgRef.current.style.opacity = 1;
        subRef.current.style.opacity = 1;
      }, 280);
    };

    sim.say = say;
    sim.sound = sound;
    sim.defaults = { msg: IDLE_MSG, sub: IDLE_SUB };
    sim.hud = {
      needle: needleRef,
      readout: readoutRef,
    };
    sim.showStamp = (val) => {
      if (!stampRef.current) return;
      stampValRef.current.textContent = val.toFixed(1) + " N";
      stampRef.current.style.opacity = 1;
      setTimeout(() => {
        if (ringRef.current) ringRef.current.style.strokeDashoffset = 0;
      }, 60);
    };
    sim.hideStamp = () => {
      if (!stampRef.current) return;
      stampRef.current.style.opacity = 0;
      ringRef.current.style.strokeDashoffset = 314;
    };

    const move = (e) => {
      const r = hero.getBoundingClientRect();
      sim.px = (e.clientX - r.left) / r.width;
      sim.py = (e.clientY - r.top) / r.height;
      const c = cursorRef.current;
      if (c) {
        c.style.opacity = 1;
        c.style.left = e.clientX - r.left + "px";
        c.style.top = e.clientY - r.top + "px";
      }
    };

    const leave = () => {
      if (cursorRef.current) cursorRef.current.style.opacity = 0;
    };

    const down = (e) => {
      sound.init();
      if (sound.ctx && sound.ctx.state === "suspended") sound.ctx.resume();
      sim.lastAct = sim.t;
      if (sim.state !== "idle") return;
      sim.state = "held";
      sim.idleShown = false;
      if (cursorRef.current) cursorRef.current.classList.add("grip");
      if (e.pointerType === "touch") move(e);
    };

    const up = () => {
      sim.lastAct = sim.t;
      if (cursorRef.current) cursorRef.current.classList.remove("grip");
      if (sim.state !== "held") return;
      sound.stopStrain();
      const f = sim.f;
      if (f >= SAFE_MIN) {
        sim.state = "success";
        sim.showStamp(f);
        say(
          "Just right — " + f.toFixed(1) + " N.",
          "the data robots never had. that’s our product."
        );
        sound.tick();
        sim.resetAt = sim.t + 3.4;
      } else if (f > 0.15) {
        sim.state = "slipped";
        sim.evy = 0;
        sim.bounced = false;
        say(
          "Too gentle — it slipped.",
          "grip force below friction. try again."
        );
        sim.resetAt = sim.t + 2.8;
      } else {
        sim.state = "idle";
      }
      sim.f = 0;
    };

    const ctx = (e) => e.preventDefault();

    hero.addEventListener("pointermove", move);
    hero.addEventListener("pointerleave", leave);
    hero.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    hero.addEventListener("contextmenu", ctx);
    return () => {
      hero.removeEventListener("pointermove", move);
      hero.removeEventListener("pointerleave", leave);
      hero.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      hero.removeEventListener("contextmenu", ctx);
    };
  }, [sim, sound]);

  const stopEvt = (e) => e.stopPropagation();

  return (
    <section ref={heroRef} className={"hero" + (coarse ? " coarse" : "")}>
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

      <div className="vignette" />

      <div className="hud">
        <div className="wordmark" aria-label="[physcript]">
          <span className="wordmark-bracket" aria-hidden="true">[</span>
          <span>physcript</span>
          <span className="wordmark-bracket" aria-hidden="true">]</span>
        </div>
        <div className="simulation-note">
          Force is invisible in videos. We record it.
        </div>

        <div className="topright">
          <button
            className="soundtoggle"
            onPointerDown={stopEvt}
            onClick={() => {
              sound.enabled = !sound.enabled;
              if (!sound.enabled) sound.stopStrain();
              setSoundOn(sound.enabled);
            }}
          >
            sound {soundOn ? "on" : "off"}
          </button>
          <a
            className="contact"
            href="mailto:chahalpranav2312@gmail.com"
            onPointerDown={stopEvt}
          >
            contact
          </a>
        </div>

        <div className="msg" ref={msgRef}>
          {IDLE_MSG}
        </div>
        <div className="sub" ref={subRef}>
          {IDLE_SUB}
        </div>

        <div className="gauge">
          <div className="cap">N</div>
          <div className="rail" />
          <div className="window" />
          <div className="fracture-value">46</div>
          <div className="needle" ref={needleRef} />
          <div className="readout" ref={readoutRef}>
            0.0
          </div>
        </div>

        <div className="stamp" ref={stampRef}>
          <svg width="128" height="128" viewBox="0 0 128 128">
            <circle
              ref={ringRef}
              cx="64"
              cy="64"
              r="50"
              fill="none"
              stroke="#1e1d1b"
              strokeWidth="1"
              strokeDasharray="314"
              strokeDashoffset="314"
              transform="rotate(-90 64 64)"
              style={{ transition: "stroke-dashoffset .8s cubic-bezier(.4,0,.2,1)" }}
            />
          </svg>
          <div className="num">
            <span className="val" ref={stampValRef}>
              2.1 N
            </span>
            <span className="lbl">TARGET RANGE</span>
          </div>
        </div>

        <div className="mvp-status">
          <span className="status-dot" aria-hidden="true" />
          <span>MVP-0</span>
          <span className="status-divider">·</span>
          <span>IN PROGRESS</span>
        </div>

        <div className="cursor-ring" ref={cursorRef} />
      </div>
    </section>
  );
}
