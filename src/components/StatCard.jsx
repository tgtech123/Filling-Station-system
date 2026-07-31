// components/StatCard.jsx
import React from "react";
import { TrendingDown, TrendingUp } from "lucide-react";

const StatCard = ({
  title,
  subtitle,
  value,
  icon,
  trend,
  trendLabel,
  color = "text-blue-600",
}) => {
  // `trend` is a number that can legitimately be 0. `{trend && …}` short-circuits
  // on 0 and React then renders a bare "0" text node — which is the stray second
  // zero that appeared to the right of "₦0" on the Total Commission card.
  // No change means nothing to report, so the block is omitted entirely.
  const hasTrend = trend != null && Number(trend) !== 0 && Number.isFinite(Number(trend));
  const up = Number(trend) > 0;

  return (
    <div className="flex flex-col justify-between bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 p-3 min-w-[200px]">
      {/* Header — gap + min-w-0 + shrink-0 keep a long title such as
          "Average Commission Rate" from running into the icon. */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <span className="min-w-0 flex-1 flex flex-col">
          <p className="text-[13px] font-bold text-neutral-800 dark:text-gray-100 leading-snug text-balance">
            {title}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-snug">{subtitle}</p>
          )}
        </span>

        {/* The icon used to carry mt-[-19px], nudging it out of line with the
            title. Aligned properly instead of pulled up by a magic number. */}
        {icon && (
          <span className="shrink-0 text-neutral-800 dark:text-gray-200 text-2xl leading-none">
            {icon}
          </span>
        )}
      </div>

      {/* Value + Trend */}
      <div className="flex items-end justify-between gap-2 mt-2">
        <div className="min-w-0 text-2xl font-bold tracking-tight">
          <span className={color}>{value}</span>
        </div>

        {hasTrend && (
          /* One row, vertically centred. It was `flex flex-col`, which stacked
             the arrow above the percentage and left it sitting lower than the
             text beside it. */
          <div className="shrink-0 flex items-center gap-1 text-xs whitespace-nowrap">
            {up ? (
              <TrendingUp size={14} className="text-green-500 shrink-0" />
            ) : (
              <TrendingDown size={14} className="text-red-500 shrink-0" />
            )}
            <span className={up ? "text-green-600" : "text-red-600"}>
              {Math.abs(Number(trend))}%
            </span>
            {trendLabel && (
              <span className="text-gray-400 dark:text-gray-500">{trendLabel}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
