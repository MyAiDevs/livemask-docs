# LiveMask UI 设计系统与 AI 生成规范 v3.6

> **目标**：让 AI（v0.dev、Cursor、Claude、Windsurf 等）能够基于本规范生成高质量、一致的 UI 界面，减少人工调整成本。

---

## 1. 设计系统核心原则

### 1.1 设计理念
- **极简、专业、信任感强**（VPN + 商业后台属性）
- **数据优先**：表格、图表、状态展示为主
- **操作高效**：减少点击层级，支持批量操作、快捷键
- **响应式**：Admin 后台支持桌面优先，移动端适配

### 1.2 必须遵循的设计约束
- 所有页面必须使用本规范定义的 **Design Tokens**
- 禁止使用魔法数字（magic numbers）
- 所有颜色、间距、字体必须来自 Design Tokens
- 状态（loading、empty、error）必须有统一处理方式

---

## 2. Design Tokens（设计令牌）

### 2.1 颜色系统（推荐 JSON 格式）

```json
{
  "colors": {
    "primary": {
      "50": "#f0f9ff",
      "100": "#e0f2fe",
      "500": "#0ea5e9",
      "600": "#0284c8",
      "700": "#0369a1",
      "900": "#0c4a6e"
    },
    "success": "#10b981",
    "warning": "#f59e0b",
    "danger": "#ef4444",
    "gray": {
      "50": "#f9fafb",
      "100": "#f3f4f6",
      "200": "#e5e7eb",
      "500": "#6b7280",
      "700": "#374151",
      "900": "#111827"
    },
    "background": {
      "default": "#ffffff",
      "muted": "#f8fafc",
      "card": "#ffffff"
    }
  }
}
```

### 2.2 间距系统（Spacing）

```json
{
  "spacing": {
    "xs": "4px",
    "sm": "8px",
    "md": "16px",
    "lg": "24px",
    "xl": "32px",
    "2xl": "48px"
  }
}
```

### 2.3 字体与排版

- **字体家族**：Inter / system-ui（Admin），PingFang SC / system-ui（中文）
- **字号**：12px、14px、16px、20px、24px、32px
- **字重**：400（常规）、500（中等）、600（半粗）、700（粗体）

---

## 3. 组件规范（Component Guidelines）

### 3.1 Admin 后台推荐技术栈
- **UI 库**：shadcn/ui + Tailwind CSS + Radix UI
- **表格**：@tanstack/react-table + shadcn DataTable
- **表单**：react-hook-form + zod + shadcn Form
- **状态管理**：Zustand 或 TanStack Query
- **图表**：recharts 或 Tremor（推荐用于数据可视化）

### 3.2 必须使用的组件模式
- **DataTable**：支持排序、筛选、分页、行选择、批量操作、列自定义
- **Status Badge**：使用语义化颜色（success/warning/danger）
- **Empty State**：必须有图标 + 说明文字 + 操作按钮
- **Loading State**：使用 Skeleton + 骨架屏
- **Dialog / Drawer**：优先使用 Drawer（右侧滑出）处理表单和详情
- **Command / Combobox**：复杂筛选和搜索推荐使用
- **Tabs**：详情页内部分类展示

## 4. Admin 后台核心页面清单（必须覆盖）

以下是 LiveMask 项目中**必须为 AI 生成提供规格**的核心后台页面，按优先级排序：

### 高优先级（Phase 1-2 必须完成）
| 页面 | 模块 | 复杂度 | 说明 |
|------|------|--------|------|
| 推广大使管理 | 推广 | 高 | 表格 + 详情 Drawer + 等级调整 + 收益查看 |
| 威胁狩猎 / Quarantine 管理 | 安全 | 高 | 列表 + 状态流转 + 复核操作 + 规则配置 |
| 节点管理 | 节点 | 高 | 列表 + 质量评分 + Free Zone 标记 + 带宽限制 |
| C2C 市场管理 | C2C | 中高 | 挂单列表 + 交易记录 + 争议处理 |
| 支付记录管理 | 支付 | 中 | 订单列表 + Webhook 日志 + 手动补单 |
| 系统配置中心 | 设置 | 中 | JSON 配置编辑 + 热更新预览 |
| 申诉管理 | 反馈 | 中 | 列表 + 复核流程 + 状态流转 |

### 中优先级（Phase 3）
| 页面 | 模块 | 复杂度 | 说明 |
|------|------|--------|------|
| 用户管理 | 用户 | 中 | 列表 + 设备限制 + 登录历史 |
| 通知模板与日志 | 通知 | 中 | 模板编辑 + 发送记录 |
| 文章 / SEO 管理 | 内容 | 中 | 文章 CRUD + Sitemap 生成 |
| 黑白名单管理 | 安全 | 中 | IP/域名 黑白名单维护 |
| 威胁情报管理 | 安全 | 中 | 情报源配置 + 聚合日志 |

### 低优先级 / 后期
- Dashboard（数据概览 + 图表）
- 运营报表
- 系统监控 / 日志
- 合伙人后台（独立权限）

---

## 5. 页面规格模板（Page Specification Template）—— 强烈推荐使用此结构

**每个页面在交给 AI（v0.dev / Cursor）生成前，必须按照以下结构撰写详细规格。**

### 推荐模板结构（复制使用）

```markdown
## 页面名称：【页面中文名】

### 1. 页面目标
- 核心目标（1-2 句）
- 主要用户角色（运营 / 管理员 / 客服等）
- 关键成功指标

### 2. 数据结构（关键字段 + 类型）
```ts
interface Xxx {
  id: string;
  // ... 列出重要字段及类型
}
```

### 3. 页面布局与区块（推荐使用编号 + 清晰描述）
1. **顶部操作栏**
   - 左侧：页面标题 + 副标题/描述
   - 右侧：主要操作按钮（导出、刷新、新增等）
   - 响应式：移动端如何折叠

2. **筛选与搜索区**（推荐使用 Command / Filter 组件）
   - 列出所有筛选维度（多选、单选、日期范围、搜索框等）
   - 默认值和重置行为

3. **主数据展示区**
   - 表格 / 卡片列表 / 图表
   - 列定义（字段、排序、宽度、对齐方式）
   - 是否支持行选择 + 批量操作
   - 空状态、加载状态、错误状态处理

4. **详情 / 操作面板**（Drawer / Dialog / 新页面）
   - 打开方式（点击行 / 按钮）
   - 内部结构（Tabs？分区块？）
   - 关键操作按钮及权限

5. **其他区块**（图表、统计卡片、操作日志等）

### 4. 交互行为与状态机
- 加载、成功、失败、空数据的 UI 表现
- 操作后的反馈（Toast、刷新策略、乐观更新）
- 权限控制点（按钮/操作的可见性）
- 异常处理（网络错误、权限不足等）

### 5. 设计与技术约束
- 必须使用项目 Design Tokens
- 推荐组件：shadcn DataTable / Badge / Drawer / Button 等
- 数字格式化、日期格式化要求
- 响应式断点处理
- 性能考虑（大数据量分页 / 虚拟滚动）

### 6. 权限与角色差异（可选）
- 不同角色看到的页面差异
```

### 页面规格示例（已按新模板重写）

#### 示例 1：推广大使管理页（推荐参考）

```markdown
## 页面名称：推广大使管理

### 1. 页面目标
让运营人员高效查看、筛选、分析推广大使数据，并进行等级调整和收益查看。

### 2. 数据结构
```ts
interface Ambassador {
  id: string;
  tier: 'basic' | 'silver' | 'gold';
  total_invites: number;
  total_traffic_gb: number;
  current_commission_rate: number;
  loyalty_bonus_factor: number;
  status: 'active' | 'suspended';
  last_activity_at: string;
  created_at: string;
}
```

### 3. 页面布局与区块
1. **顶部操作栏**：标题 + “导出 CSV” + “刷新”按钮
2. **筛选区**：Tier 多选、状态筛选、注册时间范围、搜索（邮箱/用户ID）
3. **数据表格**：支持排序、行选择、批量导出。列包含：ID、等级徽章、邀请数、流量、当前分成比例、忠诚度加成、状态、最后活跃时间、操作
4. **详情 Drawer**：基本信息 + 近30天收益趋势图 + 被邀请用户列表 + 操作历史

### 4. 交互行为
- 表格支持多选 + 批量导出
- 点击行打开详情 Drawer
- 调整等级操作后实时刷新表格并显示 Toast
- 空数据时显示 Empty State + 引导文案

### 5. 设计约束
- 使用 shadcn DataTable + Badge
- 所有数值使用 `Intl.NumberFormat`
- 状态使用语义化颜色 Badge
```

（可继续为其他页面补充类似规格）

---

## 6. Flutter App 端 AI 生成规范

> **重要说明**：v0.dev **不推荐直接用于 Flutter App 端 UI 生成**。v0.dev 主要面向 React + shadcn/ui，其生成的代码结构与 Flutter Widget Tree 差异较大，直接转换效果一般，需要大量人工重构。

### 6.1 推荐的 Flutter UI 生成流程

1. **设计阶段**（可选使用 v0.dev 辅助）
   - 在 v0.dev 中生成视觉参考图（仅作设计参考）
   - 导出图片或描述

2. **生成阶段**（主要使用 Cursor）
   - 使用 Cursor + 本规范中的 Design Tokens + 页面规格
   - 让 Cursor 基于项目已有的 Design System 生成 Flutter Widget

3. **人工 Review 重点**
   - 布局与间距是否符合 Design Tokens
   - 状态管理是否合理（Riverpod / Bloc）
   - 平台差异处理（Android / iOS / Desktop）
   - 性能考虑（列表渲染、图片缓存等）

### 6.2 给 Cursor 的推荐 Prompt 模板（Flutter）

```markdown
你是 LiveMask 项目的资深 Flutter 工程师，严格遵守我们项目的 Design System 和 Widget 规范。

请使用 Flutter + Riverpod（或项目当前状态管理方案）生成以下页面：

【页面名称】：【中文名】

### 页面目标
【复制页面规格模板中的第1部分】

### 数据结构
【复制页面规格模板中的第2部分】

### 页面布局要求
- 严格使用项目 Design Tokens（颜色、间距、字体、圆角）
- 优先使用项目已有的自定义 Widget（如果有）
- 避免使用魔法数字，所有间距、字号必须来自 Design Tokens
- 列表使用 `ListView` / `CustomScrollView` + 适当的缓存策略
- 状态管理使用 Riverpod Provider / ConsumerWidget
- iOS 与 Android 在视觉和交互上保持一致（除非有特殊平台差异）

请生成以下文件：
- `lib/features/xxx/presentation/pages/xxx_page.dart`
- `lib/features/xxx/presentation/widgets/xxx_widget.dart`（如有必要）
- 必要的 Model / State 类

生成代码时请在文件头部添加注释：// TASK-XXXX: 说明
```

### 6.3 Flutter 特有的约束与注意事项

- **平台差异**：iOS 使用 Cupertino 风格组件，Android 使用 Material 风格，但整体视觉需保持一致
- **状态管理**：推荐使用 Riverpod（项目当前主流）。避免在 Widget 中直接写复杂业务逻辑
- **性能**：长列表必须使用 `ListView.builder` 或 `SliverList`，图片使用 `cached_network_image`
- **响应式**：使用 `LayoutBuilder` 或 `MediaQuery` 处理不同屏幕尺寸
- **安全与反调试**：UI 层不要暴露敏感信息，敏感操作必须走后端校验
- **错误处理**：统一使用项目已有的 Error Widget + 重试机制
- **本地化**：所有文案必须走 `l10n`（即使当前只支持中文，也要预留）

### 6.4 不推荐的做法

- 不要让 AI 直接把 v0.dev 生成的 React 代码翻译成 Flutter（质量很差）
- 不要让 AI 大量使用 `Container` + `Padding` + 魔法数字
- 不要在 UI 层写复杂业务逻辑（应放在 Service / Repository 层）
- 避免在单次生成中让 AI 输出过多文件（建议一次生成一个页面 + 必要 Widget）

---

## 7. 如何有效 Prompt v0.dev / Cursor（关键）

---

## 8. 实施建议

1. **先建立 Design System**（最高优先级）
   - 把 Design Tokens 整理成 JSON 文件，放在 `docs/design-tokens.json`
   - 为 Admin 建立 shadcn/ui 主题配置
   - 为 Flutter 建立主题 + 常用组件库（`lib/core/design_system`）

2. **每个页面生成前必须准备好**：
   - 页面规格（使用第5节模板）
   - 数据结构定义
   - 相关 API 接口文档链接

3. **AI 生成后必须人工 Review 的点**：
   - API 对接逻辑
   - 权限控制
   - 错误处理与 loading 状态
   - 响应式与可访问性
   - 长期维护性（组件复用、状态管理合理性）

4. **推荐工具链**
   - Admin：v0.dev（视觉参考） + Cursor（代码生成 + 优化）
   - Flutter：Cursor（主要生成工具） + Design Tokens 约束
   - 版本控制：所有 AI 生成的代码必须包含 `// TASK-XXXX` 注释

---

## 9. 节点监控大盘 Figma UI 描述（给设计师使用）

### 页面名称
**节点监控大盘**（Node Monitoring Dashboard）

### 整体布局
- **顶部**：固定 Header（包含页面标题 + 全局刷新按钮 + 时间范围选择器：实时 / 近1小时 / 近6小时 / 近24小时）
- **左侧**：Tab 切换（质量监控 / 流量监控）
- **主内容区**：根据 Tab 展示不同内容

## 推广大使收益配置页面（新增 - 2026-05-10）

### 页面路径
`/admin/revenue/promoter-config`

### 页面布局（shadcn/ui + Tailwind）

**顶部**：
- 页面标题：推广大使收益规则配置
- 当前配置版本 + 最后修改时间 + 修改人
- 「保存并生效」按钮（带确认弹窗，显示影响模拟）

**主体 - 两栏布局**：

**左栏（配置表单）**：
- Base Commission Rate：数字输入框（0.05 ~ 0.30，步长 0.01）
- Tier Rules：可编辑表格
  - Tier | Min Invited Active | Min Monthly Traffic (GB) | Multiplier
  - 支持增删行
- Loyalty Bonus：四个输入框（Bronze / Silver / Gold / Platinum）
- Platform Protection：
  - Base User Count
  - Reduction Per 10k Users
  - Max Reduction
- C2C Extra Commission Rate
- Min Payout USDT

**右栏（实时影响模拟）**：
- 模拟参数输入：
  - 模拟总消费 USDT
  - 模拟大使当前 Tier
  - 模拟平台活跃用户数
- 实时计算结果卡片：
  - 最终佣金 USDT
  - 各加成系数 breakdown
- 图表：Platform Protection Factor 随用户增长曲线（recharts）

**底部**：
- 配置 JSON 编辑器（Monaco Editor，可切换「表单模式 / JSON 模式」）
- 变更历史记录（最近 10 次修改）

### 设计规范
- 使用 `Card` + `Tabs`（表单 / JSON / 模拟）
- 所有数值输入带单位后缀
- 保存前必须通过影响模拟确认
- 权限：仅 Super Admin 可修改

### 交互逻辑
- 修改任意字段 → 实时更新右栏模拟结果
- 点击「保存并生效」→ 调用 API → 触发配置热更新 → 记录审计日志

### 给 AI 生成工具的提示词（v0.dev / Cursor）
"Create a modern admin page for configuring affiliate revenue rules using shadcn/ui. Two-column layout: left is editable form with tier rules table, right is live simulation panel with charts. Use Tailwind and TypeScript. Include JSON editor toggle."

---

### Sponsor Node Revenue Configuration（赞助商节点收益配置页） - 新增 2026-05-10

**页面路径**：`/admin/revenue/sponsor-node-config`

**核心目标**：让 Admin 能够可视化 + JSON 双模式编辑赞助商节点收益的所有可配置参数（1U=多少GB、质量权重、数量等级收益规则等），并实时预览修改影响。

**布局结构**（shadcn/ui + Tailwind）：

- **顶部状态栏**：
  - 当前生效配置版本 + 最后修改人 + 修改时间
  - 「编辑配置」按钮（进入编辑模式）
  - 「立即生效」开关（危险操作，需二次确认）

- **编辑模式（表单 + JSON 编辑器并列）**：
  - 左侧：可视化表单
    - Base GB per Unit：数字输入框 + 单位说明
    - Quality Weights：三个 Slider + 数字输入（Uptime / Network Quality / Node Count），实时显示总和 = 1.0 校验
    - Tier Rules：可增删的表格（Min Nodes, Max Nodes, Bonus Multiplier）
    - Min Quality for Payout：Slider 0.5 ~ 1.0
    - Payout Cycle：Radio Group（Daily / Weekly）
  - 右侧：Monaco Editor 或 react-json-view（实时同步表单数据）

- **影响模拟区**（修改后自动计算）：
  - 简单柱状图：展示「修改前」 vs 「修改后」对 Top 10 赞助商收益的影响
  - 文字说明：「此次修改预计影响 X 个赞助商，整体平台支出变化 ±Y U」

- **底部**：配置变更历史表格（可展开查看每次修改的 diff）

**交互细节**：
- 表单与 JSON 编辑器双向绑定
- 保存前必须通过「影响模拟」校验
- 生效后通过 WebSocket 或轮询通知所有 NodeAgent（如果配置影响热更新逻辑）
- 权限：仅 Super Admin + Finance Admin 角色可访问和编辑

**设计令牌遵循**：
- 使用 `card`, `table`, `slider`, `button` 等 shadcn 组件
- 颜色：成功绿、警告黄、危险红严格按照 Design Tokens
- 响应式：桌面优先，移动端表单纵向堆叠

### Tab 1: 质量监控
- **顶部统计卡片**（4个横向卡片）：
  - 总节点数
  - 在线节点数
  - 平均质量分（带颜色标识：绿色/黄色/红色）
  - 异常节点数（质量分 < 60）
- **中间区域**：质量趋势折线图（近24小时平均质量分）
- **下方**：异常节点列表（表格形式，显示节点名称、当前质量分、下降幅度、最后上报时间）
- **右侧**：质量分布饼图（优秀/良好/一般/差）

### Tab 2: 流量监控
- **顶部统计卡片**（3个）：
  - 当前总带宽使用（Mbps）
  - 最高带宽节点（卡片形式，显示节点名 + 带宽值 + 跳转按钮）
  - 最低带宽节点（同上）
- **中间区域**：
  - 全局流量趋势折线图（上传 + 下载双线）
  - 最高带宽节点 Top 10 横向柱状图
- **下方**：所有在线节点实时带宽表格（支持排序、搜索，可点击进入节点详情）

### 交互规范
- 所有图表支持 hover 显示详细数值
- 点击节点可跳转到该节点详情页
- 支持手动刷新 + 自动刷新开关（默认30秒）
- 异常数据使用红色高亮

### Figma 图层命名规范（推荐）
```
Admin-NodeMonitoring
├── Header
│   ├── Title
│   ├── RefreshButton
│   └── TimeRangeSelector
├── Tabs
│   ├── QualityTab
│   └── TrafficTab
├── QualityContent
│   ├── StatsCards (4 cards)
│   ├── QualityTrendChart
│   ├── AnomalyNodeTable
│   └── QualityDistributionPie
├── TrafficContent
│   ├── StatsCards (3 cards)
│   ├── GlobalTrafficTrendChart
│   ├── TopBandwidthBarChart
│   └── NodeBandwidthTable
```

---

## 流量数据可视化方案 (Traffic Data Visualization) v3.6

**目标**：为 Admin 提供直观、实时、高性能的全球/国家流量监控与商业洞察大盘，支持从全球总览 → 国家 drill-down → 赞助商/节点详情的全链路可视化分析。

**推荐技术栈**（强烈建议）：
- **图表库**：ECharts（最佳选择，支持世界地图热力图、性能优秀、大数据量优化好）
- **地图**：ECharts Map + 自定义 GeoJSON（或 react-leaflet + choropleth）
- **UI 组件**：shadcn/ui + Tailwind + date-fns
- **状态管理**：TanStack Query (数据缓存 + 自动刷新)
- **日期选择**：react-day-picker 或 shadcn DateRangePicker

### 核心页面清单

#### 页面 1：全球流量总览 Dashboard（/admin/dashboard/traffic）

**布局**：
- **顶部 KPI 卡片**（4 个）：
  - 今日全球总流量 (GB)
  - 活跃节点数
  - 本月累计流量
  - 平均节点质量分
- **中间趋势区**（左侧大图 + 右侧 Top 国家）：
  - 过去 30 天全球流量趋势（Area + Line 双轴图，ECharts）
  - 国家流量 Top 10 横向柱状图 + 饼图（可切换）
- **下方**：国家流量表格（支持搜索、排序、点击行进入国家详情）

**交互**：
- 时间范围选择器（今天 / 7天 / 30天 / 自定义）
- 全局筛选：Sponsor Tier、节点状态
- 图表 hover 显示详细数值 + 时间点
- 支持导出 CSV / PNG

#### 页面 2：国家流量地图与 Drill-down（/admin/traffic/map）

**布局**：
- **左侧**：世界地图（Choropleth 热力图，颜色深浅代表流量大小）
- **右侧抽屉 / 侧边栏**：
  - 国家列表（Top 20 + 搜索）
  - 点击地图或列表 → 右侧弹出该国家详细面板
- **国家详情面板**（Drawer）：
  - 该国今日/本月流量 + 节点数
  - 过去30天流量趋势线
  - 与全球平均对比（双线图）
  - Top 5 节点列表（可点击进入节点详情）

**技术要点**：
- 使用 ECharts Map + world.geo.json
- 地图支持 zoom、pan、click 事件
- 数据按需加载（只加载有流量的国家）

#### 页面 3：赞助商流量与收益关联分析（/admin/traffic/sponsors）

**图表类型**：
- 双轴图：流量贡献 (GB) vs 收益 (USDT)
- 散点图：质量综合评分 vs 月度收益（气泡大小 = 节点数量）
- 漏斗图：从流量 → 质量分 → 最终收益转化
- 数据表格：Sponsor 列表（支持多维度排序）

**筛选**：
- 按 Tier、按国家、按时间范围

#### 页面 4：推广大使贡献数据看板

- 被邀请用户贡献流量排行榜
- 大使个人佣金趋势 + 邀请用户质量分布
- 忠诚度加成影响模拟图

### 设计与交互规范

- **颜色语义**：
  - 流量增长：success green
  - 质量高：primary blue
  - 异常/降级：danger red / warning orange
- **图表规范**：
  - 所有图表必须有标题 + 数据来源说明
  - 支持 dark mode
  - 大数据量时启用 ECharts 的 `progressive` + `large` 模式
- **Drill-down 路径**：
  全球 → 国家 → 赞助商/节点 → 原始日志（可选）
- **权限**：
  - 只读角色只能查看
  - 运营角色可导出数据

### Figma / AI 生成提示词（直接复制给 v0.dev 或 Cursor）

```
创建一个 Admin 后台的“全球流量总览”页面，使用 shadcn/ui + Tailwind + ECharts。

顶部 4 个 KPI 卡片（今日全球流量、活跃节点、本月累计、平均质量分），使用大数字 + 趋势小箭头。

中间左侧：过去30天全球流量趋势 Area Chart (ECharts)，右侧：国家 Top 10 横向 Bar Chart。

下方是可排序的数据表格，显示国家、流量、节点数、平均质量分，点击行可以打开 Drawer 显示该国家详细趋势。

整体风格：深色专业后台风格，数据优先，间距使用设计令牌，响应式。
```

### 性能与数据策略

- 后端提供聚合好的接口（基于 `daily_country_traffic` + `node_daily_traffic`）
- 前端使用 TanStack Query + 30秒自动刷新（可开关）
- 地图数据使用 Redis 缓存热门国家
- 大时间范围查询走物化视图或预聚合表

此可视化方案已与 `node_daily_traffic`、`daily_country_traffic`、收益计算、质量申诉形成完整数据闭环。
