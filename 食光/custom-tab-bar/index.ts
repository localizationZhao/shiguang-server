// 自定义像素风TabBar
Component({
  data: {
    selected: 0,
    flashing: -1, // 点击闪光索引
    list: [
      { pagePath: '/pages/diy/diy', img: '/sptites/diy.png', text: 'DIY', color: '#FF9A56' },
      { pagePath: '/pages/home/home', img: '/sptites/menu.png', text: '首页', color: '#FF9A56' },
      { pagePath: '/pages/restaurant/restaurant', img: '/sptites/canteen.png', text: '餐厅', color: '#FF9A56' },
      { pagePath: '/pages/profile/profile', img: '/sptites/wode.png', text: '我的', color: '#FF9A56' },
    ],
  },

  methods: {
    switchTab(e: any) {
      const index = e.currentTarget.dataset.index
      const item = this.data.list[index]
      const url = item.pagePath
      // 点击闪光动画
      this.setData({ flashing: index })
      setTimeout(() => { this.setData({ flashing: -1 }) }, 250)
      wx.switchTab({ url })
    },
  },
})
