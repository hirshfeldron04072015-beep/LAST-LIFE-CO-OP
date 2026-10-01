export const TAU = Math.PI * 2;

export const clamp = (v, min, max) =>
  Math.max(min, Math.min(max, v));

export const lerp = (a, b, t) =>
  a + (b - a) * t;

export const rand = (min, max) =>
  min + Math.random() * (max - min);

export const choice = arr =>
  arr[Math.floor(Math.random() * arr.length)];

export function id(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function weightedChoice(items) {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let r = Math.random() * total;

  for (const item of items) {
    r -= item.weight;
    if (r <= 0) return item.value;
  }

  return items[items.length - 1].value;
}

export function distance2D(a, b) {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

export function formatTime(seconds) {
  seconds = Math.max(0, Math.floor(seconds));

  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(
    seconds % 60
  ).padStart(2, "0")}`;
}
