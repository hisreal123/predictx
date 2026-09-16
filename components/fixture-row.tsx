import Link from "next/link";
import { ChevronRightIcon, LockIcon } from "lucide-react";
import { cn } from "cn";

import { ConfidenceChip } from "@/components/confidence";
import { isUnlocked, type FixtureListItem, type Team } from "@/lib/api/types";
import { TeamCrest } from "@/components/team-crest";
import { kickoffTime } from "@/lib/format";

function TeamLine({ team }: { team: Team }) {
  return (
    <div className="flex items-center gap-2.5">
      <TeamCrest team={team} size="sm" />
      <span className="truncate text-[15px] leading-tight font-medium">
        {team.name}
      </span>
    </div>
  );
}

export function FixtureRow({ fixture }: { fixture: FixtureListItem }) {
  const { prediction, status } = fixture;
  const live = status === "Live";
  const locked = prediction ? !isUnlocked(prediction) : false;

  return (
    <Link
      href={`/fixtures/${fixture.id}`}
      className={cn(
        "group flex items-center gap-3 px-3 py-3.5 transition-colors sm:gap-4 sm:px-5",
        "hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none",
      )}
    >
      <div className="w-10 shrink-0 text-center sm:w-11">
        {live ? (
          <span className="inline-flex flex-col items-center gap-1">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-live opacity-70" />
              <span className="relative inline-flex size-1.5 rounded-full bg-live" />
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-live">
              Live
            </span>
          </span>
        ) : status === "Finished" ? (
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            FT
          </span>
        ) : (
          <span className="text-[13px] font-medium tabular-nums text-muted-foreground">
            {kickoffTime(fixture.kickoff_at)}
          </span>
        )}
      </div>

      <div className="h-9 w-px shrink-0 bg-border" />

      <div className="min-w-0 flex-1 space-y-1.5">
        <TeamLine team={fixture.home_team} />
        <TeamLine team={fixture.away_team} />
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {prediction ? (
          locked ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              <LockIcon className="size-3" />
              Locked
            </span>
          ) : (
            <ConfidenceChip
              tier={prediction.confidence_tier}
              score={prediction.confidence_score}
            />
          )
        ) : (
          <span className="text-[11px] text-muted-foreground">No rating</span>
        )}
        <ChevronRightIcon
          aria-hidden
          className="hidden size-4 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-muted-foreground sm:block"
        />
      </div>
    </Link>
  );
}
