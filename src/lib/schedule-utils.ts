export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export type ScheduleValue = {
  days: DayKey[];
  startTime: string;
  endTime: string;
};

export const WEEK_DAYS: { key: DayKey; label: string }[] = [
  { key: "mon", label: "Lun" },
  { key: "tue", label: "Mar" },
  { key: "wed", label: "Mié" },
  { key: "thu", label: "Jue" },
  { key: "fri", label: "Vie" },
  { key: "sat", label: "Sáb" },
  { key: "sun", label: "Dom" },
];

const DAY_ORDER = WEEK_DAYS.map((d) => d.key);

function formatTime12h(time24: string): string {
  const [hStr, mStr] = time24.split(":");
  let h = parseInt(hStr, 10);
  const m = mStr ?? "00";
  const period = h >= 12 ? "PM" : "AM";
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return `${String(h).padStart(2, "0")}:${m} ${period}`;
}

function dayLabel(index: number): string {
  return WEEK_DAYS.find((d) => d.key === DAY_ORDER[index])!.label;
}

function compressDayRange(sortedKeys: DayKey[]): string {
  if (sortedKeys.length === 0) return "";

  const indices = sortedKeys.map((k) => DAY_ORDER.indexOf(k)).sort((a, b) => a - b);
  const ranges: string[] = [];
  let start = indices[0];
  let end = indices[0];

  for (let i = 1; i < indices.length; i++) {
    if (indices[i] === end + 1) {
      end = indices[i];
    } else {
      ranges.push(
        start === end ? dayLabel(start) : `${dayLabel(start)} - ${dayLabel(end)}`,
      );
      start = indices[i];
      end = indices[i];
    }
  }
  ranges.push(
    start === end ? dayLabel(start) : `${dayLabel(start)} - ${dayLabel(end)}`,
  );

  return ranges.join(", ");
}

export function formatSchedule(value: ScheduleValue): string {
  if (value.days.length === 0) return "";
  const daysPart = compressDayRange(
    [...value.days].sort((a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b)),
  );
  const start = formatTime12h(value.startTime);
  const end = formatTime12h(value.endTime);
  return `${daysPart} · ${start} - ${end}`;
}

function parseTimeTo24h(token: string): string {
  const match = token.trim().match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!match) return "08:00";
  let h = parseInt(match[1], 10);
  const m = match[2];
  const period = match[3]?.toUpperCase();
  if (period === "PM" && h < 12) h += 12;
  if (period === "AM" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${m}`;
}

const DAY_ALIASES: Record<string, DayKey> = {
  lun: "mon",
  mar: "tue",
  mie: "wed",
  mié: "wed",
  jue: "thu",
  vie: "fri",
  sab: "sat",
  sáb: "sat",
  dom: "sun",
};

export function parseSchedule(text: string): ScheduleValue {
  const defaultValue: ScheduleValue = {
    days: ["mon", "tue", "wed", "thu", "fri"],
    startTime: "08:00",
    endTime: "16:00",
  };

  if (!text?.trim()) {
    return { days: [], startTime: "08:00", endTime: "16:00" };
  }

  const parts = text.split("·").map((p) => p.trim());
  const daysPart = parts[0] ?? "";
  const timePart = parts[1] ?? "";

  const days: DayKey[] = [];
  const dayTokens = daysPart.split(/[,·]/).map((t) => t.trim());

  for (const token of dayTokens) {
    const rangeMatch = token.match(/(\w+)\s*[-–]\s*(\w+)/i);
    if (rangeMatch) {
      const startKey = DAY_ALIASES[rangeMatch[1].toLowerCase().slice(0, 3)];
      const endKey = DAY_ALIASES[rangeMatch[2].toLowerCase().slice(0, 3)];
      if (startKey && endKey) {
        const startIdx = DAY_ORDER.indexOf(startKey);
        const endIdx = DAY_ORDER.indexOf(endKey);
        for (let i = startIdx; i <= endIdx; i++) {
          if (!days.includes(DAY_ORDER[i])) days.push(DAY_ORDER[i]);
        }
      }
    } else {
      const key = DAY_ALIASES[token.toLowerCase().slice(0, 3)];
      if (key && !days.includes(key)) days.push(key);
    }
  }

  const timeMatch = timePart.match(
    /(\d{1,2}:\d{2}\s*(?:AM|PM)?)\s*[-–]\s*(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i,
  );

  return {
    days: days.length > 0 ? days : defaultValue.days,
    startTime: timeMatch ? parseTimeTo24h(timeMatch[1]) : defaultValue.startTime,
    endTime: timeMatch ? parseTimeTo24h(timeMatch[2]) : defaultValue.endTime,
  };
}

export function isScheduleComplete(value: ScheduleValue): boolean {
  return value.days.length > 0 && Boolean(value.startTime && value.endTime);
}
