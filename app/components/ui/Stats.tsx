import React from "react";
import { LucideIcon } from "lucide-react";

interface StatProps {
  label: string;
  value: string;
  icon?: LucideIcon;
  trend?: string;
  trendDirection?: "up" | "down" | "neutral";
}

export default function Stat({ label, value, icon: Icon, trend, trendDirection }: StatProps) {
  const trendColors = {
    up: "text-emerald-600",
    down: "text-rose-600",
    neutral: "text-slate-500",
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2 text-slate-500 mb-1">
        {Icon && <Icon size={14} />}
        <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex items-baseline gap-3">
        <span className="text-2xl font-bold text-slate-900 tracking-tight">{value}</span>
        {trend && (
          <span className={`text-xs font-medium ${trendColors[trendDirection || "neutral"]}`}>
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}
