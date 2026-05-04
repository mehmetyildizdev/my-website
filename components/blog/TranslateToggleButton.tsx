"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Languages } from "lucide-react";

interface Props {
  isActive: boolean;
  showingTranslation: boolean;
}

export function TranslateToggleButton({ isActive, showingTranslation }: Props) {
  const pathname = usePathname();

  if (!isActive) return null;

  const href = showingTranslation ? pathname : `${pathname}?translated=1`;

  return (
    <Link
      href={href}
      aria-label={showingTranslation ? "Switch back to English original" : "Switch to Turkish translation"}
      className="group inline-flex w-fit items-center gap-1 px-4 text-sm text-shadow-sm bg-foreground/20 font-medium text-background transition hover:text-foreground"
    >
      <Languages className="h-4 w-4 group-hover:rotate-12 transition-transform duration-300" />
      {showingTranslation ? "🇹🇷 Original" : "🇬🇧 Translate"}
    </Link>
  );
}
