import { cn } from "cn";

import { tierStyles } from "@/lib/format";
import type { ConfidenceTier } from "@/lib/api/types";

export function ConfidenceChip({
  tier,
  score,
  className,
}: {
  tier: ConfidenceTier;
  score?: number;
  className?: string;
}) {
  const style = tierStyles[tier];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5",
        "text-[11px] font-medium tracking-wide",
        style.bg,
        style.text,
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", style.dot)} />
      {/* The dot already encodes the tier, so the word is the first thing
          to go when horizontal space is tight. */}
      <span className="hidden xs:inline">{tier}</span>
      {score !== undefined && (
        <span className="tabular-nums opacity-70">{score}</span>
      )}
    </span>
  );
}

/**
 * Circular score gauge for the detail view. Drawn as an SVG arc so the value
 * stays legible at small sizes and scales crisply.
 */
export function ConfidenceGauge({
  tier,
  score,
  size = 88,
}: {
  tier: ConfidenceTier;
  score: number;
  size?: number;
}) {
  const style = tierStyles[tier];
  const stroke = 7;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score));
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Confidence ${score} out of 100, rated ${tier}`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn(style.ring, "transition-[stroke-dashoffset] duration-700")}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("text-xl font-semibold tabular-nums", style.text)}>
          {score}
        </span>
        <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
          {tier}
        </span>
      </div>
    </div>
  );
}
