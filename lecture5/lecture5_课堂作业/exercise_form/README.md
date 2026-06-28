# 课堂作业：表单组件综合练习

## 项目概述
            表单组件综合练习

## 核心功能

### 表单组件（二）
- **map 地图**：markers 标记点、polyline 路线、circles 圆形区域
- **checkbox 多选框**：checkbox-group + wx:for 循环渲染
- **radio 单选框**：基础用法 + icon 组件自定义样式
- **switch 开关**：两种类型 + 按钮控制 + slider 联动

### 表单组件（三）
- **canvas 画布**：绘制矩形、文字、直线
- **slider 滑动条**：min/max/show-value 配置
- **picker 选择器**：普通/时间/日期三种模式
- **picker-view**：嵌入式滚动选择器
- **form 表单**：综合案例，提交/重置事件

## 项目结构

```
pages/form/
├── form.wxml  # 页面结构（两大模块分区）
├── form.js    # 所有组件事件回调 + 画布绘制
├── form.wxss  # 样式（保留 .section 50px 上边距）
└── form.json  # 页面配置
```

## 运行方式

微信开发者工具打开本项目目录即可运行。

## 注意事项

- 地图组件需声明位置权限
- 所有交互操作均有页面反馈（不只是控制台打印）