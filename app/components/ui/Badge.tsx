import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  intent?: "brand" | "success" | "warning" | "danger" | "neutral" | "dark";
  className?: string;
  size?: "sm" | "md";
}

export default function Badge({ children, intent = "neutral", className = "", size = "md" }: BadgeProps) {
  const styles = {
    brand: "bg-indigo-50 text-indigo-700 border-indigo-100",
    success: "bg-emerald-50 text-emerald-700 border-emerald-100",
    warning: "bg-amber-50 text-amber-700 border-amber-100",
    danger: "bg-rose-50 text-rose-700 border-rose-100",
    neutral: "bg-slate-100 text-slate-600 border-slate-200",
    dark: "bg-slate-800 text-slate-200 border-slate-700",
  };

  const sizes = {
    sm: "px-1.5 py-0.5 text-[10px]",
    md: "px-2.5 py-0.5 text-xs",
  };

  return (
    <span className={`
      inline-flex items-center rounded-full font-medium border
      ${styles[intent]}
      ${sizes[size]}
      ${className}
    `}>
      {children}
    </span>
  );
}
