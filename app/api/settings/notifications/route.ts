import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { guardMutation } from "@/lib/guard";

export async function POST(request: Request) {
  const guard = await guardMutation(request, { errorPath: "/settings" });
  if (!guard.ok) return guard.response;

  const enabled = guard.form.get("notify_email") !== null;
  await sql`UPDATE users SET notify_email = ${enabled} WHERE id = ${guard.user.id}`;
  return NextResponse.redirect(new URL("/settings?saved=1", request.url), 303);
}
