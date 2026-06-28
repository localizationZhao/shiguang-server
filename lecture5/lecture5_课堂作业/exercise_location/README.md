# 课堂作业：位置 API 演示

## 项目概述

演示微信小程序位置相关 API 的使用方法。

## 核心功能

### 位置 API
- `wx.getLocation` - 获取当前位置
- `wx.chooseLocation` - 打开地图选择位置
- `wx.openLocation` - 打开内置地图查看位置

### 地图组件
- 显示标记点（markers）
- 显示路线（polyline）
- 显示圆形区域（circles）

## 项目结构

```
pages/location/
├── location.wxml  # 页面结构
├── location.js    # 位置API逻辑
├── location.wxss  # 页面样式
└── location.json  # 页面配置
```

## 运行方式

微信开发者工具打开本项目目录即可运行。

## 注意事项

- 需要在 `app.json` 中声明 `requiredPrivateInfos: ["getLocation", "chooseLocation"]`
- 真机调试需授权位置权限