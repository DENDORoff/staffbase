"use client";

import { useEffect, useState } from "react";
import { locales, localeNames, type Locale } from "@/lib/i18n";

export function LanguageToggle() {
  const [locale, setLocale] = useState<Locale>("ru");

  useEffect(() => {
    const m = document.cookie.match(/(?:^|;\s*)sb_locale=(ru|en|kz)/);
    setLocale((m?.[1] as Locale) ?? "ru");
  }, []);

  const choose = (next: Locale) => {
    setLocale(next);
    document.cookie = `sb_locale=${next}; path=/; max-age=31536000; samesite=lax`;
    window.location.reload();
  };

  return (
    <div role="radiogroup" aria-label="Язык / Language / Тіл" className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface-2 p-1">
      {locales.map((l) => {
        const active = locale === l;
        return (
          <button
            key={l}
            role="radio"
            aria-checked={active}
            title={localeNames[l]}
            onClick={() => choose(l)}
            className={`rounded-md px-2 py-1.5 text-xs font-bold uppercase transition-colors ${
              active ? "bg-surface text-text shadow-sm" : "text-text-2 hover:text-text"
            }`}
          >
            {l}
          </button>
        );
      })}
    </div>
  );
}
