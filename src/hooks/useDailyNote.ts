import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export function useDailyNote(day: number) {
  return useQuery<string>({
    queryKey: ["note", day],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("daily_notes")
        .select("content")
        .eq("day_number", day)
        .maybeSingle();
      if (error) throw error;
      return data?.content ?? "";
    },
  });
}

export function useSaveDailyNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ day, content }: { day: number; content: string }) => {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) throw new Error("Not signed in");
      const { error } = await supabase
        .from("daily_notes")
        .upsert(
          { day_number: day, content, user_id: userId, updated_at: new Date().toISOString() },
          { onConflict: "user_id,day_number" },
        );
      if (error) throw error;
    },
    onSuccess: (_d, vars) => qc.invalidateQueries({ queryKey: ["note", vars.day] }),
  });
}
