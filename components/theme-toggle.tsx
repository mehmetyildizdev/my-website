"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  const handleToggle = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <div className="flex items-center bg-diamond p-2 rounded">
      <Switch
        checked={theme === "dark"}
        onCheckedChange={handleToggle}
        className="mx-2"
      />
      <Sun
        className={`h-[1.2rem] w-[1.2rem] ${theme === "dark" ? "hidden" : "block"}`}
      />
      <Moon
        className={`h-[1.2rem] w-[1.2rem] ${theme === "light" ? "hidden" : "block"}`}
      />
    </div>
  );
}
