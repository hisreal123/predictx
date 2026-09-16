"use client";

import { CheckIcon, XIcon } from "lucide-react";
import { cn } from "cn";

import { assessPassword, PASSWORD_RULES } from "@/lib/password";

const BAR_TONE = [
  "bg-muted",
  "bg-tier-low",
  "bg-tier-low",
  "bg-tier-medium",
  "bg-tier-medium",
  "bg-tier-high",
] as const;

const LABEL_TONE: Record<string, string> = {
  "Too short": "text-muted-foreground",
  Weak: "text-tier-low",
  Fair: "text-tier-medium",
  Good: "text-tier-medium",
  Strong: "text-tier-high",
};

export function PasswordStrength({ value }: { value: string }) {
  const { score, label, passed } = assessPassword(value);

  return (
    <div className="mt-2.5 animate-rise">
      <div className="flex items-center gap-2">
        <div
          className="flex flex-1 gap-1"
          role="meter"
          aria-valuenow={score}
          aria-valuemin={0}
          aria-valuemax={PASSWORD_RULES.length}
          aria-label={`Password strength: ${label}`}
        >
          {PASSWORD_RULES.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors duration-300",
                i < score ? BAR_TONE[score] : "bg-muted",
              )}
            />
          ))}
        </div>
        <span
          className={cn(
            "text-[11px] font-medium tabular-nums transition-colors",
            LABEL_TONE[label],
          )}
        >
          {label}
        </span>
      </div>

      <ul className="mt-2.5 grid gap-1">
        {PASSWORD_RULES.map((rule) => {
          const ok = passed.includes(rule.id);
          return (
            <li
              key={rule.id}
              className={cn(
                "flex items-center gap-1.5 text-[12px] transition-colors",
                ok ? "text-tier-high" : "text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "grid size-3.5 shrink-0 place-items-center rounded-full transition-all duration-300",
                  ok ? "bg-tier-high-muted animate-pop" : "bg-muted",
                )}
              >
                {ok ? (
                  <CheckIcon className="size-2.5" />
                ) : (
                  <XIcon className="size-2.5 opacity-40" />
                )}
              </span>
              {rule.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
