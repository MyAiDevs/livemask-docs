# LiveMask Admin 订阅套餐管理页面 - Figma 层级描述 v3.6

**页面路径**：`/admin/subscription/plans`
**页面类型**：列表 + 详情编辑混合页（推荐使用 Drawer 或 Modal 编辑）
**设计系统**：shadcn/ui + Tailwind + Lucide Icons
**最后更新**：2026-05-10

---

## 一、页面整体结构（Figma Layers）

### 1. Page Header（页面头部）
- Frame: `Header`
  - Auto Layout: Horizontal
  - Left: 
    - Text: "订阅套餐管理" (Heading 1, Bold, 28px)
    - Text: "共 12 个套餐，8 个已上架" (Body, Gray-500)
  - Right:
    - Button: "新建套餐" (Primary, + icon)
    - Button: "批量操作" (Outline)
    - Search Input: "搜索套餐名称或标签..."

### 2. Filters & Stats Bar（筛选与统计栏）
- Frame: `StatsBar`
  - 4 个 KPI Card（水平排列）：
    1. 总套餐数
    2. 已上架套餐
    3. 总订阅用户数
    4. 本月新增订阅

### 3. Plans Table（套餐列表表格）
- Table Component（推荐使用 TanStack Table + shadcn Table）
  - Columns:
    - [ ] Checkbox（多选）
    - 套餐名称 + 图片缩略图（小图 40x40）
    - 适用场景（Tag 列表，可多选显示，最多展示 3 个，hover 显示全部）
    - 流量 / 有效期
    - 带宽限制（是/否 + 具体数值）
    - 价格 (USDT)
    - 状态（Badge：上架 / 下架 / 草稿）
    - 订阅用户数
    - 排序
    - 操作（编辑 / 复制 / 上下架 / 删除）

### 4. Edit Drawer / Modal（编辑抽屉 - 推荐 Drawer）
当点击“编辑”或“新建”时打开右侧 Drawer（宽度 520px 或 600px）。

**Drawer 内部结构**：

#### Tab 1: 基础信息
- Form Group:
  - 套餐名称 (Input)
  - 产品图片：
    - Mobile 图片上传区（推荐 400x600 或 9:16 比例）
    - PC 图片上传区（推荐 1200x630 或 16:9 比例）
    - 支持拖拽上传 + 预览 + 删除
  - 套餐介绍（Textarea，富文本编辑器推荐）
  - 适用客户类型（Multi Select / Tag Input）
    - 预设选项：科学上网、跨境电商、AI 工具、游戏加速、办公协作、其他
    - 支持自定义添加

#### Tab 2: 套餐规则
- Form Group:
  - 套餐流量 (Number Input + Unit: GB)
  - 有效时间 (Number Input + Unit: 天)
  - 是否开启带宽限制 (Switch)
    - 当开启时显示：最大带宽 (Number Input + Unit: Mbps)
  - 当前售价 (Number Input + Unit: USDT)          -- 对应 price_usdt
  - 原价（可选）(Number Input + Unit: USDT)       -- 对应 original_price_usdt，用于前端显示划线价
  - 计费周期 (Select: 月付 / 季付 / 年付 / 一次性)
  - 排序权重 (Number Input)

#### Tab 3: 高级配置
- JSON Editor（推荐使用 Monaco Editor 或简单 Textarea + 格式化按钮）
  - 用于配置 `features` 字段（扩展特性）
  - 示例：
    ```json
    {
      "support_ipv6": true,
      "max_devices": 5,
      "priority_support": false,
      "custom_dns": true
    }
    ```

#### Drawer Footer
- Button: "保存草稿"
- Button: "上架并保存" (Primary)
- Button: "取消"

---

## 二、交互逻辑（关键交互）

1. **新建套餐**：点击 Header 按钮 → 打开空 Drawer
2. **编辑套餐**：表格行点击“编辑” → Drawer 回填数据
3. **上下架**：Switch 切换 → 实时保存 + 确认弹窗
4. **图片上传**：支持裁剪（推荐 react-cropper 或 shadcn Image Upload 组件）
5. **适用场景**：支持多选 + 自定义 tag
6. **实时预览**：Drawer 右侧可增加“用户端预览”小卡片（模拟手机/PC 展示效果）

---

## 三、给 AI 生成工具的完整 Prompt（推荐直接复制给 v0.dev / Cursor / Claude）

```prompt
请使用 shadcn/ui + Tailwind + TypeScript + React Hook Form + Zod 验证，为 LiveMask Admin 后台生成一个“订阅套餐管理”页面。

要求：
1. 顶部 Header 包含标题、统计数据、搜索和“新建套餐”按钮
2. 中间是一个数据表格，展示套餐列表，支持排序、搜索、多选
3. 点击新建或编辑时，打开一个右侧 Drawer 进行编辑
4. Drawer 内分为三个 Tab：基础信息、套餐规则、高级配置
5. 支持图片上传（Mobile + PC 两张图）
6. 适用场景使用多选 Tag 输入
7. 带宽限制使用 Switch + 条件显示输入框
8. 保存时有草稿和上架两种操作
9. 整体风格现代、专业、深色模式友好
10. 使用 Lucide Icons

请生成完整的页面组件代码（包含类型定义和简单 mock 数据）。
```

---

## 四、设计令牌建议

- Primary Color: `#3B82F6`
- Success: `#22C55E`（上架状态）
- Warning: `#F59E0B`（草稿）
- Danger: `#EF4444`（下架/删除）
- Card Background: `bg-zinc-900` / `bg-white`
- 使用圆角 `rounded-xl`

---

**使用建议**：
- 此描述可直接给设计师做高保真 Figma
- 可直接给 v0.dev 生成可运行的 React 原型
- 建议与 `subscription_plans` 表字段严格对应

---

**已同步到**：`LiveMask_UI设计系统与AI生成规范_v3.6.md`（作为独立章节引用）