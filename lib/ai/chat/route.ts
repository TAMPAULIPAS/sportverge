// ═══════════════════════════════════════════════════════════════
//  SportVerge — AI Chat API
//  ─────────────────────────────────────────────────────────────
//  🎯 Endpoint: POST /api/ai/chat
//
//  📥 Request body:
//     {
//       message: string,
//       locale: "ka" | "en" | "ru",
//       history?: Array<{ role: "user" | "assistant", content: string }>
//     }
//
//  📤 Response:
//     {
//       success: boolean,
//       reply: string,
//       provider: "gemini" | "fallback",
//       durationMs: number
//     }
//
//  ✨ Features:
//     - Live context injection (matches, scores)
//     - System prompt with personality
//     - Rate limiting (per IP, in-memory)
//     - Message history support (max 10)
//     - Input validation & sanitization
//     - Graceful error handling
//     - Timeout protection
// ═══════════════════════════════════════════════════════════════

import { NextResponse, type NextRequest } from "next/server";
import { buildAIContext } from "@/lib/ai/context";
import {
  buildSystemPrompt,
  getFallback,
  isSportsRelated,
} from "@/lib/ai/system-prompt";

// ─────────────────────────────────────────────────────────────
//  ⚙️ CONFIG
// ─────────────────────────────────────────────────────────────

const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? "";
const GEMINI_MODEL = "gemini-flash-latest";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const MAX_MESSAGE_LENGTH = 1000;
const MAX_HISTORY_LENGTH = 10;
const TIMEOUT_MS = 25_000;

// Rate limit: 20 messages per minute per IP
const RATE_LIMIT_WINDOW = 60_000;
const RATE_LIMIT_MAX = 20;

// ─────────────────────────────────────────────────────────────
//  📐 TYPES
//  ─────────────────────────────────────────────────────────────

type Locale = "ka" | "en" | "ru";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequest {
  message: string;
  locale?: Locale;
  history?: ChatMessage[];
}

interface GeminiResponse {
  candidates?: Array<{
    content: {
      parts: Array<{ text: string }>;
    };
    finishReason?: string;
  }>;
  error?: {
    code: number;
    message: string;
  };
}

// ─────────────────────────────────────────────────────────────
//  🚦 RATE LIMITING (in-memory)
// ─────────────────────────────────────────────────────────────

interface RateEntry {
  count: number;
  resetAt: number;
}

const rateMap = new Map<string, RateEntry>();

function checkRateLimit(ip: string): {
  allowed: boolean;
  remaining: number;
  resetIn: number;
} {
  const now = Date.now();
  const entry = rateMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1, resetIn: RATE_LIMIT_WINDOW };
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: entry.resetAt - now,
    };
  }

  entry.count++;
  return {
    allowed: true,
    remaining: RATE_LIMIT_MAX - entry.count,
    resetIn: entry.resetAt - now,
  };
}

// Cleanup old entries periodically
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of rateMap.entries()) {
      if (now > entry.resetAt) rateMap.delete(ip);
    }
  }, 5 * 60_000);
}

// ─────────────────────────────────────────────────────────────
//  🛡️ INPUT VALIDATION
//  ─────────────────────────────────────────────────────────────

function validateRequest(body: unknown): {
  valid: boolean;
  data?: ChatRequest;
  error?: string;
} {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Invalid request body" };
  }

  const b = body as Record<string, unknown>;

  if (typeof b.message !== "string" || b.message.trim().length === 0) {
    return { valid: false, error: "Message is required" };
  }

  if (b.message.length > MAX_MESSAGE_LENGTH) {
    return {
      valid: false,
      error: `Message too long (max ${MAX_MESSAGE_LENGTH} chars)`,
    };
  }

  const locale: Locale =
    b.locale === "en" || b.locale === "ru" ? b.locale : "ka";

  let history: ChatMessage[] | undefined;
  if (Array.isArray(b.history)) {
    history = (b.history as unknown[])
      .filter(
        (m): m is ChatMessage =>
          !!m &&
          typeof m === "object" &&
          ((m as ChatMessage).role === "user" ||
            (m as ChatMessage).role === "assistant") &&
          typeof (m as ChatMessage).content === "string"
      )
      .slice(-MAX_HISTORY_LENGTH)
      .map((m) => ({
        role: m.role,
        content: m.content.slice(0, MAX_MESSAGE_LENGTH),
      }));
  }

  return {
    valid: true,
    data: {
      message: b.message.trim(),
      locale,
      history,
    },
  };
}

// ─────────────────────────────────────────────────────────────
//  🤖 GEMINI CALL
//  ─────────────────────────────────────────────────────────────

async function callGemini(
  systemPrompt: string,
  history: ChatMessage[],
  userMessage: string
): Promise<{ text: string | null; error?: string }> {
  if (!GEMINI_API_KEY) {
    return { text: null, error: "GEMINI_API_KEY not configured" };
  }

  // ─── Build conversation contents ───
  const contents = [
    ...history.map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    })),
    {
      role: "user",
      parts: [{ text: userMessage }],
    },
  ];

  const body = {
    contents,
    systemInstruction: {
      parts: [{ text: systemPrompt }],
    },
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 600,
      topP: 0.95,
      topK: 40,
    },
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" },
    ],
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(GEMINI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": GEMINI_API_KEY,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error(`[AI Chat] Gemini ${res.status}:`, errText.slice(0, 300));
      return { text: null, error: `Gemini API error: ${res.status}` };
    }

    const data: GeminiResponse = await res.json();

    if (data.error) {
      console.error("[AI Chat] Gemini error:", data.error);
      return { text: null, error: data.error.message };
    }

    const candidate = data.candidates?.[0];
    if (!candidate || candidate.finishReason === "SAFETY") {
      return { text: null, error: "Response blocked" };
    }

    const text = candidate.content?.parts?.[0]?.text?.trim() ?? null;
    return { text };
  } catch (err) {
    clearTimeout(timer);
    const isTimeout = err instanceof Error && err.name === "AbortError";
    console.error("[AI Chat] Gemini fetch error:", err);
    return {
      text: null,
      error: isTimeout ? "Request timeout" : "Network error",
    };
  }
}

// ─────────────────────────────────────────────────────────────
//  🎯 POST HANDLER
//  ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  // ─── 1. IP-ის მიღება ───
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  // ─── 2. Rate limit check ───
  const rate = checkRateLimit(ip);
  if (!rate.allowed) {
    return NextResponse.json(
      {
        success: false,
        reply:
          "ძალიან ბევრი შეტყობინება. გთხოვ დაიცადე ცოტა ხანი. ⏱️",
        error: "Rate limit exceeded",
        retryAfterMs: rate.resetIn,
      },
      {
        status: 429,
        headers: {
          "Retry-After": Math.ceil(rate.resetIn / 1000).toString(),
        },
      }
    );
  }

  // ─── 3. Body-ს წაკითხვა ───
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, reply: "Invalid request", error: "JSON parse failed" },
      { status: 400 }
    );
  }

  // ─── 4. Validation ───
  const validation = validateRequest(body);
  if (!validation.valid || !validation.data) {
    return NextResponse.json(
      {
        success: false,
        reply: validation.error ?? "Invalid request",
        error: validation.error,
      },
      { status: 400 }
    );
  }

  const { message, locale = "ka", history = [] } = validation.data;

  // ─── 5. სწრაფი შემოწმება — სპორტის თემაა? ───
  // (თუ არა, მაინც Gemini-ს ვაცდით, მაგრამ fallback-ი მზადაა)
  const sportsRelated = isSportsRelated(message);

  // ─── 6. კონტექსტის აგება ───
  let context;
  try {
    context = await buildAIContext(locale);
  } catch (err) {
    console.error("[AI Chat] Context build error:", err);
    context = null;
  }

  // ─── 7. System prompt ───
  let systemPrompt: string;
  if (context) {
    systemPrompt = buildSystemPrompt(context, locale);
  } else {
    // Fallback — მინიმალური prompt
    systemPrompt = `You are SportVerge AI — a friendly sports expert. Answer in ${locale}. Be brief (2-4 sentences). Use **bold** for numbers. Only discuss sports.`;
  }

  // ─── 8. თუ აშკარად არ არის სპორტის თემა — fallback ───
  if (!sportsRelated && message.length > 5) {
    // მაინც ვცდით Gemini-ს, მაგრამ ვაფრთხილებთ
    console.log("[AI Chat] Possible off-topic message:", message.slice(0, 80));
  }

  // ─── 9. Gemini-ს გამოძახება ───
  const { text, error } = await callGemini(systemPrompt, history, message);

  // ─── 10. Fallback თუ Gemini ვერ იმუშავა ───
  if (!text) {
    console.warn("[AI Chat] Gemini failed, using fallback:", error);

    const fallbackReply = getFallback(locale);

    return NextResponse.json(
      {
        success: false,
        reply: fallbackReply,
        provider: "fallback",
        error,
        durationMs: Date.now() - startTime,
      },
      {
        status: 200, // 200, რომ UI-ზე ჩვეულებრივად გამოჩნდეს
        headers: {
          "X-RateLimit-Remaining": rate.remaining.toString(),
        },
      }
    );
  }

  // ─── 11. წარმატებული პასუხი ───
  return NextResponse.json(
    {
      success: true,
      reply: text,
      provider: "gemini",
      durationMs: Date.now() - startTime,
    },
    {
      status: 200,
      headers: {
        "X-RateLimit-Remaining": rate.remaining.toString(),
        "Cache-Control": "no-store",
      },
    }
  );
}

// ─────────────────────────────────────────────────────────────
//  🔍 GET — Health Check
//  ─────────────────────────────────────────────────────────────

export async function GET() {
  const hasKey = !!GEMINI_API_KEY;

  return NextResponse.json({
    status: "ok",
    endpoint: "/api/ai/chat",
    method: "POST",
    geminiConfigured: hasKey,
    rateLimitPerMinute: RATE_LIMIT_MAX,
    maxMessageLength: MAX_MESSAGE_LENGTH,
    maxHistoryLength: MAX_HISTORY_LENGTH,
    usage: {
      body: {
        message: "string (required)",
        locale: "ka | en | ru (optional, default: ka)",
        history: "Array<{role, content}> (optional)",
      },
    },
  });
}