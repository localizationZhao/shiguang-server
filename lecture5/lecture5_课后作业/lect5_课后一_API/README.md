# lecture5_课后作业(一)：录音与播放功能开发

## 核心要点

三大类 API 完整演示：录音API、文件管理API、音频控制API

## 功能模块

### 模块一：录音功能

- `wx.startRecord` / `wx.stopRecord`
- 按住录音交互（bindtouchstart / bindtouchend）
- 音量动画效果（5档图片循环切换）

### 模块二：文件管理

- `wx.saveFile` - 保存录音文件
- `wx.getFileInfo` - 获取文件大小
- `wx.setStorageSync` - 本地缓存录音列表

### 模块三：音频播放

- `wx.playVoice` / `wx.pauseVoice` / `wx.stopVoice`
- 点击列表项播放对应录音

## 项目结构

```
pages/record/
├── record.wxml  # 三大模块布局
├── record.js    # 所有 API 调用逻辑
├── record.wxss  # 样式
└── record.json  # 页面配置
```

## 注意事项

- 需真机调试测试录音（模拟器不支持麦克风）
- 废弃警告可忽略，符合作业要求使用课程讲授 API

