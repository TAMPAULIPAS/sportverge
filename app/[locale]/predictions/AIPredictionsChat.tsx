// ═══════════════════════════════════════════════════════════════
//  SportVerge — AI Predictions Chat
//  ─────────────────────────────────────────────────────────────
//  🤖 ლამაზი, მინიმალისტური ჩატი predictions გვერდისთვის
//     - იგივე ფერები: surface/edge/lime/text
//     - იგივე სტილი როგორც MatchPredictionCard
// ═══════════════════════════════════════════════════════════════

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Send,
  Bot,
  User,
  Loader2,
  AlertCircle,
  RotateCcw,
} from "lucide-react";

type Locale = "ka" | "en" | "ru";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  error?: boolean;
}

interface Props {
  locale: Locale;
  matchCount?: number;
}

function getT(locale: Locale) {
  const isKa = locale === "ka";
  const isRu = locale === "ru";

  return {
    badge: isKa ? "AI POWERED" : isRu ? "НА БАЗЕ AI" : "AI POWERED",
    title: isKa
      ? "ჰკითხე AI-ს"
      : isRu
      ? "Спроси AI"
      : "Ask AI",
    subtitle: isKa
      ? "მიიღე მყისიერი პასუხი ნებისმიერ მატჩზე — ვინ იგებს, რა პროცენტი, რა შანსებია"
      : isRu
      ? "Получи мгновенный ответ о любом матче — кто победит, какой процент, какие шансы"
      : "Get instant answers on any match — who wins, what percentage, what are the odds",
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
    hint: isKa
      ? "AI პასუხობს რეალურ მონაცემებზე დაყრდნობით"
      : isRu
      ? "AI отвечает на основе реальных данных"
      : "AI answers based on real data",
    thinking: isKa ? "ვფიქრობ..." : isRu ? "Думаю..." : "Thinking...",
    error: isKa
      ? "ბოდიში, რაღაც შეცდომა მოხდა. სცადე ხელახლა."
      : isRu
      ? "Извини, произошла ошибка. Попробуй снова."
      : "Sorry, something went wrong. Try again.",
    clear: isKa ? "გასუფთავება" : isRu ? "Очистить" : "Clear",
    poweredBy: isKa
      ? "მუშაობს Gemini AI-ით"
      : isRu
      ? "Работает на Gemini AI"
      : "Powered by Gemini AI",
  };
}

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
            ? "bg-surface border-edge"
            : message.error
            ? "bg-red-500/10 border-red-500/30"
            : "bg-gradient-to-br from-lime/20 to-teal/20 border-lime/30"
        }`}
      >
        {isUser ? (
          <User size={14} className="text-muted" />
        ) : message.error ? (
          <AlertCircle size={14} className="text-red-400" />
        ) : (
          <Bot size={14} className="text-lime" />
        )}
      </div>

      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-lime text-ink font-medium rounded-tr-sm"
            : message.error
            ? "bg-red-500/10 border border-red-500/30 text-red-300 rounded-tl-sm"
            : "bg-surface/80 backdrop-blur-xl border border-edge text-text rounded-tl-sm"
        }`}
      >
        <div className="whitespace-pre-wrap break-words">
          {formatContent(message.content)}
        </div>
      </div>
    </motion.div>
  );
}

function TypingIndicator({ label }: { label: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-2.5"
    >
      <div className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border bg-gradient-to-br from-lime/20 to-teal/20 border-lime/30">
        <Bot size={14} className="text-lime" />
      </div>
      <div className="bg-surface/80 backdrop-blur-xl border border-edge rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
        <Loader2 size={14} className="text-lime animate-spin" />
        <span className="text-xs text-muted">{label}</span>
      </div>
    </motion.div>
  );
}

export function AIPredictionsChat({ locale, matchCount }: Props) {
  const t = getT(locale);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (messages.length > 0 || isLoading) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [messages, isLoading]);

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
          body: JSON.stringify({ message: trimmed, locale, history }),
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
        console.error("[AIPredictionsChat]", err);
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
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden bg-gradient-to-br from-surface/70 via-surface/40 to-surface/70 backdrop-blur-xl border border-edge/70 rounded-3xl"
      aria-label={t.title}
    >
      {/* ═══ Ambient glows ═══ */}
      <div className="absolute -top-32 -left-32 w-64 h-64 bg-lime/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-teal/10 rounded-full blur-3xl pointer-events-none" />

      {/* ═══ Top gradient line ═══ */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lime/60 to-transparent" />

      <div className="relative z-10 p-6 lg:p-8">
        {/* ═══ HEADER ═══ */}
        <header className="flex items-start justify-between gap-4 mb-6 flex-wrap">
          <div className="flex items-start gap-4 min-w-0">
            <div className="relative shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-lime to-teal flex items-center justify-center shadow-[0_0_30px_rgba(217,249,157,0.4)]">
              <Sparkles size={22} className="text-ink" />
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-lime border-2 border-[#0A0F1C] animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold text-lime mb-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse" />
                {t.badge}
              </div>
              <h2 className="font-heading text-xl lg:text-2xl xl:text-3xl font-black text-text leading-tight">
                {t.title}
              </h2>
              <p className="mt-1 text-xs lg:text-sm text-muted max-w-2xl">
                {t.subtitle}
              </p>
            </div>
          </div>

          {hasMessages && (
            <button
              onClick={clearChat}
              className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase tracking-widest text-muted hover:text-lime rounded-lg hover:bg-surface/50 border border-transparent hover:border-edge transition-all"
              aria-label={t.clear}
            >
              <RotateCcw size={11} />
              {t.clear}
            </button>
          )}
        </header>

        {/* ═══ MESSAGES ═══ */}
        <div className="relative max-h-[420px] overflow-y-auto -mx-2 px-2 mb-4">
          {!hasMessages && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="flex gap-2.5">
                <div className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border bg-gradient-to-br from-lime/20 to-teal/20 border-lime/30">
                  <Bot size={14} className="text-lime" />
                </div>
                <div className="bg-surface/80 backdrop-blur-xl border border-edge rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-text leading-relaxed max-w-[85%]">
                  {t.greeting}
                </div>
              </div>
              <div className="pl-11 text-[11px] text-muted/70 italic">
                💡 {t.hint}
              </div>
            </motion.div>
          )}

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

        {/* ═══ INPUT ═══ */}
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative flex items-end gap-2 bg-surface/60 backdrop-blur-xl border border-edge rounded-2xl p-1.5 focus-within:border-lime/40 transition-colors">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
              }}
              onKeyDown={handleKeyDown}
              placeholder={t.placeholder}
              rows={1}
              disabled={isLoading}
              className="flex-1 bg-transparent text-sm text-text placeholder:text-muted/60 px-3 py-2.5 resize-none outline-none max-h-[120px] disabled:opacity-50"
              maxLength={1000}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="shrink-0 w-10 h-10 rounded-xl bg-lime text-ink flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(217,249,157,0.5)] transition-all"
              aria-label={t.send}
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
            </button>
          </div>

          <div className="mt-2 flex items-center justify-between text-[10px] text-muted/60">
            <span className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-teal animate-pulse" />
              {t.poweredBy}
            </span>
            {matchCount !== undefined && matchCount > 0 && (
              <span className="font-mono">{matchCount} matches</span>
            )}
          </div>
        </form>
      </div>
    </motion.section>
  );
}

export default AIPredictionsChat;