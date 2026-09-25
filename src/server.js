import "dotenv/config";
import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { analyzeDivergence } from "./divergence.js";
import { getPythMarkets } from "./pyth.js";

const PORT = Number(process.env.PORT || 8787);
const HOST = "0.0.0.0";
const PRESTOCKS_API = "https://prestocks.com/api/prestocks";

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, "..");
const publicDir = join(__dirname, "..", "public");

function round(value, decimals = 2) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return Number(n.toFixed(decimals));
}

function enrichToken(token) {
  const markPrice = Number(token.markPrice);
  const tokenPrice = Number(token.tokenPrice);
  const markValuation = Number(token.markValuation);
  const impliedValuation = Number(token.impliedValuation);

  const premiumPct =
    Number.isFinite(markPrice) && markPrice !== 0
      ? ((tokenPrice / markPrice) - 1) * 100
      : null;

  const valuationGapPct =
    Number.isFinite(markValuation) && markValuation !== 0
      ? ((impliedValuation / markValuation) - 1) * 100
      : null;

  return {
    ...token,
    markPrice: round(markPrice, 4),
    tokenPrice: round(tokenPrice, 4),
    markValuation: round(markValuation, 0),
    impliedValuation: round(impliedValuation, 0),
    premiumPct: round(premiumPct, 2),
    valuationGapPct: round(valuationGapPct, 2),
  };
}

async function getMarkets() {
  const response = await fetch(PRESTOCKS_API, {
    headers: {
      accept: "application/json",
      "user-agent": "StockPilot/0.1 hackathon",
    },
  });

  if (!response.ok) {
    throw new Error(`PreStocks HTTP ${response.status}`);
  }

  const data = await response.json();

  if (!Array.isArray(data)) {
    throw new Error("Unexpected PreStocks response");
  }

  return data.map(token => ({ ...enrichToken(token), divergence: analyzeDivergence(enrichToken(token)) }));
}

function json(res, status, payload) {
  const body = JSON.stringify(payload);

  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "access-control-allow-origin": "*",
  });

  res.end(body);
}

async function serveStatic(req, res) {
  const requested = req.url === "/" ? "/index.html" : req.url;
  const cleanPath = requested.split("?")[0];

  const safePath = cleanPath.replace(/^\/+/, "");
  const filePath = join(publicDir, safePath);

  if (!filePath.startsWith(publicDir)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  try {
    const data = await readFile(filePath);

    const types = {
      ".html": "text/html; charset=utf-8",
      ".js": "text/javascript; charset=utf-8",
      ".css": "text/css; charset=utf-8",
      ".json": "application/json; charset=utf-8",
      ".svg": "image/svg+xml",
    };

    res.writeHead(200, {
      "content-type": types[extname(filePath)] || "application/octet-stream",
    });

    res.end(data);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.url?.startsWith("/api/markets")) {
      const markets = await getMarkets();

      let pyth = [];
      try {
        pyth = await getPythMarkets();
      } catch (error) {
        console.error("Pyth data unavailable:", error.message);
      }

      return json(res, 200, {
        ok: true,
        source: "PreStocks + Pyth",
        timestamp: new Date().toISOString(),
        count: markets.length,
        markets,
        pyth,
      });
    }

    if (req.url?.startsWith("/api/health")) {
      return json(res, 200, {
        ok: true,
        service: "StockPilot",
        timestamp: new Date().toISOString(),
      });
    }

    return serveStatic(req, res);
  } catch (error) {
    console.error(error);

    return json(res, 500, {
      ok: false,
      error: error.message,
    });
  }
});

server.listen(PORT, HOST, () => {
  console.log("");
  console.log("╔════════════════════════════════════╗");
  console.log("║          STOCKPILOT                 ║");
  console.log("║   Tokenized Stock Intelligence     ║");
  console.log("╚════════════════════════════════════╝");
  console.log("");
  console.log(`Local: http://127.0.0.1:${PORT}`);
  console.log(`API:   http://127.0.0.1:${PORT}/api/markets`);
  console.log("");
});
