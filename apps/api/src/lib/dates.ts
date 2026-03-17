const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MONTH_PATTERN = /^\d{4}-\d{2}$/;

export function parseDayString(value: string): Date {
  if (!DAY_PATTERN.test(value)) {
    throw new Error("workDate must use YYYY-MM-DD format");
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() + 1 !== month ||
    date.getUTCDate() !== day
  ) {
    throw new Error("workDate is not a valid calendar date");
  }

  return date;
}

export function formatDayString(value: Date): string {
  return value.toISOString().slice(0, 10);
}

export function getMonthRange(value: string): { start: Date; end: Date } {
  if (!MONTH_PATTERN.test(value)) {
    throw new Error("month must use YYYY-MM format");
  }

  const [year, month] = value.split("-").map(Number);
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1));

  return { start, end };
}
