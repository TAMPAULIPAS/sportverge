// ═══════════════════════════════════════════════════════════════
//  SportVerge — Supabase Server Client
//  ─────────────────────────────────────────────────────────────
//  ✅ გამოიყენე Server Components, Server Actions, Route Handlers
//  🍪 cookie-ებიდან კითხულობს session-ს — user-ი ავტომატურად ჩანს
//  🔑 Publishable Key — RLS იცავს მონაცემებს
//  ⚠️  createClient() უნდა იძახო ყოველ request-ზე (არა global)
// ═══════════════════════════════════════════════════════════════

import "server-only";
import { cookies } from "next/headers";
import { createServerClient as createSupabaseSSR } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

// ─────────────────────────────────────────────────────────────
//  Environment Validation
// ─────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL) {
  throw new Error(
    "❌ [Supabase Server] NEXT_PUBLIC_SUPABASE_URL ვერ მოიძებნა.\n" +
      "   გადაამოწმე .env.local ფაილი."
  );
}

if (!SUPABASE_KEY) {
  throw new Error(
    "❌ [Supabase Server] NEXT_PUBLIC_SUPABASE_ANON_KEY ვერ მოიძებნა.\n" +
      "   გადაამოწმე .env.local ფაილი."
  );
}

// ─────────────────────────────────────────────────────────────
//  Server Client Factory
//  ─────────────────────────────────────────────────────────────
//  ⚠️  Next.js 15+ — cookies() არის async, ამიტომ ფუნქციაც async.
//  ⚠️  Server Component-დან cookie-ს ვერ ჩაწერ (მხოლოდ წაკითხვა).
//      Route Handler / Server Action-დან — შეგიძლია ჩაწერაც.
// ─────────────────────────────────────────────────────────────

export async function createClient(): Promise<SupabaseClient<Database>> {
  const cookieStore = await cookies();

  return createSupabaseSSR<Database>(SUPABASE_URL!, SUPABASE_KEY!, {
    cookies: {
      // ─── ყველა cookie-ს წაკითხვა ───
      getAll() {
        return cookieStore.getAll();
      },

      // ─── cookie-ების ჩაწერა (refresh token-ისთვის) ───
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Component-დან გამოძახებისას ვერ ჩაიწერება —
          // middleware.ts გააკეთებს session refresh-ს.
          // ეს error-ი უსაფრთხოდ იგნორირდება.
        }
      },
    },
    global: {
      headers: {
        "x-application-name": "SportVerge-Server",
      },
    },
  });
}

// ─────────────────────────────────────────────────────────────
//  Helper Functions
//  ─────────────────────────────────────────────────────────────

/**
 * აბრუნებს მიმდინარე ავტორიზებულ მომხმარებელს (Server-side).
 * ⚠️  getSession()-ის ნაცვლად getUser() გამოიყენე — ის Supabase-ს
 *     სერვერზე ამოწმებს (უფრო უსაფრთხოა).
 *
 * @example
 * const user = await getCurrentUser();
 * if (!user) redirect("/ka/authorization");
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) return null;
  return data.user;
}

/**
 * ამოწმებს არის თუ არა მომხმარებელი ავტორიზებული.
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}

/**
 * აბრუნებს მომხმარებლის profile-ს DB-დან (users ცხრილიდან).
 * თუ user არ არის — null.
 *
 * @example
 * const profile = await getUserProfile();
 * if (profile) console.log(profile.username);
 */
export async function getUserProfile() {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) return null;
  return data;
}

/**
 * Sign out server-side — შლის cookie-ებს და აბრუნებს redirect path-ს.
 * გამოიყენე Server Action-ში ან Route Handler-ში.
 *
 * @example
 * // app/[locale]/authorization/actions.ts
 * "use server";
 * export async function logoutAction() {
 *   const { redirectTo } = await serverSignOut();
 *   redirect(redirectTo);
 * }
 */
export async function serverSignOut(): Promise<{
  success: boolean;
  redirectTo: string;
  error?: string;
}> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    return {
      success: false,
      redirectTo: "/ka",
      error: error.message,
    };
  }

  return {
    success: true,
    redirectTo: "/ka",
  };
}

/**
 * აბრუნებს session-ის access token-ს (საჭიროა თუ გინდა
 * პირდაპირ REST API-ს გამოძახება).
 */
export async function getAccessToken(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.access_token ?? null;
}

export const createServerClient = createClient;
