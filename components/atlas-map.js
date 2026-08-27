/* ============================================================
   THE ATLAS — graph, geometry and readouts
   Pure data. One sheet, six columns, five tethers.

     WHY → CAPTURE → COMPILE → THE RECORD → CONSUME → DEPLOY
                and, hanging beneath it, the five gates,
                each tethered to exactly what it can kill.

   Disclosure: this file holds only what 07 Pitch/What Not To
   Reveal marks freely shareable. Block categories, not layouts.
   Purposes, not mechanisms. No thresholds, no BOM.
   ============================================================ */

export const SHEET = { w: 1700, h: 946 };

export const SPINE = 330;

/* ---------- columns ---------- */

const COL = {
  gap: { x: 30, w: 168 },
  thesis: { x: 232, w: 200 },
  cap: { x: 462, w: 182 },
  front: { x: 686, w: 214 },
  rec: { x: 942, w: 218 },
  back: { x: 1202, w: 214 },
  dep: { x: 1458, w: 196 },
};

export const ZONES = [
  ["I", "why", COL.gap.x, COL.thesis.x + COL.thesis.w],
  ["II", "capture", COL.cap.x, COL.cap.x + COL.cap.w],
  ["III", "compile", COL.front.x, COL.front.x + COL.front.w],
  ["IV", "the record", COL.rec.x, COL.rec.x + COL.rec.w],
  ["V", "consume", COL.back.x, COL.back.x + COL.back.w],
  ["VI", "deploy", COL.dep.x, COL.dep.x + COL.dep.w],
];

/* ---------- nodes ---------- */

const box = (c, y, h) => ({ x: COL[c].x, y, w: COL[c].w, h });

export const NODES = {
  "gap-force": {
    ...box("gap", 254, 64),
    kind: "gap",
    n: "The force-data gap",
    q: "video has no force channel",
    ev: "D",
    plain:
      "A hand gently holding a paper cup and a hand crushing it are visually identical — right up until the cup fails. Video carries no force channel at all.",
    tech: "Tactile gloves carry pressure patterns in relative units, not newtons, and carry no stiffness information whatever. The gap is not resolution. It is dimension: the quantity was never recorded.",
    note: "Correction we made to our own earlier position: glove interference is a graded concern, not a disqualifier. Our advantage over gloves is the stiffness channel and the calibration — not the bare fact of leaving the palm uncovered.",
  },
  "gap-emb": {
    ...box("gap", 342, 64),
    kind: "gap",
    n: "The embodiment gap",
    q: "there is nothing to copy",
    ev: "D",
    plain:
      "A human hand has roughly 23 kinematic degrees of freedom and five deformable pads. A parallel-jaw gripper has two rigid jaws. Copying joint angles across that difference is close to meaningless.",
    tech: "Which is exactly why retargeting research keeps fragmenting into one bespoke solution per robot. Kinematics do not transfer cleanly, because there is no real correspondence to transfer.",
  },

  thesis: {
    ...box("thesis", 278, 104),
    kind: "thesis",
    n: "The thesis",
    q: "one answer to both gaps",
    ev: "H",
    plain:
      "Stop recording the hand. Record what the hand did to the object, and how the arm was regulated while doing it.",
    tech: "A demonstration is not a trajectory. It is a trajectory, plus the wrench it induced on the object, plus the impedance the human regulated, plus the contact events that structure it — and every force and stiffness number in it carries a stated uncertainty.",
    note: "Two of those five channels are being commoditised right now. The other three exist in no dataset at any price. Gate K1 tests whether the second group is worth anything.",
  },

  "cap-b1": {
    ...box("cap", 144, 44),
    kind: "block",
    n: "Electrode array",
    q: "the primary channel",
    ev: "D",
    ships: "v0",
    feeds: ["rec-wrench", "rec-imp"],
    plain:
      "Electrodes reading the small electrical signal a muscle makes when it contracts. This is what says how hard the grip is — and, crucially, whether the arm is being tensed on purpose, which is the stiffness signal.",
    tech: "Myoelectric drive leads mechanical force by the electromechanical delay. Co-contraction shows up as simultaneous antagonist activity rather than as noise, which is what makes the impedance field achievable at all.",
    note: "Hard limit, never claimed away: intrinsic hand muscles are invisible from the forearm. The honest deliverable is resultant wrench and aggregate grip — never per-digit force.",
  },
  "cap-b2": {
    ...box("cap", 196, 44),
    kind: "block",
    n: "Ultrasound array",
    q: "fails differently",
    ev: "D",
    ships: "v1 · v3",
    feeds: ["rec-wrench", "rec-imp"],
    plain:
      "Sensors that watch the muscle move under the skin, the way a clinical ultrasound sees inside the body. More expensive than electrodes, but it does not get tired or sweaty the way the electrical signal does.",
    tech: "It is not the primary force channel and it earns its cost for one reason: it fails differently from the electrode array. Electrodes win on raw force accuracy; ultrasound wins on fatigue robustness. Fused, the system keeps both.",
    note: "Honest caveat carried forward: shear-wave velocity can change independently of force. Treat elastography as a calibrated index, never as an absolute per-muscle force meter.",
  },
  "cap-b3": {
    ...box("cap", 248, 44),
    kind: "block",
    n: "Tapper + accelerometers",
    q: "two risks in one block",
    ev: "I",
    ships: "v0 · v2",
    feeds: ["rec-wrench", "rec-evt"],
    plain:
      "Two very different things share one block. A pair of vibration sensors that hear the exact millisecond of touch, grip and release — cheap and safe. And a tension sensor that is the most original and least proven piece of hardware in the whole company.",
    tech: "An accelerometer sampled at kilohertz rates becomes a vibration microphone coupled to the body: it timestamps touch, release, slip onset and tool engagement to about a millisecond. That half is demonstrated and ships first. The tension half is direct-physics measurement, and the entire published literature for it is lower-limb.",
    note: "Treating this block as one confident unit is a planning error. Half A ships in v0. Half B waits behind gate K3.",
  },
  "cap-b4": {
    ...box("cap", 300, 44),
    kind: "block",
    n: "IMU cluster",
    q: "boring by design",
    ev: "D",
    ships: "v0",
    feeds: ["rec-kin"],
    plain:
      "The motion sensors — the same kind that is in a phone — tracking how the arm and wrist move through space.",
    tech: "Commodity, conflicts with nothing, mandatory in every configuration from v0 onward. Supplies the arm dynamics needed to resolve object-frame wrench from muscle-side estimates.",
  },
  "cap-b5": {
    ...box("cap", 352, 44),
    kind: "block",
    n: "FMG ring",
    q: "deliberately demoted",
    ev: "D",
    ships: "v0",
    feeds: ["rec-unc"],
    plain:
      "Cheap pressure sensors that feel how tightly the sleeve is pressing against the arm. It sounds like it is only checking whether the sleeve was put on properly. That is exactly the point.",
    tech: "Force myography can do more than this — but its reading depends on how tightly the sleeve was donned, which makes it untrustworthy as a metrological channel. So it is not used as a force channel. It is used to observe the exact error source calibration exists to catch, and it fails by a completely different mechanism from every other block.",
  },
  "cap-art": {
    ...box("cap", 420, 44),
    kind: "standard",
    n: "Calibration artifact",
    q: "the transfer standard",
    ev: "R",
    ships: "v0",
    feeds: ["rec-wrench", "rec-imp", "rec-unc"],
    plain:
      "A handheld object that ships with every sleeve. You squeeze it during setup and it teaches the sleeve what real force in newtons looks like, instead of the sleeve guessing at relative numbers. It can also change its own stiffness while you hold it.",
    tech: "In metrology this is a transfer standard: a physical object of known, stable, traceable properties used to tie an instrument's readings to real units. Every serious measuring instrument has one. No robot-data-capture product ships one. That absence is the opening.",
    note: "The stiffness-change is what makes the impedance channel possible without the $30–50k robotic manipulandum the laboratory method requires. Construction and range are held back.",
  },
  "cap-cam": {
    ...box("cap", 472, 44),
    kind: "given",
    n: "Egocentric camera",
    q: "customer-supplied",
    ev: "D",
    ships: "v0",
    feeds: ["rec-kin"],
    plain:
      "An ordinary action camera the customer already owns. Not part of what we sell.",
    tech: "The Record must be a strict superset of what a customer already collects, or nobody adopts it. The camera is the compatibility layer.",
  },

  L1: {
    ...box("front", 207, 54),
    kind: "layer",
    tag: "L1",
    n: "Physics-anchored fusion",
    q: "novelty 9 · risk high",
    ev: "I",
    feeds: ["rec-wrench"],
    plain:
      "Most systems that combine sensors treat them all as equally unreliable and blend them. We do not, because our channels are not peers.",
    tech: "A self-calibrating architecture in which one channel is grounded in direct physics and continuously corrects the learned ones, so calibration does not go stale during a shift. The specific loop is held back pre-term-sheet.",
    note: "Gated entirely on gate K3. If K3 fails, L1 degrades to conventional multimodal fusion with periodic recalibration — perfectly serviceable, and not novel.",
  },
  L2: {
    ...box("front", 271, 54),
    kind: "layer",
    tag: "L2",
    n: "Conformal force intervals",
    q: "novelty 8 · risk medium",
    ev: "R",
    feeds: ["rec-unc"],
    plain:
      "Instead of saying the force was about 4 newtons and hoping that is trustworthy, we say it was 4.2 newtons and state the range the true value sits in, at a coverage level we can check.",
    tech: "Conformal prediction has non-asymptotic, distribution-free coverage guarantees — no assumptions about the regression function, no priors, valid at small sample sizes. It has been applied to wearables. We have found no prior application to continuous force regression.",
    note: "Validated against the public HYSER dataset, predictions frozen before any model was fit. That is the one part of this map with real evidence behind it.",
  },
  L3: {
    ...box("front", 335, 54),
    kind: "layer",
    tag: "L3",
    n: "Hybrid physics-ML",
    q: "novelty 4 · risk low",
    ev: "D",
    feeds: ["rec-wrench"],
    plain:
      "We do not let a black box guess forces freely. Its guesses are constrained by real biomechanics, so it cannot output something anatomically impossible.",
    tech: "Musculoskeletal forward dynamics constrains the estimator so outputs are physically realisable. Adopt, do not reinvent — the physics-informed literature here is mature. This layer is not where the moat lives.",
  },
  L4: {
    ...box("front", 399, 54),
    kind: "layer",
    tag: "L4",
    n: "Missing-modality robustness",
    q: "novelty 3 · essential",
    ev: "D",
    feeds: ["rec-unc"],
    plain:
      "Different customers will own different versions of the sleeve. This makes one piece of software work for all of them, instead of a separate model per hardware combination.",
    tech: "Masked-modality pretraining — random channel dropout during training — so the model degrades gracefully across arbitrary sensor subsets. Without it, the staged roadmap would multiply engineering cost by five.",
  },

  record: {
    ...box("rec", 200, 260),
    kind: "record",
    n: "The Record",
    q: "L5 · the intermediate representation",
    ev: "R",
    plain:
      "This is the file format Touchstone actually sells. Every demonstration becomes one of these: where things moved, how hard they were pushed, how stiff the arm was, exactly when contact happened, and how confident we are in all of it.",
    tech: "Sleeve streams are the source language. Robot actions are the target. The Record is the intermediate representation between them, the way LLVM's IR sits between source code and machine code. Whoever defines the IR owns the ecosystem.",
    note: "Each field is independently validated in the literature. The combination exists nowhere. Design decision: publish the format openly, keep the estimators — the value is not in the format, it is in being the only party who can fill it correctly.",
  },

  L6: {
    ...box("back", 266, 54),
    kind: "layer",
    tag: "L6",
    n: "Uncertainty weighting",
    full: "L6 · Uncertainty-weighted learning",
    q: "novelty 7 · risk medium",
    ev: "I",
    plain:
      "Once every data point carries an honest confidence number, that number can be used to train robots better — trusting the confident measurements more and the shaky ones less, automatically.",
    tech: "Machinery for handling noisy demonstrations exists, but all of it weights by demonstrator suboptimality. None weights by sensor-derived measurement uncertainty, because no dataset has ever carried per-sample sensor uncertainty. Supplying it makes this a joint hardware-and-algorithm contribution.",
  },
  L7: {
    ...box("back", 340, 54),
    kind: "layer",
    tag: "L7",
    n: "Privileged distillation",
    q: "novelty 3 · the sales argument",
    ev: "D",
    plain:
      "The sleeve is expensive and only a human can wear it. Robots in the field have neither. So the rich data teaches, and the robot operates later using only the sensors it actually has.",
    tech: "Train with the sleeve's channels as privileged information; deploy without them. The prior art is solid and we adopt it rather than reinventing it.",
    note: "One sleeve-collected dataset upgrades an entire fleet of force-blind robots, permanently, with no hardware change on the robots. This is the strongest commercial argument the system has.",
  },

  "dep-any": {
    ...box("dep", 236, 56),
    kind: "out",
    n: "Any robot body",
    q: "wrench is morphology-invariant",
    ev: "D",
    plain:
      "The same recorded job can be handed to a five-digit hand, a three-finger gripper or a parallel jaw — and when it cannot, the honest answer is a refusal with a workaround, not a silent bad grasp.",
    tech: "Wrench is recorded in the object's frame, not the hand's. Hand-frame forces are morphology-specific; object-frame wrench is not. That single choice is what makes the Record directly consumable by cross-embodiment methods.",
  },
  "dep-fleet": {
    ...box("dep", 302, 56),
    kind: "out",
    n: "Force-blind fleets",
    q: "upgraded with no new hardware",
    ev: "D",
    plain:
      "Robots already in the field, with nothing but a camera, get better at force-sensitive work because of data collected by somebody wearing a sleeve somewhere else.",
    tech: "This is why our cost does not scale with a customer's fleet size, and why an independent result that distils force supervision so inference stays vision-only increases rather than decreases demand for force-labelled corpora — distillation needs a source to distil from.",
  },
  "dep-cert": {
    ...box("dep", 368, 56),
    kind: "out",
    n: "A certified unit of force",
    q: "traceable and re-verified",
    ev: "I",
    plain:
      "Not a pile of data. A unit of measurement other people can build on, with a certificate that says where the number came from and how far it can be trusted.",
    tech: "Traceable to a certified reference is only available to a party that owns a physical reference. That is what makes an ISO/IEC 17025-style certification business real rather than aspirational — and it is the recurring half of the model.",
  },
};

/* the five rows inside the Record plate */
export const FIELDS = [
  {
    id: "rec-kin",
    n: "Kinematics",
    rate: "200 Hz",
    what: "hand + object pose, arm dynamics",
    by: "commodity — everyone has this",
  },
  {
    id: "rec-wrench",
    n: "Wrench",
    rate: "200 Hz",
    what: "forces + torques induced ON the object, in the object's frame",
    by: "validated as an embodiment-agnostic space by CHORD (NVIDIA, 2026)",
  },
  {
    id: "rec-imp",
    n: "Impedance",
    rate: "50 Hz",
    what: "task-space stiffness ellipsoid over time",
    by: "tele-impedance and variable-impedance control literature",
  },
  {
    id: "rec-evt",
    n: "Contact events",
    rate: "±1 ms",
    what: "touch · load · lift · hold · slip · replace · release",
    by: "Johansson & Flanagan — contact events ARE the subgoals",
  },
  {
    id: "rec-unc",
    n: "Uncertainty",
    rate: "per sample",
    what: "a stated interval on every force and stiffness value",
    by: "conformal prediction — proven elsewhere, unclaimed here",
  },
];

export const FIELD_TEXT = {
  "rec-kin":
    "Where the hand and the object were, moment to moment. Every existing capture system already records this — it is the entry ticket, not the differentiator, and it is here so the Record is a strict superset of what a customer already collects.",
  "rec-wrench":
    "The push and twist the hand applied to the object — not to the hand's own joints, but to the object, in the object's own frame of reference. This is the number that transfers across a human hand, a two-jaw gripper or a five-fingered hand, because it does not care what applied it.",
  "rec-imp":
    "How stiff the arm and grip were made, and in which direction, at every moment. A camera cannot see it: two very different arm impedances look identical on film. A glove cannot feel it, because it does not live at the contact surface — it lives in the muscle. Only muscle-side sensing captures it, which means only a sleeve-shaped product can produce this field at all.",
  "rec-evt":
    "The exact millisecond things happen. These moments are the real structure of a manipulation task — everything between them is filling in the gaps. Cheapest field in the system to produce, and it converts raw continuous streams into segmented demonstrations, which is the form learning pipelines actually want.",
  "rec-unc":
    "The one field that is a mathematical object rather than a physical measurement. Every other field describes something that happened in the world; this one describes how much to trust the description. It is what turns calibrated from an adjective into a claim you can check.",
};

/* ---------- knots and edges ---------- */

export const KNOTS = {
  k0: [447, SPINE],
  k1: [673, SPINE],
  k2: [921, SPINE],
  k3: [1181, SPINE],
  k4: [1437, SPINE],
};

const right = (id) => {
  const b = NODES[id];
  return [b.x + b.w, b.y + b.h / 2];
};
const left = (id) => {
  const b = NODES[id];
  return [b.x, b.y + b.h / 2];
};

/* a flat S between two points, control arms scaled to the gap */
const arc = ([x1, y1], [x2, y2]) => {
  const d = Math.max(28, (x2 - x1) * 0.52);
  return `M${x1} ${y1} C${x1 + d} ${y1}, ${x2 - d} ${y2}, ${x2} ${y2}`;
};

const gather = (ids, knot) =>
  ids.map((id) => ({
    id: `e:${id}>${knot}`,
    from: id,
    to: knot,
    d: arc(right(id), KNOTS[knot]),
  }));

const fan = (knot, ids) =>
  ids.map((id) => ({
    id: `e:${knot}>${id}`,
    from: knot,
    to: id,
    d: arc(KNOTS[knot], left(id)),
  }));

const CAPTURE = [
  "cap-b1",
  "cap-b2",
  "cap-b3",
  "cap-b4",
  "cap-b5",
  "cap-art",
  "cap-cam",
];
const FRONT = ["L1", "L2", "L3", "L4"];
const BACK = ["L6", "L7"];
const OUT = ["dep-any", "dep-fleet", "dep-cert"];

export const EDGES = [
  {
    id: "e:gap-force>thesis",
    from: "gap-force",
    to: "thesis",
    d: arc(right("gap-force"), left("thesis")),
  },
  {
    id: "e:gap-emb>thesis",
    from: "gap-emb",
    to: "thesis",
    d: arc(right("gap-emb"), left("thesis")),
  },
  {
    id: "e:thesis>k0",
    from: "thesis",
    to: "k0",
    d: arc(right("thesis"), KNOTS.k0),
  },
  ...fan("k0", CAPTURE),
  ...gather(CAPTURE, "k1"),
  ...fan("k1", FRONT),
  ...gather(FRONT, "k2"),
  {
    id: "e:k2>record",
    from: "k2",
    to: "record",
    d: arc(KNOTS.k2, left("record")),
  },
  {
    id: "e:record>k3",
    from: "record",
    to: "k3",
    d: arc(right("record"), KNOTS.k3),
  },
  ...fan("k3", BACK),
  ...gather(BACK, "k4"),
  ...fan("k4", OUT),
];

/* the spine, for the packets that travel it */
export const SPINE_ROUTE =
  `M${KNOTS.k0[0]} ${SPINE} L${KNOTS.k1[0]} ${SPINE} ` +
  `L${KNOTS.k2[0]} ${SPINE} L${KNOTS.k3[0]} ${SPINE} L${KNOTS.k4[0]} ${SPINE}`;

/* ---------- adjacency, for lineage on hover ---------- */

const OUTS = {};
const INS = {};
EDGES.forEach((e) => {
  (OUTS[e.from] ||= []).push(e);
  (INS[e.to] ||= []).push(e);
});

/* everything upstream and downstream of a node, plus the edges between */
export function lineage(id) {
  const nodes = new Set([id]);
  const edges = new Set();
  const walk = (start, table, side) => {
    const queue = [start];
    while (queue.length) {
      const cur = queue.shift();
      (table[cur] || []).forEach((e) => {
        if (edges.has(e.id)) return;
        edges.add(e.id);
        const next = e[side];
        if (!nodes.has(next)) {
          nodes.add(next);
          queue.push(next);
        }
      });
    }
  };
  walk(id, OUTS, "to");
  walk(id, INS, "from");
  return { nodes, edges };
}

/* ---------- the gates ---------- */

export const GATE_W = 132;
export const GATE_H = 72;
export const GATE_Y = 700;

/* Tethers route through a vertical channel where a straight line would
   cross a column it has no business crossing. */
const tether = (gx, [ax, ay], channel) => {
  const top = GATE_Y;
  if (!channel) {
    return `M${gx} ${top} C${gx} ${top - 96}, ${ax} ${ay + 118}, ${ax} ${ay}`;
  }
  return (
    `M${gx} ${top} C${gx} ${top - 60}, ${channel} ${top - 84}, ${channel} ${top - 148} ` +
    `L${channel} ${ay + 56} C${channel} ${ay + 16}, ${channel + 16} ${ay}, ${ax} ${ay}`
  );
};

/* where a tether may attach, and the channel it must use to get there */
const ANCHOR = {
  "cap-b1": [[COL.cap.x, 166], 424],
  "cap-b2": [[COL.cap.x, 218], 424],
  "cap-b3": [[COL.cap.x, 270], 424],
  L1: [[COL.front.x, 234], 660],
  record: [[COL.rec.x + COL.rec.w / 2, 460], null],
  L6: [[COL.back.x + COL.back.w / 2, 320], null],
};

const G = [
  {
    id: "K1",
    x: 456,
    short: "channel value",
    n: "the channel-value experiment",
    kills: ["record", "L6"],
    marks: ["rec-imp", "rec-evt"],
    q: "Do the impedance and contact-event channels measurably improve force-sensitive policy performance beyond wrench alone?",
    needs: "v0 hardware only — no ultrasound, no tapper",
    fail: "Ship v0 only. Abandon the premium tier. Do not reframe the claim.",
    status: "not run",
    weight: "This is the one that can end the premium tier.",
    note: "Third-party evidence that force helps at all is strong and growing. All of it validates wrench beating kinematics-only. None of it touches K1's actual question, which is whether contact schedule, impedance and uncertainty weighting beat wrench alone. Nobody has run that comparison.",
  },
  {
    id: "K2",
    x: 622,
    short: "fatigue robustness",
    n: "fatigue robustness",
    kills: ["cap-b2"],
    marks: [],
    q: "Does ultrasound fusion hold force accuracy across a full four-hour capture shift, where the electrode channel alone degrades?",
    needs: "v1 hardware",
    fail: "Drop the ultrasound block. Rely on anchoring and more frequent re-verification.",
    status: "not run",
  },
  {
    id: "K3",
    x: 788,
    short: "wrist tensiometry",
    n: "wrist tensiometry",
    kills: ["cap-b3", "L1"],
    marks: [],
    q: "Does direct-physics tendon tension sensing work at the wrist with usable signal-to-noise?",
    needs: "v2 hardware — cheap to attempt relative to its information value",
    fail: "L1 degrades to conventional fusion. The highest-novelty hardware claim is withdrawn.",
    status: "not run",
    weight:
      "Highest-risk gate in the programme, and since 2026-08-20 the highest-value one too.",
    note: "The whole published literature for this measurement is lower-limb. The wrist is unclaimed territory — which is exactly why it is both our highest-novelty hardware claim and our highest technical risk, simultaneously. HYSER measured what it is worth: without it, re-donning the sleeve costs the user minutes of calibration every session. K3 decides between two different products.",
  },
  {
    id: "K4",
    x: 954,
    short: "measured stiffness",
    n: "measured versus inferred stiffness",
    kills: ["cap-b2", "record"],
    marks: ["rec-imp"],
    q: "Does direct elastography beat the cheaper inferred co-contraction estimate, judged against artifact ground truth?",
    needs: "v3 hardware",
    fail: "Keep the cheaper inferred impedance. Do not build v3.",
    status: "not run",
  },
  {
    id: "K5",
    x: 1120,
    short: "HD grid value",
    n: "high-density grid value",
    kills: ["cap-b1"],
    marks: [],
    q: "Do motor-unit features improve per-finger resolution enough to justify a tenfold increase in electrode channel count?",
    needs: "v4 hardware",
    fail: "Stay at low-density electrodes permanently.",
    status: "not run",
  },
];

export const GATES = G.map((g) => ({
  ...g,
  tethers: g.kills.map((k) => ({
    id: `t:${g.id}>${k}`,
    to: k,
    d: tether(g.x + GATE_W / 2, ANCHOR[k][0], ANCHOR[k][1]),
  })),
}));

/* ---------- the cascade ---------- */

export const STAGES = [
  "the sheet is dormant",
  "two gaps, and they turn out to share one answer",
  "seven things on an arm, and one object to squeeze",
  "raw signal is compiled into a record",
  "five fields, one of which nobody else ships",
  "the record is consumed, and the body it lands on can be anything",
  "and beneath all of it, what would kill each part",
];
