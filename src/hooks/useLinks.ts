import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Database, LinkType, Track } from "@/lib/database.types";

export type LinkRow = Database["public"]["Tables"]["links"]["Row"];

export function useLinks(dayNumber?: number) {
  return useQuery<LinkRow[]>({
    queryKey: ["links", dayNumber ?? "all"],
    queryFn: async () => {
      let q = supabase.from("links").select("*").order("created_at", { ascending: false });
      if (dayNumber !== undefined) q = q.eq("day_number", dayNumber);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useAddLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      day_number: number;
      track: Track | null;
      url: string;
      label: string;
      type: LinkType;
    }) => {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) throw new Error("Not signed in");
      const { error } = await supabase.from("links").insert({ ...input, user_id: userId });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["links"] }),
  });
}

export function useDeleteLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("links").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["links"] }),
  });
}
