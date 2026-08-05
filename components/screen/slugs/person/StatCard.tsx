'use client';

import { ReactNode } from 'react';

interface StatCardProps {
  icon: ReactNode;
  value: string | number;
  label: string;
  colorClass: string;
}

export function StatCard({ icon, value, label, colorClass }: StatCardProps) {
  return (
    <div className="px-2.5 py-2 sm:px-4 sm:py-2.5 bg-pearl/80 dark:bg-pearl/30 border border-border/15 rounded-xl sm:rounded-2xl text-center backdrop-blur-md transition-all duration-300 hover:bg-pearl dark:hover:bg-pearl/50 shadow-xs flex flex-col items-center justify-center min-w-0">
      <div className={`flex items-center justify-center gap-1.5 ${colorClass}`}>
        <span className="shrink-0 flex items-center justify-center">{icon}</span>
        <span className="text-base sm:text-lg font-bold leading-none truncate">{value}</span>
      </div>
      <p className="text-[9px] sm:text-[10px] text-quicksilver uppercase tracking-wider font-bold mt-1 leading-none truncate">{label}</p>
    </div>
  );
}
