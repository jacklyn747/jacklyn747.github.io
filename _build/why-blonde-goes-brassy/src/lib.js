// Small helpers that turn lesson.json into answers. No color facts live here.

export function indexData(data) {
  const pigmentById = Object.fromEntries(data.pigments.map((p) => [p.id, p]));
  const tonerById = Object.fromEntries(data.toners.map((t) => [t.id, t]));
  const levelByNum = Object.fromEntries(data.levels.map((l) => [l.level, l]));
  return { ...data, pigmentById, tonerById, levelByNum };
}

export function pigmentForLevel(d, level) {
  return d.pigmentById[d.levelByNum[level].pigment];
}

export function developerForLift(d, lift) {
  if (lift < 1) return null;
  return d.developers.find((dev) => lift <= dev.max_lift) ?? null;
}

export function tonerWorks(pigment, tonerId) {
  return pigment.neutralized_by.includes(tonerId);
}

export function bestToner(d, pigment) {
  return d.tonerById[pigment.neutralized_by[0]];
}

export const lower = (s) => s.toLowerCase();
