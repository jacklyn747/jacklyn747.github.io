import { useId } from "react";
import Swatch from "../Swatch.jsx";
import { developerForLift, lower, pigmentForLevel } from "../lib.js";

export default function LevelLab({ data, lab, setLab, headingRef }) {
  const { start, target, colored } = lab;
  const lift = target - start;
  const exposed = lift > 0 ? pigmentForLevel(data, target) : null;
  const dev = developerForLift(data, lift);
  const set = (patch) => setLab({ ...lab, ...patch });

  const lifted = [];
  for (let l = start + 1; l <= target; l++) lifted.push(l);

  let detail;
  if (!exposed) detail = data.callouts.no_lift.text;
  else if (colored) detail = null;
  else if (dev) detail = `${lift} ${lift === 1 ? "level" : "levels"} of lift. Usually ${dev.volume} volume developer.`;
  else detail = `${lift} levels of lift. ${data.callouts.beyond_developer.text}`;

  return (
    <section aria-labelledby="lab-title">
      <div className="center">
        <p className="label">Level Lab</p>
        <h2 id="lab-title" className="title" ref={headingRef} tabIndex={-1}>
          Lift it
        </h2>
        <p className="body">
          Warm pigment hides under every head of hair. Lighten it and the warmth comes forward. Move
          the sliders.
        </p>
      </div>

      <div className="panel block--tight">
        <LevelSlider
          label="Starting level"
          value={start}
          data={data}
          onChange={(v) => set({ start: v })}
        />
        <LevelSlider label="Target level" value={target} data={data} onChange={(v) => set({ target: v })} />
        <label className="toggle">
          <span>Hair already colored</span>
          <input
            type="checkbox"
            role="switch"
            checked={colored}
            onChange={(e) => set({ colored: e.target.checked })}
          />
        </label>
      </div>

      <div className="result center block" aria-live="polite">
        {exposed ? (
          <>
            <Swatch hex={exposed.swatch_hex} label={`${exposed.name} warmth`} size="lg" />
            <p className="label">At level {target} you'll see</p>
            <p className="answer">{exposed.name}</p>
            {colored ? (
              <p className="body">
                <strong>{data.callouts.color_doesnt_lift_color.title}</strong>{" "}
                {data.callouts.color_doesnt_lift_color.text}
              </p>
            ) : (
              <p className="body">{detail}</p>
            )}
          </>
        ) : (
          <p className="body">{detail}</p>
        )}
      </div>

      {exposed && (
        <div className="block center">
          <p className="label">On the way up</p>
          <ol className="lift-row">
            {lifted.map((l) => {
              const p = pigmentForLevel(data, l);
              return (
                <li key={l} className={l === target ? "is-target" : undefined}>
                  <Swatch hex={p.swatch_hex} label={`${l} · ${p.name}`} size="sm" />
                </li>
              );
            })}
          </ol>

          <details className="disclosure">
            <summary>Developer guide</summary>
            <table className="dev-table">
              <caption className="sr-only">Developer volume and typical lift</caption>
              <tbody>
                {data.developers.map((d) => {
                  const match = !colored && dev && d.volume === dev.volume;
                  return (
                    <tr key={d.volume} className={match ? "is-match" : undefined}>
                      <th scope="row">
                        {d.volume} volume{match && <span className="sr-only"> (matches your lift)</span>}
                      </th>
                      <td>{d.lift_label}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </details>
        </div>
      )}
    </section>
  );
}

function LevelSlider({ label, value, data, onChange }) {
  const id = useId();
  const lvl = data.levelByNum[value];
  return (
    <div className="slider">
      <div className="slider__head">
        <label htmlFor={id} className="slider__label">
          {label}
        </label>
        <span className="slider__value" aria-hidden="true">
          {value} · {lvl.name}
        </span>
      </div>
      <div className="slider__body">
        <input
          id={id}
          type="range"
          min={1}
          max={10}
          step={1}
          value={value}
          aria-valuetext={`Level ${value}, ${lower(lvl.name)}`}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        <Swatch hex={lvl.hex} label={`Level ${value}: ${lvl.name}`} size="xs" hideCaption />
      </div>
    </div>
  );
}
