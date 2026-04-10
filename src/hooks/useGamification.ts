import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FEATURES } from "@/config/features";
import {
  scheduleDailyQuizReminder,
  sendStreakWarning,
} from "@/lib/gamification-notifications";

// ── Types ──────────────────────────────────────────────────

export interface UserGamification {
  user_id: string;
  total_points: number;
  month_points: number;
  current_streak: number;
  longest_streak: number;
  last_quiz_date: string | null;
  streak_shields: number;
  updated_at: string;
}

export interface DailyQuestion {
  id: string;
  category: string;
  difficulty: string;
  question: string;
  answer_a: string;
  answer_b: string;
  answer_c: string;
  answer_d: string;
  already_answered?: boolean;
  no_question_available?: boolean;
}

export interface QuizResult {
  is_correct: boolean;
  correct_answer: string;
  explanation: string;
  points_awarded: number;
  streak: number | null;
  milestone_bonus: unknown;
  already_answered: boolean;
}

export interface AnsweredQuestion {
  id: string;
  category: string;
  difficulty: string;
  question: string;
  answer_a: string;
  answer_b: string;
  answer_c: string;
  answer_d: string;
  correct_answer: string;
  explanation: string;
  user_answer: string | null;
  is_correct: boolean;
}

export interface LeaderboardEntry {
  user_id: string;
  full_name: string;
  month_points: number;
  current_streak: number;
  rank: number;
}

export type GamificationAction =
  | "ONBOARDING_ACCOUNT"
  | "ONBOARDING_PROFILE"
  | "ONBOARDING_FIRST_PET"
  | "ONBOARDING_FIRST_PHOTO"
  | "ONBOARDING_FIRST_MAP"
  | "MAP_SERVICE"
  | "REVIEW"
  | "PET_PHOTO"
  | "DAILY_LOGIN"
  | "REFERRAL";

// ── Hook ───────────────────────────────────────────────────

export function useGamification() {
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUserId(session?.user?.id ?? null);
    };
    load();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const enabled = FEATURES.GAMIFICATION && !!userId;

  // ── User stats ──────────────────────────────────────────

  const stats = useQuery<UserGamification | null>({
    queryKey: ["gamification-stats", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_gamification" as any)
        .select("*")
        .eq("user_id", userId!)
        .maybeSingle();

      if (error) throw error;
      return (data as unknown as UserGamification) ?? null;
    },
    enabled,
    staleTime: 30_000,
  });

  // ── Daily question ──────────────────────────────────────

  const dailyQuestion = useQuery<DailyQuestion | null>({
    queryKey: ["daily-question", userId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc(
        "get_daily_question" as any,
        { p_user_id: userId!, p_pet_types: ["All Pets"] }
      );
      if (error) throw error;

      const result = data as unknown as DailyQuestion;
      if (!result || result.already_answered || result.no_question_available) {
        return null;
      }
      return result;
    },
    enabled,
    staleTime: 60_000,
  });

  // ── Today's answered question (review mode) ─────────────

  const answeredToday = useQuery<AnsweredQuestion | null>({
    queryKey: ["answered-today", userId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc(
        "get_todays_answered_question" as any,
        { p_user_id: userId! }
      );
      if (error) throw error;
      return (data as unknown as AnsweredQuestion) ?? null;
    },
    enabled,
    staleTime: 60_000,
  });

  // ── Submit quiz answer ──────────────────────────────────

  const submitAnswer = useMutation<QuizResult, Error, { questionId: string; answer: string }>({
    mutationFn: async ({ questionId, answer }) => {
      const { data, error } = await supabase.rpc(
        "submit_quiz_answer" as any,
        { p_user_id: userId!, p_question_id: questionId, p_answer: answer }
      );
      if (error) throw error;
      return data as unknown as QuizResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gamification-stats", userId] });
      queryClient.invalidateQueries({ queryKey: ["daily-question", userId] });
      queryClient.invalidateQueries({ queryKey: ["answered-today", userId] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
    },
  });

  // ── Record user action ──────────────────────────────────

  const recordAction = useMutation<
    { awarded: number; reason: string },
    Error,
    GamificationAction
  >({
    mutationFn: async (action) => {
      const { data, error } = await supabase.rpc(
        "record_user_action" as any,
        { p_user_id: userId!, p_action: action }
      );
      if (error) throw error;
      return data as unknown as { awarded: number; reason: string };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gamification-stats", userId] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
    },
  });

  // ── Leaderboard ─────────────────────────────────────────

  const leaderboard = useQuery<LeaderboardEntry[]>({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("monthly_leaderboard" as any)
        .select("*")
        .order("rank", { ascending: true })
        .limit(20);

      if (error) throw error;
      return (data as unknown as LeaderboardEntry[]) ?? [];
    },
    enabled,
    staleTime: 60_000,
  });

  // ── Mobile notifications ─────────────────────────────────

  const notificationsScheduled = useRef(false);

  useEffect(() => {
    if (!enabled || !stats.data || notificationsScheduled.current) return;
    notificationsScheduled.current = true;

    scheduleDailyQuizReminder();

    if (stats.data.current_streak >= 3 && dailyQuestion.data) {
      sendStreakWarning(stats.data.current_streak);
    }
  }, [enabled, stats.data, dailyQuestion.data]);

  // ── Daily login tracker ─────────────────────────────────

  const trackDailyLogin = useCallback(async () => {
    if (!enabled) return;
    try {
      await supabase.rpc("record_user_action" as any, {
        p_user_id: userId!,
        p_action: "DAILY_LOGIN",
      });
      queryClient.invalidateQueries({ queryKey: ["gamification-stats", userId] });
    } catch {
      // non-critical, silently fail
    }
  }, [enabled, userId, queryClient]);

  const quizLoading = dailyQuestion.isLoading || answeredToday.isLoading;

  return {
    enabled: FEATURES.GAMIFICATION,
    userId,
    stats: stats.data ?? null,
    statsLoading: stats.isLoading,
    dailyQuestion: dailyQuestion.data ?? null,
    dailyQuestionLoading: dailyQuestion.isLoading,
    answeredToday: answeredToday.data ?? null,
    quizLoading,
    submitAnswer,
    recordAction,
    leaderboard: leaderboard.data ?? [],
    leaderboardLoading: leaderboard.isLoading,
    trackDailyLogin,
  };
}
