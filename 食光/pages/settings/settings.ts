Page({
  data: {},

  onLoad() {},

  // 跳转到「我的」页面（小鸟设置已整合到那里）
  toProfileForBird() {
    wx.switchTab({ url: '/pages/profile/profile' })
  },
})
