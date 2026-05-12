# LiveMask Admin「全球流量大盘」完整 Figma 层级描述 v3.6

**目标**：给设计师 / v0.dev / Cursor 直接使用的完整 Figma 结构描述，可一键生成高保真原型。

---

## 页面名称
**Admin / 全球流量大盘**  
**路径**：`/admin/dashboard/traffic-global`

---

## 整体布局结构（Figma Layers）

### 1. 顶栏（Header）
- Layer Name: `Header / Global Traffic Dashboard`
- Components:
  - Logo + 系统名称
  - 面包屑：Dashboard > 全球流量大盘
  - 用户头像 + 下拉菜单（右上角）
  - 暗黑模式切换按钮

### 2. 筛选与时间控件区（Filters Bar）
- Layer Name: `Filters / Time Range + Geo Filter`
- 组件：
  - Date Range Picker（预设：最近7天 / 30天 / 本月 / 自定义）
  - 国家多选下拉（支持搜索）
  - 节点类型筛选（All / Active / Degraded）
  - 「刷新」按钮 + 「导出 CSV」按钮

### 3. KPI 总览卡片区（4 张卡片 - 横向排列）
Layer Name: `KPI Cards / Row`

**卡片 1**：全球总流量（本周期）
- 大数字：`12,458.7 TB`
- 趋势：`+18.4%`（绿色箭头）
- 小字：对比上周期

**卡片 2**：活跃国家数
- 大数字：`87`
- 趋势：`+3`

**卡片 3**：在线节点数
- 大数字：`2,847 / 3,120`
- 进度条 + Degraded 节点数（红色）

**卡片 4**：峰值带宽
- 大数字：`184.6 Gbps`
- 时间：今日 14:32

### 4. 主可视化区（左侧 60% + 右侧 40%）

#### 4.1 左侧：全球流量趋势图
- Layer Name: `Chart / Global Traffic Trend`
- 图表类型：**Area + Line**（ECharts）
- X轴：日期/小时
- Y轴左：流量（TB）
- Y轴右：活跃节点数
- 图例：总流量 / 上传 / 下载 / 活跃节点
- Hover Tooltip 显示详细数值 + 国家 Top 5

#### 4.2 右侧：世界地图热力图
- Layer Name: `Map / World Choropleth Heatmap`
- 地图类型：ECharts Map（world）
- 颜色：从浅蓝 → 深蓝（流量越多颜色越深）
- Hover：显示国家名称 + 流量 + 节点数 + 同比
- Click：Drill-down 到该国家详情页（或右侧 Drawer 弹出）

### 5. 下方数据表格区
- Layer Name: `Table / Country Traffic Ranking`
- 表格列：
  - 排名
  - 国家（带国旗 Emoji）
  - 流量（TB） + 同比
  - 节点数
  - 平均质量分
  - 操作：【查看详情】按钮（跳转或 Drawer）

- 支持排序、搜索国家、导出当前表格

### 6. 右侧 Drawer（点击地图或表格行时弹出）
- Layer Name: `Drawer / Country Detail`
- 内容：
  - 国家名称 + 国旗
  - KPI 小卡片（流量、节点、峰值带宽）
  - 该国家 30 天流量趋势图（小尺寸）
  - Top 10 节点列表（流量排行）
  - 「与全球对比」按钮

---

## 设计规范（Design Tokens）

- 主色：`#2563EB`（蓝色）
- 成功色：`#10B981`
- 警告色：`#F59E0B`
- 危险色：`#EF4444`（Degraded 节点）
- 背景：`#0F172A`（暗黑模式主背景）
- 卡片背景：`#1E293B`
- 字体：Inter / system-ui
- 间距：使用 Tailwind `gap-4`、`p-6` 体系

---

## 交互与状态

- 加载状态：Skeleton + 骨架屏
- 空状态：插画 + 「暂无数据」
- 错误状态：Retry 按钮
- Drill-down 动画：地图高亮 + Drawer 滑入
- 实时更新提示：右上角「最后更新：2分钟前」+ 手动刷新按钮

---

## 给 AI 生成工具的 Prompt（可直接复制）

```
请使用 shadcn/ui + Tailwind + ECharts 为我生成一个 Admin 全球流量大盘页面，包含：

- 4 张 KPI 卡片（全球流量、活跃国家、在线节点、峰值带宽）
- 左侧：30天全球流量趋势 Area 图（支持双轴）
- 右侧：世界 Choropleth 热力图（ECharts Map）
- 下方：国家流量排行表格（支持排序和搜索）
- 点击地图或表格行弹出右侧 Drawer 显示国家详情 + 小趋势图

整体采用暗黑模式，专业数据大盘风格，使用蓝色为主色。
```

---

此描述已可直接给设计师或 AI 工具生成高保真原型。