import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Phase } from "@/lib/database.types";

export interface PlanDayRow {
  day_number: number;
  phase: Phase;
}

export function usePlanDays() {
  return useQuery<PlanDayRow[]>({
    queryKey: ["plan_days"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("plan_days")
        .select("day_number, phase")
        .order("day_number");
      if (error) throw error;
      return (data ?? []) as PlanDayRow[];
    },
    staleTime: Infinity,
  });
}
