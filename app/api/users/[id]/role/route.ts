import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { guardMutation } from "@/lib/guard";

const ROLES = new Set(["admin", "manager", "employee"]);

export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const targetId = Number(id);
  if (!Number.isInteger(targetId) || targetId <= 0) {
    return NextResponse.redirect(new URL("/admin/users", request.url), 303);
  }

  const session = await getSessionUser();
  if (!session || session.role !== "admin") {
    return NextResponse.redirect(new URL("/admin/users?error=forbidden", request.url), 303);
  }

  const guard = await guardMutation(request, { errorPath: "/admin/users" });
  if (!guard.ok) return guard.response;

  const role = String(guard.form.get("role") ?? "");
  if (!ROLES.has(role)) {
    return NextResponse.redirect(new URL("/admin/users?error=validation", request.url), 303);
  }

  // Не даём понизить единственного администратора
  const target = await sql`SELECT role FROM users WHERE id = ${targetId}`;
  if (target.length > 0 && (target[0] as { role: string }).role === "admin" && role !== "admin") {
    const admins = await sql`SELECT count(*)::int AS n FROM users WHERE role = 'admin'`;
    if (((admins[0] as { n: number }).n) <= 1) {
      return NextResponse.redirect(new URL("/admin/users?error=last_admin", request.url), 303);
    }
  }

  await sql`UPDATE users SET role = ${role} WHERE id = ${targetId}`;
  return NextResponse.redirect(new URL("/admin/users", request.url), 303);
}
