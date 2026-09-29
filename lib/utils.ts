// ═══════════════════════════════════════════════════════════════
//  SportVerge — Utilities
//  ყველა დამხმარე ფუნქცია ერთ ადგილას
// ═══════════════════════════════════════════════════════════════

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ─────────────────────────────────────────────
// 1. Tailwind class merger
// ─────────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ═══════════════════════════════════════════════════════════════
//  DATE & TIME
// ═══════════════════════════════════════════════════════════════

export function timeAgo(
  date: string | Date,
  locale: 'ka' | 'en' | 'ru' = 'ka'
): string {
  const now = new Date();
  const past = typeof date === 'string' ? new Date(date) : date;
  const seconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  const labels = {
    ka: { now: 'ახლახან', min: 'წთ', hour: 'სთ', day: 'დღე', week: 'კვირა', month: 'თვე', year: 'წელი', ago: 'წინ' },
    en: { now: 'just now', min: 'm', hour: 'h', day: 'd', week: 'w', month: 'mo', year: 'y', ago: 'ago' },
    ru: { now: 'только что', min: 'мин', hour: 'ч', day: 'д', week: 'нед', month: 'мес', year: 'г', ago: 'назад' },
  }[locale] || { now: 'just now', min: 'm', hour: 'h', day: 'd', week: 'w', month: 'mo', year: 'y', ago: 'ago' };

  if (seconds < 30) return labels.now;
  if (seconds < 60) return `${seconds}${labels.min} ${labels.ago}`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}${labels.min} ${labels.ago}`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}${labels.hour} ${labels.ago}`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}${labels.day} ${labels.ago}`;
  if (seconds < 2592000) return `${Math.floor(seconds / 604800)}${labels.week} ${labels.ago}`;
  if (seconds < 31536000) return `${Math.floor(seconds / 2592000)}${labels.month} ${labels.ago}`;
  return `${Math.floor(seconds / 31536000)}${labels.year} ${labels.ago}`;
}

export function formatDate(
  date: string | Date,
  locale: 'ka' | 'en' | 'ru' = 'ka',
  options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const localeMap = { ka: 'ka-GE', en: 'en-US', ru: 'ru-RU' };
  return d.toLocaleDateString(localeMap[locale], options);
}

export function formatTime(
  date: string | Date,
  locale: 'ka' | 'en' | 'ru' = 'ka'
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const localeMap = { ka: 'ka-GE', en: 'en-US', ru: 'ru-RU' };
  return d.toLocaleTimeString(localeMap[locale], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateTime(
  date: string | Date,
  locale: 'ka' | 'en' | 'ru' = 'ka'
): string {
  return `${formatDate(date, locale)} • ${formatTime(date, locale)}`;
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export function daysBetween(date1: string | Date, date2: string | Date): number {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  const diff = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

// ═══════════════════════════════════════════════════════════════
//  NUMBERS
// ═══════════════════════════════════════════════════════════════

export function formatNumber(num: number): string {
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

export function formatPercent(value: number, decimals: number = 0): string {
  return `${value.toFixed(decimals)}%`;
}

export function roundTo(num: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
}

export function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// ═══════════════════════════════════════════════════════════════
//  STRINGS
// ═══════════════════════════════════════════════════════════════

export function truncate(text: string, length: number = 100): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + '...';
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function getInitials(name?: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

export function wordCount(text: string): number {
  return text.trim().split(/\s+/).length;
}

export function readingTime(text: string): number {
  return Math.max(1, Math.ceil(wordCount(text) / 200));
}

// ═══════════════════════════════════════════════════════════════
//  VALIDATION
// ═══════════════════════════════════════════════════════════════

export function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

// ═══════════════════════════════════════════════════════════════
//  ARRAYS
// ═══════════════════════════════════════════════════════════════

export function randomItem<T>(arr: T[]): T | undefined {
  if (arr.length === 0) return undefined;
  return arr[Math.floor(Math.random() * arr.length)];
}

export function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

export function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

export function groupBy<T, K extends string | number>(
  arr: T[],
  getKey: (item: T) => K
): Record<K, T[]> {
  return arr.reduce((acc, item) => {
    const key = getKey(item);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<K, T[]>);
}

// ═══════════════════════════════════════════════════════════════
//  OBJECTS
// ═══════════════════════════════════════════════════════════════

export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export function removeEmpty<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const result: Partial<T> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (!isEmpty(value)) {
      result[key as keyof T] = value as T[keyof T];
    }
  }
  return result;
}

// ═══════════════════════════════════════════════════════════════
//  COLORS
// ═══════════════════════════════════════════════════════════════

export function getColorFromString(str: string): string {
  const gradients = [
    'from-lime to-teal',
    'from-teal to-lime',
    'from-gold to-lime',
    'from-teal to-gold',
    'from-lime to-gold',
    'from-danger to-gold',
    'from-success to-teal',
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length];
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

// ═══════════════════════════════════════════════════════════════
//  PERFORMANCE
// ═══════════════════════════════════════════════════════════════

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ═══════════════════════════════════════════════════════════════
//  STORAGE (LocalStorage — SSR-safe)
// ═══════════════════════════════════════════════════════════════

export const storage = {
  get<T>(key: string, fallback?: T): T | null {
    if (typeof window === 'undefined') return fallback ?? null;
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : fallback ?? null;
    } catch {
      return fallback ?? null;
    }
  },

  set<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('localStorage set error:', e);
    }
  },

  remove(key: string): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(key);
    } catch (e) {
      console.error('localStorage remove error:', e);
    }
  },

  clear(): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.clear();
    } catch (e) {
      console.error('localStorage clear error:', e);
    }
  },
};

// ═══════════════════════════════════════════════════════════════
//  SPORTS HELPERS
// ═══════════════════════════════════════════════════════════════

export function getFormColor(result: 'W' | 'D' | 'L'): string {
  return {
    W: 'bg-success',
    D: 'bg-gold',
    L: 'bg-danger',
  }[result];
}

export function getFormLabel(result: 'W' | 'D' | 'L', locale: 'ka' | 'en' | 'ru' = 'ka'): string {
  const labels = {
    ka: { W: 'მოგება', D: 'ფრე', L: 'წაგება' },
    en: { W: 'Win', D: 'Draw', L: 'Loss' },
    ru: { W: 'Победа', D: 'Ничья', L: 'Поражение' },
  };
  return labels[locale][result];
}

export function formatScore(
  home: number | null,
  away: number | null
): string {
  if (home === null || away === null) return 'vs';
  return `${home} - ${away}`;
}

export function formatMinute(minute: number, extra?: number): string {
  if (extra) return `${minute}+${extra}'`;
  return `${minute}'`;
}

export function getStatusLabel(
  status: string,
  locale: 'ka' | 'en' | 'ru' = 'ka'
): string {
  const labels = {
    ka: { live: 'LIVE', halftime: 'HT', finished: 'FT', upcoming: 'მალე', postponed: 'გადაიდო' },
    en: { live: 'LIVE', halftime: 'HT', finished: 'FT', upcoming: 'Soon', postponed: 'PP' },
    ru: { live: 'LIVE', halftime: 'HT', finished: 'FT', upcoming: 'Скоро', postponed: 'Отложен' },
  };
  return labels[locale][status as keyof typeof labels.ka] || status;
}

// ═══════════════════════════════════════════════════════════════
//  MISC
// ═══════════════════════════════════════════════════════════════

export async function promisePool<T>(
  tasks: (() => Promise<T>)[],
  concurrency: number = 5
): Promise<T[]> {
  const results: T[] = [];
  const executing: Promise<void>[] = [];

  for (const task of tasks) {
    const p = task().then((res) => {
      results.push(res);
    });
    executing.push(p);

    if (executing.length >= concurrency) {
      await Promise.race(executing);
      executing.splice(
        executing.findIndex((e) => e === p),
        1
      );
    }
  }

  await Promise.all(executing);
  return results;
}

export function buildQuery(
  params: Record<string, string | number | boolean | undefined>
): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, String(value));
    }
  }
  return query.toString();
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}