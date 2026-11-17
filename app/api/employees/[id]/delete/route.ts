import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { guardMutation, pgErrorCode } from "@/lib/guard";
import { getSessionUser } from "@/lib/auth";

export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const employeeId = Number(id);
  if (!Number.isInteger(employeeId) || employeeId <= 0) {
    return NextResponse.redirect(new URL("/employees", request.url), 303);
  }

  // Удаление разрешено только администратору
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return NextResponse.redirect(new URL(`/employees/${employeeId}/edit?error=forbidden`, request.url), 303);
  }

  const guard = await guardMutation(request, { errorPath: `/employees/${employeeId}/edit` });
  if (!guard.ok) return guard.response;

  try {
    await sql`DELETE FROM employees WHERE id = ${employeeId}`;
    return NextResponse.redirect(new URL("/employees?deleted=1", request.url), 303);
  } catch (err) {
    if (pgErrorCode(err) === "23503") {
      return NextResponse.redirect(new URL(`/employees/${employeeId}/edit?error=delete_restrict`, request.url), 303);
    }
    console.error("employee delete failed", err);
    return NextResponse.redirect(new URL(`/employees/${employeeId}/edit?error=delete_restrict`, request.url), 303);
  }
}
