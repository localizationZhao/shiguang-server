// 云托管 API 封装
const ENV = 'prod-d0g68hmay4c8d10e3'
const CLOUD_TIMEOUT = 8000 // 8秒超时，避免长时间挂起

export function cloudCall(path: string, method: string = 'GET', data: any = {}): Promise<any> {
  return new Promise((resolve, reject) => {
    wx.cloud.callContainer({
      config: { env: ENV },
      path,
      header: { 'X-WX-SERVICE': 'express-rtm4', 'content-type': 'application/json' },
      method: method as any,
      timeout: CLOUD_TIMEOUT,
      data,
      success: (res: any) => {
        if (res.data && res.data.code === 0) resolve(res.data.data)
        else reject(new Error(res.data?.msg || '请求失败'))
      },
      fail: reject
    })
  })
}

export const api = {
  // 菜谱
  getRecipes: (keyword?: string) => cloudCall('/api/recipes' + (keyword ? '?keyword=' + keyword : '')),
  getRecipe: (id: number) => cloudCall('/api/recipes/' + id),
  addRecipe: (data: any) => cloudCall('/api/recipes', 'POST', data),
  updateRecipe: (id: number, data: any) => cloudCall('/api/recipes/' + id, 'PUT', data),
  deleteRecipe: (id: number) => cloudCall('/api/recipes/' + id, 'DELETE'),

  // 餐厅
  getRestaurants: () => cloudCall('/api/restaurants'),
  createRestaurant: (data: any) => cloudCall('/api/restaurants', 'POST', data),
  updateRestaurant: (id: number, data: any) => cloudCall('/api/restaurants/' + id, 'PUT', data),
  deleteRestaurant: (id: number) => cloudCall('/api/restaurants/' + id, 'DELETE'),
  getRestaurantByCode: (code: string) => cloudCall('/api/restaurants/by-code/' + encodeURIComponent(code)),
  getRestaurantMenu: (code: string) => cloudCall('/api/restaurants/menu-by-code/' + encodeURIComponent(code)),
  addRestaurantMenu: (code: string, data: any) => cloudCall('/api/restaurants/menu-by-code/' + encodeURIComponent(code), 'POST', data),
  removeRestaurantMenu: (code: string, recipeId: number) => cloudCall('/api/restaurants/menu-by-code/' + encodeURIComponent(code) + '/' + recipeId, 'DELETE'),
  
  // 订单
  getOrders: (inviteCode?: string) => cloudCall('/api/orders' + (inviteCode ? '?invite_code=' + encodeURIComponent(inviteCode) : '')),
  createOrder: (data: any) => cloudCall('/api/orders', 'POST', data),
  updateOrder: (id: number, data: any) => cloudCall('/api/orders/' + id, 'PUT', data),

  // 感受
  getFeeds: () => cloudCall('/api/feeds'),
  createFeed: (data: any) => cloudCall('/api/feeds', 'POST', data),

  // 收藏
  getFavorites: () => cloudCall('/api/favorites'),
  addFavorite: (recipeId: number) => cloudCall('/api/favorites', 'POST', { recipe_id: recipeId }),
  removeFavorite: (recipeId: number) => cloudCall('/api/favorites/' + recipeId, 'DELETE'),

  // 做菜记录
  getCookingRecords: () => cloudCall('/api/cooking-records'),
  addCookingRecord: (data: any) => cloudCall('/api/cooking-records', 'POST', data),

  // 餐厅成员
  getMembers: (restaurantId: number) => cloudCall('/api/restaurant-members/' + restaurantId),
  addMember: (data: any) => cloudCall('/api/restaurant-members', 'POST', data),
  removeMember: (restaurantId: number, userId: number) => cloudCall('/api/restaurant-members/' + restaurantId + '/' + userId, 'DELETE'),

  // 订单聊天
  getOrderChat: (orderId: number) => cloudCall('/api/order-chat/' + orderId),
  addOrderChat: (data: any) => cloudCall('/api/order-chat', 'POST', data),

  // 分类标签
  getCategories: () => cloudCall('/api/categories'),
  saveCategory: (data: any) => cloudCall('/api/categories', 'POST', data),
  deleteCategory: (name: string) => cloudCall('/api/categories/' + encodeURIComponent(name), 'DELETE'),
}

// ======================== WebSocket 实时通信 ========================
let _ws: any = null, _wsListeners: Record<string, Function[]> = {}

export function wsConnect() {
  if (_ws) return
  _ws = wx.connectSocket({ url: 'wss://prod-d0g68hmay4c8d10e3.service.tcloudbase.com/ws' })
  _ws.onOpen(() => console.log('[WS] 已连接'))
  _ws.onMessage((res: any) => {
    try { const d = JSON.parse(res.data); (_wsListeners[d.type] || []).forEach(fn => fn(d.payload)) } catch (e) {}
  })
  _ws.onClose(() => { _ws = null; setTimeout(wsConnect, 3000) })
  _ws.onError(() => { _ws = null })
}
export function wsOn(type: string, fn: Function) {
  if (!_wsListeners[type]) _wsListeners[type] = []
  _wsListeners[type].push(fn)
}
export function wsSend(type: string, payload: any) {
  if (_ws) _ws.send({ data: JSON.stringify({ type, payload }) })
}

// 生成餐厅邀请小程序码（调用自己服务器的 /api/qrcode）
export function generateQRCode(inviteCode: string): Promise<string> {
  return new Promise((resolve, reject) => {
    wx.cloud.callContainer({
      config: { env: ENV },
      path: '/api/qrcode?scene=' + encodeURIComponent(inviteCode),
      header: { 'X-WX-SERVICE': 'express-rtm4' },
      method: 'GET',
      success: (res: any) => {
        // 返回是图片二进制，需要存本地
        if (res.data && res.statusCode === 200) {
          const fs = wx.getFileSystemManager()
          const path = `${wx.env.USER_DATA_PATH}/qr_${Date.now()}.png`
          try {
            // 先清理旧QR文件（防止存储超限）
            try {
              const files = fs.readdirSync(wx.env.USER_DATA_PATH)
              files.filter((f: string) => f.startsWith('qr_')).forEach((f: string) => {
                try { fs.unlinkSync(`${wx.env.USER_DATA_PATH}/${f}`) } catch(e) {}
              })
            } catch(e) {}
            const arrayBuffer = res.data
            fs.writeFileSync(path, arrayBuffer, 'binary')
            resolve(path)
          } catch (e) {
            resolve('data:image/png;base64,' + wx.arrayBufferToBase64(res.data))
          }
        } else {
          reject(new Error('QR: ' + JSON.stringify(res)))
        }
      },
      fail: reject
    })
  })
}
