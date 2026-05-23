"use client";

import {
  WEEK_DAYS,
  formatSchedule,
  parseSchedule,
  type DayKey,
  type ScheduleValue,
} from "@/lib/schedule-utils";

type SchedulePickerProps = {
  value: string;
  onChange: (formatted: string) => void;
};

export function SchedulePicker({ value, onChange }: SchedulePickerProps) {
  const schedule = parseSchedule(value);

  const update = (next: ScheduleValue) => {
    onChange(formatSchedule(next));
  };

  const toggleDay = (key: DayKey) => {
    const days = schedule.days.includes(key)
      ? schedule.days.filter((d) => d !== key)
      : [...schedule.days, key];
    update({ ...schedule, days });
  };

  const timeInputClass =
    "w-full rounded-2xl border border-[#E5EAF3] bg-[#F5F7FB] px-4 py-2.5 text-sm text-[#0A1733] outline-none transition focus:border-[#0B57F0]/40 focus:ring-2 focus:ring-[#0B57F0]/10";

  return (
    <div className="space-y-4">
      <span className="block text-sm font-medium text-[#0A1733]">Horario</span>

      <div>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#5B6475]">
          Días
        </p>
        <div className="flex flex-wrap gap-2">
          {WEEK_DAYS.map((day) => {
            const selected = schedule.days.includes(day.key);
            return (
              <button
                key={day.key}
                type="button"
                onClick={() => toggleDay(day.key)}
                className={`min-w-[2.75rem] rounded-full px-3 py-2 text-sm font-semibold transition ${
                  selected
                    ? "bg-[#0B57F0] text-white shadow-sm"
                    : "border border-[#E5EAF3] bg-white text-[#5B6475] hover:border-[#0B57F0]/30 hover:bg-[#0B57F0]/5"
                }`}
              >
                {day.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#5B6475]">
            Hora inicio
          </p>
          <input
            type="time"
            value={schedule.startTime}
            onChange={(e) => update({ ...schedule, startTime: e.target.value })}
            className={timeInputClass}
          />
        </div>
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#5B6475]">
            Hora final
          </p>
          <input
            type="time"
            value={schedule.endTime}
            onChange={(e) => update({ ...schedule, endTime: e.target.value })}
            className={timeInputClass}
          />
        </div>
      </div>

      {value ? (
        <p className="rounded-2xl border border-[#E5EAF3] bg-[#F5F7FB] px-4 py-3 text-sm font-medium text-[#0A1733]">
          {value}
        </p>
      ) : null}
    </div>
  );
}
