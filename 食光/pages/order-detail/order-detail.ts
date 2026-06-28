// 订单详情页
import { getOrders, saveOrders } from '../../utils/storage'
import type { Order } from '../../utils/storage'

Page({
  data: {
    order: null as Order | null,
    starsStr: '',
    role: 'customer',
  },

  onLoad(options: any) {
    const id = parseInt(options.id)
    this.setData({ role: options.role || 'customer' })
    if (id) {
      const order = getOrders().find(o => o.id === id)
      if (order) this.setData({ order, starsStr: this.getStars(order.rating) })
    }
  },

  preventClose() {},

  onShow() {
    if (this.data.order) {
      const refreshed = getOrders().find(o => o.id === this.data.order!.id)
      if (refreshed) this.setData({ order: refreshed, starsStr: this.getStars(refreshed.rating) })
    }
  },

  // 接单
  acceptOrder() {
    this.updateOrderStatus('cooking', '预计30分钟')
    wx.showToast({ title: '已接单 👨‍🍳', icon: 'success' })
  },

  // 拒单
  rejectOrder() {
    wx.showModal({
      title: '拒单确认',
      content: '确定拒绝该订单吗？',
      success: (res) => {
        if (res.confirm) {
          this.updateOrderStatus('rejected')
          wx.showToast({ title: '已拒绝', icon: 'none' })
        }
      }
    })
  },

  // 出餐
  finishOrder() {
    this.updateOrderStatus('done')
    wx.showToast({ title: '🍽️ 出餐完成', icon: 'success' })
  },

  // 评价
  rateOrder() {
    wx.showActionSheet({
      itemList: ['⭐', '⭐⭐', '⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐⭐⭐⭐'],
      success: (res) => {
        const orders = getOrders()
        const idx = orders.findIndex(o => o.id === this.data.order!.id)
        if (idx >= 0) {
          orders[idx].rating = res.tapIndex + 1
          saveOrders(orders)
          this.setData({ order: orders[idx], starsStr: this.getStars(orders[idx].rating) })
          wx.showToast({ title: '已评价', icon: 'success' })
        }
      }
    })
  },

  // 催单
  urgeOrder() {
    wx.showToast({ title: '已发送催单提醒 🔔', icon: 'success' })
  },

  // 通用状态更新
  updateOrderStatus(status: string, time?: string) {
    const orders = getOrders()
    const idx = orders.findIndex(o => o.id === this.data.order!.id)
    if (idx >= 0) {
      orders[idx].status = status as any
      if (time) orders[idx].time = time
      saveOrders(orders)
      this.setData({ order: orders[idx], starsStr: this.getStars(orders[idx].rating) })
    }
  },

  // 计算星级字符串
  getStars(rating: number | undefined): string {
    if (!rating) return ''
    return '⭐'.repeat(rating)
  },

  // 消息
  openMsgInput() {
    this.setData({ showMsgInput: true, msgText: '' })
  },

  onMsgInput(e: any) {
    this.setData({ msgText: e.detail.value })
  },

  sendMsg() {
    if (!this.data.msgText.trim()) return
    wx.showToast({ title: '消息已发送', icon: 'success' })
    this.setData({ showMsgInput: false, msgText: '' })
  },

  cancelMsg() {
    this.setData({ showMsgInput: false, msgText: '' })
  },

  // 分享
  onShareAppMessage() {
    return {
      title: `食光订单 - ${this.data.order?.items || ''}`,
      path: `/pages/order-detail/order-detail?id=${this.data.order?.id || ''}`,
    }
  },
})
