export function firstDefined(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== "");
}

export function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

export function toNumber(value, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.replace(",", "."));
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

export function durationToSeconds(value) {
  if (value === undefined || value === null || value === "") return 0;
  if (typeof value === "number" && Number.isFinite(value)) {
    return value > 100000 ? Math.round(value / 1000) : Math.round(value);
  }
  if (value instanceof Date) return 0;

  const text = String(value).trim();
  if (!text) return 0;

  if (/^\d+(\.\d+)?$/.test(text)) return Math.round(Number(text));

  const timeMatch = text.match(/^(\d+):([0-5]?\d):([0-5]?\d)$/);
  if (timeMatch) {
    const [, h, m, s] = timeMatch;
    return Number(h) * 3600 + Number(m) * 60 + Number(s);
  }

  const shortMatch = text.match(/^(\d+):([0-5]?\d)$/);
  if (shortMatch) {
    const [, m, s] = shortMatch;
    return Number(m) * 60 + Number(s);
  }

  const isoLike = text.match(/(?:(\d+)d)?\s*(?:(\d+)h)?\s*(?:(\d+)m)?\s*(?:(\d+)s)?/i);
  if (isoLike && isoLike[0]) {
    return (
      toNumber(isoLike[1]) * 86400 +
      toNumber(isoLike[2]) * 3600 +
      toNumber(isoLike[3]) * 60 +
      toNumber(isoLike[4])
    );
  }

  return 0;
}

export function secondsToMinutes(seconds) {
  return Math.round((toNumber(seconds) / 60) * 10) / 10;
}

export function formatDuration(seconds) {
  const safe = Math.max(0, Math.round(toNumber(seconds)));
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;
  return [h, m, s].map((part) => String(part).padStart(2, "0")).join(":");
}

export function formatMinutes(seconds) {
  const minutes = secondsToMinutes(seconds);
  if (minutes < 1 && seconds > 0) return "< 1 min";
  return `${minutes.toLocaleString("pt-BR")} min`;
}

export function normalizeIdentity(identity) {
  const raw = String(identity || "Sem vendedor");
  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    decoded = raw;
  }

  return decoded
    .replace(/@blip\.ai$/i, "")
    .replace(/%40blip\.ai$/i, "")
    .replace(/[._-]+/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase()) || "Sem vendedor";
}

export function extractItems(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.resource)) return payload.resource;
  if (Array.isArray(payload.resource?.items)) return payload.resource.items;
  if (Array.isArray(payload.resource?.attendants)) return payload.resource.attendants;
  if (Array.isArray(payload.resource?.tickets)) return payload.resource.tickets;
  return [];
}

export function readPath(source, paths, fallback = undefined) {
  for (const path of paths) {
    const value = path.split(".").reduce((acc, key) => acc?.[key], source);
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return fallback;
}
