import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { guardMutation, pgErrorCode } from "@/lib/guard";

export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const positionId = Number(id);
  if (!Number.isInteger(positionId) || positionId <= 0) {
    return NextResponse.redirect(new URL("/positions", request.url), 303);
  }

  const guard = await guardMutation(request, { manage: true, errorPath: "/positions" });
  if (!guard.ok) return guard.response;

  try {
    await sql`DELETE FROM positions WHERE id = ${positionId}`;
    return NextResponse.redirect(new URL("/positions", request.url), 303);
  } catch (err) {
    if (pgErrorCode(err) === "23503") {
      return NextResponse.redirect(new URL("/positions?error=restrict", request.url), 303);
    }
    console.error("position delete failed", err);
    return NextResponse.redirect(new URL("/positions?error=restrict", request.url), 303);
  }
}
