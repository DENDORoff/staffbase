"use client";

import { useState } from "react";

const MAX = 1_000_000;

/** Ползунок «Оклад не выше» для фильтра сотрудников. */
export function SalarySlider({ defaultValue }: { defaultValue: number | null }) {
  const [value, setValue] = useState<number>(defaultValue ?? MAX);
  const atMax = value >= MAX;

  return (
    <div className="col-span-full mt-1 border-t border-border pt-3">
      <label htmlFor="max_salary" className="mb-1.5 flex items-center justify-between gap-2 text-[0.78rem] font-bold text-text-2">
        <span>Оклад не выше</span>
        <output htmlFor="max_salary" className="tabular-nums text-text">
          {atMax ? "любой" : `${value.toLocaleString("ru-RU")} ₸`}
        </output>
      </label>
      <input
        type="range"
        id="max_salary"
        name="max_salary"
        min={200000}
        max={MAX}
        step={25000}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="h-2 w-full cursor-pointer accent-[var(--accent)]"
        aria-valuetext={atMax ? "любой оклад" : `не выше ${value} тенге`}
      />
      {atMax && <p className="mt-1 text-[11px] text-text-2">Ползунок на максимуме — фильтр по окладу не применяется.</p>}
    </div>
  );
}
