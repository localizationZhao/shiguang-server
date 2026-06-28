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
    userInfo: null,  // 用户信息
    isRecording: false  // 录音状态标志
  },

  /**
   * onLaunch - 小程序初始化生命周期
   * 当小程序初始化完成时触发（全局只触发一次）
   */
  onLaunch: function () {
    console.log('录音与播放小程序启动')
    
    // 检查录音权限状态
    wx.getSetting({
      success: function (res) {
        var authSetting = res.authSetting
        if (authSetting['scope.record'] === false) {
          console.log('录音权限已被拒绝')
        } else if (authSetting['scope.record'] === true) {
          console.log('录音权限已授权')
        } else {
          console.log('录音权限未授权')
        }
      },
      fail: function (err) {
        console.error('获取设置失败:', err)
      }
    })
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