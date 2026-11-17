import Link from "next/link";
import { cookies } from "next/headers";
import { sql } from "@/lib/db";
import { getDictionary, localeFromCookie } from "@/lib/i18n";
import { Logo } from "@/components/Logo";
import { Icon, type IconName } from "@/components/Icon";
import { PublicFooter } from "@/components/PublicFooter";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";

export const dynamic = "force-dynamic";

async function getStats() {
  try {
    const rows = await sql`SELECT
      (SELECT count(*) FROM employees WHERE status <> 'terminated')::int AS employees,
      (SELECT count(*) FROM departments)::int AS departments,
      (SELECT count(*) FROM positions)::int AS positions,
      (SELECT count(*) FROM leaves WHERE status = 'pending')::int AS pending`;
    return rows[0] as { employees: number; departments: number; positions: number; pending: number };
  } catch {
    return { employees: 40, departments: 5, positions: 10, pending: 2 };
  }
}

const features: { icon: IconName; title: string; text: string }[] = [
  { icon: "users", title: "Карточки сотрудников", text: "Табельный номер, контакты, дата приёма, должность и отдел в одной карточке. Поиск по ФИО и номеру — мгновенно." },
  { icon: "briefcase", title: "Отделы и должности", text: "Справочники с контролем ссылочной целостности: должность нельзя удалить, пока на ней числится сотрудник." },
  { icon: "calendar", title: "Отпуска и больничные", text: "Заявки с согласованием в один клик: «на рассмотрении → согласован / отклонён», история по каждому сотруднику." },
  { icon: "search", title: "Поиск и фильтры", text: "Фильтры по отделу, должности и статусу, сортировка по дате приёма и окладу, 10 записей на страницу." },
  { icon: "grid", title: "Дашборд", text: "Численность, распределение по отделам, заявки в работе — руководитель видит картину за один экран." },
  { icon: "download", title: "Импорт и экспорт CSV", text: "Выгрузка справочника для Excel в один клик и обратная загрузка с проверкой строк и отчётом об ошибках." },
];

export default async function LandingPage() {
  const jar = await cookies();
  const locale = localeFromCookie(jar.get("sb_locale")?.value);
  const t = getDictionary(locale);
  const stats = await getStats();

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5" aria-label="StaffBase — на главную">
            <Logo size={34} />
            <span className="font-serif text-xl font-bold text-text">StaffBase</span>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-3" aria-label="Основная навигация">
            <LanguageToggle />
            <ThemeToggle compact locale={locale} />
            <Link href="/login" className="btn btn-primary">{t["landing.cta.primary"]}</Link>
          </nav>
        </div>
      </header>

      <main id="main-content" className="flex-1">
        {/* Hero */}
        <section className="mx-auto grid w-full max-w-6xl gap-10 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-12 lg:items-center lg:gap-12 lg:pb-24 lg:pt-16">
          <div className="lg:col-span-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-text-2">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
              {t["app.company"]}
            </p>
            <h1 className="mt-5 text-4xl font-bold leading-[1.12] text-text sm:text-5xl">
              {t["landing.hero.title"]}
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-snug text-text-2">{t["landing.hero.subtitle"]}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/login" className="btn btn-accent text-base">
                {t["landing.cta.primary"]}
                <Icon name="arrowRight" size={18} />
              </Link>
              <Link href="/login?demo=1" className="btn btn-ghost text-base">{t["landing.cta.secondary"]}</Link>
            </div>
            <p className="mt-6 max-w-md text-xs leading-relaxed text-text-2">
              Доступ только для сотрудников компании. Учётные записи выдаёт отдел кадров; самостоятельная регистрация закрыта.
            </p>
          </div>

          {/* Декоративное превью дашборда (чистый CSS, без изображений) */}
          <div className="lg:col-span-6" aria-hidden="true">
            <div className="card overflow-hidden shadow-xl shadow-black/5">
              <div className="flex items-center justify-between border-b border-border bg-surface-2 px-4 py-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-danger/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-accent/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-ok/70" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-text-2">staffbase.deworld.su / обзор</span>
              </div>
              <div className="grid gap-3 p-4 sm:grid-cols-3">
                {[
                  { n: String(stats.employees), l: "сотрудников в штате" },
                  { n: String(stats.departments), l: "отделов компании" },
                  { n: String(stats.pending), l: "заявки ждут решения" },
                ].map((s) => (
                  <div key={s.l} className="rounded-xl border border-border bg-bg p-3">
                    <div className="font-serif text-2xl font-bold text-brand-strong">{s.n}</div>
                    <div className="mt-1 text-[10px] leading-tight text-text-2">{s.l}</div>
                  </div>
                ))}
              </div>
              <div className="border-t border-border p-4">
                {[
                  ["Отдел информационных технологий", 86],
                  ["Отдел эксплуатации", 58],
                  ["Финансовый отдел", 64],
                  ["Отдел кадров", 46],
                  ["Администрация", 34],
                ].map(([label, w]) => (
                  <div key={label as string} className="mb-2.5 grid grid-cols-12 items-center gap-2">
                    <span className="col-span-6 truncate text-[11px] text-text-2 sm:col-span-5">{label}</span>
                    <span className="stat-bar col-span-6 sm:col-span-7"><span style={{ width: `${w}%` }} /></span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Возможности */}
        <section className="border-t border-border bg-surface">
          <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
            <h2 className="text-2xl font-bold text-text sm:text-3xl">{t["landing.features.title"]}</h2>
            <p className="mt-2 max-w-2xl text-text-2">Шесть инструментов, которые закрывают весь цикл кадрового учёта — от приёма сотрудника до отчёта для директора.</p>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f) => (
                <div key={f.title} className="rounded-xl border border-border bg-bg p-5">
                  <span className="inline-flex rounded-lg border border-border bg-surface p-2 text-brand-strong">
                    <Icon name={f.icon} size={22} />
                  </span>
                  <h3 className="mt-3 font-sans text-base font-bold">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-snug text-text-2">{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Как это работает */}
        <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
          <h2 className="text-2xl font-bold text-text sm:text-3xl">Три шага до работающего учёта</h2>
          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              ["1", "Получите учётную запись", "Отдел кадров создаёт логин и временный пароль. При первом входе пароль меняется в настройках."],
              ["2", "Заполните карточки", "40 сотрудников уже перенесены из кадрового журнала. Осталось проверить отделы и должности."],
              ["3", "Работайте с заявками", "Отпуска и больничные согласуются онлайн, дашборд всегда показывает актуальную численность."],
            ].map(([n, title, text]) => (
              <li key={n as string} className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-strong font-serif text-lg font-bold text-white">{n}</span>
                <span>
                  <span className="block font-sans text-base font-bold text-text">{title}</span>
                  <span className="mt-1 block text-sm leading-snug text-text-2">{text}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>

        {/* CTA */}
        <section className="border-t border-[#1d5679]" style={{ background: "#113a52" }}>
          <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-6 px-4 py-12 sm:px-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Готовы заменить бумажный журнал?</h2>
              <p className="mt-2 max-w-md text-sm text-white/80">Войдите по демо-записи и проверьте систему на реальных учебных данных компании.</p>
            </div>
            <Link href="/login?demo=1" className="btn btn-accent text-base">
              Открыть демо-доступ
              <Icon name="arrowRight" size={18} />
            </Link>
          </div>
        </section>
      </main>

      <PublicFooter />
    </>
  );
}
