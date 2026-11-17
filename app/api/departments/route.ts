import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { guardMutation, pgErrorCode } from "@/lib/guard";

export async function POST(request: Request) {
  const guard = await guardMutation(request, { manage: true, errorPath: "/departments" });
  if (!guard.ok) return guard.response;
  const { form } = guard;

  const code = String(form.get("code") ?? "").trim().toUpperCase();
  const name = String(form.get("name") ?? "").trim();
  const description = String(form.get("description") ?? "").trim() || null;

  if (!/^[A-Z]{2,10}$/.test(code) || !name || name.length > 120 || (description && description.length > 300)) {
    return NextResponse.redirect(new URL("/departments?error=validation", request.url), 303);
  }

  try {
    await sql`INSERT INTO departments (code, name, description) VALUES (${code}, ${name}, ${description})`;
    return NextResponse.redirect(new URL("/departments?created=1", request.url), 303);
  } catch (err) {
    if (pgErrorCode(err) === "23505") {
      return NextResponse.redirect(new URL("/departments?error=duplicate", request.url), 303);
    }
    console.error("department create failed", err);
    return NextResponse.redirect(new URL("/departments?error=validation", request.url), 303);
  }
}
