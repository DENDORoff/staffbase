import { redirect, notFound } from "next/navigation";
import { sql } from "@/lib/db";
import { getSessionUser, canManage } from "@/lib/auth";
import { PageHeader } from "@/components/app/PageHeader";
import { EmployeeForm } from "@/components/app/EmployeeForm";
import { DeleteButton } from "@/components/app/DeleteButton";

export const metadata = { title: "Редактирование сотрудника" };

export default async function EditEmployeePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getSessionUser();
  if (!user || !canManage(user)) redirect("/employees");

  const { id } = await params;
  const employeeId = Number(id);
  if (!Number.isInteger(employeeId) || employeeId <= 0) notFound();
  const sp = await searchParams;

  const rows = await sql`SELECT personnel_number, last_name, first_name, middle_name, department_id, position_id,
      hire_date, birth_date, email, phone, salary, status FROM employees WHERE id = ${employeeId}`;
  if (rows.length === 0) notFound();
  const e = rows[0] as Record<string, unknown>;

  const departments = await sql`SELECT id, name FROM departments ORDER BY name`;
  const positions = await sql`SELECT id, title FROM positions ORDER BY title`;

  const errors: Record<string, string> = {
    csrf: "Сессия истекла — обновите страницу и повторите.",
    validation: "Проверьте заполнение полей: почта, даты и оклад должны быть корректными.",
    duplicate: "Сотрудник с таким табельным номером или почтой уже существует.",
    delete_restrict: "Нельзя удалить сотрудника, у которого есть заявки на отпуск. Сначала удалите заявки.",
  };

  return (
    <>
      <PageHeader title="Редактирование карточки" description={`Изменения сразу сохраняются в базе данных.`} />
      <EmployeeForm
        action={`/api/employees/${employeeId}`}
        values={{
          personnel_number: String(e.personnel_number),
          last_name: String(e.last_name),
          first_name: String(e.first_name),
          middle_name: e.middle_name as string | null,
          department_id: e.department_id as number,
          position_id: e.position_id as number,
          hire_date: String(e.hire_date),
          birth_date: String(e.birth_date),
          email: String(e.email),
          phone: e.phone as string | null,
          salary: String(e.salary),
          status: String(e.status),
        }}
        departments={departments as { id: number; name: string }[]}
        positions={positions as { id: number; title: string }[]}
        csrfToken={user.csrfToken}
        submitLabel="Сохранить изменения"
        errorMessage={sp.error ? errors[sp.error] ?? "Ошибка сохранения. Попробуйте ещё раз." : null}
      />
      {user.role === "admin" && (
        <DeleteButton csrfToken={user.csrfToken} action={`/api/employees/${employeeId}/delete`} />
      )}
    </>
  );
}
