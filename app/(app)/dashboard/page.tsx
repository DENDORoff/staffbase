import Link from "next/link";
import { sql } from "@/lib/db";
import { getSessionUser, canManage } from "@/lib/auth";
import { PageHeader } from "@/components/app/PageHeader";
import { Icon } from "@/components/Icon";
import { formatSalary } from "@/lib/format";

export const metadata = { title: "Обзор" };

export default async function DashboardPage() {
  const user = await getSessionUser();
  const elevated = user ? canManage(user) : false;

  const [summary] = await sql`SELECT
    (SELECT count(*) FROM employees WHERE status = 'active')::int AS active,
    (SELECT count(*) FROM employees WHERE status = 'vacation')::int AS vacation,
    (SELECT count(*) FROM employees WHERE status = 'sick_leave')::int AS sick,
    (SELECT count(*) FROM employees WHERE status = 'terminated')::int AS terminated,
    (SELECT count(*) FROM employees WHERE hire_date >= (current_date - interval '30 days'))::int AS fresh,
    (SELECT coalesce(sum(salary),0) FROM employees WHERE status <> 'terminated')::numeric AS payroll`;

  const byDept = await sql`SELECT d.name, count(*)::int AS n
    FROM employees e JOIN departments d ON d.id = e.department_id
    WHERE e.status <> 'terminated'
    GROUP BY d.name ORDER BY n DESC`;
  const maxDept = Math.max(...(byDept as { n: number }[]).map((r) => r.n), 1);

  const pendingLeaves = await sql`SELECT l.id, l.type, l.starts_on, l.ends_on,
      e.last_name, e.first_name, e.middle_name
    FROM leaves l JOIN employees e ON e.id = l.employee_id
    WHERE l.status = 'pending'
    ORDER BY l.starts_on ASC LIMIT 5`;

  const recentHires = await sql`SELECT e.id, e.personnel_number, e.last_name, e.first_name, e.hire_date,
      p.title AS position
    FROM employees e JOIN positions p ON p.id = e.position_id
    ORDER BY e.hire_date DESC LIMIT 4`;

  const tiles = [
    { label: "Работают сейчас", value: summary.active, tone: "text-ok" },
    { label: "В отпуске", value: summary.vacation, tone: "text-warn" },
    { label: "На больничном", value: summary.sick, tone: "text-danger" },
    { label: "Приняты за 30 дней", value: summary.fresh, tone: "text-brand-strong" },
  ];

  return (
    <>
      <PageHeader
        title={`Добрый день, ${user?.fullName.split(" ")[1] ?? "коллега"}`}
        description="Ключевые показатели по компании на сегодня. Данные обновляются при каждом открытии страницы."
      >
        <Link href="/employees" className="btn btn-ghost btn-sm">Все сотрудники <Icon name="arrowRight" size={14} /></Link>
      </PageHeader>

      <section aria-label="Ключевые показатели" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map((t) => (
          <div key={t.label} className="card card-pad">
            <p className={`font-serif text-3xl font-bold ${t.tone}`}>{t.value}</p>
            <p className="mt-1 text-xs leading-tight text-text-2">{t.label}</p>
          </div>
        ))}
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <section className="card card-pad lg:col-span-3" aria-label="Распределение по отделам">
          <h2 className="font-sans text-base font-bold">Численность по отделам</h2>
          <div className="mt-4 space-y-3">
            {(byDept as { name: string; n: number }[]).map((row) => (
              <div key={row.name} className="grid grid-cols-12 items-center gap-2">
                <span className="col-span-12 truncate text-xs text-text-2 sm:col-span-5" title={row.name}>{row.name}</span>
                <span className="stat-bar col-span-9 sm:col-span-5"><span style={{ width: `${(row.n / maxDept) * 100}%` }} /></span>
                <span className="col-span-3 text-right text-xs font-bold tabular-nums text-text sm:col-span-2">{row.n} чел.</span>
              </div>
            ))}
          </div>
          {elevated && (
            <p className="mt-5 border-t border-border pt-4 text-sm text-text-2">
              Фонд оплаты труда в месяц: <strong className="text-text">{formatSalary(summary.payroll)}</strong> (без уволенных)
            </p>
          )}
        </section>

        <section className="card card-pad lg:col-span-2" aria-label="Заявки на рассмотрении">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-sans text-base font-bold">Ждут вашего решения</h2>
            <Link href="/leaves" className="text-xs font-bold text-brand-strong hover:underline">Все заявки</Link>
          </div>
          <ul className="mt-4 divide-y divide-border">
            {(pendingLeaves as { id: number; type: string; starts_on: string; ends_on: string; last_name: string; first_name: string; middle_name: string | null }[]).map((l) => (
              <li key={l.id} className="flex items-center gap-3 py-2.5">
                <Icon name="clock" size={18} className="shrink-0 text-warn" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-text">{l.last_name} {l.first_name}</span>
                  <span className="block text-xs text-text-2">
                    {l.type === "vacation" ? "Отпуск" : "Больничный"} · {new Date(l.starts_on).toLocaleDateString("ru-RU")} — {new Date(l.ends_on).toLocaleDateString("ru-RU")}
                  </span>
                </span>
              </li>
            ))}
            {pendingLeaves.length === 0 && (
              <li className="py-6 text-center text-sm text-text-2">Новых заявок нет — все рассмотрены.</li>
            )}
          </ul>

          <h2 className="mt-6 font-sans text-base font-bold">Недавние приёмы</h2>
          <ul className="mt-3 divide-y divide-border">
            {(recentHires as { id: number; personnel_number: string; last_name: string; first_name: string; hire_date: string; position: string }[]).map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-3 py-2.5">
                <Link href={`/employees/${e.id}`} className="min-w-0 text-sm font-medium text-text hover:underline">
                  {e.last_name} {e.first_name}
                  <span className="block text-xs font-normal text-text-2">{e.position}</span>
                </Link>
                <span className="shrink-0 text-xs tabular-nums text-text-2">{new Date(e.hire_date).toLocaleDateString("ru-RU")}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
