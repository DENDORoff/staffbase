import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { guardMutation } from "@/lib/guard";

export async function POST(request: Request) {
  const guard = await guardMutation(request, { errorPath: "/leaves" });
  if (!guard.ok) return guard.response;
  const { user, form } = guard;

  const type = String(form.get("type") ?? "");
  const starts_on = String(form.get("starts_on") ?? "");
  const ends_on = String(form.get("ends_on") ?? "");
  const comment = String(form.get("comment") ?? "").trim() || null;

  const employeeId = user.employeeId;
  const validType = type === "vacation" || type === "sick_leave";
  const validDates =
    /^\d{4}-\d{2}-\d{2}$/.test(starts_on) &&
    /^\d{4}-\d{2}-\d{2}$/.test(ends_on) &&
    !Number.isNaN(Date.parse(starts_on)) &&
    !Number.isNaN(Date.parse(ends_on)) &&
    ends_on >= starts_on &&
    (Date.parse(ends_on) - Date.parse(starts_on)) / 86400_000 <= 90;

  if (!employeeId || !validType || !validDates || (comment && comment.length > 500)) {
    return NextResponse.redirect(new URL("/leaves?error=validation", request.url), 303);
  }

  await sql`INSERT INTO leaves (employee_id, type, starts_on, ends_on, status, comment)
            VALUES (${employeeId}, ${type}, ${starts_on}, ${ends_on}, 'pending', ${comment})`;
  return NextResponse.redirect(new URL("/leaves?created=1", request.url), 303);
}
