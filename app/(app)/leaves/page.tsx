import Link from "next/link";
import { sql } from "@/lib/db";
import { getSessionUser, canManage } from "@/lib/auth";
import { PageHeader } from "@/components/app/PageHeader";
import { Icon } from "@/components/Icon";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Отпуска и больничные" };

const typeLabel: Record<string, string> = { vacation: "Отпуск", sick_leave: "Больничный" };
const statusBadge: Record<string, { cls: string; label: string }> = {
  pending: { cls: "badge-warn", label: "На рассмотрении" },
  approved: { cls: "badge-ok", label: "Согласован" },
  rejected: { cls: "badge-danger", label: "Отклонён" },
};

export default async function LeavesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; error?: string; created?: string }>;
}) {
  const user = await getSessionUser();
  const elevated = user ? canManage(user) : false;
  const sp = await searchParams;
  const tab = sp.tab === "pending" || sp.tab === "approved" ? sp.tab : "all";

  const baseQuery = elevated
    ? `SELECT l.id, l.type, l.starts_on, l.ends_on, l.status, l.comment,
            e.last_name, e.first_name, e.middle_name, e.id AS employee_id
     FROM leaves l JOIN employees e ON e.id = l.employee_id`
    : `SELECT l.id, l.type, l.starts_on, l.ends_on, l.status, l.comment,
            e.last_name, e.first_name, e.middle_name, e.id AS employee_id
     FROM leaves l JOIN employees e ON e.id = l.employee_id
     WHERE l.employee_id = ${user?.employeeId ?? -1}`;

  const tabFilter = tab === "all" ? "" : `${elevated ? "WHERE" : "AND"} l.status = '${tab}'`;
  const order = "ORDER BY (l.status = 'pending') DESC, l.starts_on DESC";
  const leaves = (await sql.query(`${baseQuery} ${tabFilter} ${order}`)) as {
    id: number; type: string; starts_on: string; ends_on: string; status: string; comment: string | null;
    last_name: string; first_name: string; middle_name: string | null; employee_id: number;
  }[];

  const counts = await sql.query(
    elevated
      ? `SELECT count(*)::int AS all, count(*) FILTER (WHERE status = 'pending')::int AS pending, count(*) FILTER (WHERE status = 'approved')::int AS approved FROM leaves`
      : `SELECT count(*)::int AS all, count(*) FILTER (WHERE status = 'pending')::int AS pending, count(*) FILTER (WHERE status = 'approved')::int AS approved FROM leaves WHERE employee_id = ${user?.employeeId ?? -1}`
  );
  const c = (counts[0] ?? { all: 0, pending: 0, approved: 0 }) as { all: number; pending: number; approved: number };

  const tabs = [
    { key: "all", label: `Все · ${c.all}` },
    { key: "pending", label: `На рассмотрении · ${c.pending}` },
    { key: "approved", label: `Согласованные · ${c.approved}` },
  ];

  const errors: Record<string, string> = {
    csrf: "Сессия истекла — обновите страницу.",
    validation: "Проверьте даты: конец не раньше начала, период не больше 90 дней.",
    forbidden: "Недостаточно прав.",
  };

  return (
    <>
      <PageHeader title="Отпуска и больничные" description={elevated ? "Все заявки компании. Согласование меняет статус сотрудника автоматически, если период включает сегодня." : "Ваши заявки и новые обращения."} />

      {sp.error && <p role="alert" className="mb-4 rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">{errors[sp.error] ?? "Ошибка. Повторите."}</p>}
      {sp.created && <p role="status" className="mb-4 rounded-lg border border-ok/40 bg-ok/10 px-3 py-2 text-sm text-ok">Заявка отправлена на рассмотрение.</p>}

      <div className="grid gap-6 lg:grid-cols-5">
        <section className="card card-pad lg:col-span-3" aria-label="Список заявок">
          <div role="tablist" aria-label="Фильтр по статусу" className="flex flex-wrap gap-2">
            {tabs.map((t) => (
              <Link key={t.key} role="tab" aria-selected={tab === t.key} href={`/leaves?tab=${t.key}`}
                className={`rounded-lg px-3 py-1.5 text-sm font-bold transition-colors ${tab === t.key ? "bg-brand-strong text-white" : "bg-surface-2 text-text-2 hover:text-text"}`}>
                {t.label}
              </Link>
            ))}
          </div>

          <ul className="mt-4 divide-y divide-border">
            {leaves.map((l) => (
              <li key={l.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="min-w-0">
                  {elevated && (
                    <Link href={`/employees/${l.employee_id}`} className="block text-sm font-bold text-brand-strong hover:underline">
                      {l.last_name} {l.first_name} {l.middle_name ?? ""}
                    </Link>
                  )}
                  <span className="block text-sm text-text">{typeLabel[l.type]} · <span className="tabular-nums">{formatDate(l.starts_on)} — {formatDate(l.ends_on)}</span></span>
                  {l.comment && <span className="mt-0.5 block text-xs text-text-2">{l.comment}</span>}
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  <span className={`badge ${statusBadge[l.status].cls}`}>{statusBadge[l.status].label}</span>
                  {elevated && l.status === "pending" && (
                    <>
                      <form method="POST" action={`/api/leaves/${l.id}/status`}>
                        <input type="hidden" name="sb_csrf" value={user!.csrfToken} />
                        <input type="hidden" name="status" value="approved" />
                        <button className="btn btn-ghost btn-sm" aria-label="Согласовать заявку" title="Согласовать"><Icon name="check" size={16} className="text-ok" /></button>
                      </form>
                      <form method="POST" action={`/api/leaves/${l.id}/status`}>
                        <input type="hidden" name="sb_csrf" value={user!.csrfToken} />
                        <input type="hidden" name="status" value="rejected" />
                        <button className="btn btn-ghost btn-sm" aria-label="Отклонить заявку" title="Отклонить"><Icon name="x" size={16} className="text-danger" /></button>
                      </form>
                    </>
                  )}
                </span>
              </li>
            ))}
            {leaves.length === 0 && <li className="py-8 text-center text-sm text-text-2">Заявок в этой категории нет.</li>}
          </ul>
        </section>

        <form method="POST" action="/api/leaves" className="card card-pad h-fit lg:col-span-2">
          <input type="hidden" name="sb_csrf" value={user!.csrfToken} />
          <h2 className="font-sans text-base font-bold">Новая заявка</h2>
          <div className="mt-3">
            <label className="label" htmlFor="type">Тип *</label>
            <select className="input" id="type" name="type" required defaultValue="vacation">
              <option value="vacation">Ежегодный отпуск</option>
              <option value="sick_leave">Больничный</option>
            </select>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="starts_on">С *</label>
              <input className="input" id="starts_on" name="starts_on" type="date" required />
            </div>
            <div>
              <label className="label" htmlFor="ends_on">По *</label>
              <input className="input" id="ends_on" name="ends_on" type="date" required />
            </div>
          </div>
          <div className="mt-3">
            <label className="label" htmlFor="comment">Комментарий</label>
            <textarea className="input min-h-20" id="comment" name="comment" maxLength={500} placeholder="Например: номер больничного листа" />
          </div>
          <button type="submit" className="btn btn-primary mt-4"><Icon name="plus" size={16} />Отправить заявку</button>
          <p className="mt-2 text-[11px] text-text-2">Период не более 90 дней. Заявку согласует руководитель или отдел кадров.</p>
        </form>
      </div>
    </>
  );
}
