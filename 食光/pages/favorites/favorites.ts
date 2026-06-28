import { getFavorites, removeFavorite } from '../../utils/storage'
import { api } from '../../utils/api'

Page({
  data: { favorites: [] as any[] },

  onShow() {
    // 先显示本地收藏
    this.setData({ favorites: getFavorites() })
    // 再从云端拉取
    api.getFavorites().then((list: any[]) => {
      if (list && list.length > 0) {
        const merged = list.map((r: any) => ({
          id: r.id, name: r.name, category: r.category_id || r.category || '',
          coverEmoji: r.cover_emoji || '🍽️', price: r.price,
          tags: typeof r.tags === 'string' ? JSON.parse(r.tags || '[]') : (r.tags || []),
        }))
        this.setData({ favorites: merged })
      }
    }).catch(() => {})
  },

  viewDetail(e: any) {
    wx.navigateTo({ url: '/pages/recipe-detail/recipe-detail?id=' + e.currentTarget.dataset.id })
  },

  removeFav(e: any) {
    const id = Number(e.currentTarget.dataset.id)
    removeFavorite(id)
    api.removeFavorite(id).catch(() => {})
    this.setData({ favorites: this.data.favorites.filter((f: any) => f.id !== id) })
    wx.showToast({ title: '已取消收藏 🤍', icon: 'none' })
  }
})