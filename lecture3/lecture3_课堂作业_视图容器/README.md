# Lecture 3 课堂作业：视图容器练习

## 项目简介

微信小程序视图容器练习，覆盖 view、scroll-view、swiper/swiper-item、movable-area/movable-view、match-media、page-container 等核心组件。

---

## 功能模块

| 模块 | 组件 | 功能 |
|------|------|------|
| **1** | view | 课程表列表渲染、hover-class 点击态、Flex 横向/纵向布局 |
| **2** | scroll-view | 城市天气横向滚动、消息列表纵向滚动、scroll-into-view 滚动到指定元素 |
| **3** | swiper/swiper-item | 校园风景轮播、控制面板（switch 开关 + slider 滑块） |
| **4** | movable-area/view | 基础拖动、区域大于/小于容器、横向/纵向移动、out-of-bounds、inertia、scale、damping、friction、disabled、animation |
| **5** | match-media | 宽度/高度/屏幕方向媒体查询 |
| **6** | page-container | 底部弹窗、居中弹窗、返回键拦截 |

---

## 技术要点

- scroll-view 必须设置明确高度/宽度才能产生滚动
- swiper 每一页必须放在 swiper-item 中
- movable-view 必须在 movable-area 中，且必须设置 width 和 height
- match-media 根据媒体查询条件控制子节点显隐
- page-container 拦截返回键/右滑手势，关闭弹窗而非退出页面
- WXML 文本中的 `<` 需转义为 `&lt;`

---

## 运行

微信开发者工具 → 导入本项目 → 编译运行
