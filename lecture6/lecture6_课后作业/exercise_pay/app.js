/**
 * app.js - 微信小程序入口文件
 * 项目：课后作业一：微信支付功能实现
 */

App({
  /**
   * 小程序初始化生命周期
   * 全局变量存储
   */
  onLaunch: function () {
    console.log('微信支付演示小程序启动')
    
    // 获取系统信息
    wx.getSystemInfo({
      success: function (res) {
        console.log('系统信息:', res.model, res.system)
      },
      fail: function (res) {
        console.log('获取系统信息失败:', res.errMsg)
      },
      complete: function () {
        console.log('系统信息API调用完成')
      }
    })
  },

  /**
   * 全局数据 - 可在各页面通过 getApp().globalData 访问
   */
  globalData: {
    userInfo: null,
    // 模拟商户配置（仅供演示，实际需从服务器获取）
    appId: 'wx1234567890abcdef',  // 小程序AppID（演示用）
    mchId: '1234567890',           // 商户号（演示用）
    apiKey: 'demo_api_key_32_chars' // 商户API密钥（演示用，实际32位）
  }
})