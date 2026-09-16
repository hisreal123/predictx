"use client";

import { useEffect, useRef, useState } from "react";
import { CheckIcon, Loader2Icon, PlayIcon, SparklesIcon } from "lucide-react";
import { toast } from "sonner";

import { ButtonLink } from "@/components/button-link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  useCompleteAdEvent,
  useMe,
  useStartAdEvent,
  useUnlockPrediction,
} from "@/lib/api/hooks";

/** Simulated rewarded-ad duration until a real ad SDK is wired in. */
const AD_SECONDS = 5;

type Phase = "choose" | "watching" | "done";

export function UnlockDialog({
  predictionId,
  open,
  onOpenChange,
}: {
  predictionId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: user } = useMe();
  const [phase, setPhase] = useState<Phase>("choose");
  const [elapsed, setElapsed] = useState(0);
  const adEventId = useRef<number | null>(null);

  const startAd = useStartAdEvent();
  const completeAd = useCompleteAdEvent();
  const unlock = useUnlockPrediction(predictionId);

  // Reset on close in the event handler rather than in an effect, so
  // reopening starts clean without triggering a cascading render.
  function handleOpenChange(next: boolean) {
    if (!next) {
      setPhase("choose");
      setElapsed(0);
      adEventId.current = null;
    }
    onOpenChange(next);
  }

  // Drive the ad countdown.
  useEffect(() => {
    if (phase !== "watching") return;
    const timer = setInterval(() => {
      setElapsed((value) => Math.min(value + 1, AD_SECONDS));
    }, 1000);
    return () => clearInterval(timer);
  }, [phase]);

  // When the countdown finishes, settle the unlock with the API.
  useEffect(() => {
    if (phase !== "watching" || elapsed < AD_SECONDS) return;

    let cancelled = false;
    (async () => {
      try {
        if (adEventId.current !== null) {
          await completeAd.mutateAsync(adEventId.current);
        }
        await unlock.mutateAsync({ method: "Ad" });
        if (cancelled) return;
        setPhase("done");
        toast.success("Prediction unlocked");
        setTimeout(() => handleOpenChange(false), 900);
      } catch (error) {
        if (cancelled) return;
        setPhase("choose");
        setElapsed(0);
        toast.error(
          error instanceof Error ? error.message : "Could not unlock this prediction",
        );
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, elapsed]);

  async function handleWatchAd() {
    try {
      const event = await startAd.mutateAsync({ prediction_id: predictionId });
      adEventId.current = event.id;
      setElapsed(0);
      setPhase("watching");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not start the ad",
      );
    }
  }

  async function handlePremiumUnlock() {
    try {
      await unlock.mutateAsync({ method: "Subscription" });
      setPhase("done");
      toast.success("Prediction unlocked");
      setTimeout(() => handleOpenChange(false), 900);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not unlock this prediction",
      );
    }
  }

  const starting = startAd.isPending;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        {phase === "watching" ? (
          <>
            <DialogHeader>
              <DialogTitle>Playing your ad</DialogTitle>
              <DialogDescription>
                Keep this open — the prediction unlocks when the ad finishes.
              </DialogDescription>
            </DialogHeader>
            <div className="grid h-36 place-items-center rounded-lg bg-muted">
              <div className="text-center">
                <PlayIcon className="mx-auto size-7 text-muted-foreground/70" />
                <p className="mt-2 text-[13px] text-muted-foreground">
                  Ad placeholder
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Progress value={(elapsed / AD_SECONDS) * 100} />
              <p className="text-center text-[13px] tabular-nums text-muted-foreground">
                {AD_SECONDS - elapsed}s remaining
              </p>
            </div>
          </>
        ) : phase === "done" ? (
          <div className="py-8 text-center">
            <span className="mx-auto grid size-11 animate-pop place-items-center rounded-full bg-tier-high-muted">
              <CheckIcon className="size-5 text-tier-high" />
            </span>
            <p className="mt-3 text-sm font-medium">Unlocked</p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Unlock this prediction</DialogTitle>
              <DialogDescription>
                See the full rationale, the model inputs and the confidence
                breakdown.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleWatchAd}
                disabled={starting}
                className="flex w-full items-center gap-3 rounded-lg border border-border p-3.5 text-left transition-colors hover:bg-muted/60 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-muted">
                  {starting ? (
                    <Loader2Icon className="size-4 animate-spin-fast" />
                  ) : (
                    <PlayIcon className="size-4" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">
                    {starting ? "Starting ad…" : "Watch a short ad"}
                  </span>
                  <span className="block text-[13px] text-muted-foreground">
                    Unlocks this one prediction · free
                  </span>
                </span>
              </button>

              {user?.subscribed ? (
                <button
                  type="button"
                  onClick={handlePremiumUnlock}
                  disabled={unlock.isPending}
                  className="flex w-full items-center gap-3 rounded-lg border border-foreground bg-foreground p-3.5 text-left text-background transition-opacity hover:opacity-90 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-background/15">
                    <SparklesIcon className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">
                      {unlock.isPending ? "Unlocking…" : "Unlock with Premium"}
                    </span>
                    <span className="block text-[13px] opacity-75">
                      Included in your plan
                    </span>
                  </span>
                </button>
              ) : (
                <ButtonLink className="w-full" href="/premium">
                  <SparklesIcon /> Go Premium — unlock everything
                </ButtonLink>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
