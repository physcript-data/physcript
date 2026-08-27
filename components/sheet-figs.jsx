"use client";

/* ============================================================
   THE LONG SHEET — figures
   Every drawing on sheet 02. Kept apart from the prose so the
   narrative reads as narrative and the instruments read as
   instruments.
   ============================================================ */

import { useState } from "react";
import { Ticks, useMeasured } from "./sheet-kit";

/* ============================================================
   FIG 1 — five blocks, five fields
   A matrix, not a layout. Which sensing category contributes to
   which column of the Record, and in what role.
   ============================================================ */

const BLOCKS = [
  ["b1", "Electrode array", "myoelectric drive · co-contraction", "v0"],
  ["b2", "Ultrasound array", "muscle deformation · tissue stiffness", "v1 · v3"],
  ["b3", "Tapper + accelerometers", "tendon tension · contact timing", "v0 · v2"],
  ["b4", "IMU cluster", "arm and wrist kinematics", "v0"],
  ["b5", "FMG ring", "how the sleeve was donned", "v0"],
  ["art", "Calibration artifact", "the reference, in newtons", "v0"],
  ["cam", "Egocentric camera", "customer-supplied", "v0"],
];

const RFIELDS = [
  ["kin", "Kinematics", "200 Hz"],
  ["wr", "Wrench", "200 Hz"],
  ["imp", "Impedance", "50 Hz"],
  ["evt", "Contact events", "±1 ms"],
  ["unc", "Uncertainty", "per sample"],
];

const LINKS = [
  ["b1", "wr", "primary"],
  ["b1", "imp", "primary"],
  ["b2", "wr", "support"],
  ["b2", "imp", "primary"],
  ["b3", "wr", "primary"],
  ["b3", "evt", "primary"],
  ["b4", "kin", "primary"],
  ["b5", "unc", "check"],
  ["art", "wr", "reference"],
  ["art", "imp", "reference"],
  ["art", "unc", "reference"],
  ["cam", "kin", "support"],
];

const BX = 40;
const BW = 268;
const FX = 690;
const FW = 268;

const bY = (i) => 58 + i * 58;
const fY = (i) => 110 + i * 58;

export function Matrix() {
  const measure = useMeasured();
  const [hot, setHot] = useState(null);

  const isLit = (id) => {
    if (!hot) return true;
    if (hot === id) return true;
    return LINKS.some(
      ([b, f]) => (b === hot && f === id) || (f === hot && b === id)
    );
  };

  return (
    <figure className="ls-fig rise">
      <svg
        viewBox="0 0 1000 500"
        className="ls-svg"
        role="img"
        aria-label="A matrix linking seven capture elements on the left to the five fields of the Record on the right, showing which is a primary source, which contributes, which supplies the traceable reference, and which is only a cross-check."
      >
        <Ticks w={1000} h={500} m={16} l={18} />
        <text className="ls-fig-id" x="18" y="34">
          fig. 1 · what feeds what
        </text>
        <text className="ls-fig-id" x="982" y="34" textAnchor="end">
          categories only · no layout, no components
        </text>

        {LINKS.map(([b, f, role]) => {
          const i = BLOCKS.findIndex((x) => x[0] === b);
          const j = RFIELDS.findIndex((x) => x[0] === f);
          const y1 = bY(i) + 22;
          const y2 = fY(j) + 22;
          const d = `M${BX + BW} ${y1} C${BX + BW + 150} ${y1}, ${
            FX - 150
          } ${y2}, ${FX} ${y2}`;
          const lit = !hot || hot === b || hot === f;
          return (
            <path
              key={b + f}
              ref={measure}
              className={"ls-link is-" + role + (lit ? "" : " is-dim")}
              d={d}
            />
          );
        })}

        {BLOCKS.map(([id, n, q, ships], i) => (
          <g
            key={id}
            className={"ls-cell" + (isLit(id) ? "" : " is-dim")}
            onMouseEnter={() => setHot(id)}
            onMouseLeave={() => setHot(null)}
          >
            <rect
              className={"ls-cell-box" + (id === "art" ? " is-std" : "")}
              x={BX}
              y={bY(i)}
              width={BW}
              height={44}
              rx="2"
            />
            <text className="ls-cell-n" x={BX + 14} y={bY(i) + 20}>
              {n}
            </text>
            <text className="ls-cell-q" x={BX + 14} y={bY(i) + 34}>
              {q}
            </text>
            <text
              className="ls-cell-s"
              x={BX + BW - 14}
              y={bY(i) + 20}
              textAnchor="end"
            >
              {ships}
            </text>
          </g>
        ))}

        {RFIELDS.map(([id, n, r], i) => (
          <g
            key={id}
            className={"ls-cell" + (isLit(id) ? "" : " is-dim")}
            onMouseEnter={() => setHot(id)}
            onMouseLeave={() => setHot(null)}
          >
            <rect
              className="ls-cell-box is-field"
              x={FX}
              y={fY(i)}
              width={FW}
              height={44}
              rx="2"
            />
            <text className="ls-cell-n" x={FX + 14} y={fY(i) + 27}>
              {n}
            </text>
            <text
              className="ls-cell-s"
              x={FX + FW - 14}
              y={fY(i) + 27}
              textAnchor="end"
            >
              {r}
            </text>
          </g>
        ))}

        <g className="ls-legend">
          {[
            ["primary", "primary source"],
            ["support", "contributes"],
            ["reference", "supplies the reference"],
            ["check", "cross-check only"],
          ].map(([k, lab], i) => (
            <g key={k} transform={`translate(${40 + i * 218} 478)`}>
              <line className={"ls-link is-" + k} x1="0" y1="-4" x2="26" y2="-4" />
              <text x="34" y="0">
                {lab}
              </text>
            </g>
          ))}
        </g>
      </svg>
      <figcaption className="ls-cap">
        Hover a row to isolate it. Note what the FMG ring is <em>not</em> wired
        to: it is capable of more, and it is deliberately kept out of the force
        path because its reading depends on how tightly the sleeve was put on.
        That dependence is a defect in most designs. Here it is the function.
      </figcaption>
    </figure>
  );
}

/* ============================================================
   FIG 2 — the traceability chain
   ============================================================ */

const CHAIN = [
  [
    "Certified reference",
    "external standard",
    "a force reference with a certificate we did not write",
  ],
  [
    "The artifact",
    "serialised · re-verified",
    "a handheld transfer standard that ships with every sleeve",
  ],
  [
    "Per-session check",
    "≈4 min per wearing",
    "8–10 minutes once, then a short check each time the sleeve goes back on",
  ],
  [
    "The Record",
    "an interval per sample",
    "the number, and how far it can be trusted, written together",
  ],
  [
    "The robot",
    "numbers with a provenance",
    "and able to refuse a grasp its body cannot actually make",
  ],
];

export function Chain() {
  const measure = useMeasured();
  const xs = [108, 306, 504, 702, 900];
  return (
    <figure className="ls-fig rise">
      <svg
        viewBox="0 0 1000 300"
        className="ls-svg"
        role="img"
        aria-label="A five-link traceability chain running from an external certified reference, through the handheld artifact and the per-session check, into the Record, and finally into the robot."
      >
        <Ticks w={1000} h={300} m={16} l={18} />
        <text className="ls-fig-id" x="18" y="34">
          fig. 2 · the chain of custody for a newton
        </text>

        <path
          ref={measure}
          className="ls-thread"
          d={`M${xs[0]} 150 L${xs[4]} 150`}
        />

        {CHAIN.map(([n, meta, sub], i) => (
          <g key={n} className="ls-seal" style={{ "--d": i * 0.12 + "s" }}>
            <circle className="ls-seal-o" cx={xs[i]} cy="150" r="27" />
            <circle className="ls-seal-i" cx={xs[i]} cy="150" r="22" />
            <text className="ls-seal-num" x={xs[i]} y="155" textAnchor="middle">
              {String(i + 1).padStart(2, "0")}
            </text>
            <text className="ls-seal-n" x={xs[i]} y="104" textAnchor="middle">
              {n}
            </text>
            <text className="ls-seal-m" x={xs[i]} y="90" textAnchor="middle">
              {meta}
            </text>
            <foreignObject x={xs[i] - 92} y="192" width="184" height="76">
              <p className="ls-seal-s" xmlns="http://www.w3.org/1999/xhtml">
                {sub}
              </p>
            </foreignObject>
          </g>
        ))}
      </svg>
      <figcaption className="ls-cap">
        Cut any link and the sheet below it is still full of numbers — they
        simply stop meaning anything in particular. What you have then is
        relative muscle activity in arbitrary units, which is what everyone
        already has. Calibration does not remove error. It converts an{" "}
        <em>unknown</em> error into a <em>stated</em> one, and that is the whole
        of the promise.
      </figcaption>
    </figure>
  );
}

/* ============================================================
   FIG 3 — the compiler
   ============================================================ */

export function Pipeline() {
  return (
    <svg
      viewBox="0 0 1000 116"
      className="ls-pipe"
      role="img"
      aria-label="A compiler pipeline: sleeve streams as the source language, four front-end layers, the Record as the intermediate representation, two back-end layers, and any robot body as the target."
    >
      {[
        [16, 186, "source", "sleeve streams"],
        [230, 176, "front end", "L1 – L4"],
        [430, 160, "the IR", "L5 · the Record"],
        [618, 176, "back end", "L6 – L7"],
        [822, 162, "target", "any robot body"],
      ].map(([x, w, k, v], i) => (
        <g key={k}>
          <rect
            className={"ls-pipe-box" + (i === 2 ? " is-ir" : "")}
            x={x}
            y="30"
            width={w}
            height="56"
            rx="2"
          />
          <text className="ls-pipe-k" x={x + 14} y="52">
            {k}
          </text>
          <text className="ls-pipe-v" x={x + 14} y="72">
            {v}
          </text>
        </g>
      ))}
      {[202, 406, 594, 798].map((x) => (
        <g key={x} className="ls-pipe-arrow">
          <line x1={x} y1="58" x2={x + 16} y2="58" />
          <path d="M0 0 L-7 -3.5 L-7 3.5 Z" transform={`translate(${x + 18} 58)`} />
        </g>
      ))}
      <text className="ls-fig-id" x="16" y="108">
        whoever defines the intermediate representation owns the ecosystem
      </text>
    </svg>
  );
}

const LAYERS = [
  {
    id: "L1",
    n: "Physics-anchored fusion",
    nov: 9,
    risk: 3,
    pos: "flag planted",
    flag: true,
    p: "Our channels are not peers. One of them is grounded in direct physics; the others are statistical estimators. So the grounded one continuously corrects the rest, and calibration does not go stale during a shift.",
    hold: "The loop itself, and the window it exploits, are held back pre-term-sheet.",
  },
  {
    id: "L2",
    n: "Conformal force intervals",
    nov: 8,
    risk: 2,
    pos: "flag planted",
    flag: true,
    p: "Turns a promise of quality into a number you can audit: an interval with a coverage level, from a method with distribution-free guarantees and no priors to argue about.",
    hold: "Validated against public data before any of our own hardware existed — see the evidence below.",
  },
  {
    id: "L3",
    n: "Hybrid physics-ML estimator",
    nov: 4,
    risk: 1,
    pos: "adopt",
    p: "Constrain the estimator with musculoskeletal forward dynamics so its outputs are physically realisable rather than merely plausible.",
    hold: "Good engineering, mature literature, not a breakthrough. This layer is not where the moat lives.",
  },
  {
    id: "L4",
    n: "Missing-modality robustness",
    nov: 3,
    risk: 1,
    pos: "adopt",
    p: "One software stack serves every hardware tier, because customers will own different configurations and nobody wants a model per SKU.",
    hold: "Commercially essential rather than novel. Without it the staged roadmap multiplies engineering cost by five.",
  },
  {
    id: "L5",
    n: "The Record — the IR",
    nov: 8,
    risk: 2,
    pos: "standards play",
    flag: true,
    ir: true,
    p: "The format itself is a layer. Sleeve streams are the source language, robot actions the target, and this sits in between.",
    hold: "To be published openly. The value is not the format; it is being the only party who can fill it correctly.",
  },
  {
    id: "L6",
    n: "Uncertainty-weighted learning",
    nov: 7,
    risk: 2,
    pos: "new — because the data is",
    p: "Error bars only earn their keep if they improve training. Downweight the uncertain samples, or hand the interval width to the model as a feature.",
    hold: "Every existing method weights by demonstrator suboptimality. None weights by sensor-derived measurement uncertainty, because no dataset has ever carried it.",
  },
  {
    id: "L7",
    n: "Privileged distillation",
    nov: 3,
    risk: 1,
    pos: "adopt — and it is the sales argument",
    p: "Train with the sleeve's rich channels as privileged information; deploy on a robot that has a camera and nothing else.",
    hold: "One sleeve-collected dataset upgrades an entire fleet of force-blind robots, permanently, with no hardware change on the robots.",
  },
];

export function Layers() {
  return (
    <ol className="ls-layers">
      {LAYERS.map((l, i) => (
        <li
          key={l.id}
          className={"ls-layer rise" + (l.ir ? " is-ir" : "")}
          style={{ "--rd": i * 0.05 + "s" }}
        >
          <div className="ls-layer-head">
            <span className="ls-layer-id">{l.id}</span>
            <h3 className="ls-layer-n">{l.n}</h3>
            {l.flag && <span className="ls-flag">flag planted</span>}
          </div>
          <p className="ls-layer-p">{l.p}</p>
          <p className="ls-layer-hold">{l.hold}</p>
          <dl className="ls-bars">
            <div>
              <dt>novelty</dt>
              <dd>
                <i style={{ "--w": l.nov * 12 + "px" }} />
                <b>{l.nov}/10</b>
              </dd>
            </div>
            <div>
              <dt>risk</dt>
              <dd>
                <i className="is-risk" style={{ "--w": l.risk * 40 + "px" }} />
                <b>{["", "low", "medium", "high"][l.risk]}</b>
              </dd>
            </div>
            <div>
              <dt>position</dt>
              <dd>
                <b className="ls-pos">{l.pos}</b>
              </dd>
            </div>
          </dl>
        </li>
      ))}
    </ol>
  );
}

/* ============================================================
   FIG 4 — the pre-registration scorecard
   ============================================================ */

const PREREG = [
  {
    n: "Within-subject coverage",
    u: "%",
    dom: [50, 100],
    pred: [88.5, 91.5],
    obs: 90.3,
    hit: true,
    say: "nominal was 90. It landed on 90.",
  },
  {
    n: "Cross-subject coverage",
    u: "%",
    dom: [50, 100],
    pred: [72, 84],
    obs: 90.4,
    hit: false,
    say: "we predicted our own method would fail here. It did not. The claim is retired.",
  },
  {
    n: "Cross-subject accuracy",
    u: "R²",
    dom: [0, 0.8],
    pred: [0.35, 0.55],
    obs: 0.233,
    hit: false,
    say: "coverage held by widening intervals 1.77×. Accuracy did not.",
  },
  {
    n: "Unlabelled adaptation recovery",
    u: "%",
    dom: [0, 100],
    pred: [30, 60],
    obs: 54,
    hit: true,
    say: "no ground truth needed — the user just has to wear the thing and move.",
  },
  {
    n: "Reverse-session coverage",
    u: "%",
    dom: [50, 100],
    pred: [51.5, 67.5],
    obs: 60.8,
    hit: true,
    say: "run backwards, the collapse is the same. It is re-donning, not the second day.",
  },
  {
    n: "Recalibration gap",
    u: "pts",
    dom: [0, 50],
    pred: [18.8, 38.8],
    obs: 26.5,
    hit: true,
    say: "what a labelled recalibration buys back, in coverage points.",
  },
];

const AX0 = 480;
const AX1 = 944;

export function Scorecard() {
  const H = 66;
  const top = 74;
  return (
    <figure className="ls-fig rise">
      <svg
        viewBox={`0 0 1000 ${top + PREREG.length * H + 46}`}
        className="ls-svg"
        role="img"
        aria-label="Six pre-registered predictions shown as brackets, with the observed value as a dot. Four fell inside the predicted range; two did not."
      >
        <text className="ls-fig-id" x="18" y="34">
          fig. 4 · predicted before the data was touched · observed after
        </text>
        <text className="ls-fig-id" x="982" y="34" textAnchor="end">
          bracket = frozen prediction · dot = what happened
        </text>

        {PREREG.map((r, i) => {
          const y = top + i * H;
          const sx = (v) =>
            AX0 + ((v - r.dom[0]) / (r.dom[1] - r.dom[0])) * (AX1 - AX0);
          return (
            <g key={r.n} className={"ls-pr" + (r.hit ? " is-hit" : " is-miss")}>
              <text className="ls-pr-n" x="18" y={y + 4}>
                {r.n}
              </text>
              <text className="ls-pr-say" x="18" y={y + 20}>
                {r.say}
              </text>

              <line className="ls-pr-axis" x1={AX0} y1={y} x2={AX1} y2={y} />
              <text className="ls-pr-tick" x={AX0} y={y + 18}>
                {r.dom[0]}
              </text>
              <text className="ls-pr-tick" x={AX1} y={y + 18} textAnchor="end">
                {r.dom[1]} {r.u}
              </text>

              <g className="ls-pr-band">
                <line x1={sx(r.pred[0])} y1={y - 9} x2={sx(r.pred[0])} y2={y + 9} />
                <line x1={sx(r.pred[1])} y1={y - 9} x2={sx(r.pred[1])} y2={y + 9} />
                <line x1={sx(r.pred[0])} y1={y} x2={sx(r.pred[1])} y2={y} />
              </g>

              <circle className="ls-pr-dot" cx={sx(r.obs)} cy={y} r="5.5" />
              <text className="ls-pr-obs" x={sx(r.obs)} y={y - 14} textAnchor="middle">
                {r.obs}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption className="ls-cap">
        Two of these are our own predictions being wrong in public, and one of
        them is the prediction the earlier version of this company was built on.
        It was retired the day the data disagreed with it. Anyone still telling
        you cross-subject intervals silently under-cover is quoting a claim we
        withdrew.
      </figcaption>
    </figure>
  );
}

/* ============================================================
   FIG 5 — the collapse: what the model said against what was true
   ============================================================ */

export function Collapse() {
  const bar = (v, max, x, y, w, cls) => (
    <rect
      className={"ls-cbar " + cls}
      x={x}
      y={y}
      width={(v / max) * w}
      height="22"
    />
  );
  return (
    <figure className="ls-fig rise">
      <svg
        viewBox="0 0 1000 300"
        className="ls-svg"
        role="img"
        aria-label="Between day one and day two, with electrodes re-applied, coverage fell from 90.3 percent to 59.5 percent while the stated interval width stayed at 11.69 — the model's own uncertainty did not move while its errors exploded."
      >
        <text className="ls-fig-id" x="18" y="34">
          fig. 5 · take the sleeve off, put it back on tomorrow
        </text>

        <text className="ls-col-h" x="18" y="76">
          what was true — coverage against a nominal 90%
        </text>
        <line className="ls-nominal" x1="240" y1="88" x2="240" y2="166" />
        <text className="ls-nominal-lab" x="240" y="180" textAnchor="middle">
          nominal 90%
        </text>

        {bar(90.3, 100, 18, 92, 246, "is-good")}
        <text className="ls-bar-lab" x="276" y="108">
          90.3% · same day
        </text>
        {bar(59.5, 100, 18, 128, 246, "is-bad")}
        <text className="ls-bar-lab is-bad" x="276" y="144">
          59.5% · next day, electrodes re-applied
        </text>

        <text className="ls-col-h" x="18" y="204">
          what the model said — stated interval width, %MVC
        </text>
        {bar(11.69, 20, 18, 220, 246, "is-flat")}
        <text className="ls-bar-lab" x="176" y="236">
          11.69
        </text>
        {bar(11.69, 20, 18, 256, 246, "is-flat")}
        <text className="ls-bar-lab" x="176" y="272">
          11.69
        </text>
        <text className="ls-col-note" x="330" y="248">
          identical to two decimal places
        </text>
        <text className="ls-col-note" x="330" y="264">
          the errors exploded; the stated uncertainty did not move
        </text>
      </svg>
      <figcaption className="ls-cap">
        One subject received intervals labelled 90% that covered 17.2% of the
        time. This is the exact failure this company exists to sell against, and
        we found it in our own pipeline — which is the only reason we can claim
        to know it is there.
      </figcaption>
    </figure>
  );
}

/* ============================================================
   FIG 6 — the price band
   ============================================================ */

const LOG0 = 1; /* $10 */
const LOG1 = 5; /* $100,000 */
const PX0 = 70;
const PX1 = 950;
const lx = (v) =>
  PX0 + ((Math.log10(v) - LOG0) / (LOG1 - LOG0)) * (PX1 - PX0);

/* tiers keep the labels from colliding: each entry names the shelf it
   hangs from rather than a raw y */
const TIER = {
  up1: [196, 184, 171],
  up2: [160, 148, 135],
  up3: [118, 104, 90],
  dn1: [264, 284, 297],
  dn2: [300, 322, 335],
};

const PRICED = [
  [10, "STAG tactile glove", "uncalibrated pressure map", "up1"],
  [130, "cheap smart gloves", "relative tactile", "dn1"],
  [371, "UMI", "vision + pose, no force", "up1"],
  [700, "UMI-3D", "vision + 3D, no force", "dn1"],
  [4900, "SenseGlove R1", "haptic output, not capture", "up1"],
  [5495, "HaptX G1", "haptic feedback", "dn1"],
  [17300, "Manus Metagloves Pro", "professional mocap", "up2"],
];

const OURS = [
  [600, "Sleeve v0", "force + events + kinematics, calibrated", "up3"],
  [1400, "Sleeve, full", "+ stiffness + tendon tension", "dn2"],
];

const AXIS_Y = 230;

export function PriceBand() {
  const mid = (lx(200) + lx(4900)) / 2;
  return (
    <figure className="ls-fig rise">
      <svg
        viewBox="0 0 1000 420"
        className="ls-svg"
        role="img"
        aria-label="A logarithmic price axis from ten dollars to one hundred thousand dollars with every publicly listed competitor plotted. Below one hundred and thirty dollars the signal is uncalibrated; above four thousand nine hundred dollars the hardware is professional mocap and haptics. Between them almost nothing carries a public list price, and that is where the Touchstone sleeve lands."
      >
        <Ticks w={1000} h={420} m={16} l={18} />
        <text className="ls-fig-id" x="18" y="34">
          fig. 6 · every price here is a public list price
        </text>

        <rect
          className="ls-empty"
          x={lx(200)}
          y="64"
          width={lx(4900) - lx(200)}
          height="286"
        />
        <line className="ls-empty-edge" x1={lx(200)} y1="58" x2={lx(200)} y2="64" />
        <line className="ls-empty-edge" x1={lx(4900)} y1="58" x2={lx(4900)} y2="64" />
        <line className="ls-empty-edge" x1={lx(200)} y1="58" x2={lx(4900)} y2="58" />
        <text className="ls-empty-lab" x={mid} y="50" textAnchor="middle">
          essentially nothing is sold here
        </text>

        <line className="ls-axis" x1={PX0} y1={AXIS_Y} x2={PX1} y2={AXIS_Y} />
        {[10, 100, 1000, 10000, 100000].map((v) => (
          <g key={v}>
            <line
              className="ls-axis-tick"
              x1={lx(v)}
              y1={AXIS_Y}
              x2={lx(v)}
              y2={AXIS_Y + 8}
            />
            <text
              className="ls-axis-lab"
              x={lx(v)}
              y={AXIS_Y + 24}
              textAnchor="middle"
            >
              ${v.toLocaleString()}
            </text>
          </g>
        ))}

        {PRICED.map(([v, n, q, tier]) => {
          const [dy, ty, sy] = TIER[tier];
          return (
            <g key={n} className="ls-price">
              <line x1={lx(v)} y1={AXIS_Y} x2={lx(v)} y2={dy} />
              <circle cx={lx(v)} cy={dy} r="3" />
              <text x={lx(v)} y={ty} textAnchor="middle">
                {n}
              </text>
              <text className="ls-price-q" x={lx(v)} y={sy} textAnchor="middle">
                {q}
              </text>
            </g>
          );
        })}

        {OURS.map(([v, n, q, tier]) => {
          const [dy, ty, sy] = TIER[tier];
          return (
            <g key={n} className="ls-price is-ours">
              <line x1={lx(v)} y1={AXIS_Y} x2={lx(v)} y2={dy} />
              <circle cx={lx(v)} cy={dy} r="4.5" />
              <text x={lx(v)} y={ty} textAnchor="middle">
                {n}
              </text>
              <text className="ls-price-q" x={lx(v)} y={sy} textAnchor="middle">
                {q}
              </text>
            </g>
          );
        })}

        <text className="ls-fig-foot" x="18" y="388">
          below $130 the signal is relative and uncalibrated · above $4,900 the
          hardware is mocap and haptics, never designed for force capture
        </text>
        <text className="ls-fig-foot" x="18" y="404">
          one dense-tactile capture station is estimated inside the middle band,
          but its price is not published
        </text>
      </svg>
    </figure>
  );
}

/* ============================================================
   FIG 7 — the two curves the thesis rides on
   ============================================================ */

export function Curves() {
  const measure = useMeasured();
  return (
    <figure className="ls-fig rise">
      <svg
        viewBox="0 0 1000 300"
        className="ls-svg"
        role="img"
        aria-label="Two curves: fully-loaded teleoperation data falling from 340 dollars an hour in early 2024 to 118 by March 2026, and the force-labelled share of manipulation data spend rising from 8 percent in 2027 to 22 percent in 2031."
      >
        <Ticks w={1000} h={300} m={16} l={18} />
        <text className="ls-fig-id" x="18" y="34">
          fig. 7 · the commodity channel deflates · the missing one does not
        </text>

        {/* left: teleop $/hr */}
        <g>
          <text className="ls-col-h" x="40" y="76">
            fully-loaded teleoperation data, $ / hour
          </text>
          <line className="ls-axis" x1="40" y1="240" x2="450" y2="240" />
          <path
            ref={measure}
            className="ls-curve is-down"
            d="M60 106 C160 128, 250 186, 430 214"
          />
          <circle className="ls-curve-dot" cx="60" cy="106" r="4" />
          <circle className="ls-curve-dot" cx="430" cy="214" r="4" />
          <text className="ls-curve-v" x="60" y="94">
            $340
          </text>
          <text className="ls-curve-t" x="60" y="258">
            early 2024
          </text>
          <text className="ls-curve-v" x="430" y="202" textAnchor="end">
            $118
          </text>
          <text className="ls-curve-t" x="430" y="258" textAnchor="end">
            march 2026
          </text>
          <text className="ls-curve-note" x="40" y="278">
            −65% in two years. Observed, not forecast.
          </text>
        </g>

        {/* right: force-labelled share */}
        <g>
          <text className="ls-col-h" x="550" y="76">
            force-labelled share of that spend
          </text>
          <line className="ls-axis" x1="550" y1="240" x2="960" y2="240" />
          <path
            ref={measure}
            className="ls-curve is-up"
            d="M570 214 C660 200, 720 168, 800 148 C860 132, 900 118, 940 106"
          />
          {[
            [570, 214, "8%", "2027"],
            [800, 148, "15%", "2029"],
            [940, 106, "22%", "2031"],
          ].map(([x, y, v, t]) => (
            <g key={t}>
              <circle className="ls-curve-dot" cx={x} cy={y} r="4" />
              <text className="ls-curve-v" x={x} y={y - 12} textAnchor="middle">
                {v}
              </text>
              <text className="ls-curve-t" x={x} y="258" textAnchor="middle">
                {t}
              </text>
            </g>
          ))}
          <text className="ls-curve-note" x="550" y="272">
            Modelled at 47%/yr — the broader physical-AI rate, not the
          </text>
          <text className="ls-curve-note" x="550" y="286">
            200%+ this category actually grew. Deliberately understated.
          </text>
        </g>
      </svg>
    </figure>
  );
}
