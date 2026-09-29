// ═══════════════════════════════════════════════════════════════
//  SportVerge — Supabase Browser Client
//  ─────────────────────────────────────────────────────────────
//  ✅ გამოიყენე Client Components-ში ("use client")
//  🔑 Publishable Key — უსაფრთხოა ბრაუზერში (RLS იცავს)
//  ⚠️  არასდროს გამოიყენო Service Role key აქ!
// ═══════════════════════════════════════════════════════════════

"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

// ─────────────────────────────────────────────────────────────
//  Environment
// ─────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// ─────────────────────────────────────────────────────────────
//  Configuration Check
// ─────────────────────────────────────────────────────────────

/**
 * ამოწმებს Supabase კონფიგურირებულია თუ არა.
 * თუ `false` — authorization გვერდზე გამოჩნდება შეტყობინება.
 *
 * @example
 * if (!getIsSupabaseConfigured()) {
 *   return <div>Supabase არ არის კონფიგურირებული</div>;
 * }
 */
export function getIsSupabaseConfigured(): boolean {
  return Boolean(
    SUPABASE_URL &&
      SUPABASE_KEY &&
      SUPABASE_URL.startsWith("http")
  );
}

// ─────────────────────────────────────────────────────────────
//  Browser Client — Singleton Factory
//  ─────────────────────────────────────────────────────────────
//  ⚠️  არ throw-ავს თუ env ცარიელია — უბრალოდ აბრუნებს null-ს.
//  ეს საშუალებას აძლევს `getIsSupabaseConfigured()` მუშაობდეს
//  მანამდე სანამ client შეიქმნება.
// ─────────────────────────────────────────────────────────────

let _client: SupabaseClient<Database> | null = null;

export function createClient(): SupabaseClient<Database> {
  if (_client) return _client;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error(
      "❌ [Supabase Client] კონფიგურაცია არასრულია.\n" +
        "   გადაამოწმე .env.local ფაილში:\n" +
        "   - NEXT_PUBLIC_SUPABASE_URL\n" +
        "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  _client = createBrowserClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
      flowType: "pkce", // ✅ უფრო უსაფრთხოა OAuth-ისთვის
      detectSessionInUrl: true, // ✅ OAuth callback-ისთვის
      persistSession: true,
      autoRefreshToken: true,
    },
    global: {
      headers: {
        "x-application-name": "SportVerge-Web",
      },
    },
  });

  return _client;
}

// ─────────────────────────────────────────────────────────────
//  Convenience Export — supabase
//  ─────────────────────────────────────────────────────────────
//  ⚠️  Lazy getter — client არ შეიქმნება სანამ პირველად არ გამოიძახებ.
//  თუ env ცარიელია, `supabase` იქნება `null` — ყოველთვის გამოიყენე
//  `getIsSupabaseConfigured()` ჯერ.
//  ─────────────────────────────────────────────────────────────

export const supabase: SupabaseClient<Database> = (() => {
  try {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      // Return a proxy that throws only when accessed
      return new Proxy({} as SupabaseClient<Database>, {
        get() {
          throw new Error(
            "❌ [Supabase Client] Supabase არ არის კონფიგურირებული.\n" +
              "   გამოიყენე `getIsSupabaseConfigured()` ჯერ."
          );
        },
      });
    }
    return createClient();
  } catch {
    // Fallback proxy
    return new Proxy({} as SupabaseClient<Database>, {
      get() {
        throw new Error(
          "❌ [Supabase Client] Supabase client ვერ შეიქმნა."
        );
      },
    });
  }
})();

// ─────────────────────────────────────────────────────────────
//  Helper Functions
// ─────────────────────────────────────────────────────────────

/**
 * აბრუნებს მიმდინარე ავტორიზებულ მომხმარებელს.
 * თუ არ არის — null.
 *
 * @example
 * const user = await getCurrentUser();
 * if (!user) router.push("/ka/authorization");
 */
export async function getCurrentUser() {
  if (!getIsSupabaseConfigured()) return null;

  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) return null;
    return data.user;
  } catch {
    return null;
  }
}

/**
 * ამოწმებს არის თუ არა მომხმარებელი ავტორიზებული.
 *
 * @example
 * const loggedIn = await isAuthenticated();
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}

/**
 * Sign out — ასუფთავებს session-ს და აბრუნებს შედეგს.
 *
 * @example
 * const { success } = await signOut();
 * if (success) router.push("/ka");
 */
export async function signOut(): Promise<{
  success: boolean;
  error?: string;
}> {
  if (!getIsSupabaseConfigured()) {
    return { success: false, error: "Supabase not configured" };
  }

  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}