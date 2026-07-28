"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import CustomCursor from "./CustomCursor";

/* ============================================================
   THE LIVING INSTRUMENT SCHEMATIC
   One sheet. The object sits at the centre; the world measures
   it from the left; the record is certified; the force is
   recompiled into whichever body is asked for on the right.
   ============================================================ */

/* ---------- geometry of the sheet ---------- */

const GATHER = [552, 400];
const SPINE = [598, 400];

const STREAMS = [
  {
    id: "surface",
    y: 168,
    n: "Instrumented surface",
    q: "how hard",
    d: "The load that leaves the bench is the load the grip just took over.",
    route: "M300 168 C 424 168 470 244 552 386",
  },
  {
    id: "tool",
    y: 258,
    n: "Instrumented tool",
    q: "how hard",
    d: "Force measured at the working tip. The cleanest channel on the bench.",
    route: "M300 258 C 424 258 478 306 552 393",
  },
  {
    id: "object",
    y: 348,
    n: "Prepared object",
    q: "how hard",
    d: "The object reports its own squeeze, from the inside, where no glove can reach.",
    route: "M300 348 C 432 348 492 374 552 397",
  },
  {
    id: "band",
    y: 438,
    n: "Forearm band",
    q: "which finger",
    d: "Reads the fingers in the place the object cannot hide them.",
    route: "M300 438 C 432 438 492 420 552 403",
  },
  {
    id: "optics",
    y: 528,
    n: "Bench optics",
    q: "where",
    d: "Every measured force gets an address on a surface that was scanned first.",
    route: "M300 528 C 424 528 478 490 552 407",
  },
  {
    id: "clock",
    y: 618,
    n: "Shared clock",
    q: "when",
    d: "One timebase. Every channel agrees on the millisecond, or the record is void.",
    route: "M300 618 C 424 618 470 552 552 414",
  },
];

/* the specimen: a plain vessel, drawn so the contacts read clearly */
const VESSEL = {
  cx: 790,
  rimY: 300,
  rimRx: 94,
  rimRy: 26,
  botY: 494,
  botRx: 82,
  botRy: 20,
};

/* contact sites on the surface, with outward normals */
const SITE = {
  A: { p: [700, 366], n: [-0.998, 0.062], lab: "start" },
  B: { p: [881, 340], n: [0.998, 0.062], lab: "end" },
  C: { p: [879, 386], n: [0.998, 0.062], lab: "end" },
  D: { p: [877, 428], n: [0.998, 0.062], lab: "end" },
  E: { p: [875, 466], n: [0.998, 0.062], lab: "end" },
};

/* feed routes run around the specimen, never through it */
const FEED = {
  A: "M598 400 C 632 398 658 378 697 368",
  B: "M598 400 C 600 306 674 240 788 238 C 884 236 908 288 888 334",
  C: "M598 400 C 606 322 674 254 790 258 C 896 262 912 336 884 380",
  D: "M598 400 C 606 468 674 512 790 508 C 888 504 908 470 882 434",
  E: "M598 400 C 600 496 676 560 790 560 C 884 560 904 518 880 472",
};

/* the four bodies, on an arc to the right of the certificate */
const FAN_ORIGIN = [1266, 400];
const EMB = [
  {
    id: "human",
    name: "Human hand",
    at: [1425, 182],
    pads: [180, -44, -15, 15, 44],
    route: "M1268 400 C 1318 398 1344 268 1394 208",
    verdict: "Source",
    state: "src",
    contacts: { A: 18.4, B: 12.0, C: 0.6, D: 0.4, E: 0.3 },
    bearing: ["A", "B"],
    rows: [
      ["Contacts", "5"],
      ["Load-bearing", "2 of 5"],
      ["Resting, zero force", "3 of 5"],
    ],
    noteKey: "Reading",
    note: "Video sees five fingers and has to treat all five as meaningful. Measured force shows which two did the work.",
  },
  {
    id: "five",
    name: "Five-digit hand",
    at: [1523, 317],
    pads: [180, -44, -15, 15, 44],
    route: "M1268 400 C 1340 398 1410 350 1486 322",
    verdict: "Feasible",
    state: "pass",
    contacts: { A: 18.9, B: 12.4, C: 0.6, D: 0.4, E: 0.3 },
    bearing: ["A", "B"],
    rows: [
      ["Force closure", "satisfied"],
      ["Required twist", "within capacity"],
      ["Margin", "1.8×"],
    ],
    noteKey: "Reading",
    note: "Near-direct transfer. The job description barely has to be re-solved.",
  },
  {
    id: "three",
    name: "Three-finger",
    at: [1523, 483],
    pads: [180, -40, 40],
    route: "M1268 400 C 1340 402 1410 452 1486 478",
    verdict: "Feasible",
    state: "pass",
    contacts: { A: 21.2, B: 13.8, D: 9.6 },
    bearing: ["A", "B", "D"],
    rows: [
      ["Force closure", "satisfied on 3"],
      ["Required twist", "within capacity"],
      ["Margin", "1.4×"],
    ],
    noteKey: "Reading",
    note: "The two load-bearing contacts are kept and one is added for closure. The three resting fingers are dropped; they were never part of the job.",
  },
  {
    id: "jaw",
    name: "Parallel jaw",
    at: [1425, 618],
    pads: [180, 0],
    route: "M1268 400 C 1318 402 1344 532 1394 592",
    verdict: "Cannot execute",
    state: "fail",
    contacts: { A: 26.5, C: 26.5 },
    bearing: ["A", "C"],
    rows: [
      ["Force closure", "satisfied"],
      ["Required twist", "exceeds capacity"],
      ["Shortfall", "0.6×"],
    ],
    noteKey: "Workaround",
    note: "Fixture the object and re-grip in two stages, or introduce a tool. The new plan is re-checked before it is offered.",
  },
];

/* ---------- helpers ---------- */

function useMeasured() {
  return useCallback((el) => {
    if (el && el.getTotalLength) {
      el.style.setProperty("--len", el.getTotalLength().toFixed(1));
    }
  }, []);
}

/* a grasp diagram: the object in cross-section, pads where it is held */
function Grip({ pads, r = 25 }) {
  return (
    <g>
      <circle className="sm-grip-body" cx="0" cy="0" r={r} />
      {pads.map((a) => {
        const t = (a * Math.PI) / 180;
        const x = Math.cos(t) * r;
        const y = Math.sin(t) * r;
        return (
          <g key={a} transform={`translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${a})`}>
            <rect className="sm-grip-pad" x="-1.5" y="-6" width="6" height="12" rx="1.4" />
          </g>
        );
      })}
    </g>
  );
}

/* an engraved force vector leaving the surface */
function Vec({ id, p, n, mag, lit, on }) {
  const L = 9 + mag * 2.0;
  const x2 = p[0] + n[0] * L;
  const y2 = p[1] + n[1] * L;
  const a = (Math.atan2(n[1], n[0]) * 180) / Math.PI;
  const lx = p[0] + n[0] * (L + 9);
  const ly = p[1] + n[1] * (L + 9);
  return (
    <g className={"sm-vec" + (lit ? " is-lit" : "")} data-on={on ? "1" : "0"}>
      <line x1={p[0]} y1={p[1]} x2={x2} y2={y2} />
      <g transform={`translate(${x2.toFixed(2)} ${y2.toFixed(2)}) rotate(${a.toFixed(1)})`}>
        <path className="sm-vec-head" d="M0 0 L-6 -3 L-6 3 Z" />
      </g>
      <text
        className="sm-vec-lab"
        x={lx.toFixed(1)}
        y={(ly + 3.4).toFixed(1)}
        textAnchor={n[0] < 0 ? "end" : "start"}
      >
        {mag.toFixed(1)} N
      </text>
    </g>
  );
}

/* ============================================================
   the sheet
   ============================================================ */

function Sheet({ sel, setSel, stage, focus, setFocus }) {
  const measure = useMeasured();
  const e = EMB[sel];
  const active = Object.keys(e.contacts);

  /* lineage: what stays lit when something is held */
  const spine = ["spine", "brace", "record", "ring", "seal", "fan:" + e.id];
  let lit = null;
  if (focus) {
    if (focus.startsWith("s:")) {
      const k = focus.slice(2);
      lit = new Set([
        focus,
        "route:" + k,
        ...active.map((c) => "feed:" + c),
        ...active.map((c) => "cp:" + c),
        ...spine,
      ]);
    } else if (focus.startsWith("c:")) {
      const k = focus.slice(2);
      lit = new Set([focus, "feed:" + k, "cp:" + k, "vec:" + k, ...spine]);
    } else if (focus.startsWith("e:")) {
      const k = focus.slice(2);
      lit = new Set([
        focus,
        "fan:" + k,
        ...STREAMS.map((s) => "route:" + s.id),
        ...STREAMS.map((s) => "s:" + s.id),
        ...active.map((c) => "feed:" + c),
        ...active.map((c) => "cp:" + c),
        "spine",
        "brace",
        "record",
        "ring",
        "seal",
      ]);
    }
  }
  const dim = (id) => (lit && !lit.has(id) ? " is-dim" : "");

  const V = VESSEL;

  return (
    <svg
      className={"sm-sheet" + (focus ? " is-focus" : "")}
      viewBox="0 0 1640 716"
      role="img"
      aria-label="System schematic: six measurement streams gather onto a held object, the measured contact forces are certified into one record, and that record is recompiled onto four different robot bodies."
    >
      {/* sheet furniture */}
      <g className="sm-tick">
        <path d="M22 44 L22 22 L44 22" />
        <path d="M1596 22 L1618 22 L1618 44" />
        <path d="M22 672 L22 694 L44 694" />
        <path d="M1596 694 L1618 694 L1618 672" />
      </g>
      <text className="sm-sheet-id" x="22" y="710">
        physcript · touchstone · system schematic
      </text>
      <text className="sm-sheet-id" x="1618" y="710" textAnchor="end">
        sheet 01 · rev 0.1 · not to scale
      </text>

      {/* zone rules */}
      <g className="sm-zone" data-on={stage >= 1 ? "1" : "0"}>
        <line x1="70" y1="108" x2="560" y2="108" />
        <text className="sm-zone-lab" x="70" y="98">
          I · the world measures
        </text>
        <line x1="600" y1="108" x2="1010" y2="108" />
        <text className="sm-zone-lab" x="600" y="98">
          II · the object is the ledger
        </text>
        <line x1="1046" y1="108" x2="1276" y2="108" />
        <text className="sm-zone-lab" x="1046" y="98">
          III · certified
        </text>
        <line x1="1310" y1="108" x2="1618" y2="108" />
        <text className="sm-zone-lab" x="1310" y="98">
          IV · recompiled per body
        </text>
      </g>

      {/* ---------- I. streams ---------- */}
      {STREAMS.map((s, i) => (
        <g
          key={s.id}
          className={"sm-stream" + dim("s:" + s.id)}
          style={{ "--sd": 0.07 * i + "s" }}
          data-on={stage >= 1 ? "1" : "0"}
          onMouseEnter={() => setFocus("s:" + s.id)}
          onMouseLeave={() => setFocus(null)}
        >
          <circle className="sm-src" cx="86" cy={s.y} r="11" />
          <circle className="sm-src-core" cx="86" cy={s.y} r="3.4" />
          <text className="sm-src-n" x="112" y={s.y - 3}>
            {s.n}
          </text>
          <text className="sm-src-q" x="112" y={s.y + 13}>
            {s.q}
          </text>
          <line className="sm-src-rule" x1="112" y1={s.y + 22} x2="296" y2={s.y + 22} />
        </g>
      ))}

      {STREAMS.map((s, i) => (
        <path
          key={s.id}
          ref={measure}
          className={"sm-route" + dim("route:" + s.id)}
          style={{ "--d": 0.08 * i + "s" }}
          data-on={stage >= 2 ? "1" : "0"}
          d={s.route}
        />
      ))}

      {stage >= 2 &&
        STREAMS.map((s, i) => (
          <rect
            key={s.id}
            className="sm-pkt"
            width="7"
            height="2.6"
            style={{
              offsetPath: `path("${s.route}")`,
              animationDelay: 0.9 + i * 0.34 + "s",
            }}
          />
        ))}

      {/* gather knot */}
      <g data-on={stage >= 2 ? "1" : "0"}>
        <circle className="sm-knot" cx={GATHER[0]} cy={GATHER[1]} r="5" />
        <line
          className={"sm-spine" + dim("spine")}
          x1={GATHER[0]}
          y1={GATHER[1]}
          x2={SPINE[0]}
          y2={SPINE[1]}
        />
      </g>

      {/* ---------- II. the specimen ---------- */}
      {active.map((k, i) => (
        <path
          key={k}
          ref={measure}
          className={"sm-feed" + dim("feed:" + k)}
          style={{ "--d": 0.07 * i + "s" }}
          data-on={stage >= 3 ? "1" : "0"}
          d={FEED[k]}
        />
      ))}

      <g className="sm-obj" data-on={stage >= 1 ? "1" : "0"}>
        <path
          className="sm-obj-fill"
          d={`M${V.cx - V.rimRx} ${V.rimY} L${V.cx - V.botRx} ${V.botY} A${V.botRx} ${V.botRy} 0 0 0 ${
            V.cx + V.botRx
          } ${V.botY} L${V.cx + V.rimRx} ${V.rimY} Z`}
        />
        <ellipse
          className="sm-obj-fill"
          cx={V.cx}
          cy={V.rimY}
          rx={V.rimRx}
          ry={V.rimRy}
        />
        <ellipse
          className="sm-obj-inner"
          cx={V.cx}
          cy={V.rimY}
          rx={V.rimRx - 11}
          ry={V.rimRy - 3.4}
        />
        <path
          className="sm-obj-hidden"
          d={`M${V.cx - V.botRx} ${V.botY} A${V.botRx} ${V.botRy} 0 0 1 ${
            V.cx + V.botRx
          } ${V.botY}`}
        />
        <text className="sm-obj-lab" x={V.cx} y={V.botY + 116} textAnchor="middle">
          the held object
        </text>
        <text className="sm-obj-sub" x={V.cx} y={V.botY + 132} textAnchor="middle">
          scanned first, so every contact has coordinates
        </text>
      </g>

      {/* contacts + vectors */}
      {active.map((k) => {
        const s = SITE[k];
        const mag = e.contacts[k];
        const bear = e.bearing.includes(k);
        return (
          <g
            key={k}
            className={"sm-cp" + (bear ? " is-bear" : "") + dim("cp:" + k)}
            style={{ "--sd": 0.09 * active.indexOf(k) + "s" }}
            data-on={stage >= 3 ? "1" : "0"}
            onMouseEnter={() => setFocus("c:" + k)}
            onMouseLeave={() => setFocus(null)}
          >
            <circle className="sm-cp-halo" cx={s.p[0]} cy={s.p[1]} r="13" />
            <circle className="sm-cp-dot" cx={s.p[0]} cy={s.p[1]} r="4.2" />
          </g>
        );
      })}

      {active.map((k) => {
        const s = SITE[k];
        const bear = e.bearing.includes(k);
        return (
          <Vec
            key={k}
            id={k}
            p={s.p}
            n={s.n}
            mag={e.contacts[k]}
            lit={bear}
            on={stage >= 4}
          />
        );
      })}

      {/* gather brace */}
      <g data-on={stage >= 5 ? "1" : "0"} className={dim("brace").trim()}>
        <path className="sm-brace" d="M972 330 C 986 330 986 392 1000 400 C 986 408 986 470 972 470" />
        <text className="sm-brace-lab" x="986" y="316" textAnchor="middle">
          measured wrench
        </text>
        <line className="sm-spine" x1="1000" y1="400" x2="1046" y2="400" />
      </g>

      {/* ---------- III. record + certification ---------- */}
      <g className={"sm-rec" + dim("record")} data-on={stage >= 5 ? "1" : "0"}>
        <rect className="sm-rec-body" x="1078" y="332" width="150" height="136" />
        <line className="sm-rec-rule" x1="1094" y1="358" x2="1212" y2="358" />
        {[376, 390, 404, 418, 432].map((y, i) => (
          <line
            key={y}
            className="sm-rec-line"
            x1="1094"
            y1={y}
            x2={i % 2 ? 1188 : 1212}
            y2={y}
          />
        ))}
        <rect className="sm-rec-mark" x="1094" y="444" width="34" height="7" />
        <text className="sm-rec-lab" x="1094" y="350">
          RECORD
        </text>
      </g>

      <circle
        ref={measure}
        className={"sm-ring" + dim("ring")}
        data-on={stage >= 6 ? "1" : "0"}
        cx="1153"
        cy="400"
        r="112"
        transform="rotate(-90 1153 400)"
      />

      <g className={"sm-seal" + dim("seal")} data-on={stage >= 6 ? "1" : "0"}>
        <circle className="sm-seal-ring" cx="1246" cy="308" r="27" />
        <circle className="sm-seal-ring" cx="1246" cy="308" r="22.5" />
        <text className="sm-seal-t" x="1246" y="305" textAnchor="middle">
          CERT
        </text>
        <text className="sm-seal-t" x="1246" y="316" textAnchor="middle">
          v0.1
        </text>
      </g>

      <text className="sm-cert-cap" x="1153" y="546" textAnchor="middle">
        every number carries where it came from
      </text>

      {/* ---------- IV. the fan ---------- */}
      {EMB.map((m, i) => (
        <path
          key={m.id}
          ref={measure}
          className={
            "sm-fan" + (i === sel ? " is-on" : "") + dim("fan:" + m.id)
          }
          style={{ "--d": 0.08 * i + "s" }}
          data-on={stage >= 7 ? "1" : "0"}
          d={m.route}
        />
      ))}

      {stage >= 7 && (
        <rect
          key={e.id}
          className="sm-pkt is-hot"
          width="8"
          height="2.8"
          style={{ offsetPath: `path("${e.route}")`, animationDelay: "0.2s" }}
        />
      )}

      {/* outer g carries the position, inner g carries the reveal transform,
          so the two never fight over the transform property */}
      {EMB.map((m, i) => (
        <g key={m.id} transform={`translate(${m.at[0]} ${m.at[1]})`}>
          <g
            className={
              "sm-emb" +
              (i === sel ? " is-sel" : "") +
              (m.state === "fail" ? " is-fail" : "") +
              dim("e:" + m.id)
            }
            style={{ "--sd": 0.09 * i + "s" }}
            data-on={stage >= 7 ? "1" : "0"}
            role="button"
            tabIndex={0}
            aria-pressed={i === sel}
            aria-label={m.name}
            onClick={() => setSel(i)}
            onKeyDown={(ev) => {
              if (ev.key === "Enter" || ev.key === " ") {
                ev.preventDefault();
                setSel(i);
              }
            }}
            onMouseEnter={() => setFocus("e:" + m.id)}
            onMouseLeave={() => setFocus(null)}
          >
            <circle className="sm-emb-hit" cx="0" cy="6" r="46" />
            <Grip pads={m.pads} />
            <text className="sm-emb-n" x="0" y="46" textAnchor="middle">
              {m.name}
            </text>
            <text className="sm-emb-v" x="0" y="60" textAnchor="middle">
              {m.verdict}
            </text>
          </g>
        </g>
      ))}
    </svg>
  );
}

/* ============================================================
   compounding cycle
   ============================================================ */

const CYCLE = [
  ["01", "More certified force", "measured where the lineage is written down"],
  ["02", "Better prediction", "cheap signals stand in for the instrument"],
  ["03", "Cheaper stations pass", "certification stops being a budget line"],
  ["04", "More stations in the field", "and the loop closes tighter than it opened"],
];

function Cycle() {
  /* a vertical chain with one return leg in the left margin: captions sit to
     the right of the spine, so nothing the eye reads is ever crossed by a rule */
  const X = 112;
  const CY = [62, 148, 234, 320];
  return (
    <svg className="sm-cyc" viewBox="0 0 540 400" role="img" aria-label="A four-step loop in which certified force data improves prediction, which lowers the cost of certification, which puts more stations in the field, which produces more certified force data.">
      <defs>
        <marker
          id="smArrow"
          viewBox="0 0 8 8"
          refX="7"
          refY="4"
          markerWidth="7"
          markerHeight="7"
          orient="auto"
        >
          <path d="M0 0 L8 4 L0 8 Z" fill="#1e1d1b" />
        </marker>
      </defs>

      {CY.slice(0, 3).map((cy, i) => (
        <path
          key={cy}
          className="sm-cyc-arc"
          d={`M${X} ${cy + 17} L${X} ${CY[i + 1] - 19}`}
          markerEnd="url(#smArrow)"
        />
      ))}

      {/* the loop closing on itself */}
      <path
        className="sm-cyc-arc"
        d={`M${X - 17} ${CY[3]} L58 ${CY[3]} Q44 ${CY[3]} 44 ${CY[3] - 14} L44 ${
          CY[0] + 14
        } Q44 ${CY[0]} 58 ${CY[0]} L${X - 19} ${CY[0]}`}
        markerEnd="url(#smArrow)"
      />

      {CYCLE.map(([n, t, s], i) => (
        <g key={n} transform={`translate(${X} ${CY[i]})`}>
          <circle className="sm-cyc-dot" cx="0" cy="0" r="15" />
          <text className="sm-cyc-num" x="0" y="3.6" textAnchor="middle">
            {n}
          </text>
          <text className="sm-cyc-t" x="34" y="-2">
            {t}
          </text>
          <text className="sm-cyc-s" x="34" y="14">
            {s}
          </text>
        </g>
      ))}

      <text className="sm-cyc-foot" x="270" y="382" textAnchor="middle">
        and every new grasp sharpens the friction estimates behind the old records too
      </text>
    </svg>
  );
}

/* ============================================================
   the layers, as a stratigraphic section
   ============================================================ */

const STRATA = [
  ["05", "Capability compiler", "can this body do it? and if not, what would?"],
  ["04", "Curation", "what in this demonstration was worth keeping"],
  ["03", "Friction ledger", "every grasp is also an experiment"],
  ["02", "Trust chain", "a station is only as good as its last check"],
  ["01", "The format", "one way to write down a contact and a force"],
];

function Section() {
  const H = 62;
  const TOP = 34;
  return (
    <svg className="sm-strata" viewBox="0 0 640 386" role="img" aria-label="A cross-section of five layers: the format at the base, then the trust chain, friction ledger, curation, and the capability compiler at the top.">
      <defs>
        <pattern id="smH1" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="#1e1d1b" strokeWidth="0.7" opacity="0.2" />
        </pattern>
        <pattern id="smH2" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="9" stroke="#1e1d1b" strokeWidth="0.7" opacity="0.15" />
        </pattern>
        <pattern id="smH3" width="7" height="7" patternUnits="userSpaceOnUse">
          <circle cx="1.4" cy="1.4" r="0.9" fill="#1e1d1b" opacity="0.16" />
        </pattern>
        <pattern id="smH4" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
          <line x1="0" y1="0" x2="0" y2="10" stroke="#1e1d1b" strokeWidth="0.7" opacity="0.13" />
        </pattern>
      </defs>
      {STRATA.map(([n, t, s], i) => {
        const y = TOP + i * H;
        const fill = ["url(#smH4)", "url(#smH3)", "url(#smH2)", "url(#smH1)", "none"][i];
        return (
          <g key={n} className="sm-str">
            <rect className="sm-str-box" x="20" y={y} width="214" height={H} fill={fill} />
            <text className="sm-str-num" x="34" y={y + 25}>
              {n}
            </text>
            <line className="sm-str-lead" x1="234" y1={y + H / 2} x2="270" y2={y + H / 2} />
            <circle className="sm-str-tip" cx="270" cy={y + H / 2} r="2.4" />
            <text className="sm-str-t" x="284" y={y + H / 2 - 3}>
              {t}
            </text>
            <text className="sm-str-s" x="284" y={y + H / 2 + 13}>
              {s}
            </text>
          </g>
        );
      })}
      <line className="sm-str-datum" x1="20" y1={TOP + 5 * H} x2="620" y2={TOP + 5 * H} />
      <text className="sm-str-datum-lab" x="20" y={TOP + 5 * H + 18}>
        substrate — everything above reads and writes this
      </text>
      <text className="sm-str-datum-lab" x="20" y={TOP - 12}>
        surface — where the value is taken out
      </text>
    </svg>
  );
}

/* ============================================================
   page
   ============================================================ */

const STAGE_CAP = [
  "the sheet is dormant",
  "six streams, one object, four bodies",
  "the world begins to measure",
  "contacts land on a surface that was scanned first",
  "force leaves the hand and is written down",
  "five contacts become one wrench",
  "the record is sealed against a known standard",
  "and recompiled for whichever body is asked for",
];

export default function SystemMap() {
  const [stage, setStage] = useState(0);
  const [sel, setSel] = useState(1);
  const [focus, setFocus] = useState(null);
  const [coarse, setCoarse] = useState(false);
  const holder = useRef(null);
  const timers = useRef([]);

  useEffect(() => {
    setCoarse(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  /* Each stage overlaps the one before it: a route is still drawing when the
     thing it feeds begins to arrive, so the sheet fills in as one motion
     rather than seven separate pops. */
  const play = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setStage(0);
    const marks = [0, 220, 700, 1180, 1620, 1980, 2360];
    marks.forEach((ms, i) => {
      timers.current.push(setTimeout(() => setStage(i + 1), ms));
    });
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStage(7);
      return;
    }
    /* one frame, so every path has measured itself before it is asked to draw */
    const raf = requestAnimationFrame(play);
    return () => {
      cancelAnimationFrame(raf);
      timers.current.forEach(clearTimeout);
    };
  }, [play]);

  const e = EMB[sel];

  return (
    <main className={"sm" + (coarse ? " coarse" : "")}>
      <CustomCursor />
      <header className="sm-bar">
        <Link href="/" className="sm-bar-mark">
          <span className="sm-brk">[</span>physcript<span className="sm-brk">]</span>
        </Link>
        <div className="sm-bar-mid">
          <b>TOUCHSTONE</b>
          <span>system schematic</span>
        </div>
        <div className="sm-bar-right">
          <Link href="/touchstone/detailed">read the long sheet →</Link>
          <a href="mailto:pranav@physcri.pt">contact</a>
        </div>
      </header>

      <section className="sm-wrap sm-mast">
        <p className="sm-eyebrow">MVP-0 · TOUCHSTONE · sheet 01 · rev 0.1</p>
        <h1 className="sm-title">
          Robots learned to see from a billion photographs.
          <em> Nothing ever recorded how hard a hand pressed.</em>
        </h1>
        <div className="sm-mast-foot">
          <p className="sm-lede">
            This is the whole system on one sheet. The object in the middle is the
            ledger. Everything to the left of it is how the world measures what
            happens to it; everything to the right is what that measurement is
            worth once you try to hand it to a machine.
          </p>
          <dl className="sm-key">
            <div>
              <dt>Measured</dt>
              <dd>
                <i className="sm-sw m" /> read from an instrument
              </dd>
            </div>
            <div>
              <dt>Certified</dt>
              <dd>
                <i className="sm-sw c" /> traceable to a known standard
              </dd>
            </div>
            <div>
              <dt>Refused</dt>
              <dd>
                <i className="sm-sw f" /> the honest answer when it cannot be done
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* ---------------- the sheet ---------------- */}
      <section className="sm-stage-wrap" ref={holder}>
        <div className="sm-stage-head sm-wrap">
          <p className="sm-stage-cap">
            <span>{String(stage).padStart(2, "0")}</span>
            {STAGE_CAP[stage]}
          </p>
          <button className="sm-replay" type="button" onClick={play}>
            run the sheet again
          </button>
        </div>

        <div className="sm-scroller">
          <div className="sm-canvas">
            <Sheet
              sel={sel}
              setSel={setSel}
              stage={stage}
              focus={focus}
              setFocus={setFocus}
            />
          </div>
        </div>
        <p className="sm-hint">
          hover any element to isolate its lineage · choose a body on the right
        </p>
      </section>

      {/* ---------------- readout ---------------- */}
      <section className="sm-wrap sm-readout">
        <div className="sm-seg" role="group" aria-label="Choose a body">
          {EMB.map((m, i) => (
            <button
              key={m.id}
              type="button"
              aria-pressed={i === sel}
              onClick={() => setSel(i)}
            >
              {m.name}
            </button>
          ))}
        </div>

        <div className="sm-verdict-grid">
          <div>
            <div className="sm-verdict-line">
              <span className="sm-vl">Verdict</span>
              <strong className={"sm-vw " + e.state}>{e.verdict}</strong>
            </div>
            <dl className="sm-rows">
              {e.rows.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <i className="sm-lead" aria-hidden="true" />
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <p className="sm-hang">
            <span>{e.noteKey}</span>
            {e.note}
          </p>
        </div>
      </section>

      {/* ---------------- streams legend ---------------- */}
      <section className="sm-wrap sm-sec">
        <div className="sm-sec-head">
          <div className="sm-sec-num">I</div>
          <div>
            <h2 className="sm-h2">Do not instrument the human.</h2>
            <p className="sm-body">
              A glove changes the grip it was brought in to record. So the bench,
              the tools and the objects do the measuring instead, and the person
              just works. Six streams, each answering exactly one question.
            </p>
          </div>
        </div>
        <ol className="sm-streams">
          {STREAMS.map((s, i) => (
            <li
              key={s.id}
              onMouseEnter={() => setFocus("s:" + s.id)}
              onMouseLeave={() => setFocus(null)}
            >
              <span className="sm-str-i">{String(i + 1).padStart(2, "0")}</span>
              <span className="sm-str-name">{s.n}</span>
              <i className="sm-lead" aria-hidden="true" />
              <span className="sm-str-q">{s.q}</span>
              <p>{s.d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------------- cycle ---------------- */}
      <section className="sm-wrap sm-sec sm-sec-split">
        <div className="sm-sec-head">
          <div className="sm-sec-num">II</div>
          <div>
            <h2 className="sm-h2">Why it compounds.</h2>
            <p className="sm-body">
              A dataset is a pile. A standard is a position. Each certified
              demonstration makes it cheaper to certify the next station, and each
              new station returns more certified demonstrations — including
              corrections that reach backwards into records already collected.
            </p>
          </div>
        </div>
        <Cycle />
      </section>

      {/* ---------------- strata ---------------- */}
      <section className="sm-wrap sm-sec sm-sec-split">
        <div className="sm-sec-head">
          <div className="sm-sec-num">III</div>
          <div>
            <h2 className="sm-h2">Five layers, bottom up.</h2>
            <p className="sm-body">
              Nothing here works alone. The format is a substrate; the middle
              layers fill it with data you have a reason to believe; the top layer
              is the only one that spends any of it.
            </p>
          </div>
        </div>
        <Section />
      </section>

      {/* ---------------- close ---------------- */}
      <section className="sm-wrap sm-end-sec">
        <p className="sm-pull">
          The measurement is the product. The chain that makes it believable is
          the position.
        </p>
        <Link href="/touchstone/detailed" className="sm-next">
          <span>Next sheet</span>
          <strong>Touchstone — the long form, in full sentences →</strong>
        </Link>
        <div className="sm-title-block">
          <div>
            <dt>Sheet</dt>
            <dd>01 · system schematic</dd>
          </div>
          <div>
            <dt>Revision</dt>
            <dd>0.1</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>in progress</dd>
          </div>
          <div>
            <dt>Enquiries</dt>
            <dd>
              <a href="mailto:pranav@physcri.pt">pranav@physcri.pt</a>
            </dd>
          </div>
        </div>
        <p className="sm-end">
          <span>physcript</span>
          <span>the force layer for physical AI</span>
        </p>
      </section>
    </main>
  );
}
