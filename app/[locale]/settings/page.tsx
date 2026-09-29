'use client';

// ═══════════════════════════════════════════════════════════════
//  SportVerge — Settings Page (Ultra Premium)
//  ენა, თემა, შეტყობინებები, საყვარელი გუნდები
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import {
  Globe,
  Palette,
  Bell,
  Heart,
  Shield,
  User,
  Check,
  Moon,
  Sun,
  Monitor,
  Mail,
  Smartphone,
  Volume2,
  Eye,
  EyeOff,
  Trash2,
  LogOut,
  ChevronRight,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

// ═══════════════════════════════════════════════════════════════
//  TRANSLATIONS
// ═══════════════════════════════════════════════════════════════
function getT(locale: string) {
  const isKa = locale === 'ka';
  const isRu = locale === 'ru';

  return {
    title: isKa ? 'პარამეტრები' : isRu ? 'Настройки' : 'Settings',
    subtitle: isKa
      ? 'მოარგე SportVerge შენს სტილს'
      : isRu
      ? 'Настрой SportVerge под себя'
      : 'Customize SportVerge to your style',

    // Sections
    language: isKa ? 'ენა' : isRu ? 'Язык' : 'Language',
    languageDesc: isKa
      ? 'აირჩიე ინტერფეისის ენა'
      : isRu
      ? 'Выбери язык интерфейса'
      : 'Choose your interface language',

    appearance: isKa ? 'გარეგნობა' : isRu ? 'Внешний вид' : 'Appearance',
    appearanceDesc: isKa
      ? 'თემა, ფერები და ინტერფეისი'
      : isRu
      ? 'Тема, цвета и интерфейс'
      : 'Theme, colors and interface',

    theme: isKa ? 'თემა' : isRu ? 'Тема' : 'Theme',
    dark: isKa ? 'მუქი' : isRu ? 'Тёмная' : 'Dark',
    light: isKa ? 'ნათელი' : isRu ? 'Светлая' : 'Light',
    system: isKa ? 'სისტემური' : isRu ? 'Системная' : 'System',

    notifications: isKa ? 'შეტყობინებები' : isRu ? 'Уведомления' : 'Notifications',
    notificationsDesc: isKa
      ? 'მართე რა შეტყობინებებს იღებ'
      : isRu
      ? 'Управляй уведомлениями'
      : 'Manage notifications',

    emailNotif: isKa ? 'ელფოსტა' : isRu ? 'Email' : 'Email',
    emailNotifDesc: isKa
      ? 'მიიღე სიახლეები ელფოსტაზე'
      : isRu
      ? 'Получай новости на email'
      : 'Receive news via email',

    pushNotif: isKa ? 'Push შეტყობინებები' : isRu ? 'Push уведомления' : 'Push notifications',
    pushNotifDesc: isKa
      ? 'მიიღე შეტყობინებები ბრაუზერში'
      : isRu
      ? 'Получай уведомления в браузере'
      : 'Receive browser notifications',

    soundNotif: isKa ? 'ხმოვანი სიგნალი' : isRu ? 'Звуковой сигнал' : 'Sound',
    soundNotifDesc: isKa
      ? 'ხმოვანი სიგნალი გოლზე'
      : isRu
      ? 'Звук при голе'
      : 'Sound on goal',

    favoriteTeams: isKa ? 'საყვარელი გუნდები' : isRu ? 'Любимые команды' : 'Favorite Teams',
    favoriteTeamsDesc: isKa
      ? 'აირჩიე გუნდები, რომელთა მატჩებიც გაინტერესებს'
      : isRu
      ? 'Выбери команды, матчи которых тебе интересны'
      : 'Choose teams whose matches you care about',

    noFavorites: isKa
      ? 'ჯერ არ გაქვს საყვარელი გუნდები'
      : isRu
      ? 'У тебя пока нет любимых команд'
      : "You don't have favorite teams yet",

    addTeam: isKa ? 'გუნდის დამატება' : isRu ? 'Добавить команду' : 'Add team',

    privacy: isKa ? 'კონფიდენციალურობა' : isRu ? 'Конфиденциальность' : 'Privacy',
    privacyDesc: isKa
      ? 'მართე შენი მონაცემები'
      : isRu
      ? 'Управляй своими данными'
      : 'Manage your data',

    publicProfile: isKa ? 'საჯარო პროფილი' : isRu ? 'Публичный профиль' : 'Public profile',
    publicProfileDesc: isKa
      ? 'სხვა მომხმარებლებს შეუძლიათ შენი პროფილის ნახვა'
      : isRu
      ? 'Другие пользователи могут видеть твой профиль'
      : 'Other users can see your profile',

    showPredictions: isKa ? 'პროგნოზების ჩვენება' : isRu ? 'Показывать прогнозы' : 'Show predictions',
    showPredictionsDesc: isKa
      ? 'სხვებს შეუძლიათ შენი პროგნოზების ნახვა'
      : isRu
      ? 'Другие могут видеть твои прогнозы'
      : 'Others can see your predictions',

    account: isKa ? 'ანგარიში' : isRu ? 'Аккаунт' : 'Account',
    accountDesc: isKa
      ? 'მართე შენი ანგარიში'
      : isRu
      ? 'Управляй своим аккаунтом'
      : 'Manage your account',

    logout: isKa ? 'გასვლა' : isRu ? 'Выйти' : 'Logout',
    deleteAccount: isKa ? 'ანგარიშის წაშლა' : isRu ? 'Удалить аккаунт' : 'Delete account',
    deleteAccountDesc: isKa
      ? 'ეს მოქმედება შეუქცევადია'
      : isRu
      ? 'Это действие необратимо'
      : 'This action is irreversible',

    save: isKa ? 'შენახვა' : isRu ? 'Сохранить' : 'Save',
    saved: isKa ? 'შენახულია!' : isRu ? 'Сохранено!' : 'Saved!',
    reset: isKa ? 'გადაყენება' : isRu ? 'Сбросить' : 'Reset',

    comingSoon: isKa ? 'მალე' : isRu ? 'Скоро' : 'Soon',
  };
}

// ═══════════════════════════════════════════════════════════════
//  LANGUAGES
// ═══════════════════════════════════════════════════════════════
const LANGUAGES = [
  { code: 'ka', label: 'ქართული', flag: '🇬🇪', full: 'KA' },
  { code: 'en', label: 'English', flag: '🇬🇧', full: 'EN' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺', full: 'RU' },
] as const;

// ═══════════════════════════════════════════════════════════════
//  THEMES
// ═══════════════════════════════════════════════════════════════
const THEMES = [
  { value: 'dark', icon: Moon },
  { value: 'light', icon: Sun },
  { value: 'system', icon: Monitor },
] as const;

// ═══════════════════════════════════════════════════════════════
//  SECTION WRAPPER
// ═══════════════════════════════════════════════════════════════
function SectionCard({
  icon: Icon,
  title,
  description,
  children,
  delay = 0,
}: {
  icon: typeof Globe;
  title: string;
  description?: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="relative overflow-hidden bg-gradient-to-br from-surface/70 via-surface/40 to-surface/70 backdrop-blur-xl border border-edge/70 rounded-2xl p-5 lg:p-6"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lime/40 to-transparent" />

      {/* Header */}
      <div className="flex items-start gap-4 mb-5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-lime to-teal flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(217,249,157,0.2)]">
          <Icon size={18} className="text-ink" strokeWidth={2.2} />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="font-heading text-lg lg:text-xl font-bold text-text tracking-tight">
            {title}
          </h2>
          {description && (
            <p className="text-xs lg:text-sm text-muted mt-1">{description}</p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-3">{children}</div>
    </motion.section>
  );
}

// ═══════════════════════════════════════════════════════════════
//  SETTING ROW
// ═══════════════════════════════════════════════════════════════
function SettingRow({
  icon: Icon,
  label,
  description,
  action,
  comingSoon = false,
}: {
  icon?: typeof Globe;
  label: string;
  description?: string;
  action: React.ReactNode;
  comingSoon?: boolean;
}) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-edge/40 last:border-0">
      {Icon && (
        <div className="w-9 h-9 rounded-lg bg-surface-hover border border-edge flex items-center justify-center shrink-0">
          <Icon size={16} className="text-muted" />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-text">{label}</span>
          {comingSoon && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider text-gold bg-gold/10 border border-gold/30">
              Soon
            </span>
          )}
        </div>
        {description && (
          <p className="text-xs text-muted mt-0.5">{description}</p>
        )}
      </div>

      <div className="shrink-0">{action}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  TOGGLE SWITCH
// ═══════════════════════════════════════════════════════════════
function Toggle({
  checked,
  onChange,
  disabled = false,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={cn(
        'relative w-12 h-6 rounded-full transition-colors duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-lime/60',
        checked ? 'bg-lime' : 'bg-edge',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className={cn(
          'absolute top-0.5 w-5 h-5 rounded-full bg-ink shadow-md',
          checked ? 'left-[26px]' : 'left-0.5'
        )}
      />
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════
//  MAIN PAGE
// ═══════════════════════════════════════════════════════════════
export default function SettingsPage() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const t = getT(locale);

  // ─── State ───
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sound: true,
  });
  const [privacy, setPrivacy] = useState({
    publicProfile: true,
    showPredictions: false,
  });
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);

  // ─── Mount check (next-themes hydration) ───
  useEffect(() => {
    setMounted(true);
  }, []);

  // ─── Save settings to localStorage ───
  const saveSettings = () => {
    setSaving(true);

    try {
      localStorage.setItem(
        'sportverge:settings',
        JSON.stringify({ notifications, privacy })
      );
    } catch (err) {
      console.error('Save settings error:', err);
    }

    setTimeout(() => {
      setSaving(false);
      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 2500);
    }, 500);
  };

  // ─── Language switch ───
  const switchLanguage = (newLocale: string) => {
    if (newLocale === locale) return;

    const segments = pathname.split('/');
    segments[1] = newLocale;
    const newPath = segments.join('/') || `/${newLocale}`;

    router.push(newPath);
    router.refresh();
  };

  return (
    <div className="relative">
      {/* ═══ Ambient background ═══ */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-lime/4 rounded-full blur-[200px]" />
        <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-teal/4 rounded-full blur-[200px]" />
      </div>

      <div className="relative z-10">
        <Container size="md" padding>
          {/* ═══════════════════════════════════════════════════
              HEADER
          ═══════════════════════════════════════════════════ */}
          <div className="pt-8 lg:pt-12 pb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-lime/10 border border-lime/30 mb-4">
              <Sparkles size={12} className="text-lime" />
              <span className="text-[10px] font-bold text-lime uppercase tracking-widest">
                SportVerge
              </span>
            </div>

            <h1 className="font-heading text-3xl lg:text-4xl xl:text-5xl font-black text-text tracking-tight leading-[1.05]">
              {t.title}
            </h1>

            <p className="mt-3 text-sm lg:text-base text-muted max-w-2xl">
              {t.subtitle}
            </p>
          </div>

          {/* ═══════════════════════════════════════════════════
              SETTINGS SECTIONS
          ═══════════════════════════════════════════════════ */}
          <div className="space-y-5 pb-16">
            {/* ═══ LANGUAGE ═══ */}
            <SectionCard
              icon={Globe}
              title={t.language}
              description={t.languageDesc}
              delay={0}
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {LANGUAGES.map((lang) => {
                  const isActive = locale === lang.code;
                  return (
                    <button
                      key={lang.code}
                      onClick={() => switchLanguage(lang.code)}
                      className={cn(
                        'relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                        isActive
                          ? 'bg-lime/10 border border-lime/40 shadow-[0_0_20px_rgba(217,249,157,0.15)]'
                          : 'bg-surface/60 border border-edge hover:border-lime/30 hover:bg-surface-hover'
                      )}
                    >
                      <span className="text-2xl">{lang.flag}</span>
                      <div className="text-left flex-1 min-w-0">
                        <div
                          className={cn(
                            'text-sm font-semibold truncate',
                            isActive ? 'text-lime' : 'text-text'
                          )}
                        >
                          {lang.label}
                        </div>
                        <div className="text-[10px] text-muted font-mono">
                          {lang.full}
                        </div>
                      </div>
                      {isActive && (
                        <Check size={16} className="text-lime shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </SectionCard>

            {/* ═══ APPEARANCE ═══ */}
            <SectionCard
              icon={Palette}
              title={t.appearance}
              description={t.appearanceDesc}
              delay={0.05}
            >
              <SettingRow
                label={t.theme}
                action={
                  <div className="flex items-center gap-1 p-1 rounded-lg bg-surface-hover border border-edge">
                    {THEMES.map(({ value, icon: Icon }) => (
                      <button
                        key={value}
                        onClick={() => setTheme(value)}
                        disabled={!mounted}
                        className={cn(
                          'p-1.5 rounded-md transition-colors',
                          mounted && theme === value
                            ? 'bg-lime text-ink'
                            : 'text-muted hover:text-text'
                        )}
                        aria-label={value}
                      >
                        <Icon size={14} />
                      </button>
                    ))}
                  </div>
                }
              />
            </SectionCard>

            {/* ═══ NOTIFICATIONS ═══ */}
            <SectionCard
              icon={Bell}
              title={t.notifications}
              description={t.notificationsDesc}
              delay={0.1}
            >
              <SettingRow
                icon={Mail}
                label={t.emailNotif}
                description={t.emailNotifDesc}
                action={
                  <Toggle
                    checked={notifications.email}
                    onChange={(v) =>
                      setNotifications({ ...notifications, email: v })
                    }
                  />
                }
              />
              <SettingRow
                icon={Smartphone}
                label={t.pushNotif}
                description={t.pushNotifDesc}
                action={
                  <Toggle
                    checked={notifications.push}
                    onChange={(v) =>
                      setNotifications({ ...notifications, push: v })
                    }
                  />
                }
              />
              <SettingRow
                icon={Volume2}
                label={t.soundNotif}
                description={t.soundNotifDesc}
                action={
                  <Toggle
                    checked={notifications.sound}
                    onChange={(v) =>
                      setNotifications({ ...notifications, sound: v })
                    }
                  />
                }
              />
            </SectionCard>

            {/* ═══ FAVORITE TEAMS ═══ */}
            <SectionCard
              icon={Heart}
              title={t.favoriteTeams}
              description={t.favoriteTeamsDesc}
              delay={0.15}
            >
              <div className="py-8 text-center border border-dashed border-edge/60 rounded-xl bg-surface/30">
                <Heart size={24} className="text-muted mx-auto mb-3" />
                <p className="text-sm text-muted">{t.noFavorites}</p>
                <button
                  disabled
                  className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium text-muted bg-surface border border-edge opacity-60 cursor-not-allowed"
                >
                  <span>{t.addTeam}</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider text-gold bg-gold/10 border border-gold/30">
                    Soon
                  </span>
                </button>
              </div>
            </SectionCard>

            {/* ═══ PRIVACY ═══ */}
            <SectionCard
              icon={Shield}
              title={t.privacy}
              description={t.privacyDesc}
              delay={0.2}
            >
              <SettingRow
                icon={Eye}
                label={t.publicProfile}
                description={t.publicProfileDesc}
                action={
                  <Toggle
                    checked={privacy.publicProfile}
                    onChange={(v) =>
                      setPrivacy({ ...privacy, publicProfile: v })
                    }
                  />
                }
              />
              <SettingRow
                icon={EyeOff}
                label={t.showPredictions}
                description={t.showPredictionsDesc}
                action={
                  <Toggle
                    checked={privacy.showPredictions}
                    onChange={(v) =>
                      setPrivacy({ ...privacy, showPredictions: v })
                    }
                  />
                }
              />
            </SectionCard>

            {/* ═══ ACCOUNT ═══ */}
            <SectionCard
              icon={User}
              title={t.account}
              description={t.accountDesc}
              delay={0.25}
            >
              <SettingRow
                icon={LogOut}
                label={t.logout}
                action={
                  <button
                    disabled
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-muted bg-surface border border-edge opacity-60 cursor-not-allowed"
                  >
                    {t.comingSoon}
                  </button>
                }
              />
              <SettingRow
                icon={Trash2}
                label={t.deleteAccount}
                description={t.deleteAccountDesc}
                action={
                  <button
                    disabled
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-danger bg-danger/10 border border-danger/30 opacity-60 cursor-not-allowed"
                  >
                    {t.comingSoon}
                  </button>
                }
              />
            </SectionCard>

            {/* ═══════════════════════════════════════════════════
                SAVE BUTTON (sticky)
            ═══════════════════════════════════════════════════ */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="sticky bottom-6 z-20"
            >
              <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-surface/90 backdrop-blur-xl border border-edge shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                <div className="flex items-center gap-2 text-xs text-muted pl-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                  <span>
                    {locale === 'ka'
                      ? 'ცვლილებები შეინახება ავტომატურად'
                      : locale === 'ru'
                      ? 'Изменения сохраняются автоматически'
                      : 'Changes saved automatically'}
                  </span>
                </div>

                <Button
                  onClick={saveSettings}
                  loading={saving}
                  size="sm"
                  rightIcon={
                    !saving && savedMessage ? (
                      <Check size={14} />
                    ) : undefined
                  }
                >
                  {savedMessage ? t.saved : t.save}
                </Button>
              </div>
            </motion.div>
          </div>
        </Container>
      </div>
    </div>
  );
}