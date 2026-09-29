// ═══════════════════════════════════════════════════════════════
//  /api/translate — ტექსტის თარგმნის API (Google Gemini)
//  POST /api/translate
//  Body: { text: string } | { items: Record<string, string> }
//  Query: ?targetLocale=ka|en|ru
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server';
import { translateText, translateBatch } from '@/lib/api/gemini';
import { locales, type Locale } from '@/i18n';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// ═══════════════════════════════════════════════════════════════
//  VALIDATION
// ═══════════════════════════════════════════════════════════════

function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

// ═══════════════════════════════════════════════════════════════
//  POST /api/translate
// ═══════════════════════════════════════════════════════════════
export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const targetLocale = searchParams.get('targetLocale') || 'en';

    // ─── ვალიდაცია ───
    if (!isValidLocale(targetLocale)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid targetLocale. Must be one of: ${locales.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // ─── Body-ს წაკითხვა ───
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    const { text, items } = body;

    // ═══════════════════════════════════════════════════════════
    //  CASE 1: ერთი ტექსტის თარგმნა
    // ═══════════════════════════════════════════════════════════
    if (text && typeof text === 'string') {
      // ─── სიგრძის ლიმიტი ───
      if (text.length > 5000) {
        return NextResponse.json(
          {
            success: false,
            error: 'Text too long. Maximum 5000 characters.',
          },
          { status: 400 }
        );
      }

      if (text.trim().length === 0) {
        return NextResponse.json(
          { success: false, error: 'Text is empty' },
          { status: 400 }
        );
      }

      // ─── თარგმნა ───
      const translated = await translateText(text, targetLocale);

      if (!translated) {
        return NextResponse.json(
          {
            success: false,
            error: 'Translation failed. Check GEMINI_API_KEY.',
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        mode: 'single',
        original: text,
        translated,
        targetLocale,
        timestamp: new Date().toISOString(),
      });
    }

    // ═══════════════════════════════════════════════════════════
    //  CASE 2: ბეჩ თარგმნა (ობიექტი)
    // ═══════════════════════════════════════════════════════════
    if (items && typeof items === 'object' && !Array.isArray(items)) {
      // ─── ვალიდაცია ───
      const keys = Object.keys(items);
      if (keys.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Items object is empty' },
          { status: 400 }
        );
      }

      if (keys.length > 100) {
        return NextResponse.json(
          {
            success: false,
            error: 'Too many items. Maximum 100 per request.',
          },
          { status: 400 }
        );
      }

      // ─── ყველა მნიშვნელობა string უნდა იყოს ───
      const invalidKey = keys.find((k) => typeof items[k] !== 'string');
      if (invalidKey) {
        return NextResponse.json(
          {
            success: false,
            error: `Value for key "${invalidKey}" is not a string`,
          },
          { status: 400 }
        );
      }

      // ─── თარგმნა ───
      const translated = await translateBatch(items, targetLocale);

      if (!translated) {
        return NextResponse.json(
          {
            success: false,
            error: 'Batch translation failed. Check GEMINI_API_KEY.',
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        mode: 'batch',
        original: items,
        translated,
        targetLocale,
        count: keys.length,
        timestamp: new Date().toISOString(),
      });
    }

    // ═══════════════════════════════════════════════════════════
    //  CASE 3: არასწორი მოთხოვნა
    // ═══════════════════════════════════════════════════════════
    return NextResponse.json(
      {
        success: false,
        error: 'Provide either "text" (string) or "items" (object) in the body',
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('[/api/translate] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Translation service error',
      },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════════════════
//  GET /api/translate — სტატუსის შემოწმება
// ═══════════════════════════════════════════════════════════════
export async function GET() {
  const hasApiKey = !!process.env.GEMINI_API_KEY;

  return NextResponse.json({
    success: true,
    service: 'translate',
    available: hasApiKey,
    message: hasApiKey
      ? 'Translation service ready'
      : 'GEMINI_API_KEY not configured. Service will fail.',
    supportedLocales: locales,
    endpoints: {
      single: 'POST /api/translate?targetLocale=en  Body: { text }',
      batch: 'POST /api/translate?targetLocale=en  Body: { items }',
    },
    timestamp: new Date().toISOString(),
  });
}