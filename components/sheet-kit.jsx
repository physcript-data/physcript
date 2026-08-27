"use client";

/* ============================================================
   SHEET KIT
   The shared drafting primitives every Touchstone sheet is
   built from: reveal-on-scroll, self-measuring paths, scroll
   scrubbing, counters, and the sheet furniture (corner ticks,
   rules, stamps).

   Nothing in here knows anything about Touchstone. It is the
   instrument, not the reading.
   ============================================================ */

import { useCallback, useEffect, useRef, useState } from "react";

/* ---------- environment ---------- */

export function useCoarse() {
  const [coarse, setCoarse] = useState(false);
  useEffect(() => {
    setCoarse(window.matchMedia("(pointer: coarse)").matches);
  }, []);
  return coarse;
}

export function useStill() {
  /* true when the reader has asked for less motion. Read once on mount:
     every sheet renders its finished state instead of its arrival. */
  const [still, setStill] = useState(false);
  useEffect(() => {
    setStill(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);
  return still;
}

/* ---------- reveal ---------- */

/* Attach to a container. Every descendant carrying .rise gets .is-in the
   first time it comes near the viewport, and is then forgotten. */
export function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const nodes = ref.current?.querySelectorAll(".rise");
    if (!nodes) return;
    if (
      !("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      nodes.forEach((n) => n.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.06 }
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);
  return ref;
}

/* ---------- geometry ---------- */

/* A ref callback that writes a path's own length into --len, so a
   stroke-dash draw always matches the geometry it is drawing. */
export function useMeasured() {
  return useCallback((el) => {
    if (el && el.getTotalLength) {
      el.style.setProperty("--len", el.getTotalLength().toFixed(1));
    }
  }, []);
}

/* ---------- scroll scrubbing ---------- */

/* Progress of a tall section past the viewport, 0 → 1, sampled on a
   single rAF per frame. Used by the sticky sequences. */
export function useScrub(ref) {
  const [t, setT] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setT(1);
      return;
    }
    let frame = 0;
    const read = () => {
      frame = 0;
      const r = el.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      if (span <= 0) {
        setT(r.top <= 0 ? 1 : 0);
        return;
      }
      const p = -r.top / span;
      setT(p < 0 ? 0 : p > 1 ? 1 : p);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };
    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [ref]);
  return t;
}

/* ---------- interpolation ---------- */

export const lerp = (a, b, t) => a + (b - a) * t;

export const clamp01 = (t) => (t < 0 ? 0 : t > 1 ? 1 : t);

/* smoothstep, so a scrubbed morph settles instead of arriving flat */
export const ease = (t) => {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
};

/* Walk a keyframe array at position t ∈ [0,1] and return the eased value
   between the two frames it falls between. */
export function keyframe(values, t) {
  const n = values.length - 1;
  if (n <= 0) return values[0];
  const p = clamp01(t) * n;
  const i = Math.min(Math.floor(p), n - 1);
  return lerp(values[i], values[i + 1], ease(p - i));
}

/* ---------- counters ---------- */

/* A number that ticks to its value the first time it is seen. The final
   value is in the DOM from the first render, so it is correct with
   JavaScript disabled, in reduced motion, and for a screen reader. */
export function Counter({ to, decimals = 1, suffix = "", duration = 900 }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(to);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (
      !("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    let raf = 0;
    let start = 0;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        const step = (now) => {
          if (!start) start = now;
          const p = ease(clamp01((now - start) / duration));
          setShown(to * p);
          if (p < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      },
      { threshold: 0.5 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [to, duration]);

  return (
    <span ref={ref}>
      {shown.toFixed(decimals)}
      {suffix}
    </span>
  );
}

/* ---------- sheet furniture ---------- */

/* The four corner ticks that make a drawing a sheet. */
export function Ticks({ w, h, m = 22, l = 22 }) {
  return (
    <g className="k-tick">
      <path d={`M${m} ${m + l} L${m} ${m} L${m + l} ${m}`} />
      <path d={`M${w - m - l} ${m} L${w - m} ${m} L${w - m} ${m + l}`} />
      <path d={`M${m} ${h - m - l} L${m} ${h - m} L${m + l} ${h - m}`} />
      <path
        d={`M${w - m - l} ${h - m} L${w - m} ${h - m} L${w - m} ${h - m - l}`}
      />
    </g>
  );
}

/* An evidence label, the vault's own D / C / R / I / H. */
export const EVIDENCE = {
  D: ["Demonstrated", "independently demonstrated in peer-reviewed work"],
  C: ["Company-reported", "claimed by a company, not independently verified"],
  R: ["Research prototype", "shown once in a lab, not productised"],
  I: ["Inference", "our own reasoning from evidence, not itself measured"],
  H: ["Hypothesis", "speculative — must be gated by an experiment"],
};

export function Ev({ k }) {
  const e = EVIDENCE[k];
  if (!e) return null;
  return (
    <span className={"k-ev k-ev-" + k} title={`${e[0]} — ${e[1]}`}>
      {k}
    </span>
  );
}

/* deterministic pseudo-signal, so server and client draw the same trace */
export function signal(seed, n, amp = 1) {
  const out = [];
  let s = seed;
  for (let i = 0; i < n; i++) {
    s = (s * 1103515245 + 12345) % 2147483648;
    out.push(((s / 2147483648) * 2 - 1) * amp);
  }
  return out;
}
