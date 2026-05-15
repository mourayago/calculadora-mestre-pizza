export function formatDuration(seconds = 0) {
  const safe = Math.max(0, Math.round(Number(seconds) || 0));
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;
  return [h, m, s].map((part) => String(part).padStart(2, "0")).join(":");
}

export function formatMinutes(seconds = 0) {
  const minutes = Math.round(((Number(seconds) || 0) / 60) * 10) / 10;
  if (minutes < 1 && seconds > 0) return "< 1 min";
  return `${minutes.toLocaleString("pt-BR")} min`;
}

export function formatPercent(value = 0) {
  return `${Math.round((Number(value) || 0) * 100)}%`;
}

export function statusLabel(status) {
  const map = {
    online: "Online",
    offline: "Offline",
    pausado: "Pausado",
    invisivel: "Invisivel",
    indefinido: "Indefinido"
  };
  return map[status] || status || "Indefinido";
}

export function scoreClass(score) {
  if (score >= 80) return "good";
  if (score >= 60) return "warn";
  return "bad";
}

export function toDateInputValue(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatPeriodLabel(period) {
  if (!period?.start || !period?.end) return "Hoje";
  const formatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
  return `${period.label || "Periodo"} · ${formatter.format(new Date(period.start))} ate ${formatter.format(new Date(period.end))}`;
}
