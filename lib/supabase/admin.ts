// ═══════════════════════════════════════════════════════════════
//  SportVerge — Supabase Admin Client
//  ─────────────────────────────────────────────────────────────
//  ⚠️  მხოლოდ სერვერზე (API routes, Server Actions, Cron Jobs)
//  🔑 Service Role key — RLS-ს გვერდს უვლის, ამიტომ:
//      ❌ არასდროს client component-ში
//      ❌ არასდროს NEXT_PUBLIC_ prefix-ით
//      ✅ მხოლოდ server-side კონტექსტში
// ═══════════════════════════════════════════════════════════════

import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

// ─────────────────────────────────────────────────────────────
//  Environment Validation
//  ვამოწმებთ რომ საჭირო ცვლადები არსებობს სანამ client შეიქმნება
// ─────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) {
  throw new Error(
    "❌ [Supabase Admin] NEXT_PUBLIC_SUPABASE_URL ვერ მოიძებნა.\n" +
      "   გადაამოწმე .env.local ფაილი."
  );
}

if (!SERVICE_ROLE_KEY) {
  throw new Error(
    "❌ [Supabase Admin] SUPABASE_SERVICE_ROLE_KEY ვერ მოიძებნა.\n" +
      "   გადაამოწმე .env.local ფაილი."
  );
}

// ─────────────────────────────────────────────────────────────
//  Admin Client (Singleton Pattern)
//  ─────────────────────────────────────────────────────────────
//  Next.js-ის dev რეჟიმში hot-reload-ის დროს ბევრჯერ
//  ირთვება module. Singleton-ით თავიდან ავიცილებთ
//  მრავალი connection-ის შექმნას.
// ─────────────────────────────────────────────────────────────

declare global {
  // eslint-disable-next-line no-var
  var __supabaseAdmin: SupabaseClient<Database> | undefined;
}

function createAdminClient(): SupabaseClient<Database> {
  return createClient<Database>(SUPABASE_URL!, SERVICE_ROLE_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        "x-application-name": "SportVerge-Admin",
      },
    },
  });
}

export const supabaseAdmin: SupabaseClient<Database> =
  globalThis.__supabaseAdmin ?? createAdminClient();

// dev-ში ვინახავთ global-ში რომ hot-reload-ზე თავიდან არ შეიქმნას
if (process.env.NODE_ENV !== "production") {
  globalThis.__supabaseAdmin = supabaseAdmin;
}

// ─────────────────────────────────────────────────────────────
//  Helper Functions — ხშირად გამოყენებადი admin ოპერაციები
// ─────────────────────────────────────────────────────────────

/**
 * ამოწმებს Supabase-თან კავშირს.
 * გამოიყენე health-check endpoint-ში ან cron-ის დასაწყისში.
 *
 * @example
 * const health = await checkAdminConnection();
 * if (!health.ok) console.error(health.error);
 */
export async function checkAdminConnection(): Promise<{
  ok: boolean;
  latencyMs: number;
  error?: string;
}> {
  const start = Date.now();

  try {
    const { error } = await supabaseAdmin
      .from("matches")
      .select("id", { count: "exact", head: true })
      .limit(0);

    return {
      ok: !error,
      latencyMs: Date.now() - start,
      error: error?.message,
    };
  } catch (err) {
    return {
      ok: false,
      latencyMs: Date.now() - start,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * აბრუნებს მომხმარებლის სრულ ინფორმაციას (auth + profile).
 * გამოიყენება admin panel-ში.
 */
export async function getUserById(userId: string) {
  const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);

  if (error) {
    return { user: null, error: error.message };
  }

  return { user: data.user, error: null };
}

/**
 * შლის მომხმარებელს სისტემიდან (auth + cascade profile-ზე).
 * ⚠️ გამოიყენე ფრთხილად — შეუქცევადია.
 */
export async function deleteUser(userId: string) {
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}

/**
 * ბევრ row-ს ერთდროულად ჩასმა (batch insert).
 * Supabase-ს default limit არის 1000 — თუ მეტი გჭირდება,
 * ეს helper ცალი-ცალკე დაყოფს.
 */
export async function batchInsert<T extends Record<string, unknown>>(
  table: string,
  rows: T[],
  batchSize = 500
): Promise<{ inserted: number; errors: string[] }> {
  let inserted = 0;
  const errors: string[] = [];

  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);

    const { error } = await supabaseAdmin.from(table).insert(batch);

    if (error) {
      errors.push(`Batch ${i / batchSize + 1}: ${error.message}`);
    } else {
      inserted += batch.length;
    }
  }

  return { inserted, errors };
}