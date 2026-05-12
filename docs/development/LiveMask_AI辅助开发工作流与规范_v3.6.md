# LiveMask AI辅助开发工作流与规范 v3.6

**版本**：v3.6  
**目的**：建立一套适合 Cursor / Windsurf / Claude Code / Codex 等 AI 编码工具的高效、可追溯、闭环开发体系。

---

## 1. 核心目标

- 最大化利用 AI  coding 能力，同时保持**强 traceability（可追溯性）**。
- 每个代码变更必须与任务清单中的 **Task ID** 严格绑定。
- 每个任务必须完成 **开发 → 测试 → 验证 → 落地** 的完整闭环。
- 降低沟通成本，让 AI 能持续输出高质量、一致的代码。

---

## 2. Git 分支与命名规范（强制）

| 类型       | 分支命名示例                  | 说明 |
|------------|-------------------------------|------|
| 常规开发   | `dev/TASK-P1-03-promotion-engine` | 默认使用 dev 分支开发 |
| Bug 修复   | `bug/TASK-P3-02-quick-feedback`   | Bug 修复专用 |
| 补丁/热修复 | `patch/TASK-P1-01-payment-webhook` | 紧急补丁 |
| 功能特性   | `feature/TASK-P2-02-connection-orchestrator` | 大型新功能（可选） |

**强制规则**：
- 所有分支必须包含 **Task ID**（如 `TASK-P1-03`）。
- 禁止直接在 `main` / `master` 分支开发。
- Merge 到 `dev` 后必须删除本地分支。

---

## 3. Commit Message 强制模板

**格式**（必须严格遵守）：

```
[TASK-P1-03] feat: 实现推广大使忠诚度加成计算引擎

- 新增 UpdateAffiliateLoyaltyStats 定时任务
- 支持被邀请用户忠诚度加权平均计算
- 增加 platform_protection 系数应用
- 关联文档：LiveMask_收益模型优化建议_v3.6.md

Closes #TASK-P1-03
```

**必须包含**：
- `[TASK-XXXX]` 前缀
- `feat / fix / refactor / docs / test` 类型
- 简要说明 + 关键变更点
- 关联文档路径（可选但推荐）

---

## 4. 任务管理与 traceability（核心机制）

### 4.1 任务清单更新规则

每个任务在 `LiveMask_开发任务清单与里程碑_v3.6.md` 中必须维护以下字段：

- **状态**：待开始 / 进行中 / 已完成 / 已验证 / 已上线
- **当前分支**
- **关联 Commit**（多个用逗号分隔）
- **测试状态**：单元测试 / 集成测试 / 手动验证
- **验证人**
- **落地日期**

**AI 必须在完成代码后，主动要求开发者更新任务清单中的以上字段。**

### 4.2 代码中必须引用 Task ID

在关键函数、文件头部添加注释：

```go
// TASK-P1-03: 推广大使忠诚度加成计算
// 关联文档：LiveMask_收益模型优化建议_v3.6.md
func calculateLoyaltyBonus(...) { ... }
```

```dart
// TASK-P2-02: Connection Orchestrator 核心逻辑
// 关联文档：LiveMask_VPN客户端与sing-box集成架构设计_v3.6.md
class ConnectionOrchestrator { ... }
```

---

## 5. AI Editor 规则文件（推荐内容）

### 5.1 完整的 .cursorrules 文件内容（可直接复制到项目根目录使用）

```markdown
# LiveMask VPN 项目 - Cursor / Windsurf / Claude Code 规则

你是 LiveMask（极致稳定、抗审查、合伙人共赢 VPN）项目的资深全栈工程师，精通 Go + Flutter + sing-box + PostgreSQL + Redis。

## 最高优先级约束（必须严格遵守）

### 1. Traceability（可追溯性）
- 所有代码变更必须在文件头部或关键函数添加注释：`// TASK-XXXX: 说明`
- Commit Message 必须以 `[TASK-XXXX]` 开头
- 禁止在 main/dev 分支直接开发，必须使用 `dev/TASK-XXXX-xxx` 分支

### 2. 架构原则（铁律）
- **后端**：严格分层 Handler → Service → Repository，所有可变参数必须走 `system_configs`
- **客户端**：所有智能决策（健康检查、协议切换、重连策略）必须放在 `ConnectionOrchestrator`，sing-box 只负责传输
- **iOS**：NetworkExtension 必须保持极简，复杂逻辑全部放在 Dart 主 App
- **配置**：禁止硬编码任何可变参数，必须通过后台 `system_configs` 下发

### 3. 安全与合规
- 禁止记录用户真实访问的域名、IP、流量内容
- 所有敏感接口必须实现请求签名 + Timestamp + Nonce 防重放
- 客户端本地敏感数据必须使用 `flutter_secure_storage`
- iOS 扩展内存使用必须严格控制

### 4. 开发流程（强制）
完成子任务后必须：
1. 自检 Definition of Done (DoD) 清单
2. 更新 `LiveMask_开发任务清单与里程碑_v3.6.md`
3. 按「任务完成汇报模板」输出内容
4. 使用标准 Commit 格式提交

### 5. 输出要求
当用户询问当前任务时，请主动回复当前正在处理的 Task ID。
当完成一个子任务时，必须使用「任务完成汇报模板」输出。

## 当前项目重要约束
- 推广大使收益模型已移除衰减机制，采用忠诚度加成 + 平台保护系数
- C2C 交易成功后必须触发推广大使小额佣金
- VPN 连接质量上报与节点评分形成闭环
- 所有通知走 Redis Streams + Worker
```

### 5.2 Definition of Done (DoD) 清单（推荐优先使用）

**AI 在完成任何子任务前，必须逐条自检并在汇报中确认：**

- [ ] 代码中已添加 `// TASK-XXXX` 注释
- [ ] Commit Message 以 `[TASK-XXXX]` 开头
- [ ] 已更新任务清单中的「状态、分支、Commit、测试状态」字段
- [ ] 核心逻辑已编写测试（单元测试或集成测试）
- [ ] 已同步更新相关技术文档（API / 数据库 / 架构等）
- [ ] 没有引入明显技术债务（或已在备注中记录）
- [ ] 配置相关变更已通过 `system_configs` 实现
- [ ] 客户端变更已考虑 Android / iOS / Desktop 一致性
- [ ] 安全相关变更已做自检或标注需 Review
- [ ] 已按「任务完成汇报模板」输出完整内容

### 5.2 Claude Code / Codex 规则

可以在对话中粘贴以上核心约束，或放在 `docs/AI_RULES.md` 中，每次新对话时让 AI 先阅读。

---

## 6. 每个任务的完整闭环流程（强制）

每个任务必须按以下顺序执行：

1. **创建/领取任务** → 在任务清单中把状态改为「进行中」，填写当前分支。
2. **AI 生成代码** → 必须引用 Task ID。
3. **开发者 Code Review**（必须人工 review 关键逻辑）。
4. **运行测试**（单元测试 + 必要的手动测试）。
5. **更新任务清单**（状态、Commit、测试结果）。
6. **Git Commit**（使用标准模板）。
7. **合并到 dev**（经过简单验证后）。
8. **标记任务为「已验证」**。

**AI 的职责**：在每一步主动提醒开发者执行以上流程。

---

## 7. 推荐的自动化辅助手段

| 工具 | 用途 | 优先级 |
|------|------|--------|
| **pre-commit hook** | 检查 Commit Message 是否包含 `[TASK-XXXX]` | 高 |
| **GitHub Actions** | PR 时自动检查 Task ID、运行测试 | 中 |
| **简单脚本** | 统计某个 Task 的所有 Commit | 低 |
| **Linear / GitHub Issues** | 如果团队规模较大，可作为任务清单的补充 | 可选 |

---

## 8. 补充建议（实现更高程度的自动闭环）

为了更接近“自动开发闭环”，我建议补充以下内容（已规划，后续可逐步落地）：

1. **任务看板可视化**（推荐）
   - 使用 `docs/tasks/` 文件夹 + Markdown + 简单脚本生成看板。
   - 或直接使用 GitHub Projects / Linear。

2. **AI 生成任务进度报告**
   - 每周让 AI 读取任务清单，自动生成「本周完成情况 + 下周计划」。

3. **代码变更自动关联**
   - 开发一个简单脚本，扫描代码中的 `TASK-XXXX` 注释，自动更新任务清单中的「关联文件」字段。

4. **测试覆盖率要求**
   - 核心业务逻辑（支付、C2C、推广大使、威胁狩猎）必须有单元测试，否则不允许合并。

---

## 9. 当前推荐落地顺序

1. **立即执行**：
   - 创建 `.cursorrules` 文件（使用上面内容）
   - 在团队中统一 Commit Message 规范
   - 把本规范加入 `LiveMask_开发任务清单与里程碑_v3.6.md` 顶部

2. **第一周内完成**：
   - 把现有任务清单补充「当前分支」「关联 Commit」「测试状态」等字段
   - 开始使用 Task ID 开发第一个小任务（建议从 P0-03 配置中心开始）

---

**本规范目标**：让 AI 成为高效的“代码生产力工具”，而不是“黑盒生成器”，同时保持项目的可维护性和可追溯性。

需要我现在帮你：
- 生成 `.cursorrules` 文件内容（可直接使用）
- 更新任务清单模板（增加 traceability 字段）
- 创建一个简单的任务看板示例

请告诉我下一步想先做哪一项。