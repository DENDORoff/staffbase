import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { guardMutation } from "@/lib/guard";

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
  if (session.id === targetId) {
    return NextResponse.redirect(new URL("/admin/users?error=self_delete", request.url), 303);
  }

  const guard = await guardMutation(request, { errorPath: "/admin/users" });
  if (!guard.ok) return guard.response;

  const target = await sql`SELECT role FROM users WHERE id = ${targetId}`;
  if (target.length === 0) {
    return NextResponse.redirect(new URL("/admin/users", request.url), 303);
  }
  if ((target[0] as { role: string }).role === "admin") {
    const admins = await sql`SELECT count(*)::int AS n FROM users WHERE role = 'admin'`;
    if (((admins[0] as { n: number }).n) <= 1) {
      return NextResponse.redirect(new URL("/admin/users?error=last_admin", request.url), 303);
    }
  }

  await sql`DELETE FROM users WHERE id = ${targetId}`;
  return NextResponse.redirect(new URL("/admin/users", request.url), 303);
}
