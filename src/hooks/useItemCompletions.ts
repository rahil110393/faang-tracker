import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Track } from "@/lib/database.types";

export interface ItemCompletionRow {
  item_id: string;
  completed_at: string;
  day_number: number;
  track: Track;
}

export function useItemCompletions() {
  return useQuery<ItemCompletionRow[]>({
    queryKey: ["item_completions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("item_completions")
        .select(
          `item_id,
           completed_at,
           plan_items!inner (
             plan_sections!inner ( day_number, track )
           )`
        )
        .order("completed_at", { ascending: false });
      if (error) throw error;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (data ?? []).map((row: any) => ({
        item_id: row.item_id as string,
        completed_at: row.completed_at as string,
        day_number: row.plan_items.plan_sections.day_number as number,
        track: row.plan_items.plan_sections.track as Track,
      }));
    },
  });
}

export function useToggleItemCompletion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      itemId,
      completed,
    }: {
      itemId: string;
      completed: boolean;
    }) => {
      if (completed) {
        const { error } = await supabase
          .from("item_completions")
          .delete()
          .eq("item_id", itemId);
        if (error) throw error;
      } else {
        const userId = (await supabase.auth.getUser()).data.user?.id;
        if (!userId) throw new Error("Not signed in");
        const { error } = await supabase
          .from("item_completions")
          .insert({ item_id: itemId, user_id: userId });
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["item_completions"] }),
  });
}

/** Fetches total item counts per (day_number, track) from the convenience view. */
export function useDayTrackCounts() {
  return useQuery<{ day_number: number; track: Track; total_items: number }[]>({
    queryKey: ["day_track_item_counts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("day_track_item_counts")
        .select("day_number, track, total_items");
      if (error) throw error;
      return (data ?? []) as { day_number: number; track: Track; total_items: number }[];
    },
    staleTime: Infinity,
  });
}
