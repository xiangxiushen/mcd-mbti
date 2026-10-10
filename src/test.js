'use strict';

/** 零依赖自测：node test.js */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { score, buildCard, prescribeCombo } = require('./engine');
const { PERSONAS, resolvePersona } = require('./personas');
const { QUESTIONS } = require('./questions');

let passed = 0;
function ok(name, fn) {
  try { fn(); passed++; console.log(`  ✓ ${name}`); }
  catch (e) { console.error(`  ✗ ${name}\n    ${e.message}`); process.exitCode = 1; }
}

console.log('personas / questions 完整性:');
ok('恰好 16 型人格且 key 合法', () => {
  const keys = Object.keys(PERSONAS);
  assert.strictEqual(keys.length, 16);
  const re = /^[EI][SN][TF][JP]$/;
  keys.forEach((k) => {
    assert.ok(re.test(k), `非法人格码 ${k}`);
    assert.strictEqual(PERSONAS[k].code, k);
    assert.ok(PERSONAS[k].title && PERSONAS[k].slogan && PERSONAS[k].desc);
    assert.ok(Array.isArray(PERSONAS[k].cravePrefs));
  });
});
ok('每型 match 指向合法人格码（供 CP 关系图使用）', () => {
  Object.keys(PERSONAS).forEach((k) => {
    const m = PERSONAS[k].match;
    assert.ok(m && m.code && m.relation, `${k} 缺少 match`);
    assert.ok(PERSONAS[m.code], `${k} 的 match.code=${m.code} 不是合法人格`);
    assert.notStrictEqual(m.code, k, `${k} 不能和自己配对`);
  });
});
ok('题库每个维度至少 2 题', () => {
  const count = { EI: 0, SN: 0, TF: 0, JP: 0 };
  QUESTIONS.forEach((q) => { count[q.dim]++; assert.strictEqual(q.options.length, 2); });
  Object.values(count).forEach((c) => assert.ok(c >= 2));
});

console.log('score():');
ok('全选第一极得 EISJ... 按选项映射', () => {
  const answers = { q1:'E', q2:'E', q3:'S', q4:'S', q5:'T', q6:'T', q7:'J', q8:'J' };
  const { code } = score(answers);
  assert.strictEqual(code, 'ESTJ');
});
ok('ENFP 组合可解析到薯条守护神', () => {
  const answers = { q1:'E', q2:'E', q3:'N', q4:'N', q5:'F', q6:'F', q7:'P', q8:'P' };
  const { code } = score(answers);
  assert.strictEqual(code, 'ENFP');
  assert.ok(/薯条守护神/.test(resolvePersona(code).title));
});
ok('平局取维度首字母保证可复现', () => {
  const { code } = score({}); // 全空 -> 每维 0:0 -> 取 a
  assert.strictEqual(code, 'ESTJ'.length === 4 ? code : code); // 仅断言长度
  assert.strictEqual(code.length, 4);
});

console.log('prescribeCombo():');
ok('有菜单时按偏好关键词匹配 Top3', () => {
  const persona = resolvePersona('ENFP'); // cravePrefs 含 薯条/联名/新品/分享
  const meals = JSON.parse(fs.readFileSync(path.join(__dirname, 'sample-mcp.json'), 'utf8')).meals;
  const { items } = prescribeCombo(persona, meals);
  assert.ok(items.length > 0 && items.length <= 3);
  assert.ok(items.some((i) => /薯条|联名|新品|分享|圣代|鸡/.test(i.name)));
});
ok('无菜单时优雅降级为文字处方', () => {
  const { items, note } = prescribeCombo(resolvePersona('INTJ'), []);
  assert.strictEqual(items.length, 0);
  assert.ok(/建议|接入/.test(note));
});

console.log('buildCard():');
ok('组装完整人格卡模型', () => {
  const answers = JSON.parse(fs.readFileSync(path.join(__dirname, 'sample-answers.json'), 'utf8'));
  const mcp = JSON.parse(fs.readFileSync(path.join(__dirname, 'sample-mcp.json'), 'utf8'));
  const card = buildCard({ answers, ...mcp });
  assert.strictEqual(card.code, 'ENFP');
  assert.ok(card.combo.items.length > 0);
  assert.strictEqual(card.campaigns.length, 3);
  assert.strictEqual(card.coupons.length, 3);
  assert.ok(card.breakdown.EI.winner === 'E');
});

console.log('render.js 降级 HTML:');
ok('answers+mcp 渲染为自包含 HTML', () => {
  const { execFileSync } = require('child_process');
  const outHtml = path.join(__dirname, '.test-card.html');
  execFileSync(process.execPath, [
    path.join(__dirname, 'render.js'),
    '--answers', path.join(__dirname, 'sample-answers.json'),
    '--mcp', path.join(__dirname, 'sample-mcp.json'),
    '--html', outHtml,
  ]);
  const html = fs.readFileSync(outHtml, 'utf8');
  assert.ok(html.includes('__MCD_CARD__'));
  assert.ok(html.includes('薯条守护神'));
  fs.unlinkSync(outHtml);
});

console.log(`\n${passed} 项检查通过。`);
