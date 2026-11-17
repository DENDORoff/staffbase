import { redirect } from "next/navigation";
import { getSessionUser, canManage } from "@/lib/auth";
import { PageHeader } from "@/components/app/PageHeader";
import { Icon } from "@/components/Icon";
import { CSV_HEADER } from "@/lib/csv";

export const metadata = { title: "Импорт сотрудников" };

export default async function ImportPage({
  searchParams,
}: {
  searchParams: Promise<{ imported?: string; failed?: string; errors?: string }>;
}) {
  const user = await getSessionUser();
  if (!user || !canManage(user)) redirect("/employees");
  const sp = await searchParams;

  const imported = sp.imported !== undefined ? Number(sp.imported) : null;
  const failed = sp.failed !== undefined ? Number(sp.failed) : null;
  const errors = sp.errors ? sp.errors.split("\n").filter(Boolean).slice(0, 8) : [];

  return (
    <>
      <PageHeader
        title="Импорт сотрудников из CSV"
        description="Файл с разделителем «;» в кодировке UTF-8. Строка заголовка обязательна. Отдел и должность ищутся по названию."
      />

      <div className="grid gap-6 lg:grid-cols-5">
        <form method="POST" action="/api/employees/import" encType="multipart/form-data" className="card card-pad lg:col-span-3">
          <input type="hidden" name="sb_csrf" value={user.csrfToken} />
          <label className="label" htmlFor="file">Файл CSV</label>
          <input className="input file:mr-3 file:rounded-md file:border-0 file:bg-surface-2 file:px-3 file:py-1.5 file:text-sm file:font-bold" id="file" name="file" type="file" accept=".csv,text/csv" required />
          <p className="mt-2 text-xs text-text-2">До 2 МБ. Строки с ошибками будут пропущены, остальные — загружены. Существующие табельные номера будут обновлены.</p>
          <button type="submit" className="btn btn-primary mt-4"><Icon name="upload" size={16} />Загрузить</button>
        </form>

        <div className="card card-pad lg:col-span-2">
          <h2 className="font-sans text-sm font-bold">Ожидаемые колонки</h2>
          <code className="mt-2 block overflow-x-auto whitespace-nowrap rounded-lg border border-border bg-surface-2 p-3 text-[11px] text-text">
            {CSV_HEADER.join(";")}
          </code>
          <ul className="mt-3 list-disc space-y-1 pl-4 text-xs text-text-2">
            <li><code>hire_date</code>, <code>birth_date</code> — в формате ГГГГ-ММ-ДД</li>
            <li><code>salary</code> — число без пробелов, например 450000</li>
            <li><code>status</code> — active | vacation | sick_leave | terminated</li>
            <li>Дубликаты: <code>personnel_number</code> и <code>email</code> уникальны; при совпадении строка обновляется</li>
          </ul>
          <a href="/employees/export" className="btn btn-ghost btn-sm mt-4"><Icon name="download" size={15} />Скачать выгрузку как образец</a>
        </div>
      </div>

      {imported !== null && (
        <div role="status" className="card card-pad mt-4">
          <p className="font-bold text-text">Загружено: {imported}. Пропущено с ошибками: {failed}.</p>
          {errors.length > 0 && (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-danger">
              {errors.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          )}
        </div>
      )}
    </>
  );
}
