import Link from "next/link";
import { notFound } from "next/navigation";
import { sql } from "@/lib/db";
import { getSessionUser, canManage } from "@/lib/auth";
import { PageHeader } from "@/components/app/PageHeader";
import { Icon } from "@/components/Icon";
import { formatDate, formatSalary } from "@/lib/format";

export const metadata = { title: "Карточка сотрудника" };

const statusBadge: Record<string, { cls: string; label: string }> = {
  active: { cls: "badge-ok", label: "Работает" },
  vacation: { cls: "badge-warn", label: "В отпуске" },
  sick_leave: { cls: "badge-danger", label: "На больничном" },
  terminated: { cls: "badge-neutral", label: "Уволен(а)" },
};

export default async function EmployeePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const employeeId = Number(id);
  if (!Number.isInteger(employeeId) || employeeId <= 0) notFound();

  const user = await getSessionUser();
  const elevated = user ? canManage(user) : false;

  const rows = await sql`SELECT e.*, d.name AS department, p.title AS position, p.salary_grade
    FROM employees e
    JOIN departments d ON d.id = e.department_id
    JOIN positions p ON p.id = e.position_id
    WHERE e.id = ${employeeId}`;
  if (rows.length === 0) notFound();
  const e = rows[0] as {
    id: number; personnel_number: string; last_name: string; first_name: string; middle_name: string | null;
    email: string; phone: string | null; hire_date: string; birth_date: string; salary: string; status: string;
    department: string; position: string; salary_grade: string | null; department_id: number; position_id: number;
  };

  const leaves = await sql`SELECT id, type, starts_on, ends_on, status, comment FROM leaves
    WHERE employee_id = ${employeeId} ORDER BY starts_on DESC LIMIT 10`;

  const h = (label: string, value: React.ReactNode) => (
    <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
      <dt className="text-xs font-bold uppercase tracking-wide text-text-2">{label}</dt>
      <dd className="mt-1 text-sm text-text sm:col-span-2 sm:mt-0">{value}</dd>
    </div>
  );

  return (
    <>
      <PageHeader
        title={`${e.last_name} ${e.first_name} ${e.middle_name ?? ""}`.trim()}
        description={`${e.personnel_number} · ${e.position} · ${e.department}`}
      >
        <Link href="/employees" className="btn btn-ghost btn-sm"><Icon name="arrowRight" size={14} className="rotate-180" />К списку</Link>
        {elevated && <Link href={`/employees/${e.id}/edit`} className="btn btn-primary btn-sm"><Icon name="edit" size={15} />Редактировать</Link>}
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-5">
        <section className="card lg:col-span-3" aria-label="Данные сотрудника">
          <dl className="divide-y divide-border px-5">
            {h("Статус", <span className={`badge ${statusBadge[e.status].cls}`}>{statusBadge[e.status].label}</span>)}
            {h("Табельный номер", <span className="tabular-nums">{e.personnel_number}</span>)}
            {h("Должность", <>{e.position}{e.salary_grade && <span className="block text-xs text-text-2">{e.salary_grade}</span>}</>)}
            {h("Отдел", e.department)}
            {h("Почта", <a className="underline-offset-2 hover:underline" href={`mailto:${e.email}`}>{e.email}</a>)}
            {h("Телефон", e.phone ?? "—")}
            {h("Дата приёма", formatDate(e.hire_date))}
            {h("Дата рождения", elevated ? formatDate(e.birth_date) : "скрыто")}
            {elevated && h("Оклад", <span className="tabular-nums font-bold">{formatSalary(e.salary)}</span>)}
          </dl>
        </section>

        <section className="card card-pad lg:col-span-2" aria-label="Отпуска и больничные сотрудника">
          <h2 className="font-sans text-base font-bold">Отпуска и больничные</h2>
          <ul className="mt-3 divide-y divide-border">
            {(leaves as { id: number; type: string; starts_on: string; ends_on: string; status: string; comment: string | null }[]).map((l) => (
              <li key={l.id} className="flex items-start justify-between gap-3 py-2.5">
                <span className="min-w-0">
                  <span className="block text-sm font-medium">{l.type === "vacation" ? "Отпуск" : "Больничный"}</span>
                  <span className="block text-xs text-text-2">{formatDate(l.starts_on)} — {formatDate(l.ends_on)}{l.comment ? ` · ${l.comment}` : ""}</span>
                </span>
                <span className={`badge shrink-0 ${l.status === "approved" ? "badge-ok" : l.status === "pending" ? "badge-warn" : "badge-danger"}`}>
                  {l.status === "approved" ? "Согласован" : l.status === "pending" ? "На рассмотрении" : "Отклонён"}
                </span>
              </li>
            ))}
            {leaves.length === 0 && <li className="py-6 text-center text-sm text-text-2">Заявок не было.</li>}
          </ul>
        </section>
      </div>
    </>
  );
}
