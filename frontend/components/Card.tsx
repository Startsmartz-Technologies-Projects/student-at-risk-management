import { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-slate-200/90 bg-white/95 shadow-card ring-1 ring-slate-100/70 transition duration-200 ${className}`}
    >
      {children}
    </div>
  );
}
