"use client";

import { CheckIcon, Loader2Icon, SparklesIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCreateSubscription, useMe, useSubscriptions } from "@/lib/api/hooks";

const BENEFITS = [
  "Every prediction unlocked, no ads",
  "Full model rationale and inputs",
  "Confidence breakdown on every fixture",
  "Save and share unlimited picks",
];

export default function PremiumPage() {
  const { data: user } = useMe();
  const { data: subscriptions } = useSubscriptions();
  const createSubscription = useCreateSubscription();

  const active = subscriptions?.find((s) => s.status === "Active");

  function handleSubscribe() {
    createSubscription.mutate(
      { payment_method: "paystack" },
      {
        onSuccess: () => toast.success("Subscription started"),
        onError: (error) => toast.error(error.message),
      },
    );
  }

  return (
    <div className="mx-auto max-w-lg py-4">
      <div className="animate-rise text-center">
        <span className="inline-grid size-10 place-items-center rounded-full bg-foreground text-background">
          <SparklesIcon className="size-5" />
        </span>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">
          PredictX Premium
        </h1>
        <p className="mx-auto mt-1.5 max-w-sm text-[13px] text-muted-foreground">
          Skip the ads and see every rating in full, the moment it&rsquo;s published.
        </p>
      </div>

      <div className="mt-7 animate-rise rounded-xl border border-border bg-card p-6">
        {user?.subscribed || active ? (
          <div className="text-center">
            <Badge className="bg-tier-high-muted text-tier-high">Active</Badge>
            <p className="mt-3 text-sm font-medium">You&rsquo;re on Premium</p>
            {active?.current_period_end && (
              <p className="mt-1 text-[13px] text-muted-foreground">
                Renews {new Date(active.current_period_end).toLocaleDateString()}
              </p>
            )}
          </div>
        ) : (
          <>
            <ul className="space-y-2.5">
              {BENEFITS.map((benefit, index) => (
                <li
                  key={benefit}
                  className="flex animate-pop items-start gap-2.5 text-[14px]"
                  style={{ animationDelay: `${index * 70}ms` }}
                >
                  <CheckIcon className="mt-0.5 size-4 shrink-0 text-tier-high" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
            <Button
              className="mt-6 w-full"
              onClick={handleSubscribe}
              disabled={createSubscription.isPending}
            >
              {createSubscription.isPending && (
                <Loader2Icon className="animate-spin-fast" aria-hidden />
              )}
              {createSubscription.isPending ? "Starting…" : "Subscribe with Paystack"}
            </Button>
            <p className="mt-3 text-center text-[12px] text-muted-foreground">
              Cancel anytime. Billed through Paystack.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
