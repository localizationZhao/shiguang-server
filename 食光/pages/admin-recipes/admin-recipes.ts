// 管理员配图页面
Page({
  data: {
    recipes: [] as any[],
    doneCount: 0,
  },

  onLoad() {
    const token = wx.getStorageSync('admin_token')
    if (!token) {
      wx.showToast({ title: '请先验证', icon: 'none' })
      setTimeout(() => wx.navigateBack(), 1500)
      return
    }
    this.loadRecipes()
  },

  async loadRecipes() {
    wx.showLoading({ title: '加载中...' })
    try {
      const res = await wx.cloud.callContainer({
        config: { env: 'prod-d0g68hmay4c8d10e3' },
        path: '/api/recipes', header: { 'X-WX-SERVICE': 'express-rtm4' },
        method: 'GET', timeout: 8000
      })
      wx.hideLoading()
      if ((res.data as any)?.code === 0) {
        const list = (res.data as any).data || []
        const done = list.filter((r: any) => r.cover_img).length
        this.setData({ recipes: list, doneCount: done })
      } else {
        wx.showToast({ title: '加载失败', icon: 'none' })
      }
    } catch (e) {
      wx.hideLoading()
      wx.showToast({ title: '网络错误', icon: 'none' })
    }
  },

  uploadCover(e: any) {
    const id = e.currentTarget.dataset.id
    const name = e.currentTarget.dataset.name
    const token = wx.getStorageSync('admin_token')

    wx.showActionSheet({
      itemList: ['📷 拍照', '🖼️ 从相册选择'],
      success: (act: any) => {
        const sourceType: any[] = act.tapIndex === 0 ? ['camera'] : ['album']
        wx.chooseImage({
          count: 1, sizeType: ['compressed'], sourceType,
          success: (img: any) => {
            wx.showLoading({ title: '上传中...' })
            wx.cloud.uploadFile({
              cloudPath: 'recipe-covers/' + id + '_' + Date.now() + '.jpg',
              filePath: img.tempFilePaths[0],
              success: (upload: any) => {
                wx.cloud.callContainer({
                  config: { env: 'prod-d0g68hmay4c8d10e3' },
                  path: '/api/admin/recipes/' + id + '/cover',
                  header: { 'X-WX-SERVICE': 'express-rtm4' },
                  method: 'PUT',
                  data: { token, cover_img: upload.fileID },
                  timeout: 8000,
                  success: (r: any) => {
                    wx.hideLoading()
                    if (r.data?.code === 0) {
                      wx.showToast({ title: name + ' 配图成功 ✅', icon: 'success' })
                      wx.cloud.getTempFileURL({
                        fileList: [upload.fileID],
                        success: (tmp: any) => {
                          const url = tmp.fileList[0]?.tempFileURL || ''
                          const recipes = this.data.recipes.map((item: any) => {
                            if (item.id === id) { return { ...item, cover_img: url } }
                            return item
                          })
                          const done = recipes.filter((r: any) => r.cover_img).length
                          this.setData({ recipes, doneCount: done })
                        }
                      })
                    } else {
                      wx.showToast({ title: r.data?.msg || '保存失败', icon: 'none' })
                    }
                  },
                  fail: () => { wx.hideLoading(); wx.showToast({ title: '保存失败', icon: 'none' }) }
                })
              },
              fail: () => { wx.hideLoading(); wx.showToast({ title: '上传失败', icon: 'none' }) }
            })
          }
        })
      }
    })
  },
})
