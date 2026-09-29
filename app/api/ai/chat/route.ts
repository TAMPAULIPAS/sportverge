// ═══════════════════════════════════════════════════════════════
//  SportVerge — AI Chat API (Pollinations ONLY)
//  No Gemini, no API keys needed
// ═══════════════════════════════════════════════════════════════

import { NextResponse, type NextRequest } from "next/server";

const POLLINATIONS_GET = "https://text.pollinations.ai";
const REFERRER = "sportverge.app";

async function callPollinations(
  systemPrompt: string,
  userMessage: string,
  history: Array<{ role: string; content: string }>
): Promise<string | null> {
  try {
    const historyText = history
      .slice(-6)
      .map((h) => `${h.role === "user" ? "User" : "Assistant"}: ${h.content}`)
      .join("\n");

    const fullPrompt = `${systemPrompt}\n\n${historyText ? historyText + "\n" : ""}User: ${userMessage}\nAssistant:`;

    const url = `${POLLINATIONS_GET}/${encodeURIComponent(fullPrompt)}?model=openai&referrer=${REFERRER}&seed=${Date.now()}`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 25000);

    const res = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      headers: { "User-Agent": "SportVerge/1.0" },
    });

    clearTimeout(timer);

    if (!res.ok) {
      console.warn(`[Pollinations] ${res.status}`);
      return null;
    }

    const text = await res.text();
    if (!text || text.length < 2) return null;

    return text
      .replace(/^(Assistant:|AI:)\s*/i, "")
      .replace(/^["']|["']$/g, "")
      .trim();
  } catch (err) {
    console.warn("[Pollinations] error:", err);
    return null;
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    let body: { message?: string; locale?: string; history?: unknown[] };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, reply: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const message = String(body.message ?? "").trim();
    const locale = (body.locale === "en" || body.locale === "ru" ? body.locale : "ka") as
      | "ka"
      | "en"
      | "ru";

    if (!message) {
      return NextResponse.json(
        { success: false, reply: "Message is required" },
        { status: 400 }
      );
    }

    const langMap = {
      ka: "Georgian (ქართული)",
      en: "English",
      ru: "Russian (русский)",
    };
    const langName = langMap[locale];

    const systemPrompt = `You are SportVerge AI — a friendly sports expert. Respond ONLY in ${langName}. Keep answers short (2-4 sentences). Use **bold** for numbers. Only discuss sports (football, basketball, tennis, F1, UFC, matches, scores, predictions). Never recommend betting.`;

    const history = (Array.isArray(body.history) ? body.history : []).slice(-8) as Array<{
      role: string;
      content: string;
    }>;

    const reply = await callPollinations(systemPrompt, message, history);

    if (!reply) {
      return NextResponse.json({
        success: false,
        reply:
          locale === "ka"
            ? "AI დროებით მიუწვდომელია. სცადე ხელახლა 10 წამში."
            : locale === "ru"
            ? "AI временно недоступен. Попробуй через 10 секунд."
            : "AI temporarily unavailable. Try again in 10 seconds.",
        provider: "none",
        durationMs: Date.now() - startTime,
      });
    }

    return NextResponse.json({
      success: true,
      reply,
      provider: "pollinations",
      durationMs: Date.now() - startTime,
    });
  } catch (err) {
    console.error("[AI Chat] Error:", err);
    return NextResponse.json({
      success: false,
      reply: "Server error",
      provider: "none",
      durationMs: Date.now() - startTime,
    });
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    provider: "pollinations (no key, unlimited)",
    geminiRemoved: true,
  });
}