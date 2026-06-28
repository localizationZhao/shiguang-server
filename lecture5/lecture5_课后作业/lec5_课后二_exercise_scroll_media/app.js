/**
 * app.js - 小程序入口文件
 * 功能：初始化小程序生命周期，设置全局数据
 */

App({
  /**
   * 小程序全局数据
   * 用于存储跨页面共享的数据
   */
  globalData: {
    userInfo: null
  },

  /**
   * onLaunch - 小程序初始化生命周期
   * 当小程序初始化完成时触发（全局只触发一次）
   */
  onLaunch: function () {
    console.log('横向滚动多媒体界面小程序启动')
  },

  /**
   * onShow - 小程序显示生命周期
   * 当小程序启动，或从后台进入前台显示时触发
   */
  onShow: function () {
    console.log('小程序显示')
  },

  /**
   * onHide - 小程序隐藏生命周期
   * 当小程序从前台进入后台时触发
   */
  onHide: function () {
    console.log('小程序隐藏')
  }
})