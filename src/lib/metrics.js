import {
  clamp,
  durationToSeconds,
  extractItems,
  firstDefined,
  normalizeIdentity,
  readPath,
  toNumber
} from "./formatters.js";

export const TARGETS = {
  maxWaitingTickets: 10,
  firstResponseSeconds: 5 * 60,
  averageResponseSeconds: 10 * 60,
  maxWaitingSeconds: 15 * 60,
  criticalWaitingSeconds: 30 * 60,
  maxOpenedByAttendant: 8
};

export function normalizeTicketSummary(payload = {}) {
  const resource = payload.resource ?? payload;
  return {
    waiting: toNumber(firstDefined(resource.waiting, resource.waitingTickets, resource.queue, resource.inQueue)),
    open: toNumber(firstDefined(resource.open, resource.opened, resource.inAttendance, resource.attending)),
    closed: toNumber(firstDefined(resource.closed, resource.closedToday, resource.finished)),
    transferred: toNumber(firstDefined(resource.transferred, resource.transfers)),
    missed: toNumber(firstDefined(resource.missed, resource.abandoned, resource.lost))
  };
}

export function normalizeOperationalMetrics(payload = {}, attendants = [], waitingTickets = [], openTickets = []) {
  const resource = payload.resource ?? payload;
  const activeAttendants = attendants.filter((attendant) => attendant.openedTickets > 0 || attendant.closedTickets > 0);
  const attendanceBase = activeAttendants.length ? activeAttendants : attendants;
  const responseBase = attendants.filter((attendant) => attendant.averageFirstResponseSeconds > 0);

  return {
    maxQueueSeconds: Math.max(
      durationToSeconds(firstDefined(resource.maxQueueTime, resource.maximumQueueTime, resource.maxWaitingTime)),
      ...waitingTickets.map((ticket) => ticket.waitingSeconds)
    ),
    maxFirstResponseSeconds: Math.max(
      durationToSeconds(firstDefined(resource.maxFirstResponseTime, resource.maximumFirstResponseTime)),
      ...openTickets.map((ticket) => ticket.firstResponseSeconds),
      ...responseBase.map((attendant) => attendant.averageFirstResponseSeconds)
    ),
    avgQueueSeconds: durationToSeconds(firstDefined(resource.avgQueueTime, resource.averageQueueTime)),
    avgWaitSeconds: durationToSeconds(firstDefined(resource.avgWaitTime, resource.averageWaitTime)),
    avgResponseSeconds: durationToSeconds(firstDefined(resource.avgResponseTime, resource.averageResponseTime)),
    avgAttendanceSeconds: durationToSeconds(firstDefined(resource.avgAttendanceTime, resource.averageAttendanceTime)) ||
      averageSeconds(attendanceBase.map((attendant) => attendant.averageAttendanceSeconds)),
    ticketsPerAttendant: toNumber(firstDefined(resource.ticketsPerAttendant, resource.averageTicketsPerAttendant))
  };
}

export function normalizeWaitingTickets(payload = {}) {
  return extractItems(payload).map((ticket, index) => {
    const createdAt = firstDefined(
      readPath(ticket, ["storageDate", "createdDate", "createdAt", "date", "sequentialIdDate"]),
      ticket.customer?.lastMessageDate
    );
    const waitingSecondsFromDate = createdAt ? Math.max(0, Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000)) : 0;
    const explicitWaitingSeconds = durationToSeconds(readPath(ticket, ["waitingTime", "waitTime", "elapsedTime", "timeWaiting"]));
    const waitingSeconds = explicitWaitingSeconds || waitingSecondsFromDate;
    const team = firstDefined(
      readPath(ticket, ["team", "teamName", "queue", "department", "sector", "attendanceTeam"]),
      "Sem equipe"
    );

    return {
      id: String(firstDefined(ticket.id, ticket.ticketId, ticket.sequentialId, ticket.customerIdentity, `ticket-${index + 1}`)),
      customer: String(firstDefined(ticket.customerName, ticket.customer?.name, ticket.customerIdentity, ticket.identity, "Cliente sem nome")),
      team: String(team || "Sem equipe"),
      createdAt: createdAt || null,
      waitingSeconds: Math.max(0, toNumber(waitingSeconds)),
      raw: ticket
    };
  });
}

export function normalizeOpenTickets(payload = {}) {
  return extractItems(payload).map((ticket, index) => ({
    id: String(firstDefined(ticket.id, ticket.ticketId, ticket.sequentialId, `open-ticket-${index + 1}`)),
    agentIdentity: String(firstDefined(ticket.agentIdentity, ticket.agent?.identity, "")),
    agentName: String(firstDefined(ticket.agentName, normalizeIdentity(ticket.agentIdentity), "Sem vendedor")),
    customer: String(firstDefined(ticket.customerName, ticket.customerIdentity, "Cliente sem nome")),
    team: String(firstDefined(ticket.team, "Sem equipe")),
    queueSeconds: durationToSeconds(firstDefined(ticket.queueTime, ticket.waitingTime)),
    firstResponseSeconds: durationToSeconds(firstDefined(ticket.firstResponseTime, ticket.averageFirstResponseTime)),
    attendanceSeconds: durationToSeconds(firstDefined(ticket.attendanceTime, ticket.averageAttendanceTime)),
    raw: ticket
  }));
}

export function normalizeAttendants(payload = {}) {
  return extractItems(payload).map((attendant, index) => {
    const identity = firstDefined(attendant.identity, attendant.email, attendant.name, attendant.fullName, `atendente-${index + 1}`);
    const averageFirstResponseSeconds = durationToSeconds(firstDefined(
      attendant.averageFirstResponseTime,
      attendant.avgFirstResponseTime,
      attendant.firstResponseTime
    ));
    const averageResponseSeconds = durationToSeconds(firstDefined(
      attendant.averageResponseTime,
      attendant.avgResponseTime,
      attendant.responseTime
    ));
    const averageAttendanceSeconds = durationToSeconds(firstDefined(
      attendant.averageAttendanceTime,
      attendant.avgAttendanceTime,
      attendant.attendanceTime
    ));

    const normalized = {
      id: String(identity),
      name: String(firstDefined(attendant.agentName, attendant.fullName, attendant.name, normalizeIdentity(identity))),
      identity: String(identity),
      status: normalizeStatus(firstDefined(attendant.status, attendant.state, attendant.isOnline)),
      openedTickets: toNumber(firstDefined(attendant.openedTickets, attendant.openTickets, attendant.open, attendant.ticketsOpened)),
      closedTickets: toNumber(firstDefined(attendant.closedTickets, attendant.closed, attendant.closedToday, attendant.ticketsClosed)),
      averageFirstResponseSeconds,
      averageResponseSeconds,
      averageAttendanceSeconds,
      onlineSeconds: durationToSeconds(firstDefined(attendant.onlineTime, attendant.availableTime, attendant.loggedTime)),
      raw: attendant
    };

    return {
      ...normalized,
      score: calculateAttendantScore(normalized)
    };
  });
}

function normalizeStatus(status) {
  if (typeof status === "boolean") return status ? "online" : "offline";
  const value = String(status || "unknown").toLowerCase();
  if (["online", "available", "active", "true"].includes(value)) return "online";
  if (["paused", "pause", "away", "busy"].includes(value)) return "pausado";
  if (["offline", "inactive", "false"].includes(value)) return "offline";
  if (["invisible"].includes(value)) return "invisivel";
  return value === "unknown" ? "indefinido" : value;
}

export function bucketWaitingTickets(waitingTickets) {
  const buckets = [
    { label: "0 a 5 min", min: 0, max: 5 * 60, count: 0 },
    { label: "5 a 15 min", min: 5 * 60, max: 15 * 60, count: 0 },
    { label: "15 a 30 min", min: 15 * 60, max: 30 * 60, count: 0 },
    { label: "Acima de 30 min", min: 30 * 60, max: Infinity, count: 0 }
  ];

  for (const ticket of waitingTickets) {
    const bucket = buckets.find((item) => ticket.waitingSeconds >= item.min && ticket.waitingSeconds < item.max);
    if (bucket) bucket.count += 1;
  }

  return buckets.map(({ label, count }) => ({ label, count }));
}

export function groupQueueByTeam(waitingTickets) {
  const grouped = new Map();
  for (const ticket of waitingTickets) {
    const current = grouped.get(ticket.team) ?? { team: ticket.team, count: 0, oldestSeconds: 0 };
    current.count += 1;
    current.oldestSeconds = Math.max(current.oldestSeconds, ticket.waitingSeconds);
    grouped.set(ticket.team, current);
  }
  return [...grouped.values()].sort((a, b) => b.count - a.count);
}

export function calculateSlaFirstResponse(attendants) {
  const withData = attendants.filter((attendant) => attendant.averageFirstResponseSeconds > 0);
  if (!withData.length) return 1;
  const ok = withData.filter((attendant) => attendant.averageFirstResponseSeconds <= TARGETS.firstResponseSeconds).length;
  return ok / withData.length;
}

export function calculateAttendantScore(attendant) {
  let score = 100;
  if (attendant.openedTickets > TARGETS.maxOpenedByAttendant) score -= 15;
  if (attendant.averageFirstResponseSeconds > TARGETS.firstResponseSeconds) score -= 20;
  if (attendant.averageResponseSeconds > TARGETS.averageResponseSeconds) score -= 20;
  if (attendant.averageAttendanceSeconds > 45 * 60) score -= 10;
  if (attendant.status === "offline" && isBusinessHours()) score -= 10;
  return clamp(score);
}

function isBusinessHours(date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    weekday: "short",
    hour: "numeric",
    hour12: false
  });
  const parts = Object.fromEntries(formatter.formatToParts(date).map((part) => [part.type, part.value]));
  const weekday = parts.weekday;
  const hour = Number(parts.hour);
  return !["Sat", "Sun"].includes(weekday) && hour >= 8 && hour < 18;
}

export function calculateHealthScore({ summary, avgWaitingSeconds, slaFirstResponse }) {
  let score = 100;
  if (summary.waiting > TARGETS.maxWaitingTickets) score -= 20;
  if (avgWaitingSeconds > TARGETS.maxWaitingSeconds) score -= 25;
  if (slaFirstResponse < 0.8) score -= 25;
  if (summary.missed > 0) score -= 10;
  return clamp(score);
}

export function classifyScore(score) {
  if (score >= 80) return "saudavel";
  if (score >= 60) return "atencao";
  return "critico";
}

export function buildDashboardMetrics({ ticketsPayload, waitingPayload, attendantsPayload, openTicketsPayload }) {
  const summary = normalizeTicketSummary(ticketsPayload);
  const waitingTickets = normalizeWaitingTickets(waitingPayload);
  const attendants = normalizeAttendants(attendantsPayload);
  const openTickets = normalizeOpenTickets(openTicketsPayload);
  const operationalMetrics = normalizeOperationalMetrics(ticketsPayload, attendants, waitingTickets, openTickets);
  const waitingTotal = waitingTickets.length || summary.waiting;
  const avgWaitingSeconds = operationalMetrics.avgWaitSeconds || (waitingTickets.length
    ? Math.round(waitingTickets.reduce((sum, ticket) => sum + ticket.waitingSeconds, 0) / waitingTickets.length)
    : 0);
  const slaFirstResponse = calculateSlaFirstResponse(attendants);
  const healthScore = calculateHealthScore({ summary: { ...summary, waiting: waitingTotal }, avgWaitingSeconds, slaFirstResponse });

  return {
    generatedAt: new Date().toISOString(),
    summary: { ...summary, waiting: waitingTotal },
    waitingTickets,
    attendants,
    openTickets,
    queueByTeam: groupQueueByTeam(waitingTickets),
    waitingBuckets: bucketWaitingTickets(waitingTickets),
    oldestWaitingTickets: [...waitingTickets].sort((a, b) => b.waitingSeconds - a.waitingSeconds).slice(0, 10),
    avgWaitingSeconds,
    operationalMetrics,
    slaFirstResponse,
    healthScore,
    healthStatus: classifyScore(healthScore),
    alerts: buildAlerts({ summary: { ...summary, waiting: waitingTotal }, avgWaitingSeconds, waitingTickets, attendants, healthScore })
  };
}

function averageSeconds(values) {
  const valid = values.filter((value) => value > 0);
  if (!valid.length) return 0;
  return Math.round(valid.reduce((sum, value) => sum + value, 0) / valid.length);
}

function buildAlerts({ summary, avgWaitingSeconds, waitingTickets, attendants, healthScore }) {
  const alerts = [];
  if (summary.waiting > TARGETS.maxWaitingTickets) alerts.push({ level: "warning", text: `Fila acima do limite: ${summary.waiting} tickets aguardando.` });
  if (avgWaitingSeconds > TARGETS.maxWaitingSeconds) alerts.push({ level: "warning", text: "Tempo medio de espera acima de 15 minutos." });
  if (waitingTickets.some((ticket) => ticket.waitingSeconds > TARGETS.criticalWaitingSeconds)) alerts.push({ level: "critical", text: "Ha tickets aguardando ha mais de 30 minutos." });
  if (attendants.some((attendant) => attendant.openedTickets > TARGETS.maxOpenedByAttendant)) alerts.push({ level: "warning", text: "Ha vendedores com muitos tickets abertos na caixa." });
  if (healthScore < 60) alerts.push({ level: "critical", text: "Health score critico para a operacao." });
  return alerts;
}
