// 管理员配图页面
Page({
  data: {
    recipes: [] as any[],
    doneCount: 0,
    token: '',
  },

  onLoad(options: any) {
    const token = options.token || wx.getStorageSync('admin_token') || ''
    this.setData({ token })
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
    const token = this.data.token
    wx.showActionSheet({
      itemList: ['📷 拍照', '🖼️ 从相册选择'],
      success: (act: any) => {
        const sourceType: any[] = act.tapIndex === 0 ? ['camera'] : ['album']
        wx.chooseImage({
          count: 1, sizeType: ['compressed'], sourceType,
          success: (img: any) => {
            wx.showLoading({ title: '上传中...' })
            // 上传到微信云存储
            wx.cloud.uploadFile({
              cloudPath: 'recipe-covers/' + id + '_' + Date.now() + '.jpg',
              filePath: img.tempFilePaths[0],
              success: (upload: any) => {
                // 获取临时链接
                wx.cloud.getTempFileURL({
                  fileList: [upload.fileID],
                  success: (tmp: any) => {
                    const url = tmp.fileList[0]?.tempFileURL || upload.fileID
                    // 保存到MySQL
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
                          // 更新本地列表
                          const recipes = this.data.recipes.map((item: any) => {
                            if (item.id === id) { return { ...item, cover_img: url } }
                            return item
                          })
                          const done = recipes.filter((r: any) => r.cover_img).length
                          this.setData({ recipes, doneCount: done })
                        } else {
                          wx.showToast({ title: r.data?.msg || '保存失败', icon: 'none' })
                        }
                      },
                      fail: () => { wx.hideLoading(); wx.showToast({ title: '保存失败', icon: 'none' }) }
                    })
                  },
                  fail: () => {
                    // getTempFileURL失败，直接用fileID
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
                          const recipes = this.data.recipes.map((item: any) => {
                            if (item.id === id) { return { ...item, cover_img: upload.fileID } }
                            return item
                          })
                          this.setData({ recipes, doneCount: recipes.filter((r: any) => r.cover_img).length })
                        } else {
                          wx.showToast({ title: r.data?.msg || '保存失败', icon: 'none' })
                        }
                      },
                      fail: () => { wx.hideLoading(); wx.showToast({ title: '保存失败', icon: 'none' }) }
                    })
                  }
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
