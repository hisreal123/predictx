import type { NextRequest } from "next/server";

import { DEMO_MODE, demoAuth } from "@/lib/server/demo";
import {
  clearToken,
  deviceName,
  errorResponse,
  setToken,
  upstreamFetch,
} from "@/lib/server/upstream";

/**
 * Auth handlers that keep the Sanctum token server-side.
 *
 * Upstream returns `{ user, token }`. We store `token` in an httpOnly cookie
 * and return only `{ user }` to the browser, so the credential is never
 * readable by JavaScript.
 */

const CREDENTIAL_ROUTES = {
  login: "/v1/auth/login",
  register: "/v1/auth/register",
  google: "/v1/auth/google",
} as const;

type CredentialAction = keyof typeof CREDENTIAL_ROUTES;

function isCredentialAction(value: string): value is CredentialAction {
  return value in CREDENTIAL_ROUTES;
}

export async function POST(
  request: NextRequest,
  ctx: RouteContext<"/api/auth/[action]">,
) {
  const { action } = await ctx.params;

  if (DEMO_MODE) {
    if (action === "logout") {
      await clearToken();
      return Response.json({ ok: true });
    }
    if (!isCredentialAction(action)) {
      return errorResponse("Unknown auth action.", 404);
    }
    const { user, token } = demoAuth();
    await setToken(token);
    return Response.json({ user });
  }

  if (action === "logout") {
    // Best-effort upstream revocation: even if it fails, we still drop the
    // local cookie so the user is logged out of this browser.
    try {
      await upstreamFetch("/v1/auth/logout", { method: "POST" });
    } catch {
      // ignored on purpose
    }
    await clearToken();
    return Response.json({ ok: true });
  }

  if (!isCredentialAction(action)) {
    return errorResponse("Unknown auth action.", 404);
  }

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return errorResponse("Expected a JSON body.", 400);
  }

  let upstream: Response;
  try {
    upstream = await upstreamFetch(CREDENTIAL_ROUTES[action], {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // device_name is required by the API but is an implementation detail of
      // this client, so it is set here rather than asked of the caller.
      body: JSON.stringify({ ...payload, device_name: deviceName() }),
    });
  } catch {
    return errorResponse("Could not reach the PredictX API.", 502);
  }

  // Pass validation errors (422) and bad credentials (401) through untouched
  // so forms can render upstream's field-level messages.
  if (!upstream.ok) {
    const text = await upstream.text();
    return new Response(text, {
      status: upstream.status,
      headers: { "content-type": "application/json" },
    });
  }

  const data = (await upstream.json()) as { user?: unknown; token?: string };

  if (!data.token) {
    return errorResponse("The API did not return a token.", 502);
  }

  await setToken(data.token);

  return Response.json({ user: data.user }, { status: upstream.status });
}
