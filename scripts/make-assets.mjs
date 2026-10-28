/* global Buffer */
/**
 * Dev-only asset generator.
 * Renders the brand SVG artwork in headless Edge and writes the app icon
 * (light + iOS dark), adaptive icon layers, light/dark splash images and the
 * favicon. Usage:
 *   node scripts/make-assets.mjs
 */
import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import os from 'node:os';

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const root = resolve(import.meta.dirname, '..');
const assets = resolve(root, 'assets');
mkdirSync(assets, { recursive: true });

const DISPLAY_FONT = readFileSync(
  resolve(root, 'node_modules/@expo-google-fonts/space-grotesk/700Bold/SpaceGrotesk_700Bold.ttf'),
).toString('base64');

const DROP = 'M24 3.5C24 3.5 41.5 21.4 41.5 30.2C41.5 39.6 33.7 44.5 24 44.5C14.3 44.5 6.5 39.6 6.5 30.2C6.5 21.4 24 3.5 24 3.5Z';

/** Brand palette, matching src/theme/palette.ts. */
const BRAND = {
  blueTop: '#2A93F5',
  blue: '#0B6BD3',
  blueDeep: '#0857B5',
  darkCanvas: '#0A141D',
  darkBlue: '#3B97F5',
  lightCanvas: '#F2F5F8',
  ink: '#0E1A24',
  inkDark: '#EDF3F7',
};

const defs = `
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${BRAND.blueTop}"/>
      <stop offset="0.55" stop-color="${BRAND.blue}"/>
      <stop offset="1" stop-color="${BRAND.blueDeep}"/>
    </linearGradient>
    <linearGradient id="bgDark" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#132A44"/>
      <stop offset="1" stop-color="${BRAND.darkCanvas}"/>
    </linearGradient>
    <radialGradient id="light" cx="0.3" cy="0.2" r="0.75">
      <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.22"/>
      <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
    </radialGradient>
  </defs>
`;

/** Two soft waves along the bottom of a square canvas of side `n`. */
function waves(n, color = '#FFFFFF') {
  const k = n / 1024;
  const y1 = 790 * k;
  const y2 = 860 * k;
  return `
    <path d="M0 ${y1} C${200 * k} ${y1 - 46 * k} ${360 * k} ${y1 + 40 * k} ${512 * k} ${y1} C${664 * k} ${y1 - 40 * k} ${824 * k} ${y1 + 46 * k} ${n} ${y1 - 10 * k} L${n} ${n} L0 ${n} Z" fill="${color}" fill-opacity="0.10"/>
    <path d="M0 ${y2} C${220 * k} ${y2 + 40 * k} ${380 * k} ${y2 - 36 * k} ${560 * k} ${y2} C${740 * k} ${y2 + 34 * k} ${880 * k} ${y2 - 30 * k} ${n} ${y2} L${n} ${n} L0 ${n} Z" fill="${color}" fill-opacity="0.12"/>`;
}

/**
 * The drop mark (same shape as <DropMark/> in the app), scaled into the canvas.
 * `shine` is the curved highlight inside the drop.
 */
function mark({ size, x, y, fill, shine = 'rgba(255,255,255,0.8)' }) {
  const scale = size / 48;
  const left = x - size / 2;
  const top = y - size / 2;
  return `
    <g transform="translate(${left} ${top}) scale(${scale})">
      <path d="${DROP}" fill="${fill}"/>
      ${shine ? `<path d="M17.6 31.4C17.6 35.6 20.4 38.4 24.3 38.9" stroke="${shine}" stroke-width="2.6" stroke-linecap="round" fill="none"/>` : ''}
    </g>`;
}

/** App icon: brand-blue gradient, soft light, bottom waves and a white drop. */
function iconSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
    ${defs}
    <rect width="1024" height="1024" fill="url(#bg)"/>
    <rect width="1024" height="1024" fill="url(#light)"/>
    ${waves(1024)}
    ${mark({ size: 560, x: 512, y: 486, fill: '#FFFFFF', shine: 'rgba(11,107,211,0.45)' })}
  </svg>`;
}

/** iOS dark-mode icon: dark canvas with the drop in the dark-theme blue. */
function iconDarkSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
    ${defs}
    <rect width="1024" height="1024" fill="url(#bgDark)"/>
    ${waves(1024, BRAND.darkBlue)}
    ${mark({ size: 560, x: 512, y: 486, fill: BRAND.darkBlue })}
  </svg>`;
}

/** Android adaptive foreground: the drop alone, inside the central safe zone. */
function foregroundSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
    ${mark({ size: 230, x: 256, y: 252, fill: '#FFFFFF', shine: 'rgba(11,107,211,0.45)' })}
  </svg>`;
}

function monochromeSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="432" height="432" viewBox="0 0 432 432">
    ${mark({ size: 194, x: 216, y: 213, fill: '#FFFFFF', shine: null })}
  </svg>`;
}

function backgroundSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
    ${defs}
    <rect width="512" height="512" fill="url(#bg)"/>
    <rect width="512" height="512" fill="url(#light)"/>
    ${waves(512)}
  </svg>`;
}

/** Splash: drop + "hidra" wordmark, like the in-app <Logo/>. One per theme. */
function splashSvg({ dark }) {
  const drop = dark ? BRAND.darkBlue : BRAND.blue;
  const ink = dark ? BRAND.inkDark : BRAND.ink;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
    ${mark({ size: 360, x: 512, y: 400, fill: drop })}
    <text x="512" y="720" text-anchor="middle" font-family="SpaceGrotesk" font-size="170" letter-spacing="-4" fill="${ink}">hidra</text>
  </svg>`;
}

function html(body, font = false) {
  return `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8"/>
      <style>
        @font-face {
          font-family: 'SpaceGrotesk';
          src: url(data:font/ttf;base64,${font ? DISPLAY_FONT : ''}) format('truetype');
          font-weight: 700;
        }
        html, body { margin: 0; padding: 0; background: transparent; }
        svg { display: block; }
      </style>
    </head>
    <body>${body}</body>
  </html>`;
}

const jobs = [
  { file: 'icon.png', size: 1024, svg: iconSvg(), transparent: false },
  { file: 'icon-dark.png', size: 1024, svg: iconDarkSvg(), transparent: false },
  { file: 'splash-icon.png', size: 1024, svg: splashSvg({ dark: false }), transparent: true, font: true },
  { file: 'splash-icon-dark.png', size: 1024, svg: splashSvg({ dark: true }), transparent: true, font: true },
  { file: 'android-icon-background.png', size: 512, svg: backgroundSvg(), transparent: false },
  { file: 'android-icon-foreground.png', size: 512, svg: foregroundSvg(), transparent: true },
  { file: 'android-icon-monochrome.png', size: 432, svg: monochromeSvg(), transparent: true },
  { file: 'favicon.png', size: 48, svg: iconSvg(), transparent: false },
];

const port = 9337;
const profile = resolve(os.tmpdir(), `edge-assets-${Date.now()}`);
const edge = spawn(
  EDGE,
  [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--allow-file-access-from-files',
    '--force-device-scale-factor=1',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    '--window-size=1024,1024',
    'about:blank',
  ],
  { stdio: 'ignore' },
);

async function cdpTargets() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
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
  const page = await cdpTargets();
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

  await send('Page.enable');
  await send('Runtime.enable');

  for (const job of jobs) {
    await send('Emulation.setDefaultBackgroundColorOverride', {
      color: job.transparent ? { r: 0, g: 0, b: 0, a: 0 } : { r: 255, g: 255, b: 255, a: 1 },
    });
    await send('Emulation.setDeviceMetricsOverride', {
      width: job.size,
      height: job.size,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await send('Page.navigate', { url: 'about:blank' });
    await sleep(180);
    await send('Runtime.evaluate', {
      expression: `document.open();document.write(${JSON.stringify(html(job.svg, job.font))});document.close();`,
    });
    await send('Runtime.evaluate', {
      expression: 'document.fonts.ready.then(() => true)',
      awaitPromise: true,
      returnByValue: true,
    });
    await sleep(450);

    const shot = await send('Page.captureScreenshot', {
      format: 'png',
      fromSurface: true,
      captureBeyondViewport: false,
      omitBackground: job.transparent,
      clip: { x: 0, y: 0, width: job.size, height: job.size, scale: 1 },
    });
    const target = resolve(assets, job.file);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, Buffer.from(shot.data, 'base64'));
    console.log(`wrote ${job.file} (${job.size}px)`);
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
