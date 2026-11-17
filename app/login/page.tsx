import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { getSessionUser } from "@/lib/auth";
import { getDictionary, localeFromCookie } from "@/lib/i18n";
import { PublicFooter } from "@/components/PublicFooter";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";
import { Icon } from "@/components/Icon";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Вход",
  description: "Вход в StaffBase — систему учёта сотрудников ТОО «DeWorld StaffBase».",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; demo?: string }>;
}) {
  const sp = await searchParams;
  const user = await getSessionUser();
  if (user) redirect("/dashboard");

  const jar = await cookies();
  const locale = localeFromCookie(jar.get("sb_locale")?.value);
  const t = getDictionary(locale);
  const error = sp.error;

  return (
    <>
      <main id="main-content" className="flex flex-1 flex-col">
        <header className="border-b border-border bg-surface">
          <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
            <Link href="/" className="flex items-center gap-2.5">
              <Logo size={32} />
              <span className="font-serif text-lg font-bold">StaffBase</span>
            </Link>
            <div className="flex items-center gap-2">
              <LanguageToggle />
              <ThemeToggle compact locale={locale} />
            </div>
          </div>
        </header>

        <section className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2">
          <div className="max-w-md">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand-strong">ТОО «DeWorld StaffBase»</p>
            <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">{t["login.title"]}</h1>
            <p className="mt-3 text-text-2">Внутренний сервис компании. Действует лимит на попытки входа: 5 ошибок — блокировка на 15 минут. Пароли хранятся только в виде хэша (scrypt).</p>
            <ol className="mt-6 space-y-2 text-sm text-text-2">
              {["Введите рабочую почту и пароль", "Получите доступ к разделу вашего уровня", "Списки и заявки сохраняются в базе данных"].map((s, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-soft text-[11px] font-bold text-brand-strong">{i + 1}</span>
                  {s}
                </li>
              ))}
            </ol>
          </div>

          <div className="card card-pad w-full max-w-md lg:justify-self-end">
            <form method="POST" action="/api/auth/login" className="space-y-4" noValidate={false}>
              {error === "invalid" && (
                <p role="alert" className="flex items-start gap-2 rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
                  <Icon name="alert" size={18} className="mt-0.5 shrink-0" />
                  {t["login.errorInvalid"]}
                </p>
              )}
              {error === "locked" && (
                <p role="alert" className="flex items-start gap-2 rounded-lg border border-warn/40 bg-warn/10 px-3 py-2 text-sm text-warn">
                  <Icon name="lock" size={18} className="mt-0.5 shrink-0" />
                  {t["login.errorLocked"]}
                </p>
              )}
              <div>
                <label className="label" htmlFor="email">{t["login.email"]}</label>
                <input className="input" id="email" name="email" type="email" autoComplete="email" required
                  placeholder="name@staffbase.kz" inputMode="email" />
              </div>
              <div>
                <label className="label" htmlFor="password">{t["login.password"]}</label>
                <input className="input" id="password" name="password" type="password" autoComplete="current-password" required
                  placeholder="Минимум 8 символов" />
              </div>
              <button type="submit" className="btn btn-primary w-full justify-center text-base">
                {t["login.submit"]}
                <Icon name="arrowRight" size={18} />
              </button>
            </form>

            <div id="demo" className="mt-5 rounded-lg border border-border bg-surface-2 p-3 text-xs leading-relaxed text-text-2">
              <p className="mb-1 font-bold uppercase tracking-wide text-text">{t["login.demo"]}</p>
              {t["login.demoNote"]}
            </div>
            <p className="mt-4 text-[11px] leading-snug text-text-2">
              Входя в систему, вы подтверждаете, что вам исполнилось 18 лет и вы ознакомились с{" "}
              <Link className="underline underline-offset-2 hover:text-text" href="/legal/consent">согласием на обработку персональных данных</Link>{" "}и{" "}
              <Link className="underline underline-offset-2 hover:text-text" href="/legal/terms">условиями использования</Link>.
            </p>
          </div>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
