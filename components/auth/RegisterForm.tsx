// ═══════════════════════════════════════════════════════════════
//  SportVerge — Register Form
//  ─────────────────────────────────────────────────────────────
//  📝 Email + Password registration (no OAuth)
// ═══════════════════════════════════════════════════════════════

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Check,
} from "lucide-react";
import { signUp } from "@/lib/supabase/auth";

interface Props {
  locale: "ka" | "en" | "ru";
  onSuccess?: () => void;
  switchToLogin?: () => void;
}

function getT(locale: string) {
  const isKa = locale === "ka";
  const isRu = locale === "ru";

  return {
    title: isKa ? "რეგისტრაცია" : isRu ? "Регистрация" : "Sign Up",
    subtitle: isKa
      ? "შექმენი ანგარიში და დაიწყე პროგნოზების დადება"
      : isRu
      ? "Создай аккаунт и начни делать прогнозы"
      : "Create an account and start making predictions",
    username: isKa ? "მომხმარებლის სახელი" : isRu ? "Имя пользователя" : "Username",
    usernamePlaceholder: isKa ? "მაგ: nino99" : isRu ? "Напр: nino99" : "e.g. nino99",
    email: isKa ? "ელფოსტა" : isRu ? "Email" : "Email",
    emailPlaceholder: "you@example.com",
    password: isKa ? "პაროლი" : isRu ? "Пароль" : "Password",
    passwordPlaceholder: isKa ? "მინიმუმ 6 სიმბოლო" : isRu ? "Минимум 6 символов" : "At least 6 characters",
    submit: isKa ? "რეგისტრაცია" : isRu ? "Зарегистрироваться" : "Create Account",
    loading: isKa ? "იტვირთება..." : isRu ? "Загрузка..." : "Loading...",
    haveAccount: isKa ? "უკვე გაქვს ანგარიში?" : isRu ? "Уже есть аккаунт?" : "Already have an account?",
    login: isKa ? "შესვლა" : isRu ? "Войти" : "Sign In",
    terms: isKa
      ? "რეგისტრაციით ეთანხმები ჩვენს წესებს"
      : isRu
      ? "Регистрируясь, ты соглашаешься с правилами"
      : "By signing up you agree to our terms",
    successTitle: isKa ? "წარმატება!" : isRu ? "Успех!" : "Success!",
    successDesc: isKa
      ? "შეამოწმე ელფოსტა დასადასტურებლად. წერილი გამოგზავნილია."
      : isRu
      ? "Проверь email для подтверждения. Письмо отправлено."
      : "Check your email for confirmation. Letter sent.",
    strengthWeak: isKa ? "სუსტი" : isRu ? "Слабый" : "Weak",
    strengthMedium: isKa ? "საშუალო" : isRu ? "Средний" : "Medium",
    strengthStrong: isKa ? "ძლიერი" : isRu ? "Сильный" : "Strong",
  };
}

function getPasswordStrength(pw: string): { level: 0 | 1 | 2 | 3; label: string } {
  if (pw.length === 0) return { level: 0, label: "" };
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 2) return { level: 1, label: "weak" };
  if (score <= 4) return { level: 2, label: "medium" };
  return { level: 3, label: "strong" };
}

export function RegisterForm({ locale, onSuccess, switchToLogin }: Props) {
  const t = getT(locale);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const strength = getPasswordStrength(password);
  const strengthColors = ["", "bg-red-500", "bg-amber-500", "bg-lime"];
  const strengthLabels = ["", t.strengthWeak, t.strengthMedium, t.strengthStrong];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (username.trim().length < 3) {
      setError(
        locale === "ka"
          ? "მომხმარებლის სახელი მინიმუმ 3 სიმბოლო"
          : locale === "ru"
          ? "Имя пользователя минимум 3 символа"
          : "Username must be at least 3 characters"
      );
      return;
    }

    const result = await signUp({
      email,
      password,
      username: username.trim(),
      fullName: username.trim(),
      locale,
    });

    if (!result.success) {
      setError(result.error ?? "Registration failed");
      return;
    }

    if (result.needsEmailConfirmation) {
      setSuccess(true);
      return;
    }

    // Auto-logged in
    startTransition(() => {
      router.push(`/${locale}/profile`);
      router.refresh();
    });
    onSuccess?.();
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8"
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-lime/15 border border-lime/40 flex items-center justify-center">
          <CheckCircle2 size={28} className="text-lime" />
        </div>
        <h3 className="font-heading text-xl font-bold text-text mb-2">{t.successTitle}</h3>
        <p className="text-sm text-muted max-w-xs mx-auto">{t.successDesc}</p>
        <button
          type="button"
          onClick={switchToLogin}
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-lime text-ink text-sm font-bold hover:shadow-[0_0_25px_rgba(217,249,157,0.5)] transition-all"
        >
          {t.login}
        </button>
      </motion.div>
    );
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
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

      {/* Username */}
      <div>
        <label className="block text-xs uppercase tracking-widest text-muted font-bold mb-2">
          {t.username}
        </label>
        <div className="relative">
          <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={t.usernamePlaceholder}
            required
            minLength={3}
            maxLength={30}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface/60 backdrop-blur-xl border border-edge text-text text-sm placeholder:text-muted/50 focus:outline-none focus:border-lime/50 focus:shadow-[0_0_0_3px_rgba(217,249,157,0.1)] transition-all"
          />
        </div>
      </div>

      {/* Email */}
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
            placeholder={t.emailPlaceholder}
            required
            autoComplete="email"
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface/60 backdrop-blur-xl border border-edge text-text text-sm placeholder:text-muted/50 focus:outline-none focus:border-lime/50 focus:shadow-[0_0_0_3px_rgba(217,249,157,0.1)] transition-all"
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <label className="block text-xs uppercase tracking-widest text-muted font-bold mb-2">
          {t.password}
        </label>
        <div className="relative">
          <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t.passwordPlaceholder}
            required
            minLength={6}
            autoComplete="new-password"
            className="w-full pl-11 pr-11 py-3 rounded-xl bg-surface/60 backdrop-blur-xl border border-edge text-text text-sm placeholder:text-muted/50 focus:outline-none focus:border-lime/50 focus:shadow-[0_0_0_3px_rgba(217,249,157,0.1)] transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-lime transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {/* Strength indicator */}
        {password.length > 0 && (
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-1 rounded-full bg-edge overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(strength.level / 3) * 100}%` }}
                className={`h-full ${strengthColors[strength.level]} transition-all`}
              />
            </div>
            <span className="text-[10px] uppercase tracking-widest text-muted font-bold">
              {strengthLabels[strength.level]}
            </span>
          </div>
        )}
      </div>

      {/* Submit */}
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
              <Check size={16} />
              {t.submit}
            </>
          )}
        </span>
      </button>

      {/* Terms */}
      <p className="text-[10px] text-muted/70 text-center">{t.terms}</p>

      {/* Switch to login */}
      <div className="pt-4 border-t border-edge/50 text-center">
        <p className="text-xs text-muted">
          {t.haveAccount}{" "}
          <button
            type="button"
            onClick={switchToLogin}
            className="text-lime font-bold hover:underline transition-all"
          >
            {t.login}
          </button>
        </p>
      </div>
    </motion.form>
  );
}

export default RegisterForm;