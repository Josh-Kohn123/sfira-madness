/**
 * Client-safe omer day calculation using the browser's local clock.
 * The day advances at 19:30 local time (approximate tzeit hakochavim).
 */

const TRANSITION_HOUR = 19;
const TRANSITION_MINUTE = 30;

export type OmerPhase = "pre" | "during" | "post";

export function getLocalOmerPhase(): OmerPhase {
  const day = getLocalOmerDay();
  if (day !== null) return "during";
  const now = new Date();
  const eveningDate = halachicEvening(now);
  const firstEvening = new Date(2026, 3, 2);
  return eveningDate < firstEvening ? "pre" : "post";
}

function halachicEvening(now: Date): Date {
  const h = now.getHours();
  const m = now.getMinutes();
  const isPastTransition = h > TRANSITION_HOUR || (h === TRANSITION_HOUR && m >= TRANSITION_MINUTE);
  const eveningDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (!isPastTransition) {
    eveningDate.setDate(eveningDate.getDate() - 1);
  }
  return eveningDate;
}

export function getLocalOmerDay(): number | null {
  const now = new Date();
  const eveningDate = halachicEvening(now);
  const firstEvening = new Date(2026, 3, 2); // April 2, 2026 (month is 0-indexed)
  const diffMs = eveningDate.getTime() - firstEvening.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const day = diffDays + 1;
  if (day < 1 || day > 49) return null;
  return day;
}
