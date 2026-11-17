import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { guardMutation, pgErrorCode } from "@/lib/guard";
import { parseEmployeeForm } from "@/lib/validation";

export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const employeeId = Number(id);
  if (!Number.isInteger(employeeId) || employeeId <= 0) {
    return NextResponse.redirect(new URL("/employees?error=validation", request.url), 303);
  }

  const guard = await guardMutation(request, { manage: true, errorPath: `/employees/${employeeId}/edit` });
  if (!guard.ok) return guard.response;
  const { form } = guard;

  const parsed = parseEmployeeForm(form);
  if (!parsed.ok) {
    return NextResponse.redirect(new URL(`/employees/${employeeId}/edit?error=validation`, request.url), 303);
  }
  const v = parsed.value;

  try {
    await sql`
      UPDATE employees SET
        personnel_number = ${v.personnel_number},
        last_name = ${v.last_name},
        first_name = ${v.first_name},
        middle_name = ${v.middle_name},
        position_id = ${v.position_id},
        department_id = ${v.department_id},
        hire_date = ${v.hire_date},
        birth_date = ${v.birth_date},
        email = ${v.email},
        phone = ${v.phone},
        salary = ${v.salary},
        status = ${v.status},
        updated_at = now()
      WHERE id = ${employeeId}`;
    return NextResponse.redirect(new URL(`/employees/${employeeId}?saved=1`, request.url), 303);
  } catch (err) {
    if (pgErrorCode(err) === "23505") {
      return NextResponse.redirect(new URL(`/employees/${employeeId}/edit?error=duplicate`, request.url), 303);
    }
    console.error("employee update failed", err);
    return NextResponse.redirect(new URL(`/employees/${employeeId}/edit?error=validation`, request.url), 303);
  }
}
