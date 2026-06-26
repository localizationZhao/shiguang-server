// 个人中心
import { getRecipes, getOrders, getCookingRecords, getFavorites, getUserProfile, SYSTEM_CATEGORIES } from '../../utils/storage'

Page({
  data: {
    user: { nick: '美食家', avatar: '', id: '10001' } as any,
    recipeCount: 0,
    cookingCount: 0,
    orderCount: 0,
    favCount: 0,

    menuItems: [
      { icon: '📖', title: '做菜记录', key: 'cooking' },
      { icon: '🏪', title: '我的餐厅', key: 'restaurant' },
      { icon: '📋', title: '订单记录', key: 'orders' },
      { icon: '❤️', title: '我的收藏', key: 'favorites' },
      { icon: '💬', title: '在线客服', key: 'support' },
    ],

    settingsItems: [
      { icon: '✏️', title: '个人资料', key: 'profile' },
      { icon: '🔒', title: '隐私设置', key: 'settings' },
      { icon: '❓', title: '帮助中心', key: 'help' },
      { icon: 'ℹ️', title: '关于食光', key: 'about' },
      { icon: '🔧', title: '异常数据修复', key: 'repair' },
    ],
  },

  preventClose() {},
  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 3 })
    }
    const recipes = getRecipes().filter(r => !r.draft)
    const orders = getOrders()
    const records = getCookingRecords()
    const favs = getFavorites()
    const user = getUserProfile()

    this.setData({
      user,
      recipeCount: recipes.length,
      cookingCount: records.length,
      orderCount: orders.length,
      favCount: favs.length,
    })
  },

  // ============ 功能入口 ============
  onMenuItem(e: any) {
    const key = e.currentTarget.dataset.key
    switch (key) {
      case 'cooking':
        wx.navigateTo({ url: '/pages/cooking-record/cooking-record' })
        break
      case 'restaurant':
        wx.switchTab({ url: '/pages/restaurant/restaurant' })
        break
      case 'orders':
        wx.navigateTo({ url: '/pages/my-orders/my-orders' })
        break
      case 'favorites':
        wx.navigateTo({ url: '/pages/favorites/favorites' })
        break
      case 'support':
        wx.showToast({ title: '客服功能即将上线', icon: 'none' })
        break
    }
  },

  onSettingsItem(e: any) {
    const key = e.currentTarget.dataset.key
    switch (key) {
      case 'profile':
        this.editProfile()
        break
      case 'settings':
        wx.navigateTo({ url: '/pages/settings/settings' })
        break
      case 'help':
        wx.showToast({ title: '帮助中心即将上线', icon: 'none' })
        break
      case 'about':
        wx.showModal({
          title: '关于食光',
          content: '食光 v1.0.0\n\n美食创作 + 居家烹饪 + 熟人社交\n全链路闭环工具\n\n非商业用途',
          showCancel: false,
        })
        break
      case 'repair':
        wx.showModal({
          title: '数据修复',
          content: '将重置所有本地数据，此操作不可恢复！',
          confirmText: '确认修复',
          confirmColor: '#e74c3c',
          success: (res) => {
            if (res.confirm) {
              wx.clearStorageSync()
              // 重新初始化
              wx.setStorageSync('categories', SYSTEM_CATEGORIES)
              wx.showToast({ title: '数据已修复', icon: 'success' })
              setTimeout(() => this.onShow(), 500)
            }
          }
        })
        break
    }
  },

  // ============ 编辑资料 ============
  editProfile() {
    wx.showModal({
      title: '修改昵称',
      editable: true,
      placeholderText: this.data.user.nick,
      success: (res) => {
        if (res.confirm && res.content) {
          const user = { ...this.data.user, nick: res.content }
          wx.setStorageSync('userProfile', user)
          this.setData({ user })
          wx.showToast({ title: '昵称已更新', icon: 'success' })
        }
      }
    })
  },
})
