// 自定义导航栏组件
Component({
  options: {
    multipleSlots: true
  },

  properties: {
    extClass: { type: String, value: '' },
    title: { type: String, value: '' },
    background: { type: String, value: 'rgba(255,255,255,0.85)' },
    color: { type: String, value: '#1a1a2e' },
    back: { type: Boolean, value: true },
    loading: { type: Boolean, value: false },
    animated: { type: Boolean, value: true },
    show: { type: Boolean, value: true, observer: '_showChange' },
    delta: { type: Number, value: 1 },
  },

  data: {
    displayStyle: '',
    ios: false,
    safeAreaTop: '',
  },

  lifetimes: {
    attached() {
      const deviceInfo = wx.getDeviceInfo()
      const windowInfo = wx.getWindowInfo()
      const isAndroid = deviceInfo.platform === 'android'
      const isDevtools = deviceInfo.platform === 'devtools'
      this.setData({
        ios: !isAndroid && !isDevtools,
        safeAreaTop: isDevtools || isAndroid
          ? `padding-top: ${windowInfo.statusBarHeight}px; height: ${44 + windowInfo.statusBarHeight}px;`
          : '',
      })
    },
  },

  methods: {
    _showChange(show: boolean) {
      const animated = this.properties.animated
      let displayStyle = ''
      if (animated) {
        displayStyle = `opacity: ${show ? '1' : '0'}; transition: opacity 0.3s;`
      } else {
        displayStyle = `display: ${show ? '' : 'none'};`
      }
      this.setData({ displayStyle })
    },

    back() {
      const delta = this.properties.delta
      wx.navigateBack({ delta })
      this.triggerEvent('back', { delta })
    },
  },
})
