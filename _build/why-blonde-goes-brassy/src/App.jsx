import { useEffect, useRef, useState } from "react";
import { indexData, pigmentForLevel } from "./lib.js";
import Hook from "./screens/Hook.jsx";
import LevelLab from "./screens/LevelLab.jsx";
import FixIt from "./screens/FixIt.jsx";
import ProveIt from "./screens/ProveIt.jsx";

const STEPS = ["The problem", "Level Lab", "Fix it", "Prove it"];

export default function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [step, setStep] = useState(0);
  const [lab, setLab] = useState({ start: 6, target: 9, colored: false });
  const headingRef = useRef(null);
  const firstRender = useRef(true);

  useEffect(() => {
    fetch("./lesson.json")
      .then((r) => {
        if (!r.ok) throw new Error(r.status);
        return r.json();
      })
      .then((json) => setData(indexData(json)))
      .catch(() => setError(true));
  }, []);

  // Move focus to the new screen's title so keyboard and screen reader
  // users land at the top of each step.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    window.scrollTo({ top: 0 });
    headingRef.current?.focus({ preventScroll: true });
  }, [step]);

  if (error) {
    return (
      <Shell>
        <p className="notice body">I couldn't load the lesson. Refresh the page to try again.</p>
      </Shell>
    );
  }
  if (!data) {
    return (
      <Shell>
        <p className="notice small" aria-live="polite">
          Loading…
        </p>
      </Shell>
    );
  }

  const exposed = lab.target > lab.start ? pigmentForLevel(data, lab.target) : null;
  const go = (n) => setStep(Math.max(0, Math.min(STEPS.length - 1, n)));

  return (
    <Shell>
      <nav className="progress" aria-label="Lesson progress">
        <ol>
          {STEPS.map((label, i) => (
            <li key={label}>
              <button
                type="button"
                className={`dot${i === step ? " is-current" : ""}${i < step ? " is-done" : ""}`}
                aria-current={i === step ? "step" : undefined}
                aria-label={`Step ${i + 1} of ${STEPS.length}: ${label}${i < step ? " (done)" : ""}`}
                disabled={i > step}
                onClick={() => go(i)}
              />
            </li>
          ))}
        </ol>
      </nav>

      <main>
        {step === 0 && <Hook data={data} headingRef={headingRef} onStart={() => go(1)} />}
        {step === 1 && <LevelLab data={data} lab={lab} setLab={setLab} headingRef={headingRef} />}
        {step === 2 && (
          <FixIt data={data} headingRef={headingRef} initialPigmentId={exposed?.id ?? "yellow"} />
        )}
        {step === 3 && <ProveIt data={data} headingRef={headingRef} onRestart={() => go(0)} />}
      </main>

      {step > 0 && (
        <div className="stepnav">
          <button type="button" className="btn btn--quiet" onClick={() => go(step - 1)}>
            ← Back
          </button>
          {step < STEPS.length - 1 && (
            <button
              type="button"
              className="btn"
              aria-label={`Next: ${STEPS[step + 1]}`}
              onClick={() => go(step + 1)}
            >
              Next
            </button>
          )}
        </div>
      )}
    </Shell>
  );
}

function Shell({ children }) {
  return (
    <div className="app">
      {/* Same exit as the other work.jackiemiller.co case studies. _top leaves an iframe embed too. */}
      <a className="exit" href="https://work.jackiemiller.co/" target="_top">
        ← Exit
      </a>
      {children}
      <footer className="footer">Built by Jackie Miller</footer>
    </div>
  );
}
