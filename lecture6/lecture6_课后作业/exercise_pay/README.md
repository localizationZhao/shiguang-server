# lecture6_课后作业(一)_微信支付功能实现

## 项目概述

精品书籍购买支付场景演示，完整实现微信支付调用流程

## 核心知识点

### wx.requestPayment API（课件核心）

```javascript
wx.requestPayment({
  timeStamp: '',    // 时间戳
  nonceStr: '',     // 随机字符串
  package: '',      // prepay_id格式
  signType: 'MD5',  // 签名方式
  paySign: '',      // 签名
  success: function(res) {},
  fail: function(res) {},
  complete: function(res) {}
})
```

### paySign 签名计算（课件示例）

```
paySign = MD5(appId=wxd678efh567hg6787&nonceStr=xxx&package=prepay_id=xxx&signType=MD5&timeStamp=xxx&key=xxx)
```

## 项目结构

```
exercise_pay/
├── app.js                         # 入口文件
├── app.json                       # 全局配置
├── app.wxss                       # 全局样式
├── project.config.json            # 项目配置
├── sitemap.json                   # 站点地图
├── 微信支付作业截图说明.md          # 截图指引文档
└── pages/
    └── pay/
        ├── pay.wxml               # 支付页面结构
        ├── pay.js                 # 支付逻辑（签名计算、API调用）
        ├── pay.json               # 页面配置
        └── pay.wxss               # 页面样式
```

## 运行说明

1. 微信开发者工具打开 `exercise_pay` 目录
2. 模拟器可展示支付流程（无法完成真实支付）
3. 真机调试需配置真实商户号和服务器获取prepay_id

## 截图提交要求

详见 `微信支付作业截图说明.md`，需提交4张截图：
1. 商品支付主页面
2. 微信支付弹窗
3. 支付成功提示
4. 控制台日志输出