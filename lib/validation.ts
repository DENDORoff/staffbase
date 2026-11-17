/** Серверная валидация форм. Возвращает типизированные значения или список ошибок. */

export interface EmployeeInput {
  personnel_number: string;
  last_name: string;
  first_name: string;
  middle_name: string | null;
  department_id: number;
  position_id: number;
  hire_date: string;
  birth_date: string;
  email: string;
  phone: string | null;
  salary: number;
  status: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+7 \d{3} \d{3}-\d{2}-\d{2}$/;
const STATUSES = new Set(["active", "vacation", "sick_leave", "terminated"]);

export function parseEmployeeForm(form: FormData): { ok: true; value: EmployeeInput } | { ok: false; error: string } {
  const s = (name: string) => String(form.get(name) ?? "").trim();

  const personnel_number = s("personnel_number").toUpperCase();
  const last_name = s("last_name");
  const first_name = s("first_name");
  const middle_name = s("middle_name") || null;
  const department_id = Number(s("department_id"));
  const position_id = Number(s("position_id"));
  const hire_date = s("hire_date");
  const birth_date = s("birth_date");
  const email = s("email").toLowerCase();
  const phone = s("phone") || null;
  const salary = Number(s("salary"));
  const status = s("status") || "active";

  if (!/^TB-\d{4}$/.test(personnel_number)) return { ok: false, error: "Табельный номер в формате TB-0041" };
  if (!last_name || last_name.length > 80) return { ok: false, error: "Фамилия обязательна (до 80 символов)" };
  if (!first_name || first_name.length > 80) return { ok: false, error: "Имя обязательно (до 80 символов)" };
  if (middle_name && middle_name.length > 80) return { ok: false, error: "Отчество длиннее 80 символов" };
  if (!Number.isInteger(department_id) || department_id <= 0) return { ok: false, error: "Выберите отдел" };
  if (!Number.isInteger(position_id) || position_id <= 0) return { ok: false, error: "Выберите должность" };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(hire_date) || Number.isNaN(Date.parse(hire_date))) return { ok: false, error: "Дата приёма некорректна" };
  if (hire_date > new Date().toISOString().slice(0, 10)) return { ok: false, error: "Дата приёма не может быть в будущем" };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birth_date) || Number.isNaN(Date.parse(birth_date))) return { ok: false, error: "Дата рождения некорректна" };
  const ageMs = Date.now() - Date.parse(birth_date);
  if (ageMs < 16 * 365.25 * 24 * 3600 * 1000) return { ok: false, error: "Сотруднику должно быть не менее 16 лет" };
  if (!EMAIL_RE.test(email) || email.length > 120) return { ok: false, error: "Почта некорректна" };
  if (phone && !PHONE_RE.test(phone)) return { ok: false, error: "Телефон в формате +7 701 000-00-00" };
  if (!Number.isFinite(salary) || salary < 0 || salary > 100_000_000) return { ok: false, error: "Оклад должен быть от 0 до 100 000 000" };
  if (!STATUSES.has(status)) return { ok: false, error: "Неизвестный статус" };

  return {
    ok: true,
    value: { personnel_number, last_name, first_name, middle_name, department_id, position_id, hire_date, birth_date, email, phone, salary, status },
  };
}
