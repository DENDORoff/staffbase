/**
 * Импорт/экспорт CSV (разделитель «;», BOM для Excel).
 * Все значения экранируются по RFC 4180 и параметризованы при вставке в БД.
 */

export const CSV_HEADER = [
  "personnel_number",
  "last_name",
  "first_name",
  "middle_name",
  "department",
  "position",
  "hire_date",
  "birth_date",
  "email",
  "phone",
  "salary",
  "status",
] as const;

export function toCsv(rows: Record<string, string | number | null>[]): string {
  const escape = (v: string | number | null): string => {
    const s = v === null || v === undefined ? "" : String(v);
    if (/[;"\n\r]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  };
  const lines = [CSV_HEADER.join(";")];
  for (const row of rows) {
    lines.push(CSV_HEADER.map((h) => escape(row[h] ?? "")).join(";"));
  }
  return "﻿" + lines.join("\r\n");
}

/** Разбирает CSV-текст в объекты. Возвращает строки данных или ошибку с номером строки. */
export function parseCsv(text: string): { rows: Record<string, string>[]; errors: string[] } {
  const clean = text.replace(/^﻿/, "");
  const lines = clean.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return { rows: [], errors: ["Файл пуст"] };

  const splitLine = (line: string): string[] => {
    const out: string[] = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"') {
          if (line[i + 1] === '"') { cur += '"'; i += 1; } else inQuotes = false;
        } else cur += ch;
      } else if (ch === '"') {
        inQuotes = true;
      } else if (ch === ";") {
        out.push(cur); cur = "";
      } else cur += ch;
    }
    out.push(cur);
    return out.map((s) => s.trim());
  };

  const header = splitLine(lines[0]).map((h) => h.toLowerCase());
  const errors: string[] = [];
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cells = splitLine(lines[i]);
    if (cells.length !== header.length) {
      errors.push(`Строка ${i + 1}: ожидалось ${header.length} полей, получено ${cells.length}`);
      continue;
    }
    const obj: Record<string, string> = {};
    header.forEach((h, idx) => { obj[h] = cells[idx]; });
    rows.push(obj);
  }
  return { rows, errors };
}
