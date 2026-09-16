"use client";

import { useMemo, useState } from "react";
import { CalendarX2Icon, RotateCwIcon, WifiOffIcon } from "lucide-react";
import { cn } from "cn";

import { FixtureRow } from "@/components/fixture-row";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useFixtures } from "@/lib/api/hooks";
import { addDays, dayLabel, kickoffDay, toDateParam } from "@/lib/format";
import type { FixtureListItem } from "@/lib/api/types";

function useDateStrip() {
  return useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => addDays(today, i - 1));
  }, []);
}

function groupByCompetition(fixtures: FixtureListItem[]) {
  const groups = new Map<string, FixtureListItem[]>();
  for (const fixture of fixtures) {
    const list = groups.get(fixture.competition) ?? [];
    list.push(fixture);
    groups.set(fixture.competition, list);
  }
  for (const list of groups.values()) {
    list.sort(
      (a, b) =>
        new Date(a.kickoff_at).getTime() - new Date(b.kickoff_at).getTime(),
    );
  }

  const earliest = (list: FixtureListItem[]) =>
    Math.min(...list.map((f) => new Date(f.kickoff_at).getTime()));

  return [...groups.entries()].sort(
    ([, a], [, b]) => earliest(a) - earliest(b),
  );
}

function BoardSkeleton() {
  return (
    <div className="divide-y divide-border rounded-lg border border-border bg-card">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3.5 sm:px-5">
          <Skeleton className="h-4 w-11" />
          <div className="h-9 w-px bg-border" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ date }: { date: Date }) {
  return (
    <div className="rounded-lg border border-dashed border-border px-6 py-16 text-center">
      <CalendarX2Icon className="mx-auto size-6 text-muted-foreground/60" />
      <p className="mt-3 text-sm font-medium">No fixtures on {kickoffDay(date.toISOString()).toLowerCase()}</p>
      <p className="mt-1 text-[13px] text-muted-foreground">
        Try another date — new fixtures are rated as soon as they&rsquo;re scheduled.
      </p>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-lg border border-dashed border-border px-6 py-16 text-center">
      <WifiOffIcon className="mx-auto size-6 text-muted-foreground/60" />
      <p className="mt-3 text-sm font-medium">Couldn&rsquo;t load fixtures</p>
      <p className="mx-auto mt-1 max-w-sm text-[13px] text-muted-foreground">{message}</p>
      <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
        <RotateCwIcon /> Try again
      </Button>
    </div>
  );
}

export function FixturesBoard() {
  const dates = useDateStrip();
  const [selected, setSelected] = useState(() => new Date());
  const filters = useMemo(() => ({ date: toDateParam(selected) }), [selected]);
  const { data, isPending, error, refetch, isFetching } = useFixtures(filters);

  const groups = useMemo(
    () => groupByCompetition(data?.data ?? []),
    [data],
  );

  return (
    <div className="space-y-5">
      {/* Date strip */}
      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="flex min-w-max gap-1.5">
          {dates.map((date) => {
            const param = toDateParam(date);
            const active = param === toDateParam(selected);
            return (
              <button
                key={param}
                type="button"
                onClick={() => setSelected(date)}
                className={cn(
                  "flex min-w-[68px] flex-col items-center rounded-lg border px-3 py-2 transition-colors",
                  "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                  active
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-card hover:bg-muted/60",
                )}
                aria-pressed={active}
              >
                <span className="text-[11px] font-medium uppercase tracking-wider opacity-70">
                  {dayLabel(date)}
                </span>
                <span className="text-[15px] font-semibold tabular-nums">
                  {date.getDate()}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {isPending ? (
        <BoardSkeleton />
      ) : error ? (
        <ErrorState message={error.message} onRetry={() => refetch()} />
      ) : groups.length === 0 ? (
        <EmptyState date={selected} />
      ) : (
        <div
          className={cn(
            "stagger space-y-6 transition-opacity",
            isFetching && "opacity-60",
          )}
        >
          {groups.map(([competition, fixtures]) => (
            <section key={competition}>
              <div className="mb-2 flex items-baseline justify-between px-1">
                <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {competition}
                </h2>
                <span className="text-[11px] tabular-nums text-muted-foreground/70">
                  {fixtures.length}
                </span>
              </div>
              <div className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
                {fixtures.map((fixture) => (
                  <FixtureRow key={fixture.id} fixture={fixture} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
