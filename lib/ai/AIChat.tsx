// ═══════════════════════════════════════════════════════════════
//  SportVerge — AI Chat Component
//  ─────────────────────────────────────────────────────────────
//  🎯 Modal ფანჯარა AI ასისტენტთან სასაუბროდ
//
//  ✨ Features:
//     - Glassmorphism modal
//     - Message bubbles (user + AI)
//     - Live typing indicator
//     - Auto-scroll to latest
//     - Suggested questions (when empty)
//     - History (last 10 messages)
//     - Multi-language (ka/en/ru)
//     - Framer Motion animations
//     - ESC to close
//     - Focus trap
//     - Mobile responsive
// ═══════════════════════════════════════════════════════════════

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Loader2,
  AlertCircle,
  MessageSquare,
  Zap,
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

interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
  locale: Locale;
}

// ─────────────────────────────────────────────────────────────
//  🌍 TRANSLATIONS
// ─────────────────────────────────────────────────────────────

function getT(locale: Locale) {
  const isKa = locale === "ka";
  const isRu = locale === "ru";

  return {
    title: isKa ? "SportVerge AI" : isRu ? "SportVerge AI" : "SportVerge AI",
    subtitle: isKa
      ? "მეგობრული სპორტის ექსპერტი"
      : isRu
      ? "Дружелюбный эксперт по спорту"
      : "Friendly sports expert",
    placeholder: isKa
      ? "ჰკითხე მატჩებზე, პროგნოზებზე, ქულებზე..."
      : isRu
      ? "Спроси о матчах, прогнозах, счетах..."
      : "Ask about matches, predictions, scores...",
    send: isKa ? "გაგზავნა" : isRu ? "Отправить" : "Send",
    greeting: isKa
      ? "გამარჯობა! 👋 მე ვარ SportVerge AI. შემიძლია დაგეხმარო მატჩებზე, პროგნოზებზე ან საიტის ფუნქციებზე."
      : isRu
      ? "Привет! 👋 Я SportVerge AI. Помогу с матчами, прогнозами или функциями сайта."
      : "Hi! 👋 I'm SportVerge AI. I can help with matches, predictions, or site features.",
    suggestedTitle: isKa
      ? "სცადე ეს კითხვები:"
      : isRu
      ? "Попробуй эти вопросы:"
      : "Try these questions:",
    thinking: isKa ? "ვფიქრობ..." : isRu ? "Думаю..." : "Thinking...",
    error: isKa
      ? "ბოდიში, რაღაც შეცდომა მოხდა. სცადე ხელახლა."
      : isRu
      ? "Извини, произошла ошибка. Попробуй снова."
      : "Sorry, something went wrong. Try again.",
    clearChat: isKa ? "გასუფთავება" : isRu ? "Очистить" : "Clear",
    poweredBy: isKa
      ? "მუშაობს Gemini-ით"
      : isRu
      ? "Работает на Gemini"
      : "Powered by Gemini",
  };
}

// ─────────────────────────────────────────────────────────────
//  💡 SUGGESTED QUESTIONS
// ─────────────────────────────────────────────────────────────

function getSuggested(locale: Locale): string[] {
  if (locale === "ka") {
    return [
      "რა მატჩებია დღეს?",
      "ვინ იგებს ბარსელონა vs რეალი?",
      "რა ხდება ახლა ლაივში?",
      "როგორ გამოვიყენო პროგნოზები?",
    ];
  }
  if (locale === "ru") {
    return [
      "Какие матчи сегодня?",
      "Кто победит Барселона vs Реал?",
      "Что сейчас в лайве?",
      "Как использовать прогнозы?",
    ];
  }
  return [
    "What matches are today?",
    "Who wins Barcelona vs Real Madrid?",
    "What's happening live right now?",
    "How do I use predictions?",
  ];
}

// ─────────────────────────────────────────────────────────────
//  🎨 MESSAGE BUBBLE
// ─────────────────────────────────────────────────────────────

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar */}
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

      {/* Bubble */}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-lime text-ink font-medium rounded-tr-sm"
            : message.error
            ? "bg-red-500/10 border border-red-500/30 text-red-300 rounded-tl-sm"
            : "bg-surface/80 backdrop-blur-xl border border-edge text-text rounded-tl-sm"
        }`}
      >
        <div className="whitespace-pre-wrap break-words">
          {formatMessageContent(message.content)}
        </div>
      </div>
    </motion.div>
  );
}

/**
 * აფორმატებს **bold** ტექსტს და bullet-ებს.
 */
function formatMessageContent(text: string): React.ReactNode {
  // Split by **bold** markers
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
//  ⌨️ TYPING INDICATOR
// ─────────────────────────────────────────────────────────────

function TypingIndicator({ label }: { label: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
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

// ─────────────────────────────────────────────────────────────
//  🎯 MAIN COMPONENT
// ─────────────────────────────────────────────────────────────

export function AIChat({ isOpen, onClose, locale }: AIChatProps) {
  const t = getT(locale);
  const suggested = getSuggested(locale);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // ─── Auto-scroll to bottom ───
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // ─── Focus input when opened ───
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // ─── ESC to close ───
  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) onClose();
    }
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  // ─── Prevent body scroll when open ───
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

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
        // Build history (last 10, without the just-added user message)
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

        const aiMessage: Message = {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: data.reply || t.error,
          error: !data.success,
        };

        setMessages((prev) => [...prev, aiMessage]);
      } catch (err) {
        console.error("[AIChat] Error:", err);
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

  // ─── Submit handler ───
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  // ─── Enter to send (Shift+Enter = new line) ───
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  // ─── Clear chat ───
  function clearChat() {
    setMessages([]);
    setInput("");
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ═══ Backdrop ═══ */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* ═══ Modal ═══ */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed z-[101] inset-x-0 bottom-0 sm:inset-4 sm:bottom-4 lg:inset-x-auto lg:right-6 lg:bottom-6 lg:w-[440px] lg:h-[640px] h-[85vh] flex flex-col"
            role="dialog"
            aria-label={t.title}
          >
            <div className="relative flex flex-col h-full bg-[#0A0F1C]/95 backdrop-blur-2xl border-t sm:border border-edge rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-[0_-20px_80px_-20px_rgba(0,0,0,0.9)] sm:shadow-[0_30px_100px_-20px_rgba(0,0,0,0.9)]">
              {/* ─── Top gradient line ─── */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lime/60 to-transparent" />

              {/* ─── Ambient glows ─── */}
              <div className="absolute -top-32 -left-32 w-64 h-64 bg-lime/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-teal/10 rounded-full blur-3xl pointer-events-none" />

              {/* ═══ HEADER ═══ */}
              <div className="relative z-10 flex items-center justify-between px-5 py-4 border-b border-edge/50 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-lime/20 to-teal/20 border border-lime/30 flex items-center justify-center">
                    <Sparkles size={18} className="text-lime" />
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-lime border-2 border-[#0A0F1C] animate-pulse" />
                  </div>
                  <div>
                    <div className="font-heading font-bold text-sm text-text">
                      {t.title}
                    </div>
                    <div className="text-[11px] text-muted">
                      {t.subtitle}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {messages.length > 0 && (
                    <button
                      onClick={clearChat}
                      className="px-2.5 py-1.5 text-[10px] uppercase tracking-widest text-muted hover:text-lime transition-colors rounded-lg hover:bg-surface/50"
                      aria-label={t.clearChat}
                    >
                      {t.clearChat}
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="w-9 h-9 rounded-xl bg-surface/60 border border-edge flex items-center justify-center text-muted hover:text-lime hover:border-lime/40 transition-all"
                    aria-label="Close"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* ═══ MESSAGES ═══ */}
              <div className="relative z-10 flex-1 overflow-y-auto px-5 py-4 space-y-3 scrollbar-thin">
                {/* Greeting (only when no messages) */}
                {messages.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="flex gap-2.5">
                      <div className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border bg-gradient-to-br from-lime/20 to-teal/20 border-lime/30">
                        <Bot size={14} className="text-lime" />
                      </div>
                      <div className="bg-surface/80 backdrop-blur-xl border border-edge rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-text leading-relaxed">
                        {t.greeting}
                      </div>
                    </div>

                    {/* Suggested questions */}
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-muted mb-2 pl-1 flex items-center gap-1.5">
                        <Zap size={10} className="text-lime" />
                        {t.suggestedTitle}
                      </div>
                      <div className="space-y-1.5">
                        {suggested.map((q, i) => (
                          <motion.button
                            key={q}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.05 * i }}
                            onClick={() => sendMessage(q)}
                            className="w-full text-left px-3.5 py-2.5 rounded-xl bg-surface/40 hover:bg-surface border border-edge/60 hover:border-lime/40 text-xs text-muted hover:text-text transition-all flex items-center gap-2.5 group"
                          >
                            <MessageSquare
                              size={12}
                              className="text-lime/60 group-hover:text-lime shrink-0"
                            />
                            <span>{q}</span>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Messages */}
                {messages.map((msg) => (
                  <MessageBubble key={msg.id} message={msg} />
                ))}

                {/* Typing */}
                {isLoading && <TypingIndicator label={t.thinking} />}

                <div ref={messagesEndRef} />
              </div>

              {/* ═══ INPUT ═══ */}
              <form
                onSubmit={handleSubmit}
                className="relative z-10 px-4 py-3 border-t border-edge/50 bg-[#0A0F1C]/60 shrink-0"
              >
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
                    className="flex-1 bg-transparent text-sm text-text placeholder:text-muted/60 px-3 py-2.5 resize-none outline-none max-h-[120px] scrollbar-thin disabled:opacity-50"
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

                <div className="text-[10px] text-muted/50 mt-2 text-center">
                  {t.poweredBy}
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}