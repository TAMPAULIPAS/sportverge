// ═══════════════════════════════════════════════════════════════
//  SportVerge — AI Predictions Chat (Inline)
//  ─────────────────────────────────────────────────────────────
//  🎯 Predictions გვერდისთვის ჩაშენებული AI ჩატი
//     - სავსე სექცია (არა modal)
//     - Quick-ask ღილაკები
//     - Inline input
//     - Message history
//     - Streaming typing effect
//
//  ✨ Features:
//     - Glassmorphism
//     - 4 quick questions (predictions-specific)
//     - Live chat with /api/ai/chat
//     - Auto-scroll
//     - Typing indicator
//     - Multi-language
//     - Mobile responsive
// ═══════════════════════════════════════════════════════════════

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Send,
  Bot,
  User,
  Loader2,
  AlertCircle,
  TrendingUp,
  Trophy,
  Target,
  Zap,
  RotateCcw,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
//  📐 TYPES
// ─────────────────────────────────────────────────────────────

type Locale = "ka" | "en" | "ru";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  error?: boolean;
}

interface AIPredictionsChatProps {
  locale: Locale;
  /** მატჩების რაოდენობა (optional — display-only) */
  matchCount?: number;
}

// ─────────────────────────────────────────────────────────────
//  🌍 TRANSLATIONS
// ─────────────────────────────────────────────────────────────

function getT(locale: Locale) {
  const isKa = locale === "ka";
  const isRu = locale === "ru";

  return {
    badge: isKa ? "AI POWERED" : isRu ? "НА БАЗЕ AI" : "AI POWERED",
    title: isKa
      ? "ჰკითხე AI-ს მატჩებზე"
      : isRu
      ? "Спроси AI о матчах"
      : "Ask AI about matches",
    subtitle: isKa
      ? "მიიღე მყისიერი პასუხი — ვინ იგებს, რა პროცენტი, რა შანსებია"
      : isRu
      ? "Получи мгновенный ответ — кто победит, какой процент, какие шансы"
      : "Get instant answers — who wins, what percentage, what are the odds",
    placeholder: isKa
      ? "დაწერე კითხვა მატჩზე..."
      : isRu
      ? "Напиши вопрос о матче..."
      : "Type your question about a match...",
    send: isKa ? "გაგზავნა" : isRu ? "Отправить" : "Send",
    greeting: isKa
      ? "გამარჯობა! 👋 მე ვარ SportVerge AI. მკითხე ნებისმიერ მატჩზე — ვინ იგებს, რა ალბათობით, რა შანსებია. მაგალითად: „ვინ იგებს ბარსელონა vs რეალი?“"
      : isRu
      ? "Привет! 👋 Я SportVerge AI. Спроси меня о любом матче — кто победит, с какой вероятностью, какие шансы. Например: «Кто победит Барселона vs Реал?»"
      : "Hi! 👋 I'm SportVerge AI. Ask me about any match — who wins, with what probability, what are the odds. For example: \"Who wins Barcelona vs Real Madrid?\"",
    quickTitle: isKa
      ? "სწრაფი კითხვები"
      : isRu
      ? "Быстрые вопросы"
      : "Quick questions",
    thinking: isKa ? "ვფიქრობ..." : isRu ? "Думаю..." : "Thinking...",
    error: isKa
      ? "ბოდიში, რაღაც შეცდომა მოხდა. სცადე ხელახლა."
      : isRu
      ? "Извини, произошла ошибка. Попробуй снова."
      : "Sorry, something went wrong. Try again.",
    clearChat: isKa
      ? "გასუფთავება"
      : isRu
      ? "Очистить"
      : "Clear",
    poweredBy: isKa
      ? "მუშაობს Gemini AI-ით"
      : isRu
      ? "Работает на Gemini AI"
      : "Powered by Gemini AI",
  };
}

// ─────────────────────────────────────────────────────────────
//  💡 QUICK QUESTIONS (Predictions-specific)
//  ─────────────────────────────────────────────────────────────

function getQuickQuestions(locale: Locale) {
  if (locale === "ka") {
    return [
      { icon: Trophy, text: "ვინ იგებს დღევანდელ მატჩებს?" },
      { icon: TrendingUp, text: "რომელი მატჩია ყველაზე საინტერესო?" },
      { icon: Target, text: "რა არის AI პროგნოზი ბარსელონაზე?" },
      { icon: Zap, text: "მაჩვენე მაღალი ალბათობის მატჩები" },
    ];
  }
  if (locale === "ru") {
    return [
      { icon: Trophy, text: "Кто победит в сегодняшних матчах?" },
      { icon: TrendingUp, text: "Какой матч самый интересный?" },
      { icon: Target, text: "Какой прогноз AI на Барселону?" },
      { icon: Zap, text: "Покажи матчи с высокой вероятностью" },
    ];
  }
  return [
    { icon: Trophy, text: "Who wins today's matches?" },
    { icon: TrendingUp, text: "Which match is most interesting?" },
    { icon: Target, text: "What's the AI prediction for Barcelona?" },
    { icon: Zap, text: "Show me high-probability matches" },
  ];
}

// ─────────────────────────────────────────────────────────────
//  🎨 HELPERS
//  ─────────────────────────────────────────────────────────────

function formatContent(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-bold text-lime">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

// ─────────────────────────────────────────────────────────────
//  💬 MESSAGE BUBBLE
//  ─────────────────────────────────────────────────────────────

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      <div
        className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border ${
          isUser
            ? "bg-purple-500/20 border-purple-400/40"
            : message.error
            ? "bg-red-500/10 border-red-500/30"
            : "bg-gradient-to-br from-amber-400/25 to-purple-500/25 border-amber-400/40"
        }`}
      >
        {isUser ? (
          <User size={14} className="text-purple-300" />
        ) : message.error ? (
          <AlertCircle size={14} className="text-red-400" />
        ) : (
          <Bot size={14} className="text-amber-300" />
        )}
      </div>

      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-gradient-to-br from-amber-400 to-amber-500 text-ink font-medium rounded-tr-sm"
            : message.error
            ? "bg-red-500/10 border border-red-500/30 text-red-300 rounded-tl-sm"
            : "bg-[#0F0A1F]/80 backdrop-blur-xl border border-purple-500/30 text-purple-50 rounded-tl-sm"
        }`}
      >
        <div className="whitespace-pre-wrap break-words">
          {formatContent(message.content)}
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
//  ⌨️ TYPING INDICATOR
//  ─────────────────────────────────────────────────────────────

function TypingIndicator({ label }: { label: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex gap-2.5"
    >
      <div className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border bg-gradient-to-br from-amber-400/25 to-purple-500/25 border-amber-400/40">
        <Bot size={14} className="text-amber-300" />
      </div>
      <div className="bg-[#0F0A1F]/80 backdrop-blur-xl border border-purple-500/30 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
        <Loader2 size={14} className="text-amber-300 animate-spin" />
        <span className="text-xs text-purple-200/70">{label}</span>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
//  🎯 MAIN COMPONENT
// ─────────────────────────────────────────────────────────────

export function AIPredictionsChat({ locale, matchCount }: AIPredictionsChatProps) {
  const t = getT(locale);
  const quick = getQuickQuestions(locale);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // ─── Auto-scroll ───
  useEffect(() => {
    if (messages.length > 0 || isLoading) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [messages, isLoading]);

  // ─── Send message ───
  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      const userMessage: Message = {
        id: `u-${Date.now()}`,
        role: "user",
        content: trimmed,
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setIsLoading(true);

      try {
        const history = messages.slice(-10).map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: trimmed,
            locale,
            history,
          }),
        });

        const data = await res.json();

        setMessages((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            role: "assistant",
            content: data.reply || t.error,
            error: !data.success,
          },
        ]);
      } catch (err) {
        console.error("[AIPredictionsChat] Error:", err);
        setMessages((prev) => [
          ...prev,
          {
            id: `a-err-${Date.now()}`,
            role: "assistant",
            content: t.error,
            error: true,
          },
        ]);
      } finally {
        setIsLoading(false);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    },
    [isLoading, messages, locale, t.error]
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  function clearChat() {
    setMessages([]);
    setInput("");
  }

  const hasMessages = messages.length > 0;

  return (
    <section
      className="relative overflow-hidden rounded-3xl border border-purple-500/30 bg-gradient-to-br from-amber-400/5 via-transparent to-purple-500/10 mb-14"
      aria-label={t.title}
    >
      {/* ═══ Ambient glows ═══ */}
      <div className="absolute -top-32 -left-32 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* ═══ Top gradient line ═══ */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />

      <div className="relative z-10 p-5 lg:p-7">
        {/* ═══ HEADER ═══ */}
        <header className="flex items-start justify-between gap-4 mb-5 flex-wrap">
          <div className="flex items-start gap-3 min-w-0">
            <div className="relative shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-purple-500 flex items-center justify-center shadow-[0_0_30px_rgba(251,191,36,0.5)]">
              <Sparkles size={22} className="text-white" />
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-300 border-2 border-[#0F0A1F] animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold text-amber-300 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse" />
                {t.badge}
              </div>
              <h2 className="font-heading text-xl lg:text-2xl xl:text-3xl font-black text-purple-50 leading-tight">
                {t.title}
              </h2>
              <p className="mt-1 text-xs lg:text-sm text-purple-200/70 max-w-2xl">
                {t.subtitle}
              </p>
            </div>
          </div>

          {hasMessages && (
            <button
              onClick={clearChat}
              className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase tracking-widest text-purple-200/60 hover:text-amber-300 rounded-lg hover:bg-purple-500/10 border border-transparent hover:border-purple-500/30 transition-all"
              aria-label={t.clearChat}
            >
              <RotateCcw size={11} />
              {t.clearChat}
            </button>
          )}
        </header>

        {/* ═══ MESSAGES AREA ═══ */}
        <div className="relative max-h-[420px] overflow-y-auto -mx-2 px-2 mb-4 scrollbar-thin">
          {/* Greeting */}
          {!hasMessages && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="flex gap-2.5">
                <div className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border bg-gradient-to-br from-amber-400/25 to-purple-500/25 border-amber-400/40">
                  <Bot size={14} className="text-amber-300" />
                </div>
                <div className="bg-[#0F0A1F]/80 backdrop-blur-xl border border-purple-500/30 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-purple-50 leading-relaxed max-w-[85%]">
                  {t.greeting}
                </div>
              </div>
            </motion.div>
          )}

          {/* Messages */}
          {hasMessages && (
            <div className="space-y-3">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              {isLoading && <TypingIndicator label={t.thinking} />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* ═══ QUICK QUESTIONS ═══ */}
        {!hasMessages && (
          <div className="mb-4">
            <div className="text-[10px] uppercase tracking-widest text-amber-300/80 font-bold mb-2.5 flex items-center gap-1.5">
              <Zap size={10} />
              {t.quickTitle}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {quick.map((q, i) => {
                const Icon = q.icon;
                return (
                  <motion.button
                    key={q.text}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * i }}
                    onClick={() => sendMessage(q.text)}
                    disabled={isLoading}
                    className="group flex items-center gap-2.5 text-left px-3.5 py-2.5 rounded-xl bg-purple-500/5 hover:bg-purple-500/15 border border-purple-500/20 hover:border-amber-400/40 text-xs lg:text-sm text-purple-100/80 hover:text-purple-50 transition-all disabled:opacity-50"
                  >
                    <div className="shrink-0 w-6 h-6 rounded-md bg-amber-400/10 border border-amber-400/30 flex items-center justify-center group-hover:bg-amber-400/20 transition-colors">
                      <Icon size={11} className="text-amber-300" />
                    </div>
                    <span className="line-clamp-2">{q.text}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══ INPUT ═══ */}
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative flex items-end gap-2 bg-[#0F0A1F]/60 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-1.5 focus-within:border-amber-400/50 transition-colors">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height =
                  Math.min(e.target.scrollHeight, 100) + "px";
              }}
              onKeyDown={handleKeyDown}
              placeholder={t.placeholder}
              rows={1}
              disabled={isLoading}
              className="flex-1 bg-transparent text-sm text-purple-50 placeholder:text-purple-200/40 px-3 py-2.5 resize-none outline-none max-h-[100px] disabled:opacity-50 scrollbar-thin"
              maxLength={1000}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 text-ink flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(251,191,36,0.6)] transition-all"
              aria-label={t.send}
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
            </button>
          </div>

          <div className="mt-2 flex items-center justify-between text-[10px] text-purple-200/40">
            <span className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-amber-300 animate-pulse" />
              {t.poweredBy}
            </span>
            {matchCount !== undefined && matchCount > 0 && (
              <span className="font-mono">
                {matchCount} matches loaded
              </span>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}

export default AIPredictionsChat;