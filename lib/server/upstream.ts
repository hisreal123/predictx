import "server-only";

import { cookies } from "next/headers";

/**
 * Server-only access to the PredictX Laravel API.
 *
 * The Sanctum token lives in an httpOnly cookie that browser JS cannot read.
 * Everything in here runs on the server and is the only place the token and
 * the upstream URL are visible.
 */

export const TOKEN_COOKIE = "px_token";

export function upstreamUrl(): string {
  const url = process.env.PREDICTX_API_URL;
  if (!url) {
    throw new Error(
      "PREDICTX_API_URL is not set. Copy .env.example to .env.local.",
    );
  }
  return url.replace(/\/$/, "");
}

export function deviceName(): string {
  return process.env.PREDICTX_DEVICE_NAME ?? "predictx-web";
}

export async function getToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(TOKEN_COOKIE)?.value;
}

export async function setToken(token: string): Promise<void> {
  const store = await cookies();
  store.set(TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    // Sanctum tokens don't carry an expiry in the response, so pin a
    // reasonable session length; a 401 from upstream clears it early.
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearToken(): Promise<void> {
  const store = await cookies();
  store.delete(TOKEN_COOKIE);
}

/**
 * Calls the upstream API with the caller's bearer token attached.
 * Uses `fetch` rather than axios: this runs on the server, where axios buys
 * nothing and `fetch` integrates with Next's request handling.
 */
export async function upstreamFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const token = await getToken();
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  return fetch(`${upstreamUrl()}${path}`, {
    ...init,
    headers,
    // Auth-dependent data must never be cached across users.
    cache: "no-store",
  });
}

export function errorResponse(message: string, status: number): Response {
  return Response.json({ message }, { status });
}
