// ═══════════════════════════════════════════════════════════════
//  SportVerge — Supabase Auth Helpers
//  ─────────────────────────────────────────────────────────────
//  🔐 Email + Password authentication (no OAuth)
//     - signUp() — რეგისტრაცია
//     - signIn() — შესვლა
//     - signOut() — გასვლა
//     - resetPassword() — პაროლის აღდგენა
//     - updatePassword() — პაროლის შეცვლა
//     - getProfile() — profile-ის წაკითხვა
// ═══════════════════════════════════════════════════════════════

"use client";

import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

// ─────────────────────────────────────────────────────────────
//  TYPES
// ─────────────────────────────────────────────────────────────

export interface Profile {
  id: string;
  email: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  language: "ka" | "en" | "ru";
  favorite_teams: string[];
  total_predictions: number;
  correct_predictions: number;
  current_streak: number;
  best_streak: number;
  badges: string[];
  created_at: string;
  updated_at: string;
}

export interface AuthResult {
  success: boolean;
  error?: string;
  needsEmailConfirmation?: boolean;
  userId?: string;
}

// ─────────────────────────────────────────────────────────────
//  CLIENT (lazy singleton)
// ─────────────────────────────────────────────────────────────

let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (_client) return _client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Supabase env vars not configured");
  }

  _client = createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: "pkce",
    },
  });

  return _client;
}

// ─────────────────────────────────────────────────────────────
//  TRANSLATE ERRORS
// ─────────────────────────────────────────────────────────────

function translateError(message: string, locale: string = "ka"): string {
  const isKa = locale === "ka";
  const isRu = locale === "ru";

  if (message.includes("Invalid login credentials")) {
    return isKa
      ? "ელფოსტა ან პაროლი არასწორია"
      : isRu
      ? "Неверный email или пароль"
      : "Invalid email or password";
  }
  if (message.includes("User already registered")) {
    return isKa
      ? "ეს ელფოსტა უკვე რეგისტრირებულია"
      : isRu
      ? "Этот email уже зарегистрирован"
      : "This email is already registered";
  }
  if (message.includes("Password should be at least")) {
    return isKa
      ? "პაროლი უნდა იყოს მინიმუმ 6 სიმბოლო"
      : isRu
      ? "Пароль должен быть не менее 6 символов"
      : "Password must be at least 6 characters";
  }
  if (message.includes("Email not confirmed")) {
    return isKa
      ? "დაადასტურე ელფოსტა (შეამოწმე inbox)"
      : isRu
      ? "Подтверди email (проверь inbox)"
      : "Please confirm your email (check inbox)";
  }
  if (message.includes("Email rate limit")) {
    return isKa
      ? "ძალიან ბევრი ცდა. დაელოდე რამდენიმე წუთს."
      : isRu
      ? "Слишком много попыток. Подожди несколько минут."
      : "Too many attempts. Please wait a few minutes.";
  }
  return message;
}

// ─────────────────────────────────────────────────────────────
//  1. SIGN UP
// ─────────────────────────────────────────────────────────────

export async function signUp(params: {
  email: string;
  password: string;
  username?: string;
  fullName?: string;
  locale?: string;
}): Promise<AuthResult> {
  const { email, password, username, fullName, locale = "ka" } = params;

  if (!email || !email.includes("@")) {
    return { success: false, error: translateError("Invalid email", locale) };
  }
  if (!password || password.length < 6) {
    return {
      success: false,
      error: translateError("Password should be at least 6 characters", locale),
    };
  }

  try {
    const supabase = getClient();
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          username: username?.trim() || email.split("@")[0],
          full_name: fullName?.trim() || username?.trim() || email.split("@")[0],
        },
        emailRedirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/${locale}/authorization/callback`,
      },
    });

    if (error) {
      return { success: false, error: translateError(error.message, locale) };
    }

    // Check if email confirmation is required
    const needsConfirmation = !!data.user && !data.session;

    return {
      success: true,
      userId: data.user?.id,
      needsEmailConfirmation: needsConfirmation,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

// ─────────────────────────────────────────────────────────────
//  2. SIGN IN
// ─────────────────────────────────────────────────────────────

export async function signIn(params: {
  email: string;
  password: string;
  locale?: string;
}): Promise<AuthResult> {
  const { email, password, locale = "ka" } = params;

  if (!email || !password) {
    return {
      success: false,
      error:
        locale === "ka"
          ? "შეავსე ყველა ველი"
          : locale === "ru"
          ? "Заполни все поля"
          : "Fill in all fields",
    };
  }

  try {
    const supabase = getClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      return { success: false, error: translateError(error.message, locale) };
    }

    return { success: true, userId: data.user?.id };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

// ─────────────────────────────────────────────────────────────
//  3. SIGN OUT
// ─────────────────────────────────────────────────────────────

export async function signOutUser(): Promise<AuthResult> {
  try {
    const supabase = getClient();
    const { error } = await supabase.auth.signOut();
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

// ─────────────────────────────────────────────────────────────
//  4. GET CURRENT USER
// ─────────────────────────────────────────────────────────────

export async function getCurrentUser() {
  try {
    const supabase = getClient();
    const { data, error } = await supabase.auth.getUser();
    if (error) return null;
    return data.user;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
//  5. GET PROFILE
// ─────────────────────────────────────────────────────────────

export async function getProfile(): Promise<Profile | null> {
  try {
    const supabase = getClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return null;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userData.user.id)
      .single();

    if (error) return null;
    return data as Profile;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
//  6. UPDATE PROFILE
// ─────────────────────────────────────────────────────────────

export async function updateProfile(updates: {
  username?: string;
  full_name?: string;
  bio?: string;
  language?: "ka" | "en" | "ru";
  avatar_url?: string;
}): Promise<AuthResult> {
  try {
    const supabase = getClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      return { success: false, error: "Not authenticated" };
    }

    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userData.user.id);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

// ─────────────────────────────────────────────────────────────
//  7. RESET PASSWORD (send email)
// ─────────────────────────────────────────────────────────────

export async function resetPassword(params: {
  email: string;
  locale?: string;
}): Promise<AuthResult> {
  const { email, locale = "ka" } = params;

  try {
    const supabase = getClient();
    const origin = typeof window !== "undefined" ? window.location.origin : "";

    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      {
        redirectTo: `${origin}/${locale}/authorization/reset`,
      }
    );

    if (error) {
      return { success: false, error: translateError(error.message, locale) };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

// ─────────────────────────────────────────────────────────────
//  8. UPDATE PASSWORD (after reset)
// ─────────────────────────────────────────────────────────────

export async function updatePassword(newPassword: string): Promise<AuthResult> {
  try {
    const supabase = getClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

// ─────────────────────────────────────────────────────────────
//  9. AUTH STATE LISTENER
// ─────────────────────────────────────────────────────────────

export function onAuthStateChange(
  callback: (user: import("@supabase/supabase-js").User | null) => void
) {
  const supabase = getClient();
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
  return data.subscription;
}