import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { guardMutation, pgErrorCode } from "@/lib/guard";
import { parseEmployeeForm } from "@/lib/validation";

export async function POST(request: Request) {
  const guard = await guardMutation(request, { manage: true, errorPath: "/employees/new" });
  if (!guard.ok) return guard.response;
  const { form } = guard;

  const parsed = parseEmployeeForm(form);
  if (!parsed.ok) {
    return NextResponse.redirect(new URL("/employees/new?error=validation", request.url), 303);
  }
  const v = parsed.value;

  try {
    const rows = await sql`
      INSERT INTO employees (personnel_number, last_name, first_name, middle_name, position_id, department_id,
                             hire_date, birth_date, email, phone, salary, status)
      VALUES (${v.personnel_number}, ${v.last_name}, ${v.first_name}, ${v.middle_name}, ${v.position_id}, ${v.department_id},
              ${v.hire_date}, ${v.birth_date}, ${v.email}, ${v.phone}, ${v.salary}, ${v.status})
      RETURNING id`;
    return NextResponse.redirect(new URL(`/employees/${rows[0].id}?created=1`, request.url), 303);
  } catch (err) {
    if (pgErrorCode(err) === "23505") {
      return NextResponse.redirect(new URL("/employees/new?error=duplicate", request.url), 303);
    }
    console.error("employee create failed", err);
    return NextResponse.redirect(new URL("/employees/new?error=validation", request.url), 303);
  }
}
