// 我的餐厅记录
import { getRestaurants } from '../../utils/storage'

Page({
  data: {
    owned: [] as any[],
    joined: [] as any[],
  },
  onShow() {
    const all = getRestaurants()
    const owned = all.filter((r: any) => r.owner && !r.closed)
    const joined = all.filter((r: any) => !r.owner && !r.closed)
    this.setData({ owned, joined })
  },
  toRestaurant() {
    wx.switchTab({ url: '/pages/restaurant/restaurant' })
  },
})
