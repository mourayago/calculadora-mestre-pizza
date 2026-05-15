const SAO_PAULO_TIME_ZONE = "America/Sao_Paulo";

export const PERIOD_PRESETS = {
  today: "Hoje",
  yesterday: "Ontem",
  last7days: "Ultimos 7 dias",
  lastWeek: "Semana passada",
  thisMonth: "Este mes",
  custom: "Periodo personalizado"
};

export function resolvePeriod({ preset = "today", start, end } = {}) {
  const now = new Date();
  const today = startOfDay(now);
  let rangeStart = today;
  let rangeEnd = endOfDay(now);
  let label = PERIOD_PRESETS[preset] || PERIOD_PRESETS.today;

  if (preset === "yesterday") {
    const yesterday = addDays(today, -1);
    rangeStart = yesterday;
    rangeEnd = endOfDay(yesterday);
  }

  if (preset === "last7days") {
    rangeStart = startOfDay(addDays(today, -6));
    rangeEnd = endOfDay(now);
  }

  if (preset === "lastWeek") {
    const day = today.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    const thisMonday = addDays(today, mondayOffset);
    rangeStart = addDays(thisMonday, -7);
    rangeEnd = endOfDay(addDays(thisMonday, -1));
  }

  if (preset === "thisMonth") {
    rangeStart = new Date(today.getFullYear(), today.getMonth(), 1);
    rangeEnd = endOfDay(now);
  }

  if (preset === "custom") {
    const parsedStart = parseDateInput(start);
    const parsedEnd = parseDateInput(end);
    if (parsedStart) rangeStart = startOfDay(parsedStart);
    if (parsedEnd) rangeEnd = endOfDay(parsedEnd);
    label = buildCustomLabel(rangeStart, rangeEnd);
  }

  if (rangeStart > rangeEnd) {
    const previousStart = rangeStart;
    rangeStart = startOfDay(rangeEnd);
    rangeEnd = endOfDay(previousStart);
  }

  return {
    preset,
    label,
    start: rangeStart.toISOString(),
    end: rangeEnd.toISOString(),
    timezone: SAO_PAULO_TIME_ZONE
  };
}

function parseDateInput(value) {
  if (!value) return null;
  const [year, month, day] = String(value).split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
}

function endOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function buildCustomLabel(start, end) {
  const formatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
  return `${formatter.format(start)} a ${formatter.format(end)}`;
}
