// ═══════════════════════════════════════════════════════════════
//  SportVerge — Authorization Page (Ultra Premium v2)
//  ─────────────────────────────────────────────────────────────
//  🎨 Split layout: showcase (left) + form (right)
//  ✨ Animated background + floating particles
//  🎭 Smooth transitions between sign in / sign up
// ═══════════════════════════════════════════════════════════════

"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogIn,
  UserPlus,
  Sparkles,
  Trophy,
  Target,
  TrendingUp,
  Zap,
  Shield,
  Star,
  Check,
  Users,
  Brain,
  Rocket,
  Flame,
  ArrowRight,
  Globe,
  BarChart3,
  Crown,
  Gem,
  CircleDot,
} from "lucide-react";
import { LogoFull } from "@/components/brand/LogoFull";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { LoginForm } from "@/components/auth/LoginForm";

// ═══════════════════════════════════════════════════════════════
//  TRANSLATIONS
// ═══════════════════════════════════════════════════════════════

function getT(locale: string) {
  const isKa = locale === "ka";
  const isRu = locale === "ru";
  const t = (ka: string, en: string, ru: string) =>
    isKa ? ka : isRu ? ru : en;

  return {
    // Tabs
    signin: t("შესვლა", "Sign In", "Вход"),
    signup: t("რეგისტრაცია", "Sign Up", "Регистрация"),
    backHome: t("მთავარზე დაბრუნება", "Back to home", "На главную"),

    // Showcase
    badge: t("შემოგვიერთდი", "JOIN US", "ПРИСОЕДИНЯЙСЯ"),
    titleLine1: t("გახდი", "Become a", "Стань"),
    titleLine2: t("სპორტის", "prediction", "чемпионом"),
    titleLine3: t("პროგნოზირების ჩემპიონი", "champion", "прогнозов"),
    desc: t(
      "შემოგვიერთდი ათასობით ფანს და დაიწყე შენი პროგნოზების დადება. მიიღე AI-ის ანალიზი, ლაივ სტატისტიკა და სხვა ფანებთან კონკურენცია.",
      "Join thousands of fans and start making predictions. Get AI analysis, live stats, and compete with other fans.",
      "Присоединяйся к тысячам фанатов и начни делать прогнозы. Получай AI-анализ, live-статистику и конкурируй с другими."
    ),

    // Features
    feature1Title: t("AI პროგნოზები", "AI Predictions", "AI прогнозы"),
    feature1Desc: t("ჭკვიანი ალგორითმები", "Smart algorithms", "Умные алгоритмы"),
    feature2Title: t("ლაივ ანგარიშები", "Live Scores", "Live счета"),
    feature2Desc: t("30 წამში განახლება", "Updated every 30s", "Каждые 30 секунд"),
    feature3Title: t("ლიდერბორდი", "Leaderboard", "Лидерборд"),
    feature3Desc: t("შეადარე სხვებს", "Compare with others", "Сравни с другими"),
    feature4Title: t("ბეჯები", "Badges", "Значки"),
    feature4Desc: t("მიიღე ჯილდოები", "Earn rewards", "Получай награды"),

    // Stats
    stat1Value: "12K+",
    stat1Label: t("მომხმარებელი", "Users", "Юзеров"),
    stat2Value: "2.4M",
    stat2Label: t("პროგნოზი", "Predictions", "Прогнозов"),
    stat3Value: "78%",
    stat3Label: t("სიზუსტე", "Accuracy", "Точность"),
    stat4Value: "200+",
    stat4Label: t("ლიგა", "Leagues", "Лиг"),

    // Testimonial
    quote: t(
      "SportVerge-ის AI პროგნოზები ნამდვილად მუშაობს! ჩემი სტატისტიკა უკეთესია ვიდრე ოდესმე.",
      "SportVerge AI predictions really work! My accuracy has never been better.",
      "AI прогнозы SportVerge реально работают! Моя точность лучше, чем когда-либо."
    ),
    quoteName: t("ნინო ბერიძე", "Nino Beridze", "Нино Беридзе"),
    quoteRole: t("ტოპ პროგნოზიორი", "Top Predictor", "Топ-прогнозист"),
  };
}

type T = ReturnType<typeof getT>;

// ═══════════════════════════════════════════════════════════════
//  FLOATING PARTICLES — animated background
// ═══════════════════════════════════════════════════════════════

function FloatingParticles() {
  const particles = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        duration: Math.random() * 15 + 15,
        delay: Math.random() * 5,
      })),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-amber-400/20"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 15, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  SHOWCASE PANEL — Left side
// ═══════════════════════════════════════════════════════════════

function ShowcasePanel({ t }: { t: T }) {
  const features = [
    {
      icon: Brain,
      title: t.feature1Title,
      desc: t.feature1Desc,
      color: "amber",
    },
    {
      icon: TrendingUp,
      title: t.feature2Title,
      desc: t.feature2Desc,
      color: "purple",
    },
    {
      icon: Trophy,
      title: t.feature3Title,
      desc: t.feature3Desc,
      color: "rose",
    },
    {
      icon: Crown,
      title: t.feature4Title,
      desc: t.feature4Desc,
      color: "amber",
    },
  ];

  const stats = [
    { value: t.stat1Value, label: t.stat1Label, icon: Users },
    { value: t.stat2Value, label: t.stat2Label, icon: Target },
    { value: t.stat3Value, label: t.stat3Label, icon: Zap },
    { value: t.stat4Value, label: t.stat4Label, icon: Globe },
  ];

  return (
    <div className="relative hidden lg:flex flex-col justify-between h-full min-h-[700px] overflow-hidden rounded-[2rem] border border-purple-500/20 bg-gradient-to-br from-[#1a0a2e] via-[#0F0A1F] to-[#2a0a3e] p-10 xl:p-12">
      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.12] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(251,191,36,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(251,191,36,0.4) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />

      {/* Floating particles */}
      <FloatingParticles />

      {/* Big glows */}
      <motion.div
        className="absolute -top-40 -left-40 w-96 h-96 bg-amber-400/20 rounded-full blur-3xl pointer-events-none"
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500/25 rounded-full blur-3xl pointer-events-none"
        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-500/10 rounded-full blur-3xl pointer-events-none"
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      />

      {/* Top gradient line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent" />

      {/* ═══ CONTENT ═══ */}
      <div className="relative z-10">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <LogoFull size="md" href={null} />
        </motion.div>

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-400/15 border border-amber-400/40 backdrop-blur-sm mb-7"
        >
          <motion.span
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.9)]"
          />
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-amber-200">
            {t.badge}
          </span>
        </motion.div>

        {/* Title — 3 lines with gradient on last */}
        <h1 className="font-heading text-5xl xl:text-6xl 2xl:text-7xl font-black text-white leading-[1.02] tracking-tight mb-6">
          <motion.span
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="block"
          >
            {t.titleLine1}
          </motion.span>
          <motion.span
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="block"
          >
            {t.titleLine2}
          </motion.span>
          <motion.span
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="block bg-gradient-to-r from-amber-300 via-amber-400 to-purple-400 bg-clip-text text-transparent"
          >
            {t.titleLine3}
          </motion.span>
        </h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-base lg:text-lg text-purple-200/70 leading-relaxed max-w-md mb-10"
        >
          {t.desc}
        </motion.p>

        {/* Features grid — 2x2 */}
        <div className="grid grid-cols-2 gap-3 mb-10">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            const colors = {
              amber: {
                text: "text-amber-300",
                bg: "bg-amber-400/8",
                border: "border-amber-400/30",
                hoverBorder: "hover:border-amber-400/60",
                glow: "shadow-[0_0_20px_rgba(251,191,36,0.15)]",
              },
              purple: {
                text: "text-purple-300",
                bg: "bg-purple-500/8",
                border: "border-purple-400/30",
                hoverBorder: "hover:border-purple-400/60",
                glow: "shadow-[0_0_20px_rgba(168,85,247,0.15)]",
              },
              rose: {
                text: "text-rose-300",
                bg: "bg-rose-500/8",
                border: "border-rose-400/30",
                hoverBorder: "hover:border-rose-400/60",
                glow: "shadow-[0_0_20px_rgba(244,63,94,0.15)]",
              },
            };
            const c = colors[feature.color as keyof typeof colors];

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 + i * 0.1 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className={`p-4 rounded-2xl border ${c.border} ${c.bg} backdrop-blur-sm ${c.hoverBorder} ${c.glow} transition-all cursor-default`}
              >
                <div className={`w-9 h-9 rounded-lg ${c.bg} border ${c.border} flex items-center justify-center mb-3`}>
                  <Icon size={16} className={c.text} />
                </div>
                <div className="text-sm font-black text-white mb-1">
                  {feature.title}
                </div>
                <div className="text-[11px] text-purple-200/60 leading-snug">
                  {feature.desc}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ═══ BOTTOM — Stats + Testimonial ═══ */}
      <div className="relative z-10">
        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="grid grid-cols-4 gap-3 mb-6"
        >
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                className="p-3 rounded-xl bg-white/[0.03] backdrop-blur-sm border border-white/10 text-center hover:bg-white/[0.06] transition-colors"
              >
                <Icon size={12} className="text-amber-300 mx-auto mb-1.5" />
                <div className="font-mono text-base xl:text-lg font-black text-white leading-none mb-1">
                  {stat.value}
                </div>
                <div className="text-[9px] uppercase tracking-wider text-purple-200/50 font-bold truncate">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* Testimonial */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.1 }}
          className="p-5 rounded-2xl bg-white/[0.03] backdrop-blur-sm border border-white/10"
        >
          <div className="flex items-center gap-1 mb-2.5">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2 + i * 0.05 }}
              >
                <Star size={12} className="text-amber-300 fill-amber-300" />
              </motion.div>
            ))}
          </div>
          <p className="text-sm text-purple-100/85 leading-relaxed italic mb-4">
            "{t.quote}"
          </p>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-purple-500 flex items-center justify-center shrink-0">
              <span className="text-xs font-black text-white">
                {t.quoteName.charAt(0)}
              </span>
            </div>
            <div>
              <div className="text-xs font-bold text-white">{t.quoteName}</div>
              <div className="text-[10px] text-purple-200/50">{t.quoteRole}</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  TAB SWITCHER — with smooth slide
// ═══════════════════════════════════════════════════════════════

function TabSwitcher({
  active,
  onChange,
  t,
}: {
  active: "signin" | "signup";
  onChange: (tab: "signin" | "signup") => void;
  t: T;
}) {
  const tabs = [
    { key: "signin" as const, label: t.signin, icon: LogIn },
    { key: "signup" as const, label: t.signup, icon: UserPlus },
  ];

  return (
    <div className="relative flex items-center gap-1 p-1.5 rounded-2xl bg-purple-500/8 border border-purple-500/25 backdrop-blur-xl">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = active === tab.key;

        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={`relative flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm lg:text-base font-black transition-all duration-300 ${
              isActive ? "text-ink" : "text-purple-200/60 hover:text-purple-100"
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="auth-tab-bg"
                className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-500 rounded-xl shadow-[0_4px_24px_rgba(251,191,36,0.5)]"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <Icon size={16} className="relative z-10" strokeWidth={2.5} />
            <span className="relative z-10 uppercase tracking-wider">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  MAIN PAGE
// ═══════════════════════════════════════════════════════════════

export default function AuthorizationPage() {
  const locale = useLocale() as "ka" | "en" | "ru";
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const t = getT(locale);

  return (
    <div className="relative min-h-screen bg-[#0A0612] overflow-hidden">
      {/* ═══ AMBIENT BACKGROUND ═══ */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
        <motion.div
          className="absolute top-0 left-1/4 w-[700px] h-[700px] bg-amber-400/6 rounded-full blur-[200px]"
          animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 12, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-1/3 right-1/4 w-[700px] h-[700px] bg-purple-500/10 rounded-full blur-[200px]"
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 14, repeat: Infinity, delay: 3 }}
        />
        <motion.div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-rose-500/6 rounded-full blur-[180px]"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 16, repeat: Infinity, delay: 6 }}
        />
      </div>

      {/* ═══ CONTENT ═══ */}
      <div className="relative z-10 min-h-screen">
        <div className="grid lg:grid-cols-2 min-h-screen">
          {/* ─── LEFT: SHOWCASE ─── */}
          <div className="p-4 lg:p-6 xl:p-8 flex">
            <div className="w-full">
              <ShowcasePanel t={t} />
            </div>
          </div>

          {/* ─── RIGHT: FORM ─── */}
          <div className="flex items-center justify-center p-6 lg:p-12 xl:p-16">
            <div className="w-full max-w-md">
              {/* Logo on mobile only */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="lg:hidden flex justify-center mb-8"
              >
                <LogoFull size="md" href={null} />
              </motion.div>

              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="mb-8"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 mb-4">
                  <Sparkles size={12} className="text-amber-300" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-200">
                    {locale === "ka" ? "SECURE AUTH" : locale === "ru" ? "БЕЗОПАСНО" : "SECURE AUTH"}
                  </span>
                </div>
                <h2 className="font-heading text-3xl lg:text-4xl font-black text-white tracking-tight mb-2">
                  {locale === "ka"
                    ? "კეთილი იყოს შენი დაბრუნება"
                    : locale === "ru"
                    ? "С возвращением"
                    : "Welcome back"}
                </h2>
                <p className="text-sm lg:text-base text-purple-200/60">
                  {locale === "ka"
                    ? "შედი ანგარიშზე ან შექმენი ახალი"
                    : locale === "ru"
                    ? "Войди или создай аккаунт"
                    : "Sign in or create your account"}
                </p>
              </motion.div>

              {/* Tabs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mb-6"
              >
                <TabSwitcher active={tab} onChange={setTab} t={t} />
              </motion.div>

              {/* Card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a0a2e]/90 via-[#0F0A1F]/70 to-[#1a0a2e]/90 backdrop-blur-2xl border border-purple-500/30 p-7 lg:p-9 shadow-[0_30px_100px_-20px_rgba(168,85,247,0.5)]"
              >
                {/* Top gradient line */}
                <motion.div
                  className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />

                {/* Corner glows */}
                <div className="absolute -top-32 -right-32 w-64 h-64 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

                <div className="relative">
                  <AnimatePresence mode="wait">
                    {tab === "signin" ? (
                      <motion.div
                        key="signin"
                        initial={{ opacity: 0, x: -40, scale: 0.98 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 40, scale: 0.98 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                      >
                        <LoginForm
                          locale={locale}
                          switchToRegister={() => setTab("signup")}
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="signup"
                        initial={{ opacity: 0, x: 40, scale: 0.98 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -40, scale: 0.98 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                      >
                        <RegisterForm
                          locale={locale}
                          switchToLogin={() => setTab("signin")}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>

              {/* Footer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="mt-8 flex items-center justify-between text-[10px] text-purple-200/40"
              >
                <Link
                  href={`/${locale}`}
                  className="inline-flex items-center gap-1.5 hover:text-amber-300 transition-colors"
                >
                  <ArrowRight size={11} className="rotate-180" />
                  <span>{t.backHome}</span>
                </Link>
                <div className="flex items-center gap-1.5">
                  <Shield size={11} className="text-lime/60" />
                  <span>Powered by Supabase</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}