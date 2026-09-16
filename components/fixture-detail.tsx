"use client";

import Link from "next/link";
import { ArrowLeftIcon, WifiOffIcon } from "lucide-react";

import { PredictionPanel } from "@/components/prediction-panel";
import { ButtonLink } from "@/components/button-link";
import { Skeleton } from "@/components/ui/skeleton";
import { useFixture, useFixturePrediction } from "@/lib/api/hooks";
import { TeamCrest } from "@/components/team-crest";
import { kickoffDay, kickoffTime } from "@/lib/format";
import type { Team } from "@/lib/api/types";

function TeamBlock({ team, align }: { team: Team; align: "start" | "end" }) {
  return (
    <div
      className={
        align === "start"
          ? "flex flex-1 flex-col items-center gap-2.5 text-center"
          : "flex flex-1 flex-col items-center gap-2.5 text-center"
      }
    >
      <TeamCrest team={team} size="lg" />
      <div>
        <p className="text-[15px] leading-tight font-semibold">{team.name}</p>
        <p className="mt-0.5 text-[12px] text-muted-foreground">{team.league}</p>
      </div>
    </div>
  );
}

export function FixtureDetail({ fixtureId }: { fixtureId: number }) {
  const fixture = useFixture(fixtureId);
  // The list embeds a prediction, but the dedicated endpoint is the source of
  // truth for unlock state, so the detail view always asks for it directly.
  const prediction = useFixturePrediction(fixtureId);

  if (fixture.isPending) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-44 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (fixture.error) {
    return (
      <div className="rounded-lg border border-dashed border-border px-6 py-16 text-center">
        <WifiOffIcon className="mx-auto size-6 text-muted-foreground/60" />
        <p className="mt-3 text-sm font-medium">Couldn&rsquo;t load this fixture</p>
        <p className="mx-auto mt-1 max-w-sm text-[13px] text-muted-foreground">
          {fixture.error.message}
        </p>
        <ButtonLink variant="outline" size="sm" className="mt-4" href="/">
          Back to fixtures
        </ButtonLink>
      </div>
    );
  }

  const data = fixture.data!;
  const live = data.status === "Live";
  const finished = data.status === "Finished";

  return (
    <div className="space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeftIcon className="size-3.5" />
        Fixtures
      </Link>

      <div className="animate-rise rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          <span>{data.competition}</span>
          {finished && (
            <>
              <span className="text-muted-foreground/40">·</span>
              <span>Full time</span>
            </>
          )}
          {live && (
            <>
              <span className="text-muted-foreground/40">·</span>
              <span className="inline-flex items-center gap-1.5 text-live">
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-live opacity-70" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-live" />
                </span>
                Live
              </span>
            </>
          )}
        </div>

        <div className="mt-5 flex items-start gap-4">
          {data.home_team && <TeamBlock team={data.home_team} align="start" />}
          <div className="flex flex-col items-center pt-3.5">
            <span className="text-[15px] font-semibold tabular-nums">
              {kickoffTime(data.kickoff_at)}
            </span>
            <span className="mt-0.5 text-[12px] text-muted-foreground">
              {kickoffDay(data.kickoff_at)}
            </span>
          </div>
          {data.away_team && <TeamBlock team={data.away_team} align="end" />}
        </div>
      </div>

      {prediction.isPending ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : prediction.data ? (
        <PredictionPanel prediction={prediction.data} />
      ) : (
        <div className="rounded-xl border border-dashed border-border px-6 py-12 text-center">
          <p className="text-sm font-medium">No rating yet</p>
          <p className="mt-1 text-[13px] text-muted-foreground">
            This fixture hasn&rsquo;t been rated by the model.
          </p>
        </div>
      )}
    </div>
  );
}
