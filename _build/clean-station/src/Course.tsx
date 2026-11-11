
/* Clean Station: Infection Control for Estheticians.
   Six lessons, driven by a screen manifest so screens are data, not
   bespoke files. Lessons 1-5 run in the dark tablet shell; Lesson 6 is a
   hands-on treatment room. Self-paced, no scores, no timers that count
   against anyone, single tap or drag, reduced-motion aware. */

import { useCallback, useEffect, useRef, useState } from "react";
const CASE_URL = "https://work.jackiemiller.co/";
import Capstone, { CAP_HINTS } from "./Capstone";
import "./course.css";

const FOOTER = "Sample course by Jackie Miller. Follow your school's procedures and your product labels.";

/* tiny flat line glyphs */
const I = {
  face: <svg viewBox="0 0 24 24"><circle cx="12" cy="11" r="7" /><path d="M9 10h.01M15 10h.01M9.5 14c1.4 1.2 3.6 1.2 5 0" /></svg>,
  nail: <svg viewBox="0 0 24 24"><path d="M8 21V9a4 4 0 0 1 8 0v12" /><path d="M10 9a2 2 0 0 1 4 0v3h-4z" /></svg>,
  shears: <svg viewBox="0 0 24 24"><circle cx="6" cy="18" r="2.6" /><circle cx="18" cy="18" r="2.6" /><path d="M8 16L18 3M16 16L6 3" /></svg>,
  hands: <svg viewBox="0 0 24 24"><path d="M4 14c3-1 5-4 8-4s5 3 8 4" /><path d="M4 18h16" /><path d="M8 10V6M12 10V4M16 10V6" /></svg>,
  eye: <svg viewBox="0 0 24 24"><path d="M3 12c3-5 15-5 18 0" /><path d="M5 12l-1 3M9 13l-.5 3M15 13l.5 3M19 12l1 3" /></svg>,
  sponge: <svg viewBox="0 0 24 24"><rect x="4" y="7" width="16" height="10" rx="3" /><path d="M8 11h.01M12 13h.01M16 10h.01" /></svg>,
  spray: <svg viewBox="0 0 24 24"><path d="M8 9h6v12H8z" /><path d="M9 9V6h4l3-2v3h-3" /><path d="M19 6h.01M20 9h.01" /></svg>,
  shield: <svg viewBox="0 0 24 24"><path d="M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6z" /><path d="M9 12l2 2 4-4" /></svg>,
  trash: <svg viewBox="0 0 24 24"><path d="M5 7h14M9 7V4h6v3M7 7l1 13h8l1-13" /></svg>,
  tray: <svg viewBox="0 0 24 24"><path d="M3 13h18v5H3z" /><path d="M7 13V9h10v4" /></svg>,
  glove: <svg viewBox="0 0 24 24"><path d="M7 21v-8L5 9l1-1 3 3V4h2v6V3h2v7V4h2v7l1-3h2l-2 7v6z" /></svg>,
  swap: <svg viewBox="0 0 24 24"><path d="M5 8h12l-3-3M19 16H7l3 3" /></svg>,
  tear: <svg viewBox="0 0 24 24"><path d="M6 4h12v16H6z" /><path d="M6 12l4-2 3 3 5-3" /></svg>,
};

type StageProps = { onReady: () => void; goal: string | null; setGoal: (g: string) => void };

/* ══════════════ STAGE PIECES ══════════════ */

function Flag({ show, children }: { show: boolean; children: React.ReactNode }) {
  return <div className={`crs-flag${show ? " show" : ""}`}>{children}</div>;
}

/* Generic tap-to-reveal: every card must be opened before Next unlocks */
type Card = { id: string; title: string; glyph: React.ReactNode; reveal: string };
function RevealCards({ cards, onReady, after }: { cards: Card[]; onReady: () => void; after?: React.ReactNode }) {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const all = cards.every((c) => open[c.id]);
  useEffect(() => { if (all) onReady(); }, [all, onReady]);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div className="crs-choices three">
        {cards.map((c) => (
          <button key={c.id} className={`crs-choice${open[c.id] ? " revealed" : ""}`} aria-expanded={!!open[c.id]}
            onClick={() => setOpen((o) => ({ ...o, [c.id]: true }))}>
            <span className="glyph">{c.glyph}</span>
            <span className="ct">{c.title}</span>
            <span className="cs">{open[c.id] ? "" : "Tap to see what it means"}</span>
            <span className="reveal long">{c.reveal}</span>
          </button>
        ))}
      </div>
      {after && <Flag show={all}>{after}</Flag>}
    </div>
  );
}

/* Generic ordering: tap the steps in the right order. A wrong tap gets a kind
   nudge, never an error. */
function OrderSteps({ correct, start, onReady, wrongHint, doneText }:
  { correct: string[]; start: string[]; onReady: () => void; wrongHint: (expected: string) => string; doneText: string }) {
  const [placed, setPlaced] = useState<string[]>([]);
  const [msg, setMsg] = useState("Tap the step that comes first.");
  const [nudge, setNudge] = useState<string | null>(null);
  const done = placed.length === correct.length;
  useEffect(() => { if (done) onReady(); }, [done, onReady]);
  const tap = (s: string) => {
    const expected = correct[placed.length];
    if (s === expected) {
      const next = [...placed, s];
      setPlaced(next);
      setMsg(next.length === correct.length ? doneText : "Good. What comes next?");
    } else {
      setMsg(wrongHint(expected));
      setNudge(s);
      window.setTimeout(() => setNudge(null), 340);
    }
  };
  return (
    <div className="crs-order">
      <div className="crs-order-slots">
        {correct.map((_, i) => (
          <div key={i} className={`crs-slot${placed[i] ? " filled" : ""}`}><span className="n">{i + 1}</span>{placed[i] ?? ""}</div>
        ))}
      </div>
      <div className="crs-order-pool">
        {start.filter((s) => !placed.includes(s)).map((s) => (
          <button key={s} className={`crs-chip${nudge === s ? " nudge" : ""}`} onClick={() => tap(s)}>{s}</button>
        ))}
      </div>
      <div className="crs-kind" aria-live="polite">{msg}</div>
    </div>
  );
}

/* 1.2 Motivation: pick a trade (optional). The pick is echoed later. */
const TRADES = [
  { id: "esthetics", label: "Esthetics", where: "esthetics", icon: I.face, ack: "Facials put your hands and tools close to a client's skin. A clean station is how you keep their trust." },
  { id: "nails", label: "Nails", where: "nail care", icon: I.nail, ack: "Files, bits and implements touch skin all day. Every one needs the right care between clients." },
  { id: "barbering", label: "Barbering", where: "barbering", icon: I.shears, ack: "Clippers, shears and capes go from chair to chair. Clean habits keep every client safe." },
  { id: "massage", label: "Massage", where: "massage", icon: I.hands, ack: "Every client lies on your table and your linens. A clean reset is part of the service." },
  { id: "lash", label: "Lash", where: "lash work", icon: I.eye, ack: "Lash work happens right next to a client's eyes. That makes a clean station matter even more." },
];
function TradeStage({ onReady, goal, setGoal }: StageProps) {
  useEffect(() => { onReady(); }, [onReady]);
  const chosen = TRADES.find((g) => g.id === goal);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div className="crs-goals">
        {TRADES.map((g) => (
          <button key={g.id} className={`crs-goal${goal === g.id ? " on" : ""}`} aria-pressed={goal === g.id} onClick={() => setGoal(g.id)}>
            {g.icon}<span className="gl">{g.label}</span>
          </button>
        ))}
      </div>
      <div className="crs-goal-ack">{chosen ? chosen.ack : "Pick the one that fits you best. There's no wrong choice."}</div>
    </div>
  );
}

/* 2.2 Three words, three meanings */
function ThreeWordsStage({ onReady }: StageProps) {
  return (
    <RevealCards onReady={onReady} after={<>Three different jobs. <span className="rl">Most of a salon day is cleaning and disinfecting.</span></>} cards={[
      { id: "clean", title: "Clean", glyph: I.sponge, reveal: "Removes dirt and debris you can see, usually with soap and water." },
      { id: "dis", title: "Disinfect", glyph: I.spray, reveal: "Kills most germs on hard, nonporous surfaces." },
      { id: "ster", title: "Sterilize", glyph: I.shield, reveal: "Kills all microbial life. Mostly used in medical settings." },
    ]} />
  );
}

/* 2.3 Which comes first */
function CleanFirstStage({ onReady }: StageProps) {
  return (
    <OrderSteps onReady={onReady} correct={["Clean", "Disinfect"]} start={["Disinfect", "Clean"]}
      wrongHint={() => "Not yet. Disinfectant doesn't work on a dirty surface. What has to happen first?"}
      doneText="Clean first, then disinfect. Every time." />
  );
}

/* 3.2 Drag-to-sort. Drag works with a mouse or a finger; tapping an item and
   then a bin works too. */
type Bin = "trash" | "tray";
const SORT_ITEMS: { id: string; label: string; bin: Bin }[] = [
  { id: "spatula", label: "Wooden spatula", bin: "trash" },
  { id: "extractor", label: "Metal extractor", bin: "tray" },
  { id: "cotton", label: "Cotton round", bin: "trash" },
  { id: "gauze", label: "Gauze", bin: "trash" },
  { id: "tweezers", label: "Metal tweezers", bin: "tray" },
  { id: "gloves", label: "Disposable gloves", bin: "trash" },
  { id: "sponge", label: "Sponge", bin: "trash" },
  { id: "bowl", label: "Stainless bowl", bin: "tray" },
  { id: "applicator", label: "Single-use applicator", bin: "trash" },
];
function SortStage({ onReady }: StageProps) {
  const [where, setWhere] = useState<Record<string, Bin>>({});
  const [sel, setSel] = useState<string | null>(null);
  const [msg, setMsg] = useState("Drag each item to where it belongs. You can also tap an item, then tap a bin.");
  const [drag, setDrag] = useState<{ id: string; dx: number; dy: number } | null>(null);
  const [hot, setHot] = useState<Bin | null>(null);
  const start = useRef<{ id: string; x: number; y: number; moved: boolean } | null>(null);
  const done = SORT_ITEMS.every((it) => where[it.id]);
  useEffect(() => { if (done) onReady(); }, [done, onReady]);

  const drop = useCallback((id: string, bin: Bin) => {
    const it = SORT_ITEMS.find((x) => x.id === id)!;
    setSel(null);
    if (it.bin === bin) {
      setWhere((w) => ({ ...w, [id]: bin }));
      setMsg(bin === "trash" ? `Yes. ${it.label} is single-use. It goes in the trash.` : `Yes. ${it.label} is hard and nonporous, so it can be disinfected.`);
    } else if (bin === "tray") {
      setMsg(`Close. ${it.label} can't be disinfected, so it's single-use. It goes in the trash.`);
    } else {
      setMsg(`Close. ${it.label} is hard and nonporous. It can be cleaned and disinfected, so it goes to the tray.`);
    }
  }, []);

  const binAt = (x: number, y: number): Bin | null => {
    const el = document.elementFromPoint(x, y)?.closest("[data-bin]") as HTMLElement | null;
    return (el?.dataset.bin as Bin) ?? null;
  };
  const onDown = (e: React.PointerEvent, id: string) => {
    start.current = { id, x: e.clientX, y: e.clientY, moved: false };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    const s = start.current;
    if (!s) return;
    const dx = e.clientX - s.x, dy = e.clientY - s.y;
    if (!s.moved && Math.hypot(dx, dy) < 6) return;
    s.moved = true;
    setDrag({ id: s.id, dx, dy });
    setHot(binAt(e.clientX, e.clientY));
  };
  const onUp = (e: React.PointerEvent) => {
    const s = start.current;
    start.current = null;
    if (!s) return;
    if (s.moved) {
      const b = binAt(e.clientX, e.clientY);
      setDrag(null); setHot(null);
      if (b) drop(s.id, b);
    } else {
      setSel((cur) => (cur === s.id ? null : s.id));
      setMsg("Now tap the bin it belongs in.");
    }
  };

  const bins: { id: Bin; title: string; sub: string; glyph: React.ReactNode }[] = [
    { id: "trash", title: "Trash", sub: "Single-use. Toss after one client.", glyph: I.trash },
    { id: "tray", title: "Disinfect tray", sub: "Hard, nonporous. Clean, then disinfect.", glyph: I.tray },
  ];

  return (
    <div className="crs-sort">
      <div className="crs-sort-pool">
        {SORT_ITEMS.filter((it) => !where[it.id]).map((it) => (
          <button key={it.id}
            className={`crs-sort-item${sel === it.id ? " sel" : ""}${drag?.id === it.id ? " dragging" : ""}`}
            style={drag?.id === it.id ? { transform: `translate(${drag.dx}px, ${drag.dy}px)` } : undefined}
            aria-pressed={sel === it.id}
            onPointerDown={(e) => onDown(e, it.id)} onPointerMove={onMove} onPointerUp={onUp}
            onPointerCancel={() => { start.current = null; setDrag(null); setHot(null); }}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSel(it.id); setMsg("Now choose the bin it belongs in."); } }}>
            {it.label}
          </button>
        ))}
        {done && <span className="crs-kind">All sorted.</span>}
      </div>
      <div className="crs-sort-bins">
        {bins.map((b) => (
          <button key={b.id} data-bin={b.id} className={`crs-bin${hot === b.id ? " hot" : ""}`}
            onClick={() => { if (sel) drop(sel, b.id); else setMsg("Pick an item first, then choose its bin."); }}>
            {b.glyph}<span className="bt">{b.title}</span><span className="bs">{b.sub}</span>
            <span className="in">{SORT_ITEMS.filter((it) => where[it.id] === b.id).map((it) => <span key={it.id}>{it.label}</span>)}</span>
          </button>
        ))}
      </div>
      <div className="crs-kind" aria-live="polite">{done ? "The rule: if it's porous and can't be disinfected, it's single-use." : msg}</div>
    </div>
  );
}

/* 4.2 Find the contact time on a made-up label */
const LABEL_LINES = [
  { id: "use", text: <>For use on hard, nonporous surfaces.</>, miss: "That says where to use it. Keep looking for how long it has to stay wet." },
  { id: "dir", text: <><b>Directions:</b> Clean the surface first. Apply until the surface is thoroughly wet.</>, miss: "Good to know: clean first. Now find how long it has to stay wet." },
  { id: "ct", text: <><b>Contact time:</b> Surface must stay wet for 10 minutes.</>, miss: "" },
  { id: "warn", text: <>Keep out of reach of children. Read all precautions before use.</>, miss: "That's a safety warning. Read those too. Then find the contact time." },
];
function LabelStage({ onReady }: StageProps) {
  const [hit, setHit] = useState(false);
  const [miss, setMiss] = useState<string | null>(null);
  const [msg, setMsg] = useState("Tap the line that tells you the contact time.");
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      <div className="crs-label" role="group" aria-label="Brand X Surface Disinfectant label">
        <div className="brand">Brand X Surface Disinfectant</div>
        {LABEL_LINES.map((l) => (
          <button key={l.id} className={`ln${l.id === "ct" && hit ? " hit" : ""}${miss === l.id ? " miss" : ""}`}
            onClick={() => {
              if (l.id === "ct") { setHit(true); setMiss(null); setMsg("That's it. Contact time is how long the surface has to stay wet to work."); onReady(); }
              else { setMiss(l.id); setMsg(l.miss); }
            }}>
            {l.text}
          </button>
        ))}
        <div className="practice">Made-up label for practice only.</div>
      </div>
      <div className="crs-kind" aria-live="polite">{msg}</div>
    </div>
  );
}

/* 4.3 Contact time demo. One second here stands in for one minute on the
   label. The first try dries early on purpose. */
const CT_TOTAL = 10;
function ContactTimeStage({ onReady }: StageProps) {
  const [phase, setPhase] = useState<"dry" | "wet" | "driedEarly" | "done">("dry");
  const [left, setLeft] = useState(CT_TOTAL);
  const tries = useRef(0);
  const timer = useRef<number | null>(null);
  const stop = () => { if (timer.current) { clearInterval(timer.current); timer.current = null; } };
  useEffect(() => () => stop(), []);
  const apply = () => {
    stop();
    tries.current += 1;
    const dryAt = tries.current === 1 ? 4 : -1; // the first try dries with 4 left
    setPhase("wet"); setLeft(CT_TOTAL);
    let n = CT_TOTAL;
    timer.current = window.setInterval(() => {
      n -= 1;
      setLeft(n);
      if (n === dryAt) { stop(); setPhase("driedEarly"); }
      else if (n <= 0) { stop(); setPhase("done"); onReady(); }
    }, 1000);
  };
  const msg = {
    dry: "The counter is already clean. Tap Apply disinfectant to wet it.",
    wet: "Keep it wet. The clock runs while the surface stays wet.",
    driedEarly: "It dried before the time was up. Apply again so it stays wet for the full contact time.",
    done: "Full contact time, start to finish, while wet. Always follow the label on the product you use.",
  }[phase];
  return (
    <div className="crs-ct">
      <div className={`crs-ct-surface${phase === "wet" || phase === "done" ? " is-wet" : ""}`}>
        <span className="wet" /><span className="lbl">{phase === "dry" ? "Clean, dry counter" : phase === "driedEarly" ? "Dried early" : "Wet with disinfectant"}</span>
      </div>
      <div className="crs-ct-clock" aria-live="polite">{left}<small>demo seconds left · 1 second = 1 label minute</small></div>
      <div className="crs-ct-bar"><i style={{ width: `${((CT_TOTAL - left) / CT_TOTAL) * 100}%` }} /></div>
      {(phase === "dry" || phase === "driedEarly") && <button className="crs-playbtn" onClick={apply}>Apply disinfectant</button>}
      <div className="crs-kind">{msg}</div>
    </div>
  );
}

/* 5.2 Handwashing order */
function HandwashStage({ onReady }: StageProps) {
  const correct = ["Wet hands", "Add soap", "Scrub at least 20 seconds", "Rinse", "Dry with a clean towel"];
  return (
    <OrderSteps onReady={onReady} correct={correct}
      start={["Rinse", "Add soap", "Dry with a clean towel", "Wet hands", "Scrub at least 20 seconds"]}
      wrongHint={(exp) => `Not yet. Think about what your hands need first. Next up: ${exp.toLowerCase()}.`}
      doneText="That's the whole wash. Soap, scrub, rinse, and a clean towel." />
  );
}

/* 5.3 When to change gloves */
function GlovesStage({ onReady }: StageProps) {
  return (
    <RevealCards onReady={onReady} after={<>New client, new gloves. <span className="rl">When in doubt, change them.</span></>} cards={[
      { id: "between", title: "Between clients", glyph: I.swap, reveal: "Every client gets a fresh pair. Gloves never go from one client to the next." },
      { id: "torn", title: "If they tear", glyph: I.tear, reveal: "A torn glove no longer protects you or your client. Change it right away." },
      { id: "dirty", title: "After touching anything not clean", glyph: I.glove, reveal: "Touched your phone, the trash or a used tool? Change before you touch the client." },
    ]} />
  );
}

/* ══════════════ MANIFEST ══════════════ */
type Screen = {
  lesson: number; eyebrow?: string; title: string; sub?: string;
  note: string; cta: string; gate?: boolean;
  layout?: "shell" | "title" | "capstone" | "complete";
  Stage?: (p: StageProps) => React.ReactNode;
};

const SCREENS: Screen[] = [
  // Lesson 1
  { lesson: 1, layout: "title", title: "Clean Station", sub: "Infection control for estheticians. How to keep every client safe, one station at a time.", note: "Six lessons · about 30 minutes · go at your own pace", cta: "Begin" },
  { lesson: 1, eyebrow: "Orientation", title: "Why this matters", sub: "Every client trusts that your station is clean. Before I teach a single step, tell me which trade you're training for.", note: "Your choice · you can change it later", cta: "Continue", Stage: TradeStage },
  // Lesson 2
  { lesson: 2, layout: "title", title: "Clean, disinfect, sterilize", sub: "Three words that sound alike and mean different things.", note: "Lesson 2 of 6", cta: "Start" },
  { lesson: 2, eyebrow: "Clean, disinfect, sterilize", title: "Three words", sub: "Tap each card to see what the word really means.", note: "Tap all three", cta: "Next", gate: true, Stage: ThreeWordsStage },
  { lesson: 2, eyebrow: "Clean, disinfect, sterilize", title: "Which comes first?", sub: "Put these two in order. Tap the one you do first.", note: "Unlimited tries", cta: "Next", gate: true, Stage: CleanFirstStage },
  // Lesson 3
  { lesson: 3, layout: "title", title: "Toss it or disinfect it", sub: "Some things are single-use. Some can be used again.", note: "Lesson 3 of 6", cta: "Start" },
  { lesson: 3, eyebrow: "Toss it or disinfect it", title: "Sort the station", sub: "If it's porous and can't be disinfected, it's single-use. Sort each item.", note: "Drag, or tap then tap · no wrong answers", cta: "Next", gate: true, Stage: SortStage },
  // Lesson 4
  { lesson: 4, layout: "title", title: "Read the label", sub: "The label tells you how to make the product work.", note: "Lesson 4 of 6", cta: "Start" },
  { lesson: 4, eyebrow: "Read the label", title: "Find the contact time", sub: "Contact time is how long a surface has to stay wet for the disinfectant to work.", note: "Tap the line", cta: "Next", gate: true, Stage: LabelStage },
  { lesson: 4, eyebrow: "Read the label", title: "Keep it wet", sub: "The surface has to stay wet for the full contact time. If it dries early, apply again.", note: "Short demo timer, not real minutes", cta: "Next", gate: true, Stage: ContactTimeStage },
  // Lesson 5
  { lesson: 5, layout: "title", title: "Hands and gloves", sub: "Clean hands first. Fresh gloves when it counts.", note: "Lesson 5 of 6", cta: "Start" },
  { lesson: 5, eyebrow: "Hands and gloves", title: "Wash your hands", sub: "Tap the handwashing steps in order.", note: "Unlimited tries", cta: "Next", gate: true, Stage: HandwashStage },
  { lesson: 5, eyebrow: "Hands and gloves", title: "When to change gloves", sub: "Tap each card to see when a new pair is needed.", note: "Tap all three", cta: "Next", gate: true, Stage: GlovesStage },
  // Lesson 6
  { lesson: 6, layout: "title", title: "Reset the room", sub: "A client just left. Get the treatment room ready for the next one, using everything you've practiced. It isn't a test. Take your time.", note: "Untimed · nothing is scored · nothing is recorded", cta: "Start the reset" },
  { lesson: 6, layout: "capstone", eyebrow: "Capstone", title: "Practice", note: "Follow the steps at the top · a ? gives you a hint", cta: "Finish", gate: true },
  { lesson: 6, layout: "complete", title: "Station ready", note: "", cta: "Done" },
];

/* ══════════════ HELP CONTENT (per lesson) ══════════════ */
const HELP: Record<number, { h: string; p: string[] }> = {
  1: { h: "You're in the right place", p: ["This course walks you through the basics of infection control, one small step at a time.", "Nothing here is timed or graded. You can move back and forth and repeat anything as often as you like. Always follow your school's procedures and your product labels."] },
  2: { h: "Three different words", p: ["Cleaning removes dirt and debris. Disinfecting kills most germs on hard, nonporous surfaces. Sterilizing kills all microbial life and is mostly used in medical settings.", "Clean always comes first. Disinfectant can't do its job on a dirty surface."] },
  3: { h: "Toss it or disinfect it", p: ["Porous items soak things up and can't be disinfected, so they're single-use. They go in the trash after one client.", "Hard, nonporous tools, like metal tweezers, can be cleaned and disinfected, then used again."] },
  4: { h: "Read the label", p: ["The label tells you how to use the product, including the contact time: how long the surface has to stay wet.", "If the surface dries before the time is up, apply again. Always follow the label on the product you use."] },
  5: { h: "Hands and gloves", p: ["Wet your hands, add soap, scrub for at least 20 seconds, rinse, and dry with a clean towel.", "Change gloves between clients, if they tear, and after touching anything that isn't clean."] },
  6: { h: "The treatment room", p: ["Follow the steps at the top. Tap an item to pick it up, then tap where it goes.", "There's no time limit and nothing is scored. A wrong move just gets a hint."] },
};

/* ══════════════ ENGINE ══════════════ */
const STORE_KEY = "cs-course-v1";

function readStore(): { idx?: number; goal?: string } {
  try { const raw = localStorage.getItem(STORE_KEY); return raw ? JSON.parse(raw) : {}; } catch { return {}; }
}

export default function Course() {
  const total = SCREENS.length;

  // Resume where the learner left off: no penalty, no reset.
  const [idx, setIdx] = useState(() => {
    const d = readStore();
    return typeof d.idx === "number" && d.idx > 0 && d.idx < total ? d.idx : 0;
  });
  const [ready, setReady] = useState(false);
  const [goal, setGoal] = useState<string | null>(() => readStore().goal ?? null);
  const [help, setHelp] = useState(false);
  const [resumedAt] = useState<number | null>(() => {
    const d = readStore();
    return typeof d.idx === "number" && d.idx > 0 && d.idx < total ? d.idx : null;
  });

  const s = SCREENS[idx];

  useEffect(() => {
    try { localStorage.setItem(STORE_KEY, JSON.stringify({ idx, goal })); } catch { /* ignore */ }
  }, [idx, goal]);

  // Reset the gate whenever the screen changes.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setReady(!SCREENS[idx].gate); setHelp(false); }, [idx]);

  const onReady = useCallback(() => setReady(true), []);
  const next = useCallback(() => setIdx((i: number) => Math.min(i + 1, total - 1)), [total]);
  const back = useCallback(() => setIdx((i: number) => Math.max(i - 1, 0)), []);

  const pct = Math.round(((idx + 1) / total) * 100);
  const StageEl = s.Stage;
  const trade = TRADES.find((t) => t.id === goal);
  const sub = s.lesson === 6 && s.layout === "title" && trade
    ? `A client just left. Get the treatment room ready for the next one, the same way you will in ${trade.where}. It isn't a test. Take your time.`
    : s.sub;

  return (
    <div className="crs">
      {/* top bar */}
      <div className="crs-top">
        <a href={CASE_URL} className="exit">← Exit</a>
        <span className="wordmark"><span className="mk" />Clean Station</span>
        <span className="lessonpips" aria-hidden>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <span key={n} className={`pip${n < s.lesson ? " done" : n === s.lesson ? " on" : ""}`} />
          ))}
        </span>
      </div>

      {/* stage */}
      <div className="crs-stage">
        {s.layout === "capstone" ? (
          <CapstoneScreen key={idx} onReady={onReady} back={back} next={next} ready={ready} help={help} setHelp={setHelp} note={s.note} cta={s.cta} />
        ) : s.layout === "complete" ? (
          <CompleteScreen key={idx} goal={goal} back={back} onRestart={() => { setIdx(0); setGoal(null); try { localStorage.removeItem(STORE_KEY); } catch { /* ignore */ } }} />
        ) : (
          <div className="crs-device crs-anim" key={idx}>
            <div className="crs-screen">
              <div className="crs-head">
                <span className="mk" /><span className="nm">Clean Station</span>
                <span className="prog">
                  <span className="track"><span className="fill" style={{ width: `${pct}%` }} /></span>
                  <span className="pct">Lesson {s.lesson} / 6</span>
                </span>
                <button className="q" aria-label="Help" onClick={() => setHelp(true)}>?</button>
              </div>

              <div className="crs-body">
                {s.layout === "title" ? (
                  <div className="crs-stagearea">
                    <div className="crs-title-stage">
                      <div className="big">{s.title}</div>
                      {sub && <div className="sub">{sub}</div>}
                    </div>
                  </div>
                ) : (
                  <>
                    {s.eyebrow && <div className="crs-eyebrow"><span className="n">{String(s.lesson).padStart(2, "0")}</span>{s.eyebrow}</div>}
                    <h2 className="crs-h">{s.title}</h2>
                    {sub && <p className="crs-sub">{sub}</p>}
                    <div className="crs-stagearea">{StageEl && <StageEl onReady={onReady} goal={goal} setGoal={setGoal} />}</div>
                  </>
                )}
              </div>

              <div className="crs-foot">
                <span className="crs-note">
                  {resumedAt === idx ? "Picked up where you left off" : s.gate && ready ? <><span className="ok">✓</span> Nice, that&apos;s it</> : s.note}
                </span>
                <span className="crs-navbtns">
                  <button className="crs-back" onClick={back} disabled={idx === 0}>Back</button>
                  <button className={`crs-cta${s.gate && !ready ? " locked" : ""}${s.layout === "title" ? " go" : ""}`} onClick={next} disabled={s.gate && !ready}>
                    {s.cta}<span className="a">→</span>
                  </button>
                </span>
              </div>

              {help && <HelpSheet h={HELP[s.lesson] ?? HELP[1]} onClose={() => setHelp(false)} />}
            </div>
          </div>
        )}
      </div>

      <div className="crs-legal">{FOOTER}</div>
    </div>
  );
}

/* Capstone screen: the treatment room + step rail inside the device chrome.
   The ? shows a hint for whichever step is current. */
function CapstoneScreen({ onReady, back, next, ready, help, setHelp, note, cta }:
  { onReady: () => void; back: () => void; next: () => void; ready: boolean; help: boolean; setHelp: (b: boolean) => void; note: string; cta: string }) {
  const [step, setStep] = useState(0);
  const hint = CAP_HINTS[Math.min(step, CAP_HINTS.length - 1)];
  return (
    <div className="crs-device crs-anim" style={{ width: "min(100%, 1080px)" }}>
      <div className="crs-screen" style={{ aspectRatio: "auto", height: "min(80vh, 780px)" }}>
        <div className="crs-head">
          <span className="mk" /><span className="nm">Clean Station</span>
          <span className="prog"><span className="track"><span className="fill" style={{ width: "96%" }} /></span><span className="pct">Lesson 6 / 6</span></span>
          <button className="q" aria-label="Hint for this step" onClick={() => setHelp(true)}>?</button>
        </div>
        <div className="crs-body" style={{ padding: "14px clamp(12px,3vw,28px) 0" }}>
          <Capstone onAllDone={onReady} onStep={setStep} />
        </div>
        <div className="crs-foot">
          <span className="crs-note">{ready ? <><span className="ok">✓</span> All seven done. Finish whenever you&apos;re ready</> : note}</span>
          <span className="crs-navbtns">
            <button className="crs-back" onClick={back}>Back</button>
            <button className={`crs-cta go${!ready ? " locked" : ""}`} onClick={next} disabled={!ready}>{cta}<span className="a">→</span></button>
          </span>
        </div>
        {help && <HelpSheet h={ready ? HELP[6] : { h: "Hint", p: [hint, "There's no time limit and nothing is scored."] }} onClose={() => setHelp(false)} />}
      </div>
    </div>
  );
}

/* Completion */
function CompleteScreen({ goal, back, onRestart }: { goal: string | null; back: () => void; onRestart: () => void }) {
  const t = TRADES.find((x) => x.id === goal);
  return (
    <div className="crs-device crs-anim">
      <div className="crs-screen">
        <div className="crs-body" style={{ justifyContent: "center", alignItems: "center" }}>
          <div className="crs-done">
            <div className="badge"><svg viewBox="0 0 24 24"><path d="M4 12l6 6L20 6" /></svg></div>
            <h2>Station ready</h2>
            <p>Your next client walks into a clean room.{t ? ` The same habits carry straight into ${t.where}.` : ""}</p>
            <textarea className="crs-feedback" placeholder="How would you improve this? (Optional. You don't have to write anything.)" aria-label="Optional feedback" />
          </div>
        </div>
        <div className="crs-foot">
          <button className="crs-back" onClick={back}>Back</button>
          <span className="crs-navbtns">
            <button className="crs-back" onClick={onRestart}>Start over</button>
            <a href={CASE_URL} className="crs-cta go" style={{ textDecoration: "none" }}>Back to all work<span className="a">→</span></a>
          </span>
        </div>
      </div>
    </div>
  );
}

function HelpSheet({ h, onClose }: { h: { h: string; p: string[] }; onClose: () => void }) {
  return (
    <div className="crs-help" role="dialog" aria-modal="true" aria-label="Help" onClick={onClose}>
      <div className="crs-help-card" onClick={(e) => e.stopPropagation()}>
        <h3>{h.h}</h3>
        {h.p.map((p, i) => <p key={i}>{p}</p>)}
        <button className="crs-cta" onClick={onClose}>Got it<span className="a">→</span></button>
      </div>
    </div>
  );
}
