"use client";

import { useEffect, useRef } from "react";

/* The same fine-nib ring used on the landing page, reused on every
   scrolling sheet so the whole site feels like one instrument rather
   than a hero demo bolted onto plain documents.

   Landing page: the ring is absolutely positioned inside a fixed,
   non-scrolling canvas, so its coordinates are the pointer position
   relative to that canvas.
   Everywhere else: the page scrolls, so the ring is fixed to the
   viewport and just follows clientX/clientY directly. */

const INTERACTIVE =
  'a, button, [role="button"], summary, input, select, textarea, label';

export default function CustomCursor() {
  const ringRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const ring = ringRef.current;
    if (!ring) return;

    let inside = false;

    const move = (e) => {
      if (!inside) {
        inside = true;
        ring.style.opacity = 1;
      }
      ring.style.left = e.clientX + "px";
      ring.style.top = e.clientY + "px";
    };
    const over = (e) => {
      if (e.target.closest && e.target.closest(INTERACTIVE)) {
        ring.classList.add("grip");
      }
    };
    const out = (e) => {
      if (e.target.closest && e.target.closest(INTERACTIVE)) {
        ring.classList.remove("grip");
      }
    };
    const leave = () => {
      inside = false;
      ring.style.opacity = 0;
    };

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerover", over, { passive: true });
    window.addEventListener("pointerout", out, { passive: true });
    document.addEventListener("mouseleave", leave);
    window.addEventListener("blur", leave);

    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
      window.removeEventListener("pointerout", out);
      document.removeEventListener("mouseleave", leave);
      window.removeEventListener("blur", leave);
    };
  }, []);

  return <div className="cursor-ring is-fixed" ref={ringRef} aria-hidden="true" />;
}
