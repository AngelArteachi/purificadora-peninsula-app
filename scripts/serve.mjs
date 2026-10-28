/**
 * Tiny static server for the exported web build (SPA fallback included).
 * Usage: node scripts/serve.mjs [port] [dir]
 */
import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';

const port = Number(process.argv[2] ?? 8082);
const root = resolve(process.argv[3] ?? 'dist');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
};

createServer((request, response) => {
  const url = new URL(request.url ?? '/', `http://localhost:${port}`);
  let file = join(root, normalize(decodeURIComponent(url.pathname)).replace(/^([/\\])+/, ''));

  if (!existsSync(file) || statSync(file).isDirectory()) {
    const withHtml = `${file}.html`;
    file = existsSync(withHtml) ? withHtml : join(root, 'index.html');
  }

  response.writeHead(200, { 'Content-Type': MIME[extname(file)] ?? 'application/octet-stream' });
  createReadStream(file).pipe(response);
}).listen(port, () => {
  console.log(`serving ${root} on http://localhost:${port}`);
});
