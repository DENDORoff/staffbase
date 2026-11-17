"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!/(?:^|;\s*)sb_cookie_consent=/.test(document.cookie)) setVisible(true);
  }, []);

  const setChoice = (value: "accepted" | "rejected") => {
    document.cookie = `sb_cookie_consent=${value}; path=/; max-age=15552000; samesite=lax`;
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div role="region" aria-label="Уведомление о cookie" className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-2xl rounded-xl border border-border bg-surface p-4 shadow-lg sm:bottom-6 sm:left-6 sm:right-auto">
      <p className="text-sm leading-snug text-text">
        Мы используем только необходимые cookies: сессия и выбор темы/языка. Аналитика не подключена.{" "}
        <Link href="/legal/cookies" className="font-bold text-brand-strong underline underline-offset-2 hover:opacity-80">
          Политика cookie
        </Link>
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button onClick={() => setChoice("accepted")} className="btn btn-primary btn-sm">Принять</button>
        <button onClick={() => setChoice("rejected")} className="btn btn-ghost btn-sm">Отклонить</button>
      </div>
    </div>
  );
}
