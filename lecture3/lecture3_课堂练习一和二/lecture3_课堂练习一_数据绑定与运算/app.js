// app.js - 小程序入口文件
App({
  onLaunch: function() {
    // 小程序启动时触发，全局只触发一次
    console.log('App Launch');
  },
  onShow: function() {
    // 小程序启动或从后台进入前台时触发
    console.log('App Show');
  },
  onHide: function() {
    // 小程序从前台进入后台时触发
    console.log('App Hide');
  },
  globalData: {
    // 全局数据
    userInfo: null
  }
});
