import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { guardMutation, pgErrorCode } from "@/lib/guard";

export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const departmentId = Number(id);
  if (!Number.isInteger(departmentId) || departmentId <= 0) {
    return NextResponse.redirect(new URL("/departments", request.url), 303);
  }

  const guard = await guardMutation(request, { manage: true, errorPath: "/departments" });
  if (!guard.ok) return guard.response;

  try {
    await sql`DELETE FROM departments WHERE id = ${departmentId}`;
    return NextResponse.redirect(new URL("/departments", request.url), 303);
  } catch (err) {
    if (pgErrorCode(err) === "23503") {
      return NextResponse.redirect(new URL("/departments?error=restrict", request.url), 303);
    }
    console.error("department delete failed", err);
    return NextResponse.redirect(new URL("/departments?error=restrict", request.url), 303);
  }
}
