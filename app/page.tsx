import { FixturesBoard } from "@/components/fixtures-board";

export default function HomePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Fixtures</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Every match rated by the model, newest ratings first.
          </p>
        </div>
      </div>
      <FixturesBoard />
    </div>
  );
}
