import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { getSessionUser, canManage } from "@/lib/auth";
import { PageHeader } from "@/components/app/PageHeader";
import { EmployeeForm } from "@/components/app/EmployeeForm";

export const metadata = { title: "Новый сотрудник" };

export default async function NewEmployeePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getSessionUser();
  if (!user || !canManage(user)) redirect("/employees");
  const sp = await searchParams;

  const departments = await sql`SELECT id, name FROM departments ORDER BY name`;
  const positions = await sql`SELECT id, title FROM positions ORDER BY title`;

  const errors: Record<string, string> = {
    csrf: "Сессия истекла — обновите страницу и повторите.",
    validation: "Проверьте заполнение полей: почта, даты и оклад должны быть корректными.",
    duplicate: "Сотрудник с таким табельным номером или почтой уже существует.",
  };

  return (
    <>
      <PageHeader title="Новый сотрудник" description="Карточка создаётся в базе данных сразу после сохранения." />
      <EmployeeForm
        action="/api/employees"
        departments={departments as { id: number; name: string }[]}
        positions={positions as { id: number; title: string }[]}
        csrfToken={user.csrfToken}
        submitLabel="Создать карточку"
        errorMessage={sp.error ? errors[sp.error] ?? "Ошибка сохранения. Попробуйте ещё раз." : null}
      />
    </>
  );
}
