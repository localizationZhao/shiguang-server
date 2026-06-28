# 课堂作业（一） - 仿新闻小应用

## 核心要点

### 1. TabBar配置

`app.json` 中配置了4个Tab页面：

| 页面 | 路径 | 图标文件 |
|-----|------|---------|
| 首页 | `pages/homePage/homePage` | TabbarHomeN/S.png |
| 视频 | `pages/video/video` | TabbarVideoN/S.png |
| 关注 | `pages/attention/attention` | TabbarActrN/S.png |
| 我的 | `pages/userCenter/userCenter` | TabbarUserN/S.png |

### 2. 导航图标要求

从 [iconfont.cn](https://www.iconfont.cn/) 下载：
- **尺寸**：48px
- **数量**：8个（每个Tab需要未选中/选中两张）
- **颜色**：未选中灰色，选中橙色 `#ffa589`
- **后缀**：N = Normal（未选中），S = Selected（选中）

### 3. 图标文件列表

```
images/
├── TabbarHomeN.png    # 首页-未选中
├── TabbarHomeS.png    # 首页-选中
├── TabbarVideoN.png   # 视频-未选中
├── TabbarVideoS.png   # 视频-选中
├── TabbarActrN.png    # 关注-未选中
├── TabbarActrS.png    # 关注-选中
├── TabbarUserN.png    # 我的-未选中
├── TabbarUserS.png    # 我的-选中
├── addChannel.png     # 添加频道图标
└── avatar.png         # 用户头像
```

### 4. 运行方式

使用微信开发者工具打开项目根目录，点击编译即可看到TabBar导航和各页面跳转。