# 🍽️ 食光 — 像素风美食社交小程序

> 个人全栈开发 | 微信小程序 + Express + MySQL 云托管  
> 像素便签风 UI · 菜谱复刻 · 虚拟餐厅点餐 · 口袋小鸟

---

## 📖 项目简介

**食光**是一个像素艺术风格的 WeChat 美食社交小程序。核心创意是"一家开了就能等朋友来吃饭的虚拟饭馆"——每个人都能开店当店主，生成邀请码让好友扫码加入，完成从浏览菜谱、点单下单到接单出餐的完整虚拟用餐流程。同时内置 69 道公共菜谱，支持一键复刻、DIY 改编、上架到自己的餐厅。

**解决需求**：把枯燥的菜谱管理变成有趣的像素游戏化体验，让熟人之间多一种"一起吃饭"的社交方式。

**核心亮点**：

- 🍳 **菜谱创作** — 5 步表单创建菜谱，食材/步骤结构化存储，支持复刻公共菜谱二次创作
- 🏪 **虚拟餐厅** — 开店 + 邀请码 + 好友加入 + 菜单上架 + 在线点单 + 订单管理
- 🐦 **口袋小鸟** — Canvas 2D 像素宠物，18 物种 + 帽子收集 + 羽毛解锁，跨页面持久化
- 🎲 **盲盒转盘** — 随机选菜，解决"不知道吃什么"
- 📝 **食光日记** — 做菜记录，拍照 + 语音录音（60s）+ 笔记
- 🎨 **像素便签风 UI** — CSS box-shadow 双层边框技法，5 套主题色，全局统一视觉

---

## 🏗 架构总览

```
┌─────────────────────────────────────────────────┐
│               微信小程序前端（原生 TS）              │
│  ┌──────┐ ┌──────┐ ┌──────────┐ ┌──────────┐  │
│  │ DI Y │ │ 首页 │ │  餐  厅  │ │ 我  的  │  │
│  │ 创作 │ │ 浏览 │ │ 点单社交 │ │ 数据中心 │  │
│  └──────┘ └──────┘ └──────────┘ └──────────┘  │
│        wx.Storage 本地  ←→  云托管 HTTP          │
└─────────────────────────────────────────────────┘
                        ↕
┌─────────────────────────────────────────────────┐
│          Express 云托管后端 (Node.js)              │
│  REST API · WebSocket · PDFKit · MySQL2          │
│  菜谱 / 餐厅 / 订单 / 收藏 / 记录 / 聊天          │
└─────────────────────────────────────────────────┘
                        ↕
┌─────────────────────────────────────────────────┐
│              MySQL 数据库（云托管）                 │
│  11 张表：recipes / categories / restaurants /   │
│  orders / restaurant_menu / members / ...        │
└─────────────────────────────────────────────────┘
```

**技术选型**：

| 层 | 技术 | 说明 |
|----|------|------|
| 前端 | 微信小程序原生 + TypeScript | Canvas 2D、Web Audio API、wx.Cloud |
| 后端 | Node.js 18 + Express | REST API、WebSocket（ws）、PDFKit |
| 数据库 | MySQL（10.32.100.251:3306） | mysql2 连接池（10 并发） |
| 存储 | wx.Storage 本地 + 云存储 | 离线优先 + 云端异步同步 |
| 部署 | Docker → 微信云托管 express-rtm4 | 1C2G，Node 18 Alpine |

---

## 📁 目录结构

```
食光/
├── 食光/                          # 小程序前端
│   ├── app.ts                     # 全局入口：云初始化、登录、隐私授权
│   ├── app.json                   # 页面注册 + 自定义 TabBar
│   ├── app.wxss                   # 全局样式 + 像素边框 CSS 变量
│   ├── custom-tab-bar/            # 自定义底部导航（滑动切页 + 变色）
│   ├── components/
│   │   ├── pocket-bird/           # 口袋小鸟 Canvas 组件
│   │   └── navigation-bar/        # 自定义导航栏
│   ├── utils/
│   │   ├── api.ts                 # 云托管 API 封装（8s 超时 + 离线 fallback）
│   │   ├── storage.ts             # 数据模型 + wx.Storage 读写
│   │   ├── util.ts                # 通用工具（ID 生成、日期、图片裁剪）
│   │   ├── pocket-bird-engine.ts  # 小鸟行为状态机（跳跃/飞行/栖息）
│   │   └── pocket-bird-sprites.ts # 18 种鸟 + 帽子像素素材
│   └── pages/
│       ├── home/                  # 首页：公共菜谱 + 盲盒转盘 + 复刻
│       ├── diy/                   # DIY：菜谱创作 + 分类管理 + 上架
│       ├── restaurant/            # 餐厅：开店/加入/点单/订单（1500+ 行核心）
│       ├── profile/               # 我的：数据聚合 + 小鸟设置
│       ├── recipe-detail/         # 菜谱详情：收藏/复刻/导出
│       ├── recipe-edit/           # 菜谱编辑：5 步表单 + 草稿暂存
│       ├── order-detail/          # 订单详情：接单/出餐/评分
│       ├── cooking-record/        # 食光日记：拍照/语音/便签
│       ├── favorites/             # 收藏列表
│       ├── my-orders/             # 历史订单
│       ├── my-recipes/            # 我的菜谱
│       ├── my-restaurants/        # 我的餐厅
│       └── admin-recipes/         # 管理员配图（隐藏入口）
├── server/                        # 后端服务
│   ├── index.js                   # Express 主程序（REST + WebSocket + PDF）
│   ├── setup.sql                  # 完整建表 + 种子数据
│   ├── Dockerfile                 # Docker 镜像（Node 18 Alpine）
│   └── package.json               # 依赖清单
└── 个人项目/                       # 项目说明
    └── README.md
```

---

## 🔑 核心功能实现

### 1. 离线优先架构

所有数据全量缓存在 `wx.Storage`，云端异步同步。打开即显示本地数据，后台静默从 `/api/recipes` 拉取最新并覆盖。

```typescript
// pages/home/home.ts → fetchRecipes()
useLocal()  // 本地秒显
wx.cloud.callContainer({ ... path: '/api/recipes', ... })  // 云端静默更新
```

### 2. 菜谱复刻

深拷贝公共菜谱 → 新 ID → 存入本地 DIY 列表 → 云端同步（标记 `is_public:0` 私有）。关键——云端数据 `category_id`(INT) 映射为本地 `category`(STRING)：

```typescript
// pages/home/home.ts → normCloud()
const CAT_ID_TO_NAME = { 1:'荤菜', 2:'素菜', 3:'凉菜', 4:'汤羹', 5:'主食', 6:'甜点', 7:'酒水' }
return { ...r, category: CAT_ID_TO_NAME[r.category_id], ... }
```

### 3. 虚拟餐厅系统

**创建**：名称 + 自动邀请码 `SG + Date.now().toString(36)` + 24h 有效期。

**加入**：本地查找 `r.owner && r.inviteCode === code` → 云端 fallback `/api/restaurants/by-code/:code` → 检查 3 个上限和重复加入 → 选择鸟种/座位/配饰 → 创建 `originalId` 副本。

**订单流转**：`pending → cooking → done → 已评价` 或 `rejected`。`relatedIds` Set 匹配餐厅关联副本确保订单正确显示。

**闭店**：`closed = true` + `inviteCode`/`originalId` 双重匹配标记所有加入副本。

### 4. 口袋小鸟

Canvas 2D 渲染 32×32 像素鸟，`pixelSize` 倍缩放。行为状态机自动切换跳跃/飞行/栖息/被抚摸。触摸拖拽 + 轻点 + 长按 birbOS 菜单。`wx.createWebAudioContext()` 正弦波鸟鸣。状态跨页面 `_saveState()/_restoreState()` 持久化。

### 5. CSS 像素边框

```css
box-shadow:
  3rpx 0 var(--hl), -3rpx 0 var(--hl),   /* 内层左右 */
  6rpx 0 var(--hl), -6rpx 0 var(--hl),   /* 外层左右 */
  0 0 0 3rpx var(--hl),                  /* 缝隙填充 */
  0 0 0 6rpx #fff;                       /* 白色间隙 — 像素感关键 */
```

### 6. 管理员配图（隐藏功能）

双击菜谱详情封面 → 验证手机号+密码（服务端 `POST /api/admin/login`）→ 69 道公共菜谱列表 → 拍照/选图 → `wx.cloud.uploadFile` 云存储 → `PUT /api/admin/recipes/:id/cover` 存入 MySQL。密码由云托管环境变量 `ADMIN_PHONE`/`ADMIN_PWD` 控制，代码中无明文。

---

## 🗄 数据库表设计

**核心表（11 张）**：

| 表 | 关键字段 | 说明 |
|----|----------|------|
| `recipes` | id, name, category_id, ingredients(JSON), steps(JSON), cover_img, is_public, is_draft | 菜谱主表 |
| `categories` | id, name, is_system, sort, color | 分类表（7 个系统预设） |
| `restaurants` | id, name, invite_code, code_expire, owner_id, avg_rating | 餐厅主表 |
| `restaurant_menu` | restaurant_id, recipe_id, on_shelf | 餐厅菜单关联 |
| `restaurant_members` | restaurant_id, user_id, seat_index, bird_type, accessory | 餐厅成员 |
| `orders` | id, restaurant_id, customer_id, items(JSON), status(ENUM) | 订单表 |
| `order_chat` | order_id, msg, sender(ENUM: owner/customer) | 订单消息 |
| `feeds` | user_id, content, images(JSON), visibility, location | 感受分享 |
| `favorites` | user_id, recipe_id | 收藏关联 |
| `cooking_records` | user_id, recipe_id, img, notes, voice | 做菜记录 |

完整建表 SQL：`server/setup.sql`（含 69 道种子菜谱）。

---

## 🚀 本地运行

### 前置依赖

- 微信开发者工具（[下载](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)）
- Node.js ≥ 18
- MySQL 5.7+

### 启动后端

```bash
cd server
npm install
# 执行建表 + 种子数据
mysql -u root -p < setup.sql
# 启动服务
node index.js
# 服务运行在 http://localhost:3000
```

### 打开小程序

1. 微信开发者工具 → 导入项目 → 选择 `食光/食光/` 目录
2. AppID 填入你的小程序 AppID（或使用测试号）
3. 编译运行

> 本地模式不依赖云托管，所有数据走本地 `wx.Storage`，餐厅邀请码仅本机有效。

---

## ☁️ 线上部署

### 1. 构建 Docker 镜像

```bash
cd server
docker build -t shiguang-server .
```

### 2. 推送至微信云托管

1. 打开[微信云托管控制台](https://cloud.weixin.qq.com)
2. 新建服务 → 上传镜像或绑定 Git 仓库
3. 环境变量配置：`MYSQL_ADDRESS`、`MYSQL_PASSWORD`、`ADMIN_PHONE`、`ADMIN_PWD`、`COS_BUCKET`、`COS_REGION`
4. 部署 → 获取公网域名

### 3. 小程序配置

在 `app.ts` 中修改 `env` 为你的云环境 ID。

---

## 🔧 开发中的难点与解决

| 难点 | 解决方案 |
|------|----------|
| `wx:for-index` 混用 index/idx | 统一用默认 `index` |
| `data-id` 类型 string vs number | 全站 `Number()` 转换 20+ 处 |
| 云调用超时 | 8s 超时 + 离线 fallback（管理员 30s 应对冷启动） |
| 餐厅切换索引错位闪跳 | 改用 `_lastRestId` ID 匹配定位 |
| 云端 category_id(INT) 不匹配本地 | `CAT_ID_TO_NAME` 映射转换 |
| 嵌套 Git 仓库 server/ 无法追踪 | `git rm --cached` 解绑 + 重新 add |
| 图片白底与像素风割裂 | 统一 `#ffecda` 米色底 + 斜对角渐变 |
| 公共菜谱 steps 为空 | 异步从 `/api/recipes/:id` 补全数据 |
| 闭店后食客无法加入新餐厅 | `!r.closed` 过滤修复 4 处 |

---

## 📄 开源许可

MIT License

---

## 🔗 相关链接

- Gitee 仓库：https://gitee.com/zhao-wanlilinda/linda-zhao-wanli-yidongkaifa
- PRD 文档：[最终版prd带原型页面截图.md](最终版prd带原型页面截图.md)
