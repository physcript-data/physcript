"use client";

/* ============================================================
   THE LONG SHEET — sheet 02
   The full argument, in full sentences, with the drawings that
   carry the parts sentences do badly.

   Disclosure held to 07 Pitch/What Not To Reveal: categories and
   purposes are published; mechanisms, layouts, line-item costs
   and gate thresholds are not.
   ============================================================ */

import Link from "next/link";
import CustomCursor from "./CustomCursor";
import { Counter, Ev, EVIDENCE, useCoarse, useReveal } from "./sheet-kit";
import {
  Chain,
  Collapse,
  Curves,
  Layers,
  Matrix,
  Pipeline,
  PriceBand,
  Scorecard,
} from "./sheet-figs";

/* ---------- content ---------- */

const RECORD_FIELDS = [
  [
    "Kinematics",
    "hand + object pose, arm dynamics",
    "200 Hz",
    "commodity — everyone has this",
  ],
  [
    "Wrench",
    "forces + torques induced ON the object, in the object's frame",
    "200 Hz",
    "object-frame wrench validated as an embodiment-agnostic space by CHORD (NVIDIA, 2026)",
  ],
  [
    "Impedance",
    "task-space stiffness ellipsoid over time",
    "50 Hz",
    "tele-impedance and variable-impedance control, a mature literature",
  ],
  [
    "Contact events",
    "touch · load · lift · hold · slip · replace · release",
    "±1 ms",
    "Johansson & Flanagan — contact events are the subgoals of manipulation",
  ],
  [
    "Uncertainty",
    "a stated interval on every force and stiffness sample",
    "per sample",
    "conformal prediction — proven elsewhere, unclaimed here",
  ],
];

const SCHEMA = `demonstration:
  meta:
    subject_id, session_id, sleeve_serial, artifact_serial
    enrollment_ref, verification_ref, config, clock

  stream kinematics    @ 200 Hz  → SE(3) hand/object pose + arm state
  stream wrench        @ 200 Hz  → R^3 force, R^3 torque, object-fixed frame
  stream impedance     @  50 Hz  → R^3x3 stiffness (SPD), principal ellipsoid
  events  contacts     async     → touch | load | lift | hold | slip | replace | release
  stream quality       @   1 Hz  → donning_index, channel_health, drift_estimate`;

const LADDER = [
  ["v0", "electrodes · accelerometers · IMU · FMG · artifact · camera", "force, contact events, kinematics, uncertainty", "K1"],
  ["v1", "A-mode ultrasound, dry silicone coupling", "fatigue-robust muscle deformation", "K2"],
  ["v2", "the micro-tapper → tendon tension", "direct-physics tension; enables L1", "K3"],
  ["v3", "ultrasound → imaging + elastography", "measured, not inferred, stiffness", "K4"],
  ["v4", "electrodes → high-density grid", "motor-unit-level neural drive", "K5"],
];

const GATES = [
  {
    id: "K1",
    n: "the channel-value experiment",
    q: "Do the impedance and contact-event channels measurably improve force-sensitive policy performance beyond wrench alone?",
    needs: "v0 hardware only",
    fail: "Ship v0 only. Abandon the premium tier. Do not reframe the claim.",
    note: "Third-party evidence that force helps at all is strong and multiplying — around 22–23% success-rate improvements from force-grounded policies in 2026 work. All of that validates wrench beating kinematics-only. None of it touches K1's question, which is whether contact schedule, impedance and uncertainty weighting beat wrench alone. No third party has run that comparison.",
    weight: "the one that can end the premium tier",
  },
  {
    id: "K2",
    n: "fatigue robustness",
    q: "Does ultrasound fusion hold force accuracy across a full four-hour capture shift, where the electrode channel alone degrades?",
    needs: "v1 hardware",
    fail: "Drop the ultrasound block. Rely on anchoring and more frequent re-verification.",
  },
  {
    id: "K3",
    n: "wrist tensiometry",
    q: "Does direct-physics tendon tension sensing work at the wrist, with usable signal-to-noise, across people?",
    needs: "v2 hardware — cheap relative to its information value",
    fail: "L1 degrades to conventional fusion. The highest-novelty hardware claim is withdrawn.",
    note: "The whole published literature for this measurement is lower-limb; the wrist is unclaimed territory. Since 2026-08-20 its payoff is measured rather than asserted: without it, re-donning the sleeve costs the user minutes of labelled calibration every session. K3 decides between two different products — one where putting the sleeve back on is invisible, one where it costs four minutes every time.",
    weight: "highest risk in the programme — and, now, highest value",
  },
  {
    id: "K4",
    n: "measured versus inferred stiffness",
    q: "Does direct elastography beat the cheaper inferred estimate, judged against the artifact's own perturbation ground truth?",
    needs: "v3 hardware",
    fail: "Keep the cheaper inferred impedance. Do not build v3.",
  },
  {
    id: "K5",
    n: "high-density grid value",
    q: "Do motor-unit features improve per-finger resolution enough to justify a tenfold increase in electrode channel count?",
    needs: "v4 hardware",
    fail: "Stay at low-density electrodes permanently.",
  },
];

const STATE = [
  ["System specification", "complete — five blocks, seven layers, five gates, costed at three volumes", "R"],
  ["Uncertainty validation", "seven arms run on public data, externally reviewed, six of our own claims corrected", "R"],
  ["v0 hardware", "bench prototype under construction. Parts in hand since 27 September; the logger records to SD at 2 kHz with no gaps; the surface-EMG front end, an inertial unit and the force reference all read on the bench. Not yet calibrated, not yet worn for a recorded session", "—"],
  ["First worn recording", "next — muscle signals and force recorded together against the load-cell reference. The first point at which the sleeve measures anything a customer would care about", "—"],
];

export default function LongSheet() {
  const root = useReveal();
  const coarse = useCoarse();

  return (
    <main className={"ls" + (coarse ? " coarse" : "")} ref={root}>
      <CustomCursor />

      <header className="ls-bar">
        <Link href="/" className="ls-bar-mark">
          <span className="ls-brk">[</span>physcript<span className="ls-brk">]</span>
        </Link>
        <div className="ls-bar-mid">
          <b>TOUCHSTONE</b>
          <span>sheet 02 · the long sheet</span>
        </div>
        <div className="ls-bar-right">
          <Link href="/touchstone">← the atlas</Link>
          <a href="mailto:pranav@physcri.pt">contact</a>
        </div>
      </header>

      {/* ---------------- masthead ---------------- */}
      <header className="ls-wrap ls-mast">
        <div className="rise">
          <p className="ls-eyebrow">
            TOUCHSTONE v3 · SHEET 02 · REV 0.3 · SPECIFIED, PARTLY VALIDATED,
            BENCH PROTOTYPE UNDER CONSTRUCTION
          </p>
          <h1 className="ls-mast-title">Touchstone</h1>
          <p className="ls-mast-sub">
            <span>the force layer for physical AI</span>
            <span>measured · certified · portable</span>
          </p>
        </div>

        <div className="ls-mast-grid rise">
          <div>
            <p className="ls-lede">
              Robots learned to see from a billion photographs. Nothing, ever,
              recorded how hard a hand pressed.
            </p>
            <p className="ls-body">
              Touchstone is an instrument, not a dataset vendor. A person works
              normally; a sleeve on the forearm reads the muscles that move the
              hand; a handheld standard tells the sleeve what a newton is.
              What comes out is not footage. It is{" "}
              <b>
                force in newtons on a known object at a known instant, with a
                stated interval around it
              </b>{" "}
              — and because it records the job the object experienced rather
              than the motion one particular hand made, the same demonstration
              can be recompiled onto a body that looks nothing like yours.
            </p>
            <p className="ls-body">
              This sheet is the long version. Everything freely shareable is
              here, including the parts that went wrong. Where a mechanism is
              deliberately held back, the sheet says so rather than glossing
              over it.
            </p>
          </div>

          <dl className="ls-spec">
            <div>
              <dt>measured</dt>
              <dd>newtons at the contact, not inferred from pixels</dd>
            </div>
            <div>
              <dt>bare-handed</dt>
              <dd>nothing on the palm or the fingertips</dd>
            </div>
            <div>
              <dt>portable</dt>
              <dd>one demonstration compiles onto many robot bodies</dd>
            </div>
            <div>
              <dt>certified</dt>
              <dd>every number traceable back to a physical reference</dd>
            </div>
            <div>
              <dt>honest</dt>
              <dd>and every number carries how far it can be trusted</dd>
            </div>
          </dl>
        </div>
      </header>

      {/* ---------------- 01 ---------------- */}
      <section className="ls-wrap ls-sec">
        <div className="ls-sec-head rise">
          <div className="ls-sec-num">01 — THE BLIND SPOT</div>
          <div>
            <h2 className="ls-h2">
              Force is invisible.
              <br />
              That is the entire problem.
            </h2>
            <p className="ls-body">
              A frame of someone holding a cup and a frame of someone crushing
              it are the same picture, right up until it is too late. Every
              manipulation failure that embarrasses robots is a force failure:
              the crushed egg, the dropped glass, the connector that never
              seats. None of it is visible in video, so none of it is in the
              training data.
            </p>
            <p className="ls-body">
              A tactile glove does not close the gap either. It gives a
              pressure <em>pattern</em> in relative units — rich spatial
              coverage, no newtons, and no stiffness channel at all. The
              missing thing is not resolution. It is the unit.
            </p>
            <p className="ls-note">
              A correction we made to our own earlier position, and keep making
              in public: we used to say gloves corrupt the demonstration by
              construction. That was too absolute. Glove data can train
              force-sensitive policies, and at least one glove was engineered
              specifically to stay thin and preserve dexterity. Glove
              interference is a graded concern, not a disqualifier. Our real
              advantage over gloves is the stiffness channel and the
              calibration — not the bare fact of leaving the palm uncovered.
            </p>
          </div>
        </div>

        <div className="ls-under rise">
          <h3 className="ls-h3">And underneath it, a second problem</h3>
          <p className="ls-body">
            A human hand has roughly twenty-three kinematic degrees of freedom
            and five deformable pads. A parallel jaw has two rigid jaws on one
            axis. Copying joint angles across that difference is close to
            meaningless, which is why retargeting research keeps fragmenting
            into one bespoke solution per robot.
          </p>
          <p className="ls-body">
            The two problems have one answer. Stop recording the hand. Record
            what the hand <em>did to the object</em>, and how the arm was
            regulated while doing it. Force on the object does not care what
            applied it. Stiffness is a command any torque-controlled robot can
            render. Contact events are the subgoals of manipulation for any
            body at all. All three are measurable from the muscle side — and
            two of them <em>only</em> from the muscle side. That single fact is
            the entire strategic reason to build a wearable rather than
            anything else.
          </p>
        </div>
      </section>

      <hr className="ls-hair" />

      {/* ---------------- 02 ---------------- */}
      <section className="ls-wrap ls-sec">
        <div className="ls-sec-head rise">
          <div className="ls-sec-num">02 — THE INSTRUMENT</div>
          <div>
            <h2 className="ls-h2">Three physical things, and nothing on the hand.</h2>
            <p className="ls-body">
              A forearm sleeve. A camera the customer already owns. A handheld
              calibration artifact. The palm, the fingers and the fingertips
              stay bare. Robots never wear any of it — the sleeve&apos;s signals
              are privileged training information, not a runtime dependency.
            </p>
          </div>
        </div>

        <div className="ls-plate rise">
          <figure>
            <img
              src="/touchstone/plate-sleeve.webp"
              alt="A compression sleeve rendered as a study model, with low-profile sensing modules seated along its length and a small electronics carrier on the dorsal side."
              width="1500"
              height="1125"
              loading="lazy"
            />
            <figcaption>
              <span>plate I · the sleeve, as a study model</span>
              <span>
                concept visualisation — not a photograph of finished hardware
              </span>
            </figcaption>
          </figure>
          <div>
            <dl className="ls-three">
              <div>
                <dt>The sleeve</dt>
                <dd>
                  Measurement equipment in the shape of performance apparel.
                  Skin-contact sensing on the volar side, rigid mass on the
                  dorsal side, one small status light and no display.
                </dd>
              </div>
              <div>
                <dt>The camera</dt>
                <dd>
                  Customer-supplied and egocentric, exactly as the open capture
                  rigs already do it. The Record has to be a strict superset of
                  what a customer already collects, or nobody adopts it.
                </dd>
              </div>
              <div>
                <dt>The artifact</dt>
                <dd>
                  A handheld object of known, stable, traceable properties. It
                  is what makes every number on the sheet mean something in
                  particular, and it is the reason this is metrology rather
                  than a good estimate.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <hr className="ls-hair" />

      {/* ---------------- 03 ---------------- */}
      <section className="ls-wrap ls-sec">
        <div className="ls-sec-head rise">
          <div className="ls-sec-num">03 — FIVE BLOCKS</div>
          <div>
            <h2 className="ls-h2">Fourteen ways to sense an arm, collapsed to five.</h2>
            <p className="ls-body">
              There are about fourteen credible ways to read what a forearm is
              doing. They are not fourteen separate choices — they are seven
              kinds of information, several of which more than one method can
              measure. Grouped that way, most of the fourteen either merge or
              fall out, and five blocks are left.
            </p>
            <p className="ls-body">
              The selection rule mattered more than the list: kill a candidate{" "}
              <em>only</em> when another is a strict superset of its
              information. A naive keep-whatever-is-easiest rule would have
              killed ultrasound in favour of the cheap pressure ring — which
              would have been wrong, because pressure cannot see stiffness at
              all.
            </p>
          </div>
        </div>

        <Matrix />

        <div className="ls-ladder-wrap rise">
          <h3 className="ls-h3">And they arrive in a deliberate order</h3>
          <p className="ls-body">
            The cheapest, most-proven configuration ships first and answers the
            most commercially important question. Every later stage adds exactly
            one genuinely new kind of information, and each one sits behind an
            experiment that can stop it.
          </p>
          <ol className="ls-ladder">
            {LADDER.map(([v, adds, info, gate]) => (
              <li key={v}>
                <span className="ls-ladder-v">{v}</span>
                <div>
                  <span className="ls-ladder-a">{adds}</span>
                  <span className="ls-ladder-i">{info}</span>
                </div>
                <span className="ls-ladder-g">→ {gate}</span>
              </li>
            ))}
          </ol>
          <p className="ls-note">
            Where each block sits on the arm, how the emitting ones are
            time-multiplexed so they do not step on each other, and what any of
            it costs per line are not published. Naming what kind of sensing
            exists is fine; handing over the layout is not.
          </p>
        </div>
      </section>

      <hr className="ls-hair" />

      {/* ---------------- 04 ---------------- */}
      <section className="ls-wrap ls-sec">
        <div className="ls-sec-head rise">
          <div className="ls-sec-num">04 — THE STANDARD</div>
          <div>
            <h2 className="ls-h2">
              Why a squeezable object is a metrology instrument.
            </h2>
            <p className="ls-body">
              In metrology this is called a <em>transfer standard</em>: a
              physical object of known, stable, traceable properties, used to
              tie an instrument&apos;s readings to real units. Every serious
              measuring instrument has one. No robot-data-capture product ships
              one. That absence is the opening.
            </p>
            <p className="ls-body">
              It does a second thing that matters more. The laboratory method
              for measuring limb impedance is perturbation: displace the limb
              suddenly and measure the restoring force. The instrument that does
              this costs tens of thousands of dollars. An object that can change
              its own stiffness while being gripped runs the same experiment in
              the user&apos;s hand — which is what makes the stiffness channel
              possible at all outside a lab.
            </p>
            <p className="ls-note">
              What the object is made of, how it changes stiffness, and the
              range it can cover are held back. The purpose, the metrology
              framing and the fact that it changes stiffness at all are said
              freely — those are the parts worth being generous about.
            </p>
          </div>
        </div>

        <Chain />
      </section>

      <hr className="ls-hair" />

      {/* ---------------- 05 ---------------- */}
      <section className="ls-wrap ls-sec">
        <div className="ls-sec-head rise">
          <div className="ls-sec-num">05 — THE RECORD</div>
          <div>
            <h2 className="ls-h2">The thing that is actually being sold.</h2>
            <p className="ls-body">
              Everything upstream exists to produce this. Everything downstream
              exists to consume it. If this is right and the hardware is
              mediocre, the product still works. If this is wrong, no amount of
              sensing rescues it.
            </p>
          </div>
        </div>

        <div className="ls-fields rise">
          {RECORD_FIELDS.map(([n, what, rate, by], i) => (
            <div key={n} className={i === 4 ? "is-ours" : ""}>
              <div className="ls-field-head">
                <span className="ls-field-i">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="ls-field-n">{n}</h3>
                <span className="ls-field-r">{rate}</span>
              </div>
              <p className="ls-field-w">{what}</p>
              <p className="ls-field-b">{by}</p>
            </div>
          ))}
        </div>

        <p className="ls-body ls-wide rise">
          Each field is independently validated in the literature. The{" "}
          <em>combination</em> exists nowhere. One well-known dataset has wrench
          but no impedance, no events and no uncertainty. Another has dense
          tactile patterns but no SI units and no stiffness channel. The forearm
          band that came closest has force and none of the rest.
        </p>

        <pre className="ls-schema rise">
          <code>{SCHEMA}</code>
        </pre>

        <div className="ls-two rise">
          <div>
            <h3 className="ls-h3">One design choice worth remembering</h3>
            <p className="ls-body">
              Wrench is recorded in the <em>object&apos;s</em>{" "}
              frame, not the hand&apos;s. Hand-frame forces are morphology-specific — a
              five-fingered grasp and a two-jaw grasp produce completely
              different hand-frame numbers for the same outcome. Object-frame
              wrench does not care who or what applied it. That is what
              embodiment-agnostic means concretely, and it is what makes the
              Record directly consumable by cross-embodiment methods.
            </p>
          </div>
          <div>
            <h3 className="ls-h3">And one commercial one</h3>
            <p className="ls-body">
              The schema will be published openly and permissively licensed. The
              value is not in the format — it is in being the only party who can
              fill it correctly. An open format recruits the ecosystem that
              makes the data valuable; a closed one guarantees competing alone
              against better-funded labs.
            </p>
          </div>
        </div>
      </section>

      <hr className="ls-hair" />

      {/* ---------------- 06 ---------------- */}
      <section className="ls-wrap ls-sec">
        <div className="ls-sec-head rise">
          <div className="ls-sec-num">06 — THE COMPILER</div>
          <div>
            <h2 className="ls-h2">Seven layers, scored on themselves.</h2>
            <p className="ls-body">
              Most of these use well-known techniques from other fields, and say
              so. Three are, as far as we have been able to find, unclaimed —
              and all three only work if you also own the hardware, which is
              what makes them hard to copy rather than merely hard to think of.
            </p>
          </div>
        </div>

        <div className="ls-pipe-wrap rise">
          <Pipeline />
        </div>
        <Layers />
      </section>

      <hr className="ls-hair" />

      {/* ---------------- 07 ---------------- */}
      <section className="ls-wrap ls-sec ls-evidence">
        <div className="ls-sec-head rise">
          <div className="ls-sec-num">07 — THE EVIDENCE</div>
          <div>
            <h2 className="ls-h2">
              What we actually know, including where we were wrong.
            </h2>
            <p className="ls-body">
              Before any hardware existed, the uncertainty claim was tested on a
              public dataset — twenty subjects, 256-channel forearm recordings,
              per-finger force ground truth, seventy-four thousand windows. Every
              prediction was written down and frozen before a model was fitted.
              Then the write-up was handed to an external reviewer, who was right
              on every substantive point, and six claims were corrected or
              withdrawn.
            </p>
            <p className="ls-body">
              This is the only part of this sheet with real evidence behind it.
              It is also the part most companies would not publish.
            </p>
          </div>
        </div>

        <Scorecard />

        <div className="ls-callouts rise">
          <div className="is-bad">
            <span className="ls-callout-k">the claim we retired</span>
            <p>
              The premise this company was previously built on was that a
              population-calibrated interval would be too narrow for a new user
              and would silently under-cover. It does not. Coverage held at
              nominal; the method absorbed the shift by widening intervals{" "}
              <b>1.77×</b> instead. Conformal prediction behaved correctly under
              a shift it was not guaranteed to survive. Any deck still asserting
              otherwise — including ours, for a while — is wrong.
            </p>
          </div>
          <div>
            <span className="ls-callout-k">what replaced it</span>
            <p>
              Something narrower and better evidenced. Per-user calibration is
              worthless on average — it moves mean coverage by{" "}
              <b>−0.5 points</b> — and it removes the tail entirely: under
              population calibration <b>20%</b> of subjects fall below 85%
              coverage; under per-user calibration <b>none</b> do. One user in
              five gets materially wrong error bars without it.
            </p>
          </div>
        </div>

        <Collapse />

        <div className="ls-two rise">
          <div>
            <h3 className="ls-h3">We tried to kill our own product</h3>
            <p className="ls-body">
              If a smarter model could fix re-donning with zero burden on the
              user, the per-session ritual would not be justified and the
              calibration artifact would lose most of its rationale. So we
              pre-registered the falsification: if the field&apos;s standard fix
              — randomised channel masking during training — lifted cross-session
              coverage to <b>83.3%</b> or better, the ritual was unjustified.
            </p>
            <p className="ls-body">
              It reached <b><Counter to={57.1} suffix="%" /></b>. It moved
              coverage the <em>wrong</em> way by 2.4 points, while buying an
              accuracy gain that does not approach usable. The artifact survived
              the hardest test available on public data — which is worth more
              precisely because the test was set up to go the other way.
            </p>
            <p className="ls-note">
              Read honestly: channel masking is documented to help cross-day{" "}
              <em>classification</em>. It did not help cross-day{" "}
              <em>regression</em> here. That is a real, pre-registered negative
              result on the method the field would reach for first — on one
              dataset, with one model class.
            </p>
          </div>
          <div>
            <h3 className="ls-h3">And then we caught ourselves doing it</h3>
            <p className="ls-body">
              Coverage was being computed from hundreds of overlapping windows
              treated as independent. Windows are not exchangeable units.
              Trials are. Recomputed properly:
            </p>
            <table className="ls-table">
              <thead>
                <tr>
                  <th>calibration</th>
                  <th>window-level</th>
                  <th>certifiable at 90%</th>
                </tr>
              </thead>
              <tbody>
                <tr className="is-bad">
                  <td>4 trials · 100 s</td>
                  <td>86.6%</td>
                  <td>0 of 20 subjects</td>
                </tr>
                <tr>
                  <td>9 trials · 225 s</td>
                  <td>89.0%</td>
                  <td>20 of 20 · intervals 2.15× wider</td>
                </tr>
              </tbody>
            </table>
            <p className="ls-body">
              At four calibration trials the honest radius is{" "}
              <b>infinite for every single subject</b> — a 90% guarantee
              mathematically does not exist at that budget — while the
              comfortable-looking window-level number reads 86.6%. That gap, a
              figure that looks acceptable against a guarantee that is not
              there, is the exact failure mode Touchstone exists to sell
              against. We shipped it in our own write-up for a day. The
              corrected spec is longer and more expensive, and it is the one we
              quote.
            </p>
          </div>
        </div>

        <div className="ls-ev-system rise">
          <h3 className="ls-h3">The label on every claim</h3>
          <p className="ls-body">
            Every factual claim this company makes, internally and publicly,
            carries a label for how solid it actually is. The rule that gives it
            teeth: <b>no hypothesis appears in customer-facing material until
            there is an experiment behind it and the label has changed.</b> A
            promise to sell calibrated numbers with stated error is worthless
            from a company that will not hold itself to the same standard.
          </p>
          <dl className="ls-ev-table">
            {Object.entries(EVIDENCE).map(([k, [n, d]]) => (
              <div key={k}>
                <dt>
                  <Ev k={k} />
                  {n}
                </dt>
                <dd>{d}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <hr className="ls-hair" />

      {/* ---------------- 08 ---------------- */}
      <section className="ls-wrap ls-sec">
        <div className="ls-sec-head rise">
          <div className="ls-sec-num">08 — THE GATES</div>
          <div>
            <h2 className="ls-h2">Five ways to find out we are wrong, cheaply.</h2>
            <p className="ls-body">
              Each is a specific experiment with a written pass/fail line
              decided <em>before</em> it runs, and a stated plan for what we do
              if it fails. A failed gate is not a setback. It is a cheap way of
              learning not to spend money on something, before the money is
              spent.
            </p>
          </div>
        </div>

        <ol className="ls-gates">
          {GATES.map((g, i) => (
            <li
              key={g.id}
              className={"ls-gate rise" + (g.weight ? " is-heavy" : "")}
              style={{ "--rd": i * 0.05 + "s" }}
            >
              <div className="ls-gate-head">
                <span className="ls-gate-id">{g.id}</span>
                <h3 className="ls-gate-n">{g.n}</h3>
                <span className="ls-gate-st">not run</span>
              </div>
              {g.weight && <p className="ls-gate-weight">{g.weight}</p>}
              <p className="ls-gate-q">{g.q}</p>
              <dl className="ls-gate-rows">
                <div>
                  <dt>requires</dt>
                  <dd>{g.needs}</dd>
                </div>
                <div>
                  <dt>if it fails</dt>
                  <dd>{g.fail}</dd>
                </div>
              </dl>
              {g.note && <p className="ls-note">{g.note}</p>}
            </li>
          ))}
        </ol>

        <p className="ls-note ls-wide rise">
          The numeric threshold behind each of these is written down and decided
          in advance. It is not published here, because in the wrong room it is
          a shortcut to somebody else&apos;s validation design.
        </p>
      </section>

      <hr className="ls-hair" />

      {/* ---------------- 09 ---------------- */}
      <section className="ls-wrap ls-sec">
        <div className="ls-sec-head rise">
          <div className="ls-sec-num">09 — WHERE THIS SITS</div>
          <div>
            <h2 className="ls-h2">An empty band, and two curves moving the right way.</h2>
            <p className="ls-body">
              Below about $130 you can buy relative, uncalibrated signal. Above
              about $4,900 you can buy professional mocap and haptic hardware
              that was never designed for force capture. Between the two,
              essentially nothing carries a public list price. Every number
              below is checkable by anyone.
            </p>
          </div>
        </div>

        <PriceBand />
        <Curves />

        <div className="ls-two rise">
          <div>
            <h3 className="ls-h3">The size of it, bottom-up</h3>
            <p className="ls-body">
              Roughly <b>$277.5M</b> a year is already being spent on
              manipulation data — twenty frontier labs at about $6M each, seventy
              mid-stage robotics companies at about $1.8M, and several hundred
              academic and industrial teams at about $70k. Cross-checked a second
              way: at the March 2026 benchmark that implies about 2.35M
              data-hours a year industry-wide, or around twenty large capture
              operations across the whole industry — which is roughly what
              exists.
            </p>
            <table className="ls-table">
              <thead>
                <tr>
                  <th />
                  <th>2029</th>
                  <th>2031</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Data</td>
                  <td>$132M</td>
                  <td>$419M</td>
                </tr>
                <tr>
                  <td>Hardware</td>
                  <td>$22M</td>
                  <td>$75M</td>
                </tr>
                <tr>
                  <td>Recurring calibration</td>
                  <td>$11M</td>
                  <td>$45M</td>
                </tr>
                <tr className="is-total">
                  <td>Total</td>
                  <td>$165M</td>
                  <td>$540M</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div>
            <h3 className="ls-h3">The reframe that matters</h3>
            <p className="ls-body">
              The companies raising serious money to build wearable capture
              networks are building the distribution infrastructure for exactly
              this — and none of them captures force. We are not competing with
              them for the same buyer. We are the missing physical channel
              inside collection networks that are already being deployed by the
              thousand.
            </p>
            <h3 className="ls-h3" style={{ marginTop: 32 }}>
              And the honest weak point
            </h3>
            <p className="ls-body">
              The open capture rigs are $371 and open-source. The closest
              forearm band is likely under $150 of parts. Our premium cannot be
              defended by having more sensors — only by channels that do not
              exist at any price: calibrated newtons, stiffness, and a stated
              interval. <b>If gate K1 does not show those improve policy
              performance, the premium is indefensible</b>, and the honest
              response is to ship v0 alone rather than to reframe the claim.
            </p>
            <p className="ls-note">
              There is a clock on this, too. The labs that proved the physics
              still exist, all now see the same newly-paying market, and several
              are further along than we are. &ldquo;Nobody built the
              product&rdquo; can mean there were structural reasons — and there
              were — or it can mean somebody has not got round to it yet. No
              framing changes which one it turns out to be.
            </p>
          </div>
        </div>
      </section>

      <hr className="ls-hair" />

      {/* ---------------- close ---------------- */}
      <section className="ls-wrap ls-sec ls-close">
        <div className="ls-sec-head rise">
          <div className="ls-sec-num">10 — STATE</div>
          <div>
            <h2 className="ls-h2">Said plainly.</h2>
          </div>
        </div>

        <ol className="ls-state rise">
          {STATE.map(([k, v, ev]) => (
            <li key={k}>
              <span className="ls-state-k">{k}</span>
              <span className="ls-state-v">{v}</span>
              {ev !== "—" ? <Ev k={ev} /> : <span className="ls-state-none">—</span>}
            </li>
          ))}
        </ol>

        <p className="ls-pull rise">
          Calibration does not remove error. It converts an unknown error into a
          stated one. That is the whole promise, and it is the one no competitor
          currently makes.
        </p>

        <Link href="/touchstone" className="ls-next rise">
          <span>Back to</span>
          <strong>The atlas — the whole system on one sheet →</strong>
        </Link>

        <div className="ls-title-block rise">
          <div>
            <dt>Sheet</dt>
            <dd>02 · the long sheet</dd>
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
        <p className="ls-end">
          <span>physcript</span>
          <span>the force layer for physical AI</span>
        </p>
      </section>
    </main>
  );
}
