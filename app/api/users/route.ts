import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSessionUser, hashPassword } from "@/lib/auth";
import { guardMutation, pgErrorCode } from "@/lib/guard";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ROLES = new Set(["admin", "manager", "employee"]);

export async function POST(request: Request) {
  const session = await getSessionUser();
  if (!session || session.role !== "admin") {
    return NextResponse.redirect(new URL("/admin/users?error=forbidden", request.url), 303);
  }
  const guard = await guardMutation(request, { errorPath: "/admin/users" });
  if (!guard.ok) return guard.response;
  const { form } = guard;

  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const full_name = String(form.get("full_name") ?? "").trim();
  const role = String(form.get("role") ?? "employee");
  const password = String(form.get("password") ?? "");
  const employeeRaw = String(form.get("employee_id") ?? "");
  const employee_id = employeeRaw ? Number(employeeRaw) : null;

  if (!EMAIL_RE.test(email) || !full_name || full_name.length > 120 || password.length < 8 || !ROLES.has(role)) {
    return NextResponse.redirect(new URL("/admin/users?error=validation", request.url), 303);
  }

  try {
    await sql`INSERT INTO users (email, password_hash, full_name, role, employee_id)
              VALUES (${email}, ${hashPassword(password)}, ${full_name}, ${role}, ${employee_id})`;
    return NextResponse.redirect(new URL("/admin/users?created=1", request.url), 303);
  } catch (err) {
    if (pgErrorCode(err) === "23505") {
      return NextResponse.redirect(new URL("/admin/users?error=duplicate", request.url), 303);
    }
    console.error("user create failed", err);
    return NextResponse.redirect(new URL("/admin/users?error=validation", request.url), 303);
  }
}
