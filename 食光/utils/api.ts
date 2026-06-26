// 云托管 API 封装
const ENV = 'prod-d0g68hmay4c8d10e3'

export function cloudCall(path: string, method: string = 'GET', data: any = {}): Promise<any> {
  return new Promise((resolve, reject) => {
    wx.cloud.callContainer({
      config: { env: ENV },
      path,
      header: { 'X-WX-SERVICE': 'express-rtm4', 'content-type': 'application/json' },
      method: method as any,
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
  
  // 订单
  getOrders: () => cloudCall('/api/orders'),
  createOrder: (data: any) => cloudCall('/api/orders', 'POST', data),
  updateOrder: (id: number, data: any) => cloudCall('/api/orders/' + id, 'PUT', data),

  // 感受
  getFeeds: () => cloudCall('/api/feeds'),
  createFeed: (data: any) => cloudCall('/api/feeds', 'POST', data),

  // 收藏
  getFavorites: () => cloudCall('/api/favorites'),
  addFavorite: (recipeId: number) => cloudCall('/api/favorites', 'POST', { recipe_id: recipeId }),

  // 做菜记录
  getCookingRecords: () => cloudCall('/api/cooking-records'),
  addCookingRecord: (data: any) => cloudCall('/api/cooking-records', 'POST', data),
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
            // res.data 可能是 arrayBuffer
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
