import { useState } from "react";
import Swatch from "../Swatch.jsx";
import { bestToner, lower, pigmentForLevel, tonerWorks } from "../lib.js";

const levelWord = (levels) => (levels.includes(" ") ? `levels ${levels}` : `level ${levels}`);

export default function ProveIt({ data, headingRef, onRestart }) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [scenarioId]: { pigment, toner, checked } }
  const total = data.scenarios.length;
  const finished = index >= total;

  const scored = data.scenarios.map((s) => {
    const a = answers[s.id];
    if (!a?.checked) return { pigment: false, toner: false };
    const p = pigmentForLevel(data, s.goal);
    return { pigment: a.pigment === p.id, toner: tonerWorks(p, a.toner) };
  });
  const score = scored.reduce((n, r) => n + (r.pigment ? 1 : 0) + (r.toner ? 1 : 0), 0);
  const max = total * 2;

  if (finished) {
    return (
      <section className="center" aria-labelledby="prove-title">
        <p className="label">Your score</p>
        <h2 id="prove-title" className="title" ref={headingRef} tabIndex={-1}>
          {score} of {max}
        </h2>
        <p className="body">
          {score === max
            ? "Clean sweep. You can call the warmth before you mix a thing."
            : score >= max - 2
              ? "Close. Revisit the Level Lab for the one that slipped."
              : "Worth another lap. Run the Level Lab again, then come back."}
        </p>
        <ul className="recap">
          {data.scenarios.map((s, i) => {
            const p = pigmentForLevel(data, s.goal);
            return (
              <li key={s.id}>
                <span className="strong">
                  Level {s.start} to {s.goal}
                </span>
                <br />
                <span className="small">
                  {p.name} {scored[i].pigment ? "✓" : "✗"} · {bestToner(data, p).name}{" "}
                  {scored[i].toner ? "✓" : "✗"}
                </span>
              </li>
            );
          })}
        </ul>
        <div className="actions">
          <button
            type="button"
            className="btn"
            onClick={() => {
              setAnswers({});
              setIndex(0);
            }}
          >
            Try again
          </button>
          <button type="button" className="btn btn--quiet" onClick={onRestart}>
            Start over
          </button>
        </div>
      </section>
    );
  }

  const s = data.scenarios[index];
  const a = answers[s.id] ?? {};
  const set = (patch) => setAnswers({ ...answers, [s.id]: { ...a, ...patch } });
  const correctP = pigmentForLevel(data, s.goal);
  const startLvl = data.levelByNum[s.start];
  const goalLvl = data.levelByNum[s.goal];
  const pigmentRight = a.pigment === correctP.id;
  const tonerRight = a.toner && tonerWorks(correctP, a.toner);

  const pigmentLine = () => {
    if (pigmentRight) return `Right. Level ${s.goal} exposes ${lower(correctP.name)}.`;
    const chosen = data.pigmentById[a.pigment];
    return `Not quite. ${chosen.name} shows up around ${levelWord(chosen.levels)}. At level ${s.goal} it's ${lower(correctP.name)}.`;
  };
  const tonerLine = () => {
    const t = data.tonerById[a.toner];
    if (tonerRight) return `Right. ${t.name} sits opposite ${lower(correctP.name)}.`;
    return `Not quite. ${t.wrong_effect} For ${lower(correctP.name)}, use ${lower(bestToner(data, correctP).name)}.`;
  };

  return (
    <section aria-labelledby="prove-title">
      <div className="center">
        <p className="label">
          Client {index + 1} of {total}
        </p>
        <h2 id="prove-title" className="title" ref={headingRef} tabIndex={-1}>
          Call it
        </h2>
        <p className="body">{s.client}</p>

        <div className="client-swatches">
          <Swatch hex={startLvl.hex} label={`Now · ${s.start} ${startLvl.name}`} size="md" />
          <Swatch hex={goalLvl.hex} label={`Goal · ${s.goal} ${goalLvl.name}`} size="md" />
        </div>
      </div>

      <div className="block--tight center">
        <Choices
          legend="Which warmth shows up?"
          name={`${s.id}-pigment`}
          items={data.pigments.map((p) => ({ id: p.id, name: p.name, hex: p.swatch_hex }))}
          value={a.pigment}
          disabled={a.checked}
          onChange={(v) => set({ pigment: v })}
        />
        <Choices
          legend="Which toner cancels it?"
          name={`${s.id}-toner`}
          items={data.toners.map((t) => ({ id: t.id, name: t.name, hex: t.hex }))}
          value={a.toner}
          disabled={a.checked}
          onChange={(v) => set({ toner: v })}
        />

        <div aria-live="polite">
          {a.checked && (
            <ul className="answers">
              <li>
                <span className="mark" aria-hidden="true">
                  {pigmentRight ? "✓" : "✗"}
                </span>
                <span>{pigmentLine()}</span>
              </li>
              <li>
                <span className="mark" aria-hidden="true">
                  {tonerRight ? "✓" : "✗"}
                </span>
                <span>{tonerLine()}</span>
              </li>
            </ul>
          )}
        </div>

        <div className="actions">
          {!a.checked ? (
            <button
              type="button"
              className="btn"
              disabled={!a.pigment || !a.toner}
              onClick={() => set({ checked: true })}
            >
              Check
            </button>
          ) : (
            <button type="button" className="btn" onClick={() => setIndex(index + 1)}>
              {index + 1 < total ? "Next client" : "See my score"}
            </button>
          )}
        </div>
        <p className="small score" aria-live="polite" style={{ marginTop: "var(--s2)" }}>
          {score} of {max} so far
        </p>
      </div>
    </section>
  );
}

function Choices({ legend, name, items, value, disabled, onChange }) {
  return (
    <fieldset className="choices question" disabled={disabled}>
      <legend className="label">{legend}</legend>
      <div className="choices__list">
        {items.map((it) => (
          <label key={it.id} className={`pill${value === it.id ? " is-on" : ""}`}>
            <input
              type="radio"
              name={name}
              value={it.id}
              checked={value === it.id}
              onChange={() => onChange(it.id)}
            />
            <span className="pill__dot" style={{ background: it.hex }} aria-hidden="true" />
            {it.name}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
