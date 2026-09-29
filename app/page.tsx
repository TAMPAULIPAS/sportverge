// ═══════════════════════════════════════════════════════════════
//  SportVerge — Root Page (redirect to default locale)
//  ─────────────────────────────────────────────────────────────
//  ⚡ ეს გვერდი მხოლოდ redirect-ია /ka-ზე
//     მთავარი homepage არის app/[locale]/page.tsx
// ═══════════════════════════════════════════════════════════════

import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/ka');
}