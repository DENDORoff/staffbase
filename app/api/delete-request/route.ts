import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(request: Request) {
  const form = await request.formData();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const reason = String(form.get("reason") ?? "").trim() || null;
  const adult = form.get("adult") !== null;

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || !adult || (reason && reason.length > 1000)) {
    return NextResponse.redirect(new URL("/legal/delete-data?error=1", request.url), 303);
  }

  await sql`INSERT INTO data_deletion_requests (email, reason) VALUES (${email}, ${reason})`;
  return NextResponse.redirect(new URL("/legal/delete-data?ok=1", request.url), 303);
}
