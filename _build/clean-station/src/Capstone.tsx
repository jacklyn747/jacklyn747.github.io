
/* Capstone: reset the treatment room.
   A top-down room in flat shapes. Seven tasks, in order, shown on a step
   rail at the top. Tap an item to pick it up, then tap where it goes.
   Wrong moves get a kind hint, never an error. Untimed, nothing scored,
   nothing recorded. The short countdowns stand in for label contact time. */

import { useCallback, useEffect, useRef, useState } from "react";
import "./room.css";

const STEPS: { label: string; now: React.ReactNode }[] = [
  { label: "Toss single-use items", now: <>Pick up each used <b>single-use item</b> and put it in the <b>trash</b>.</> },
  { label: "Bag used linens", now: <>Pick up the used <b>sheet</b> and <b>towel</b> and put them in the <b>linen bag</b>.</> },
  { label: "Clean bed + counter", now: <>Pick up the <b>cleaner</b>, then tap the <b>bed</b> and the <b>counter</b>.</> },
  { label: "Disinfect + wait", now: <>Pick up the <b>disinfectant</b>, tap the <b>bed</b> and the <b>counter</b>, then wait out the contact time.</> },
  { label: "Tools: clean, then disinfect", now: <>Pick up the used <b>metal tools</b>. Clean them at the <b>sink</b>, then put them in the <b>disinfect tray</b>.</> },
  { label: "Wash hands", now: <>Tap the <b>sink</b> to wash your hands.</> },
  { label: "Set up fresh", now: <>Put <b>fresh linens</b> on the bed and the <b>disinfected tools</b> on the counter.</> },
];

export const CAP_HINTS = [
  "Used cotton rounds, gauze, gloves and the wooden spatula are single-use. Tap one, then tap the round trash can. Do all four.",
  "Tap the used sheet on the bed, then tap the linen bag. Do the same with the towel. Linens get laundered, not tossed.",
  "Tap the cleaner bottle on the shelf at the bottom right. Then tap the bed, and then the counter.",
  "Tap the disinfectant bottle. Tap the bed and the counter so both are wet. Then wait for the contact time to run out.",
  "Tap the used metal tools on the counter. Tap the sink to clean them. Then tap the disinfect tray and wait for the contact time.",
  "With nothing picked up, tap the sink. Clean hands come before anything touches the next client's setup.",
  "Tap the fresh linens in the cabinet, then tap the bed. Then tap the disinfected tools in the tray, then tap the counter.",
];

const CONTACT = 6; // demo seconds standing in for the label's contact time

type Item = "cotton" | "gauze" | "gloves" | "spatula" | "sheet" | "towel" | "cleaner" | "disinfectant" | "tools" | "fresh" | "ready";
type Place = "trash" | "bag" | "bed" | "counter" | "sink" | "tray";

const NAMES: Record<Item, string> = {
  cotton: "used cotton rounds", gauze: "used gauze", gloves: "used gloves", spatula: "used wooden spatula",
  sheet: "used sheet", towel: "used towel", cleaner: "cleaner", disinfectant: "disinfectant",
  tools: "used metal tools", fresh: "fresh linens", ready: "disinfected tools",
};
const SINGLE: Item[] = ["cotton", "gauze", "gloves", "spatula"];
const ITEM_STEP: Record<Item, number> = {
  cotton: 0, gauze: 0, gloves: 0, spatula: 0, sheet: 1, towel: 1, cleaner: 2, disinfectant: 3, tools: 4, fresh: 6, ready: 6,
};
const WASH = ["Wet hands", "Add soap", "Scrub at least 20 seconds", "Rinse", "Dry with a clean towel"];

export default function Capstone({ onAllDone, onStep }: { onAllDone: () => void; onStep: (n: number) => void }) {
  const [sel, setSel] = useState<Item | null>(null);
  const [trashed, setTrashed] = useState<Item[]>([]);
  const [bagged, setBagged] = useState<Item[]>([]);
  const [clean, setClean] = useState({ bed: false, counter: false });
  const [wet, setWet] = useState({ bed: false, counter: false });
  const [surfLeft, setSurfLeft] = useState<number | null>(null); // null = not started, 0 = done
  const [tools, setTools] = useState<"used" | "washed" | "soaking" | "ready" | "placed">("used");
  const [toolLeft, setToolLeft] = useState<number | null>(null);
  const [hands, setHands] = useState<"no" | "washing" | "yes">("no");
  const [washStep, setWashStep] = useState(0);
  const [linensOn, setLinensOn] = useState(false);
  const [msg, setMsg] = useState("Tap an item to pick it up, then tap where it goes.");
  const timers = useRef<number[]>([]);
  const doneFired = useRef(false);
  useEffect(() => () => timers.current.forEach((t) => clearInterval(t)), []);

  const step =
    trashed.length < 4 ? 0 :
    bagged.length < 2 ? 1 :
    !(clean.bed && clean.counter) ? 2 :
    surfLeft !== 0 ? 3 :
    !(tools === "ready" || tools === "placed") ? 4 :
    hands !== "yes" ? 5 :
    !(linensOn && tools === "placed") ? 6 : 7;

  useEffect(() => { onStep(step); }, [step, onStep]);
  useEffect(() => {
    if (step === 7 && !doneFired.current) {
      doneFired.current = true;
      setMsg("Station ready. Your next client walks into a clean room.");
      onAllDone();
    }
  }, [step, onAllDone]);

  const countdown = useCallback((set: (n: number) => void, after: () => void) => {
    let n = CONTACT;
    set(n);
    const t = window.setInterval(() => {
      n -= 1;
      set(n);
      if (n <= 0) { clearInterval(t); after(); }
    }, 1000);
    timers.current.push(t);
  }, []);

  const nowText = () => STEPS[Math.min(step, 6)].label.toLowerCase();

  const tapItem = (it: Item) => {
    if (sel === it) { setSel(null); setMsg("Put it down. Pick something else whenever you're ready."); return; }
    const s = ITEM_STEP[it];
    if (s === step) {
      setSel(it);
      setMsg(it === "cleaner" || it === "disinfectant"
        ? `Picked up the ${NAMES[it]}. Now tap a surface to use it on.`
        : `Picked up the ${NAMES[it]}. Now tap where it goes.`);
      return;
    }
    if (it === "disinfectant" && step === 2) { setMsg("Clean first. Disinfectant doesn't work on a dirty surface. Pick up the cleaner."); return; }
    if (it === "tools" && step < 4) { setMsg("Those metal tools aren't trash. They get cleaned and disinfected in a later step. Right now: " + nowText() + "."); return; }
    if (s < step) { setMsg(`That part is already done. Right now: ${nowText()}.`); return; }
    setMsg(`Good thinking, that comes later. Right now: ${nowText()}.`);
  };

  const tapPlace = (p: Place) => {
    if (surfLeft !== null && surfLeft > 0 && (p === "bed" || p === "counter")) {
      setMsg("Still wet. Leave it alone until the contact time is up."); return;
    }
    if (!sel) {
      if (p === "sink" && step === 5) {
        setHands("washing");
        let i = 0;
        setWashStep(0);
        setMsg("Washing your hands...");
        const t = window.setInterval(() => {
          i += 1;
          if (i >= WASH.length) { clearInterval(t); setHands("yes"); setMsg("Clean hands. Now set up for the next client."); }
          else setWashStep(i);
        }, 700);
        timers.current.push(t);
        return;
      }
      if (p === "sink" && step < 5) { setMsg(`Good habit. Handwashing comes a little later. Right now: ${nowText()}.`); return; }
      setMsg(`Pick something up first. Right now: ${nowText()}.`);
      return;
    }
    const it = sel;
    if (SINGLE.includes(it)) {
      if (p === "trash") {
        const next = [...trashed, it];
        setTrashed(next); setSel(null);
        setMsg(next.length < 4 ? `In the trash. ${4 - next.length} single-use item${4 - next.length === 1 ? "" : "s"} left.` : "All single-use items are in the trash.");
      } else if (p === "bag") setMsg("Close. The linen bag is only for linens. Single-use items go in the trash.");
      else if (p === "tray") setMsg("That one can't be disinfected. It's single-use, so it goes in the trash.");
      else setMsg("Single-use items go in the round trash can.");
      return;
    }
    if (it === "sheet" || it === "towel") {
      if (p === "bag") {
        const next = [...bagged, it];
        setBagged(next); setSel(null);
        setMsg(next.length < 2 ? "In the bag. One more linen to go." : "Both linens are bagged for the laundry.");
      } else if (p === "trash") setMsg("Linens get laundered, not tossed. Put them in the linen bag.");
      else setMsg("Used linens go in the linen bag.");
      return;
    }
    if (it === "cleaner") {
      if (p === "bed" || p === "counter") {
        const next = { ...clean, [p]: true };
        setClean(next);
        if (next.bed && next.counter) { setSel(null); setMsg("Both surfaces are clean. Now they're ready to disinfect."); }
        else setMsg(`The ${p} is clean. Now the ${p === "bed" ? "counter" : "bed"}.`);
      } else setMsg("The cleaner goes on the bed and the counter.");
      return;
    }
    if (it === "disinfectant") {
      if (p === "bed" || p === "counter") {
        const next = { ...wet, [p]: true };
        setWet(next);
        if (next.bed && next.counter) {
          setSel(null);
          setMsg("Both surfaces are wet. Let them sit for the full contact time.");
          countdown((n) => setSurfLeft(n), () => {
            setWet({ bed: false, counter: false });
            setMsg("Contact time is up. Bed and counter are disinfected.");
          });
        } else setMsg(`The ${p} is wet. Now the ${p === "bed" ? "counter" : "bed"}.`);
      } else setMsg("The disinfectant goes on the bed and the counter.");
      return;
    }
    if (it === "tools") {
      if (p === "sink") {
        if (tools === "used") { setTools("washed"); setMsg("Clean. Now put them in the disinfect tray."); }
        else setMsg("They're already clean. Now the disinfect tray.");
      } else if (p === "tray") {
        if (tools === "used") setMsg("Clean them at the sink first. Disinfectant doesn't work on dirty tools.");
        else {
          setTools("soaking"); setSel(null);
          setMsg("In the tray. Leave them for the full contact time.");
          countdown((n) => setToolLeft(n), () => { setTools("ready"); setMsg("Contact time is up. The tools are disinfected."); });
        }
      } else if (p === "trash") setMsg("Metal tools are hard and nonporous. Clean and disinfect them instead of tossing.");
      else setMsg("Tools get cleaned at the sink, then go in the disinfect tray.");
      return;
    }
    if (it === "fresh") {
      if (p === "bed") { setLinensOn(true); setSel(null); setMsg(tools === "placed" ? "Fresh linens on the bed." : "Fresh linens on the bed. Now the tools."); }
      else setMsg("Fresh linens go on the bed.");
      return;
    }
    if (it === "ready") {
      if (p === "counter") { setTools("placed"); setSel(null); setMsg(linensOn ? "Tools are out and ready." : "Tools are out. Now the fresh linens."); }
      else setMsg("Set the disinfected tools out on the counter.");
    }
  };

  const itemBtn = (it: Item, cls: string, label: string, show = true) =>
    show ? (
      <button key={it} className={`rm-item ${cls}${sel === it ? " sel" : ""}`} aria-pressed={sel === it} aria-label={`Pick up ${NAMES[it]}`} onClick={(e) => { e.stopPropagation(); tapItem(it); }}>
        <span className="shape" /><span className="tag">{label}</span>
      </button>
    ) : null;

  const surfState = (k: "bed" | "counter") => `${clean[k] ? " is-clean" : ""}${wet[k] ? " is-wet" : ""}`;

  return (
    <div className="crs-capstone">
      <div className="crs-cap-rail">
        {STEPS.map((st, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <span key={st.label} className={`step${done ? " done" : active ? " active" : ""}`}>
              <span className="box">{done ? <svg viewBox="0 0 12 12"><path d="M2 6l3 3 5-6" /></svg> : i + 1}</span>
              {st.label}
            </span>
          );
        })}
        <span className="crs-cap-now">
          {step < 7 ? <>Now: {STEPS[step].now}</> : <>All seven done. Station ready. Your next client walks into a clean room.</>}
        </span>
      </div>

      <div className="rm-msg" aria-live="polite">{msg}</div>

      <div className="crs-cap-frame rm-frame">
        <div className="rm-room" role="group" aria-label="Treatment room, seen from above">
          {/* counter with tray */}
          <button className={`rm-surf rm-counter${surfState("counter")}`} aria-label="Counter" onClick={() => tapPlace("counter")}>
            <span className="tag">Counter</span>
          </button>
          <button className="rm-surf rm-tray" aria-label="Disinfect tray" onClick={() => tapPlace("tray")}>
            <span className="tag">Disinfect tray{tools === "soaking" && toolLeft !== null ? ` · ${toolLeft}` : ""}</span>
            {tools === "soaking" && <span className="soak" />}
          </button>
          {itemBtn("spatula", "i-spatula", "Spatula", !trashed.includes("spatula"))}
          {itemBtn("tools", "i-tools", tools === "washed" ? "Tools (clean)" : "Used tools", tools === "used" || tools === "washed")}
          {itemBtn("ready", "i-ready", "Disinfected tools", tools === "ready")}
          {tools === "placed" && <span className="rm-static i-placed"><span className="shape" /><span className="tag">Tools ready</span></span>}

          {/* sink */}
          <button className={`rm-surf rm-sink${hands === "washing" ? " running" : ""}`} aria-label="Sink" onClick={() => tapPlace("sink")}>
            <span className="basin" />
            <span className="tag">{hands === "washing" ? WASH[washStep] : hands === "yes" ? "Sink · hands clean" : "Sink"}</span>
          </button>

          {/* cabinet with fresh linens */}
          <div className="rm-cabinet"><span className="tag">Clean linens</span></div>
          {itemBtn("fresh", "i-fresh", "Fresh linens", !linensOn)}

          {/* trolley with used single-use items */}
          <div className="rm-trolley"><span className="tag">Trolley</span></div>
          {itemBtn("cotton", "i-cotton", "Cotton", !trashed.includes("cotton"))}
          {itemBtn("gauze", "i-gauze", "Gauze", !trashed.includes("gauze"))}
          {itemBtn("gloves", "i-gloves", "Gloves", !trashed.includes("gloves"))}

          {/* bed */}
          <button className={`rm-surf rm-bed${surfState("bed")}${linensOn ? " dressed" : ""}`} aria-label="Treatment bed" onClick={() => tapPlace("bed")}>
            <span className="pillow" />
            <span className="tag">{surfLeft !== null && surfLeft > 0 ? `Contact time · ${surfLeft}` : linensOn ? "Bed · fresh linens" : "Treatment bed"}</span>
          </button>
          {surfLeft !== null && surfLeft > 0 && <span className="rm-timer" aria-live="polite">Contact time {surfLeft}</span>}
          {itemBtn("sheet", "i-sheet", "Used sheet", !bagged.includes("sheet"))}
          {itemBtn("towel", "i-towel", "Used towel", !bagged.includes("towel"))}

          {/* trash and linen bag */}
          <button className="rm-surf rm-trash" aria-label="Trash" onClick={() => tapPlace("trash")}><span className="tag">Trash</span></button>
          <button className="rm-surf rm-bag" aria-label="Linen bag" onClick={() => tapPlace("bag")}><span className="tag">Linen bag</span></button>

          {/* supply shelf */}
          <div className="rm-shelf"><span className="tag">Supplies</span></div>
          {itemBtn("cleaner", "i-cleaner", "Cleaner")}
          {itemBtn("disinfectant", "i-disinfectant", "Disinfectant")}
        </div>
      </div>
    </div>
  );
}
