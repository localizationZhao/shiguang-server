# 🍽️ 食光 — 像素风美食社交小程序

> **个人独立开发** | 微信小程序 + 云托管全栈  
> 像素便签风 UI · 菜谱复刻 · 餐厅经营 · 口袋小鸟

---

## 💪 我的工作

从零搭建完整小程序，手写全部页面（18页 + 2组件 + 5工具模块），独立完成后端 Express API + MySQL 数据库。

反复打磨：`data-id` 类型匹配逐行排查 20+ 处、餐厅切换索引错位改 ID 匹配、小鸟跨页面状态持久化、邀请码跨设备同步、像素双层边框全站统一。

---

## 📁 项目结构

```
食光/
├── app.ts / app.json / app.wxss         # 全局入口
├── custom-tab-bar/                       # 自定义底部导航（滑动切页+变色）
├── components/
│   ├── pocket-bird/                      # 口袋小鸟（18种鸟+帽子+鸟叫）
│   └── navigation-bar/                   # 导航栏
├── pages/
│   ├── home/         # 首页·查菜谱·盲盒转盘·复刻
│   ├── diy/          # DIY·自制菜谱·便签卡片·上架
│   ├── restaurant/   # 餐厅·邀请码·点单·订单·闭店
│   ├── profile/      # 我的·个人中心·小鸟设置
│   ├── recipe-detail/  # 菜谱详情·收藏·导出
│   ├── recipe-edit/    # 5步表单新建/编辑菜谱
│   ├── cooking-record/ # 食光日记·便签记录
│   ├── favorites/      # 收藏列表
│   └── settings/       # 设置
├── utils/
│   ├── api.ts            # 云托管 API（8s超时）
│   ├── storage.ts        # 数据模型 + 本地存储
│   ├── util.ts           # 工具（ID生成·图片裁剪等）
│   ├── pocket-bird-engine.ts   # 小鸟引擎（状态机·物种·羽毛）
│   └── pocket-bird-sprites.ts  # 小鸟像素素材
└── server/               # Express 后端（独立部署）
    └── index.js          # REST API + WebSocket + MySQL
```

---

## 🔧 功能清单

### 📋 首页查菜谱 → 一键复刻
**代码**: `pages/home/home.ts`

| 功能 | 函数 | 实现方式 |
|------|------|---------|
| 加载菜谱 | `fetchRecipes()` | 本地 `PUBLIC_RECIPES` 秒显 + 云端静默更新，过滤 `is_public==1` |
| 复刻到DIY | `quickCopy()` | `Number(dataset.id)` 取ID → 深拷贝 → `addRecipe()` 本地 → `api.addRecipe({is_public:0})` 云端私有 |
| 盲盒转盘 | `spin()` | `randomPick()` 随机选菜 → 弹窗展示 |
| 标签筛选 | `toggleTag()` | 早餐/午餐/肉类/蔬菜等 11 标签，`displayRecipes` 过滤 |

### 🔧 DIY 自制菜谱
**代码**: `pages/diy/diy.ts` + `pages/recipe-edit/recipe-edit.ts`

| 功能 | 函数 | 实现方式 |
|------|------|---------|
| 便签卡片 | `refreshAll()` | `getRecipes()` → 按分类过滤 → `filteredRecipes` 渲染 4:3 像素边框卡片 |
| 新建菜谱 | `saveRecipe()` | 5步表单：名称→食材→步骤→参考→封面，本地 `addRecipe` + 云端 `api.addRecipe/updateRecipe` |
| 长按管理 | `longPressRecipe()` | birb-window 像素弹窗：编辑/上架/删除 |
| 上架餐厅 | `shelfToRestaurant()` | 筛选 `owner && !closed` 餐厅 → toggle 上架/下架 |
| 自定义颜色 | `pickColor()` | 5色圆片选择，存 `form.color`，卡片 `--hl` CSS 变量跟随 |

### 🏪 餐厅经营
**代码**: `pages/restaurant/restaurant.ts`（1500+行核心逻辑）

| 功能 | 函数 | 实现方式 |
|------|------|---------|
| 创建餐厅 | `confirmCreateRest()` | `SG`+时间戳邀请码，24h有效期，`api.createRestaurant({owner_id:0})` 云端同步 |
| 加入餐厅 | `confirmJoinRest()` | 本地查 `r.owner && r.inviteCode` → 云端 fallback → `doJoinRest()` 创建 `originalId` 副本 |
| 食客点单 | `submitOrder()` | `restaurantId=originalId` → `saveOrders()` 本地 → `api.createOrder()` 云端 |
| 店主接单 | `acceptOrder/finishOrder` | `updateOrder(id, status)` → 状态流转 pending→cooking→done |
| 订单显示 | `refreshAll()` | `relatedIds` Set 匹配（含 originalId 关联） → `filteredOrders` |
| 闭店通知 | `deleteRestaurant()` | `inviteCode`+`originalId` 双重匹配所有副本标记 `closed` → 食客点单触发 birb-window 弹窗 |
| 角色切换 | `switchRole()` | 店主↔食客，`setData` callback 中 `refreshAll` |

**订单状态流转**: `待接单 → 制作中 → 已出餐 → 待评价 → 已完成 / 已拒单`

### 🐦 口袋小鸟
**代码**: `components/pocket-bird/pocket-bird.ts` + `utils/pocket-bird-engine.ts`

| 功能 | 实现方式 |
|------|---------|
| 像素渲染 | Canvas 2D 绘制 32×32 像素鸟，`pixelSize` 倍缩放 |
| 行为状态机 | `createBehavior()` → 跳跃/飞行/栖息/抚摸 四种状态自动切换 |
| 触摸交互 | `onTouchStart/Move/End` → 拖拽定位 / 轻点抚摸 + 随机气泡 / 长按 birbOS 菜单 |
| 鸟叫合成 | `_chirp()` → `wx.createWebAudioContext()` 正弦波振荡器模拟啾啾声 |
| 羽毛收集 | `_spawnFeather()` → 15% 稀有+85% 常见，点击解锁新物种（18种） |
| 帽子系统 | `_spawnHat()` → 随机掉落，解锁换装 |
| 状态保持 | `_saveState()` / `_restoreState()` → 位置/冻结/飞行/隐藏 跨页面持久化 |
| 显示控制 | `birdDisplayMode`（全页/自定义/关闭）+ `birdPages` 数组按页面开关 |

### 🎨 像素风 UI
**核心技法**: box-shadow 双层边框

```css
/* 内层彩色 + 外层彩色 + 白色间隙 */
box-shadow:
  3rpx 0 var(--hl), -3rpx 0 var(--hl),    /* 左右内层 */
  6rpx 0 var(--hl), -6rpx 0 var(--hl),    /* 左右外层 */
  0 0 0 3rpx var(--hl),                   /* 缝隙填充 */
  0 0 0 6rpx #fff;                        /* 白色间隙 ← 像素感关键 */
```

**配色**: 奶油底 `#ffecda` + 5套主题色（绿/蓝/粉/橘/紫）

### ☁️ 云托管后端
**代码**: `server/index.js`

| 功能 | 实现 |
|------|------|
| REST API | Express，12 组端点（菜谱/餐厅/订单/收藏/记录/成员/聊天） |
| 数据库 | MySQL，自动建表 + 69 道种子菜谱 |
| 实时通信 | WebSocket（`ws` 库）广播订单状态 |
| 导出 | PDFKit 生成 PDF + HTML→Word |
| 小程序码 | `wxacode.getUnlimited` 生成带参数码 |

### 📱 其他功能
- **自定义 TabBar**: `custom-tab-bar/` — 滑动切页（40px 阈值）+ 选中态即时变色 + 图标放大 + 橘色文字小底块
- **食光日记**: `cooking-record/` — 便签风瀑布流卡片 + 5 色可选 + 语音录音 + 照片
- **菜谱详情**: `recipe-detail/` — 完整展示 + 收藏 + 复刻 + PDF/Word/图片导出
- **小鸟设置**: `profile/` — 5 模式统一（全页/自定义/关闭）+ 空数组保护

---

## 🚀 演示流程

```
首页 → 复刻菜谱 → 弹窗"好的"/"去编辑"
DIY → 新建菜谱(5步) → 便签卡片 → 长按管理
餐厅 → 创建 → 邀请码 → 上架 → 切食客 → 加入 → 点单
切回店主 → 接单 → 出餐 → 闭店
我的 → 小鸟设置 → 自定义模式 → 食光日记 → 钉便签
```

---

## ⚙️ 技术栈

| 层 | 技术 |
|----|------|
| 前端 | 微信小程序原生 · Canvas 2D · Web Audio API |
| 后端 | Node.js · Express · WebSocket · PDFKit |
| 数据库 | MySQL（云托管） · 本地 wx.Storage |
| 部署 | 微信云托管 `express-rtm4` |

---

## 📝 开发踩坑记录

- `wx:for-index` 重命名索引变量后 WXML 混用 `index`/`idx` → 选中态永远不生效 → 统一用默认 `index`
- `e.currentTarget.dataset.id` 始终是 `string`，`===` 比较全失败 → 全站 20+ 处加 `Number()` 转换
- 云调用默认 30s 超时 → 设 8s 超时 + 离线 fallback
- 服务端邀请码自生成与客户端不一致 → 改用客户端传来的 `inviteCode`
- 小鸟 `_onShow` 强制重置 `birdHidden` → 去掉重置保持用户选择
- 餐厅 `_lastRestId` 覆盖 `switchRest` → 切换时先算目标 ID
- 图片封面白底割裂 → 统一 `#ffecda` 米色 + 斜对角渐变
