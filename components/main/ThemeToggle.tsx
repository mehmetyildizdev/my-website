"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { Switch } from "@/components/ui/Switch";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  const handleToggle = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <div className="flex items-center p-2 rounded">
      <Switch
        checked={isDark}
        onCheckedChange={handleToggle}
        className="mx-2"
        role="switch"
        aria-checked={isDark ? "true" : "false"}
        aria-label="Toggle dark mode"
        suppressHydrationWarning
      />
      <Sun
        className={`h-[1.2rem] w-[1.2rem] ${isDark ? "hidden" : "block"}`}
        suppressHydrationWarning
      />
      <Moon
        className={`h-[1.2rem] w-[1.2rem] ${isDark ? "block" : "hidden"}`}
        suppressHydrationWarning
      />
    </div>
  );
}
