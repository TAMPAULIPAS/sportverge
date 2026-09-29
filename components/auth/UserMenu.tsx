// ═══════════════════════════════════════════════════════════════
//  SportVerge — User Menu (Header)
//  ─────────────────────────────────────────────────────────────
//  👤 Header-ის user dropdown menu
// ═══════════════════════════════════════════════════════════════

"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  LogOut,
  Settings,
  Trophy,
  Bookmark,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { signOutUser, getCurrentUser, getProfile, type Profile } from "@/lib/supabase/auth";

interface Props {
  locale: "ka" | "en" | "ru";
}

function getT(locale: string) {
  const isKa = locale === "ka";
  const isRu = locale === "ru";
  return {
    login: isKa ? "შესვლა" : isRu ? "Войти" : "Sign In",
    register: isKa ? "რეგისტრაცია" : isRu ? "Регистрация" : "Sign Up",
    profile: isKa ? "პროფილი" : isRu ? "Профиль" : "Profile",
    leaderboard: isKa ? "ლიდერბორდი" : isRu ? "Таблица" : "Leaderboard",
    bookmarks: isKa ? "შენახული" : isRu ? "Сохранённые" : "Bookmarks",
    settings: isKa ? "პარამეტრები" : isRu ? "Настройки" : "Settings",
    logout: isKa ? "გასვლა" : isRu ? "Выйти" : "Sign Out",
  };
}

export function UserMenu({ locale }: Props) {
  const t = getT(locale);
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  // Load profile on mount
  useEffect(() => {
    (async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          const p = await getProfile();
          setProfile(p);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Close menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    await signOutUser();
    setProfile(null);
    setOpen(false);
    setLoggingOut(false);
    router.push(`/${locale}`);
    router.refresh();
  }

  // ─── LOADING ───
  if (loading) {
    return (
      <div className="w-10 h-10 rounded-xl bg-surface/60 border border-edge flex items-center justify-center">
        <Loader2 size={14} className="text-muted animate-spin" />
      </div>
    );
  }

  // ─── NOT LOGGED IN ───
  if (!profile) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href={`/${locale}/authorization`}
          className="hidden sm:inline-flex px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-muted hover:text-lime transition-colors"
        >
          {t.login}
        </Link>
        <Link
          href={`/${locale}/authorization?mode=register`}
          className="inline-flex px-4 py-2 rounded-xl bg-lime text-ink text-xs font-bold uppercase tracking-wider hover:shadow-[0_0_25px_rgba(217,249,157,0.5)] transition-all"
        >
          {t.register}
        </Link>
      </div>
    );
  }

  // ─── LOGGED IN ───
  const initial = (profile.username ?? profile.email).charAt(0).toUpperCase();

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-xl bg-surface/60 backdrop-blur-xl border border-edge hover:border-lime/40 transition-all"
        aria-label="User menu"
      >
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-lime to-teal flex items-center justify-center">
          <span className="text-ink text-xs font-black">{initial}</span>
        </div>
        <span className="hidden sm:block text-xs font-semibold text-text max-w-[100px] truncate">
          {profile.username ?? profile.email}
        </span>
        <ChevronDown
          size={12}
          className={`text-muted transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 w-56 z-50 p-2 rounded-2xl bg-surface/95 backdrop-blur-xl border border-edge shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)]"
          >
            {/* Profile header */}
            <div className="px-3 py-2.5 border-b border-edge/50 mb-1">
              <p className="text-xs font-bold text-text truncate">
                {profile.username ?? profile.email.split("@")[0]}
              </p>
              <p className="text-[10px] text-muted truncate">{profile.email}</p>
            </div>

            <MenuItem icon={User} href={`/${locale}/profile`} label={t.profile} />
            <MenuItem icon={Trophy} href={`/${locale}/leaderboard`} label={t.leaderboard} />
            <MenuItem icon={Bookmark} href={`/${locale}/profile#bookmarks`} label={t.bookmarks} />
            <MenuItem icon={Settings} href={`/${locale}/settings`} label={t.settings} />

            <div className="my-1 border-t border-edge/50" />

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-xs text-red-300 hover:bg-red-500/10 transition-colors disabled:opacity-50"
            >
              {loggingOut ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <LogOut size={14} />
              )}
              <span>{t.logout}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuItem({
  icon: Icon,
  href,
  label,
}: {
  icon: typeof User;
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-text hover:bg-lime/10 hover:text-lime transition-colors"
    >
      <Icon size={14} />
      <span>{label}</span>
    </Link>
  );
}

export default UserMenu;