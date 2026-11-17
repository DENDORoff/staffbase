import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { guardMutation } from "@/lib/guard";

export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const leaveId = Number(id);
  if (!Number.isInteger(leaveId) || leaveId <= 0) {
    return NextResponse.redirect(new URL("/leaves", request.url), 303);
  }

  const guard = await guardMutation(request, { manage: true, errorPath: "/leaves" });
  if (!guard.ok) return guard.response;

  const status = String(guard.form.get("status") ?? "");
  if (status !== "approved" && status !== "rejected") {
    return NextResponse.redirect(new URL("/leaves?error=validation", request.url), 303);
  }

  const rows = await sql`UPDATE leaves SET status = ${status} WHERE id = ${leaveId} AND status = 'pending'
    RETURNING employee_id, type, starts_on, ends_on`;

  // Если согласованный период включает сегодня — обновляем статус сотрудника
  if (rows.length > 0 && status === "approved") {
    const leave = rows[0] as { employee_id: number; type: string; starts_on: string; ends_on: string };
    const today = new Date().toISOString().slice(0, 10);
    if (String(leave.starts_on).slice(0, 10) <= today && today <= String(leave.ends_on).slice(0, 10)) {
      const newStatus = leave.type === "vacation" ? "vacation" : "sick_leave";
      await sql`UPDATE employees SET status = ${newStatus}, updated_at = now() WHERE id = ${leave.employee_id}`;
    }
  }

  return NextResponse.redirect(new URL("/leaves", request.url), 303);
}
