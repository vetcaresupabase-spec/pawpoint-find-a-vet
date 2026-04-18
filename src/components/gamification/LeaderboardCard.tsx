import { Trophy, Medal, Star, Flame } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useGamification } from "@/hooks/useGamification";

const RANK_STYLES: Record<number, { icon: typeof Trophy; color: string }> = {
  1: { icon: Trophy, color: "text-yellow-500" },
  2: { icon: Medal, color: "text-muted-foreground" },
  3: { icon: Medal, color: "text-amber-700" },
};

export function LeaderboardCard() {
  const { enabled, leaderboard, leaderboardLoading, userId } =
    useGamification();

  if (!enabled) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Trophy className="h-4 w-4 text-yellow-500" />
          Monthly Leaderboard
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-1">
        {leaderboardLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-2">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-12" />
            </div>
          ))
        ) : leaderboard.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No activity this month yet. Be the first!
          </p>
        ) : (
          leaderboard.map((entry) => {
            const rankStyle = RANK_STYLES[entry.rank];
            const RankIcon = rankStyle?.icon;
            const isCurrentUser = entry.user_id === userId;

            return (
              <div
                key={entry.user_id}
                className={cn(
                  "flex items-center gap-3 rounded-md px-2 py-1.5 text-sm transition-colors",
                  isCurrentUser && "bg-primary/5 font-medium",
                )}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center">
                  {RankIcon ? (
                    <RankIcon
                      className={cn("h-4 w-4", rankStyle.color)}
                    />
                  ) : (
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {entry.rank}
                    </span>
                  )}
                </span>

                <span className="flex-1 truncate">
                  {entry.full_name || "Anonymous"}
                  {isCurrentUser && (
                    <span className="ml-1 text-xs text-muted-foreground">
                      (you)
                    </span>
                  )}
                </span>

                <span className="flex items-center gap-1.5 shrink-0">
                  {entry.current_streak > 0 && (
                    <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                      <Flame className="h-3 w-3 text-orange-500" />
                      {entry.current_streak}
                    </span>
                  )}
                  <span className="flex items-center gap-0.5 tabular-nums text-xs">
                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                    {entry.month_points.toLocaleString()}
                  </span>
                </span>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
