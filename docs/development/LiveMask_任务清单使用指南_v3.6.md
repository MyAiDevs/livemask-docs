# LiveMask 任务清单使用指南 v3.6

**目的**：确保所有开发工作具有强可追溯性（Traceability），便于团队协作、问题排查和项目管理。

---

## 1. 核心原则

- **一个任务 = 一个 Task ID**（例如 `P0-01`、`P1-03`）
- **所有代码变更必须 traceable** 到具体 Task ID
- **任务清单是唯一真相来源**（Single Source of Truth）
- 开发者、AI、QA 都必须严格维护任务状态

---

## 2. Task ID 命名规范

| 前缀 | 含义 | 示例 |
|------|------|------|
| `P0-` | Phase 0 基础设施 | P0-03 |
| `P1-` | Phase 1 后端核心闭环 | P1-02 |
| `P2-` | Phase 2 客户端基础 | P2-01 |
| `P3-` | Phase 3 业务闭环 + iOS | P3-03 |
| `P4-` | Phase 4 前端 Admin | P4-02 |
| `P5-` | Phase 5 测试部署 | P5-01 |

---

## 3. 日常开发流程（强制）

### 步骤 1：领取任务
- 在任务清单中找到待开始的任务
- 更新该行状态为 **进行中**
- 创建分支：`dev/TASK-XXXX-简要描述`（例如 `dev/P1-01-usdt-payment`）

### 步骤 2：开发阶段
- **代码中必须添加注释**：
  ```go
  // TASK-P1-01: NOWPayments Webhook 签名验证
  func verifySignature(...) {}
  ```
- **Flutter / Dart**：
  ```dart
  // TASK-P2-02: Connection Orchestrator 健康检查逻辑
  ```

### 步骤 3：提交代码
**Commit Message 必须严格遵守以下格式**：

```
[TASK-P1-01] 完成 NOWPayments Webhook 签名验证 + 幂等性处理

- 实现 HMAC-SHA256 签名校验
- 添加重复请求防护
- 关联文档：LiveMask_USDT支付接入文档_v3.6.md
```

### 步骤 4：完成子任务后
必须执行以下操作（**Definition of Done**）：

1. 自检 DoD 清单（见 AI 工作流文档）
2. 更新任务清单中的以下字段：
   - 当前分支
   - 关联 Commit（填写完整或前7位 hash）
   - 测试状态
   - 备注/风险（如有）
3. 使用「任务完成汇报模板」输出内容给团队/AI
4. 通知相关负责人进行 Code Review / 测试

### 步骤 5：验证通过后
- 更新 `测试状态` 为 **已通过**
- 填写 `验证人`
- 更新 `落地日期`
- 将分支合并到 `dev` 分支（使用 `git merge --squash` 或正常 merge，Commit 需包含 Task ID）

---

## 4. 任务清单字段维护说明

| 字段 | 维护人 | 更新时机 | 示例 |
|------|--------|----------|------|
| **当前分支** | 开发者 | 创建分支后立即更新 | `dev/P1-01-usdt-payment` |
| **关联 Commit** | 开发者 | 每次提交后更新 | `a1b2c3d`, `e4f5g6h` |
| **测试状态** | 开发者 / QA | 测试完成后更新 | `单元测试通过` / `集成测试中` / `已通过` |
| **验证人** | QA / Lead | 验证通过后更新 | `Backend Lead` |
| **落地日期** | 开发者 | 合并到 dev 后更新 | `2026-05-15` |
| **备注/风险** | 所有人 | 发现问题时更新 | `iOS 内存占用偏高，待优化` |

---

## 5. AI 辅助开发时的要求

当使用 Cursor / Codex / Claude 等 AI 工具开发时：

- 每次开始新任务，必须先让 AI 读取本指南 + 当前任务清单
- 完成代码后，**必须要求 AI 输出「任务完成汇报模板」内容**
- AI 必须在代码中添加 `// TASK-XXXX` 注释
- 禁止 AI 直接在 `main` 或 `dev` 分支上修改代码

---

## 6. 推荐工具链

- **任务管理**：GitHub Projects / Linear.app（推荐同步任务清单）
- **代码审查**：GitHub PR（模板中必须包含 Task ID）
- **Commit 校验**：husky + commitlint（强制检查 `[TASK-XXXX]`）
- ** traceability 增强**（可选进阶）：开发脚本自动扫描代码中的 Task ID 并更新任务清单

---

**本指南与 `LiveMask_AI辅助开发工作流与规范_v3.6.md` 深度绑定，请务必同时遵守。**