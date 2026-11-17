import { sql } from "@/lib/db";
import { getSessionUser, canManage } from "@/lib/auth";
import { toCsv } from "@/lib/csv";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  if (!canManage(user)) return new Response("Forbidden", { status: 403 });

  const rows = await sql`SELECT e.personnel_number, e.last_name, e.first_name, e.middle_name,
      d.name AS department, p.title AS position, e.hire_date, e.birth_date, e.email, e.phone, e.salary, e.status
    FROM employees e
    JOIN departments d ON d.id = e.department_id
    JOIN positions p ON p.id = e.position_id
    ORDER BY e.personnel_number`;

  const csv = toCsv(
    (rows as Record<string, unknown>[]).map((r) => ({
      personnel_number: String(r.personnel_number),
      last_name: String(r.last_name),
      first_name: String(r.first_name),
      middle_name: (r.middle_name as string | null) ?? "",
      department: String(r.department),
      position: String(r.position),
      hire_date: String(r.hire_date).slice(0, 10),
      birth_date: String(r.birth_date).slice(0, 10),
      email: String(r.email),
      phone: (r.phone as string | null) ?? "",
      salary: String(r.salary),
      status: String(r.status),
    }))
  );

  const date = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="staffbase-employees-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
