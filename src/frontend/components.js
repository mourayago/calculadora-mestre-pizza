import React from "https://esm.sh/react@18.2.0";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Timer,
  TrendingUp,
  Users
} from "https://esm.sh/lucide-react@0.468.0?deps=react@18.2.0";
import { formatDuration, formatMinutes, formatPercent, formatPeriodLabel, scoreClass, statusLabel } from "./formatters.js";

const h = React.createElement;

export function Header({
  generatedAt,
  refreshSeconds,
  onRefresh,
  loading,
  onRefreshSecondsChange,
  period
}) {
  return h("header", { className: "app-header" },
    h("div", null,
      h("p", { className: "eyebrow" }, "Operacao de vendas"),
      h("h1", null, "Central de Monitoramento Blip"),
      h("span", { className: "period-summary" }, formatPeriodLabel(period))
    ),
    h("div", { className: "header-actions" },
      h("label", { className: "refresh-control" },
        "Atualizar a cada",
        h("select", {
          value: refreshSeconds,
          onChange: (event) => onRefreshSecondsChange(Number(event.target.value))
        },
          [60, 120, 180, 300].map((seconds) => h("option", { key: seconds, value: seconds }, `${seconds / 60} min`))
        )
      ),
      h("button", { className: "icon-button", onClick: onRefresh, disabled: loading, title: "Atualizar agora" },
        h(RefreshCw, { size: 18, className: loading ? "spin" : "" })
      ),
      h("span", { className: "last-update" }, generatedAt ? `Atualizado ${new Date(generatedAt).toLocaleTimeString("pt-BR")}` : "Aguardando dados")
    )
  );
}

export function KpiCard({ icon, label, value, hint, tone = "neutral" }) {
  const Icon = icon;
  return h("article", { className: `kpi-card ${tone}` },
    h("div", { className: "kpi-icon" }, h(Icon, { size: 20 })),
    h("div", null,
      h("span", { className: "kpi-label" }, label),
      h("strong", null, value),
      h("small", null, hint)
    )
  );
}

export function ExecutiveCards({ data }) {
  const summary = data.summary;
  const metrics = data.operationalMetrics || {};
  return h("section", { className: "kpi-grid" },
    h(KpiCard, { icon: Clock, label: "Total em fila", value: summary.waiting, hint: "tickets aguardando", tone: summary.waiting > 10 ? "bad" : "good" }),
    h(KpiCard, { icon: Users, label: "Em atendimento", value: summary.open, hint: "tickets abertos" }),
    h(KpiCard, { icon: CheckCircle2, label: "Fechados hoje", value: summary.closed, hint: "tickets concluidos", tone: "good" }),
    h(KpiCard, { icon: Timer, label: "Tempo medio de atendimento", value: formatDuration(metrics.avgAttendanceSeconds), hint: "media por vendedor ativo", tone: "neutral" }),
    h(KpiCard, { icon: Clock, label: "Tempo maximo ate 1a resposta", value: formatDuration(metrics.maxFirstResponseSeconds), hint: "maior tempo registrado", tone: metrics.maxFirstResponseSeconds > 300 ? "bad" : "neutral" }),
    h(KpiCard, { icon: TrendingUp, label: "SLA primeira resposta", value: formatPercent(data.slaFirstResponse), hint: "meta: ate 5 min", tone: data.slaFirstResponse < 0.8 ? "bad" : "good" }),
    h(HealthScoreCard, { score: data.healthScore, status: data.healthStatus })
  );
}

export function HealthScoreCard({ score, status }) {
  const cls = scoreClass(score);
  return h("article", { className: `health-card ${cls}` },
    h("div", { className: "health-ring", style: { "--score": score } },
      h("strong", null, score),
      h("span", null, "/100")
    ),
    h("div", null,
      h("span", { className: "kpi-label" }, "Health Score"),
      h("strong", null, status === "saudavel" ? "Saudavel" : status === "atencao" ? "Atencao" : "Critico"),
      h("small", null, "saude operacional")
    )
  );
}

export function Alerts({ alerts }) {
  if (!alerts?.length) return h("section", { className: "alert-strip good" }, h(CheckCircle2, { size: 18 }), "Operacao sem alertas criticos no momento.");
  return h("section", { className: "alerts" },
    alerts.map((alert, index) => h("div", { key: index, className: `alert ${alert.level}` },
      h(AlertTriangle, { size: 18 }),
      h("span", null, alert.text)
    ))
  );
}

export function QueuePanel({ data }) {
  return h("section", { className: "section-grid queue-grid" },
    h("div", { className: "panel" },
      h("div", { className: "panel-header" }, h("h2", null, "Buckets de espera"), h("span", null, "SLA de fila")),
      h(TimeBucketChart, { buckets: data.waitingBuckets })
    ),
    h("div", { className: "panel wide" },
      h("div", { className: "panel-header" }, h("h2", null, "Top 10 tickets mais antigos"), h("span", null, "acima de 30 min em alerta")),
      data.oldestWaitingTickets.length
        ? h("div", { className: "ticket-list" }, data.oldestWaitingTickets.map((ticket) => h("div", { className: `ticket-row ${ticket.waitingSeconds > 1800 ? "late" : ""}`, key: ticket.id },
            h("div", null, h("strong", null, ticket.customer), h("small", null, `${ticket.team} · ${ticket.id}`)),
            h("span", null, formatMinutes(ticket.waitingSeconds))
          )))
        : h(EmptyState, { text: "Nenhum ticket aguardando na fila." })
    )
  );
}

export function TimeBucketChart({ buckets }) {
  const max = Math.max(1, ...buckets.map((bucket) => bucket.count));
  return h("div", { className: "bucket-chart" },
    buckets.map((bucket) => h("div", { className: "bucket-row", key: bucket.label },
      h("span", null, bucket.label),
      h("div", { className: "bar-track" }, h("div", { className: "bar-fill", style: { width: `${(bucket.count / max) * 100}%` } })),
      h("strong", null, bucket.count)
    ))
  );
}

export function AttendantTable({ attendants }) {
  return h("section", { className: "panel table-panel" },
    h("div", { className: "panel-header" }, h("h2", null, "Produtividade por Vendedor"), h("span", null, `${attendants.length} vendedores`)),
    attendants.length ? h("div", { className: "table-wrap" },
      h("table", null,
        h("thead", null, h("tr", null,
          ["Vendedor", "Status", "Tickets na caixa", "Fechados", "1a resposta", "Resp. media", "Atendimento", "Score"].map((head) => h("th", { key: head }, head))
        )),
        h("tbody", null, attendants.map((attendant) => h("tr", { key: attendant.id },
          h("td", null, h("strong", null, attendant.name), h("small", null, attendant.identity)),
          h("td", null, h("span", { className: `status-dot ${attendant.status}` }, statusLabel(attendant.status))),
          h("td", null, attendant.openedTickets),
          h("td", null, attendant.closedTickets),
          h("td", null, formatDuration(attendant.averageFirstResponseSeconds)),
          h("td", null, formatDuration(attendant.averageResponseSeconds)),
          h("td", null, formatDuration(attendant.averageAttendanceSeconds)),
          h("td", null, h("span", { className: `score-pill ${scoreClass(attendant.score)}` }, attendant.score))
        )))
      )
    ) : h(EmptyState, { text: "Nenhum vendedor retornado pela API." })
  );
}

export function EvolutionChart({ snapshots, period }) {
  const points = (snapshots || []).slice(-24);
  return h("section", { className: "panel" },
    h("div", { className: "panel-header" }, h("h2", null, "Evolucao Operacional"), h("span", null, `${points.length} snapshots · ${period?.label || "Hoje"}`)),
    points.length > 1 ? h("div", { className: "evolution-grid" },
      h(LineChart, { title: "Fila", points: points.map((item) => item.waiting), tone: "queue" }),
      h(LineChart, { title: "Abertos", points: points.map((item) => item.open), tone: "open" }),
      h(LineChart, { title: "SLA", points: points.map((item) => Math.round(item.slaFirstResponse * 100)), suffix: "%", tone: "sla" }),
      h(LineChart, { title: "Health", points: points.map((item) => item.healthScore), tone: "health" })
    ) : h(EmptyState, { text: "A evolucao aparece apos pelo menos duas atualizacoes." })
  );
}

function LineChart({ title, points, suffix = "", tone }) {
  const width = 260;
  const height = 86;
  const max = Math.max(1, ...points);
  const min = Math.min(...points);
  const range = Math.max(1, max - min);
  const path = points.map((point, index) => {
    const x = points.length === 1 ? 0 : (index / (points.length - 1)) * width;
    const y = height - ((point - min) / range) * (height - 12) - 6;
    return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");

  return h("div", { className: `mini-chart ${tone}` },
    h("div", null, h("span", null, title), h("strong", null, `${points.at(-1) ?? 0}${suffix}`)),
    h("svg", { viewBox: `0 0 ${width} ${height}`, role: "img", "aria-label": title },
      h("path", { d: path, fill: "none", strokeWidth: 3, strokeLinecap: "round" })
    )
  );
}

export function LoadingState() {
  return h("main", { className: "state-screen" }, h(Activity, { size: 26, className: "spin" }), h("strong", null, "Carregando dados da Blip"), h("span", null, "Consultando tickets, fila e vendedores."));
}

export function ErrorState({ message, onRetry }) {
  return h("main", { className: "state-screen error" },
    h(AlertTriangle, { size: 28 }),
    h("strong", null, "Nao foi possivel carregar o dashboard"),
    h("span", null, message),
    h("button", { onClick: onRetry }, "Tentar novamente")
  );
}

export function EmptyState({ text }) {
  return h("div", { className: "empty-state" }, text);
}
