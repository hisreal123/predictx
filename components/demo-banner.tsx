import { FlaskConicalIcon } from "lucide-react";

/**
 * Shown on every page while demo mode is on.
 *
 * Not optional and not dismissible: the fixtures and confidence ratings in
 * demo mode are invented, and this is a sports-prediction product. Anyone
 * opening the preview has to be able to tell at a glance that none of it is
 * real data.
 */
export function DemoBanner() {
  if (process.env.NEXT_PUBLIC_PREDICTX_DEMO !== "1") return null;

  return (
    <div className="border-b border-tier-medium/30 bg-tier-medium-muted">
      <div className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-2 sm:px-6">
        <FlaskConicalIcon className="size-3.5 shrink-0 text-tier-medium" />
        <p className="text-[12px] font-medium text-tier-medium">
          Demo preview — every fixture, rating and rationale on this site is
          sample data, not real predictions.
        </p>
      </div>
    </div>
  );
}
