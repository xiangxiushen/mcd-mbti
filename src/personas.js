'use strict';

/**
 * 麦门十六型人格定义。
 *
 * key 为 MBTI 四字母码（EI + SN + TF + JP）。
 * 每型包含：
 *   code    四字母码
 *   title   麦门人格称号（带 emoji，社交炫耀点）
 *   slogan  一句人格金句
 *   desc    人格描述（2-3 句）
 *   traits  性格关键词标签
 *   cravePrefs 本命套餐偏好关键词 —— 用于从真实 MCP 菜单里匹配/生成「本命套餐处方」
 *   matchHint  与之最搭 / 最不搭的人格（增加互动与分享欲）
 *   rarity  稀有度文案（制造身份感）
 */

const PERSONAS = {
  // ===== 分析家族（NT）=====
  INTJ: {
    code: 'INTJ',
    title: '🥤 续杯战略家',
    slogan: '每一口都在我的计划之内。',
    desc: '你把吃麦当劳也当成一场精密运算：套餐、券、积分一个不落。独享时光是你的充电方式，效率与性价比是你的信仰。',
    traits: ['独享派', '本命固定', '极致理性', '规划狂'],
    cravePrefs: ['超值', '套餐', '咖啡', '可乐'],
    matchHint: '和「🍟 薯条守护神 ENFP」互补到爆',
    match: { code: 'ENFP', relation: '互补' },
    rarity: '麦门人群里约 3%，稀有的运筹帷幄型',
  },
  INTP: {
    code: 'INTP',
    title: '🍔 配方研究员',
    slogan: '这个汉堡，还能更好吃一点。',
    desc: '你爱独自琢磨「怎么搭最香」，热衷研究隐藏吃法和特制组合。尝鲜但理性，永远在优化自己的麦门方程式。',
    traits: ['独享派', '尝鲜控', '爱钻研', '随性'],
    cravePrefs: ['新品', '特制', '汉堡', '鸡'],
    matchHint: '和「🧋 氛围感制造机 ESFJ」聊得停不下来',
    match: { code: 'ESFJ', relation: '灵魂搭子' },
    rarity: '麦门人群里约 4%，低调的吃法发明家',
  },
  ENTJ: {
    code: 'ENTJ',
    title: '👑 团餐指挥官',
    slogan: '这顿我安排，都听我的。',
    desc: '聚餐天然的组局者，三下五除二就把全场的单点明白。有规划、有气场，拼单省钱也拿捏得死死的。',
    traits: ['社交派', '本命固定', '理性', '强规划'],
    cravePrefs: ['家庭', '桶', '分享', '套餐'],
    matchHint: '和「🍟 薯条守护神 ENFP」是黄金搭档',
    match: { code: 'ENFP', relation: '黄金搭档' },
    rarity: '麦门人群里约 3%，天生的饭局 CEO',
  },
  ENTP: {
    code: 'ENTP',
    title: '🌶️ 菜单辩论家',
    slogan: '上新了？那必须第一个冲。',
    desc: '对一切新品、联名、限定毫无抵抗力，还爱拉着朋友一起尝鲜评测。点餐现场最活跃的那个嘴，就是你。',
    traits: ['社交派', '尝鲜控', '理性', '随性'],
    cravePrefs: ['新品', '联名', '限定', '辣'],
    matchHint: '和「🥤 续杯战略家 INTJ」碰撞出火花',
    match: { code: 'INTJ', relation: '火花组合' },
    rarity: '麦门人群里约 3%，行走的新品情报站',
  },
  // ===== 外交家族（NF）=====
  INFJ: {
    code: 'INFJ',
    title: '🌙 深夜治愈师',
    slogan: '一个人的麦当劳，是我的小宇宙。',
    desc: '你把麦门时光当成情绪疗愈，常在深夜或独处时点一份治愈自己。看似尝鲜，其实每次选择都藏着心情。',
    traits: ['独享派', '尝鲜控', '感性', '有计划'],
    cravePrefs: ['甜品', '咖啡', '限定', '鸡'],
    matchHint: '和「🎉 气氛组组长 ESFP」互相治愈',
    match: { code: 'ESFP', relation: '互相治愈' },
    rarity: '麦门人群里约 2%，最稀有的温柔型',
  },
  INFP: {
    code: 'INFP',
    title: '🍰 甜品梦想家',
    slogan: '好吃是其次，开心最重要。',
    desc: '跟着心情走的理想主义食客，一个联名包装、一支甜筒就能让你一整天开心。独处的麦门时间是你的小确幸。',
    traits: ['独享派', '尝鲜控', '感性', '随性'],
    cravePrefs: ['甜品', '甜筒', '联名', '饮品'],
    matchHint: '和「👑 团餐指挥官 ENTJ」是奇妙组合',
    match: { code: 'ENTJ', relation: '奇妙组合' },
    rarity: '麦门人群里约 4%，浪漫的味觉诗人',
  },
  ENFJ: {
    code: 'ENFJ',
    title: '🤝 请客担当',
    slogan: '你们开心，我就开心。',
    desc: '聚餐里最会照顾人的那位，记得每个朋友的忌口和本命。乐于张罗、乐于分享，一顿麦当劳也能被你吃出仪式感。',
    traits: ['社交派', '本命固定', '感性', '有计划'],
    cravePrefs: ['分享', '家庭', '甜品', '套餐'],
    matchHint: '和「🍔 配方研究员 INTP」互相成就',
    match: { code: 'INTP', relation: '互相成就' },
    rarity: '麦门人群里约 3%，饭桌上的太阳',
  },
  ENFP: {
    code: 'ENFP',
    title: '🍟 薯条守护神',
    slogan: '薯条配快乐，人生才完整！',
    desc: '麦门界的快乐源泉，社牛属性拉满，哪里有热闹哪里有你。尝鲜、联名、拼单样样来，情绪价值永远在线。',
    traits: ['社交派', '尝鲜控', '感性', '随性'],
    cravePrefs: ['薯条', '联名', '新品', '分享'],
    matchHint: '和「🥤 续杯战略家 INTJ」最互补',
    match: { code: 'INTJ', relation: '最互补' },
    rarity: '麦门人群里约 8%，最受欢迎的快乐担当',
  },
  // ===== 守护家族（SJ）=====
  ISTJ: {
    code: 'ISTJ',
    title: '🍔 巨无霸原教旨主义者',
    slogan: '本命套餐，十年如一日。',
    desc: '忠诚、稳定、靠谱。你的订单可以当闹钟用——永远那套、永远不翻车。规划到位，券一张不浪费。',
    traits: ['独享派', '本命固定', '理性', '强规划'],
    cravePrefs: ['巨无霸', '套餐', '可乐', '超值'],
    matchHint: '和「🎉 气氛组组长 ESFP」是反差萌',
    match: { code: 'ESFP', relation: '反差萌' },
    rarity: '麦门人群里约 10%，最稳的本命型',
  },
  ISFJ: {
    code: 'ISFJ',
    title: '🧸 温柔续杯者',
    slogan: '熟悉的味道，最让我安心。',
    desc: '恋旧又体贴，钟爱让你有安全感的老味道。独享为主，但总默默记得给家人朋友带一份。',
    traits: ['独享派', '本命固定', '感性', '有计划'],
    cravePrefs: ['套餐', '甜品', '鸡', '饮品'],
    matchHint: '和「🌶️ 菜单辩论家 ENTP」互补',
    match: { code: 'ENTP', relation: '互补' },
    rarity: '麦门人群里约 9%，最暖心的守护型',
  },
  ESTJ: {
    code: 'ESTJ',
    title: '📋 效率点餐官',
    slogan: '流程我熟，三秒下单。',
    desc: '聚餐里的执行力担当，点餐、算账、领券一气呵成。讲究秩序和性价比，带你吃麦当劳绝不踩坑。',
    traits: ['社交派', '本命固定', '理性', '强规划'],
    cravePrefs: ['套餐', '超值', '家庭', '咖啡'],
    matchHint: '和「🍰 甜品梦想家 INFP」是互补 CP',
    match: { code: 'INFP', relation: '互补 CP' },
    rarity: '麦门人群里约 9%，可靠的组织者',
  },
  ESFJ: {
    code: 'ESFJ',
    title: '🧋 氛围感制造机',
    slogan: '一起吃，才叫幸福。',
    desc: '天生的聚会黏合剂，热衷张罗、分享、拍照打卡。本命稳定，但永远乐意为朋友的口味让步。',
    traits: ['社交派', '本命固定', '感性', '有计划'],
    cravePrefs: ['分享', '甜品', '联名', '饮品'],
    matchHint: '和「🍔 配方研究员 INTP」最聊得来',
    match: { code: 'INTP', relation: '最聊得来' },
    rarity: '麦门人群里约 11%，最具人气的社交型',
  },
  // ===== 探险家族（SP）=====
  ISTP: {
    code: 'ISTP',
    title: '🚗 得来速车神',
    slogan: '上车，取餐，走人，干净利落。',
    desc: '极简高效的实用派，得来速是你的主场。独来独往，想吃就吃，从不纠结，性价比在线。',
    traits: ['独享派', '本命固定', '理性', '随性'],
    cravePrefs: ['套餐', '汉堡', '可乐', '超值'],
    matchHint: '和「🧋 氛围感制造机 ESFJ」反差有趣',
    match: { code: 'ESFJ', relation: '反差有趣' },
    rarity: '麦门人群里约 5%，酷感十足的行动派',
  },
  ISFP: {
    code: 'ISFP',
    title: '🎨 颜值收藏家',
    slogan: '好看好吃，缺一不可。',
    desc: '感性的美学食客，为联名包装、限定周边心动。独享时光里，一份对味的麦当劳就是你的小艺术展。',
    traits: ['独享派', '尝鲜控', '感性', '随性'],
    cravePrefs: ['联名', '限定', '甜品', '周边'],
    matchHint: '和「📋 效率点餐官 ESTJ」互补',
    match: { code: 'ESTJ', relation: '互补' },
    rarity: '麦门人群里约 6%，细腻的审美派',
  },
  ESTP: {
    code: 'ESTP',
    title: '🔥 限定收割机',
    slogan: '限定？手慢无，冲就完了！',
    desc: '行动力爆表的尝鲜猛将，新品限定第一波必到现场。爱热闹、爱拼手速，带动全场的就是你。',
    traits: ['社交派', '尝鲜控', '理性', '随性'],
    cravePrefs: ['限定', '新品', '辣', '联名'],
    matchHint: '和「🌙 深夜治愈师 INFJ」是奇妙反差',
    match: { code: 'INFJ', relation: '奇妙反差' },
    rarity: '麦门人群里约 5%，雷厉风行的猎手',
  },
  ESFP: {
    code: 'ESFP',
    title: '🎉 气氛组组长',
    slogan: '吃麦当劳，就要开开心心一大桌！',
    desc: '麦门快乐的放大器，聚餐现场的 C 位。跟着心情和热闹走，尝鲜、拍照、分享样样拿手，情绪永远拉满。',
    traits: ['社交派', '尝鲜控', '感性', '随性'],
    cravePrefs: ['分享', '桶', '甜品', '联名'],
    matchHint: '和「🍔 巨无霸原教旨主义者 ISTJ」反差萌',
    match: { code: 'ISTJ', relation: '反差萌' },
    rarity: '麦门人群里约 7%，天生的快乐制造者',
  },
};

/** 组合四维字母得到人格 key，带兜底 */
function resolvePersona(code) {
  return PERSONAS[code] || null;
}

module.exports = { PERSONAS, resolvePersona };
