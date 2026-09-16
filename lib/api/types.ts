/**
 * Types transcribed from predictx-api.json (PREDICT X API v1).
 * Field names match the API exactly (snake_case) so responses need no remapping.
 */

export type Sport = "Football" | "Tennis" | "Basketball";
export type FixtureStatus = "Scheduled" | "Live" | "Finished";
export type ConfidenceTier = "High" | "Medium" | "Low";
export type UnlockMethod = "Ad" | "Subscription";
export type UserRole = "Fan" | "Admin";
export type SubscriptionStatus =
  | "Active"
  | "Cancelled"
  | "PastDue"
  | "Incomplete"
  | "Expired";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  subscribed: boolean;
  created_at: string | null;
}

export interface Team {
  id: number;
  name: string;
  sport: Sport;
  league: string;
  /**
   * Not in the API yet. Declared optional so `TeamCrest` starts rendering real
   * crests the moment the backend adds it, with no client changes.
   */
  logo_url?: string | null;
  /** Likewise: an ISO 3166-1 alpha-2 code would let us show flags. */
  country_code?: string | null;
}

export interface Prediction {
  id: number;
  fixture_id: number;
  market: string;
  confidence_tier: ConfidenceTier;
  confidence_score: number;
  /**
   * The spec types this as `string`, not `boolean` — treat it as truthy/falsy
   * via `isUnlocked()` rather than comparing directly.
   */
  unlocked: string;
  /** Only present once the prediction is unlocked. */
  rationale_text?: string;
  scoring_version?: string;
  raw_inputs?: unknown[];
  share_token?: string | null;
}

export interface Fixture {
  id: number;
  competition: string;
  kickoff_at: string;
  status: FixtureStatus;
  home_team?: Team;
  away_team?: Team;
  prediction?: Prediction;
}

/** `GET /v1/fixtures` guarantees both teams are present. */
export interface FixtureListItem extends Fixture {
  home_team: Team;
  away_team: Team;
}

export interface SavedPrediction {
  id: number;
  saved_at: string;
  prediction: Prediction;
  fixture: Fixture;
}

/** `POST /v1/predictions/{id}/share` — the API builds the URL, we don't. */
export interface SharePredictionResponse {
  share_token: string;
  share_url: string;
}

export interface Subscription {
  id: number;
  provider: string;
  status: SubscriptionStatus;
  current_period_end: string | null;
}

export interface AdEvent {
  id: number;
  prediction_id: number;
  started_at: string;
  completed_at: string | null;
  completed: boolean;
}

export interface UnlockEvent {
  id: number;
  prediction_id: number;
  method: UnlockMethod;
  unlocked_at: string;
}

export interface Paginated<T> {
  data: T[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number | null;
    last_page: number;
    path: string;
    per_page: number;
    to: number | null;
    total: number;
  };
}

/** `device_name` is attached server-side by the BFF, so callers omit it. */
export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface GoogleLoginPayload {
  token: string;
}

export interface FixtureFilters {
  competition?: string;
  date?: string;
  page?: number;
}

export interface UnlockPayload {
  method: UnlockMethod;
}

export interface CreateSubscriptionPayload {
  payment_method: string;
}

export interface AdminUpdatePredictionPayload {
  market?: string;
  confidence_tier?: ConfidenceTier;
  confidence_score?: number;
  rationale_text?: string;
}

/**
 * `Prediction.unlocked` is a string in the spec, and Laravel may serialise it
 * as "1"/"0", "true"/"false" or a boolean. Normalise all of those.
 */
export function isUnlocked(prediction: Prediction): boolean {
  const value = prediction.unlocked as unknown;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    return value === "1" || value.toLowerCase() === "true";
  }
  return false;
}
