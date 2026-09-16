import "server-only";

import {
  DEMO_FIXTURES,
  DEMO_SAVED,
  DEMO_SUBSCRIPTIONS,
  DEMO_USER,
} from "./demo-data";

/**
 * Demo mode: serves canned data from the BFF instead of proxying to Laravel,
 * so a preview can be deployed before the API is publicly reachable.
 *
 * Enabled with NEXT_PUBLIC_PREDICTX_DEMO=1. It is deliberately NOT inferred
 * from NODE_ENV — a preview build is a production build, and demo mode must be
 * an explicit choice rather than something that switches on by accident.
 */
export const DEMO_MODE = process.env.NEXT_PUBLIC_PREDICTX_DEMO === "1";

function json(body: unknown, status = 200): Response {
  return Response.json(body, { status });
}

function paginated<T>(items: T[]) {
  return {
    data: items,
    links: { first: null, last: null, prev: null, next: null },
    meta: {
      current_page: 1,
      from: items.length ? 1 : null,
      last_page: 1,
      path: "/",
      per_page: 25,
      to: items.length || null,
      total: items.length,
    },
  };
}

/** Predictions unlocked during this server's lifetime. Resets on redeploy. */
const unlocked = new Set<number>();
const saved = new Set<number>(DEMO_SAVED.map((s) => s.prediction.id));

function withUnlockState<T extends { id: number; unlocked: string }>(p: T): T {
  return unlocked.has(p.id) ? { ...p, unlocked: "1" } : p;
}

function fixtureWithState(fixture: (typeof DEMO_FIXTURES)[number]) {
  if (!fixture.prediction) return fixture;
  return { ...fixture, prediction: withUnlockState(fixture.prediction) };
}

/**
 * Handles a BFF request with canned data.
 * Returns null when the path isn't part of the demo, so the caller can 404.
 */
export function handleDemo(
  method: string,
  path: string,
  authed: boolean,
): Response | null {
  const segments = path.split("/").filter(Boolean); // e.g. v1/fixtures/2
  const need = (r: Response | null) => (authed ? r : json({ message: "Unauthenticated." }, 401));

  if (method === "GET" && path === "v1/fixtures") {
    return json(paginated(DEMO_FIXTURES.map(fixtureWithState)));
  }

  if (segments[0] === "v1" && segments[1] === "fixtures" && segments[2]) {
    const fixture = DEMO_FIXTURES.find((f) => f.id === Number(segments[2]));
    if (!fixture) return json({ message: "Not found." }, 404);
    if (segments[3] === "prediction") {
      return fixture.prediction
        ? json(withUnlockState(fixture.prediction))
        : json({ message: "Not found." }, 404);
    }
    return json(fixtureWithState(fixture));
  }

  if (method === "GET" && path === "v1/me") return need(json(DEMO_USER));

  if (method === "GET" && path === "v1/predictions/saved") {
    return need(
      json(
        paginated(
          DEMO_SAVED.filter((s) => saved.has(s.prediction.id)).map((s) => ({
            ...s,
            prediction: withUnlockState(s.prediction),
          })),
        ),
      ),
    );
  }

  if (method === "GET" && path === "v1/subscriptions") {
    return need(json(DEMO_SUBSCRIPTIONS));
  }

  if (segments[0] === "v1" && segments[1] === "predictions" && segments[3]) {
    const id = Number(segments[2]);
    if (!authed) return json({ message: "Unauthenticated." }, 401);

    if (segments[3] === "unlock" && method === "POST") {
      unlocked.add(id);
      return json(
        { id: 1, prediction_id: id, method: "Ad", unlocked_at: new Date().toISOString() },
        200,
      );
    }
    if (segments[3] === "save") {
      if (method === "POST") saved.add(id);
      if (method === "DELETE") saved.delete(id);
      return json({ ok: true });
    }
    if (segments[3] === "share" && method === "POST") {
      return json({ share_token: `demo${id}`, share_url: `/shared/demo${id}` });
    }
  }

  if (path === "v1/ad-events" && method === "POST") {
    return need(
      json(
        {
          id: 1,
          prediction_id: 0,
          started_at: new Date().toISOString(),
          completed_at: null,
          completed: false,
        },
        201,
      ),
    );
  }

  if (segments[0] === "v1" && segments[1] === "ad-events" && segments[3] === "complete") {
    return need(
      json({
        id: Number(segments[2]),
        prediction_id: 0,
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        completed: true,
      }),
    );
  }

  if (path.startsWith("v1/shared/")) {
    const token = segments[2];
    const match = DEMO_FIXTURES.find((f) => f.prediction?.share_token === token);
    return match?.prediction
      ? json({ ...match.prediction, unlocked: "1" })
      : json({ message: "Not found." }, 404);
  }

  if (path === "v1/subscriptions" && method === "POST") {
    return need(
      json(
        {
          id: 1,
          provider: "demo",
          status: "Active",
          current_period_end: null,
        },
        201,
      ),
    );
  }

  return null;
}

/** Demo sign-in: any credentials are accepted and no real token is minted. */
export function demoAuth(): { user: typeof DEMO_USER; token: string } {
  return { user: DEMO_USER, token: "demo-session" };
}
