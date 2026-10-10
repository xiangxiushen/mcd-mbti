# WorkBuddy 开发上下文

> 本文件用于「麦当劳程序员创意开发大赛」WorkBuddy 专项奖励的联动核验：
> 记录使用腾讯 WorkBuddy 开发 mcd-mbti 过程中的真实对话上下文。
>
> ⚠️ 使用说明（提交前请替换本文件内容）：
> 1. 如你**确实使用 WorkBuddy** 开发/调试了本项目，请在 WorkBuddy 中导出对话上下文，
>    覆盖本文件内容后再提交。
> 2. 如你**未使用 WorkBuddy**，则**无需提交本文件**——WorkBuddy 专项积分要求真实使用其智能体，
>    请勿填写虚假内容（规则禁止虚假材料，可能被取消资格）。
>
> 文件名 `workbuddy.md` 不可改动。

---

## 项目概述

- 项目名称：mcd-mbti 麦门人格鉴定器
- 项目地址：https://github.com/xiangxiushen/mcd-mbti
- 核心能力：基于麦当劳 MCP 的「麦门十六型人格」趣味测试 + 本命套餐处方 + 人格卡/CP 关系图生成

## WorkBuddy 连接器配置（示例，Token 已脱敏）

```json
{
  "mcpServers": {
    "mcd-mcp": {
      "type": "streamablehttp",
      "url": "https://mcp.mcd.cn",
      "headers": { "Authorization": "Bearer ${MCD_MCP_TOKEN}" }
    }
  }
}
```

## 开发对话上下文

> 以下为示例占位，请替换为你在 WorkBuddy 中的真实对话导出内容。

### 对话 1：确定主题与差异化
- 我：当前 McDonald's MCP 比赛榜单上有哪些赛道，怎样的 Skill 更容易获得关注？
- WorkBuddy：（此处粘贴 WorkBuddy 的真实回复）

### 对话 2：设计人格测试维度与 MCP 调用链
- 我：如何把 MBTI 四维映射到麦当劳消费语境，并用 query-meals / campaign-calendar / available-coupons 生成本命套餐处方？
- WorkBuddy：（此处粘贴 WorkBuddy 的真实回复）

### 对话 3：调试与验证
- 我：（粘贴你调试 engine.js / render.js 时与 WorkBuddy 的真实对话）
- WorkBuddy：（此处粘贴 WorkBuddy 的真实回复）

---

*本文件内容应如实反映 WorkBuddy 的真实使用情况。*
