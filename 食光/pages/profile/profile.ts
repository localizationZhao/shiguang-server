// 个人中心
import { getRecipes, getOrders, getCookingRecords, getFavorites, getUserProfile, SYSTEM_CATEGORIES, saveCookingRecords } from '../../utils/storage'
import { api } from '../../utils/api'

Page({
  data: {
    user: { nick: '美食家', avatar: '', id: '10001', birthday: '' } as any,
    recipeCount: 0, cookingCount: 0, orderCount: 0, favCount: 0,
    cookingExpanded: false,
    recentRecords: [] as any[],

    showPocketBird: true,
    birdTargets: [] as any[],
    birdMode: 'all',
    birdPages: [] as string[],

    // 快捷入口
    quickLinks: [
      { icon: '📖', title: '自制菜谱', key: 'recipes', count: 0, color: '#ff8baa', desc: '已同步云端' },
      { icon: '📋', title: '历史订单', key: 'orders', count: 0, color: '#79bcff', desc: '点单记录' },
      { icon: '❤️', title: '我的收藏', key: 'favorites', count: 0, color: '#ffb37c', desc: '喜爱菜谱' },
      { icon: '🏪', title: '我的餐厅', key: 'restaurant', count: 0, color: '#d18bff', desc: '经营管理' },
    ],

    showEditProfile: false,
    editNick: '', editBirthday: '',
    showRepairConfirm: false,
  },

  _tabIndex: 3, // 我的页面在TabBar中的位置
  _touchStartX: 0,

  preventClose() {},

  // ===== 左右滑动切换Tab =====
  onTouchStart(e: any) { this._touchStartX = e.touches[0].clientX },
  onTouchEnd(e: any) {
    const deltaX = e.changedTouches[0].clientX - this._touchStartX
    if (Math.abs(deltaX) < 40) return
    const TABS = ['/pages/diy/diy', '/pages/home/home', '/pages/restaurant/restaurant', '/pages/profile/profile']
    const next = deltaX < 0 ? Math.min(this._tabIndex + 1, 3) : Math.max(this._tabIndex - 1, 0)
    if (next !== this._tabIndex) {
      const tabBar = this.getTabBar()
      if (tabBar) tabBar.setData({ selected: next })
      wx.switchTab({ url: TABS[next] })
    }
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 3 })
    }
    const birdMode = wx.getStorageSync('birdDisplayMode') || 'all'
    const birdPages = wx.getStorageSync('birdPages') || ['home', 'diy', 'restaurant', 'profile']
    let showBird = false
    if (birdMode === 'all') showBird = true
    else if (birdMode === 'custom') showBird = birdPages.indexOf('profile') >= 0
    else if (birdMode === 'restaurant' || birdMode === 'interior') showBird = false
    this.setData({ showPocketBird: showBird, birdMode, birdPages })
    this._scanBirdTargets()
    this._refresh()
  },

  // 小鸟设置
  setBirdMode(e: any) {
    const m = e.currentTarget.dataset.m
    wx.setStorageSync('birdDisplayMode', m)
    let show = false
    if (m === 'all') show = true
    else if (m === 'custom') show = this.data.birdPages.indexOf('profile') >= 0
    else show = false // none/restaurant/interior
    this.setData({ birdMode: m, showPocketBird: show })
  },
  toggleBirdPage(e: any) {
    const p = e.currentTarget.dataset.p
    let pages = this.data.birdPages.slice()
    const idx = pages.indexOf(p)
    if (idx >= 0) pages.splice(idx, 1)
    else pages.push(p)
    wx.setStorageSync('birdPages', pages)
    // 如果当前在自定义模式，即时更新本页小鸟显示
    const show = this.data.birdMode === 'all' || (this.data.birdMode === 'custom' && pages.indexOf('profile') >= 0)
    this.setData({ birdPages: pages, showPocketBird: this.data.birdMode === 'none' ? false : show })
  },

  _refresh() {
    const recipes = getRecipes().filter(r => !r.draft)
    const orders = getOrders()
    const records = getCookingRecords()
    const favs = getFavorites()
    const user = getUserProfile()
    // 最近3条记录
    const recent = records.slice(-3).reverse()
    const restaurants = wx.getStorageSync('restaurants') || []
    const links = this.data.quickLinks.map(l => ({
      ...l,
      count: l.key === 'recipes' ? recipes.length : l.key === 'orders' ? orders.length : l.key === 'favorites' ? favs.length : restaurants.length
    }))
    this.setData({
      user, recipeCount: recipes.length, cookingCount: records.length,
      orderCount: orders.length, favCount: favs.length,
      recentRecords: recent, quickLinks: links
    })
  },

  // 快捷键
  onQuickLink(e: any) {
    const k = e.currentTarget.dataset.key
    if (k === 'recipes') wx.navigateTo({ url: '/pages/my-recipes/my-recipes' })
    else if (k === 'orders') wx.navigateTo({ url: '/pages/my-orders/my-orders' })
    else if (k === 'favorites') wx.navigateTo({ url: '/pages/favorites/favorites' })
    else if (k === 'restaurant') wx.navigateTo({ url: '/pages/my-restaurants/my-restaurants' })
  },

  toggleCooking() {
    this.setData({ cookingExpanded: !this.data.cookingExpanded })
  },

  toCookingRecord() {
    wx.navigateTo({ url: '/pages/cooking-record/cooking-record' })
  },

  // 编辑资料
  openEditProfile() {
    this.setData({
      showEditProfile: true,
      editNick: this.data.user.nick || '',
      editBirthday: this.data.user.birthday || ''
    })
  },
  closeEditProfile() { this.setData({ showEditProfile: false }) },
  onNickInput(e: any) { this.setData({ editNick: e.detail.value }) },
  onBirthdayChange(e: any) { this.setData({ editBirthday: e.detail.value }) },
  saveProfile() {
    const user = { ...this.data.user, nick: this.data.editNick || '美食家', birthday: this.data.editBirthday || '' }
    wx.setStorageSync('userProfile', user)
    this.setData({ user, showEditProfile: false })
    wx.showToast({ title: '资料已更新', icon: 'success' })
  },

  // 设置
  toSettings() { wx.navigateTo({ url: '/pages/settings/settings' }) },
  toAbout() {
    wx.showModal({ title: '关于食光', content: '食光 v1.0\n美食创作 · 居家烹饪 · 熟人社交', showCancel: false })
  },
  confirmRepair() {
    wx.showModal({
      title: '数据修复', content: '将重置所有本地数据，不可恢复！', confirmText: '确认', confirmColor: '#e74c3c',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorageSync()
          wx.setStorageSync('categories', SYSTEM_CATEGORIES)
          wx.showToast({ title: '已修复', icon: 'success' })
          setTimeout(() => this.onShow(), 500)
        }
      }
    })
  },

  // 同步烹饪记录到云端
  syncCookingCloud() {
    const records = getCookingRecords()
    if (records.length === 0) {
      wx.showToast({ title: '暂无记录可同步', icon: 'none' })
      return
    }
    wx.showLoading({ title: '同步中...' })
    const ps = records.map(r => api.addCookingRecord(r).catch(() => {}))
    Promise.all(ps).then(() => {
      wx.hideLoading()
      wx.showToast({ title: '已同步' + records.length + '条记录', icon: 'success' })
    }).catch(() => {
      wx.hideLoading()
      wx.showToast({ title: '部分同步失败，可重试', icon: 'none' })
    })
  },

  _scanBirdTargets() {
    var self = this
    var q = wx.createSelectorQuery()
    q.selectAll('.card,.glass,.user-card,.btn,.chip,.sticky-card').boundingClientRect()
    q.exec(function (res: any[]) {
      var rects = res[0]
      if (rects && rects.length > 0) {
        var targets: any[] = []
        for (var i = 0; i < rects.length; i++) {
          var r = rects[i]
          if (r && r.width > 40 && r.height > 20 && r.top > 10) {
            targets.push({ x: r.left, y: r.top, w: r.width, h: r.height })
          }
        }
        self.setData({ birdTargets: targets })
      }
    })
  },
})
