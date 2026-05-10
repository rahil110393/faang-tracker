import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Track } from "@/lib/database.types";

export interface CompletionRow {
  day_number: number;
  track: Track;
  completed_at: string;
}

export function useCompletions() {
  return useQuery<CompletionRow[]>({
    queryKey: ["completions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("task_completions")
        .select("day_number, track, completed_at")
        .order("completed_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useToggleCompletion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      day,
      track,
      completed,
    }: {
      day: number;
      track: Track;
      completed: boolean;
    }) => {
      if (completed) {
        const { error } = await supabase
          .from("task_completions")
          .delete()
          .eq("day_number", day)
          .eq("track", track);
        if (error) throw error;
      } else {
        const userId = (await supabase.auth.getUser()).data.user?.id;
        if (!userId) throw new Error("Not signed in");
        const { error } = await supabase
          .from("task_completions")
          .insert({ day_number: day, track, user_id: userId });
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["completions"] }),
  });
}
