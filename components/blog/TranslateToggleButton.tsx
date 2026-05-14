"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Languages } from "lucide-react";
import { Button } from "@/components/shadcn/ui/button";

interface Props {
  isActive: boolean;
  showingTranslation: boolean;
}

export function TranslateToggleButton({ isActive, showingTranslation }: Props) {
  const pathname = usePathname();

  if (!isActive) return null;

  const href = showingTranslation ? pathname : `${pathname}?translated=1`;

  return (
    <Button variant="glass" size="sm" asChild className="rounded-none text-foreground text-shadow-sm">
      <Link
        href={href}
        aria-label={showingTranslation ? "Switch back to English original" : "Switch to Turkish translation"}
        className="group inline-flex items-center gap-1"
      >
        <Languages className="h-4 w-4 group-hover:rotate-12 transition-transform duration-300" />
        {showingTranslation ? "🇹🇷 Original" : "🇬🇧 Translate"}
      </Link>
    </Button>
  );
}
