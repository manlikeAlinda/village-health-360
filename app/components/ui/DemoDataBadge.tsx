import React from "react";
import { FlaskConical } from "lucide-react";

interface DemoDataBadgeProps {
  label?: string;
  className?: string;
}

export default function DemoDataBadge({ label = "Simulated Data", className = "" }: DemoDataBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-amber-100 text-amber-800 border border-amber-300 ${className}`}
      title="This figure is generated for demonstration and is not connected to a live data source."
    >
      <FlaskConical size={10} />
      {label}
    </span>
  );
}
