import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const rootDir = path.resolve(path.dirname(__filename), "../..");
const publicDir = path.join(rootDir, "public");
const port = Number(process.env.PORT || 3000);

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname === "/api/health") {
      return sendJson(res, { ok: true, generatedAt: new Date().toISOString() });
    }
    if (url.pathname === "/favicon.ico") {
      res.writeHead(204);
      return res.end();
    }
    return serveStatic(url.pathname, res);
  } catch (error) {
    sendJson(res, { error: error.message || "Erro inesperado" }, 500);
  }
});

server.listen(port, () => {
  console.log(`Calculadora Especialista de Pizza em http://localhost:${port}`);
});

async function serveStatic(requestPath, res) {
  const safePath = requestPath === "/" ? "/index.html" : requestPath;
  const baseDir = safePath.startsWith("/src/") ? rootDir : publicDir;
  const filePath = path.normalize(path.join(baseDir, safePath));
  if (!filePath.startsWith(baseDir)) return sendText(res, "Forbidden", 403);

  try {
    const data = await fs.readFile(filePath);
    res.writeHead(200, { "Content-Type": contentType(filePath) });
    res.end(data);
  } catch {
    sendText(res, "Not found", 404);
  }
}

function sendJson(res, data, status = 200) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

function sendText(res, text, status = 200) {
  res.writeHead(status, { "Content-Type": "text/plain; charset=utf-8" });
  res.end(text);
}

function contentType(filePath) {
  const ext = path.extname(filePath);
  return {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml"
  }[ext] || "application/octet-stream";
}
