#!/usr/bin/env node
'use strict';

/**
 * 麦门人格鉴定卡渲染器。
 *
 * 用法：
 *   node render.js --card ./card.json --out ../card.png     # 已组装好的人格卡模型
 *   node render.js --card ./card.json --html ./card.html    # 仅产出可截图 HTML（无需 puppeteer）
 *   node render.js --answers ./answers.json [--mcp ./mcp.json] --html ./card.html
 *       # 传入答案(+可选 MCP 数据)，先用 engine.buildCard 组装再渲染
 *
 * 若装了 puppeteer -> 导出 1080×1350 PNG；否则降级为自包含 HTML。
 */

const fs = require('fs');
const path = require('path');
const { buildCard } = require('./engine');

function parseArgs(argv) {
  const a = { card: null, answers: null, mcp: null, out: null, html: null };
  for (let i = 2; i < argv.length; i++) {
    const k = argv[i];
    if (k === '--card') a.card = argv[++i];
    else if (k === '--answers') a.answers = argv[++i];
    else if (k === '--mcp') a.mcp = argv[++i];
    else if (k === '--out') a.out = argv[++i];
    else if (k === '--html') a.html = argv[++i];
    else if (k === '-h' || k === '--help') a.help = true;
  }
  return a;
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(path.resolve(process.cwd(), p), 'utf8'));
}

function usage() {
  console.log(`
麦门人格鉴定卡渲染器 mcd-mbti

  node render.js --card <json> [--out <png>] [--html <html>]
  node render.js --answers <json> [--mcp <json>] [--out <png>] [--html <html>]

  --card <json>     已组装的人格卡模型
  --answers <json>  测试答案 { "q1":"E", ... }
  --mcp <json>      可选，MCP 数据 { meals, campaigns, coupons }
  --out <png>       输出 PNG（需 puppeteer）
  --html <html>     输出自包含 HTML（无需依赖）
`);
}

function buildHtml(tpl, card) {
  const inj = `<script>window.__MCD_CARD__ = ${JSON.stringify(card)};</script>`;
  return tpl.includes('</head>') ? tpl.replace('</head>', `${inj}\n</head>`) : inj + tpl;
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help || (!args.card && !args.answers)) {
    usage();
    process.exit(args.help ? 0 : 1);
  }

  let card;
  if (args.card) {
    card = readJson(args.card);
  } else {
    const answers = readJson(args.answers);
    const mcp = args.mcp ? readJson(args.mcp) : {};
    card = buildCard({ answers, ...mcp });
  }

  const tpl = fs.readFileSync(path.join(__dirname, 'template.html'), 'utf8');
  const html = buildHtml(tpl, card);

  const wantHtmlOnly = !!args.html;
  let puppeteer = null;
  if (!wantHtmlOnly) {
    try { puppeteer = require('puppeteer'); } catch (_) { puppeteer = null; }
  }

  if (puppeteer && !wantHtmlOnly) {
    const out = path.resolve(process.cwd(), args.out || 'mcd-mbti-card.png');
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    try {
      const page = await browser.newPage();
      await page.setViewport({ width: 1080, height: 1350, deviceScaleFactor: 2 });
      await page.setContent(html, { waitUntil: 'networkidle0' });
      await new Promise((r) => setTimeout(r, 600));
      await page.screenshot({ path: out, type: 'png' });
      console.log(`✓ 人格卡已生成：${out}`);
    } finally { await browser.close(); }
    printSummary(card);
    return;
  }

  const htmlOut = path.resolve(
    process.cwd(),
    args.html || (args.out ? args.out.replace(/\.png$/i, '.html') : 'mcd-mbti-card.html')
  );
  fs.writeFileSync(htmlOut, html, 'utf8');
  if (!wantHtmlOnly) console.log('ℹ 未检测到 puppeteer，已降级为 HTML 输出（装 puppeteer 可直接导出 PNG）。');
  console.log(`✓ 人格卡 HTML 已生成：${htmlOut}`);
  printSummary(card);
}

function printSummary(c) {
  console.log('\n—— 鉴定结果 ——');
  console.log(`人格：${c.code}  ${c.title}`);
  console.log(`金句：${c.slogan}`);
  if (c.rarity) console.log(`稀有度：${c.rarity}`);
  if (c.combo && c.combo.items && c.combo.items.length) {
    console.log('本命套餐：' + c.combo.items.map((i) => i.name).join('、'));
  } else if (c.combo) {
    console.log('本命套餐：' + c.combo.note);
  }
  if (c.matchHint) console.log('最搭：' + c.matchHint);
}

main().catch((e) => { console.error('✗ 渲染出错：', e); process.exit(1); });
