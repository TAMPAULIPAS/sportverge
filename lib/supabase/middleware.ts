// ═══════════════════════════════════════════════════════════════
//  SportVerge — Supabase Middleware Helper
//  ─────────────────────────────────────────────────────────────
//  🎯 დანიშნულება:
//     1. Session cookie-ების ავტომატური refresh ყოველ request-ზე
//     2. მომხმარებლის ინფოს მიწოდება proxy.ts-ისთვის
//     3. Protected route-ების დაცვა (ავტორიზაციის გარეშე redirect)
//
//  ⚠️  ამ ფაილს პირდაპირ არ იძახებ — proxy.ts აკეთებს ამას.
//      ნახე: /proxy.ts
// ═══════════════════════════════════════════════════════════════

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { User } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

// ─────────────────────────────────────────────────────────────
//  Environment
// ─────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error(
    "❌ [Supabase Middleware] SUPABASE_URL ან ANON_KEY ვერ მოიძებნა.\n" +
      "   გადაამოწმე .env.local ფაილი."
  );
}

// ─────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────

export interface MiddlewareResult {
  /** NextResponse — რომელიც უნდა დაბრუნდეს proxy.ts-იდან */
  response: NextResponse;
  /** ავტორიზებული მომხმარებელი (ან null) */
  user: User | null;
}

// ─────────────────────────────────────────────────────────────
//  Main Function — updateSession
//  ─────────────────────────────────────────────────────────────
//  ⚠️  ᲛᲜᲘᲨᲕᲜᲔᲚᲝᲕᲐᲜᲘ:
//      - getSession()-ის ნაცვლად getUser() გამოიყენე
//        (ის Supabase-ს სერვერზე ამოწმებს, უფრო უსაფრთხოა)
//      - response.cookies.set() უნდა მოხდეს request-ის დასრულებამდე
//      - არასდროს წაშალო supabase.auth.getUser() — session
//        refresh-ს სწორედ ის ატრიგერებს
// ─────────────────────────────────────────────────────────────

export async function updateSession(
  request: NextRequest,
  initialResponse?: NextResponse
): Promise<MiddlewareResult> {
  // ─── response-ის შექმნა ან გამოყენება ───
  let response = initialResponse ?? NextResponse.next({ request });

  // ─── Supabase client-ის შექმნა ───
  const supabase = createServerClient<Database>(
    SUPABASE_URL!,
    SUPABASE_KEY!,
    {
      cookies: {
        // ─── Request-იდან cookie-ების წაკითხვა ───
        getAll() {
          return request.cookies.getAll();
        },

        // ─── Cookie-ების ჩაწერა (refresh token) ───
        setAll(cookiesToSet) {
          // 1. request-ზე ჩავწეროთ (რომ downstream-მა დაინახოს)
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          // 2. ახალი response შევქმნათ განახლებული cookie-ებით
          response = NextResponse.next({ request });

          // 3. response-ზე დავაყენოთ Set-Cookie headers
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
      global: {
        headers: {
          "x-application-name": "SportVerge-Middleware",
        },
      },
    }
  );

  // ─── ⚠️ არ წაშალო! ───
  // ეს ხაზი:
  //  1. ამოწმებს token-ს Supabase-ის სერვერზე
  //  2. თუ საჭიროა — განაახლებს session-ს
  //  3. response-ში ჩაწერს ახალ cookie-ებს
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user };
}

// ─────────────────────────────────────────────────────────────
//  Helper — Protected Route Check
//  ─────────────────────────────────────────────────────────────

/**
 * ამოწმებს არის თუ არა route დაცული.
 * დაცული route-ებია: /profile, /settings, /predictions/my, /leaderboard/my
 */
export function isProtectedRoute(pathname: string): boolean {
  const protectedPaths = [
    "/profile",
    "/settings",
    "/bookmarks",
    "/my-predictions",
  ];

  // ამოიღე locale prefix (/ka, /en, /ru)
  const pathWithoutLocale = pathname.replace(/^\/(ka|en|ru)/, "");

  return protectedPaths.some(
    (path) =>
      pathWithoutLocale === path ||
      pathWithoutLocale.startsWith(`${path}/`)
  );
}

/**
 * ამოწმებს არის თუ არა auth route (login/register).
 * ავტორიზებული user-ი აქ არ უნდა მოხვდეს — გადამისამართდება homepage-ზე.
 */
export function isAuthRoute(pathname: string): boolean {
  const authPaths = ["/authorization", "/login", "/register"];

  const pathWithoutLocale = pathname.replace(/^\/(ka|en|ru)/, "");

  return authPaths.some(
    (path) =>
      pathWithoutLocale === path ||
      pathWithoutLocale.startsWith(`${path}/`)
  );
}

/**
 * აბრუნებს locale-ს URL-იდან.
 * თუ ვერ იპოვა — default "ka".
 */
export function getLocaleFromPath(pathname: string): "ka" | "en" | "ru" {
  const match = pathname.match(/^\/(ka|en|ru)/);
  return (match?.[1] as "ka" | "en" | "ru") ?? "ka";
}