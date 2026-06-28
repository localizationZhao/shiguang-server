# lecture5_课后作业(二)：左右滚动多媒体界面开发

## 核心要点

横向滚动界面承载文字、图片、音频、视频四类元素，动态修改数据源

## 功能模块

### 模块一：横向滚动展示区
- `scroll-view` 开启 `scroll-x` 横向滚动
- 四个媒体卡片横向排列
- Mustache 语法绑定数据源

### 模块二：媒体源控制区
- **文字**：input + 按钮，校验空输入
- **图片**：`wx.chooseImage` 选择 + 重置按钮
- **音频**：输入 URL + 按钮，格式校验
- **视频**：`wx.chooseVideo` 拍摄/选择

## 数据更新原理

`setData` 修改 data 变量 → 视图自动同步更新

## 项目结构

```
pages/scrollMedia/
├── scrollMedia.wxml  # 上下两大模块
├── scrollMedia.js    # 事件处理 + API调用
├── scrollMedia.wxss  # 滚动容器 + 卡片样式
└── scrollMedia.json  # 页面配置
```

## 注意事项

- 所有 API 调用覆盖 success/fail/complete 回调
- 图片/视频选择需真机调试测试