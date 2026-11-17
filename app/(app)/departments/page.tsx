import { sql } from "@/lib/db";
import { getSessionUser, canManage } from "@/lib/auth";
import { PageHeader } from "@/components/app/PageHeader";
import { Icon } from "@/components/Icon";

export const metadata = { title: "Отделы" };

export default async function DepartmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; created?: string }>;
}) {
  const user = await getSessionUser();
  const elevated = user ? canManage(user) : false;
  const sp = await searchParams;

  const departments = await sql`SELECT d.id, d.code, d.name, d.description,
      (SELECT count(*) FROM employees e WHERE e.department_id = d.id AND e.status <> 'terminated')::int AS headcount
    FROM departments d ORDER BY d.name`;

  const errors: Record<string, string> = {
    csrf: "Сессия истекла — обновите страницу.",
    duplicate: "Отдел с таким кодом или названием уже существует.",
    validation: "Код: 2–10 заглавных латинских букв; название — до 120 символов.",
    restrict: "Нельзя удалить отдел, в котором числятся сотрудники.",
  };

  return (
    <>
      <PageHeader title="Отделы" description="Справочник подразделений компании. Удаление доступно только для пустых отделов.">
        <span className="badge badge-brand">Всего: {departments.length}</span>
      </PageHeader>

      {sp.error && <p role="alert" className="mb-4 rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">{errors[sp.error] ?? "Ошибка. Повторите."}</p>}
      {sp.created && <p role="status" className="mb-4 rounded-lg border border-ok/40 bg-ok/10 px-3 py-2 text-sm text-ok">Отдел добавлен.</p>}

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="table-wrap lg:col-span-3">
          <table className="data">
            <thead>
              <tr><th>Код</th><th>Название</th><th>Сотрудников</th>{elevated && <th><span className="sr-only">Удалить</span></th>}</tr>
            </thead>
            <tbody>
              {(departments as { id: number; code: string; name: string; description: string | null; headcount: number }[]).map((d) => (
                <tr key={d.id}>
                  <td className="font-mono text-xs font-bold text-text-2">{d.code}</td>
                  <td>
                    <span className="font-medium text-text">{d.name}</span>
                    {d.description && <span className="block text-xs text-text-2">{d.description}</span>}
                  </td>
                  <td className="tabular-nums">{d.headcount}</td>
                  {elevated && (
                    <td className="text-right">
                      <form method="POST" action={`/api/departments/${d.id}/delete`}>
                        <input type="hidden" name="sb_csrf" value={user!.csrfToken} />
                        <button className="text-text-2 transition-colors hover:text-danger" aria-label={`Удалить отдел ${d.name}`} title="Удалить отдел">
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
          <form method="POST" action="/api/departments" className="card card-pad h-fit lg:col-span-2">
            <input type="hidden" name="sb_csrf" value={user!.csrfToken} />
            <h2 className="font-sans text-base font-bold">Новый отдел</h2>
            <div className="mt-3">
              <label className="label" htmlFor="code">Код *</label>
              <input className="input uppercase" id="code" name="code" required pattern="[A-Z]{2,10}" placeholder="DEV" title="2–10 заглавных латинских букв" />
            </div>
            <div className="mt-3">
              <label className="label" htmlFor="name">Название *</label>
              <input className="input" id="name" name="name" required maxLength={120} placeholder="Отдел разработки" />
            </div>
            <div className="mt-3">
              <label className="label" htmlFor="description">Описание</label>
              <textarea className="input min-h-20" id="description" name="description" maxLength={300} placeholder="Чем занимается отдел" />
            </div>
            <button type="submit" className="btn btn-primary mt-4"><Icon name="plus" size={16} />Добавить отдел</button>
          </form>
        )}
      </div>
    </>
  );
}
