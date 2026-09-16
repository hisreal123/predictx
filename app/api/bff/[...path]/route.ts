import type { NextRequest } from "next/server";

import {
  clearToken,
  errorResponse,
  upstreamFetch,
} from "@/lib/server/upstream";

/**
 * Generic authenticated proxy: /api/bff/<path> -> <PREDICTX_API_URL>/<path>
 *
 * The browser calls this instead of the Laravel API directly, so the Sanctum
 * token stays in an httpOnly cookie and is attached here, server-side.
 */

/**
 * Endpoints that must not be reachable through the generic proxy.
 *
 * The auth routes return a bearer token in their response body; proxying them
 * verbatim would hand that token to browser JS and defeat the httpOnly cookie.
 * They have dedicated handlers under /api/auth/* that capture the token
 * instead. The Paystack webhook is server-to-server and signature-verified
 * upstream, so it has no business being callable from a browser.
 */
const BLOCKED = [
  /^v1\/auth\//,
  /^v1\/webhooks\//,
];

async function proxy(request: NextRequest, path: string[]): Promise<Response> {
  const target = path.join("/");

  if (BLOCKED.some((pattern) => pattern.test(target))) {
    return errorResponse("This endpoint is not available through the proxy.", 404);
  }

  const search = request.nextUrl.search;
  const method = request.method;

  const init: RequestInit = { method };

  if (method !== "GET" && method !== "HEAD") {
    const body = await request.text();
    if (body) {
      init.body = body;
      init.headers = { "Content-Type": "application/json" };
    }
  }

  let upstream: Response;
  try {
    upstream = await upstreamFetch(`/${target}${search}`, init);
  } catch {
    return errorResponse("Could not reach the PredictX API.", 502);
  }

  // A rejected token is dead weight — drop it so the UI can send the user to
  // log in again rather than retrying with a credential that will never work.
  if (upstream.status === 401) {
    await clearToken();
  }

  const contentType = upstream.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return new Response(upstream.body, {
      status: upstream.status,
      headers: { "content-type": contentType || "text/plain" },
    });
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers: { "content-type": "application/json" },
  });
}

export async function GET(request: NextRequest, ctx: RouteContext<"/api/bff/[...path]">) {
  const { path } = await ctx.params;
  return proxy(request, path);
}

export async function POST(request: NextRequest, ctx: RouteContext<"/api/bff/[...path]">) {
  const { path } = await ctx.params;
  return proxy(request, path);
}

export async function PATCH(request: NextRequest, ctx: RouteContext<"/api/bff/[...path]">) {
  const { path } = await ctx.params;
  return proxy(request, path);
}

export async function PUT(request: NextRequest, ctx: RouteContext<"/api/bff/[...path]">) {
  const { path } = await ctx.params;
  return proxy(request, path);
}

export async function DELETE(request: NextRequest, ctx: RouteContext<"/api/bff/[...path]">) {
  const { path } = await ctx.params;
  return proxy(request, path);
}
