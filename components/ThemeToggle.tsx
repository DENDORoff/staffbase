"use client";

import { useEffect, useState } from "react";
import { Icon, type IconName } from "./Icon";

type Theme = "system" | "light" | "dark";

const options: { value: Theme; label: [string, string, string]; icon: IconName }[] = [
  { value: "system", label: ["Системная", "System", "Жүйелік"], icon: "monitor" },
  { value: "light", label: ["Светлая", "Light", "Ашық"], icon: "sun" },
  { value: "dark", label: ["Тёмная", "Dark", "Қараңғы"], icon: "moon" },
];

function apply(theme: Theme) {
  const root = document.documentElement;
  if (theme === "system") delete root.dataset.theme;
  else root.dataset.theme = theme;
}

export function ThemeToggle({ compact = false, locale = "ru" as "ru" | "en" | "kz" }) {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    const m = document.cookie.match(/(?:^|;\s*)sb_theme=(system|light|dark)/);
    setTheme((m?.[1] as Theme) ?? "system");
  }, []);

  const choose = (next: Theme) => {
    setTheme(next);
    apply(next);
    document.cookie = `sb_theme=${next}; path=/; max-age=31536000; samesite=lax`;
  };

  const langIdx = locale === "ru" ? 0 : locale === "en" ? 1 : 2;

  return (
    <div role="radiogroup" aria-label="Тема / Theme / Тақырып" className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface-2 p-1">
      {options.map((opt) => {
        const active = theme === opt.value;
        return (
          <button
            key={opt.value}
            role="radio"
            aria-checked={active}
            title={opt.label[langIdx]}
            onClick={() => choose(opt.value)}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-bold transition-colors ${
              active ? "bg-surface text-text shadow-sm" : "text-text-2 hover:text-text"
            }`}
          >
            <Icon name={opt.icon} size={15} />
            {!compact && <span className="hidden sm:inline">{opt.label[langIdx]}</span>}
          </button>
        );
      })}
    </div>
  );
}
