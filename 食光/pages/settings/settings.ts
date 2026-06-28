Page({
  data: {
    birdDisplayMode: 'all',
    birdModes: [
      { key: 'all', label: '所有页面', icon: '🌐' },
      { key: 'restaurant', label: '仅餐厅页', icon: '🍽️' },
      { key: 'interior', label: '仅进店后', icon: '🚪' },
      { key: 'none', label: '关闭小鸟', icon: '🚫' },
    ],
  },

  onLoad() {
    const mode = wx.getStorageSync('birdDisplayMode') || 'all';
    this.setData({ birdDisplayMode: mode });
  },

  setBirdMode(e: any) {
    const mode = e.currentTarget.dataset.mode;
    this.setData({ birdDisplayMode: mode });
    wx.setStorageSync('birdDisplayMode', mode);
    wx.showToast({ title: '已切换', icon: 'success', duration: 1000 });
  },
})
