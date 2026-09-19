import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Track } from "@/lib/database.types";
import {
  gradeToNextState,
  newCardState,
  todayStr,
  type CardState,
  type Grade,
} from "@/lib/sm2";

/** A review card joined up to its plan item, so the queue can render a title. */
export interface ReviewCardRow extends CardState {
  item_id: string;
  last_grade: number | null;
  last_reviewed_on: string; // local date of last_reviewed_at, for strength maths
  title: string;
  leetcode_url: string | null;
  day_number: number;
  track: Track;
}

export function useReviewCards() {
  return useQuery<ReviewCardRow[]>({
    queryKey: ["review_cards"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("review_cards")
        .select(
          `item_id,
           ease_factor,
           interval_days,
           repetitions,
           due_on,
           last_grade,
           last_reviewed_at,
           lapses,
           plan_items!inner (
             title,
             leetcode_url,
             plan_sections!inner ( day_number, track )
           )`
        )
        .order("due_on", { ascending: true });
      if (error) throw error;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (data ?? []).map((row: any) => ({
        item_id: row.item_id as string,
        ease_factor: Number(row.ease_factor),
        interval_days: row.interval_days as number,
        repetitions: row.repetitions as number,
        due_on: row.due_on as string,
        last_grade: row.last_grade as number | null,
        last_reviewed_on: todayStr(new Date(row.last_reviewed_at as string)),
        lapses: row.lapses as number,
        title: row.plan_items.title as string,
        leetcode_url: row.plan_items.leetcode_url as string | null,
        day_number: row.plan_items.plan_sections.day_number as number,
        track: row.plan_items.plan_sections.track as Track,
      }));
    },
  });
}

/**
 * Grade an item. Creates the review card on first grade, otherwise advances
 * its SM-2 schedule. Always appends to the immutable review_log.
 */
export function useGradeCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      itemId,
      grade,
      current,
    }: {
      itemId: string;
      grade: Grade;
      current?: CardState;
    }) => {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) throw new Error("Not signed in");

      const next = gradeToNextState(current ?? newCardState(), grade);

      const { error: cardError } = await supabase.from("review_cards").upsert(
        {
          user_id: userId,
          item_id: itemId,
          ease_factor: next.ease_factor,
          interval_days: next.interval_days,
          repetitions: next.repetitions,
          due_on: next.due_on,
          lapses: next.lapses,
          last_grade: grade,
          last_reviewed_at: new Date().toISOString(),
        },
        { onConflict: "user_id,item_id" }
      );
      if (cardError) throw cardError;

      const { error: logError } = await supabase
        .from("review_log")
        .insert({ user_id: userId, item_id: itemId, grade });
      if (logError) throw logError;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["review_cards"] }),
  });
}
