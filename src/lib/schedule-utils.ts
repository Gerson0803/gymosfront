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

function normalizeDayToken(token: string): string {
  return token
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\./g, "")
    .slice(0, 3);
}

function resolveDayKey(token: string): DayKey | undefined {
  return DAY_ALIASES[normalizeDayToken(token)];
}

export function formatSchedule(value: ScheduleValue): string {
  if (value.days.length === 0) return "";
  const daysPart = [...value.days]
    .sort((a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b))
    .map((day) => WEEK_DAYS.find((item) => item.key === day)?.label ?? day)
    .join(", ");
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
  const defaultTimeRange = {
    startTime: "08:00",
    endTime: "16:00",
  };

  if (!text?.trim()) {
    return { days: [], ...defaultTimeRange };
  }

  const parts = text.split("·").map((p) => p.trim());
  const daysPart = parts[0] ?? "";
  const timePart = parts[1] ?? "";

  const days: DayKey[] = [];
  const dayTokens = daysPart
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  for (const token of dayTokens) {
    const [startToken, endToken] = token
      .split(/\s*[-–]\s*/)
      .map((part) => part.trim());

    if (endToken) {
      const startKey = resolveDayKey(startToken);
      const endKey = resolveDayKey(endToken);

      if (startKey && endKey) {
        const startIdx = DAY_ORDER.indexOf(startKey);
        const endIdx = DAY_ORDER.indexOf(endKey);
        for (let i = startIdx; i <= endIdx; i += 1) {
          const day = DAY_ORDER[i];
          if (day && !days.includes(day)) days.push(day);
        }
      }

      continue;
    }

    const key = resolveDayKey(startToken);
    if (key && !days.includes(key)) days.push(key);
  }

  const timeMatch = timePart.match(
    /(\d{1,2}:\d{2}\s*(?:AM|PM)?)\s*[-–]\s*(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i,
  );

  return {
    days,
    startTime: timeMatch
      ? parseTimeTo24h(timeMatch[1])
      : defaultTimeRange.startTime,
    endTime: timeMatch
      ? parseTimeTo24h(timeMatch[2])
      : defaultTimeRange.endTime,
  };
}

export function isScheduleComplete(value: ScheduleValue): boolean {
  return value.days.length > 0 && Boolean(value.startTime && value.endTime);
}
