import type { CSSProperties } from "react";
import { cn } from "cn";

import type { Team } from "@/lib/api/types";
import { teamInitials } from "@/lib/format";

/**
 * Club crest, with a monogram fallback.
 *
 * `TeamResource` currently carries only { id, name, sport, league } — no crest
 * URL and no country code — so until the API adds `logo_url` this renders a
 * monogram. The colour is derived from the team name, so a club looks the same
 * on every screen and two clubs in a fixture are visually distinct.
 *
 * When the backend adds `logo_url`, this component starts using it with no
 * changes at the call sites.
 */

/** Stable hue from a team name. Same name always yields the same colour. */
function hueFor(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) % 360;
  }
  return hash;
}

const SIZES = {
  sm: { box: "size-6", text: "text-[10px]" },
  md: { box: "size-9", text: "text-xs" },
  lg: { box: "size-14", text: "text-sm" },
} as const;

export function TeamCrest({
  team,
  size = "sm",
  className,
}: {
  team: Team;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const { box, text } = SIZES[size];

  if (team.logo_url) {
    return (
      // Not next/image: crest URLs come from an external feed whose hostnames
      // aren't known ahead of time, and remotePatterns can't be configured for
      // an open-ended set.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={team.logo_url}
        alt=""
        aria-hidden
        loading="lazy"
        className={cn(box, "shrink-0 rounded-full object-contain", className)}
      />
    );
  }

  const hue = hueFor(team.name);

  return (
    <span
      aria-hidden
      className={cn(
        box,
        text,
        "crest grid shrink-0 place-items-center rounded-full font-semibold",
        className,
      )}
      // The tint itself lives in CSS so it can invert for the dark theme.
      style={{ "--crest-hue": hue } as CSSProperties}
    >
      {teamInitials(team.name)}
    </span>
  );
}
