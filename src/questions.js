'use strict';

/**
 * 麦门人格鉴定器 · 测试题库
 *
 * 四个维度（全部用麦当劳语境包装 MBTI 的四轴）：
 *   E/I  社交能量：堂食社牛(E) vs 外送独享(I)
 *   S/N  选择风格：固定本命(S) vs 每次尝鲜(N)
 *   T/F  决策依据：性价比理性(T) vs 心情/联名感性(F)
 *   J/P  行动节奏：提前规划领券(J) vs 到店随缘(P)
 *
 * 每题两个选项，分别加权到某一极。dim 为维度，value 为该选项倾向的字母。
 * 题目可被 UI/CLI 任意顺序呈现；至少每维 2 题，保证区分度。
 */

const QUESTIONS = [
  // ---- E / I ----
  {
    id: 'q1',
    dim: 'EI',
    text: '周五下班想吃麦当劳，你更可能？',
    options: [
      { label: '直接去店里堂食，边吃边刷手机也很治愈', value: 'E' },
      { label: '点个麦乐送，窝在沙发里一个人慢慢吃', value: 'I' },
    ],
  },
  {
    id: 'q2',
    dim: 'EI',
    text: '朋友说「一起拼个麦当劳」，你的第一反应？',
    options: [
      { label: '好啊！人多一起点更热闹，还能拼出更多', value: 'E' },
      { label: '你们去吧，我自己点我想吃的更自在', value: 'I' },
    ],
  },
  // ---- S / N ----
  {
    id: 'q3',
    dim: 'SN',
    text: '打开麦当劳 App，你通常？',
    options: [
      { label: '熟门熟路直接点那套吃了 N 次的本命套餐', value: 'S' },
      { label: '先看看有没有上新/联名，这次想试点不一样的', value: 'N' },
    ],
  },
  {
    id: 'q4',
    dim: 'SN',
    text: '出了一款没吃过的新品汉堡，你会？',
    options: [
      { label: '再观望下，别人说好吃我才考虑', value: 'S' },
      { label: '立刻冲！没吃过的就是要第一时间尝鲜', value: 'N' },
    ],
  },
  // ---- T / F ----
  {
    id: 'q5',
    dim: 'TF',
    text: '面对两个套餐，你更看重？',
    options: [
      { label: '哪个单价更划算、分量热量更合理', value: 'T' },
      { label: '哪个此刻更想吃、包装/联名更戳我', value: 'F' },
    ],
  },
  {
    id: 'q6',
    dim: 'TF',
    text: '麦当劳出了你爱的 IP 联名款，但要加钱，你？',
    options: [
      { label: '理性算一下，不值就跳过', value: 'T' },
      { label: '必须拿下，喜欢就是最大的理由', value: 'F' },
    ],
  },
  // ---- J / P ----
  {
    id: 'q7',
    dim: 'JP',
    text: '点餐前，你和优惠券的关系是？',
    options: [
      { label: '提前把能领的券都领好，规划到位再下单', value: 'J' },
      { label: '到了结算页才想起看看有没有券能用', value: 'P' },
    ],
  },
  {
    id: 'q8',
    dim: 'JP',
    text: '关于「今天吃什么」，你更像？',
    options: [
      { label: '心里早有计划，甚至提前想好了点什么', value: 'J' },
      { label: '到了再说，看当下心情和菜单随缘决定', value: 'P' },
    ],
  },
];

module.exports = { QUESTIONS };
