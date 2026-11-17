import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { getSessionUser, roleLabel } from "@/lib/auth";
import { PageHeader } from "@/components/app/PageHeader";
import { Icon } from "@/components/Icon";

export const metadata = { title: "Пользователи" };

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; created?: string }>;
}) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") redirect("/dashboard");
  const sp = await searchParams;

  const users = await sql`SELECT u.id, u.email, u.full_name, u.role, u.created_at, u.employee_id,
      e.personnel_number
    FROM users u LEFT JOIN employees e ON e.id = u.employee_id
    ORDER BY u.created_at ASC`;

  const employees = await sql`SELECT e.id, e.personnel_number, e.last_name, e.first_name
    FROM employees e WHERE e.id NOT IN (SELECT employee_id FROM users WHERE employee_id IS NOT NULL)
    AND e.status <> 'terminated' ORDER BY e.last_name`;

  const errors: Record<string, string> = {
    csrf: "Сессия истекла — обновите страницу.",
    validation: "Почта, ФИО и пароль (мин. 8 символов) обязательны.",
    duplicate: "Пользователь с такой почтой уже существует.",
    self_delete: "Нельзя удалить собственную учётную запись.",
    last_admin: "Нельзя удалить или понизить единственного администратора.",
    forbidden: "Недостаточно прав.",
  };

  return (
    <>
      <PageHeader title="Пользователи" description="Учётные записи для входа в StaffBase. Сотрудник может быть привязан к карточке один к одному.">
        <span className="badge badge-brand">Всего: {users.length}</span>
      </PageHeader>

      {sp.error && <p role="alert" className="mb-4 rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">{errors[sp.error] ?? "Ошибка. Повторите."}</p>}
      {sp.created && <p role="status" className="mb-4 rounded-lg border border-ok/40 bg-ok/10 px-3 py-2 text-sm text-ok">Пользователь создан.</p>}

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="table-wrap lg:col-span-3">
          <table className="data">
            <thead>
              <tr><th>Пользователь</th><th>Роль</th><th>Карточка</th><th><span className="sr-only">Действия</span></th></tr>
            </thead>
            <tbody>
              {(users as { id: number; email: string; full_name: string; role: "admin" | "manager" | "employee"; personnel_number: string | null }[]).map((u) => (
                <tr key={u.id}>
                  <td>
                    <span className="font-medium text-text">{u.full_name}</span>
                    <span className="block text-xs text-text-2">{u.email}</span>
                  </td>
                  <td>
                    <form method="POST" action={`/api/users/${u.id}/role`} className="flex items-center gap-2">
                      <input type="hidden" name="sb_csrf" value={user.csrfToken} />
                      <select name="role" defaultValue={u.role} className="input !w-auto !py-1 text-xs" aria-label={`Роль ${u.email}`}>
                        <option value="admin">Администратор (HR)</option>
                        <option value="manager">Руководитель</option>
                        <option value="employee">Сотрудник</option>
                      </select>
                      <button className="btn btn-ghost btn-sm" title="Сохранить роль" aria-label="Сохранить роль"><Icon name="check" size={14} /></button>
                    </form>
                  </td>
                  <td className="tabular-nums text-text-2">{u.personnel_number ?? "—"}</td>
                  <td className="text-right">
                    {u.id !== user.id && (
                      <form method="POST" action={`/api/users/${u.id}/delete`}>
                        <input type="hidden" name="sb_csrf" value={user.csrfToken} />
                        <button className="text-text-2 transition-colors hover:text-danger" aria-label={`Удалить ${u.email}`} title="Удалить пользователя">
                          <Icon name="trash" size={17} />
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <form method="POST" action="/api/users" className="card card-pad h-fit lg:col-span-2">
          <input type="hidden" name="sb_csrf" value={user.csrfToken} />
          <h2 className="font-sans text-base font-bold">Новый пользователь</h2>
          <div className="mt-3">
            <label className="label" htmlFor="email">Почта *</label>
            <input className="input" id="email" name="email" type="email" required placeholder="name@staffbase.kz" />
          </div>
          <div className="mt-3">
            <label className="label" htmlFor="full_name">ФИО *</label>
            <input className="input" id="full_name" name="full_name" required maxLength={120} placeholder="Иванов Иван Иванович" />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="role">Роль *</label>
              <select className="input" id="role" name="role" defaultValue="employee">
                <option value="admin">Администратор</option>
                <option value="manager">Руководитель</option>
                <option value="employee">Сотрудник</option>
              </select>
            </div>
            <div>
              <label className="label" htmlFor="employee_id">Карточка</label>
              <select className="input" id="employee_id" name="employee_id" defaultValue="">
                <option value="">Не привязывать</option>
                {(employees as { id: number; personnel_number: string; last_name: string; first_name: string }[]).map((e) => (
                  <option key={e.id} value={e.id}>{e.personnel_number} — {e.last_name} {e.first_name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-3">
            <label className="label" htmlFor="password">Временный пароль *</label>
            <input className="input" id="password" name="password" type="password" required minLength={8} autoComplete="new-password" placeholder="Минимум 8 символов" />
          </div>
          <button type="submit" className="btn btn-primary mt-4"><Icon name="plus" size={16} />Создать пользователя</button>
        </form>
      </div>
    </>
  );
}
