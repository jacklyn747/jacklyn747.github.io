import Swatch from "../Swatch.jsx";

export default function Hook({ data, headingRef, onStart }) {
  return (
    <section className="center" aria-labelledby="hook-title">
      <p className="label">A ten-minute lesson</p>
      <h1 id="hook-title" className="title" ref={headingRef} tabIndex={-1}>
        {data.hook.line.match(/[^.!?]+[.!?]*/g).map((sentence, i) => (
          <span key={i} style={{ display: "block" }}>
            {sentence.trim()}
          </span>
        ))}
      </h1>
      <p className="body">
        Lightening doesn't erase warmth. It uncovers it. By the end you'll name the warmth any lift
        exposes, and pick the toner that cancels it.
      </p>
      <div className="actions">
        <button type="button" className="btn" onClick={onStart}>
          Show me why
        </button>
      </div>
      <div className="block--tight">
        <Swatch hex={data.hook.swatch_hex} label={data.hook.swatch_label} size="hero" />
      </div>
    </section>
  );
}
