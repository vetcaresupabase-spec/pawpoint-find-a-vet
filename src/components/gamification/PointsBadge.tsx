import { Star, Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useGamification } from "@/hooks/useGamification";

export function PointsBadge() {
  const { enabled, stats, statsLoading } = useGamification();

  if (!enabled || statsLoading || !stats) return null;

  return (
    <div className="flex items-center gap-1.5">
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="secondary"
            className="gap-1 cursor-default select-none px-2 py-0.5"
          >
            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
            <span className="tabular-nums text-xs font-semibold">
              {stats.total_points.toLocaleString()}
            </span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          <p className="font-medium">Total PawPoints</p>
          <p className="text-muted-foreground">
            This month: {stats.month_points.toLocaleString()}
          </p>
        </TooltipContent>
      </Tooltip>

      {stats.current_streak > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="outline"
              className="gap-1 cursor-default select-none px-2 py-0.5"
            >
              <Flame className="h-3 w-3 text-orange-500" />
              <span className="tabular-nums text-xs font-semibold">
                {stats.current_streak}
              </span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            <p className="font-medium">{stats.current_streak}-day streak</p>
            <p className="text-muted-foreground">
              Longest: {stats.longest_streak} days
            </p>
            {stats.streak_shields > 0 && (
              <p className="text-muted-foreground">
                Shields remaining: {stats.streak_shields}
              </p>
            )}
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
