
/* ─────────────────────────────────────────────────────────────
   Capstone — the live practice environment. Wraps the MacSim the
   learner will actually use, in courseMode (single-tap, typable
   Notes), with a four-step task rail that lights up as each of
   the storyboard's capstone tasks (6.2–6.5) is completed. No
   score, no timer, no record — completion only.
   ───────────────────────────────────────────────────────────── */

import { useCallback, useRef, useState } from "react";
import MacSim, { type SimEvent } from "./MacSim";

type Tasks = { notes: boolean; typed: boolean; switched: boolean; minimized: boolean };
const STEPS: { key: keyof Tasks; label: string; now: React.ReactNode }[] = [
  { key: "notes", label: "Open Notes", now: <>Open the <b>Notes</b> app in the dock at the bottom.</> },
  { key: "typed", label: "Type your name + Enter", now: <>In the Notes window, <b>type your first name</b> and press <b>Enter</b>.</> },
  { key: "switched", label: "Open Calendar, switch back", now: <>Open <b>Calendar</b> too, then tap <b>Notes</b> to switch back to it.</> },
  { key: "minimized", label: "Minimize Calendar", now: <>Tap the yellow button on the Calendar window to minimize it.</> },
];

export default function Capstone({ onAllDone }: { onAllDone: () => void }) {
  const [t, setT] = useState<Tasks>({ notes: false, typed: false, switched: false, minimized: false });
  const calOpened = useRef(false);
  const doneFired = useRef(false);

  const mark = useCallback((k: keyof Tasks) => {
    setT((prev) => {
      if (prev[k]) return prev;
      const nextT = { ...prev, [k]: true };
      if (nextT.notes && nextT.typed && nextT.switched && nextT.minimized && !doneFired.current) {
        doneFired.current = true;
        onAllDone();
      }
      return nextT;
    });
  }, [onAllDone]);

  const onEvent = useCallback((e: SimEvent) => {
    if ((e.type === "open" || e.type === "focus") && e.kind === "notes") {
      mark("notes");
      if (calOpened.current) mark("switched");
    }
    if (e.type === "open" && e.kind === "calendar") calOpened.current = true;
    if (e.type === "enter" && e.value.trim().length > 0) mark("typed");
    if (e.type === "minimize" && e.kind === "calendar") mark("minimized");
  }, [mark]);

  const nowStep = STEPS.find((st) => !t[st.key]);

  return (
    <div className="crs-capstone">
      <div className="crs-cap-rail">
        {STEPS.map((st, i) => {
          const done = t[st.key];
          const active = !done && st === nowStep;
          return (
            <span key={st.key} className={`step${done ? " done" : active ? " active" : ""}`}>
              <span className="box">{done ? <svg viewBox="0 0 12 12"><path d="M2 6l3 3 5-6" /></svg> : i + 1}</span>
              {st.label}
            </span>
          );
        })}
        <span className="crs-cap-now">
          {nowStep ? <>Now: {nowStep.now}</> : <>All four done. Keep exploring, or finish below.</>}
        </span>
      </div>
      <div className="crs-cap-frame">
        <MacSim courseMode onEvent={onEvent} />
      </div>
    </div>
  );
}
