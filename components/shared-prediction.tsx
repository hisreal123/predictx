"use client";

import { LinkIcon } from "lucide-react";

import { ConfidenceGauge } from "@/components/confidence";
import { ButtonLink } from "@/components/button-link";
import { Skeleton } from "@/components/ui/skeleton";
import { useSharedPrediction } from "@/lib/api/hooks";

export function SharedPrediction({ token }: { token: string }) {
  const { data, isPending, error } = useSharedPrediction(token);

  if (isPending) {
    return <Skeleton className="mx-auto h-64 w-full max-w-lg rounded-xl" />;
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-lg rounded-lg border border-dashed border-border px-6 py-16 text-center">
        <LinkIcon className="mx-auto size-6 text-muted-foreground/60" />
        <p className="mt-3 text-sm font-medium">This link isn&rsquo;t available</p>
        <p className="mt-1 text-[13px] text-muted-foreground">
          {error?.message ?? "The share link may have expired."}
        </p>
        <ButtonLink size="sm" className="mt-4" href="/">
          Browse fixtures
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <p className="text-center text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        Shared prediction
      </p>
      <div className="mt-4 rounded-xl border border-border bg-card p-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <ConfidenceGauge
            tier={data.confidence_tier}
            score={data.confidence_score}
            size={104}
          />
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Model pick
            </p>
            <p className="mt-1.5 text-2xl leading-tight font-semibold tracking-tight text-balance">
              {data.market}
            </p>
          </div>
        </div>
        {data.rationale_text && (
          <p className="mt-5 border-t border-border pt-5 text-[15px] leading-relaxed text-foreground/90">
            {data.rationale_text}
          </p>
        )}
      </div>
      <div className="mt-5 text-center">
        <ButtonLink variant="outline" size="sm" href="/">
          See all fixtures on PredictX
        </ButtonLink>
      </div>
    </div>
  );
}
