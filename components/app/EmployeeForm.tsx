import type { JSX } from "react";

export interface EmployeeFormValues {
  personnel_number?: string;
  last_name?: string;
  first_name?: string;
  middle_name?: string | null;
  department_id?: number | null;
  position_id?: number | null;
  hire_date?: string;
  birth_date?: string;
  email?: string;
  phone?: string | null;
  salary?: string | number | null;
  status?: string;
}

interface Props {
  action: string;
  values?: EmployeeFormValues;
  departments: { id: number; name: string }[];
  positions: { id: number; title: string }[];
  csrfToken: string;
  submitLabel: string;
  errorMessage?: string | null;
}

export function EmployeeForm({ action, values = {}, departments, positions, csrfToken, submitLabel, errorMessage }: Props): JSX.Element {
  const v = values;
  const err = errorMessage ?? null;

  return (
    <form method="POST" action={action} className="card card-pad grid gap-4 sm:grid-cols-2" noValidate={false}>
      <input type="hidden" name="sb_csrf" value={csrfToken} />

      {err && (
        <p role="alert" className="sm:col-span-2 rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">{err}</p>
      )}

      <div>
        <label className="label" htmlFor="personnel_number">Табельный номер *</label>
        <input className="input tabular-nums" id="personnel_number" name="personnel_number" required
          defaultValue={v.personnel_number} placeholder="TB-0041" pattern="TB-\d{4}" title="Формат: TB-0041" />
      </div>
      <div>
        <label className="label" htmlFor="email">Рабочая почта *</label>
        <input className="input" id="email" name="email" type="email" required defaultValue={v.email} placeholder="name@staffbase.kz" />
      </div>

      <div>
        <label className="label" htmlFor="last_name">Фамилия *</label>
        <input className="input" id="last_name" name="last_name" required defaultValue={v.last_name} autoComplete="family-name" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="first_name">Имя *</label>
          <input className="input" id="first_name" name="first_name" required defaultValue={v.first_name} autoComplete="given-name" />
        </div>
        <div>
          <label className="label" htmlFor="middle_name">Отчество</label>
          <input className="input" id="middle_name" name="middle_name" defaultValue={v.middle_name ?? ""} autoComplete="additional-name" />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="department_id">Отдел *</label>
        <select className="input" id="department_id" name="department_id" required defaultValue={v.department_id ?? ""}>
          <option value="" disabled>Выберите отдел</option>
          {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="position_id">Должность *</label>
        <select className="input" id="position_id" name="position_id" required defaultValue={v.position_id ?? ""}>
          <option value="" disabled>Выберите должность</option>
          {positions.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
      </div>

      <div>
        <label className="label" htmlFor="hire_date">Дата приёма *</label>
        <input className="input" id="hire_date" name="hire_date" type="date" required defaultValue={v.hire_date?.slice(0, 10)} />
      </div>
      <div>
        <label className="label" htmlFor="birth_date">Дата рождения *</label>
        <input className="input" id="birth_date" name="birth_date" type="date" required defaultValue={v.birth_date?.slice(0, 10)} />
      </div>

      <div>
        <label className="label" htmlFor="phone">Телефон</label>
        <input className="input tabular-nums" id="phone" name="phone" defaultValue={v.phone ?? ""}
          pattern="\+7 \d{3} \d{3}-\d{2}-\d{2}" placeholder="+7 701 000-00-00" title="Формат: +7 701 000-00-00" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="salary">Оклад, ₸ *</label>
          <input className="input tabular-nums" id="salary" name="salary" type="number" min={0} step={1000} required
            defaultValue={v.salary === null || v.salary === undefined ? "" : Number(v.salary)} />
        </div>
        <div>
          <label className="label" htmlFor="status">Статус</label>
          <select className="input" id="status" name="status" defaultValue={v.status ?? "active"}>
            <option value="active">Работает</option>
            <option value="vacation">В отпуске</option>
            <option value="sick_leave">На больничном</option>
            <option value="terminated">Уволен(а)</option>
          </select>
        </div>
      </div>

      <div className="sm:col-span-2 flex flex-wrap items-center gap-2 border-t border-border pt-4">
        <button type="submit" className="btn btn-primary">{submitLabel}</button>
        <a href="/employees" className="btn btn-ghost">Отмена</a>
        <span className="text-[11px] text-text-2">Поля со звёздочкой обязательны. Формат телефона: +7 701 000-00-00.</span>
      </div>
    </form>
  );
}
