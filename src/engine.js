'use strict';

/**
 * 测试引擎：把用户答案打分成四字母人格码，并组装人格卡数据模型。
 *
 * 本模块是纯函数式的，不发起任何 MCP / 网络调用。
 * MCP 数据（真实菜单、活动、优惠券）由上层 Agent 按 SKILL.md 流程取得后传入，
 * 这里只负责「人格 -> 本命套餐处方」的匹配与数据组装，便于独立测试。
 */

const { QUESTIONS } = require('./questions');
const { resolvePersona, PERSONAS } = require('./personas');

const DIMS = [
  ['EI', 'E', 'I'],
  ['SN', 'S', 'N'],
  ['TF', 'T', 'F'],
  ['JP', 'J', 'P'],
];

/**
 * 计分。
 * @param {Record<string,string>} answers  形如 { q1:'E', q2:'I', ... }，值为该题所选选项的 value 字母
 * @returns {{ code:string, scores:object, breakdown:object }}
 */
function score(answers = {}) {
  const tally = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
  for (const q of QUESTIONS) {
    const v = answers[q.id];
    if (v && tally[v] !== undefined) tally[v] += 1;
  }

  let code = '';
  const breakdown = {};
  for (const [dim, a, b] of DIMS) {
    const ca = tally[a];
    const cb = tally[b];
    // 平局时取每维定义里排在前面的字母（a），保证可复现
    const winner = ca >= cb ? a : b;
    code += winner;
    const total = ca + cb || 1;
    breakdown[dim] = {
      [a]: Math.round((ca / total) * 100),
      [b]: Math.round((cb / total) * 100),
      winner,
    };
  }

  return { code, scores: tally, breakdown };
}

/** 从一句话随机答案（给 demo / 快速测试用）生成 answers */
function randomAnswers() {
  const answers = {};
  for (const q of QUESTIONS) {
    const opt = q.options[Math.floor(Math.random() * q.options.length)];
    answers[q.id] = opt.value;
  }
  return answers;
}

/**
 * 人格 -> 本命套餐处方。
 * @param {object} persona  人格对象（含 cravePrefs）
 * @param {Array}  meals    query-meals 返回的餐品数组（可空）
 * @returns {{ items: Array, note: string }}
 */
function prescribeCombo(persona, meals) {
  const prefs = (persona && persona.cravePrefs) || [];
  const list = Array.isArray(meals) ? meals : [];

  if (list.length === 0) {
    // 无 MCP 菜单数据时，用偏好关键词给出「处方建议」文字（优雅降级）
    return {
      items: [],
      note: `建议点一份突出「${prefs.join(' / ')}」的组合（接入 MCP 实时菜单后会推荐具体餐品）`,
    };
  }

  const pick = (m) => ({
    name: pickField(m, ['name', 'productName', 'title', 'goodsName']),
    code: pickField(m, ['code', 'productCode', 'id', 'sku']),
    price: numField(m, ['price', 'salePrice', 'amount', 'promotionPrice']),
    tags: pickField(m, ['tags', 'label', 'category'], ''),
  });

  // 按偏好关键词给每个餐品打分，取 Top3
  const scored = list
    .map((m) => {
      const hay = JSON.stringify(m);
      let s = 0;
      prefs.forEach((p, i) => {
        if (hay.includes(p)) s += prefs.length - i; // 越靠前的偏好权重越高
      });
      return { m, s };
    })
    .sort((a, b) => b.s - a.s);

  const chosen = scored.filter((x) => x.s > 0).slice(0, 3).map((x) => pick(x.m));
  // 偏好一个都没命中时，退而取菜单前 3 个，避免空结果
  const items = chosen.length > 0 ? chosen : list.slice(0, 3).map(pick);

  return {
    items,
    note: items.length
      ? `为「${persona.title}」匹配的本命套餐处方`
      : '暂无匹配餐品',
  };
}

function pickField(obj, keys, d = null) {
  if (!obj) return d;
  for (const k of keys) if (obj[k] !== undefined && obj[k] !== null) return obj[k];
  return d;
}
function numField(obj, keys, d = 0) {
  const v = pickField(obj, keys, d);
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}

/**
 * 组装人格卡数据模型（供渲染器使用）。
 * @param {object} args
 * @param {Record<string,string>} args.answers
 * @param {Array}  [args.meals]       query-meals 结果
 * @param {Array}  [args.campaigns]   campaign-calendar 结果（当月活动）
 * @param {Array}  [args.coupons]     available-coupons 结果（可领券）
 * @returns {object} 人格卡模型
 */
function buildCard({ answers, meals, campaigns, coupons } = {}) {
  const { code, breakdown } = score(answers);
  const persona = resolvePersona(code) || {
    code,
    title: '🍟 麦门自由人',
    slogan: '我有我的麦门节奏。',
    desc: '你的麦门人格独一无二，不拘一格。',
    traits: ['自由'],
    cravePrefs: [],
    matchHint: '',
    rarity: '',
  };

  const combo = prescribeCombo(persona, meals);

  const campaignList = (Array.isArray(campaigns) ? campaigns : [])
    .map((c) => pickField(c, ['name', 'title', 'activityName', 'campaignName']))
    .filter(Boolean)
    .slice(0, 3);

  const couponList = (Array.isArray(coupons) ? coupons : [])
    .map((c) => pickField(c, ['name', 'couponName', 'title', 'desc']))
    .filter(Boolean)
    .slice(0, 3);

  return {
    code: persona.code,
    title: persona.title,
    slogan: persona.slogan,
    desc: persona.desc,
    traits: persona.traits,
    matchHint: persona.matchHint,
    rarity: persona.rarity,
    breakdown,
    combo,
    campaigns: campaignList,
    coupons: couponList,
  };
}

module.exports = { score, randomAnswers, prescribeCombo, buildCard, DIMS };
