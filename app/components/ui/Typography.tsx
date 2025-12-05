import React from "react";

interface TypographyProps {
  children: React.ReactNode;
  className?: string;
}

export function H1({ children, className = "" }: TypographyProps) {
  return (
    <h1 className={`text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 ${className}`}>
      {children}
    </h1>
  );
}

export function H2({ children, className = "" }: TypographyProps) {
  return (
    <h2 className={`text-2xl md:text-3xl font-semibold tracking-tight text-slate-900 ${className}`}>
      {children}
    </h2>
  );
}

export function H3({ children, className = "" }: TypographyProps) {
  return (
    <h3 className={`text-lg md:text-xl font-semibold text-slate-900 ${className}`}>
      {children}
    </h3>
  );
}

export function Body({ children, className = "" }: TypographyProps) {
  return (
    <p className={`text-sm md:text-base text-slate-600 leading-relaxed ${className}`}>
      {children}
    </p>
  );
}

export function Label({ children, className = "" }: TypographyProps) {
  return (
    <span className={`text-xs font-bold uppercase tracking-wider text-slate-500 ${className}`}>
      {children}
    </span>
  );
}
