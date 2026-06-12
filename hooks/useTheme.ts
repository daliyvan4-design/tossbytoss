"use client";

import { useEffect, useState } from "react";

export function useTheme() {
  const [mode, setMode] = useState<"day" | "night">("day");

  useEffect(() => {
    const saved = (localStorage.getItem("tbt-mode") as "day" | "night") ?? "day";
    setMode(saved);
    document.documentElement.dataset.mode = saved;
  }, []);

  function toggle() {
    const next = mode === "day" ? "night" : "day";
    setMode(next);
    document.documentElement.dataset.mode = next;
    localStorage.setItem("tbt-mode", next);
  }

  return { mode, toggle };
}
