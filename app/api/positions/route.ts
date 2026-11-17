import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { guardMutation, pgErrorCode } from "@/lib/guard";

export async function POST(request: Request) {
  const guard = await guardMutation(request, { manage: true, errorPath: "/positions" });
  if (!guard.ok) return guard.response;
  const { form } = guard;

  const title = String(form.get("title") ?? "").trim();
  const salary_grade = String(form.get("salary_grade") ?? "").trim() || null;

  if (!title || title.length > 120 || (salary_grade && salary_grade.length > 80)) {
    return NextResponse.redirect(new URL("/positions?error=validation", request.url), 303);
  }

  try {
    await sql`INSERT INTO positions (title, salary_grade) VALUES (${title}, ${salary_grade})`;
    return NextResponse.redirect(new URL("/positions?created=1", request.url), 303);
  } catch (err) {
    if (pgErrorCode(err) === "23505") {
      return NextResponse.redirect(new URL("/positions?error=duplicate", request.url), 303);
    }
    console.error("position create failed", err);
    return NextResponse.redirect(new URL("/positions?error=validation", request.url), 303);
  }
}
