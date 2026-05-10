// Minimal hand-written types matching the migration. Replace with `supabase gen types typescript` later.
export type Track = "DSA" | "DESIGN" | "BEHAVIORAL";
export type Phase = "P1" | "P2" | "P3" | "P4";
export type LinkType = "leetcode" | "youtube" | "article" | "note" | "other";

export type Json = string | number | boolean | null | { [k: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      plan_days: {
        Row: {
          day_number: number;
          phase: Phase;
          dsa_description: string;
          design_description: string;
          behavioral_description: string;
        };
        Insert: {
          day_number: number;
          phase: Phase;
          dsa_description: string;
          design_description: string;
          behavioral_description: string;
        };
        Update: Partial<Database["public"]["Tables"]["plan_days"]["Insert"]>;
        Relationships: [];
      };
      task_completions: {
        Row: {
          id: string;
          user_id: string;
          day_number: number;
          track: Track;
          completed_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          day_number: number;
          track: Track;
          completed_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["task_completions"]["Insert"]>;
        Relationships: [];
      };
      links: {
        Row: {
          id: string;
          user_id: string;
          day_number: number;
          track: Track | null;
          url: string;
          label: string;
          type: LinkType;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          day_number: number;
          track?: Track | null;
          url: string;
          label: string;
          type?: LinkType;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["links"]["Insert"]>;
        Relationships: [];
      };
      daily_notes: {
        Row: {
          id: string;
          user_id: string;
          day_number: number;
          content: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          day_number: number;
          content: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["daily_notes"]["Insert"]>;
        Relationships: [];
      };
      plan_sections: {
        Row: {
          id: string;
          day_number: number;
          track: Track;
          title: string;
          context_note: string | null;
          sort_order: number;
        };
        Insert: {
          id?: string;
          day_number: number;
          track: Track;
          title: string;
          context_note?: string | null;
          sort_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["plan_sections"]["Insert"]>;
        Relationships: [];
      };
      plan_items: {
        Row: {
          id: string;
          section_id: string;
          title: string;
          leetcode_url: string | null;
          difficulty: "Easy" | "Medium" | "Hard" | null;
          sort_order: number;
        };
        Insert: {
          id?: string;
          section_id: string;
          title: string;
          leetcode_url?: string | null;
          difficulty?: "Easy" | "Medium" | "Hard" | null;
          sort_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["plan_items"]["Insert"]>;
        Relationships: [];
      };
      item_completions: {
        Row: {
          id: string;
          user_id: string;
          item_id: string;
          completed_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          item_id: string;
          completed_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["item_completions"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: {
      day_track_item_counts: {
        Row: {
          day_number: number;
          track: Track;
          total_items: number;
        };
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
