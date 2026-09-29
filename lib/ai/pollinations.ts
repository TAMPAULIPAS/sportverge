// ═══════════════════════════════════════════════════════════════
//  SportVerge — Pollinations predictions (no key needed)
// ═══════════════════════════════════════════════════════════════

const POLLINATIONS_GET = "https://text.pollinations.ai";
const REFERRER = "sportverge.app";

export interface WinPrediction {
  homeWin: number;
  draw: number;
  awayWin: number;
  reason: string;
  confidence: "low" | "medium" | "high";
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
    h2h,
    locale = "ka",
  } = params;

  const langMap = { ka: "Georgian", en: "English", ru: "Russian" };
  const langName = langMap[locale];

  const prompt = `Sports prediction task. Respond ONLY in ${langName}.
Analyze: ${homeTeam} vs ${awayTeam} (${league}).
Home form: ${homeForm.join(",") || "?"}. Away form: ${awayForm.join(",") || "?"}.
Home goals avg: ${homeGoalsAvg ?? "?"}. Away: ${awayGoalsAvg ?? "?"}.
Return ONLY JSON: {"homeWin":45,"draw":30,"awayWin":25,"reason":"2 sentences in ${langName}","confidence":"medium"}`;

  try {
    const url = `${POLLINATIONS_GET}/${encodeURIComponent(prompt)}?model=openai&referrer=${REFERRER}&json=true&seed=${Date.now()}`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 25000);

    const res = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      headers: { "User-Agent": "SportVerge/1.0" },
    });

    clearTimeout(timer);

    if (!res.ok) {
      console.warn(`[Pollinations Predict] ${res.status}`);
      return null;
    }

    let text = await res.text();
    if (!text) return null;

    // Cleanup
    text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");

    // Extract JSON
    const first = text.indexOf("{");
    const last = text.lastIndexOf("}");
    if (first !== -1 && last > first) {
      text = text.slice(first, last + 1);
    }

    const parsed = JSON.parse(text) as WinPrediction;

    if (
      typeof parsed.homeWin !== "number" ||
      typeof parsed.draw !== "number" ||
      typeof parsed.awayWin !== "number"
    ) {
      return null;
    }

    // Normalize to 100
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
    console.warn("[Pollinations Predict] error:", err);
    return null;
  }
}