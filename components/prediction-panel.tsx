"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookmarkIcon,
  LockIcon,
  Share2Icon,
} from "lucide-react";
import { toast } from "sonner";

import { ConfidenceGauge } from "@/components/confidence";
import { UnlockDialog } from "@/components/unlock-dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  useMe,
  useSavedPredictions,
  useSharePrediction,
  useToggleSaved,
} from "@/lib/api/hooks";
import { isUnlocked, type Prediction } from "@/lib/api/types";

export function PredictionPanel({ prediction }: { prediction: Prediction }) {
  const router = useRouter();
  const [unlockOpen, setUnlockOpen] = useState(false);
  const { data: user } = useMe();
  const toggleSaved = useToggleSaved();
  const share = useSharePrediction();
  const unlocked = isUnlocked(prediction);

  // Whether this prediction is saved has to be derived from the saved list —
  // PredictionResource carries no `saved` flag. Starting from `false` would
  // show "Save" on an already-saved prediction and POST a duplicate.
  // NOTE: the endpoint is paginated, so a prediction saved beyond the first
  // page reads as unsaved until the API exposes a flag or a lookup.
  const { data: savedList } = useSavedPredictions(Boolean(user));
  const serverSaved =
    savedList?.data.some((item) => item.prediction.id === prediction.id) ??
    false;

  const [pendingSaved, setPendingSaved] = useState<boolean | null>(null);
  const saved = pendingSaved ?? serverSaved;

  function requireAuth(action: string): boolean {
    if (user) return true;
    toast.error(`Sign in to ${action}`, {
      action: { label: "Sign in", onClick: () => router.push("/login") },
    });
    return false;
  }

  function handleSave() {
    if (!requireAuth("save predictions")) return;
    const next = !saved;
    toggleSaved.mutate(
      { predictionId: prediction.id, saved },
      {
        onSuccess: () => toast.success(next ? "Saved" : "Removed from saved"),
        onError: (error) => toast.error(error.message),
        onSettled: () => setPendingSaved(null),
      },
    );
  }

  function handleShare() {
    if (!requireAuth("share predictions")) return;
    share.mutate(prediction.id, {
      onSuccess: async ({ share_url }) => {
        try {
          await navigator.clipboard.writeText(share_url);
          toast.success("Share link copied");
        } catch {
          toast.success("Share link ready", { description: share_url });
        }
      },
      onError: (error) => toast.error(error.message),
    });
  }

  return (
    <div className="animate-rise overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex flex-col items-center gap-4 p-6 text-center">
        <ConfidenceGauge
          tier={prediction.confidence_tier}
          score={prediction.confidence_score}
          size={104}
        />
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Model pick
          </p>
          <p className="mt-1.5 text-2xl leading-tight font-semibold tracking-tight text-balance">
            {prediction.market}
          </p>
          {prediction.scoring_version && (
            <p className="mt-2 text-[12px] text-muted-foreground">
              Scoring model {prediction.scoring_version}
            </p>
          )}
        </div>
      </div>

      <Separator />

      <div className="p-5">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Rationale
        </p>

        {unlocked ? (
          <p className="mt-2 text-[15px] leading-relaxed text-foreground/90">
            {prediction.rationale_text}
          </p>
        ) : (
          <div className="relative mt-3">
            {/* Teaser bars are decorative: they show there IS content without
                revealing any, and are hidden from assistive tech. */}
            <div aria-hidden className="select-none space-y-2.5 blur-[6px]">
              <div className="h-3.5 w-full rounded bg-muted" />
              <div className="h-3.5 w-[92%] rounded bg-muted" />
              <div className="h-3.5 w-[78%] rounded bg-muted" />
              <div className="h-3.5 w-[85%] rounded bg-muted" />
              <div className="h-3.5 w-[60%] rounded bg-muted" />
            </div>
            <div className="absolute inset-0 -mx-1 flex flex-col items-center justify-center gap-3 rounded-lg bg-card/55">
              <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground">
                <LockIcon className="size-3.5" />
                Locked
              </span>
              <Button
                size="sm"
                onClick={() => {
                  // /unlock and /ad-events both require a bearer token.
                  if (requireAuth("unlock predictions")) setUnlockOpen(true);
                }}
              >
                Unlock prediction
              </Button>
            </div>
          </div>
        )}
      </div>

      <Separator />

      <div className="flex items-center gap-2 px-5 py-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSave}
          disabled={toggleSaved.isPending}
          aria-pressed={saved}
        >
          <BookmarkIcon className={saved ? "fill-current" : undefined} />
          {saved ? "Saved" : "Save"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleShare}
          disabled={share.isPending || !unlocked}
        >
          <Share2Icon />
          Share
        </Button>
      </div>

      <UnlockDialog
        predictionId={prediction.id}
        open={unlockOpen}
        onOpenChange={setUnlockOpen}
      />
    </div>
  );
}
