// app.ts
import { SYSTEM_CATEGORIES } from './utils/storage'

App<IAppOption>({
  globalData: {
    recipes: [],
    categories: ['荤菜', '素菜', '凉菜', '汤羹', '主食', '甜点', '酒水'],
    userInfo: null,
    isLogin: false,
    cloudOnline: false, // 云端连通状态
  },

  onLaunch() {
    wx.cloud.init({ env: 'prod-d0g68hmay4c8d10e3' })
    // WebSocket: 部署server/后再启用
    // const { wsConnect } = require('./utils/api'); wsConnect()
    // 清理临时文件释放空间
    try {
      const fs = wx.getFileSystemManager()
      const files = fs.readdirSync(wx.env.USER_DATA_PATH)
      files.forEach((f: string) => {
        try { fs.unlinkSync(`${wx.env.USER_DATA_PATH}/${f}`) } catch(e) {}
      })
    } catch(e) {}
    // 云连通测试（5秒超时，失败不影响功能）
    const app = this
    wx.cloud.callContainer({
      config: { env: 'prod-d0g68hmay4c8d10e3' },
      path: '/api/restaurants', header: { 'X-WX-SERVICE': 'express-rtm4' }, method: 'GET',
      timeout: 5000,
      success: () => {
        console.log('[云] 连通OK')
        app.globalData.cloudOnline = true
      },
      fail: (e: any) => {
        console.warn('[云] 连通跳过（离线模式可用）:', (e.errMsg || e).slice(0, 50))
        app.globalData.cloudOnline = false
      }
    })

    // 隐私协议处理
    if (wx.onNeedPrivacyAuthorization) {
      wx.onNeedPrivacyAuthorization((resolve: any) => {
        console.log('[隐私] 触发隐私授权')
        wx.showModal({
          title: '食光 · 隐私提示',
          content: '为了更好地为你服务，食光需要获取你的位置信息、相册权限用于菜谱分享和餐厅定位。\n\n请阅读并同意《食光隐私保护指引》',
          confirmText: '同意',
          cancelText: '拒绝',
          success: (res: any) => {
            if (res.confirm) {
              resolve({ event: 'agree', buttonId: 'privacy-agree-btn' })
            } else {
              resolve({ event: 'disagree' })
            }
          }
        })
      })
    }

    // 初始化分类数据
    const savedCats = wx.getStorageSync('categories')
    if (!savedCats || savedCats.length === 0) {
      wx.setStorageSync('categories', SYSTEM_CATEGORIES)
    }

    // 初始化其他数据
    if (!wx.getStorageSync('favorites')) {
      wx.setStorageSync('favorites', [])
    }
    if (!wx.getStorageSync('cookingRecords')) {
      wx.setStorageSync('cookingRecords', [])
    }
    if (!wx.getStorageSync('orders')) {
      wx.setStorageSync('orders', [])
    }
    if (!wx.getStorageSync('restaurants')) {
      wx.setStorageSync('restaurants', [])
    }
    if (!wx.getStorageSync('feeds')) {
      wx.setStorageSync('feeds', [])
    }
    if (!wx.getStorageSync('birdDisplayMode')) {
      wx.setStorageSync('birdDisplayMode', 'all')
    }

    // 首次启动检查
    const profile = wx.getStorageSync('userProfile')
    if (!profile || !profile.nick) {
      this.globalData.needWelcome = true
    }

    // 微信登录
    wx.login({
      success: res => {
        console.log('login code:', res.code)
      },
    })

    // 获取系统信息
    const sysInfo = wx.getWindowInfo()
    this.globalData.systemInfo = {
      platform: sysInfo.platform,
      windowWidth: sysInfo.windowWidth,
      windowHeight: sysInfo.windowHeight,
      pixelRatio: sysInfo.pixelRatio,
    }

    // 处理扫码进入（小程序码 scene 参数在 query.scene 里）
    const launchOptions = wx.getLaunchOptionsSync()
    const launchCode = (launchOptions.query as any)?.scene || ''
    if (launchCode) {
      this.globalData._lastScene = launchCode
      this.globalData.pendingInviteCode = decodeURIComponent(launchCode)
      console.log('[扫码进店] invite:', this.globalData.pendingInviteCode)
    }
  },

  onShow() {
    // 只在有新扫码参数时才设置（避免每次切Tab都触发）
    const enterOptions = wx.getEnterOptionsSync()
    const enterCode = (enterOptions.query as any)?.scene || ''
    if (enterCode && enterCode !== this.globalData._lastScene) {
      this.globalData._lastScene = enterCode
      this.globalData.pendingInviteCode = decodeURIComponent(enterCode)
    }
  },

  // 获取全局菜谱数据
  getRecipes() {
    return wx.getStorageSync('recipes') || []
  },

  // 刷新全局数据
  refreshData() {
    const recipes = wx.getStorageSync('recipes') || []
    this.globalData.recipes = recipes
  }
})
