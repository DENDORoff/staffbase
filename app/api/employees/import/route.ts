import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { guardMutation } from "@/lib/guard";
import { parseCsv } from "@/lib/csv";
import { parseEmployeeForm } from "@/lib/validation";

const MAX_FILE = 2 * 1024 * 1024; // 2 МБ

export async function POST(request: Request) {
  const guard = await guardMutation(request, { manage: true, errorPath: "/employees/import" });
  if (!guard.ok) return guard.response;

  const form = guard.form;
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.redirect(new URL("/employees/import?imported=0&failed=1&errors=Файл не выбран", request.url), 303);
  }
  if (file.size > MAX_FILE) {
    return NextResponse.redirect(new URL("/employees/import?imported=0&failed=1&errors=Файл больше 2 МБ", request.url), 303);
  }

  const text = await file.text();
  const { rows, errors: parseErrors } = parseCsv(text);

  const departments = await sql`SELECT id, name FROM departments`;
  const positions = await sql`SELECT id, title FROM positions`;
  const deptByName = new Map((departments as { id: number; name: string }[]).map((d) => [d.name.trim().toLowerCase(), d.id]));
  const posByTitle = new Map((positions as { id: number; title: string }[]).map((p) => [p.title.trim().toLowerCase(), p.id]));

  let imported = 0;
  const errors = [...parseErrors];

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const line = i + 2; // с учётом заголовка
    const deptId = deptByName.get((r.department ?? "").trim().toLowerCase());
    const posId = posByTitle.get((r.position ?? "").trim().toLowerCase());
    if (!deptId) { errors.push(`Строка ${line}: отдел «${r.department}» не найден`); continue; }
    if (!posId) { errors.push(`Строка ${line}: должность «${r.position}» не найдена`); continue; }

    const synthetic = new FormData();
    synthetic.set("personnel_number", r.personnel_number ?? "");
    synthetic.set("last_name", r.last_name ?? "");
    synthetic.set("first_name", r.first_name ?? "");
    synthetic.set("middle_name", r.middle_name ?? "");
    synthetic.set("department_id", String(deptId));
    synthetic.set("position_id", String(posId));
    synthetic.set("hire_date", r.hire_date ?? "");
    synthetic.set("birth_date", r.birth_date ?? "");
    synthetic.set("email", r.email ?? "");
    synthetic.set("phone", r.phone ?? "");
    synthetic.set("salary", r.salary || "0");
    synthetic.set("status", r.status || "active");

    const parsed = parseEmployeeForm(synthetic);
    if (!parsed.ok) { errors.push(`Строка ${line}: ${parsed.error}`); continue; }
    const v = parsed.value;

    try {
      await sql`
        INSERT INTO employees (personnel_number, last_name, first_name, middle_name, position_id, department_id,
                               hire_date, birth_date, email, phone, salary, status)
        VALUES (${v.personnel_number}, ${v.last_name}, ${v.first_name}, ${v.middle_name}, ${v.position_id}, ${v.department_id},
                ${v.hire_date}, ${v.birth_date}, ${v.email}, ${v.phone}, ${v.salary}, ${v.status})
        ON CONFLICT (personnel_number) DO UPDATE SET
          last_name = EXCLUDED.last_name, first_name = EXCLUDED.first_name, middle_name = EXCLUDED.middle_name,
          position_id = EXCLUDED.position_id, department_id = EXCLUDED.department_id,
          hire_date = EXCLUDED.hire_date, birth_date = EXCLUDED.birth_date, email = EXCLUDED.email,
          phone = EXCLUDED.phone, salary = EXCLUDED.salary, status = EXCLUDED.status, updated_at = now()`;
      imported += 1;
    } catch (err) {
      console.error("import row failed", err);
      errors.push(`Строка ${line}: не сохранена (возможен дубликат почты)`);
    }
  }

  const params = new URLSearchParams({
    imported: String(imported),
    failed: String(errors.length),
  });
  if (errors.length) params.set("errors", errors.slice(0, 8).join("\n"));

  return NextResponse.redirect(new URL(`/employees/import?${params.toString()}`, request.url), 303);
}
