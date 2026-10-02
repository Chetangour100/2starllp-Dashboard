import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  TrendingDown,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;

  /**
   * Trend can come from backend as a number
   * or as an already formatted string.
   */
  trend?: number | string;

  icon: LucideIcon;
  iconClassName?: string;
  subtitle?: string;
}

export function StatCard({
  title,
  value,
  trend,
  icon: Icon,
  iconClassName,
  subtitle,
}: StatCardProps) {
  /*
   * ------------------------------------------------------
   * TREND
   * ------------------------------------------------------
   *
   * If trend is:
   *   50    -> +50%
   *  -20    -> -20%
   *    0    -> hidden
   *
   * If backend already sends a string:
   *   "+50%" -> +50%
   *   "-20%" -> -20%
   */
  const numericTrend =
    typeof trend === "number"
      ? trend
      : trend !== undefined &&
          trend !== null &&
          trend !== ""
        ? Number(trend)
        : null;

  const hasNumericTrend =
    numericTrend !== null &&
    Number.isFinite(numericTrend);

  const showTrend =
    trend !== undefined &&
    trend !== null &&
    trend !== "" &&
    (!hasNumericTrend || numericTrend !== 0);

  const isNegative =
    hasNumericTrend && numericTrend < 0;

  const formattedTrend =
    hasNumericTrend
      ? `${numericTrend > 0 ? "+" : ""}${numericTrend}%`
      : String(trend);

  return (
    <Card className="border shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          {/* ------------------------------------------------
              LEFT CONTENT
          ------------------------------------------------ */}
          <div className="min-w-0 space-y-2">
            {/* Title */}
            <p className="text-sm font-medium text-muted-foreground">
              {title}
            </p>

            {/* Main Value */}
            <p className="truncate text-2xl font-bold tracking-tight">
              {value}
            </p>

            {/* ------------------------------------------------
                TREND
            ------------------------------------------------ */}
            {showTrend && (
              <p
                className={cn(
                  "flex items-center gap-1 text-xs font-medium",
                  isNegative
                    ? "text-red-600"
                    : "text-emerald-600"
                )}
              >
                {isNegative ? (
                  <TrendingDown className="h-3.5 w-3.5 shrink-0" />
                ) : (
                  <TrendingUp className="h-3.5 w-3.5 shrink-0" />
                )}

                <span>{formattedTrend}</span>
              </p>
            )}

            {/* ------------------------------------------------
                SUBTITLE
            ------------------------------------------------ */}
            {subtitle && (
              <p className="text-xs text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>

          {/* ------------------------------------------------
              ICON
          ------------------------------------------------ */}
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
              iconClassName
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}