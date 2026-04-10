import { useState, useMemo } from "react";
import { Brain, CheckCircle2, XCircle, Flame, Star, Clock, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useGamification, type QuizResult } from "@/hooks/useGamification";
import { isNativeApp } from "@/lib/platform";

const ANSWER_KEYS = ["A", "B", "C", "D"] as const;
type AnswerKey = (typeof ANSWER_KEYS)[number];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function useHoursUntilMidnight() {
  return useMemo(() => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    return Math.max(1, Math.ceil((midnight.getTime() - now.getTime()) / 3_600_000));
  }, []);
}

export function DailyQuizModal({ open, onOpenChange }: Props) {
  const { dailyQuestion, answeredToday, submitAnswer, stats } = useGamification();
  const [selected, setSelected] = useState<AnswerKey | null>(null);
  const [result, setResult] = useState<QuizResult | null>(null);
  const submitting = submitAnswer.isPending;
  const hoursLeft = useHoursUntilMidnight();

  const isReviewMode = !dailyQuestion && !!answeredToday;
  const question = dailyQuestion ?? answeredToday;

  if (!question) return null;

  const answers: Record<AnswerKey, string> = {
    A: question.answer_a,
    B: question.answer_b,
    C: question.answer_c,
    D: question.answer_d,
  };

  const handleSelect = (key: AnswerKey) => {
    if (result || submitting || isReviewMode) return;
    setSelected(key);
  };

  const handleSubmit = async () => {
    if (!selected || result || submitting || isReviewMode) return;

    try {
      if (isNativeApp()) {
        try {
          const { Haptics, ImpactStyle } = await import("@capacitor/haptics");
          await Haptics.impact({ style: ImpactStyle.Light });
        } catch { /* haptics unavailable */ }
      }

      const res = await submitAnswer.mutateAsync({
        questionId: question.id,
        answer: selected,
      });
      setResult(res);

      if (isNativeApp()) {
        try {
          const { Haptics, NotificationType } = await import("@capacitor/haptics");
          await Haptics.notification({
            type: res.is_correct
              ? NotificationType.Success
              : NotificationType.Error,
          });
        } catch { /* haptics unavailable */ }
      }
    } catch {
      // mutation error handled by React Query
    }
  };

  const handleClose = () => {
    setSelected(null);
    setResult(null);
    onOpenChange(false);
  };

  const getOptionStyle = (key: AnswerKey) => {
    if (isReviewMode) {
      const correct = answeredToday!.correct_answer.toUpperCase() as AnswerKey;
      const userAnswer = answeredToday!.user_answer?.toUpperCase() as AnswerKey | undefined;
      if (key === correct) return "border-green-500 bg-green-50 dark:bg-green-950/30";
      if (userAnswer && key === userAnswer && !answeredToday!.is_correct)
        return "border-red-500 bg-red-50 dark:bg-red-950/30";
      return "border-border opacity-50";
    }

    if (!result) {
      return selected === key
        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
        : "border-border hover:border-primary/50 hover:bg-accent/50";
    }
    const correct = result.correct_answer.toUpperCase() as AnswerKey;
    if (key === correct) return "border-green-500 bg-green-50 dark:bg-green-950/30";
    if (key === selected && !result.is_correct)
      return "border-red-500 bg-red-50 dark:bg-red-950/30";
    return "border-border opacity-50";
  };

  const showExplanation = isReviewMode || !!result;
  const explanationData = isReviewMode
    ? { is_correct: answeredToday!.is_correct, explanation: answeredToday!.explanation }
    : result
    ? { is_correct: result.is_correct, explanation: result.explanation }
    : null;

  const currentStreak = stats?.current_streak ?? 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            {isReviewMode ? "Today's Quiz — Review" : "Daily Pet Quiz"}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs">
              {question.category}
            </Badge>
            <Badge variant="secondary" className="text-xs capitalize">
              {question.difficulty}
            </Badge>
            {isReviewMode && (
              <Badge
                variant={answeredToday!.is_correct ? "default" : "destructive"}
                className="text-xs"
              >
                {answeredToday!.is_correct ? "Correct" : "Incorrect"}
              </Badge>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Point value & streak context (pre-answer only) */}
          {!isReviewMode && !result && (
            <div className="flex items-center gap-3 text-xs">
              <span className="inline-flex items-center gap-1 font-medium text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/30 rounded-full px-2.5 py-1">
                <Star className="h-3 w-3 fill-current" />
                Worth 10 PawPoints
              </span>
              {currentStreak > 0 && (
                <span className="inline-flex items-center gap-1 font-medium text-orange-500 bg-orange-50 dark:bg-orange-950/30 rounded-full px-2.5 py-1">
                  <Flame className="h-3 w-3" />
                  {currentStreak}-day streak
                </span>
              )}
            </div>
          )}

          <p className="text-sm font-medium leading-relaxed">
            {question.question}
          </p>

          <div className="space-y-2">
            {ANSWER_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                disabled={!!result || submitting || isReviewMode}
                onClick={() => handleSelect(key)}
                className={cn(
                  "w-full flex items-start gap-3 rounded-lg border p-3 text-left text-sm transition-all",
                  getOptionStyle(key),
                  !result && !submitting && !isReviewMode && "cursor-pointer",
                )}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border bg-background text-xs font-semibold">
                  {key}
                </span>
                <span className="pt-0.5">{answers[key]}</span>
              </button>
            ))}
          </div>

          {showExplanation && explanationData && (
            <div
              className={cn(
                "rounded-lg p-3 text-sm relative overflow-hidden",
                explanationData.is_correct
                  ? "bg-green-50 text-green-900 dark:bg-green-950/30 dark:text-green-100"
                  : "bg-red-50 text-red-900 dark:bg-red-950/30 dark:text-red-100",
              )}
            >
              {/* Sparkle animation on correct answer */}
              {explanationData.is_correct && (result || isReviewMode) && (
                <div className="absolute inset-0 pointer-events-none" aria-hidden>
                  <span className="absolute top-1 right-3 animate-sparkle-1 text-yellow-400 text-lg">&#10022;</span>
                  <span className="absolute top-3 right-8 animate-sparkle-2 text-yellow-300 text-sm">&#10022;</span>
                  <span className="absolute bottom-2 right-5 animate-sparkle-3 text-yellow-400 text-xs">&#10022;</span>
                  <span className="absolute top-2 left-[40%] animate-sparkle-2 text-green-400 text-sm">&#10022;</span>
                </div>
              )}

              <div className="flex items-center gap-2 font-semibold mb-1">
                {explanationData.is_correct ? (
                  <>
                    <Sparkles className="h-4 w-4" />
                    {isReviewMode ? "Nice one! You nailed it" : "Correct!"}
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4" />
                    {isReviewMode ? "Not this time — here's why:" : "Not quite"}
                  </>
                )}
              </div>
              <p className="text-xs leading-relaxed opacity-90">
                {explanationData.explanation}
              </p>
              <div className="flex items-center gap-3 mt-2 pt-2 border-t border-current/10 text-xs font-medium">
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                  {result
                    ? `+${result.points_awarded} pts`
                    : explanationData.is_correct
                    ? "+10 pts earned"
                    : "0 pts"
                  }
                </span>
                {result && result.streak != null && (result.streak as number) > 0 && (
                  <span className="flex items-center gap-1">
                    <Flame className="h-3 w-3 text-orange-500" />
                    {result.streak as number}-day streak
                  </span>
                )}
                {!result && currentStreak > 0 && (
                  <span className="flex items-center gap-1">
                    <Flame className="h-3 w-3 text-orange-500" />
                    {currentStreak}-day streak
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Next quiz countdown in review mode */}
          {(isReviewMode || result) && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              Next quiz in ~{hoursLeft} {hoursLeft === 1 ? "hour" : "hours"}
            </div>
          )}

          {!isReviewMode && !result ? (
            <Button
              className="w-full"
              disabled={!selected || submitting}
              onClick={handleSubmit}
            >
              {submitting ? "Checking..." : "Submit Answer"}
            </Button>
          ) : (
            <Button className="w-full" variant="outline" onClick={handleClose}>
              {isReviewMode ? "Close" : "Done"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
