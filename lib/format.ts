import type { ConfidenceTier, FixtureStatus } from "./api/types";

const TIME = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const DAY = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
});

const WEEKDAY = new Intl.DateTimeFormat("en-GB", { weekday: "short" });

/** Kickoff clock time, e.g. "19:45". */
export function kickoffTime(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "--:--" : TIME.format(date);
}

/**
 * Short label for the date strip, where the day number is already shown
 * beneath it: "Today" / "Tomorrow" / "Fri". Avoids repeating the number.
 */
export function dayLabel(date: Date): string {
  const startOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round(
    (startOfDay(date) - startOfDay(new Date())) / 86_400_000,
  );

  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days === -1) return "Yesterday";
  return WEEKDAY.format(date);
}

/** "Today" / "Tomorrow" / "Sat 20 Sep" — relative where it helps, explicit otherwise. */
export function kickoffDay(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const startOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round(
    (startOfDay(date) - startOfDay(new Date())) / 86_400_000,
  );

  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days === -1) return "Yesterday";
  return DAY.format(date);
}

/** `YYYY-MM-DD` in local time, matching the API's `date` filter. */
export function toDateParam(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/** Tailwind classes per confidence tier, driven by the tokens in globals.css. */
export const tierStyles: Record<
  ConfidenceTier,
  { text: string; bg: string; dot: string; ring: string }
> = {
  High: {
    text: "text-tier-high",
    bg: "bg-tier-high-muted",
    dot: "bg-tier-high",
    ring: "stroke-tier-high",
  },
  Medium: {
    text: "text-tier-medium",
    bg: "bg-tier-medium-muted",
    dot: "bg-tier-medium",
    ring: "stroke-tier-medium",
  },
  Low: {
    text: "text-tier-low",
    bg: "bg-tier-low-muted",
    dot: "bg-tier-low",
    ring: "stroke-tier-low",
  },
};

export function statusLabel(status: FixtureStatus): string {
  return status === "Live" ? "Live" : status === "Finished" ? "FT" : "";
}

/**
 * Two-character crest placeholder: "Manchester City" -> "MC", "Everton" -> "EV".
 * Single-word names fall back to their first two letters, since a lone initial
 * reads as an accident next to the two-letter ones.
 */
export function teamInitials(name: string): string {
  const words = name.split(/\s+/).filter((word) => /[a-z0-9]/i.test(word));
  if (words.length === 0) return "";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return words
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
}
