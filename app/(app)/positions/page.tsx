import { sql } from "@/lib/db";
import { getSessionUser, canManage } from "@/lib/auth";
import { PageHeader } from "@/components/app/PageHeader";
import { Icon } from "@/components/Icon";

export const metadata = { title: "Должности" };

export default async function PositionsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; created?: string }>;
}) {
  const user = await getSessionUser();
  const elevated = user ? canManage(user) : false;
  const sp = await searchParams;

  const positions = await sql`SELECT p.id, p.title, p.salary_grade,
      (SELECT count(*) FROM employees e WHERE e.position_id = p.id AND e.status <> 'terminated')::int AS headcount
    FROM positions p ORDER BY p.title`;

  const errors: Record<string, string> = {
    csrf: "Сессия истекла — обновите страницу.",
    duplicate: "Должность с таким названием уже существует.",
    validation: "Название — до 120 символов, категория — до 80.",
    restrict: "Нельзя удалить должность, с которой числятся сотрудники.",
  };

  return (
    <>
      <PageHeader title="Должности" description="Штатное расписание: должность и категория специалиста. Удаление только для пустых должностей.">
        <span className="badge badge-brand">Всего: {positions.length}</span>
      </PageHeader>

      {sp.error && <p role="alert" className="mb-4 rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">{errors[sp.error] ?? "Ошибка. Повторите."}</p>}
      {sp.created && <p role="status" className="mb-4 rounded-lg border border-ok/40 bg-ok/10 px-3 py-2 text-sm text-ok">Должность добавлена.</p>}

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="table-wrap lg:col-span-3">
          <table className="data">
            <thead>
              <tr><th>Должность</th><th>Категория</th><th>Сотрудников</th>{elevated && <th><span className="sr-only">Удалить</span></th>}</tr>
            </thead>
            <tbody>
              {(positions as { id: number; title: string; salary_grade: string | null; headcount: number }[]).map((p) => (
                <tr key={p.id}>
                  <td className="font-medium text-text">{p.title}</td>
                  <td className="text-text-2">{p.salary_grade ?? "—"}</td>
                  <td className="tabular-nums">{p.headcount}</td>
                  {elevated && (
                    <td className="text-right">
                      <form method="POST" action={`/api/positions/${p.id}/delete`}>
                        <input type="hidden" name="sb_csrf" value={user!.csrfToken} />
                        <button className="text-text-2 transition-colors hover:text-danger" aria-label={`Удалить должность ${p.title}`} title="Удалить должность">
                          <Icon name="trash" size={17} />
                        </button>
                      </form>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {elevated && (
          <form method="POST" action="/api/positions" className="card card-pad h-fit lg:col-span-2">
            <input type="hidden" name="sb_csrf" value={user!.csrfToken} />
            <h2 className="font-sans text-base font-bold">Новая должность</h2>
            <div className="mt-3">
              <label className="label" htmlFor="title">Название *</label>
              <input className="input" id="title" name="title" required maxLength={120} placeholder="Инженер-конструктор" />
            </div>
            <div className="mt-3">
              <label className="label" htmlFor="salary_grade">Категория</label>
              <input className="input" id="salary_grade" name="salary_grade" maxLength={80} placeholder="Специалист I категории" />
            </div>
            <button type="submit" className="btn btn-primary mt-4"><Icon name="plus" size={16} />Добавить должность</button>
          </form>
        )}
      </div>
    </>
  );
}
