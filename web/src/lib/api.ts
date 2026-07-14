import { createClient } from "@/lib/supabase/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

/**
 * Server-side fetch to the Vitala NestJS API, authenticated with the current
 * user's Supabase access token. Use inside Server Components / Route Handlers.
 */
export async function apiGet<T>(path: string): Promise<T> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const res = await fetch(`${API_URL}/api${path}`, {
    headers: {
      Accept: "application/json",
      ...(session?.access_token
        ? { Authorization: `Bearer ${session.access_token}` }
        : {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `API ${res.status} on ${path}`);
  }
  return res.json() as Promise<T>;
}
