export const OMER_START_DATE = new Date("2026-04-03");
export const OMER_END_DATE = new Date("2026-05-21");

/**
 * In dev, set DEV_OMER_DAY in .env.local to simulate a specific Omer day (1-49).
 * Set to 0 for pre-omer, or 50 for post-omer.
 */
function getDevOverride(): number | null {
  const raw = process.env.DEV_OMER_DAY;
  if (!raw) return null;
  const n = parseInt(raw, 10);
  return isNaN(n) ? null : n;
}

export function getCurrentOmerDay(): number | null {
  const dev = getDevOverride();
  if (dev !== null) {
    if (dev < 1 || dev > 49) return null;
    return dev;
  }
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const start = new Date(
    OMER_START_DATE.getFullYear(),
    OMER_START_DATE.getMonth(),
    OMER_START_DATE.getDate()
  );
  const diffMs = today.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const day = diffDays + 1;
  if (day < 1 || day > 49) return null;
  return day;
}

export type OmerPhase = "pre" | "during" | "post";

export function getOmerPhase(): OmerPhase {
  const dev = getDevOverride();
  if (dev !== null) {
    if (dev === 0) return "pre";
    if (dev >= 50) return "post";
    return "during";
  }
  const day = getCurrentOmerDay();
  if (day === null) {
    const now = new Date();
    const start = new Date(
      OMER_START_DATE.getFullYear(),
      OMER_START_DATE.getMonth(),
      OMER_START_DATE.getDate()
    );
    return now < start ? "pre" : "post";
  }
  return "during";
}

export function daysUntilOmer(): number {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const start = new Date(
    OMER_START_DATE.getFullYear(),
    OMER_START_DATE.getMonth(),
    OMER_START_DATE.getDate()
  );
  const diffMs = start.getTime() - today.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}
