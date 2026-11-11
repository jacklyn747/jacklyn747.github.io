import { useId, useRef, useState } from "react";
import Swatch from "../Swatch.jsx";
import ColorWheel from "../ColorWheel.jsx";
import { lower, tonerWorks } from "../lib.js";

export default function FixIt({ data, headingRef, initialPigmentId }) {
  const selectId = useId();
  const [pigmentId, setPigmentId] = useState(initialPigmentId);
  const [selected, setSelected] = useState(null); // toner chosen by tap/keyboard
  const [result, setResult] = useState(null); // { tonerId, correct }
  const [drag, setDrag] = useState(null); // { tonerId, x, y, over }
  const dropRef = useRef(null);
  const dragStart = useRef(null);
  const suppressClick = useRef(false);

  const pigment = data.pigmentById[pigmentId];
  const solved = result?.correct;

  function apply(tonerId) {
    setResult({ tonerId, correct: tonerWorks(pigment, tonerId) });
    setSelected(null);
  }

  function choosePigment(id) {
    setPigmentId(id);
    setResult(null);
    setSelected(null);
  }

  function overDrop(x, y) {
    const r = dropRef.current?.getBoundingClientRect();
    if (!r) return false;
    // The whole wheel counts as the target, so a near miss still lands.
    return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
  }

  // Pointer drag works for mouse, pen and touch.
  const onPointerDown = (e, tonerId) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    dragStart.current = { x: e.clientX, y: e.clientY, tonerId };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e) => {
    const s = dragStart.current;
    if (!s) return;
    const moved = Math.hypot(e.clientX - s.x, e.clientY - s.y) > 8;
    if (!drag && !moved) return;
    setDrag({ tonerId: s.tonerId, x: e.clientX, y: e.clientY, over: overDrop(e.clientX, e.clientY) });
  };
  const onPointerUp = (e) => {
    const s = dragStart.current;
    dragStart.current = null;
    if (drag && s) {
      suppressClick.current = true;
      if (overDrop(e.clientX, e.clientY)) apply(s.tonerId);
    }
    setDrag(null);
  };
  const onPointerCancel = () => {
    dragStart.current = null;
    setDrag(null);
  };
  const onChipClick = (tonerId) => {
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    setSelected(selected === tonerId ? null : tonerId);
  };

  const shownToner = result ? data.tonerById[result.tonerId] : null;
  const hintToner = selected ? data.tonerById[selected] : null;
  const dragToner = drag ? data.tonerById[drag.tonerId] : null;

  let hint = "Drag a toner onto the hair, or tap one and then tap the hair.";
  if (dragToner) hint = drag.over ? `Let go to apply ${lower(dragToner.name)}.` : "Drop it on the hair.";
  else if (hintToner) hint = `Now tap the hair to apply ${lower(hintToner.name)}.`;
  else if (result) hint = " ";

  return (
    <section aria-labelledby="fix-title">
      <div className="center">
        <p className="label">Fix it</p>
        <h2 id="fix-title" className="title" ref={headingRef} tabIndex={-1}>
          Cancel it
        </h2>
        <p className="body">Colors opposite each other on the wheel cancel out.</p>

        <div className="select block--tight">
          <label htmlFor={selectId} className="label" style={{ display: "block" }}>
            Warmth to fix
          </label>
          <select id={selectId} value={pigmentId} onChange={(e) => choosePigment(e.target.value)}>
            {data.pigments.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={`wheel-wrap${drag?.over ? " is-over" : ""}`} ref={dropRef}>
        <ColorWheel
          wheel={data.wheel}
          exposedId={pigment.wheel_id}
          tonerId={shownToner?.id ?? selected ?? drag?.tonerId ?? null}
        />
        <button
          type="button"
          className="wheel-target"
          onClick={() => hintToner && apply(hintToner.id)}
          aria-disabled={!hintToner}
          aria-label={
            hintToner
              ? `Apply ${lower(hintToner.name)} toner to ${lower(pigment.name)} hair`
              : `Hair showing ${lower(pigment.name)}. Pick a toner first.`
          }
        >
          <Swatch
            hex={solved ? pigment.neutral_hex : pigment.swatch_hex}
            label={solved ? pigment.neutral_label : `${pigment.name} warmth`}
            size="round"
            hideCaption
          />
        </button>
      </div>

      <div className="center">
        <p className="wheel-status strong">
          {solved ? pigment.neutral_label : `${pigment.name} warmth`}
        </p>
        <p className="drop-hint small" aria-live="polite">
          {hint}
        </p>

        <div className="toner-tray" role="group" aria-label="Toners">
          {data.toners.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`pill toner${selected === t.id ? " is-on" : ""}${drag?.tonerId === t.id ? " is-dragging" : ""}`}
              aria-pressed={selected === t.id}
              onPointerDown={(e) => onPointerDown(e, t.id)}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerCancel}
              onClick={() => onChipClick(t.id)}
            >
              <span className="pill__dot" style={{ background: t.hex }} aria-hidden="true" />
              {t.name}
            </button>
          ))}
        </div>

        <div aria-live="polite">
          {result && (
            <div className="feedback">
              <p className="strong">
                {result.correct ? "Neutral. That's the one." : `Not ${lower(shownToner.name)}. Here's why.`}
              </p>
              <p className="body">
                {result.correct
                  ? `${shownToner.name} sits opposite ${lower(pigment.name)}, so it cancels it.`
                  : `${shownToner.wrong_effect} Look straight across from ${lower(pigment.name)}.`}
                {result.correct &&
                  pigment.neutralized_by.length > 1 &&
                  ` ${pigment.name} sits between two slices, so ${pigment.neutralized_by
                    .map((id) => lower(data.tonerById[id].name))
                    .join(" or ")} both work.`}
              </p>
              <div className="actions">
                {result.correct ? (
                  <p className="small">Pick another warmth above and try again.</p>
                ) : (
                  <button type="button" className="btn btn--quiet" onClick={() => setResult(null)}>
                    Try again
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {dragToner && (
        <div className="pill drag-ghost" style={{ left: drag.x, top: drag.y }} aria-hidden="true">
          <span className="pill__dot" style={{ background: dragToner.hex }} />
          {dragToner.name}
        </div>
      )}
    </section>
  );
}
