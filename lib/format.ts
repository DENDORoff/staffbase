/** Форматирование дат, денег и дат рождения для интерфейса. */

export function formatDate(iso: string | Date | null | undefined): string {
  if (!iso) return "—";
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function formatSalary(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  const n = Number(value);
  if (Number.isNaN(n)) return "—";
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(n) + " ₸";
}

export function fullName(e: { last_name: string; first_name: string; middle_name?: string | null }): string {
  return [e.last_name, e.first_name, e.middle_name].filter(Boolean).join(" ");
}

/** ТЗ + 7 для Казахстана, только цифры/+ иначе. */
export function normalizePhone(input: string): string {
  const trimmed = input.trim();
  const digits = trimmed.replace(/[^\d+]/g, "");
  return digits;
}
