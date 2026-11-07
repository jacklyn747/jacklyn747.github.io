
/* ─────────────────────────────────────────────────────────────
   Digital Literacy Fundamentals — the complete, playable course.
   Six lessons, driven by a screen manifest so screens are data,
   not bespoke files. Shell (Lessons 1–5) = dark glam course UI;
   capstone (Lesson 6) = the live MacSim, deliberately breaking to
   a "real laptop" look. Self-paced, no scores, no timers, single
   tap, real-laptop labels, reduced-motion aware.
   ───────────────────────────────────────────────────────────── */

import { useCallback, useEffect, useRef, useState } from "react";
const CASE_URL = "https://work.jackiemiller.co/";
import Capstone from "./Capstone";
import "./course.css";

/* ── tiny glyphs (generic, non-branded) ── */
const I = {
  file: <svg viewBox="0 0 24 24"><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v4h4" /></svg>,
  note: <svg viewBox="0 0 24 24"><path d="M6 3h9l3 3v15H6z" /><path d="M9 9h6M9 13h6M9 17h3" /></svg>,
  cal: <svg viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M4 9h16M8 3v4M16 3v4" /></svg>,
  folder: <svg viewBox="0 0 24 24"><path d="M4 7h6l2 2h8v9H4z" /></svg>,
  cursor: <svg viewBox="0 0 24 24"><path d="M6 4l12 7-5 1.5L11 18z" /></svg>,
  brief: <svg viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="12" rx="2" /><path d="M8 7V5h8v2" /></svg>,
  chat: <svg viewBox="0 0 24 24"><path d="M4 5h16v11H9l-4 3v-3H4z" /></svg>,
  person: <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.4" /><path d="M5 20a7 7 0 0 1 14 0" /></svg>,
};

type StageProps = { onReady: () => void; goal: string | null; setGoal: (g: string) => void };

/* ══════════════ STAGE COMPONENTS ══════════════ */

function Flag({ show, children }: { show: boolean; children: React.ReactNode }) {
  return <div className={`crs-flag${show ? " show" : ""}`}>{children}</div>;
}

/* Window title bar — identical chrome to the capstone (MacSim): traffic
   lights on the left, centered title. Red/yellow become live controls only
   when a handler is passed; otherwise they're inert, like a background window. */
function WinBar({ title, onClose, onMin }: { title: string; onClose?: () => void; onMin?: () => void }) {
  return (
    <div className="wbar">
      <span className="lights">
        {onClose
          ? <button className="lg red act" aria-label="Close window" onClick={onClose}><svg viewBox="0 0 8 8"><path d="M1 1l6 6M7 1L1 7" /></svg></button>
          : <span className="lg red" />}
        {onMin
          ? <button className="lg yellow act" aria-label="Minimize window" onClick={onMin}><svg viewBox="0 0 8 8"><path d="M1 4h6" /></svg></button>
          : <span className="lg yellow" />}
        <span className="lg green" />
      </span>
      <span className="wt">{title}</span>
    </div>
  );
}

/* 1.2 — Motivation: pick a goal (optional), framing acknowledges it */
const GOALS = [
  { id: "job", label: "Apply for a job", step: "applying for a job", icon: I.brief, ack: "Most applications are online now. This is the first step to filling one out yourself." },
  { id: "interview", label: "Get ready for an interview", step: "your next interview", icon: I.person, ack: "Interviews often mean sitting down at a laptop you've never touched. You'll be ready." },
  { id: "connect", label: "Stay in touch with family", step: "staying in touch with the people you love", icon: I.chat, ack: "Email, messages, a video call. They all start with the skills in this course." },
];
function MotivationStage({ onReady, goal, setGoal }: StageProps) {
  useEffect(() => { onReady(); }, [onReady]);
  const chosen = GOALS.find((g) => g.id === goal);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div className="crs-goals">
        {GOALS.map((g) => (
          <button key={g.id} className={`crs-goal${goal === g.id ? " on" : ""}`} onClick={() => setGoal(g.id)}>
            {g.icon}<span className="gl">{g.label}</span>
          </button>
        ))}
      </div>
      <div className="crs-goal-ack">{chosen ? chosen.ack : "Pick the one that fits you best. There's no wrong choice."}</div>
    </div>
  );
}

/* 2.2 — A single click */
function ClickStage({ onReady }: StageProps) {
  const [lit, setLit] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <button className={`crs-target${lit ? " lit" : ""}`} onClick={() => { setLit(true); onReady(); }} aria-pressed={lit}>
        {I.folder}<span className="tl">Documents</span>
      </button>
      <Flag show={lit}>This is a click. <span className="rl">On a real laptop, you&apos;d press the mouse or trackpad once.</span></Flag>
    </div>
  );
}

/* 2.3 — One tap or two? predict, then reveal */
function DiscriminateStage({ onReady }: StageProps) {
  const [rev, setRev] = useState<{ a: boolean; b: boolean }>({ a: false, b: false });
  useEffect(() => { if (rev.a && rev.b) onReady(); }, [rev, onReady]);
  return (
    <div className="crs-choices">
      <button className={`crs-choice${rev.a ? " revealed" : ""}`} onClick={() => setRev((r) => ({ ...r, a: true }))}>
        <span className="glyph"><svg viewBox="0 0 22 22"><circle cx="11" cy="11" r="8" /><circle cx="11" cy="11" r="2.4" fill="currentColor" stroke="none" /></svg></span>
        <span className="ct">One tap</span>
        <span className="cs">Tap to see what it does</span>
        <span className="reveal">Single click · selects</span>
      </button>
      <button className={`crs-choice${rev.b ? " revealed" : ""}`} onClick={() => setRev((r) => ({ ...r, b: true }))}>
        <span className="glyph"><svg viewBox="0 0 22 22"><circle cx="8" cy="11" r="6" /><circle cx="15" cy="11" r="6" /></svg></span>
        <span className="ct">Two quick taps</span>
        <span className="cs">Tap to see what it does</span>
        <span className="reveal">Double click · opens</span>
      </button>
    </div>
  );
}

/* 2.4 — Right-click: more options, not an error */
function RightClickStage({ onReady }: StageProps) {
  const [open, setOpen] = useState(false);
  const [used, setUsed] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div className="crs-rc">
        <button className="crs-target" onClick={() => { setOpen(true); setUsed(true); }}>
          {I.file}<span className="tl">A file</span>
        </button>
        {open && (
          <div className="crs-rc-menu" role="menu">
            <div className="mi" role="menuitem">Open</div>
            <div className="mi" role="menuitem">Rename</div>
            <div className="mi" role="menuitem">Copy</div>
            <button className="mi crs-rc-btn" onClick={() => { setOpen(false); onReady(); }}>
              Close this menu <span className="crs-rc-close">✕</span>
            </button>
          </div>
        )}
      </div>
      <Flag show={used}>A right-click just shows <b>more choices</b>. It&apos;s never a mistake. <span className="rl">Close it by tapping away or choosing Close.</span></Flag>
    </div>
  );
}

/* 2.5 — Dragging: press, hold, move, release (demonstrated) */
const DRAG_STEPS = ["Press", "Hold", "Move", "Release"];
function DragDemoStage({ onReady }: StageProps) {
  const [step, setStep] = useState(-1);
  const [x, setX] = useState(0);
  const timers = useRef<number[]>([]);
  const reduce = usePrefersReducedMotion();
  const play = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    if (reduce) { setStep(3); setX(1); onReady(); return; }
    setStep(0); setX(0);
    [0, 1, 2, 3].forEach((s, i) => {
      timers.current.push(window.setTimeout(() => {
        setStep(s);
        if (s === 2) setX(1);
        if (s === 3) onReady();
      }, i * 750 + 300));
    });
  };
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <div className="crs-dragfield">
        <span className="slot a" /><span className="slot b" />
        <div className="crs-dragfile" style={{ left: x ? "calc(100% - 92px)" : "26px", transition: reduce ? "none" : "left 0.7s ease" }}>{I.file}</div>
      </div>
      <div className="crs-dragsteps">
        {DRAG_STEPS.map((s, i) => <span key={s} className={`crs-dragstep${step >= i ? " on" : ""}`}>{s}</span>)}
      </div>
      <button className="crs-playbtn" onClick={play}>▷ {step < 0 ? "Watch it happen" : "Watch again"}</button>
      <Flag show={step >= 3}>Dragging is one motion: press, hold, move, release. <span className="rl">You&apos;ll try it for real in the last lesson.</span></Flag>
    </div>
  );
}

/* 3.2 — Typing your name */
function TypeNameStage({ onReady }: StageProps) {
  const [v, setV] = useState("");
  return (
    <div className="crs-inputwrap">
      <input className="crs-input" autoFocus placeholder="Type your first name" aria-label="Type your first name" aria-describedby="tn-hint"
        value={v} onChange={(e) => { setV(e.target.value); if (e.target.value.trim().length > 0) onReady(); }} />
      <div className="crs-hint" id="tn-hint" aria-live="polite">{v.trim() ? "That's it. Those are your keystrokes, showing up on the screen." : "Tap the box and use the keyboard to type your name."}</div>
    </div>
  );
}

/* 3.3 — Fixing a mistake (seeded typo) */
function FixTypoStage({ onReady }: StageProps) {
  const target = "Jackie";
  const [v, setV] = useState("Jackieee");
  const good = v === target;
  useEffect(() => { if (good) onReady(); }, [good, onReady]);
  return (
    <div className="crs-inputwrap">
      <input className={`crs-input${good ? " good" : ""}`} aria-label="Fix the spelling to Jackie" aria-describedby="ft-hint" value={v} onChange={(e) => setV(e.target.value)} />
      <div className="crs-hint" id="ft-hint" aria-live="polite">
        {good ? "Fixed. Making a mistake and correcting it is a normal part of typing."
          : <>This word has extra letters. Use <span className="k">⌫ Backspace</span> to remove them until it reads <b>Jackie</b>.</>}
      </div>
    </div>
  );
}

/* 3.4 — Pressing Enter */
function PressEnterStage({ onReady }: StageProps) {
  const [v, setV] = useState("");
  const [entered, setEntered] = useState(false);
  return (
    <div className="crs-inputwrap">
      <input className={`crs-input${entered ? " good" : ""}`} autoFocus placeholder="Type anything, then press Enter" aria-label="Type anything then press Enter" aria-describedby="pe-hint"
        value={v} onChange={(e) => setV(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" && v.trim()) { setEntered(true); onReady(); } }} />
      <div className="crs-hint" id="pe-hint">Type a word, then press <span className="k">Enter ↵</span> to confirm it.</div>
      <div className={`crs-entered${entered ? " show" : ""}`} role="status">{entered ? "Entered! On a real laptop, Enter is how you submit or confirm." : ""}</div>
    </div>
  );
}

/* 3.5 — Capital letters */
function CapitalStage({ onReady }: StageProps) {
  const [v, setV] = useState("");
  const ok = v.length >= 2 && /^[A-Z]/.test(v);
  const tried = v.length >= 2 && !ok;
  useEffect(() => { if (ok) onReady(); }, [ok, onReady]);
  return (
    <div className="crs-inputwrap">
      <input className={`crs-input${ok ? " good" : ""}`} autoFocus placeholder="Type a name with a capital letter" aria-label="Type a word starting with a capital letter" aria-describedby="cap-hint"
        value={v} onChange={(e) => setV(e.target.value)} />
      <div className="crs-hint" id="cap-hint" aria-live="polite">
        {ok ? "That's a capital letter to start. Exactly right."
          : tried ? <>Almost. Try holding <span className="k">⇧ Shift</span> while pressing the first letter.</>
          : <>Type any name. Hold <span className="k">⇧ Shift</span> and a letter to make it a capital.</>}
      </div>
    </div>
  );
}

/* 4.2 — What's a window? toggle */
function WindowToggleStage({ onReady }: StageProps) {
  const [on, setOn] = useState(true);
  const [seen, setSeen] = useState({ on: true, off: false });
  const set = (next: boolean) => {
    setOn(next);
    setSeen((prev) => {
      const updated = { ...prev, [next ? "on" : "off"]: true };
      if (updated.on && updated.off) onReady();
      return updated;
    });
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div className="crs-desk plain">
        <div className="crs-desk-icons"><div className="crs-di"><span className="t">{I.folder}</span><span className="l">Files</span></div></div>
        {on && (
          <div className="crs-win" style={{ top: "48%" }}>
            <WinBar title="A window" />
            <div className="wbody"><h4>A separate space</h4><div className="wline" /><div className="wline s" /></div>
          </div>
        )}
      </div>
      <div className="crs-toggle" role="group" aria-label="Toggle the window">
        <button className={on ? "on" : ""} onClick={() => set(true)}>With a window open</button>
        <button className={!on ? "on" : ""} onClick={() => set(false)}>Just the desktop</button>
      </div>
      <Flag show={seen.on && seen.off}>A window is its own space that sits on top of the desktop. You can open it, and close it again.</Flag>
    </div>
  );
}

/* 4.3 — Opening and closing */
function OpenCloseStage({ onReady }: StageProps) {
  const [open, setOpen] = useState(false);
  const opened = useRef(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div className="crs-desk">
        {!open && (
          <div className="crs-desk-icons">
            <button className="crs-di" onClick={() => { setOpen(true); opened.current = true; }}>
              <span className="t">{I.note}</span><span className="l">Notes</span>
            </button>
          </div>
        )}
        {open && (
          <div className="crs-win">
            <WinBar title="Notes" onClose={() => { setOpen(false); if (opened.current) onReady(); }} />
            <div className="wbody"><h4>Notes</h4><div className="wline" /><div className="wline s" /></div>
          </div>
        )}
      </div>
      <p className="crs-hint">{open ? "Now tap the red × to close it." : "Tap the Notes icon to open its window."}</p>
    </div>
  );
}

/* 4.4 — Minimize doesn't mean delete */
function MinimizeStage({ onReady }: StageProps) {
  const [min, setMin] = useState(false);
  const restored = useRef(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div className="crs-desk">
        {!min ? (
          <div className="crs-win">
            <WinBar title="Your work" onMin={() => setMin(true)} />
            <div className="wbody"><h4>Still here</h4><div className="wline" /><div className="wline s" /></div>
          </div>
        ) : null}
        <div className="crs-taskbar">
          <button className={`crs-tb-ent${min ? "" : " dim"}`} disabled={!min} onClick={() => { setMin(false); restored.current = true; onReady(); }}>
            <i />Your work
          </button>
          <span className="crs-tb-lab">Taskbar</span>
        </div>
      </div>
      <p className="crs-hint">
        {!min ? "Tap the yellow button to minimize the window." : "It isn't gone. It's waiting on the taskbar. Tap it to bring it back."}
      </p>
    </div>
  );
}

/* 4.5 — Switching between windows */
function SwitchStage({ onReady }: StageProps) {
  const [active, setActive] = useState<"notes" | "cal">("notes");
  const seen = useRef({ notes: true, cal: false });
  const pick = (w: "notes" | "cal") => { setActive(w); seen.current[w] = true; if (seen.current.notes && seen.current.cal) onReady(); };
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div className="crs-desk">
        <div className="crs-win" style={{ top: "44%" }}>
          <WinBar title={active === "notes" ? "Notes" : "Calendar"} />
          <div className="wbody">
            <h4>{active === "notes" ? "Notes" : "Calendar"}</h4>
            <div className="wline" /><div className="wline s" />
          </div>
        </div>
        <div className="crs-taskbar">
          <button className={`crs-tb-ent${active === "notes" ? "" : " dim"}`} onClick={() => pick("notes")}><i />Notes</button>
          <button className={`crs-tb-ent${active === "cal" ? "" : " dim"}`} onClick={() => pick("cal")}><i />Calendar</button>
          <span className="crs-tb-lab">Taskbar</span>
        </div>
      </div>
      <p className="crs-hint">Two windows are open. Tap each one on the taskbar to switch between them.</p>
    </div>
  );
}

/* 5.2 — Icons */
function IconsStage({ onReady }: StageProps) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div className="crs-desk">
        <div className="crs-desk-icons">
          {[["Notes", I.note], ["Calendar", I.cal], ["Files", I.folder]].map(([l, g]) => (
            <button key={l as string} className="crs-di" onClick={() => { setOpen(l as string); onReady(); }}>
              <span className="t">{g as React.ReactNode}</span><span className="l">{l as string}</span>
            </button>
          ))}
        </div>
        {open && (
          <div className="crs-win"><WinBar title={open} />
            <div className="wbody"><h4>{open}</h4><div className="wline" /><div className="wline s" /></div></div>
        )}
      </div>
      <p className="crs-hint">{open ? "Each icon opens a program. Tap it, and the program opens." : "Tap any icon to open it."}</p>
    </div>
  );
}

/* 5.3 — The taskbar (explanatory) */
function TaskbarStage({ onReady }: StageProps) {
  useEffect(() => { onReady(); }, [onReady]);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div className="crs-desk">
        <div className="crs-desk-icons">
          <div className="crs-di"><span className="t">{I.note}</span><span className="l">Notes</span></div>
          <div className="crs-di"><span className="t">{I.cal}</span><span className="l">Calendar</span></div>
        </div>
        <div className="crs-taskbar">
          <span className="crs-tb-ent"><i />Notes</span>
          <span className="crs-tb-ent dim"><i />Calendar</span>
          <span className="crs-tb-lab">Always here</span>
        </div>
      </div>
      <p className="crs-hint">The taskbar is your home base. Whatever you open shows up here, so you can always find it again, just like the window you brought back a moment ago.</p>
    </div>
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
  { lesson: 1, layout: "title", title: "Digital Literacy Fundamentals", sub: "Getting comfortable with a laptop, one step at a time.", note: "Six lessons · about 30 minutes · go at your own pace", cta: "Begin" },
  { lesson: 1, eyebrow: "Orientation", title: "Why this matters", sub: "The skills in this course open a real door. Before we teach a single one, tell us which door you have in mind.", note: "Your choice · you can change it later", cta: "Continue", Stage: MotivationStage },
  // Lesson 2 — The Mouse
  { lesson: 2, layout: "title", title: "The Mouse", sub: "How you'll point, select, and move things.", note: "Lesson 2 of 6", cta: "Start" },
  { lesson: 2, eyebrow: "The Mouse", title: "A single click", sub: "One press to point at something and select it. Try it on the icon below.", note: "Tap the icon", cta: "Next", gate: true, Stage: ClickStage },
  { lesson: 2, eyebrow: "The Mouse", title: "One tap, or two?", sub: "One of these selects. The other opens. Tap each card to find out which is which.", note: "Tap both to reveal · no wrong answers", cta: "Next", gate: true, Stage: DiscriminateStage },
  { lesson: 2, eyebrow: "The Mouse", title: "Right-click: more options", sub: "A second kind of click that opens a short list of choices. It's never an error.", note: "Open the menu, then close it", cta: "Next", gate: true, Stage: RightClickStage },
  { lesson: 2, eyebrow: "The Mouse", title: "Dragging", sub: "Moving something from one spot to another in a single motion. Watch it happen.", note: "Press · hold · move · release", cta: "Next", gate: true, Stage: DragDemoStage },
  // Lesson 3 — The Keyboard
  { lesson: 3, layout: "title", title: "The Keyboard", sub: "Typing, correcting, and confirming.", note: "Lesson 3 of 6", cta: "Start" },
  { lesson: 3, eyebrow: "The Keyboard", title: "Typing", sub: "Whatever you press appears on the screen. Type your first name.", note: "Try it", cta: "Next", gate: true, Stage: TypeNameStage },
  { lesson: 3, eyebrow: "The Keyboard", title: "Fixing a mistake", sub: "Backspace removes the letter before the cursor. Use it to fix the word below.", note: "Unlimited tries · mistakes are normal", cta: "Next", gate: true, Stage: FixTypoStage },
  { lesson: 3, eyebrow: "The Keyboard", title: "Pressing Enter", sub: "Enter is how you confirm or submit what you typed.", note: "Type, then press Enter", cta: "Next", gate: true, Stage: PressEnterStage },
  { lesson: 3, eyebrow: "The Keyboard", title: "Capital letters", sub: "Hold Shift while pressing a letter to make it a capital.", note: "Try a name", cta: "Next", gate: true, Stage: CapitalStage },
  // Lesson 4 — Windows
  { lesson: 4, layout: "title", title: "Windows", sub: "How programs open and stay organized.", note: "Lesson 4 of 6", cta: "Start" },
  { lesson: 4, eyebrow: "Windows", title: "What's a window?", sub: "A window is a separate space that opens on top of the desktop. See the difference.", note: "Try both views", cta: "Next", gate: true, Stage: WindowToggleStage },
  { lesson: 4, eyebrow: "Windows", title: "Opening and closing", sub: "Tap an icon to open its window. Tap the red × to close it.", note: "Open it, then close it", cta: "Next", gate: true, Stage: OpenCloseStage },
  { lesson: 4, eyebrow: "Windows", title: "Minimize doesn't mean delete", sub: "Minimizing tucks a window onto the taskbar. It's still there. Find it again.", note: "Minimize, then bring it back", cta: "Next", gate: true, Stage: MinimizeStage },
  { lesson: 4, eyebrow: "Windows", title: "Switching between windows", sub: "With more than one window open, the taskbar lets you jump between them.", note: "Tap each window on the taskbar", cta: "Next", gate: true, Stage: SwitchStage },
  // Lesson 5 — The Desktop
  { lesson: 5, layout: "title", title: "The Desktop", sub: "Your home base.", note: "Lesson 5 of 6", cta: "Start" },
  { lesson: 5, eyebrow: "The Desktop", title: "Icons", sub: "Each icon opens a program. Tap one to open it.", note: "Tap an icon", cta: "Next", gate: true, Stage: IconsStage },
  { lesson: 5, eyebrow: "The Desktop", title: "The taskbar", sub: "The strip along the bottom is where your open windows live. It's always there when you need them.", note: "About 1 minute", cta: "Continue", Stage: TaskbarStage },
  // Lesson 6 — Capstone
  { lesson: 6, layout: "title", title: "Your turn", sub: "This last lesson is a real, working desktop. It isn't a test. You'll do a few small tasks using everything you've practiced. Take your time.", note: "Untimed · nothing is scored · nothing is recorded", cta: "Start practicing" },
  { lesson: 6, layout: "capstone", eyebrow: "Capstone", title: "Practice", note: "Follow the steps at the top · a ? gives you a hint", cta: "Finish", gate: true },
  { lesson: 6, layout: "complete", title: "You did it", note: "", cta: "Done" },
];

/* ══════════════ HELP CONTENT (per lesson) ══════════════ */
const HELP: Record<number, { h: string; p: string[] }> = {
  1: { h: "You're in the right place", p: ["This course teaches the basics of using a laptop, one small step at a time.", "Nothing here is timed or graded. You can move back and forth, and repeat anything as many times as you like."] },
  2: { h: "The mouse", p: ["The mouse (or a trackpad) moves a pointer on the screen so you can point at things.", "A single tap selects. Two quick taps open. A right-click shows more choices."] },
  3: { h: "The keyboard", p: ["The keyboard types letters and numbers onto the screen.", "Backspace erases. Enter confirms. Shift makes capital letters."] },
  4: { h: "Windows", p: ["A window is a space a program opens in.", "Close removes it. Minimize hides it on the taskbar. It is not deleted. You can open several and switch between them."] },
  5: { h: "The desktop", p: ["The desktop is your home base, the screen you start from.", "Icons open programs. The taskbar keeps your open windows within reach."] },
  6: { h: "The practice desktop", p: ["This is a stand-in for a real laptop. Everything you tap here works the same way it will on a physical machine.", "Follow the steps at the top. There's no time limit and nothing is scored."] },
};

/* ══════════════ ENGINE ══════════════ */
const STORE_KEY = "dl-course-v1";

export default function Course() {
  const total = SCREENS.length;

  // Resume from where the learner left off (trauma-informed: no penalty, no reset).
  const [idx, setIdx] = useState(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (typeof d.idx === "number" && d.idx > 0 && d.idx < total) return d.idx;
      }
    } catch { /* storage blocked — start fresh */ }
    return 0;
  });

  const [ready, setReady] = useState(false);

  const [goal, setGoal] = useState<string | null>(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (d.goal) return d.goal;
      }
    } catch { /* storage blocked — start fresh */ }
    return null;
  });

  const [help, setHelp] = useState(false);
  // Read once on load: show "resumed" only on the first screen after returning.
  const [resumedAt] = useState<number | null>(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (typeof d.idx === "number" && d.idx > 0 && d.idx < total) return d.idx;
      }
    } catch { /* storage blocked */ }
    return null;
  });

  const s = SCREENS[idx];

  useEffect(() => {
    try { localStorage.setItem(STORE_KEY, JSON.stringify({ idx, goal })); } catch { /* ignore */ }
  }, [idx, goal]);

  // Reset the gate whenever the screen changes.
  // This is a valid use of setState in effect - synchronizing derived state
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setReady(!SCREENS[idx].gate); setHelp(false); }, [idx]);

  const onReady = useCallback(() => setReady(true), []);
  const next = useCallback(() => setIdx((i: number) => Math.min(i + 1, total - 1)), [total]);
  const back = useCallback(() => setIdx((i: number) => Math.max(i - 1, 0)), []);

  const pct = Math.round(((idx + 1) / total) * 100);
  const StageEl = s.Stage;

  return (
    <div className="crs">
      {/* top bar */}
      <div className="crs-top">
        <a href={CASE_URL} className="exit">← Exit</a>
        <span className="wordmark"><span className="mk" />Digital Literacy Fundamentals</span>
        <span className="lessonpips" aria-hidden>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <span key={n} className={`pip${n < s.lesson ? " done" : n === s.lesson ? " on" : ""}`} />
          ))}
        </span>
      </div>

      {/* stage */}
      <div className="crs-stage">
        {s.layout === "capstone" ? (
          <CapstoneScreen key={idx} onReady={onReady} back={back} next={next} ready={ready} help={help} setHelp={setHelp} lesson={s.lesson} note={s.note} cta={s.cta} />
        ) : s.layout === "complete" ? (
          <CompleteScreen key={idx} goal={goal} back={back} onRestart={() => { setIdx(0); setGoal(null); try { localStorage.removeItem(STORE_KEY); } catch {} }} />
        ) : (
          <div className="crs-device crs-anim" key={idx}>
            <div className="crs-screen">
              <div className="crs-head">
                <span className="mk" /><span className="nm">Digital Literacy</span>
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
                      {s.sub && <div className="sub">{s.sub}</div>}
                    </div>
                  </div>
                ) : (
                  <>
                    {s.eyebrow && <div className="crs-eyebrow"><span className="n">{String(s.lesson).padStart(2, "0")}</span>{s.eyebrow}</div>}
                    <h2 className="crs-h">{s.title}</h2>
                    {s.sub && <p className="crs-sub">{s.sub}</p>}
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

              {help && <HelpSheet lesson={s.lesson} onClose={() => setHelp(false)} />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* Capstone screen: the live sim + task rail, wrapped in the device shell chrome */
function CapstoneScreen({ onReady, back, next, ready, help, setHelp, lesson, note, cta }:
  { onReady: () => void; back: () => void; next: () => void; ready: boolean; help: boolean; setHelp: (b: boolean) => void; lesson: number; note: string; cta: string }) {
  return (
    <div className="crs-device crs-anim" style={{ width: "min(100%, 1080px)" }}>
      <div className="crs-screen" style={{ aspectRatio: "auto", height: "min(82vh, 780px)" }}>
        <div className="crs-head">
          <span className="mk" /><span className="nm">Digital Literacy</span>
          <span className="prog"><span className="track"><span className="fill" style={{ width: "96%" }} /></span><span className="pct">Lesson 6 / 6</span></span>
          <button className="q" aria-label="Help" onClick={() => setHelp(true)}>?</button>
        </div>
        <div className="crs-body" style={{ padding: "16px clamp(16px,3vw,28px) 0" }}>
          <Capstone onAllDone={onReady} />
        </div>
        <div className="crs-foot">
          <span className="crs-note">{ready ? <><span className="ok">✓</span> All four done. Finish whenever you&apos;re ready</> : note}</span>
          <span className="crs-navbtns">
            <button className="crs-back" onClick={back}>Back</button>
            <button className={`crs-cta go${!ready ? " locked" : ""}`} onClick={next} disabled={!ready}>{cta}<span className="a">→</span></button>
          </span>
        </div>
        {help && <HelpSheet lesson={lesson} onClose={() => setHelp(false)} />}
      </div>
    </div>
  );
}

/* Completion */
function CompleteScreen({ goal, back, onRestart }: { goal: string | null; back: () => void; onRestart: () => void }) {
  const g = GOALS.find((x) => x.id === goal);
  return (
    <div className="crs-device crs-anim">
      <div className="crs-screen">
        <div className="crs-body" style={{ justifyContent: "center", alignItems: "center" }}>
          <div className="crs-done">
            <div className="badge"><svg viewBox="0 0 24 24"><path d="M4 12l6 6L20 6" /></svg></div>
            <h2>You did it</h2>
            <p>You just used a laptop desktop the same way you would a real one: opening programs, typing, and keeping track of your windows.{g ? ` One real step toward ${g.step}.` : ""}</p>
            <textarea className="crs-feedback" placeholder="How would you improve this? (Optional. You don't have to write anything.)" aria-label="Optional feedback" />
          </div>
        </div>
        <div className="crs-foot">
          <button className="crs-back" onClick={back}>Back</button>
          <span className="crs-navbtns">
            <button className="crs-back" onClick={onRestart}>Start over</button>
            <a href={CASE_URL} className="crs-cta go" style={{ textDecoration: "none" }}>Back to the case study<span className="a">→</span></a>
          </span>
        </div>
      </div>
    </div>
  );
}

function HelpSheet({ lesson, onClose }: { lesson: number; onClose: () => void }) {
  const h = HELP[lesson] ?? HELP[1];
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

/* prefers-reduced-motion hook */
function usePrefersReducedMotion() {
  const [reduce, setReduce] = useState(() => {
    if (typeof window !== "undefined") {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      return mq.matches;
    }
    return false;
  });
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduce(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduce;
}
