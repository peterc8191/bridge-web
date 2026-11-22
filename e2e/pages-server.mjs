// Minimal stand-in for GitHub Pages, for the e2e tests: serves dist/ under
// /bridge-web/ and answers unknown paths with dist/404.html (status 404),
// exactly like Pages - so deep-link refreshes exercise the real 404.html
// redirect instead of a dev-server SPA fallback.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const DIST = fileURLToPath(new URL("../dist/", import.meta.url));
const BASE = "/bridge-web/";
const PORT = Number(process.env.PORT ?? 4173);

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webmanifest": "application/manifest+json",
  ".json": "application/json",
};

createServer(async (req, res) => {
  const { pathname } = new URL(req.url ?? "/", "http://localhost");
  if (!pathname.startsWith(BASE)) {
    res.writeHead(302, { Location: BASE }).end();
    return;
  }

  let relative = decodeURIComponent(pathname.slice(BASE.length)) || "index.html";
  if (relative.endsWith("/")) relative += "index.html";
  const file = normalize(join(DIST, relative));

  try {
    if (!file.startsWith(DIST)) throw new Error("outside dist");
    const body = await readFile(file);
    res.writeHead(200, { "Content-Type": TYPES[extname(file)] ?? "application/octet-stream" }).end(body);
  } catch {
    const notFound = await readFile(join(DIST, "404.html"));
    res.writeHead(404, { "Content-Type": TYPES[".html"] }).end(notFound);
  }
}).listen(PORT, () => console.log(`GitHub Pages stand-in on http://localhost:${PORT}${BASE}`));
