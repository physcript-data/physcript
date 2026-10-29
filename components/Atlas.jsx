"use client";

/* ============================================================
   THE ATLAS — sheet 01
   The whole of Touchstone as one navigable map, and the four
   movements that make the map legible before you read it.
   ============================================================ */

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import CustomCursor from "./CustomCursor";
import {
  Counter,
  Ev,
  Ticks,
  keyframe,
  useCoarse,
  useMeasured,
  useReveal,
  useScrub,
  useStill,
} from "./sheet-kit";
import {
  EDGES,
  FIELDS,
  FIELD_TEXT,
  GATES,
  GATE_H,
  GATE_W,
  GATE_Y,
  KNOTS,
  NODES,
  SHEET,
  SPINE,
  SPINE_ROUTE,
  STAGES,
  ZONES,
  lineage,
} from "./atlas-map";

/* ============================================================
   I — identical pixels
   ============================================================ */

const CUP_HELD =
  "M97 40 L105 126 Q107 142 150 142 Q193 142 195 126 L203 40";
const CUP_CRUSHED =
  "M97 40 L107 74 Q121 88 110 104 L105 126 Q107 142 150 142 Q193 142 195 126 L190 104 Q179 88 193 74 L203 40";

/* force against time, sharing one axis so the contrast is the reading:
   0 N at y=66, the fracture rule at 36 N */
const N2Y = (n) => 66 - (n / 48) * 56;

function Frame({ crushed, label, peak, trace, delay }) {
  const measure = useMeasured();
  return (
    <figure className="at-frame rise" style={{ "--rd": delay }}>
      <figcaption className="at-frame-cap">
        <span>frame 0412 · rgb</span>
        <span>{label}</span>
      </figcaption>
      <svg viewBox="0 0 300 190" className="at-frame-img" aria-hidden="true">
        <g className="at-crop">
          <path d="M10 24 L10 10 L24 10" />
          <path d="M276 10 L290 10 L290 24" />
          <path d="M10 166 L10 180 L24 180" />
          <path d="M276 180 L290 180 L290 166" />
        </g>
        <ellipse className="at-cup-rim" cx="150" cy="40" rx="53" ry="11" />
        <path className="at-cup" d={crushed ? CUP_CRUSHED : CUP_HELD} />
        {[
          [104, 84],
          [196, 76],
          [195, 100],
        ].map(([cx, cy], i) => (
          <circle
            key={i}
            className={"at-touch" + (crushed ? " is-hard" : "")}
            cx={cx}
            cy={cy}
            r="4"
          />
        ))}
        <text className="at-frame-note" x="150" y="176" textAnchor="middle">
          same pixels
        </text>
      </svg>
      <svg viewBox="0 0 300 80" className="at-trace" aria-hidden="true">
        <line className="at-axis" x1="14" y1="66" x2="290" y2="66" />
        <line
          className="at-axis at-axis-dash"
          x1="14"
          y1={N2Y(36)}
          x2="290"
          y2={N2Y(36)}
        />
        <text className="at-axis-lab" x="14" y={N2Y(36) - 5} textAnchor="start">
          cup fails · 36 N
        </text>
        <path ref={measure} className="at-trace-line" d={trace} />
      </svg>
      <div className="at-frame-read">
        <span>peak normal force</span>
        <b className={crushed ? "is-hard" : ""}>
          <Counter to={peak} decimals={1} suffix=" N" />
        </b>
      </div>
    </figure>
  );
}

const TRACE_HELD = `M14 66 C60 66, 74 ${N2Y(2.1)}, 110 ${N2Y(2.4)} L250 ${N2Y(
  2.3
)} L290 ${N2Y(2.4)}`;
const TRACE_CRUSHED = `M14 66 C60 66, 74 ${N2Y(6)}, 108 ${N2Y(
  18
)} C150 ${N2Y(31)}, 176 ${N2Y(41.6)}, 208 ${N2Y(41.6)} L232 ${N2Y(
  41.6
)} L246 ${N2Y(9)} L290 ${N2Y(7)}`;

/* ============================================================
   II — the vectors do not change; the body does
   ============================================================ */

const OX = 330;
const OY = 208;
const OR = 74;

/* five pad slots, walked across four bodies */
const PADS = [
  { a: [180, 180, 180, 180], o: [1, 1, 1, 1] },
  { a: [-44, -44, -40, 0], o: [1, 1, 1, 1] },
  { a: [-15, -15, 40, 40], o: [1, 1, 1, 0] },
  { a: [15, 15, 40, 40], o: [1, 1, 0, 0] },
  { a: [44, 44, 40, 40], o: [1, 1, 0, 0] },
];

const BODIES = [
  {
    n: "Human hand",
    dof: "23 DOF · 5 deformable pads",
    v: "Source",
    s: "src",
    r: "Video sees five fingers and has to treat all five as meaningful. Measured force shows which two did the work.",
  },
  {
    n: "Five-digit hand",
    dof: "20 DOF · 5 rigid pads",
    v: "Feasible",
    s: "pass",
    r: "Near-direct transfer. The job description barely has to be re-solved.",
  },
  {
    n: "Three-finger gripper",
    dof: "3 fingers · 1 synergy",
    v: "Feasible",
    s: "pass",
    r: "The two load-bearing contacts are kept and one is added for closure. The three resting fingers are dropped; they were never part of the job.",
  },
  {
    n: "Parallel jaw",
    dof: "2 rigid jaws · 1 axis",
    v: "Cannot execute",
    s: "fail",
    r: "Force closure is satisfied, but the twist the job requires exceeds what two flat jaws can hold. The honest answer is a refusal with a workaround: fixture the object and re-grip in two stages, or introduce a tool — and re-check the new plan before offering it.",
  },
];

function Arrow({ from, to, lab, side }) {
  const [x1, y1] = from;
  const [x2, y2] = to;
  const a = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
  return (
    <g className="at-vec">
      <line x1={x1} y1={y1} x2={x2} y2={y2} />
      <path
        className="at-vec-head"
        d="M0 0 L-9 -4.5 L-9 4.5 Z"
        transform={`translate(${x2} ${y2}) rotate(${a})`}
      />
      <text
        className="at-vec-lab"
        x={x1}
        y={y1 - 11}
        textAnchor={side === "end" ? "end" : "start"}
      >
        {lab}
      </text>
    </g>
  );
}

function Morph({ t }) {
  const i = Math.min(3, Math.round(t * 3));
  const b = BODIES[i];
  return (
    <div className="at-morph">
      <svg viewBox="0 0 660 420" className="at-morph-svg" role="img" aria-label={`The same measured forces on a held object, transferred onto a ${b.n}.`}>
        <Ticks w={660} h={420} m={14} l={16} />

        {/* the object — the thing that never changes */}
        <circle className="at-obj" cx={OX} cy={OY} r={OR} />
        <circle className="at-obj-core" cx={OX} cy={OY} r="3" />
        <text className="at-obj-lab" x={OX} y={OY + OR + 30} textAnchor="middle">
          the held object
        </text>

        {/* the measured wrench — fixed, whatever is holding it */}
        <Arrow
          from={[OX - OR - 92, OY]}
          to={[OX - OR - 14, OY]}
          lab="18.4 N"
          side="start"
        />
        <Arrow
          from={[OX + OR + 92, OY]}
          to={[OX + OR + 14, OY]}
          lab="12.0 N"
          side="end"
        />
        <g className="at-vec at-torque">
          <path
            d={`M${OX - 30} ${OY - OR - 26} A 46 46 0 0 1 ${OX + 30} ${
              OY - OR - 26
            }`}
          />
          <path
            className="at-vec-head"
            d="M0 0 L-8 -4 L-8 4 Z"
            transform={`translate(${OX + 30} ${OY - OR - 26}) rotate(52)`}
          />
          <text
            className="at-vec-lab"
            x={OX}
            y={OY - OR - 38}
            textAnchor="middle"
          >
            0.31 N·m
          </text>
        </g>

        {/* the body — the only thing that does change */}
        {PADS.map((p, k) => {
          const a = keyframe(p.a, t);
          const o = keyframe(p.o, t);
          const rad = (a * Math.PI) / 180;
          const x = OX + Math.cos(rad) * (OR + 9);
          const y = OY + Math.sin(rad) * (OR + 9);
          return (
            <g
              key={k}
              className="at-pad"
              opacity={o.toFixed(3)}
              transform={`translate(${x.toFixed(2)} ${y.toFixed(
                2
              )}) rotate(${a.toFixed(2)})`}
            >
              <rect x="-3" y="-11" width="10" height="22" rx="2.5" />
            </g>
          );
        })}

        <g className="at-morph-read">
          <line className="at-rule" x1="486" y1="120" x2="646" y2="120" />
          <text className="at-morph-n" x="486" y="112">
            {b.n}
          </text>
          <text className="at-morph-dof" x="486" y="140">
            {b.dof}
          </text>
          <text className={"at-morph-v " + b.s} x="486" y="176">
            {b.v}
          </text>
        </g>

        <text className="at-morph-fixed" x="16" y="404">
          the wrench is fixed · only the body changes
        </text>
      </svg>
      <div className="at-morph-side">
        <ol className="at-morph-steps">
          {BODIES.map((x, k) => (
            <li key={x.n} className={k === i ? "is-on" : ""}>
              <i />
              {x.n}
            </li>
          ))}
        </ol>
        <p className={"at-morph-note " + b.s}>{b.r}</p>
        <p className="at-illus">
          Illustrative. The bench prototype does not produce these yet — these
          are the shapes of the answers, not measured ones.
        </p>
      </div>
    </div>
  );
}

/* ============================================================
   III — the map
   ============================================================ */

/* Module scope on purpose: defined inside the sheet it would be a fresh
   component type on every render, remounting each node and destroying
   keyboard focus mid-tab. */
function Node({ id, on, sel, setSel, setFocus, risk, dim, children }) {
  const n = NODES[id];
  return (
    <g
      className={
        "at-node at-" +
        n.kind +
        (sel === id ? " is-sel" : "") +
        (risk && risk.has(id) ? " is-risk" : "") +
        dim
      }
      data-on={on ? "1" : "0"}
      role="button"
      tabIndex={0}
      aria-pressed={sel === id}
      aria-label={n.n}
      onClick={() => setSel(id)}
      onKeyDown={(ev) => {
        if (ev.key === "Enter" || ev.key === " ") {
          ev.preventDefault();
          setSel(id);
        }
      }}
      onMouseEnter={() => setFocus(id)}
      onMouseLeave={() => setFocus(null)}
      onFocus={() => setFocus(id)}
      onBlur={() => setFocus(null)}
    >
      <rect
        className="at-node-box"
        x={n.x}
        y={n.y}
        width={n.w}
        height={n.h}
        rx="2"
      />
      {children}
    </g>
  );
}

const KIND_STAGE = {
  gap: 1,
  thesis: 1,
  block: 2,
  standard: 2,
  given: 2,
  layer: 3,
  record: 4,
  out: 5,
};

function nodeStage(id) {
  const n = NODES[id];
  if (!n) return 3;
  if (n.kind === "layer") return id === "L6" || id === "L7" ? 5 : 3;
  return KIND_STAGE[n.kind] ?? 3;
}

function Map({ stage, sel, setSel, focus, setFocus, gate, setGate, pinned, setPinned }) {
  const measure = useMeasured();

  const lit = focus ? lineage(focus) : null;
  const g = gate ? GATES.find((x) => x.id === gate) : null;

  /* hover previews a gate; a click pins it, so the reading below stays put
     while you look at it — and so it works at all on a touch screen */
  const pin = (id) => {
    if (pinned && gate === id) {
      setPinned(false);
      setGate(null);
    } else {
      setGate(id);
      setPinned(true);
    }
  };
  const risk = g ? new Set([...g.kills, ...g.marks]) : null;

  const dimNode = (id) => {
    if (g) return risk.has(id) ? "" : " is-dim";
    if (!lit) return "";
    return lit.nodes.has(id) ? "" : " is-dim";
  };
  const dimEdge = (id) => {
    if (g) return " is-dim";
    if (!lit) return "";
    return lit.edges.has(id) ? "" : " is-dim";
  };

  /* choosing anything on the map releases a pinned gate, so the reading
     below never shows two different things at once */
  const choose = (v) => {
    setPinned(false);
    setGate(null);
    setSel(v);
  };

  const nodeProps = (id) => ({
    id,
    on: stage >= nodeStage(id),
    sel,
    setSel: choose,
    setFocus,
    risk,
    dim: dimNode(id),
  });

  const plainNode = (id) => {
    const n = NODES[id];
    if (n.tag) {
      return (
        <Node key={id} {...nodeProps(id)}>
          <text className="at-node-tag" x={n.x + 13} y={n.y + 18}>
            {n.tag}
          </text>
          <text className="at-node-n" x={n.x + 13} y={n.y + 36}>
            {n.n}
          </text>
          <text className="at-node-q" x={n.x + 13} y={n.y + 48}>
            {n.q}
          </text>
        </Node>
      );
    }
    return (
      <Node key={id} {...nodeProps(id)}>
        <text className="at-node-n" x={n.x + 13} y={n.y + n.h / 2 - 3}>
          {n.n}
        </text>
        <text className="at-node-q" x={n.x + 13} y={n.y + n.h / 2 + 12}>
          {n.q}
        </text>
      </Node>
    );
  };

  const rec = NODES.record;

  return (
    <svg
      className={"at-sheet" + (focus || gate ? " is-focus" : "")}
      viewBox={`0 0 ${SHEET.w} ${SHEET.h}`}
      role="img"
      aria-label="The Touchstone atlas: two gaps converge on one thesis, seven capture elements feed four compiler layers, which produce the Record — five fields, one intermediate representation — which two further layers consume and deliver onto any robot body. Five pre-registered kill gates hang beneath the map, each tethered to the part of it that would not survive that gate failing."
    >
      <Ticks w={SHEET.w} h={SHEET.h} />
      <text className="at-sheet-id" x="22" y={SHEET.h - 10}>
        physcript · touchstone v3 · atlas
      </text>
      <text
        className="at-sheet-id"
        x={SHEET.w - 22}
        y={SHEET.h - 10}
        textAnchor="end"
      >
        sheet 01 · rev 0.2 · not to scale
      </text>

      {/* zones */}
      <g className="at-zone" data-on={stage >= 1 ? "1" : "0"}>
        {ZONES.map(([num, lab, x1, x2]) => (
          <g key={num}>
            <line x1={x1} y1="92" x2={x2} y2="92" />
            <text className="at-zone-lab" x={x1} y="82">
              {num} · {lab}
            </text>
          </g>
        ))}
      </g>

      {/* edges */}
      {EDGES.map((e, i) => (
        <path
          key={e.id}
          ref={measure}
          className={"at-edge" + dimEdge(e.id)}
          style={{ "--d": (i % 7) * 0.045 + "s" }}
          data-on={
            stage >= Math.max(nodeStage(e.from), nodeStage(e.to)) ? "1" : "0"
          }
          d={e.d}
        />
      ))}

      {/* knots */}
      {Object.entries(KNOTS).map(([k, [x, y]]) => (
        <circle
          key={k}
          className="at-knot"
          cx={x}
          cy={y}
          r="4"
          data-on={stage >= 2 ? "1" : "0"}
        />
      ))}

      {stage >= 4 && !gate && (
        <>
          <rect
            className="at-pkt"
            width="8"
            height="2.6"
            style={{ offsetPath: `path("${SPINE_ROUTE}")` }}
          />
          <rect
            className="at-pkt"
            width="8"
            height="2.6"
            style={{
              offsetPath: `path("${SPINE_ROUTE}")`,
              animationDelay: "1.4s",
            }}
          />
        </>
      )}

      {/* why */}
      {["gap-force", "gap-emb"].map(plainNode)}

      <Node {...nodeProps("thesis")}>
        <text className="at-node-n" x={NODES.thesis.x + 13} y={NODES.thesis.y + 24}>
          The thesis
        </text>
        <text className="at-thesis-line" x={NODES.thesis.x + 13} y={NODES.thesis.y + 50}>
          a demonstration is
        </text>
        <text className="at-thesis-line" x={NODES.thesis.x + 13} y={NODES.thesis.y + 70}>
          not a trajectory
        </text>
        <text className="at-node-q" x={NODES.thesis.x + 13} y={NODES.thesis.y + 90}>
          one answer to both gaps
        </text>
      </Node>

      {/* capture */}
      {["cap-b1", "cap-b2", "cap-b3", "cap-b4", "cap-b5"].map(plainNode)}
      <line
        className="at-hair"
        x1={NODES["cap-b5"].x}
        y1="408"
        x2={NODES["cap-b5"].x + NODES["cap-b5"].w}
        y2="408"
        data-on={stage >= 2 ? "1" : "0"}
      />
      {["cap-art", "cap-cam"].map(plainNode)}

      {/* compile, front */}
      {["L1", "L2", "L3", "L4"].map(plainNode)}

      {/* the record */}
      <Node {...nodeProps("record")}>
        <text className="at-rec-t" x={rec.x + 14} y={rec.y + 26}>
          THE RECORD
        </text>
        <text className="at-rec-s" x={rec.x + rec.w - 14} y={rec.y + 26} textAnchor="end">
          L5
        </text>
        <line
          className="at-hair"
          x1={rec.x + 14}
          y1={rec.y + 38}
          x2={rec.x + rec.w - 14}
          y2={rec.y + 38}
        />
        {FIELDS.map((f, i) => (
          <g
            key={f.id}
            className={
              "at-field" +
              (sel === f.id ? " is-sel" : "") +
              (risk && risk.has(f.id) ? " is-risk" : "")
            }
            role="button"
            tabIndex={0}
            aria-label={f.n}
            onClick={(ev) => {
              ev.stopPropagation();
              choose(f.id);
            }}
            onKeyDown={(ev) => {
              if (ev.key === "Enter" || ev.key === " ") {
                ev.preventDefault();
                ev.stopPropagation();
                choose(f.id);
              }
            }}
          >
            <rect
              className="at-field-hit"
              x={rec.x + 8}
              y={rec.y + 50 + i * 34}
              width={rec.w - 16}
              height="30"
            />
            <text className="at-field-n" x={rec.x + 16} y={rec.y + 70 + i * 34}>
              {f.n}
            </text>
            <text
              className="at-field-r"
              x={rec.x + rec.w - 16}
              y={rec.y + 70 + i * 34}
              textAnchor="end"
            >
              {f.rate}
            </text>
          </g>
        ))}
        <text className="at-rec-f" x={rec.x + 14} y={rec.y + rec.h - 12}>
          intermediate representation
        </text>
      </Node>

      {/* consume + deploy */}
      {["L6", "L7"].map(plainNode)}
      {["dep-any", "dep-fleet", "dep-cert"].map(plainNode)}

      {/* ---------- the gates ---------- */}
      <g className="at-gate-band" data-on={stage >= 6 ? "1" : "0"}>
        <line x1="420" y1="646" x2="1290" y2="646" />
        <text className="at-zone-lab" x="420" y="636">
          VII · what would kill what
        </text>
        <text className="at-gate-band-s" x="1290" y="636" textAnchor="end">
          five pre-registered experiments · each with a written failure response
        </text>
      </g>

      {GATES.map((gt) =>
        gt.tethers.map((th) => (
          <path
            key={th.id}
            ref={measure}
            className={"at-tether" + (gate === gt.id ? " is-on" : "")}
            data-on={stage >= 6 ? "1" : "0"}
            d={th.d}
          />
        ))
      )}

      {GATES.map((gt, i) => (
        <g
          key={gt.id}
          className={"at-gate" + (gate === gt.id ? " is-on" : "")}
          style={{ "--sd": 0.07 * i + "s" }}
          data-on={stage >= 6 ? "1" : "0"}
          role="button"
          tabIndex={0}
          aria-label={`Gate ${gt.id} — ${gt.n}`}
          aria-pressed={gate === gt.id}
          onMouseEnter={() => {
            if (!pinned) setGate(gt.id);
          }}
          onMouseLeave={() => {
            if (!pinned) setGate(null);
          }}
          onFocus={() => {
            if (!pinned) setGate(gt.id);
          }}
          onBlur={() => {
            if (!pinned) setGate(null);
          }}
          onClick={() => pin(gt.id)}
          onKeyDown={(ev) => {
            if (ev.key === "Enter" || ev.key === " ") {
              ev.preventDefault();
              pin(gt.id);
            }
          }}
        >
          <rect
            className="at-gate-box"
            x={gt.x}
            y={GATE_Y}
            width={GATE_W}
            height={GATE_H}
            rx="2"
          />
          <text className="at-gate-id" x={gt.x + 12} y={GATE_Y + 26}>
            {gt.id}
          </text>
          <text className="at-gate-st" x={gt.x + GATE_W - 12} y={GATE_Y + 26} textAnchor="end">
            {gt.status}
          </text>
          <text className="at-gate-n" x={gt.x + 12} y={GATE_Y + 48}>
            {gt.short}
          </text>
          <line
            className="at-hair"
            x1={gt.x + 12}
            y1={GATE_Y + 58}
            x2={gt.x + GATE_W - 12}
            y2={GATE_Y + 58}
          />
        </g>
      ))}
    </svg>
  );
}

/* ============================================================
   IV — the Record as an instrument trace
   ============================================================ */

/* Each lane is drawn from hand-placed control points rather than noise,
   so the chart tells the task's story: the grip loads, the object lifts,
   it slips, the arm stiffens to catch it, and everything is set down.
   The interval on the wrench lane widens exactly where the measurement
   is hardest — which is the honest thing for it to do. */

const X0 = 170;
const X1 = 956;
const LANE_H = 58;
const LANE_GAP = 14;
const LANE_TOP = 92;

const EVENTS = [
  [236, "touch"],
  [316, "load"],
  [404, "lift"],
  [648, "slip"],
  [800, "replace"],
  [886, "release"],
];

const LANES = [
  {
    id: "rec-kin",
    n: "kinematics",
    rate: "200 Hz",
    pts: [
      [170, 0.12], [236, 0.12], [316, 0.15], [404, 0.32], [500, 0.64],
      [600, 0.76], [700, 0.72], [800, 0.44], [886, 0.16], [956, 0.14],
    ],
  },
  {
    id: "rec-wrench",
    n: "wrench",
    rate: "200 Hz",
    band: [
      0.04, 0.04, 0.06, 0.06, 0.06, 0.06, 0.13, 0.10, 0.07, 0.05, 0.04, 0.04,
    ],
    pts: [
      [170, 0.03], [236, 0.06], [300, 0.44], [360, 0.74], [404, 0.80],
      [520, 0.77], [648, 0.60], [700, 0.86], [770, 0.80], [830, 0.42],
      [886, 0.07], [956, 0.04],
    ],
  },
  {
    id: "rec-imp",
    n: "impedance",
    rate: "50 Hz",
    pts: [
      [170, 0.10], [236, 0.19], [316, 0.56], [404, 0.51], [560, 0.45],
      [648, 0.88], [710, 0.79], [800, 0.40], [886, 0.15], [956, 0.11],
    ],
  },
  { id: "rec-evt", n: "contact events", rate: "±1 ms", ticks: true },
  {
    id: "rec-unc",
    n: "quality",
    rate: "1 Hz",
    pts: [
      [170, 0.64], [300, 0.63], [440, 0.61], [600, 0.58], [780, 0.57],
      [956, 0.55],
    ],
  },
];

/* Catmull-Rom through the control points, emitted as cubic beziers */
function curves(pts) {
  let d = "";
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(
      1
    )} ${c2y.toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}

const place = (pts, top, off = 0) =>
  pts.map(([x, v]) => [x, top + LANE_H - 7 - (v + off) * (LANE_H - 14)]);

const line = (pts) => `M${pts[0][0]} ${pts[0][1].toFixed(1)}${curves(pts)}`;

function Strip() {
  const measure = useMeasured();
  const bottom = LANE_TOP + 5 * (LANE_H + LANE_GAP) - LANE_GAP;
  return (
    <svg
      viewBox="0 0 1000 480"
      className="at-strip rise"
      role="img"
      aria-label="Five channels of one demonstration drawn as an instrument trace: the grip loads, the object lifts, it slips, the arm stiffens to catch it, and it is set down. Contact events cross every channel as vertical rules. The wrench channel carries a shaded interval that widens where the measurement is hardest; no other dataset ships one."
    >
      <Ticks w={1000} h={480} m={16} l={18} />
      <text className="at-strip-id" x="18" y="34">
        one demonstration · 4.2 s · as it is written down
      </text>
      <text className="at-strip-id" x="982" y="34" textAnchor="end">
        touchstone record v0.1
      </text>

      {/* event rules cross everything — they are the structure */}
      {EVENTS.map(([x, n]) => (
        <g key={n} className="at-ev">
          <line x1={x} y1="58" x2={x} y2={bottom} />
          <text x={x} y="52" textAnchor="middle">
            {n}
          </text>
        </g>
      ))}

      {LANES.map((l, i) => {
        const top = LANE_TOP + i * (LANE_H + LANE_GAP);
        const cy = top + LANE_H / 2;
        return (
          <g key={l.id} className="at-lane">
            <line className="at-lane-rule" x1={X0} y1={top} x2={X1} y2={top} />
            <text className="at-lane-n" x="18" y={cy - 3}>
              {l.n}
            </text>
            <text className="at-lane-r" x="18" y={cy + 12}>
              {l.rate}
            </text>

            {l.ticks ? (
              EVENTS.map(([x, n]) => (
                <g key={n} className="at-lane-tick">
                  <line x1={x} y1={cy - 13} x2={x} y2={cy + 13} />
                  <circle cx={x} cy={cy} r="3.2" />
                </g>
              ))
            ) : (
              <>
                {l.band && (
                  <path
                    className="at-band"
                    d={(() => {
                      const up = place(
                        l.pts.map(([x, v], k) => [x, v + l.band[k]]),
                        top
                      );
                      const lo = place(
                        l.pts.map(([x, v], k) => [
                          x,
                          Math.max(0, v - l.band[k]),
                        ]),
                        top
                      ).reverse();
                      return (
                        `M${up[0][0]} ${up[0][1].toFixed(1)}` +
                        curves(up) +
                        ` L${lo[0][0]} ${lo[0][1].toFixed(1)}` +
                        curves(lo) +
                        " Z"
                      );
                    })()}
                  />
                )}
                <path
                  ref={measure}
                  className={"at-sig" + (l.band ? " is-force" : "")}
                  style={{ "--d": i * 0.14 + "s" }}
                  d={line(place(l.pts, top))}
                />
              </>
            )}
          </g>
        );
      })}

      <g className="at-callout">
        <line x1="620" y1="186" x2="686" y2="150" />
        <circle cx="620" cy="186" r="2.6" />
        <text x="694" y="147">
          the stated interval
        </text>
        <text className="at-callout-s" x="694" y="161">
          widens where the measurement is hardest
        </text>
      </g>

      <text className="at-strip-foot" x="18" y="466">
        contact events are drawn across every channel because that is what they
        are — the joints of the task, not a sixth signal
      </text>
    </svg>
  );
}

/* ============================================================
   plates — pencil studies
   ============================================================ */

function Plate({ src, alt, n, title, note }) {
  return (
    <figure className="at-plate rise">
      <img src={src} alt={alt} width="1280" height="720" loading="lazy" />
      <figcaption>
        <span>
          <b>plate {n}</b> · {title}
        </span>
        <span>{note}</span>
      </figcaption>
    </figure>
  );
}

/* ============================================================
   V — where this actually stands
   ============================================================ */

const STATUS = [
  ["System specification", "complete — 5 blocks, 7 layers, 5 gates, costed", "R", "done"],
  ["Uncertainty validation", "run on public data, externally reviewed, six of our own claims corrected", "R", "done"],
  ["v0 hardware", "bench prototype under construction · signals read on the bench · not yet worn", "—", "part"],
  ["First worn recording", "next — muscle signals and force together, against the load-cell reference", "—", "open"],
];

/* ============================================================
   page
   ============================================================ */

export default function Atlas() {
  const root = useReveal();
  const coarse = useCoarse();
  const still = useStill();

  const [stage, setStage] = useState(0);
  const [sel, setSel] = useState("record");
  const [focus, setFocus] = useState(null);
  const [gate, setGate] = useState(null);
  const [pinned, setPinned] = useState(false);
  const timers = useRef([]);

  const morphRef = useRef(null);
  const t = useScrub(morphRef);

  const play = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setStage(0);
    [0, 320, 760, 1180, 1520, 1900].forEach((ms, i) => {
      timers.current.push(setTimeout(() => setStage(i + 1), ms));
    });
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStage(6);
      return;
    }
    const raf = requestAnimationFrame(play);
    return () => {
      cancelAnimationFrame(raf);
      timers.current.forEach(clearTimeout);
    };
  }, [play]);

  const g = gate ? GATES.find((x) => x.id === gate) : null;
  const node = NODES[sel];
  const field = FIELDS.find((f) => f.id === sel);

  return (
    <main className={"at" + (coarse ? " coarse" : "")} ref={root}>
      <CustomCursor />

      <header className="at-bar">
        <Link href="/" className="at-bar-mark">
          <span className="at-brk">[</span>physcript<span className="at-brk">]</span>
        </Link>
        <div className="at-bar-mid">
          <b>TOUCHSTONE</b>
          <span>atlas · v3</span>
        </div>
        <div className="at-bar-right">
          <Link href="/touchstone/detailed">the long sheet →</Link>
          <a href="mailto:pranav@physcri.pt">contact</a>
        </div>
      </header>

      {/* ---------------- masthead ---------------- */}
      <section className="at-wrap at-mast">
        <p className="at-eyebrow rise">
          MVP · TOUCHSTONE v3 · ATLAS · sheet 01 · rev 0.2
        </p>
        <h1 className="at-title rise">
          A demonstration is not a trajectory.
          <em>
            {" "}
            It is a trajectory, plus the force it put into the world — and
            nobody has ever written that part down.
          </em>
        </h1>
        <div className="at-mast-foot rise">
          <p className="at-lede">
            Touchstone is an instrument, not a dataset vendor. A forearm sleeve
            reads the muscles that move the hand; a handheld standard tells the
            sleeve what a newton is; software compiles both into one record of
            what a person actually did to an object — with a stated interval on
            every force in it. This sheet is that whole system, at once, with
            the experiments that could end each part of it hanging underneath.
          </p>
          <dl className="at-key">
            <div>
              <dt>Measured</dt>
              <dd>
                <i className="at-sw m" /> read from an instrument, in newtons
              </dd>
            </div>
            <div>
              <dt>Certified</dt>
              <dd>
                <i className="at-sw c" /> traceable to a physical reference
              </dd>
            </div>
            <div>
              <dt>At risk</dt>
              <dd>
                <i className="at-sw f" /> gated by an experiment not yet run
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <div className="at-wrap">
        <Plate
          src="/touchstone/study-prototype.webp"
          alt="Pencil study of the research prototype on a forearm: a band of small printed pods holding gel electrodes, a wire bundle running to a microcontroller board strapped to the upper arm, a motion sensor at the wrist, reference electrodes on bone, and the fingers pinching a load-cell puck."
          n="I"
          title="the research prototype, as it is being built"
          note="pencil study · october 2026"
        />
      </div>

      {/* ---------------- I ---------------- */}
      <section className="at-wrap at-sec">
        <div className="at-sec-head rise">
          <div className="at-sec-num">I</div>
          <div>
            <h2 className="at-h2">Two gaps, and they share one answer.</h2>
            <p className="at-body">
              The first is that force is invisible. The second is that even if
              you could see it, a human hand and a robot gripper have so little
              in common that copying one onto the other means almost nothing.
              Both are usually treated as separate problems. They are not.
            </p>
          </div>
        </div>

        <div className="at-frames">
          <Frame
            label="held"
            peak={2.4}
            trace={TRACE_HELD}
            delay="0s"
          />
          <Frame
            crushed
            label="crushed"
            peak={41.6}
            trace={TRACE_CRUSHED}
            delay="0.12s"
          />
        </div>
        <p className="at-frames-foot rise">
          Identical pixels. Seventeen times the force. Only one of these is a
          demonstration worth learning from, and nothing in the image says
          which — which is why a tactile glove giving relative pressure in
          arbitrary units does not close the gap either. The missing thing is
          not resolution. It is the unit.
        </p>

        <div className="at-gapgrid rise">
          <div>
            <h3 className="at-h3">23 degrees of freedom against 2</h3>
            <p className="at-body">
              A human hand has roughly twenty-three kinematic degrees of freedom
              and five deformable pads. A parallel jaw has two rigid jaws on one
              axis. There is no correspondence to copy, which is exactly why
              retargeting research keeps fragmenting into one bespoke solution
              per robot.
            </p>
          </div>
          <div>
            <h3 className="at-h3">So stop recording the hand</h3>
            <p className="at-body">
              Record what the hand <em>did to the object</em>, and how the arm
              was regulated while doing it. Force on the object does not care
              what applied it. Stiffness is a command any torque-controlled
              robot can render. Contact events are the subgoals of manipulation
              for any body at all. All three are measurable from the muscle
              side — and two of them <em>only</em> from the muscle side. That
              single fact is the entire reason to build a wearable rather than
              anything else.
            </p>
          </div>
        </div>
        <Plate
          src="/touchstone/study-puck.webp"
          alt="Pencil study of the instrumented pinch puck, assembled and exploded: a bar load cell with a jaw block and grip pad at each end, screws and washers, and a calibration weight hanging from an eye-screw."
          n="II"
          title="the force reference — a pinch puck around a load cell"
          note="what the sleeve is checked against, in newtons"
        />
      </section>

      {/* ---------------- II — the morph ---------------- */}
      <section className="at-scrub" ref={morphRef}>
        <div className="at-sticky">
          <div className="at-wrap at-scrub-head">
            <div className="at-sec-num">II</div>
            <div>
              <h2 className="at-h2">The vectors do not change. The body does.</h2>
              <p className="at-body">
                Scroll, and the thing holding the object becomes something else
                each time. Watch what stays still.
              </p>
            </div>
          </div>
          <div className="at-wrap">
            <Morph t={still ? 0 : t} />
          </div>
        </div>
      </section>

      {/* ---------------- III — the map ---------------- */}
      <section className="at-stage-wrap">
        <div className="at-stage-head at-wrap">
          <p className="at-stage-cap">
            <span>{String(stage).padStart(2, "0")}</span>
            {STAGES[stage]}
          </p>
          <button className="at-replay" type="button" onClick={play}>
            draw the atlas again
          </button>
        </div>

        <div className="at-scroller">
          <div className="at-canvas">
            <Map
              stage={stage}
              sel={sel}
              setSel={setSel}
              focus={focus}
              setFocus={setFocus}
              gate={gate}
              setGate={setGate}
              pinned={pinned}
              setPinned={setPinned}
            />
          </div>
        </div>
        <p className="at-hint">
          hover anything to isolate its lineage · click to read it · hover a gate
          to see what dies if it fails
        </p>
      </section>

      {/* ---------------- readout ---------------- */}
      <section className="at-wrap at-readout">
        {g ? (
          <div className="at-read">
            <div className="at-read-head">
              <span className="at-read-kind">kill gate</span>
              <h3 className="at-read-n">
                {g.id} — {g.n}
              </h3>
              <span className={"at-read-ev at-st-" + g.status.replace(/ /g, "-")}>
                {g.status}
              </span>
            </div>
            <div className="at-read-grid">
              <p className="at-read-plain">{g.q}</p>
              <dl className="at-read-rows">
                <div>
                  <dt>Requires</dt>
                  <i className="at-lead" aria-hidden="true" />
                  <dd>{g.needs}</dd>
                </div>
                <div>
                  <dt>If it fails</dt>
                  <i className="at-lead" aria-hidden="true" />
                  <dd>{g.fail}</dd>
                </div>
                <div>
                  <dt>Kills</dt>
                  <i className="at-lead" aria-hidden="true" />
                  <dd>
                    {[...g.kills, ...g.marks]
                      .map((k) => NODES[k]?.n || FIELDS.find((f) => f.id === k)?.n)
                      .filter(Boolean)
                      .join(" · ")}
                  </dd>
                </div>
              </dl>
            </div>
            {g.weight && <p className="at-read-weight">{g.weight}</p>}
            {g.note && <p className="at-read-note">{g.note}</p>}
            <p className="at-read-foot">
              The threshold is written down and decided in advance. It is not
              published here.
              {pinned ? " · click the gate again to release it" : ""}
            </p>
          </div>
        ) : field ? (
          <div className="at-read">
            <div className="at-read-head">
              <span className="at-read-kind">record field</span>
              <h3 className="at-read-n">{field.n}</h3>
              <span className="at-read-ev">{field.rate}</span>
            </div>
            <div className="at-read-grid">
              <p className="at-read-plain">{FIELD_TEXT[field.id]}</p>
              <dl className="at-read-rows">
                <div>
                  <dt>Content</dt>
                  <i className="at-lead" aria-hidden="true" />
                  <dd>{field.what}</dd>
                </div>
                <div>
                  <dt>Validated by</dt>
                  <i className="at-lead" aria-hidden="true" />
                  <dd>{field.by}</dd>
                </div>
              </dl>
            </div>
          </div>
        ) : (
          <div className="at-read">
            <div className="at-read-head">
              <span className="at-read-kind">{node.kind}</span>
              <h3 className="at-read-n">{node.full || node.n}</h3>
              <span className="at-read-ev">
                <Ev k={node.ev} />
                {node.ships ? <em>ships {node.ships}</em> : null}
              </span>
            </div>
            <div className="at-read-grid">
              <p className="at-read-plain">{node.plain}</p>
              <p className="at-read-tech">{node.tech}</p>
            </div>
            {node.note && <p className="at-read-note">{node.note}</p>}
          </div>
        )}
      </section>

      <div className="at-wrap">
        <Plate
          src="/touchstone/study-sleeve.webp"
          alt="Pencil study of the finished sleeve: a slim ribbed knit sleeve from elbow to wrist with flush sensing contacts, soft pads woven in and one small sealed pod on the back of the forearm. No wires."
          n="III"
          title="where it is going — the sleeve as a product"
          note="design study · not finished hardware"
        />
      </div>

      {/* ---------------- IV — the record ---------------- */}
      <section className="at-wrap at-sec">
        <div className="at-sec-head rise">
          <div className="at-sec-num">III</div>
          <div>
            <h2 className="at-h2">What actually gets written down.</h2>
            <p className="at-body">
              Five channels, one timebase. Four of them exist somewhere else in
              some form. The fifth — a stated interval around every force and
              stiffness value — exists in no dataset at any price, and it is the
              one that turns <em>calibrated</em> from an adjective into
              something a buyer can check.
            </p>
          </div>
        </div>

        <div className="at-strip-wrap">
          <Strip />
        </div>

        <div className="at-compare rise">
          <div>
            <span className="at-compare-k">a conventional dataset says</span>
            <code className="at-compare-v">F = 4.2 N</code>
          </div>
          <div className="is-ours">
            <span className="at-compare-k">the Touchstone Record says</span>
            <code className="at-compare-v">
              F = 4.2 N, [3.6, 4.9] @ 90% coverage
            </code>
          </div>
        </div>
        <p className="at-compare-foot rise">
          Wrench is written in the <em>object&apos;s</em>{" "}
          frame, never the hand&apos;s. Hand-frame forces are morphology-specific; object-frame
          wrench is not. That one choice is what makes the record portable, and
          it is why the format will be published openly while the estimators
          that fill it will not.
        </p>
      </section>

      {/* ---------------- V — status ---------------- */}
      <section className="at-wrap at-sec at-status-sec">
        <div className="at-sec-head rise">
          <div className="at-sec-num">IV</div>
          <div>
            <h2 className="at-h2">Where this actually stands.</h2>
            <p className="at-body">
              Everything above is a specification, one validated corner of it,
              and a bench prototype that has started to read signals. Said
              plainly, because a company whose entire pitch is
              <em> calibrated numbers with stated error</em> does not get to be
              vague about its own state.
            </p>
          </div>
        </div>

        <ol className="at-status rise">
          {STATUS.map(([k, v, ev, state]) => (
            <li key={k} className={"at-st-" + state}>
              <i className="at-st-dot" aria-hidden="true" />
              <span className="at-st-k">{k}</span>
              <i className="at-lead" aria-hidden="true" />
              <span className="at-st-v">{v}</span>
              {ev !== "—" && <Ev k={ev} />}
            </li>
          ))}
        </ol>

        <Plate
          src="/touchstone/study-harness.webp"
          alt="Pencil study of a bench electronics harness: a microcontroller board at the centre, amplifier boards with electrode leads, motion and pressure sensor boards, two load cells with amplifiers, and two hand-soldered perfboards."
          n="IV"
          title="the bench harness"
          note="illustration · not a wiring drawing"
        />

        <p className="at-pull rise">
          The measurement is the product. The chain that makes it believable is
          the position.
        </p>

        <Link href="/touchstone/detailed" className="at-next rise">
          <span>Next sheet</span>
          <strong>
            The long sheet — every block, the traceability chain, and the
            evidence in full →
          </strong>
        </Link>

        <div className="at-title-block rise">
          <div>
            <dt>Sheet</dt>
            <dd>01 · atlas</dd>
          </div>
          <div>
            <dt>Revision</dt>
            <dd>0.3 · v3 architecture · bench build</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>specified · partly validated · bench prototype under construction</dd>
          </div>
          <div>
            <dt>Enquiries</dt>
            <dd>
              <a href="mailto:pranav@physcri.pt">pranav@physcri.pt</a>
            </dd>
          </div>
        </div>
        <p className="at-end">
          <span>physcript</span>
          <span>the force layer for physical AI</span>
        </p>
      </section>
    </main>
  );
}
