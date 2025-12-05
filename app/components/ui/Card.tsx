import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  noPadding?: boolean;
}

export default function Card({ children, className = "", hover = false, noPadding = false, ...props }: CardProps) {
  return (
    <div 
      className={`
        bg-white rounded-xl border border-slate-200 shadow-sm
        ${hover ? "transition-all duration-300 hover:shadow-md hover:border-slate-300" : ""}
        ${noPadding ? "" : "p-5"}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
