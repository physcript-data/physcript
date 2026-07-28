"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import CustomCursor from "./CustomCursor";

/* ============================================================
   shared helpers
   ============================================================ */

function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const nodes = ref.current?.querySelectorAll(".ts-rise");
    if (!nodes || !("IntersectionObserver" in window)) {
      nodes?.forEach((n) => n.classList.add("is-in"));
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
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 }
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);
  return ref;
}

/* measures its own path so dash animations always match the geometry */
function useMeasured() {
  return useCallback((el) => {
    if (el && el.getTotalLength) {
      el.style.setProperty("--len", el.getTotalLength().toFixed(1));
    }
  }, []);
}

/* ============================================================
   1 — the blind spot: two identical frames
   ============================================================ */

const CUP =
  "M96 46 L104 118 Q106 133 150 133 Q194 133 196 118 L204 46";
const HANDLE =
  "M204 60 C 232 57 242 82 232 98 C 227 106 216 109 199 108";

function Frame({ trace, crush }) {
  const measure = useMeasured();
  return (
    <svg viewBox="0 0 300 212" aria-hidden="true">
      <g stroke="#1e1d1b" fill="none" strokeWidth="1.1" strokeLinejoin="round">
        <ellipse cx="150" cy="46" rx="54" ry="13" />
        <path d={CUP} />
        <path d={HANDLE} />
      </g>
      <ellipse
        cx="150"
        cy="46"
        rx="43"
        ry="9.5"
        fill="none"
        stroke="#cfccc3"
        strokeWidth="1"
      />
      {/* five contact marks — identical in both frames */}
      <g fill="#cfccc3">
        {[
          [100, 66],
          [200, 70],
          [201, 86],
          [202, 102],
          [203, 117],
        ].map(([x, y]) => (
          <circle key={x + "-" + y} cx={x} cy={y} r="3" />
        ))}
      </g>

      {/* instrument well */}
      <line x1="40" y1="192" x2="264" y2="192" stroke="#cfccc3" />
      <line
        x1="40"
        y1="150"
        x2="264"
        y2="150"
        stroke="#cfccc3"
        strokeDasharray="3 4"
      />
      <text x="266" y="153" fontSize="7.5" letterSpacing="1.4" fill="#8b8880">
        FAIL
      </text>
      <path
        ref={measure}
        className="ts-trace"
        d={trace}
        fill="none"
        stroke={crush ? "#a8623c" : "#1e1d1b"}
        strokeWidth="1.5"
      />
    </svg>
  );
}

/* ============================================================
   1b — the capture station, drawn
   ============================================================ */

/* board checker, generated on the plane of the target */
const BOARD = [];
for (let a = 0; a < 4; a++) {
  for (let b = 0; b < 3; b++) {
    if ((a + b) % 2 === 0) {
      const P = (i, j) => `${544 + 16 * i},${266 + 3 * i - 17.33 * j}`;
      BOARD.push(`${P(a, b)} ${P(a + 1, b)} ${P(a + 1, b + 1)} ${P(a, b + 1)}`);
    }
  }
}

/* laptop screen rules */
const SCREEN = (p, q) => [266 + 74 * p - 12 * q, 274.9 + 14 * p - 62 * q];
const BARS = [0.24, 0.38, 0.52, 0.66, 0.8].map((q, i) => {
  const [x1, y1] = SCREEN(0.1, q);
  const [x2, y2] = SCREEN(i % 2 ? 0.72 : 0.88, q);
  return `M${x1.toFixed(1)} ${y1.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)}`;
});

const KEYS = [
  [656, 300, 648, 304, 628, 313, "1"],
  [400, 268, 407, 273, 432, 288, "2"],
  [410, 100, 417, 104, 434, 110, "3"],
  [722, 136, 715, 140, 697, 146, "3"],
  [636, 212, 628, 216, 612, 226, "4"],
  [222, 188, 229, 194, 250, 212, "5"],
  [182, 366, 189, 362, 210, 350, "6"],
];

const LEGEND = [
  ["1", "WORK SURFACE", "the load that leaves it is the grip"],
  ["2", "PREPARED OBJECT", "reports its own squeeze"],
  ["3", "BENCH CAMERAS", "every measured force gets an address"],
  ["4", "POSE REFERENCE", "so millimetres mean millimetres"],
  ["5", "RECORDER", "one clock for every channel"],
  ["6", "INSTRUMENTED TOOL", "measures while the work is happening"],
];

function Camera({ x, y, rot }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect className="ts-fig-fill" x="-12" y="-9" width="24" height="17" rx="2.5" />
      <circle className="ts-fig-fill" cx="0" cy="11.5" r="4.5" />
      <rect className="ts-fig-dark" x="6" y="-6.5" width="3" height="3" />
    </g>
  );
}

function Bench() {
  return (
    <svg
      className="ts-fig"
      viewBox="0 0 1240 640"
      role="img"
      aria-label="Axonometric drawing of a Touchstone capture station: instrumented work surface, prepared object, two bench cameras, a pose reference target, a recorder and an instrumented hand tool."
    >
      <defs>
        <pattern
          id="tsHatch"
          width="9"
          height="9"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(32)"
        >
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="9"
            stroke="#1e1d1b"
            strokeWidth="0.6"
            opacity="0.13"
          />
        </pattern>
      </defs>

      <g stroke="#cfccc3" strokeWidth="1" fill="none">
        <path d="M14 34 L14 14 L34 14" />
        <path d="M1206 14 L1226 14 L1226 34" />
        <path d="M14 606 L14 626 L34 626" />
        <path d="M1206 626 L1226 626 L1226 606" />
      </g>

      <g transform="translate(60 30)">
        {/* shelf, then legs, then the top drawn over them */}
        <polygon
          className="ts-fig-face"
          points="172.6,445.1 519,510.7 697.4,425.9 351,360.3"
        />
        <path
          className="ts-fig-line"
          d="M172.6 445.1 L172.6 453.1 L519 518.7 L519 510.7 M519 518.7 L697.4 433.9 L697.4 425.9"
        />
        <g className="ts-fig-line">
          <path d="M150 343 L150 483 M158 345 L158 485 M150 483 L158 485" />
          <path d="M520 413 L520 553 M528 415 L528 555 M520 553 L528 555" />
          <path d="M720 318 L720 458 M728 320 L728 460 M720 458 L728 460" />
        </g>
        <polygon
          className="ts-fig-face"
          points="150,330 520,400 520,413 150,343"
        />
        <polygon
          className="ts-fig-face"
          points="520,400 720,305 720,318 520,413"
        />
        <polygon
          className="ts-fig-fill"
          points="150,330 520,400 720,305 350,235"
        />

        {/* recorder */}
        <polygon
          className="ts-fig-fill"
          points="186,312.9 260,326.9 340,288.9 266,274.9"
        />
        <polygon
          className="ts-fig-fill"
          points="266,274.9 340,288.9 328,226.9 254,212.9"
        />
        <polygon
          className="ts-fig-dark"
          points="270,272.6 336,285.1 325.5,230.6 259.5,218.1"
        />
        <g stroke="#f1efe9" strokeWidth="2.6" fill="none" opacity="0.9">
          {BARS.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>

        {/* instrumented tool */}
        <g transform="translate(213 339) rotate(5.5)">
          <rect className="ts-fig-fill" x="0" y="-6" width="42" height="12" rx="6" />
          <g className="ts-fig-thin">
            <path d="M11 -5.4 L11 5.4 M18 -5.8 L18 5.8 M25 -5.8 L25 5.8" />
          </g>
          <rect className="ts-fig-fill" x="42" y="-1.7" width="36" height="3.4" />
          <polygon className="ts-fig-fill" points="78,-3 89,0 78,3" />
        </g>

        {/* the measuring surface */}
        <polygon
          className="ts-fig-face"
          points="333.4,346.1 496.2,376.9 496.2,383.9 333.4,353.1"
        />
        <polygon
          className="ts-fig-face"
          points="496.2,376.9 620.2,318 620.2,325 496.2,383.9"
        />
        <polygon
          className="ts-fig-fill"
          points="333.4,346.1 496.2,376.9 620.2,318 457.4,287.2"
        />
        <polygon
          points="352,344.3 493.7,371.1 601.6,319.8 459.9,293"
          fill="url(#tsHatch)"
          stroke="#cfccc3"
          strokeWidth="1"
        />
        <g fill="#a8623c">
          {[
            [352, 344.3],
            [493.7, 371.1],
            [601.6, 319.8],
            [459.9, 293],
          ].map(([x, y]) => (
            <circle key={x} cx={x} cy={y} r="2.4" />
          ))}
        </g>

        {/* cable from the recorder to the surface */}
        <path className="ts-fig-thin" d="M340 292 C 352 306 344 328 350 342" />

        {/* prepared object */}
        <g>
          <path
            className="ts-fig-fill"
            d="M436 289 Q462 296.5 488 289 L486 329 Q462 336 438 329 Z"
          />
          <path className="ts-obj-hidden" d="M438 329 Q462 322 486 329" />
          <ellipse className="ts-fig-fill" cx="462" cy="289" rx="26" ry="7.5" />
          <ellipse className="ts-fig-thin" cx="462" cy="289" rx="19" ry="5.2" />
          <path className="ts-fig-line" d="M488 297 C 509 294 513 314 493 320" />
        </g>

        {/* pose reference */}
        <polygon className="ts-fig-fill" points="544,266 608,278 608,226 544,214" />
        {BOARD.map((pts) => (
          <polygon key={pts} className="ts-fig-dark" points={pts} />
        ))}
        <path className="ts-fig-line" d="M576 272 L576 284" />
        <ellipse className="ts-fig-fill" cx="576" cy="285" rx="11" ry="3.5" />

        {/* bench cameras */}
        <ellipse className="ts-fig-fill" cx="449.6" cy="256.5" rx="15" ry="4.5" />
        <path className="ts-fig-line" d="M448 256 L448 120 M452 256 L452 120" />
        <Camera x={450} y={112} rot={26} />
        <ellipse className="ts-fig-fill" cx="681.8" cy="308.4" rx="15" ry="4.5" />
        <path className="ts-fig-line" d="M680 308 L680 156 M684 308 L684 156" />
        <Camera x={682} y={148} rot={-30} />

        {/* key marks */}
        {KEYS.map(([cx, cy, x1, y1, x2, y2, n], i) => (
          <g key={i} className="ts-mk">
            <path className="ts-fig-lead" d={`M${x1} ${y1} L${x2} ${y2}`} />
            <circle className="ts-mk-dot" cx={cx} cy={cy} r="8.5" />
            <text className="ts-mk-num" x={cx} y={cy + 3.2} textAnchor="middle">
              {n}
            </text>
          </g>
        ))}
      </g>

      {/* legend */}
      <g>
        {LEGEND.map(([n, name, sub], i) => {
          const y = 190 + i * 44;
          return (
            <g key={n + name}>
              <g className="ts-mk">
                <circle className="ts-mk-dot" cx="896" cy={y} r="8.5" />
                <text className="ts-mk-num" x="896" y={y + 3.2} textAnchor="middle">
                  {n}
                </text>
              </g>
              <text className="ts-t-name" x="918" y={y - 1}>
                {name}
              </text>
              <text className="ts-t-sub" x="918" y={y + 13}>
                {sub}
              </text>
            </g>
          );
        })}
      </g>

      <text className="ts-t-stream" x="20" y="636">
        capture station · axonometric · not to scale
      </text>
      <text className="ts-t-stream" x="1220" y="636" textAnchor="end">
        plate I · rev 0.1
      </text>
    </svg>
  );
}

/* ============================================================
   2 — the living instrument schematic (wide)
   ============================================================ */

const NODES = [
  {
    id: 1,
    x: 100,
    y: 280,
    idx: "01",
    name: "HUMAN",
    lines: ["a person simply works", "no glove, nothing on the hand"],
    place: "below",
  },
  {
    id: 2,
    x: 300,
    y: 120,
    idx: "02",
    name: "WORLD-SIDE CAPTURE",
    lines: ["the bench, the tools and the", "objects do the measuring"],
    place: "above",
  },
  {
    id: 3,
    x: 300,
    y: 440,
    idx: "03",
    name: "FOREARM CAPTURE",
    lines: ["fingers read from the muscles", "that actually move them"],
    place: "below",
  },
  {
    id: 4,
    x: 545,
    y: 280,
    idx: "04",
    name: "PHYSICS REFEREE",
    lines: ["every channel must agree", "with one model, or is rejected"],
    place: "below",
  },
  {
    id: 5,
    x: 755,
    y: 280,
    idx: "05",
    name: "CONTACT RECORD",
    lines: ["where, how hard, which way,", "and exactly when"],
    place: "below",
  },
  {
    id: 6,
    x: 938,
    y: 280,
    idx: "06",
    name: "TOUCHSTONE",
    lines: ["calibration lineage and", "uncertainty, sealed on"],
    place: "below",
    seal: true,
  },
];

const FAN = [
  { y: 172, label: "FIVE-DIGIT" },
  { y: 243, label: "THREE-FINGER" },
  { y: 316, label: "PARALLEL JAW" },
  { y: 389, label: "SUCTION" },
];

const ROUTES = [
  { id: "a1", from: 1, to: 2, d: "M114 272 C 175 252 215 155 284 124", del: 0 },
  { id: "a2", from: 1, to: 3, d: "M114 288 C 175 308 215 405 284 436", del: 0.1 },
  {
    id: "b1",
    from: 2,
    to: 4,
    d: "M316 112 C 398 98 452 168 531 266",
    del: 0.5,
    text: "load · contact onset · object pose",
    off: "56%",
    flow: [5.4, 0],
  },
  {
    id: "b2",
    from: 2,
    to: 4,
    d: "M316 121 C 410 126 466 210 531 275",
    del: 0.6,
    flow: [4.6, 1.1],
  },
  {
    id: "b3",
    from: 2,
    to: 4,
    d: "M316 130 C 424 156 484 250 531 285",
    del: 0.7,
    flow: [6.2, 2.3],
  },
  {
    id: "b4",
    from: 3,
    to: 4,
    d: "M316 435 C 414 424 464 348 531 292",
    del: 0.8,
    text: "finger tension",
    off: "48%",
    flow: [5, 0.7],
  },
  {
    id: "c1",
    from: 4,
    to: 5,
    d: "M562 280 L 738 280",
    del: 1.4,
    text: "newtons at the contact",
    off: "50%",
    unit: true,
    flow: [2.6, 1.6],
  },
  { id: "c2", from: 5, to: 6, d: "M772 280 L 909 280", del: 1.7, flow: [2.4, 2.6] },
  { id: "d1", from: 6, to: 7, d: "M966 271 C 1006 258 1014 192 1056 174", del: 2.6 },
  {
    id: "d2",
    from: 6,
    to: 7,
    d: "M966 276 C 1010 268 1018 236 1056 243",
    del: 2.7,
    flow: [3, 3.4],
  },
  { id: "d3", from: 6, to: 7, d: "M966 284 C 1010 292 1018 310 1056 316", del: 2.8 },
  { id: "d4", from: 6, to: 7, d: "M966 289 C 1006 302 1014 370 1056 389", del: 2.9 },
];

function MapWide() {
  const [focus, setFocus] = useState(null);
  const [live, setLive] = useState(false);
  const hostRef = useRef(null);
  const measure = useMeasured();

  useEffect(() => {
    const el = hostRef.current;
    if (!el || !("IntersectionObserver" in window)) {
      setLive(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setLive(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const isLit = (r) => focus !== null && (r.from === focus || r.to === focus);
  const nodeOn = (id) =>
    focus === id || ROUTES.some((r) => isLit(r) && (r.from === id || r.to === id));

  return (
    <svg
      ref={hostRef}
      className={
        "ts-map ts-map-wide" +
        (live ? " is-live" : "") +
        (focus !== null ? " is-focus" : "")
      }
      viewBox="0 0 1240 560"
      role="img"
      aria-label="Touchstone system schematic: human demonstration, world-side and forearm capture, physics referee, contact record, certification, and compilation to a robot embodiment."
    >
      {/* corner ticks */}
      <g stroke="#cfccc3" strokeWidth="1">
        <path d="M14 34 L14 14 L34 14" fill="none" />
        <path d="M1206 14 L1226 14 L1226 34" fill="none" />
        <path d="M14 526 L14 546 L34 546" fill="none" />
        <path d="M1206 546 L1226 546 L1226 526" fill="none" />
      </g>

      {/* routes */}
      {ROUTES.map((r) => (
        <path
          key={r.id}
          id={"ts-" + r.id}
          ref={measure}
          className={"ts-route" + (isLit(r) ? " is-lit" : "")}
          d={r.d}
          style={{ "--d": r.del + "s" }}
        />
      ))}

      {/* channel names, engraved along their own routes */}
      {ROUTES.filter((r) => r.text).map((r) => (
        <text
          key={r.id + "-t"}
          className={r.unit ? "ts-t-unit" : "ts-t-stream"}
          dy="-6"
          textAnchor="middle"
        >
          <textPath href={"#ts-" + r.id} startOffset={r.off}>
            {r.text}
          </textPath>
        </text>
      ))}

      {/* force packets */}
      {ROUTES.filter((r) => r.flow).map((r) => (
        <rect
          key={r.id + "-p"}
          className="ts-pkt"
          x="-2.6"
          y="-2.6"
          width="5.2"
          height="5.2"
          style={{
            offsetPath: 'path("' + r.d + '")',
            "--dur": r.flow[0] + "s",
            "--pd": r.flow[1] + 3.2 + "s",
          }}
        />
      ))}

      {/* nodes */}
      {NODES.map((n) => {
        const on = nodeOn(n.id);
        const top = n.place === "above";
        const base = top ? n.y - 46 : n.y + 42;
        const yIdx = top ? base - 34 : base;
        const yName = top ? base - 17 : base + 17;
        const ySub = top ? base : base + 32;
        return (
          <g
            key={n.id}
            className={"ts-node" + (on ? " is-on" : "")}
            onMouseEnter={() => setFocus(n.id)}
            onMouseLeave={() => setFocus(null)}
            onFocus={() => setFocus(n.id)}
            onBlur={() => setFocus(null)}
            tabIndex={0}
          >
            {n.seal && (
              <circle className="ts-cert-ring" cx={n.x} cy={n.y} r="28" />
            )}
            <circle className="ts-node-ring" cx={n.x} cy={n.y} r="16" />
            <circle className="ts-node-core" cx={n.x} cy={n.y} r="3.6" />
            <text className="ts-t-idx" x={n.x} y={yIdx} textAnchor="middle">
              {n.idx}
            </text>
            <text className="ts-t-name" x={n.x} y={yName} textAnchor="middle">
              {n.name}
            </text>
            {n.lines.map((l, i) => (
              <text
                key={l}
                className="ts-t-sub"
                x={n.x}
                y={ySub + i * 13}
                textAnchor="middle"
              >
                {l}
              </text>
            ))}
          </g>
        );
      })}

      {/* embodiment fan */}
      <g
        className={"ts-node" + (nodeOn(7) ? " is-on" : "")}
        onMouseEnter={() => setFocus(7)}
        onMouseLeave={() => setFocus(null)}
        onFocus={() => setFocus(7)}
        onBlur={() => setFocus(null)}
        tabIndex={0}
      >
        {FAN.map((f) => (
          <g key={f.label}>
            <rect
              className="ts-node-ring"
              x={1056}
              y={f.y - 9}
              width="18"
              height="18"
            />
            <text className="ts-t-name" x={1086} y={f.y + 4}>
              {f.label}
            </text>
          </g>
        ))}
        <text className="ts-t-idx" x={1056} y={142}>
          07
        </text>
        <text className="ts-t-sub" x={1056} y={434}>
          one demonstration,
        </text>
        <text className="ts-t-sub" x={1056} y={447}>
          compiled per body,
        </text>
        <text className="ts-t-sub" x={1056} y={460}>
          with an honest verdict
        </text>
      </g>

      <text className="ts-t-stream" x="20" y="556">
        schematic · not to scale · rev 0.1
      </text>
      <text className="ts-t-stream" x="1220" y="556" textAnchor="end">
        hover a station to isolate its lineage
      </text>
    </svg>
  );
}

const TALL = [
  ["01", "HUMAN", "A person simply works. No glove, nothing on the hand.", null],
  [
    "02",
    "WORLD-SIDE CAPTURE",
    "The bench, the tools and the objects do the measuring.",
    "load · contact onset · object pose",
  ],
  [
    "03",
    "FOREARM CAPTURE",
    "The fingers are read from the muscles that actually move them.",
    "finger tension",
  ],
  [
    "04",
    "PHYSICS REFEREE",
    "Every channel must satisfy one model of the hand. Disagreement is rejected, not averaged.",
    "newtons at the contact",
  ],
  [
    "05",
    "CONTACT RECORD",
    "Where, how hard, in which direction, and exactly when.",
    null,
  ],
  [
    "06",
    "TOUCHSTONE",
    "Calibration lineage, drift and per-field uncertainty sealed onto the record.",
    "certified",
  ],
  [
    "07",
    "COMPILE TO A BODY",
    "One demonstration, recompiled per robot, with an honest verdict when it cannot be done.",
    null,
  ],
];

function MapTall() {
  return (
    <div className="ts-map-tall">
      <div className="ts-tall-rail">
        <span className="ts-tall-spark" aria-hidden="true" />
        <ol className="ts-tall-list">
          {TALL.map(([idx, name, sub, out]) => (
            <li key={idx}>
              <div className="ts-tall-idx">{idx}</div>
              <div className="ts-tall-name">{name}</div>
              <div className="ts-tall-sub">{sub}</div>
              {out && <div className="ts-tall-out">{out}</div>}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

/* ============================================================
   3 — spatial contact atlas
   ============================================================ */

const EMB = [
  {
    key: "human",
    name: "Human",
    meta: "five digits, the source demonstration",
    pts: [
      [216, 214, 186, 8.2, 1],
      [384, 228, 354, 7.4, 1],
      [382, 266, 356, 0, 0],
      [379, 302, 358, 0, 0],
      [378, 336, 359, 0, 0],
    ],
    tag: "Source",
    state: "pass",
    rows: [
      ["Contacts", "5"],
      ["Load-bearing", "2 of 5"],
      ["Resting, zero force", "3 of 5"],
    ],
    noteKey: "Reading",
    note: "Video sees five fingers and has to treat all five as meaningful. Measured force shows which two did the work.",
  },
  {
    key: "five",
    name: "Five-digit",
    meta: "anthropomorphic robot hand",
    pts: [
      [216, 216, 186, 8.0, 1],
      [384, 230, 354, 7.2, 1],
      [382, 268, 356, 0, 0],
      [379, 304, 358, 0, 0],
      [378, 338, 359, 0, 0],
    ],
    tag: "Feasible",
    state: "pass",
    rows: [
      ["Force closure", "satisfied"],
      ["Required twist", "within capacity"],
      ["Margin", "1.8\u00d7"],
    ],
    noteKey: "Reading",
    note: "Near-direct transfer. The job description barely has to be re-solved.",
  },
  {
    key: "three",
    name: "Three-finger",
    meta: "tripod grasp, the common case",
    pts: [
      [216, 224, 186, 9.4, 1],
      [384, 214, 354, 5.1, 1],
      [380, 290, 356, 4.7, 1],
      [379, 302, 358, 0, 0],
      [378, 336, 359, 0, 0],
    ],
    tag: "Feasible",
    state: "pass",
    rows: [
      ["Force closure", "satisfied on 3"],
      ["Required twist", "within capacity"],
      ["Margin", "1.4\u00d7"],
    ],
    noteKey: "Reading",
    note: "The two load-bearing contacts are kept and one is added for closure. The three resting fingers are dropped; they were never part of the job.",
  },
  {
    key: "jaw",
    name: "Parallel jaw",
    meta: "two opposed contacts",
    pts: [
      [217, 252, 186, 11.9, 1],
      [383, 252, 354, 11.9, 1],
      [380, 290, 356, 0, 0],
      [379, 302, 358, 0, 0],
      [378, 336, 359, 0, 0],
    ],
    tag: "Cannot execute",
    state: "fail",
    rows: [
      ["Force closure", "satisfied"],
      ["Required twist", "exceeds capacity"],
      ["Shortfall", "0.6\u00d7"],
    ],
    noteKey: "Workaround",
    note: "Fixture the object and re-grip in two stages, or introduce a tool. The new plan is re-checked before it is offered.",
  },
];

const rad = (d) => (d * Math.PI) / 180;

function Atlas() {
  const [sel, setSel] = useState(1);
  const e = EMB[sel];
  const ghost = EMB[0].pts;

  return (
    <div className="ts-atlas">
      <div className="ts-seg-wrap">
        <div className="ts-seg" role="group" aria-label="Choose an embodiment">
          {EMB.map((m, i) => (
            <button
              key={m.key}
              type="button"
              aria-pressed={i === sel}
              onClick={() => setSel(i)}
            >
              {m.name}
            </button>
          ))}
        </div>
        <p className="ts-seg-cap">
          <span>compile target</span>
          {e.meta}
        </p>
      </div>

      <div className="ts-atlas-stage">
        <svg viewBox="0 0 640 476" role="img" aria-label="Contact atlas">
          <text className="ts-atlas-key" x="18" y="26">
            contact atlas — {e.name}
          </text>
          <text className="ts-atlas-key" x="622" y="26" textAnchor="end">
            arrow along the contact normal · length ∝ measured force
          </text>

          {/* the object */}
          <g>
            <ellipse className="ts-obj" cx="300" cy="150" rx="88" ry="24" />
            <ellipse
              className="ts-obj-hidden"
              cx="300"
              cy="150"
              rx="76"
              ry="19"
            />
            <path className="ts-obj" d="M212 150 L224 372" />
            <path className="ts-obj" d="M388 150 L376 372" />
            <path className="ts-obj" d="M224 372 Q300 398 376 372" />
            <path className="ts-obj-hidden" d="M224 372 Q300 346 376 372" />
          </g>

          {/* centreline, centre of mass, and the object callout */}
          <g stroke="#cfccc3">
            <line
              x1="300"
              y1="112"
              x2="300"
              y2="410"
              strokeDasharray="10 4 2 4"
              opacity="0.85"
            />
            <line x1="290" y1="268" x2="310" y2="268" />
            <line x1="300" y1="258" x2="300" y2="278" />
            <line x1="212" y1="152" x2="168" y2="110" />
          </g>
          <text className="ts-atlas-key" x="26" y="98">
            object · scanned mesh,
          </text>
          <text className="ts-atlas-key" x="26" y="112">
            known friction
          </text>

          {/* ghost of the human demonstration */}
          <g>
            {ghost.map(([x, y], i) => (
              <circle
                key={"g" + i}
                className="ts-ghost"
                cx={x}
                cy={y}
                r="6.5"
                opacity={sel === 0 ? 0 : 1}
              />
            ))}
          </g>

          {/* live contacts — positioned with SVG transforms, animated by CSS */}
          {e.pts.map(([x, y, a, mag, work], i) => {
            const len = mag * 5;
            const c = Math.cos(rad(a));
            const s = Math.sin(rad(a));
            const hx = x + c * len;
            const hy = y + s * len;
            const lx = x + c * (len + 14);
            const ly = y + s * (len + 14) + 3.4;
            return (
              <g key={"c" + i} className="ts-cpt">
                {work ? (
                  <>
                    <line
                      className="ts-vec"
                      vectorEffect="non-scaling-stroke"
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="0"
                      transform={`translate(${x} ${y}) rotate(${a}) scale(${Math.max(
                        len,
                        0.01
                      )} 1)`}
                    />
                    <polygon
                      className="ts-vec-head"
                      points="0,0 -7,3.2 -7,-3.2"
                      transform={`translate(${hx.toFixed(1)} ${hy.toFixed(
                        1
                      )}) rotate(${a})`}
                    />
                  </>
                ) : null}
                <circle
                  className={work ? "ts-cpt-dot" : "ts-cpt-rest"}
                  r={work ? 4.6 : 3.8}
                  transform={`translate(${x} ${y})`}
                />
                {work ? (
                  <text
                    className="ts-cpt-lbl"
                    textAnchor={c < 0 ? "end" : "start"}
                    transform={`translate(${lx.toFixed(1)} ${ly.toFixed(1)})`}
                  >
                    {mag.toFixed(1)} N
                  </text>
                ) : null}
              </g>
            );
          })}

          {/* key */}
          <g>
            <circle className="ts-ghost" cx="26" cy="440" r="6" />
            <text className="ts-atlas-key" x="42" y="444">
              source demonstration
            </text>
            <circle className="ts-cpt-dot" cx="230" cy="440" r="4.6" />
            <text className="ts-atlas-key" x="246" y="444">
              load-bearing
            </text>
            <circle className="ts-cpt-rest" cx="392" cy="440" r="3.8" />
            <text className="ts-atlas-key" x="408" y="444">
              resting · zero force
            </text>
          </g>
        </svg>
      </div>

      <div className="ts-readout">
        <div className="ts-verdict-line">
          <span className="ts-verdict-lbl">Verdict</span>
          <strong className={"ts-verdict-word " + e.state}>{e.tag}</strong>
        </div>

        <dl className="ts-rows">
          {e.rows.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <i className="ts-lead" aria-hidden="true" />
              <dd>{v}</dd>
            </div>
          ))}
        </dl>

        <p className="ts-hang">
          <span>{e.noteKey}</span>
          {e.note}
        </p>
      </div>
    </div>
  );
}

/* ============================================================
   page
   ============================================================ */

export default function Touchstone() {
  const root = useReveal();
  const [coarse, setCoarse] = useState(false);

  useEffect(() => {
    setCoarse(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  return (
    <main className={"ts" + (coarse ? " coarse" : "")} ref={root}>
      <CustomCursor />
      <div className="ts-bar">
        <Link className="ts-bar-mark" href="/">
          <span className="ts-brk">[</span>physcript<span className="ts-brk">]</span>
        </Link>
        <div className="ts-bar-mid">
          <b>TOUCHSTONE</b>
          <span>sheet 01 · system overview</span>
        </div>
        <div className="ts-bar-right">
          <Link href="/touchstone">the system schematic →</Link>
          <Link href="/">← back</Link>
          <a href="mailto:pranav@physcri.pt">contact</a>
        </div>
      </div>

      {/* ---------------- masthead ---------------- */}
      <header className="ts-wrap ts-mast">
        <div className="ts-rise">
          <div className="ts-eyebrow">
            MVP-0 · TOUCHSTONE v0.1 · IN PROGRESS
          </div>
          <h1 className="ts-mast-title">Touchstone</h1>
          <div className="ts-mast-sub">
            <span>the force layer for physical AI</span>
            <span>measured · certified · portable</span>
          </div>
        </div>

        <div className="ts-mast-grid ts-rise">
          <div>
            <p className="ts-lede">
              Robots learned to see from a billion photographs. Nothing, ever,
              recorded how hard a hand pressed.
            </p>
            <p className="ts-body" style={{ marginTop: 22 }}>
              Touchstone is an instrument, not a dataset vendor. A person works
              normally at a bench; the bench, the tools and the objects measure
              the contact; a band on the forearm reads the fingers from the
              muscles that move them. What comes out is not footage. It is{" "}
              <b>force in newtons at a known point on a known object at a known
              instant</b>, carrying a certificate that says how it was obtained
              and how far it can be trusted.
            </p>
            <p className="ts-body">
              And because it stores the job the object experienced rather than the motion a
              particular hand made, one demonstration can be
              recompiled onto a body that looks nothing like yours.
            </p>
          </div>

          <dl className="ts-spec">
            <div>
              <dt>measured</dt>
              <dd>newtons at the contact, not inferred from pixels</dd>
            </div>
            <div>
              <dt>natural</dt>
              <dd>nothing on the hand, so the grip stays uncorrupted</dd>
            </div>
            <div>
              <dt>portable</dt>
              <dd>one demonstration compiles to many robot bodies</dd>
            </div>
            <div>
              <dt>certified</dt>
              <dd>every number traceable back to a reference standard</dd>
            </div>
          </dl>
        </div>
      </header>

      {/* ---------------- 01 the blind spot ---------------- */}
      <section className="ts-wrap ts-sec">
        <div className="ts-sec-head ts-rise">
          <div className="ts-sec-num">01 — THE BLIND SPOT</div>
          <div>
            <h2 className="ts-h2">
              Force is invisible.
              <br />
              That is the entire problem.
            </h2>
            <p className="ts-body" style={{ marginTop: 20 }}>
              A frame of someone holding a cup and a frame of someone crushing
              it are the same picture — right up until the moment it is too
              late. Every manipulation failure that embarrasses robots today is
              a force failure: the crushed egg, the dropped glass, the connector
              that never seats. None of it is visible in video, so none of it is
              in the training data.
            </p>
          </div>
        </div>

        <div className="ts-frames ts-rise">
          <div className="ts-frame">
            <div className="ts-frame-cap">
              <span>frame 0412 · rgb</span>
              <span>held</span>
            </div>
            <Frame trace="M40 189 C 84 187 116 182 158 180 S 220 179 264 179" />
            <div className="ts-frame-verdict">
              <span>peak normal force</span>
              <b>2.4 N</b>
            </div>
          </div>
          <div className="ts-frame">
            <div className="ts-frame-cap">
              <span>frame 0412 · rgb</span>
              <span>crushed</span>
            </div>
            <Frame
              crush
              trace="M40 189 C 84 180 112 158 152 141 S 218 124 264 118"
            />
            <div className="ts-frame-verdict">
              <span>peak normal force</span>
              <b>41.6 N</b>
            </div>
          </div>
        </div>

        <p className="ts-frames-foot ts-rise">
          Identical pixels. Seventeen times the force. Only one of these is a
          demonstration worth learning from, and nothing in the image says which.
        </p>
      </section>

      <hr className="ts-hair" />

      {/* ---------------- 02 the map ---------------- */}
      <section className="ts-wrap ts-sec">
        <div className="ts-sec-head ts-rise">
          <div className="ts-sec-num">02 — THE INSTRUMENT</div>
          <div>
            <h2 className="ts-h2">One pass, end to end.</h2>
            <p className="ts-body" style={{ marginTop: 20 }}>
              The whole system is one idea carried out carefully:{" "}
              <b>do not instrument the human, and do not instrument the robot.
              Instrument the world.</b>{" "}
              The table, the tools and the objects already touch everything that
              matters, and a band on the forearm covers the one thing they
              cannot see: what the fingers are doing while the object hides
              them.
            </p>
          </div>
        </div>

        <div className="ts-map-shell ts-rise">
          <div className="ts-map-meta">
            <span>Touchstone v0.1 — system schematic</span>
            <span>rev 0.1 · sheet 01</span>
          </div>
          <MapWide />
          <MapTall />
        </div>

        <ul className="ts-list ts-rise" style={{ marginTop: 40 }}>
          <li>
            <span>02 · the bench</span>
            <span>
              The work surface, the hand tools and a set of prepared objects
              each report what is happening to them. One channel is exact but
              slow, another is fast but relative; together they pin down both
              how hard and precisely when. Everything is timestamped against a
              common reference, because unsynchronised measurement is not
              measurement.
            </span>
          </li>
          <li>
            <span>03 · the band</span>
            <span>
              Fingers contain almost no muscle. The muscles that drive them sit
              in the forearm, out of the way of whatever is being held, which
              is exactly why we read them there.
            </span>
          </li>
          <li>
            <span>04 · the referee</span>
            <span>
              Nothing is averaged. Each channel is required to be consistent
              with a single physical model of the hand, and a reading that
              cannot be reconciled is flagged and set aside rather than blended
              into the result. Sensors that begin to drift are caught by this,
              not discovered months later.
            </span>
          </li>
          <li>
            <span>06 · the seal</span>
            <span>
              A record only counts if someone else can trust it. Every one
              carries its calibration lineage, when it was last verified, how far
              it has drifted, and, field by field, whether a number was
              measured, distilled, inferred or simulated.
            </span>
          </li>
        </ul>
      </section>

      <hr className="ts-hair" />

      {/* ---------------- 03 plates ---------------- */}
      <section className="ts-wrap ts-sec">
        <div className="ts-sec-head ts-rise">
          <div className="ts-sec-num">03 — THE HARDWARE</div>
          <div>
            <h2 className="ts-h2">Cheap on purpose.</h2>
            <p className="ts-body" style={{ marginTop: 20 }}>
              The industry collects contact data by buying a robot that costs as
              much as a car, bolting delicate sensors to it, and paying someone
              to drive it with a joystick. It is slow, it is fragile, and the
              data it produces fits exactly one robot. A Touchstone station is
              built from parts you could put on a credit card, and the person
              using it needs no training. They have been an expert at
              manipulation since they were one year old.
            </p>
          </div>
        </div>

        <div className="ts-fig-shell ts-rise">
          <div className="ts-map-meta">
            <span>Plate I — capture station, one bench</span>
            <span>drawn · rev 0.1</span>
          </div>
          <Bench />
        </div>

        <div className="ts-plate ts-rise" style={{ marginTop: 56 }}>
          <div>
            <div className="ts-eyebrow">02 · world-side capture</div>
            <h3 className="ts-h2" style={{ fontSize: "clamp(24px,3vw,36px)" }}>
              The table does the measuring.
            </h3>
            <p className="ts-body" style={{ marginTop: 16 }}>
              When you lift a mug off the surface, the surface watches the
              weight leave it, which is precisely the moment your grip takes over. The tool in your hand knows how hard you are pushing while
              you are actually working. The object itself can report how hard it
              is being squeezed. Cameras give every measured force a precise
              address in three dimensions.
            </p>
          </div>
          <div>
            <p className="ts-body">
              None of it touches the demonstrator. That is the point: the
              instant you put a sensor on a fingertip, you have changed the grip
              you were trying to record. Every glove-based approach in this market
              pays that price without saying so.
            </p>
            <div className="ts-pull">
              Let the world do the measuring, and the human just works.
            </div>
          </div>
        </div>

        <div className="ts-plate-pair ts-rise" style={{ marginTop: 92 }}>
          <figure>
            <img
              src="/touchstone/plate-band.webp"
              alt="Forearm capture band: a fabric band carrying two rings of sensing modules and a small controller."
              width="1500"
              height="1125"
              loading="lazy"
            />
            <figcaption>
              <span>plate II</span>
              <span>band, open</span>
            </figcaption>
          </figure>
          <figure>
            <img
              src="/touchstone/plate-sleeve.webp"
              alt="The band closed around a forearm-sized form, sensing modules seated along two rings."
              width="1500"
              height="1125"
              loading="lazy"
            />
            <figcaption>
              <span>plate III</span>
              <span>band, seated on the forearm</span>
            </figcaption>
          </figure>
        </div>

        <div className="ts-plate ts-rise" style={{ marginTop: 46 }}>
          <div>
            <div className="ts-eyebrow">03 · forearm capture</div>
            <h3 className="ts-h2" style={{ fontSize: "clamp(24px,3vw,36px)" }}>
              Read the fingers where nothing can hide them.
            </h3>
            <p className="ts-body" style={{ marginTop: 16 }}>
              Your fingers are puppets. The muscles that pull them live in the
              forearm, connected by tendons, so the forearm knows what the hand
              is doing even when the hand is completely out of sight. Which
              matters, because the hand is most hidden exactly when force
              matters most: mid-grip, wrapped around the object.
            </p>
          </div>
          <div>
            <p className="ts-body">
              Most wearables in this space chase the faint electrical signature
              of muscle activity. We deliberately did not. The band is built on
              the signals that predict finger <i>force</i> best and identify{" "}
              <i>which</i> finger best, and it is calibrated by the bench itself,
              in seconds, against forces the bench has already measured.
            </p>
            <div className="ts-pull">
              When the object hides the hand, we already know the fingertips are
              on its surface. Occlusion stops adding unknowns and starts
              removing them.
            </div>
          </div>
        </div>
      </section>

      <hr className="ts-hair" />

      {/* ---------------- 04 the atlas ---------------- */}
      <section className="ts-wrap ts-sec">
        <div className="ts-sec-head ts-rise">
          <div className="ts-sec-num">04 — THE TRANSFER</div>
          <div>
            <h2 className="ts-h2">
              Don&rsquo;t copy the dance.
              <br />
              Copy the job.
            </h2>
            <p className="ts-body" style={{ marginTop: 20 }}>
              Your hand has twenty-odd joints and soft skin; a common gripper
              has two stiff fingers. Copying finger motion between them is
              hopeless. This is the embodiment gap, and it is why most human
              demonstration data dies with the body that recorded it.
            </p>
            <p className="ts-body">
              The mug does not care that you used five fingers. It cares that it
              was pressed <b>at these points, this hard, in these directions,
              over this time</b>. Store that, and you have written the job
              description rather than the choreography. And a job description
              can be handed to any hand, claw or jaw. Select one below.
            </p>
          </div>
        </div>

        <div className="ts-rise">
          <Atlas />
        </div>

        <ul className="ts-list ts-rise" style={{ marginTop: 48 }}>
          <li>
            <span>workers vs resters</span>
            <span>
              A camera-only system sees five fingers on the cup and must assume
              all five matter. Measured force shows that two carried the load
              and three were along for the ride. Knowing which is which is the
              difference between a transferable plan and a guess.
            </span>
          </li>
          <li>
            <span>the tripod fact</span>
            <span>
              A camera tripod stands on three legs. With friction, roughly three
              well-chosen contacts hold most objects steady, which is exactly
              why a three-finger robot can do almost anything a hand can, if it
              presses the right places by the right amount.
            </span>
          </li>
          <li>
            <span>an honest no</span>
            <span>
              When no arrangement of a given robot&rsquo;s fingers can reproduce
              the measured job, we say so and say why, then propose the
              workaround a person would use, whether that is fixturing it,
              re-gripping it or picking up a tool, then re-checks that plan
              before offering it. A trustworthy
              refusal is worth more than a confident failure.
            </span>
          </li>
        </ul>
      </section>

      <hr className="ts-hair" />

      {/* ---------------- 05 certificate ---------------- */}
      <section className="ts-wrap ts-sec">
        <div className="ts-sec-head ts-rise">
          <div className="ts-sec-num">05 — THE CERTIFICATE</div>
          <div>
            <h2 className="ts-h2">Why the name.</h2>
            <p className="ts-body" style={{ marginTop: 20 }}>
              You trust your kitchen scale because its calibration traces, link
              by link, back to a reference standard. That discipline is called
              metrology, and it is centuries old. It has simply never been
              applied to robot training data. A hundred labs each holding a
              hundred hours in their own format, with their own sensors and no
              way to prove whose numbers are right, is a hundred small piles.
              Every leap in modern AI came from one large pile.
            </p>
            <p className="ts-body">
              So every record leaves the station with a passport, and stations
              are re-verified against a reference on a schedule. Drift gets
              caught, not discovered. This is the part that makes data from
              somebody else&rsquo;s bench safe to train on, and it is the layer nobody in this market has
              built.
            </p>
          </div>
        </div>

        <div className="ts-cert ts-rise">
          <div className="ts-doc">
            <div className="ts-doc-head">
              <div>
                <h3>TOUCHSTONE RECORD</h3>
                <p>TS-0114-0296 · specimen</p>
              </div>
              <svg className="ts-seal" width="66" height="66" viewBox="0 0 66 66">
                <circle cx="33" cy="33" r="30" />
                <circle cx="33" cy="33" r="25" />
                <text x="33" y="30" textAnchor="middle">
                  CERTIFIED
                </text>
                <text x="33" y="41" textAnchor="middle">
                  v0.1
                </text>
              </svg>
            </div>
            <dl className="ts-doc-rows">
              {[
                ["Station", "ST-004, field class", "c", "certified"],
                ["Lineage", "ST-004 \u2192 REF-01 \u2192 national standard", "c", "traceable"],
                ["Last verification", "6 h ago, pass", "c", "logged"],
                ["Drift since", "within band", "c", "logged"],
                ["Contact points", "5 on the scanned surface", "m", "measured"],
                ["Normal force", null, "m", "measured"],
                ["Tangential force", null, "m", "measured"],
                ["Contact onset", "sub-millisecond, synchronised", "m", "measured"],
                ["Finger tension", null, "", "distilled"],
                ["Friction coefficient", "from observed slip at known load", "", "inferred"],
                ["Object pose", "6-DoF against scanned mesh", "m", "measured"],
              ].map(([k, v, cls, prov]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <i className="ts-lead" aria-hidden="true" />
                  <dd>
                    {v || (
                      <span className="ts-redact">
                        {"0".repeat(k.length > 13 ? 10 : 8)}
                      </span>
                    )}
                  </dd>
                  <span className={"ts-prov " + cls}>
                    <i aria-hidden="true" />
                    {prov}
                  </span>
                </div>
              ))}
            </dl>
            <div className="ts-doc-foot">
              <span>Values withheld on this sheet</span>
              <span>Full schema under NDA</span>
            </div>
          </div>

          <div>
            <div className="ts-plate-img">
              <img
                src="/touchstone/plate-force.webp"
                alt="Reference force plate with a one-kilogram calibration mass resting on it."
                width="1500"
                height="1125"
                loading="lazy"
              />
              <div className="ts-plate-cap">
                <span>plate IV — reference station</span>
                <span>concept render</span>
              </div>
            </div>
            <ul className="ts-list" style={{ marginTop: 26, borderTop: 0 }}>
              <li>
                <span>the reference</span>
                <span>
                  One station is the reference kilogram of the network. Every
                  other station&rsquo;s numbers are only as good as their chain
                  back to it, and that chain is written down.
                </span>
              </li>
              <li>
                <span>the ritual</span>
                <span>
                  Each station periodically performs a short scripted routine on
                  a standard object. If its answers stop matching what physics
                  says they must be, the station is quarantined until it is
                  re-certified.
                </span>
              </li>
              <li>
                <span>honest labels</span>
                <span>
                  Measured, distilled, inferred, simulated. A user always knows
                  which they are looking at. Honest uncertainty beats confident
                  nonsense, and it is the only basis on which two labs will ever
                  pool anything.
                </span>
              </li>
              <li>
                <span>it improves backwards</span>
                <span>
                  Every accidental slip at a known load teaches the network how
                  slippery that material really is. Old recordings get more
                  accurate as the library grows.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <hr className="ts-hair" />

      {/* ---------------- 06 why better ---------------- */}
      <section className="ts-wrap ts-sec">
        <div className="ts-sec-head ts-rise">
          <div className="ts-sec-num">06 — THE COMPARISON</div>
          <div>
            <h2 className="ts-h2">What everyone else is missing.</h2>
            <p className="ts-body" style={{ marginTop: 20 }}>
              Human demonstration data became a procurement category the moment
              the frontier labs proved it transfers to robots at scale. Every
              source they can buy today is force-blind, force-corrupted, or
              locked to the robot that recorded it.
            </p>
          </div>
        </div>

        <table className="ts-table ts-rise">
          <thead>
            <tr>
              <th />
              <th>human video</th>
              <th>teleoperation</th>
              <th>glove / mocap</th>
              <th className="us">touchstone</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["uncorrupted natural grip", "full", "none", "none", "full"],
              ["force in newtons at the contact", "none", "part", "part", "full"],
              ["contact onset and texture", "none", "part", "part", "full"],
              ["portable to other robot bodies", "part", "none", "part", "full"],
              ["traceable to a reference", "none", "part", "none", "full"],
              ["cost per demonstration hour", "part", "none", "part", "full"],
            ].map((row) => (
              <tr key={row[0]}>
                <th scope="row">{row[0]}</th>
                {row.slice(1).map((v, i) => (
                  <td key={i} className={i === 3 ? "us" : undefined}>
                    <span className={"ts-mark " + (v === "full" ? "full" : "")}>
                      {v === "full" ? "●" : v === "part" ? "◐" : "○"}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <div className="ts-anchor ts-rise">
          <div>
            <b>$118</b>
            <span>per hour · teleoperation</span>
            <p>
              The published anchor for contact-rich robot data, and it cannot
              be offshored, because latency destroys precision exactly where
              precision matters.
            </p>
          </div>
          <div>
            <b>$30&ndash;60</b>
            <span>per hour · our target price</span>
            <p>
              Natural-hand capture has no latency budget, so it can be collected
              anywhere. The force channel is included, not extra.
            </p>
          </div>
          <div>
            <b>1 → n</b>
            <span>bodies per demonstration</span>
            <p>
              Because we store the job rather than the motion, an hour collected
              today still compiles onto the hand that ships next year.
            </p>
          </div>
        </div>
      </section>

      {/* ---------------- closing ---------------- */}
      <section className="ts-wrap">
        <div className="ts-close ts-rise">
          <div className="ts-sec-num" style={{ display: "inline-block" }}>
            07 — WHAT THIS SHEET DOES NOT CONTAIN
          </div>
          <h2 className="ts-h2" style={{ maxWidth: "16em" }}>
            This is the shape of the instrument, not its internals.
          </h2>
          <p className="ts-body" style={{ marginTop: 22 }}>
            Sensor topology, the estimator that turns the forearm signal into
            per-finger newtons, the certification mathematics, the contact-space
            format and the compiler are documented — elsewhere. If you are a lab
            that needs force-rich manipulation data, a builder who wants to
            certify a rig, or an investor who would like to see the falsification
            plan and the numbers behind it, the technical dossier is available
            under NDA.
          </p>
          <a className="ts-cta" href="mailto:pranav@physcri.pt">
            request the dossier <span aria-hidden="true">→</span>
          </a>
        </div>

        <Link href="/touchstone" className="ts-next ts-rise">
          <span>Prefer a diagram?</span>
          <strong>The system schematic — one interactive sheet →</strong>
        </Link>

        <dl className="ts-title-block ts-rise">
          <div>
            <dt>sheet</dt>
            <dd>01 / system overview</dd>
          </div>
          <div>
            <dt>revision</dt>
            <dd>0.1</dd>
          </div>
          <div>
            <dt>stage</dt>
            <dd>MVP-0 · in progress</dd>
          </div>
          <div>
            <dt>drawn by</dt>
            <dd>Physcript</dd>
          </div>
          <div>
            <dt>status</dt>
            <dd>concept</dd>
          </div>
        </dl>

        <div className="ts-end">
          <span>[physcript] · the force layer for physical AI</span>
          <span>
            <Link href="/">home</Link> · <a href="mailto:pranav@physcri.pt">
              pranav@physcri.pt
            </a>
          </span>
        </div>
      </section>
    </main>
  );
}
