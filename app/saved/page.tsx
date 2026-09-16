"use client";

import Link from "next/link";
import { BookmarkIcon, LockIcon } from "lucide-react";

import { ConfidenceChip } from "@/components/confidence";
import { ButtonLink } from "@/components/button-link";
import { Skeleton } from "@/components/ui/skeleton";
import { useMe, useSavedPredictions } from "@/lib/api/hooks";
import { isUnlocked } from "@/lib/api/types";
import { kickoffDay, kickoffTime } from "@/lib/format";

export default function SavedPage() {
  const { data: user, isPending: userPending } = useMe();
  const { data, isPending, error } = useSavedPredictions();

  if (!userPending && !user) {
    return (
      <div className="rounded-lg border border-dashed border-border px-6 py-16 text-center">
        <BookmarkIcon className="mx-auto size-6 text-muted-foreground/60" />
        <p className="mt-3 text-sm font-medium">Sign in to see your saved picks</p>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Saved predictions sync across your devices.
        </p>
        <ButtonLink size="sm" className="mt-4" href="/login">
          Sign in
        </ButtonLink>
      </div>
    );
  }

  const items = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Saved</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Predictions you&rsquo;ve bookmarked.
        </p>
      </div>

      {isPending || userPending ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-lg border border-dashed border-border px-6 py-16 text-center">
          <p className="text-sm font-medium">Couldn&rsquo;t load saved predictions</p>
          <p className="mt-1 text-[13px] text-muted-foreground">{error.message}</p>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border px-6 py-16 text-center">
          <BookmarkIcon className="mx-auto size-6 text-muted-foreground/60" />
          <p className="mt-3 text-sm font-medium">Nothing saved yet</p>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Tap Save on any prediction to keep it here.
          </p>
          <ButtonLink variant="outline" size="sm" className="mt-4" href="/">
            Browse fixtures
          </ButtonLink>
        </div>
      ) : (
        <div className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/fixtures/${item.fixture.id}`}
              className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/50"
            >
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {item.fixture.competition}
                </p>
                <p className="mt-1 truncate text-[15px] font-medium">
                  {item.fixture.home_team?.name} v {item.fixture.away_team?.name}
                </p>
                <p className="mt-0.5 text-[12px] tabular-nums text-muted-foreground">
                  {kickoffDay(item.fixture.kickoff_at)} ·{" "}
                  {kickoffTime(item.fixture.kickoff_at)}
                </p>
              </div>
              {isUnlocked(item.prediction) ? (
                <ConfidenceChip
                  tier={item.prediction.confidence_tier}
                  score={item.prediction.confidence_score}
                />
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                  <LockIcon className="size-3" />
                  Locked
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
