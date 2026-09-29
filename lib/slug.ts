// ═══════════════════════════════════════════════════════════════
//  SportVerge — Slug Utilities
//  ─────────────────────────────────────────────────────────────
//  🎯 დანიშნულება:
//     - ტექსტის URL-friendly slug-ად გარდაქმნა
//     - ქართული, ინგლისური და რუსული სიმბოლოების მხარდაჭერა
//     - უნიკალური slug-ების გენერაცია (timestamp-ით)
//     - slug-იდან ტექსტის აღდგენა (title case)
//
//  📌 გამოიყენე:
//     - News: /news/lionel-messi-joins-inter-miami
//     - Teams: /teams/barcelona
//     - Players: /players/kylian-mbappe
//     - Matches: /matches/barcelona-vs-real-madrid-2025-01-15
// ═══════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────
//  Constants
// ─────────────────────────────────────────────────────────────

/** Georgian → Latin transliteration map */
const GEORGIAN_MAP: Record<string, string> = {
  ა: "a", ბ: "b", გ: "g", დ: "d", ე: "e", ვ: "v", ზ: "z",
  თ: "t", ი: "i", კ: "k", ლ: "l", მ: "m", ნ: "n", ო: "o",
  პ: "p", ჟ: "zh", რ: "r", ს: "s", ტ: "t", უ: "u", ფ: "p",
  ქ: "k", ღ: "gh", ყ: "q", შ: "sh", ჩ: "ch", ც: "ts", ძ: "dz",
  წ: "ts", ჭ: "ch", ხ: "kh", ჯ: "j", ჰ: "h",
};

/** Russian → Latin transliteration map */
const RUSSIAN_MAP: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo",
  ж: "zh", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m",
  н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u",
  ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh", щ: "shch",
  ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
};

/** ცნობილი ქართული ფეხბურთელების სახელები (transliteration override) */
const GEORGIAN_OVERRIDES: Record<string, string> = {
  "ხვიჩა კვარაცხელია": "khvicha-kvaratskhelia",
  "გიორგი მამარდაშვილი": "giorgi-mamardashvili",
  "ხვიჩა": "khvicha",
  "კვარაცხელია": "kvaratskhelia",
};

// ─────────────────────────────────────────────────────────────
//  Core: slugify()
//  ─────────────────────────────────────────────────────────────

/**
 * გარდაქმნის ტექსტს URL-friendly slug-ად.
 * მუშაობს ქართულ, ინგლისურ და რუსულ ტექსტთან.
 *
 * @example
 * slugify("ხვიჩა კვარაცხელია")      // → "khvicha-kvaratskhelia"
 * slugify("Lionel Messi Scores!")    // → "lionel-messi-scores"
 * slugify("Реал Мадрид")             // → "real-madrid"
 * slugify("  Hello   World  ")        // → "hello-world"
 */
export function slugify(text: string): string {
  if (!text || typeof text !== "string") return "";

  const trimmed = text.trim();

  // ─── 1. override-ების შემოწმება (ზუსტი match) ───
  const lowerTrimmed = trimmed.toLowerCase();
  if (GEORGIAN_OVERRIDES[lowerTrimmed]) {
    return GEORGIAN_OVERRIDES[lowerTrimmed];
  }

  // ─── 2. Georgian → Latin ───
  let result = "";
  for (const char of trimmed) {
    const lower = char.toLowerCase();
    if (GEORGIAN_MAP[lower]) {
      result += GEORGIAN_MAP[lower];
    } else if (RUSSIAN_MAP[lower]) {
      result += RUSSIAN_MAP[lower];
    } else {
      result += char;
    }
  }

  // ─── 3. Normalize & cleanup ───
  return result
    .normalize("NFD") // Unicode decompose
    .replace(/[\u0300-\u036f]/g, "") // remove diacritics (é → e)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // remove special chars
    .replace(/\s+/g, "-") // spaces → dashes
    .replace(/-+/g, "-") // multiple dashes → single
    .replace(/^-|-$/g, ""); // trim dashes
}

// ─────────────────────────────────────────────────────────────
//  Unique slug generator
//  ─────────────────────────────────────────────────────────────

/**
 * აგენერირებს უნიკალურ slug-ს timestamp-ის suffix-ით.
 * გამოიყენე როცა ერთიდაიგივე სათაურით სტატია შეიძლება ჰქონდეს.
 *
 * @example
 * generateUniqueSlug("Barcelona Wins")     // → "barcelona-wins-lx8k2a"
 * generateUniqueSlug("Barcelona Wins", 6)  // → "barcelona-wins-a3f9c2"
 */
export function generateUniqueSlug(text: string, suffixLength = 6): string {
  const base = slugify(text);
  const suffix = Math.random()
    .toString(36)
    .substring(2, 2 + suffixLength);
  return `${base}-${suffix}`;
}

/**
 * ამატებს თარიღს slug-ს (match-ებისთვის იდეალურია).
 *
 * @example
 * slugifyWithDate("Barcelona vs Real Madrid", new Date("2025-01-15"))
 * // → "barcelona-vs-real-madrid-2025-01-15"
 */
export function slugifyWithDate(text: string, date: Date): string {
  const base = slugify(text);
  const iso = date.toISOString().split("T")[0]; // "2025-01-15"
  return `${base}-${iso}`;
}

// ─────────────────────────────────────────────────────────────
//  Reverse: slug → text
//  ─────────────────────────────────────────────────────────────

/**
 * slug-იდან კითხვადი სათაური (Title Case).
 * ⚠️ ეს არ არის ზუსტი reverse — ტრანსლიტერაცია შეუქცევადია.
 * გამოიყენე მხოლოდ breadcrumbs-ისთვის, არა მონაცემთა აღსადგენად.
 *
 * @example
 * deslugify("barcelona-vs-real-madrid-2025-01-15")
 * // → "Barcelona Vs Real Madrid 2025 01 15"
 */
export function deslugify(slug: string): string {
  if (!slug) return "";

  return slug
    .replace(/-/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

// ─────────────────────────────────────────────────────────────
//  Validation & Helpers
//  ─────────────────────────────────────────────────────────────

/**
 * ამოწმებს ვალიდური slug-ია თუ არა.
 *
 * @example
 * isValidSlug("barcelona-vs-real-madrid")  // → true
 * isValidSlug("Barcelona VS Real!")        // → false
 */
export function isValidSlug(slug: string): boolean {
  if (!slug || typeof slug !== "string") return false;
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

/**
 * წყვეტს slug-ს ნაწილებად.
 * გამოიყენე filter-ებისთვის ან SEO metadata-სთვის.
 *
 * @example
 * splitSlug("barcelona-vs-real-madrid-2025-01-15")
 * // → ["barcelona", "vs", "real", "madrid", "2025", "01", "15"]
 */
export function splitSlug(slug: string): string[] {
  if (!slug) return [];
  return slug.split("-").filter(Boolean);
}

/**
 * Match slug-ის გენერაცია ორი გუნდის სახელიდან.
 *
 * @example
 * matchSlug("Barcelona", "Real Madrid", new Date("2025-01-15"))
 * // → "barcelona-vs-real-madrid-2025-01-15"
 */
export function matchSlug(
  homeTeam: string,
  awayTeam: string,
  date: Date
): string {
  const base = `${slugify(homeTeam)}-vs-${slugify(awayTeam)}`;
  const iso = date.toISOString().split("T")[0];
  return `${base}-${iso}`;
}

/**
 * Player slug — სახელი + გვარი.
 *
 * @example
 * playerSlug("Lionel", "Messi")  // → "lionel-messi"
 */
export function playerSlug(firstName: string, lastName: string): string {
  return slugify(`${firstName} ${lastName}`);
}

/**
 * Team slug — ქალაქი + კლუბი.
 *
 * @example
 * teamSlug("FC", "Barcelona")  // → "fc-barcelona"
 */
export function teamSlug(...parts: string[]): string {
  return slugify(parts.filter(Boolean).join(" "));
}

// ─────────────────────────────────────────────────────────────
//  News Article Slug
//  ─────────────────────────────────────────────────────────────

/**
 * სიახლის სტატიის slug — სათაური + თარიღი.
 * გამოიყენე news-ისთვის რომ URL უნიკალური იყოს.
 *
 * @example
 * newsSlug("Messi Joins Inter Miami!", new Date("2025-01-15"))
 * // → "messi-joins-inter-miami-2025-01-15"
 */
export function newsSlug(title: string, date: Date): string {
  const maxLength = 60;
  let base = slugify(title);

  // truncate თუ ძალიან გრძელია
  if (base.length > maxLength) {
    base = base.substring(0, maxLength).replace(/-[^-]*$/, "");
  }

  const iso = date.toISOString().split("T")[0];
  return `${base}-${iso}`;
}// ─────────────────────────────────────────────────────────────
//  🔄 BACKWARDS COMPATIBILITY ALIASES
//  ─────────────────────────────────────────────────────────────

/**
 * Alias for newsSlug — backward compatibility.
 * თუ date არ მოგცემენ, მხოლოდ title-ს გამოიყენებს.
 */
export function articleSlug(
  titleOrArticle: string | { title: string; publishedAt?: string; published_at?: string },
  date?: Date
): string {
  // თუ ობიექტია
  if (typeof titleOrArticle === "object" && titleOrArticle !== null) {
    const title = titleOrArticle.title;
    const dateStr = titleOrArticle.publishedAt ?? titleOrArticle.published_at;
    const d = dateStr ? new Date(dateStr) : new Date();
    return newsSlug(title, d);
  }

  // თუ string-ია
  const d = date ?? new Date();
  return newsSlug(titleOrArticle, d);
}