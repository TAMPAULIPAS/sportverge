// ═══════════════════════════════════════════════════════════════
//  SportVerge — Supabase Database Types
//  ─────────────────────────────────────────────────────────────
//  ⚠️  Placeholder — ჩვენ მოგვიანებით auto-generate-ს
// ═══════════════════════════════════════════════════════════════

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T] extends { Row: infer R } ? R : never;

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T] extends { Insert: infer I } ? I : never;

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T] extends { Update: infer U } ? U : never;

export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T];