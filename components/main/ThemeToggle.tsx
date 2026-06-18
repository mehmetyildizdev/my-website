"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { Switch } from "@/components/main/Switch";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useLayoutEffect(() => {
    setMounted(true);
  }, []);

  const ready = mounted && resolvedTheme !== undefined;
  const isDark = resolvedTheme === "dark";

  const handleToggle = () => {
    setTheme(isDark ? "light" : "dark");
  };

  if (!ready) {
    return (
      <div
        className="flex items-center p-2 rounded opacity-0 pointer-events-none"
        aria-hidden
      >
        <Switch checked disabled className="mx-2" />
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      </div>
    );
  }

  return (
    <div className="flex items-center p-2 rounded">
      <Switch
        checked={isDark}
        onCheckedChange={handleToggle}
        className="mx-2"
        role="switch"
        aria-checked={isDark}
        aria-label="Toggle dark mode"
      />
      <Sun
        className={`h-[1.2rem] w-[1.2rem] ${isDark ? "hidden" : "block"}`}
        aria-hidden={isDark}
      />
      <Moon
        className={`h-[1.2rem] w-[1.2rem] ${isDark ? "block" : "hidden"}`}
        aria-hidden={!isDark}
      />
    </div>
  );
}
