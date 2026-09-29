// ═══════════════════════════════════════════════════════════════
//  SportVerge — Groq AI Client
//  🚀 Fast, free, stable AI provider
//  🔑 Requires GROQ_API_KEY (free from console.groq.com)
// ═══════════════════════════════════════════════════════════════

const GROQ_API_KEY = process.env.GROQ_API_KEY ?? "";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

export interface WinPrediction {
  homeWin: number;
  draw: number;
  awayWin: number;
  reason: string;
  confidence: "low" | "medium" | "high";
}

export async function groqChat(params: {
  systemPrompt: string;
  userMessage: string;
  history?: Array<{ role: string; content: string }>;
  temperature?: number;
  maxTokens?: number;
}): Promise<string | null> {
  if (!GROQ_API_KEY) {
    console.warn("[Groq] GROQ_API_KEY not configured");
    return null;
  }

  try {
    const messages = [
      { role: "system", content: params.systemPrompt },
      ...(params.history ?? []).slice(-8).map((h) => ({
        role: h.role === "user" ? "user" : "assistant",
        content: h.content,
      })),
      { role: "user", content: params.userMessage },
    ];

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);

    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages,
        temperature: params.temperature ?? 0.7,
        max_tokens: params.maxTokens ?? 600,
      }),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.warn(`[Groq] ${res.status}: ${errText.slice(0, 200)}`);
      return null;
    }

    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content?.trim();
    return text || null;
  } catch (err) {
    console.warn("[Groq] error:", err);
    return null;
  }
}

export async function predictMatchOutcome(params: {
  homeTeam: string;
  awayTeam: string;
  league: string;
  homeForm?: string[];
  awayForm?: string[];
  homeGoalsAvg?: number;
  awayGoalsAvg?: number;
  h2h?: string;
  locale?: "ka" | "en" | "ru";
}): Promise<WinPrediction | null> {
  const {
    homeTeam,
    awayTeam,
    league,
    homeForm = [],
    awayForm = [],
    homeGoalsAvg,
    awayGoalsAvg,
    locale = "ka",
  } = params;

  const langMap = { ka: "Georgian", en: "English", ru: "Russian" };
  const langName = langMap[locale];

  const prompt = `Analyze: ${homeTeam} vs ${awayTeam} (${league}).
Home form: ${homeForm.join(",") || "?"}. Away form: ${awayForm.join(",") || "?"}.
Home goals avg: ${homeGoalsAvg ?? "?"}. Away: ${awayGoalsAvg ?? "?"}.
Return ONLY JSON: {"homeWin":45,"draw":30,"awayWin":25,"reason":"2 sentences in ${langName}","confidence":"medium"}`;

  const result = await groqChat({
    systemPrompt: `You are a sports analyst. Respond in ${langName}. Return valid JSON only, no markdown.`,
    userMessage: prompt,
    temperature: 0.4,
    maxTokens: 400,
  });

  if (!result) return null;

  try {
    const cleaned = result.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
    const first = cleaned.indexOf("{");
    const last = cleaned.lastIndexOf("}");
    const jsonStr = first !== -1 && last > first ? cleaned.slice(first, last + 1) : cleaned;

    const parsed = JSON.parse(jsonStr) as WinPrediction;

    if (
      typeof parsed.homeWin !== "number" ||
      typeof parsed.draw !== "number" ||
      typeof parsed.awayWin !== "number"
    ) {
      return null;
    }

    const total = parsed.homeWin + parsed.draw + parsed.awayWin;
    if (total !== 100 && total > 0) {
      parsed.homeWin = Math.round((parsed.homeWin / total) * 100);
      parsed.draw = Math.round((parsed.draw / total) * 100);
      parsed.awayWin = 100 - parsed.homeWin - parsed.draw;
    }

    if (!["low", "medium", "high"].includes(parsed.confidence)) {
      parsed.confidence = "medium";
    }

    return parsed;
  } catch (err) {
    console.warn("[Groq] JSON parse error:", err);
    return null;
  }
}