// 自定义像素风TabBar
Component({
  data: {
    selected: 0,
    list: [
      { pagePath: '/pages/diy/diy', img: '/sptites/diy.png', text: 'DIY' },
      { pagePath: '/pages/home/home', img: '/sptites/menu.png', text: '首页' },
      { pagePath: '/pages/restaurant/restaurant', img: '/sptites/canteen.png', text: '餐厅' },
      { pagePath: '/pages/profile/profile', img: '/sptites/wode.png', text: '我的' },
    ],
  },

  methods: {
    switchTab(e: any) {
      const index = e.currentTarget.dataset.index
      const item = this.data.list[index]
      const url = item.pagePath
      wx.switchTab({ url })
    },
  },
})
