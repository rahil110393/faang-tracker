import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Track } from "@/lib/database.types";

export interface PlanItemRow {
  id: string;
  title: string;
  leetcode_url: string | null;
  difficulty: "Easy" | "Medium" | "Hard" | null;
  sort_order: number;
}

export interface PlanSectionRow {
  id: string;
  track: Track;
  title: string;
  context_note: string | null;
  sort_order: number;
  items: PlanItemRow[];
}

// Raw shape returned by the nested Supabase select
interface RawSection {
  id: string;
  track: string;
  title: string;
  context_note: string | null;
  sort_order: number;
  items: PlanItemRow[];
}

export function useDayDetail(dayNumber: number) {
  return useQuery<PlanSectionRow[]>({
    queryKey: ["day_detail", dayNumber],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("plan_sections")
        .select(
          `id, track, title, context_note, sort_order,
           items:plan_items (id, title, leetcode_url, difficulty, sort_order)`
        )
        .eq("day_number", dayNumber)
        .order("sort_order");
      if (error) throw error;
      return ((data ?? []) as unknown as RawSection[]).map((section) => ({
        id: section.id,
        track: section.track as Track,
        title: section.title,
        context_note: section.context_note,
        sort_order: section.sort_order,
        items: [...section.items].sort((a, b) => a.sort_order - b.sort_order),
      }));
    },
    staleTime: Infinity,
  });
}
