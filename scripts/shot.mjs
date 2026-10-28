/* global Buffer */
/**
 * Dev-only screenshot tour for the README.
 * Launches headless Edge against the running web dev server, walks the app
 * like a user (sign in, browse, check out, track, profile) and saves a PNG at
 * each step, once in light mode and once in dark mode. Usage:
 *   npx expo start --web            # in another terminal
 *   node scripts/shot.mjs           # writes docs/screenshots/*.png
 * Env: BASE_URL (default http://localhost:8081).
 */
import { spawn } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import os from 'node:os';

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const BASE_URL = process.env.BASE_URL ?? 'http://localhost:8081';
const WIDTH = 400;
const HEIGHT = 860;
const OUT = resolve(import.meta.dirname, '..', 'docs', 'screenshots');

/**
 * The tour. Each step runs an action, waits for animations, then captures.
 * `tap` finds an element by its accessibility label (aria-label prefix).
 */
const TOUR = [
  { name: '01-login', action: { load: '/' } },
  { name: '02-inicio', action: { tap: 'Iniciar sesión' } },
  { name: '03-productos', action: { scroll: 520 } },
  { name: '04-pago', action: { tap: 'Ver pedido' } },
  { name: '05-rastreo', action: { tap: 'Confirmar pedido' }, wait: 5200 },
  { name: '06-pedidos', action: [{ tap: 'Regresar' }, { tap: 'Pedidos' }] },
  { name: '07-perfil', action: { tap: 'Perfil' } },
  { name: '08-direcciones', action: { tap: 'Direcciones' } },
];

const port = 9333;
const profile = resolve(os.tmpdir(), `edge-shot-${Date.now()}`);
mkdirSync(OUT, { recursive: true });
mkdirSync(profile, { recursive: true });

const edge = spawn(
  EDGE,
  [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    `--window-size=${WIDTH},${HEIGHT}`,
    'about:blank',
  ],
  { stdio: 'ignore' },
);

async function cdpTarget() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/list`);
      const list = await response.json();
      const page = list.find((item) => item.type === 'page');
      if (page) return page;
    } catch {
      /* not ready yet */
    }
    await sleep(250);
  }
  throw new Error('CDP did not start');
}

let socket;
try {
  const page = await cdpTarget();
  socket = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((ok, fail) => {
    socket.addEventListener('open', ok, { once: true });
    socket.addEventListener('error', fail, { once: true });
  });

  let nextId = 1;
  const pending = new Map();
  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const { ok, fail } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) fail(new Error(message.error.message));
      else ok(message.result);
    }
  });
  const send = (method, params = {}) =>
    new Promise((ok, fail) => {
      const id = nextId++;
      pending.set(id, { ok, fail });
      socket.send(JSON.stringify({ id, method, params }));
    });
  const evaluate = async (expression) =>
    (await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })).result.value;

  /** Real pointer events at the element's center, so Pressables respond. */
  async function tap(label) {
    // Tabs stay mounted, so hidden screens hold matching labels too: prefer an
    // exact label, and only accept an element that is actually on top at its center.
    const center = await evaluate(`(() => {
      const label = ${JSON.stringify(label)};
      const all = [...document.querySelectorAll('[aria-label^="' + label + '"]')];
      all.sort((a, b) => (b.getAttribute('aria-label') === label) - (a.getAttribute('aria-label') === label));
      for (const el of all) {
        if (!el.getBoundingClientRect().width) continue;
        el.scrollIntoView({ block: 'center' });
        const r = el.getBoundingClientRect();
        if (!r.width || !r.height) continue;
        const x = r.left + r.width / 2;
        const y = r.top + r.height / 2;
        if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) continue;
        const hit = document.elementFromPoint(x, y);
        if (hit && (el === hit || el.contains(hit))) return { x, y };
      }
      return null;
    })()`);
    if (!center) throw new Error(`Nothing labelled "${label}" on screen`);
    for (const type of ['mouseMoved', 'mousePressed', 'mouseReleased']) {
      await send('Input.dispatchMouseEvent', { type, x: center.x, y: center.y, button: 'left', clickCount: 1 });
    }
  }

  async function run(action) {
    if (Array.isArray(action)) {
      for (const step of action) {
        await run(step);
        await sleep(1800);
      }
      return;
    }
    if (action.load) {
      await send('Page.navigate', { url: `${BASE_URL}${action.load}` });
      // Wait for the bundle to boot and render real content.
      for (let attempt = 0; attempt < 150; attempt += 1) {
        if ((await evaluate('document.body ? document.body.innerText.length : 0')) > 60) break;
        await sleep(400);
      }
    }
    if (action.tap) await tap(action.tap);
    if (action.scroll) {
      await evaluate(`[...document.querySelectorAll('*')]
        .filter((el) => el.scrollHeight > el.clientHeight + 80 && getComputedStyle(el).overflowY !== 'hidden')
        .forEach((el) => { el.scrollTop = ${action.scroll}; })`);
    }
  }

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: WIDTH, height: HEIGHT, deviceScaleFactor: 2, mobile: true });

  for (const scheme of ['light', 'dark']) {
    await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: scheme }] });
    for (const step of TOUR) {
      await run(step.action);
      await sleep(step.wait ?? 2600);
      const shot = await send('Page.captureScreenshot', { format: 'png', fromSurface: true });
      const file = resolve(OUT, `${step.name}${scheme === 'dark' ? '-dark' : ''}.png`);
      writeFileSync(file, Buffer.from(shot.data, 'base64'));
      console.log(`saved ${file}`);
    }
  }
} finally {
  socket?.close();
  edge.kill();
  await sleep(500);
  try {
    rmSync(profile, { recursive: true, force: true });
  } catch {
    /* profile may still be locked on Windows */
  }
}
