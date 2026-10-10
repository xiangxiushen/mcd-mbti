---
description: 麦门人格鉴定——答题测出你的麦门十六型人格，并生成本命套餐处方人格卡
---

# /mcd-mbti

显式触发麦门人格鉴定。请严格按 `.claude/skills/mcd-mbti/SKILL.md` 的流程：

1. 逐题呈现 `src/questions.js` 的 8 道题（每维 2 题），收集二选一答案；用户也可一句话自述由你映射。
2. `engine.score(answers)` 计分 → 四字母人格码 → `resolvePersona` 取人格。
3. 用 MCP 生成本命套餐处方：`now-time-info` →（可选 `query-nearby-stores`）→ `query-meals` →（可选 `query-meal-detail`）→ `engine.prescribeCombo`。
4. `campaign-calendar` 挑合调性的当月活动 2-3 个；`available-coupons` 列 2-3 张可领券。
5. `engine.buildCard` 组装 → `render.js` 渲染人格卡 → 输出图片 + 文字结果，并引导分享。

约束：
- 仅只读 Tool；禁止自动领券/下单/抽奖等写操作。
- 调用总数 ≤8 次，避免限流。
- 缺某类数据则跳过对应模块并继续（如无菜单则给文字版处方）。

参数（可选）：`$ARGUMENTS`
- 可含用户自述（口味/习惯）用于快速映射，或门店/城市用于菜单上下文。
