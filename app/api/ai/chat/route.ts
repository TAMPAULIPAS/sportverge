// ═══════════════════════════════════════════════════════════════
//  SportVerge — AI Chat API (Groq primary)
// ═══════════════════════════════════════════════════════════════

import { NextResponse, type NextRequest } from "next/server";
import { groqChat } from "@/lib/ai/groq";

const POLLINATIONS_URL = "https://text.pollinations.ai/openai";

async function callPollinations(
  systemPrompt: string,
  userMessage: string,
  history: Array<{ role: string; content: string }>
): Promise<string | null> {
  try {
    const messages = [
      { role: "system", content: systemPrompt },
      ...history.slice(-6).map((h) => ({
        role: h.role === "user" ? "user" : "assistant",
        content: h.content,
      })),
      { role: "user", content: userMessage },
    ];

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 25000);

    const res = await fetch(POLLINATIONS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "openai",
        messages,
        temperature: 0.7,
        max_tokens: 600,
      }),
      signal: controller.signal,
    });

    clearTimeout(timer);
    if (!res.ok) return null;

    const data = await res.json();
    return data?.choices?.[0]?.message?.content?.trim() || null;
  } catch {
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

    const systemPrompt = `You are SportVerge AI — a friendly sports expert. Respond ONLY in ${langName}. Keep answers short (2-4 sentences). Use **bold** for numbers. Only discuss sports.`;

    const history = (Array.isArray(body.history) ? body.history : []).slice(-8) as Array<{
      role: string;
      content: string;
    }>;

    let reply = await groqChat({
      systemPrompt,
      userMessage: message,
      history,
      temperature: 0.7,
      maxTokens: 600,
    });
    let provider = "groq";

    if (!reply) {
      reply = await callPollinations(systemPrompt, message, history);
      provider = "pollinations";
    }

    if (!reply) {
      return NextResponse.json({
        success: false,
        reply:
          locale === "ka"
            ? "AI დროებით მიუწვდომელია. სცადე ხელახლა."
            : locale === "ru"
            ? "AI временно недоступен."
            : "AI temporarily unavailable.",
        provider: "none",
        durationMs: Date.now() - startTime,
      });
    }

    return NextResponse.json({
      success: true,
      reply,
      provider,
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
    provider: "groq",
    groqConfigured: !!process.env.GROQ_API_KEY,
  });
}