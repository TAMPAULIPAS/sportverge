// ═══════════════════════════════════════════════════════════════
//  SportVerge — Login Form
//  ─────────────────────────────────────────────────────────────
//  🔐 Email + Password login (no OAuth)
// ═══════════════════════════════════════════════════════════════

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  LogIn,
  CheckCircle2,
} from "lucide-react";
import { signIn, resetPassword } from "@/lib/supabase/auth";

interface Props {
  locale: "ka" | "en" | "ru";
  onSuccess?: () => void;
  switchToRegister?: () => void;
}

function getT(locale: string) {
  const isKa = locale === "ka";
  const isRu = locale === "ru";

  return {
    title: isKa ? "შესვლა" : isRu ? "Войти" : "Sign In",
    subtitle: isKa
      ? "შედი შენს ანგარიშში"
      : isRu
      ? "Войди в свой аккаунт"
      : "Sign in to your account",
    email: isKa ? "ელფოსტა" : isRu ? "Email" : "Email",
    password: isKa ? "პაროლი" : isRu ? "Пароль" : "Password",
    forgot: isKa ? "დაგავიწყდა პაროლი?" : isRu ? "Забыл пароль?" : "Forgot password?",
    submit: isKa ? "შესვლა" : isRu ? "Войти" : "Sign In",
    loading: isKa ? "იტვირთება..." : isRu ? "Загрузка..." : "Loading...",
    noAccount: isKa ? "ანგარიში არ გაქვს?" : isRu ? "Нет аккаунта?" : "Don't have an account?",
    register: isKa ? "რეგისტრაცია" : isRu ? "Регистрация" : "Sign Up",
    resetTitle: isKa ? "პაროლის აღდგენა" : isRu ? "Восстановление пароля" : "Reset Password",
    resetDesc: isKa
      ? "შეიყვანე ელფოსტა და გამოგიგზავნით ბმულს"
      : isRu
      ? "Введи email и мы отправим ссылку"
      : "Enter your email and we will send a reset link",
    resetSubmit: isKa ? "გაგზავნა" : isRu ? "Отправить" : "Send",
    resetSuccess: isKa
      ? "ბმული გამოგზავნილია შენს ელფოსტაზე!"
      : isRu
      ? "Ссылка отправлена на твой email!"
      : "Reset link sent to your email!",
    backToLogin: isKa ? "უკან შესვლაზე" : isRu ? "Назад ко входу" : "Back to login",
  };
}

export function LoginForm({ locale, onSuccess, switchToRegister }: Props) {
  const t = getT(locale);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [mode, setMode] = useState<"login" | "reset">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [resetSent, setResetSent] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const result = await signIn({ email, password, locale });

    if (!result.success) {
      setError(result.error ?? "Login failed");
      return;
    }

    startTransition(() => {
      router.push(`/${locale}/profile`);
      router.refresh();
    });
    onSuccess?.();
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResetSent(false);

    const result = await resetPassword({ email, locale });

    if (!result.success) {
      setError(result.error ?? "Reset failed");
      return;
    }

    setResetSent(true);
  }

  // ─── RESET MODE ───
  if (mode === "reset") {
    return (
      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleReset}
        className="space-y-5"
      >
        <div className="text-center mb-6">
          <h2 className="font-heading text-2xl lg:text-3xl font-black text-text mb-1.5">
            {t.resetTitle}
          </h2>
          <p className="text-sm text-muted">{t.resetDesc}</p>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/30">
            <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
            <p className="text-xs text-red-300">{error}</p>
          </div>
        )}

        {resetSent && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-lime/10 border border-lime/30">
            <CheckCircle2 size={16} className="text-lime shrink-0 mt-0.5" />
            <p className="text-xs text-lime">{t.resetSuccess}</p>
          </div>
        )}

        <div>
          <label className="block text-xs uppercase tracking-widest text-muted font-bold mb-2">
            {t.email}
          </label>
          <div className="relative">
            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface/60 backdrop-blur-xl border border-edge text-text text-sm placeholder:text-muted/50 focus:outline-none focus:border-lime/50 focus:shadow-[0_0_0_3px_rgba(217,249,157,0.1)] transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3.5 rounded-xl bg-lime text-ink font-bold text-sm hover:shadow-[0_0_30px_rgba(217,249,157,0.5)] transition-all"
        >
          {t.resetSubmit}
        </button>

        <div className="pt-4 border-t border-edge/50 text-center">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError("");
              setResetSent(false);
            }}
            className="text-xs text-muted hover:text-lime transition-colors"
          >
            {t.backToLogin}
          </button>
        </div>
      </motion.form>
    );
  }

  // ─── LOGIN MODE ───
  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleLogin}
      className="space-y-5"
    >
      <div className="text-center mb-6">
        <h2 className="font-heading text-2xl lg:text-3xl font-black text-text mb-1.5">
          {t.title}
        </h2>
        <p className="text-sm text-muted">{t.subtitle}</p>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/30">
          <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
          <p className="text-xs text-red-300">{error}</p>
        </div>
      )}

      <div>
        <label className="block text-xs uppercase tracking-widest text-muted font-bold mb-2">
          {t.email}
        </label>
        <div className="relative">
          <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface/60 backdrop-blur-xl border border-edge text-text text-sm placeholder:text-muted/50 focus:outline-none focus:border-lime/50 focus:shadow-[0_0_0_3px_rgba(217,249,157,0.1)] transition-all"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs uppercase tracking-widest text-muted font-bold">
            {t.password}
          </label>
          <button
            type="button"
            onClick={() => setMode("reset")}
            className="text-[10px] text-lime/70 hover:text-lime transition-colors"
          >
            {t.forgot}
          </button>
        </div>
        <div className="relative">
          <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="current-password"
            className="w-full pl-11 pr-11 py-3 rounded-xl bg-surface/60 backdrop-blur-xl border border-edge text-text text-sm placeholder:text-muted/50 focus:outline-none focus:border-lime/50 focus:shadow-[0_0_0_3px_rgba(217,249,157,0.1)] transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-lime transition-colors"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="group relative w-full py-3.5 rounded-xl bg-lime text-ink font-bold text-sm overflow-hidden hover:shadow-[0_0_30px_rgba(217,249,157,0.5)] disabled:opacity-50 transition-all"
      >
        <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        <span className="relative z-10 flex items-center justify-center gap-2">
          {isPending ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              {t.loading}
            </>
          ) : (
            <>
              <LogIn size={16} />
              {t.submit}
            </>
          )}
        </span>
      </button>

      <div className="pt-4 border-t border-edge/50 text-center">
        <p className="text-xs text-muted">
          {t.noAccount}{" "}
          <button
            type="button"
            onClick={switchToRegister}
            className="text-lime font-bold hover:underline transition-all"
          >
            {t.register}
          </button>
        </p>
      </div>
    </motion.form>
  );
}

export default LoginForm;