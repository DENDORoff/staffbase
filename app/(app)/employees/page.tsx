import Link from "next/link";
import { sql } from "@/lib/db";
import { getSessionUser, canManage } from "@/lib/auth";
import { PageHeader } from "@/components/app/PageHeader";
import { Icon } from "@/components/Icon";
import { formatDate, formatSalary } from "@/lib/format";
import { SalarySlider } from "@/components/app/SalarySlider";

export const metadata = { title: "Сотрудники" };

const PAGE_SIZE = 10;
const SORTS: Record<string, string> = {
  name: "e.last_name ASC, e.first_name ASC",
  salary: "e.salary",
  hire_date: "e.hire_date",
};

type Row = {
  id: number; personnel_number: string; last_name: string; first_name: string; middle_name: string | null;
  email: string; status: string; salary: string; hire_date: string;
  department: string; position: string;
};

const statusBadge: Record<string, { cls: string; label: string }> = {
  active: { cls: "badge-ok", label: "Работает" },
  vacation: { cls: "badge-warn", label: "В отпуске" },
  sick_leave: { cls: "badge-danger", label: "На больничном" },
  terminated: { cls: "badge-neutral", label: "Уволен(а)" },
};

export default async function EmployeesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const user = await getSessionUser();
  const elevated = user ? canManage(user) : false;

  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const department = typeof sp.department === "string" ? sp.department : "";
  const position = typeof sp.position === "string" ? sp.position : "";
  const status = typeof sp.status === "string" ? sp.status : "";
  const maxSalaryRaw = typeof sp.max_salary === "string" ? Number(sp.max_salary) : null;
  const maxSalary = maxSalaryRaw !== null && !Number.isNaN(maxSalaryRaw) && maxSalaryRaw < 1_000_000 ? maxSalaryRaw : null;
  const sort = typeof sp.sort === "string" && sp.sort in SORTS ? sp.sort : "name";
  const dir = sp.dir === "desc" ? "DESC" : "ASC";
  const page = Math.max(1, Number(typeof sp.page === "string" ? sp.page : "1") || 1);

  const where: string[] = [];
  const params: unknown[] = [];
  if (q) {
    params.push(`%${q}%`);
    where.push(`(e.last_name ILIKE $${params.length} OR e.first_name ILIKE $${params.length} OR e.middle_name ILIKE $${params.length} OR e.personnel_number ILIKE $${params.length} OR e.email ILIKE $${params.length})`);
  }
  if (department) { params.push(department); where.push(`e.department_id = $${params.length}::int`); }
  if (position) { params.push(position); where.push(`e.position_id = $${params.length}::int`); }
  if (status) { params.push(status); where.push(`e.status = $${params.length}`); }
  if (maxSalary !== null && !Number.isNaN(maxSalary)) { params.push(maxSalary); where.push(`e.salary <= $${params.length}`); }
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const orderSql = sort === "name" ? SORTS.name : `${SORTS[sort]} ${dir}, e.last_name ASC`;

  const countRows = await sql.query(`SELECT count(*)::int AS n FROM employees e ${whereSql}`, params);
  const total = countRows[0]?.n ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const listParams = [...params, PAGE_SIZE, (currentPage - 1) * PAGE_SIZE];
  const rows = (await sql.query(
    `SELECT e.id, e.personnel_number, e.last_name, e.first_name, e.middle_name, e.email, e.status, e.salary, e.hire_date,
            d.name AS department, p.title AS position
     FROM employees e
     JOIN departments d ON d.id = e.department_id
     JOIN positions p ON p.id = e.position_id
     ${whereSql}
     ORDER BY ${orderSql}
     LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    listParams
  )) as Row[];

  const departments = await sql`SELECT id, name FROM departments ORDER BY name`;
  const positions = await sql`SELECT id, title FROM positions ORDER BY title`;
  const suggestions = await sql`SELECT personnel_number || ' — ' || last_name || ' ' || first_name AS label FROM employees ORDER BY last_name LIMIT 60`;

  const baseParams = new URLSearchParams();
  if (q) baseParams.set("q", q);
  if (department) baseParams.set("department", department);
  if (position) baseParams.set("position", position);
  if (status) baseParams.set("status", status);
  if (maxSalary !== null && !Number.isNaN(maxSalary)) baseParams.set("max_salary", String(maxSalary));
  if (sort !== "name") baseParams.set("sort", sort);
  if (dir === "DESC") baseParams.set("dir", "desc");

  const pageHref = (p: number) => {
    const prm = new URLSearchParams(baseParams);
    prm.set("page", String(p));
    return `/employees?${prm.toString()}`;
  };
  const sortHref = (col: string) => {
    const prm = new URLSearchParams(baseParams);
    prm.set("sort", col);
    prm.set("dir", sort === col && dir === "ASC" ? "desc" : "asc");
    prm.set("page", "1");
    return `/employees?${prm.toString()}`;
  };
  const sortIcon = (col: string) => (sort === col ? (dir === "ASC" ? " ↑" : " ↓") : "");

  return (
    <>
      <PageHeader
        title="Сотрудники"
        description={`Всего в базе: ${total}. Фильтруйте по отделу, должности и статусу; список выгружается в CSV.`}
      >
        {elevated && (
          <>
            <a href="/employees/export" className="btn btn-ghost btn-sm"><Icon name="download" size={15} />CSV</a>
            <Link href="/employees/import" className="btn btn-ghost btn-sm"><Icon name="upload" size={15} />Импорт</Link>
            <Link href="/employees/new" className="btn btn-primary btn-sm"><Icon name="plus" size={15} />Добавить</Link>
          </>
        )}
      </PageHeader>

      {/* Фильтры */}
      <form method="GET" action="/employees" className="card card-pad grid gap-3 sm:grid-cols-2 lg:grid-cols-12" role="search">
        <div className="sm:col-span-2 lg:col-span-4">
          <label className="label" htmlFor="q">Поиск</label>
          <input className="input" id="q" name="q" defaultValue={q} placeholder="ФИО, табельный номер или почта…" list="employee-suggestions" />
          <datalist id="employee-suggestions">
            {(suggestions as { label: string }[]).map((s) => <option key={s.label} value={s.label.split(" — ")[0]}>{s.label}</option>)}
          </datalist>
        </div>
        <div className="lg:col-span-2">
          <label className="label" htmlFor="department">Отдел</label>
          <select className="input" id="department" name="department" defaultValue={department}>
            <option value="">Все</option>
            {(departments as { id: number; name: string }[]).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div className="lg:col-span-2">
          <label className="label" htmlFor="position">Должность</label>
          <select className="input" id="position" name="position" defaultValue={position}>
            <option value="">Все</option>
            {(positions as { id: number; title: string }[]).map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
        </div>
        <div className="lg:col-span-2">
          <label className="label" htmlFor="status">Статус</label>
          <select className="input" id="status" name="status" defaultValue={status}>
            <option value="">Все</option>
            <option value="active">Работает</option>
            <option value="vacation">В отпуске</option>
            <option value="sick_leave">На больничном</option>
            <option value="terminated">Уволен(а)</option>
          </select>
        </div>
        <div className="flex items-end gap-2 lg:col-span-2">
          <button type="submit" className="btn btn-primary flex-1 justify-center"><Icon name="search" size={16} />Найти</button>
          {(q || department || position || status || maxSalary) && (
            <Link href="/employees" className="btn btn-ghost" aria-label="Сбросить фильтры" title="Сбросить фильтры"><Icon name="x" size={16} /></Link>
          )}
        </div>
        <SalarySlider defaultValue={maxSalaryRaw !== null && !Number.isNaN(maxSalaryRaw) && maxSalaryRaw < 1_000_000 ? maxSalaryRaw : null} />
      </form>

      {/* Таблица */}
      {rows.length > 0 ? (
        <>
          <div className="table-wrap mt-4">
            <table className="data">
              <thead>
                <tr>
                  <th>Таб. №</th>
                  <th><Link href={sortHref("name")}>ФИО{sortIcon("name")}</Link></th>
                  <th>Должность</th>
                  <th>Отдел</th>
                  <th><Link href={sortHref("hire_date")}>Принят{sortIcon("hire_date")}</Link></th>
                  {elevated && <th><Link href={sortHref("salary")}>Оклад{sortIcon("salary")}</Link></th>}
                  <th>Статус</th>
                  <th><span className="sr-only">Действия</span></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((e) => (
                  <tr key={e.id}>
                    <td className="whitespace-nowrap tabular-nums text-text-2">{e.personnel_number}</td>
                    <td>
                      <Link href={`/employees/${e.id}`} className="font-medium text-brand-strong hover:underline">
                        {e.last_name} {e.first_name} {e.middle_name ?? ""}
                      </Link>
                      <span className="block text-xs text-text-2">{e.email}</span>
                    </td>
                    <td>{e.position}</td>
                    <td>{e.department}</td>
                    <td className="whitespace-nowrap tabular-nums text-text-2">{formatDate(e.hire_date)}</td>
                    {elevated && <td className="whitespace-nowrap tabular-nums">{formatSalary(e.salary)}</td>}
                    <td><span className={`badge ${statusBadge[e.status]?.cls ?? "badge-neutral"}`}>{statusBadge[e.status]?.label ?? e.status}</span></td>
                    <td className="text-right"><Link href={`/employees/${e.id}/edit`} className="text-text-2 hover:text-text" aria-label={`Редактировать ${e.last_name}`}><Icon name="edit" size={17} /></Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Пагинация */}
          {totalPages > 1 && (
            <nav className="mt-4 flex items-center justify-between gap-3" aria-label="Страницы списка">
              <p className="text-xs text-text-2">Страница {currentPage} из {totalPages}</p>
              <div className="flex gap-1.5">
                {currentPage > 1 && <Link className="btn btn-ghost btn-sm" href={pageHref(currentPage - 1)}>Назад</Link>}
                {Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, currentPage - 3), Math.max(0, currentPage - 3) + 5).map((p) => (
                  <Link key={p} href={pageHref(p)} aria-current={p === currentPage ? "page" : undefined}
                    className={`btn btn-sm ${p === currentPage ? "btn-primary" : "btn-ghost"}`}>{p}</Link>
                ))}
                {currentPage < totalPages && <Link className="btn btn-ghost btn-sm" href={pageHref(currentPage + 1)}>Вперёд</Link>}
              </div>
            </nav>
          )}
        </>
      ) : (
        <div className="card card-pad mt-4 py-12 text-center">
          <Icon name="search" size={32} className="mx-auto text-text-2" />
          <p className="mt-3 font-bold text-text">Никого не найдено</p>
          <p className="mt-1 text-sm text-text-2">Попробуйте изменить запрос или <Link href="/employees" className="underline underline-offset-2">сбросить фильтры</Link>.</p>
        </div>
      )}
    </>
  );
}
