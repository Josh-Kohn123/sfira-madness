/**
 * Omer day transitions at 19:30 local time (approximate tzeit hakochavim).
 * Day 1 begins the evening of April 2 (night after first seder, 16 Nisan).
 *
 * OMER_FIRST_EVENING is the calendar date of the evening when day 1 starts.
 * At 19:30 on this date, the omer count becomes day 1.
 */
export const OMER_FIRST_EVENING = new Date("2026-04-02");
export const OMER_END_DATE = new Date("2026-05-21");

/** Hour (24h) at which the omer day advances — 19:30 local time */
const TRANSITION_HOUR = 19;
const TRANSITION_MINUTE = 30;

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

/**
 * Returns the current "halachic date" — the calendar date of the evening
 * that started the current Jewish day. Before 19:30, we're still on the
 * previous evening's day. At/after 19:30, we advance to tonight's day.
 */
function getHalachicDate(now: Date): Date {
  const h = now.getHours();
  const m = now.getMinutes();
  const isPastTransition = h > TRANSITION_HOUR || (h === TRANSITION_HOUR && m >= TRANSITION_MINUTE);

  // Before 19:30 → the Jewish day started last evening (yesterday's calendar date)
  // At/after 19:30 → the Jewish day starts this evening (today's calendar date)
  const eveningDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (!isPastTransition) {
    eveningDate.setDate(eveningDate.getDate() - 1);
  }
  return eveningDate;
}

export function getCurrentOmerDay(): number | null {
  const dev = getDevOverride();
  if (dev !== null) {
    if (dev < 1 || dev > 49) return null;
    return dev;
  }
  const now = new Date();
  const eveningDate = getHalachicDate(now);
  const firstEvening = new Date(
    OMER_FIRST_EVENING.getFullYear(),
    OMER_FIRST_EVENING.getMonth(),
    OMER_FIRST_EVENING.getDate()
  );
  const diffMs = eveningDate.getTime() - firstEvening.getTime();
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
    const eveningDate = getHalachicDate(now);
    const firstEvening = new Date(
      OMER_FIRST_EVENING.getFullYear(),
      OMER_FIRST_EVENING.getMonth(),
      OMER_FIRST_EVENING.getDate()
    );
    return eveningDate < firstEvening ? "pre" : "post";
  }
  return "during";
}

export function daysUntilOmer(): number {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const firstEvening = new Date(
    OMER_FIRST_EVENING.getFullYear(),
    OMER_FIRST_EVENING.getMonth(),
    OMER_FIRST_EVENING.getDate()
  );
  const diffMs = firstEvening.getTime() - today.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}
