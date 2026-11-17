import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { guardMutation } from "@/lib/guard";
import { verifyPassword, hashPassword } from "@/lib/auth";

export async function POST(request: Request) {
  const guard = await guardMutation(request, { errorPath: "/settings" });
  if (!guard.ok) return guard.response;
  const { user, form } = guard;

  const current = String(form.get("current_password") ?? "");
  const next = String(form.get("new_password") ?? "");
  const confirm = String(form.get("confirm_password") ?? "");

  if (next.length < 8 || next === current) {
    return NextResponse.redirect(new URL("/settings?error=password_short", request.url), 303);
  }
  if (next !== confirm) {
    return NextResponse.redirect(new URL("/settings?error=password_mismatch", request.url), 303);
  }

  const rows = await sql`SELECT password_hash FROM users WHERE id = ${user.id}`;
  if (rows.length === 0 || !verifyPassword(current, String((rows[0] as { password_hash: string }).password_hash))) {
    return NextResponse.redirect(new URL("/settings?error=password_current", request.url), 303);
  }

  await sql`UPDATE users SET password_hash = ${hashPassword(next)} WHERE id = ${user.id}`;
  return NextResponse.redirect(new URL("/settings?saved=1", request.url), 303);
}
