import { NextResponse } from "next/server";
import { login } from "@/lib/auth";

export async function POST(request: Request) {
  const form = await request.formData();
  const email = String(form.get("email") ?? "");
  const password = String(form.get("password") ?? "");
  if (!email || !password) {
    return NextResponse.redirect(new URL("/login?error=invalid", request.url), 303);
  }
  const result = await login(email, password);
  if (!result.ok) {
    const error = result.error === "locked" ? "locked" : "invalid";
    return NextResponse.redirect(new URL(`/login?error=${error}`, request.url), 303);
  }
  return NextResponse.redirect(new URL("/dashboard", request.url), 303);
}
