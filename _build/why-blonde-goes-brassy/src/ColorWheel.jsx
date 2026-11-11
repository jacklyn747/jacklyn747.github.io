// 12-slice color wheel drawn in SVG. Yellow sits at the top; opposites are
// six slices apart. The exposed tone gets a solid ink outline, the toner in
// play gets a dashed one, and a line joins them.
const R_OUT = 128;
const R_IN = 70;
const R_LABEL = 160;

function polar(r, deg) {
  const a = ((deg - 90) * Math.PI) / 180;
  return [r * Math.cos(a), r * Math.sin(a)];
}

function wedge(i, n) {
  const step = 360 / n;
  const a0 = i * step - step / 2;
  const a1 = a0 + step;
  const [x0, y0] = polar(R_OUT, a0);
  const [x1, y1] = polar(R_OUT, a1);
  const [x2, y2] = polar(R_IN, a1);
  const [x3, y3] = polar(R_IN, a0);
  return `M${x0},${y0} A${R_OUT},${R_OUT} 0 0 1 ${x1},${y1} L${x2},${y2} A${R_IN},${R_IN} 0 0 0 ${x3},${y3} Z`;
}

export default function ColorWheel({ wheel, exposedId, tonerId }) {
  const n = wheel.length;
  const step = 360 / n;
  const ei = wheel.findIndex((w) => w.id === exposedId);
  const ti = tonerId ? wheel.findIndex((w) => w.id === tonerId) : -1;
  const mid = (i, r) => polar(r, i * step);

  const exposedName = wheel[ei]?.name;
  const tonerName = ti >= 0 ? wheel[ti].name : null;

  return (
    <svg
      className="wheel"
      viewBox="-200 -200 400 400"
      role="img"
      aria-label={`Color wheel. ${exposedName} is the exposed tone${tonerName ? `. ${tonerName} toner is in play` : ""}. Opposite colors cancel.`}
    >
      {wheel.map((w, i) => (
        <path key={w.id} d={wedge(i, n)} fill={w.hex} stroke="#0A0A0A" strokeWidth="2">
          <title>{w.name}</title>
        </path>
      ))}

      {ti >= 0 && ei >= 0 && (
        <line
          x1={mid(ei, R_OUT)[0]}
          y1={mid(ei, R_OUT)[1]}
          x2={mid(ti, R_OUT)[0]}
          y2={mid(ti, R_OUT)[1]}
          stroke="#F2EEE6"
          strokeWidth="2"
          strokeDasharray="4 5"
        />
      )}

      {ei >= 0 && <path d={wedge(ei, n)} fill="none" stroke="#F2EEE6" strokeWidth="3" />}
      {ti >= 0 && ti !== ei && (
        <path d={wedge(ti, n)} fill="none" stroke="#F2EEE6" strokeWidth="2.5" strokeDasharray="6 4" />
      )}

      {wheel.map((w, i) => {
        const [x, y] = mid(i, R_LABEL);
        const parts = w.name.split("-");
        const bold = i === ei || i === ti;
        return (
          <text
            key={w.id}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            className={`wheel__label${bold ? " is-bold" : ""}`}
            aria-hidden="true"
          >
            {parts.length === 1 ? (
              w.name
            ) : (
              <>
                <tspan x={x} dy="-0.55em">
                  {parts[0]}-
                </tspan>
                <tspan x={x} dy="1.1em">
                  {parts[1]}
                </tspan>
              </>
            )}
          </text>
        );
      })}
    </svg>
  );
}
