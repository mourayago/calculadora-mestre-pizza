const BLIP_COMMANDS_URL = "https://msging.net/commands";
const DESK_POSTMASTER = "postmaster@desk.msging.net";

export const BLIP_ENDPOINTS = {
  tickets: "/monitoring/tickets?version=2",
  waitingTickets: "/monitoring/waiting-tickets?version=2",
  attendants: "/monitoring/attendants?version=2",
  openTickets: "/monitoring/open-tickets?version=2"
};

export function getBlipApiKey() {
  const raw = process.env.BLIP_API_KEY;
  if (!raw) throw new Error("BLIP_API_KEY nao configurada no .env");
  return raw.trim().replace(/^["']|["']$/g, "").replace(/^Key\s+/i, "");
}

export async function callBlipDesk(uri) {
  const id = crypto.randomUUID();
  const response = await fetch(BLIP_COMMANDS_URL, {
    method: "POST",
    headers: {
      Authorization: `Key ${getBlipApiKey()}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      id,
      to: DESK_POSTMASTER,
      method: "get",
      uri
    })
  });

  const text = await response.text();
  let payload = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = { raw: text };
  }

  if (!response.ok) {
    const message = payload?.reason?.description || payload?.message || `Erro HTTP ${response.status}`;
    throw new Error(message);
  }

  return payload;
}
