// A "photo-style" hair swatch: a flat color with layered strand texture,
// sheen and shadow. Every swatch carries a visible text label of its tone.
export default function Swatch({ hex, label, size = "md", hideCaption = false }) {
  return (
    <figure className={`swatch swatch--${size}`}>
      <div
        className="swatch__hair"
        role="img"
        aria-label={`Hair swatch: ${label}`}
        style={{ "--hair": hex }}
      />
      {!hideCaption && <figcaption className="swatch__label">{label}</figcaption>}
    </figure>
  );
}
