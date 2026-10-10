'use strict';

/**
 * 生成「麦门十六型人格 · 最搭 CP 关系图」。
 *
 * 两种输出：
 *   1) docs/cp-chart.svg   —— 矢量图，文字清晰、可无限缩放（主产物，README 用）
 *   2) docs/cp-chart.png   —— 位图示意（零依赖手绘，供不支持 SVG 的场景）
 *
 * 数据来源：personas.js 的 match 字段（best CP code + relation）。
 * 布局：16 型按 MBTI 四大家族分 4 个象限排布，CP 连线跨象限相连。
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { PERSONAS } = require('./personas');

const W = 1200, H = 1200;

// 四大家族分组（NT 分析 / NF 外交 / SJ 守护 / SP 探险）
const FAMILIES = [
  { key: 'NT', name: '分析家族 · NT', color: '#6D28D9', codes: ['INTJ', 'INTP', 'ENTJ', 'ENTP'] },
  { key: 'NF', name: '外交家族 · NF', color: '#059669', codes: ['INFJ', 'INFP', 'ENFJ', 'ENFP'] },
  { key: 'SJ', name: '守护家族 · SJ', color: '#2563EB', codes: ['ISTJ', 'ISFJ', 'ESTJ', 'ESFJ'] },
  { key: 'SP', name: '探险家族 · SP', color: '#DB2777', codes: ['ISTP', 'ISFP', 'ESTP', 'ESFP'] },
];

// 四象限中心（左上 NT、右上 NF、左下 SJ、右下 SP）
const QUAD = {
  NT: { cx: 320, cy: 360 },
  NF: { cx: 880, cy: 360 },
  SJ: { cx: 320, cy: 820 },
  SP: { cx: 880, cy: 820 },
};
// 象限内 2x2 的相对偏移
const OFFS = [
  { dx: -150, dy: -90 },
  { dx: 150, dy: -90 },
  { dx: -150, dy: 90 },
  { dx: 150, dy: 90 },
];

// 计算每型的坐标
const POS = {};
FAMILIES.forEach((fam) => {
  const q = QUAD[fam.key];
  fam.codes.forEach((code, i) => {
    POS[code] = { x: q.cx + OFFS[i].dx, y: q.cy + OFFS[i].dy, color: fam.color };
  });
});

/* ----------------------- SVG ----------------------- */
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

function buildSvg() {
  const parts = [];
  parts.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="PingFang SC, Microsoft YaHei, Noto Sans SC, sans-serif">`);
  // 背景
  parts.push(`<defs><radialGradient id="bg" cx="50%" cy="0%" r="120%">
    <stop offset="0%" stop-color="#FFD95A"/><stop offset="30%" stop-color="#FFC72C"/>
    <stop offset="78%" stop-color="#DA291C"/><stop offset="100%" stop-color="#B01E13"/>
  </radialGradient></defs>`);
  parts.push(`<rect width="${W}" height="${H}" fill="url(#bg)"/>`);

  // 标题
  parts.push(`<text x="${W/2}" y="78" text-anchor="middle" font-size="48" font-weight="900" fill="#fff">麦门十六型人格 · 最搭 CP 图</text>`);
  parts.push(`<text x="${W/2}" y="118" text-anchor="middle" font-size="24" fill="#fff" opacity="0.9">M-BTI · 看看你和谁最配一起吃麦当劳</text>`);

  // 家族分区底色
  FAMILIES.forEach((fam) => {
    const q = QUAD[fam.key];
    parts.push(`<rect x="${q.cx - 230}" y="${q.cy - 170}" width="460" height="340" rx="28" fill="${fam.color}" opacity="0.14"/>`);
    parts.push(`<text x="${q.cx}" y="${q.cy - 182}" text-anchor="middle" font-size="24" font-weight="800" fill="#fff">${fam.name}</text>`);
  });

  // CP 连线（去重：同一对只画一次）
  const drawn = new Set();
  Object.keys(PERSONAS).forEach((code) => {
    const m = PERSONAS[code].match;
    if (!m || !POS[m.code]) return;
    const key = [code, m.code].sort().join('-');
    if (drawn.has(key)) return;
    drawn.add(key);
    const a = POS[code], b = POS[m.code];
    parts.push(`<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="#fff" stroke-width="2.5" stroke-dasharray="7 6" opacity="0.7"/>`);
    // 关系标签贴在靠近起点 1/3 处，避免多条线在中点叠标签
    const lx = a.x + (b.x - a.x) * 0.34, ly = a.y + (b.y - a.y) * 0.34;
    const w = Math.max(60, m.relation.length * 18 + 24);
    parts.push(`<g transform="translate(${lx},${ly})">
      <rect x="${-w / 2}" y="-15" width="${w}" height="30" rx="15" fill="#1a1a1a" opacity="0.92"/>
      <text x="0" y="6" text-anchor="middle" font-size="17" font-weight="700" fill="#FFC72C">${esc(m.relation)}</text>
    </g>`);
  });

  // 人格节点
  Object.keys(PERSONAS).forEach((code) => {
    const p = PERSONAS[code];
    const pos = POS[code];
    if (!pos) return;
    const emoji = (p.title.match(/^\S+/) || [''])[0];
    let name = p.title.replace(/^\S+\s*/, '');
    // 过长名称缩短，避免溢出节点
    if (name.length > 6) name = name.slice(0, 6);
    const nameSize = name.length >= 6 ? 17 : 20;
    parts.push(`<g transform="translate(${pos.x},${pos.y})">
      <circle r="46" fill="#fff" stroke="${pos.color}" stroke-width="4"/>
      <text x="0" y="-6" text-anchor="middle" font-size="34">${esc(emoji)}</text>
      <text x="0" y="24" text-anchor="middle" font-size="18" font-weight="800" fill="${pos.color}">${esc(code)}</text>
      <text x="0" y="72" text-anchor="middle" font-size="${nameSize}" font-weight="700" fill="#1a1a1a">${esc(name)}</text>
    </g>`);
  });

  parts.push(`<text x="${W/2}" y="${H-28}" text-anchor="middle" font-size="20" fill="#fff" opacity="0.9">由 mcd-mbti 基于麦当劳 MCP 生成 · 测测你是哪一型</text>`);
  parts.push(`</svg>`);
  return parts.join('\n');
}

/* ----------------------- PNG（位图示意） ----------------------- */
const buf = Buffer.alloc(W * H * 4);
function setPx(x, y, r, g, b, a = 255) {
  x = Math.round(x); y = Math.round(y);
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const i = (y * W + x) * 4, na = a / 255;
  buf[i] = Math.round(buf[i] * (1 - na) + r * na);
  buf[i + 1] = Math.round(buf[i + 1] * (1 - na) + g * na);
  buf[i + 2] = Math.round(buf[i + 2] * (1 - na) + b * na);
  buf[i + 3] = 255;
}
function fillRect(x, y, w, h, c, a = 255, radius = 0) {
  for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) {
    if (radius > 0) {
      const cx = xx < radius ? radius - xx : (xx > w - radius ? xx - (w - radius) : 0);
      const cy = yy < radius ? radius - yy : (yy > h - radius ? yy - (h - radius) : 0);
      if (cx > 0 && cy > 0 && cx * cx + cy * cy > radius * radius) continue;
    }
    setPx(x + xx, y + yy, c[0], c[1], c[2], a);
  }
}
function disc(cx, cy, r, c, a = 255) {
  for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++)
    if (x * x + y * y <= r * r) setPx(cx + x, cy + y, c[0], c[1], c[2], a);
}
function ring(cx, cy, r, w, c) {
  for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) {
    const d = Math.sqrt(x * x + y * y);
    if (d <= r && d >= r - w) setPx(cx + x, cy + y, c[0], c[1], c[2]);
  }
}
function dline(x1, y1, x2, y2, c, a = 200) {
  const steps = Math.ceil(Math.hypot(x2 - x1, y2 - y1));
  for (let i = 0; i <= steps; i++) {
    if (i % 11 < 7) { // 虚线
      const t = i / steps;
      const x = x1 + (x2 - x1) * t, y = y1 + (y2 - y1) * t;
      disc(Math.round(x), Math.round(y), 1, c, a);
    }
  }
}
function hex(h) { h = h.replace('#', ''); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)); }

function buildPng() {
  // 背景渐变
  const top = [255, 217, 90], mid = [255, 199, 44], red = [218, 41, 28], bot = [176, 30, 19];
  const lerp = (a, b, k) => a + (b - a) * k;
  for (let y = 0; y < H; y++) {
    const t = y / H; let c;
    if (t < 0.3) c = [0, 1, 2].map((i) => lerp(top[i], mid[i], t / 0.3));
    else if (t < 0.78) c = [0, 1, 2].map((i) => lerp(mid[i], red[i], (t - 0.3) / 0.48));
    else c = [0, 1, 2].map((i) => lerp(red[i], bot[i], (t - 0.78) / 0.22));
    for (let x = 0; x < W; x++) setPx(x, y, c[0], c[1], c[2]);
  }
  // 标题条（示意）
  fillRect(W / 2 - 260, 56, 520, 22, [255, 255, 255], 235, 8);
  fillRect(W / 2 - 170, 104, 340, 12, [255, 255, 255], 200, 6);

  // 家族分区
  FAMILIES.forEach((fam) => {
    const q = QUAD[fam.key], c = hex(fam.color);
    fillRect(q.cx - 230, q.cy - 170, 460, 340, c, 36, 28);
    fillRect(q.cx - 90, q.cy - 196, 180, 16, [255, 255, 255], 220, 6);
  });

  // CP 连线
  const drawn = new Set();
  Object.keys(PERSONAS).forEach((code) => {
    const m = PERSONAS[code].match; if (!m || !POS[m.code]) return;
    const key = [code, m.code].sort().join('-'); if (drawn.has(key)) return; drawn.add(key);
    const a = POS[code], b = POS[m.code];
    dline(a.x, a.y, b.x, b.y, [255, 255, 255], 180);
    const lx = a.x + (b.x - a.x) * 0.34, ly = a.y + (b.y - a.y) * 0.34;
    fillRect(lx - 42, ly - 15, 84, 30, [26, 26, 26], 235, 15);
    fillRect(lx - 30, ly - 5, 60, 10, [255, 199, 44]); // 关系文字示意
  });

  // 节点
  Object.keys(PERSONAS).forEach((code) => {
    const pos = POS[code]; if (!pos) return; const c = hex(pos.color);
    disc(pos.x, pos.y, 46, [255, 255, 255]);
    ring(pos.x, pos.y, 46, 4, c);
    disc(pos.x, pos.y - 8, 14, c, 180);          // emoji 位置示意
    fillRect(pos.x - 24, pos.y + 14, 48, 12, c); // code 示意
    fillRect(pos.x - 46, pos.y + 56, 92, 14, [26, 26, 26]); // 名称示意
  });

  fillRect(W / 2 - 200, H - 40, 400, 12, [255, 255, 255], 200, 6);
  return png(W, H, buf);
}

function png(width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const chunk = (type, data) => {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
    const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
    const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body) >>> 0, 0);
    return Buffer.concat([len, body, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4); ihdr[8] = 8; ihdr[9] = 6;
  const raw = Buffer.alloc(height * (width * 4 + 1));
  for (let y = 0; y < height; y++) { raw[y * (width * 4 + 1)] = 0; rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4); }
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}
const crcTable = (() => { const t = new Int32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c; } return t; })();
function crc32(b) { let c = -1; for (let i = 0; i < b.length; i++) c = crcTable[(c ^ b[i]) & 0xff] ^ (c >>> 8); return c ^ -1; }

// 输出
const docs = path.join(__dirname, '..', 'docs');
fs.mkdirSync(docs, { recursive: true });
fs.writeFileSync(path.join(docs, 'cp-chart.svg'), buildSvg(), 'utf8');
fs.writeFileSync(path.join(docs, 'cp-chart.png'), buildPng());
console.log('✓ 已生成最搭 CP 关系图：docs/cp-chart.svg（矢量，推荐）+ docs/cp-chart.png（位图示意）');
