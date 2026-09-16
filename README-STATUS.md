# PredictX frontend — build status

What is working, what is stubbed, and what is blocked on the API. Current as of
the `feat/predictx-ui` branch.

## Working

| Area | Notes |
| --- | --- |
| Fixtures board | Grouped by competition, ordered by kickoff, 7-day date strip |
| Fixture detail | Centred confidence gauge, locked-rationale teaser |
| Unlock flow | Rewarded-ad and Premium paths both call the real endpoints |
| Saved predictions | List, toggle, correct saved state on load |
| Share | Creates a token, copies the link, public `/shared/[token]` page |
| Auth | Register / login / logout, password reveal, strict client policy |
| Theming | Cream / dark / gold with a toggle, honours `prefers-reduced-motion` |
| Security | Sanctum token held in an httpOnly cookie behind a BFF proxy |

Lint, typecheck and production build are all clean.

## Stubbed — works, but not the real thing

**Rewarded ad.** `components/unlock-dialog.tsx` runs a 5-second placeholder
(`AD_SECONDS`). It calls `POST /v1/ad-events` and `PATCH .../complete`
correctly, so swapping in a real ad SDK is a local change — but no ad is served
and no revenue is earned today.

**Paystack checkout.** `POST /v1/subscriptions` is called with
`payment_method: "paystack"`, but there is no Paystack redirect or inline
checkout, so no card is ever charged. Needs the provider's client flow plus
whatever the API returns to redirect to.

**Team crests.** Monogram placeholders. See blocked items below.

## Not built yet

- **Google sign-in.** The `useGoogleLogin` hook and the `/api/auth/google` BFF
  route both exist and work; there is no button and no Google client SDK to
  obtain the token.
- **Admin screens.** `GET /v1/admin/predictions` and
  `PATCH /v1/admin/predictions/{id}` are wired as hooks. No UI, and no route
  guard for `role === "Admin"`.
- **Pagination.** Fixtures, saved and admin lists all return a paginated
  envelope; the UI only ever renders page 1.
- **Competition filter.** `GET /v1/fixtures` accepts a `competition` parameter.
  Only the `date` filter is wired.
- **Error and not-found boundaries.** No `app/error.tsx` or `app/not-found.tsx`,
  so an unexpected throw shows the default Next screen.
- **Per-page metadata.** Only the root layout sets metadata, so a shared
  prediction link previews with a generic title and no Open Graph image. This
  matters more than usual because sharing is a product feature.
- **Tests.** None.

## Blocked on the API

These are built to light up the moment the backend adds the field — no client
work required.

1. **`TeamResource.logo_url`** — real crests. Only `{ id, name, sport, league }`
   is returned today, and matching crests by name is unreliable and uses
   trademarked artwork.
2. **`TeamResource.country_code`** — flags, which unlike crests carry no
   trademark risk.
3. **A `saved` flag on `PredictionResource`** (or a lookup endpoint). Saved
   state is currently derived from the first page of `/v1/predictions/saved`, so
   a prediction saved beyond page 1 reads as unsaved.
4. **Server-side password policy.** `lib/password.ts` enforces 8+ chars with
   upper, lower, number and symbol, but `RegisterRequest` only enforces
   `minLength: 8`. Until the Laravel validator matches, the rules are UX
   guidance and not enforcement — a direct API call bypasses them.
5. **`PredictionResource.unlocked` is typed `string`, not `boolean`.**
   `isUnlocked()` normalises `"1"/"true"/true/1` defensively; worth fixing at
   the source.

## Before deploying

- Set `PREDICTX_API_URL` to the production API. It is server-only and
  deliberately not `NEXT_PUBLIC_`, so the Laravel origin stays hidden.
- The session cookie sets `secure` only when `NODE_ENV === "production"`, so
  production must be served over HTTPS.
- No git remote is configured yet (`git remote -v` is empty).
