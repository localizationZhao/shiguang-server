// 菜谱详情页
import { getRecipes, addRecipe, isFavorite, addFavorite, removeFavorite, PUBLIC_RECIPES, getCategories, saveCategories, SYSTEM_CATEGORIES } from '../../utils/storage'
import { generateId } from '../../utils/util'
import { api } from '../../utils/api'
import type { Recipe } from '../../utils/storage'

Page({
  data: {
    recipe: null as Recipe | null,
    faved: false,
    isPublic: false,
    showExport: false,
  },
  preventClose() {},


  onLoad(options: any) {
    const id = parseInt(options.id)
    if (id) {
      // 先查本地DIY菜谱
      let recipe = getRecipes().find(r => r.id === id && !r.draft)
      // 再查公共菜谱
      if (!recipe) {
        recipe = PUBLIC_RECIPES.find(r => r.id === id)
        if (recipe) {
          this.setData({ isPublic: true })
        }
      }
      // 还没找到就从云端加载
      if (!recipe) {
        api.getRecipe(id).then((r: any) => {
          if (r) {
            try { r.ingredients = typeof r.ingredients === 'string' ? JSON.parse(r.ingredients) : (r.ingredients || []) } catch (e) { r.ingredients = [] }
            try { r.steps = typeof r.steps === 'string' ? JSON.parse(r.steps) : (r.steps || []) } catch (e) { r.steps = [] }
            this.setData({ recipe: r, isPublic: true })
          }
        }).catch(() => {})
        return
      }
      if (recipe) {
        this.setData({
          recipe,
          faved: isFavorite(id),
        })
      }
    }
  },

  onShow() {
    if (this.data.recipe) {
      this.setData({ faved: isFavorite(this.data.recipe.id) })
    }
  },

  // ============ 收藏/取消收藏 ============
  toggleFavorite() {
    if (!this.data.recipe) return
    if (this.data.faved) {
      removeFavorite(this.data.recipe.id)
      api.removeFavorite(this.data.recipe.id).catch(()=>{})
      wx.showToast({ title: '已取消🤍', icon: 'none' })
    } else {
      addFavorite(this.data.recipe)
      api.addFavorite(this.data.recipe.id).catch(()=>{})
      wx.showToast({ title: '已收藏 ❤️', icon: 'none' })
    }
    this.setData({ faved: !this.data.faved })
  },

  // ============ 一键复刻到DIY ============
  copyToDIY() {
    if (!this.data.recipe) return
    const recipe = this.data.recipe

    // 确保分类标签存在（系统标签被删除后自动补回）
    const cats = getCategories()
    if (recipe.category && !cats.find((c: any) => c.name === recipe.category)) {
      const sysCat = SYSTEM_CATEGORIES.find((s: any) => s.name === recipe.category)
      if (sysCat) {
        cats.push({ ...sysCat })
      } else {
        cats.push({ name: recipe.category, isSystem: false, sort: cats.length, color: '' })
      }
      saveCategories(cats)
    }

    const newRecipe: Recipe = {
      ...recipe,
      id: generateId(),
      name: recipe.name + '(复刻)',
      createdAt: new Date().toISOString().slice(0, 10),
      source: 'copy',
      copiedFrom: recipe.id,
      draft: false,
    }
    addRecipe(newRecipe)
    api.addRecipe({ ...newRecipe, is_public: 0, is_draft: 0 }).catch(() => {})
    wx.showModal({
      title: '复刻成功 🎉',
      content: `"${newRecipe.name}"已添加到你的DIY菜谱，可以自由修改啦~`,
      confirmText: '去编辑',
      cancelText: '好的',
      success: (res) => {
        if (res.confirm) {
          wx.navigateTo({ url: `/pages/recipe-edit/recipe-edit?id=${newRecipe.id}` })
        }
      }
    })
  },

  // ============ 编辑菜谱（仅DIY菜谱） ============
  editRecipe() {
    if (!this.data.recipe || this.data.isPublic) return
    wx.navigateTo({ url: `/pages/recipe-edit/recipe-edit?id=${this.data.recipe.id}` })
  },

  // ============ 分享 ============
  shareRecipe() { this.setData({ showExport: true }) },
  closeExport() { this.setData({ showExport: false }) },

  // 复制文字→粘贴到聊天
  exportAsText() {
    const r = this.data.recipe; if (!r) return
    let txt = '🍽️ ' + r.name + '\n' + r.category + ' · ¥' + (r.price || 0) + '\n\n🥬 食材：\n'
    ;(r.ingredients || []).forEach((i: any) => txt += '· ' + i.name + ' ' + (i.amount || '') + '\n')
    txt += '\n👨‍🍳 步骤：\n'
    ;(r.steps || []).forEach((s: any, idx: number) => txt += (idx + 1) + '. ' + s.text + '\n')
    wx.setClipboardData({ data: txt, success: () => wx.showToast({ title: '已复制，去聊天粘贴发给好友', icon: 'success' }) })
    this.closeExport()
  },

  // SQL→复制→粘贴到聊天
  exportAsSQL() {
    const r = this.data.recipe; if (!r) return
    const sql = `INSERT INTO recipes (name,category_id,price,ingredients,steps,cover_emoji) VALUES\n('${r.name}',1,${r.price||0},'${JSON.stringify(r.ingredients||[])}','${JSON.stringify(r.steps||[])}','${r.coverEmoji||':)'}');`
    wx.setClipboardData({ data: sql, success: () => wx.showToast({ title: 'SQL已复制，去聊天粘贴发给好友', icon: 'success' }) })
    this.closeExport()
  },

  // PDF/Word → 复制格式化文本→可粘贴到Word/打印
  async exportAsPDF() {
    const r = this.data.recipe; if (!r) return
    this.closeExport(); wx.showLoading({ title: "生成PDF..." })
    try {
      const res = await wx.cloud.callContainer({ config: { env: "prod-d0g68hmay4c8d10e3" }, path: "/api/export/pdf", header: { "X-WX-SERVICE": "express-rtm4" }, method: "POST", data: r })
      wx.hideLoading()
      if (res.data?.code === 0 && res.data?.url) {
        const base = "https://express-rtm4-274448-6-1446973602.sh.run.tcloudbase.com"
        wx.downloadFile({ url: base + res.data.url, success: (dl) => wx.openDocument({ filePath: dl.tempFilePath, showMenu: true }), fail: () => { this.copyFormattedRecipe(); wx.showToast({ title: "下载失败，已复制文字", icon: "none" }) } })
      } else { wx.hideLoading(); this.exportAsImage() }
    } catch (e) { wx.hideLoading(); wx.showToast({ title: 'PDF生成失败，请稍后重试', icon: 'none' }) }
  },
  async exportAsWord() {
    const r = this.data.recipe; if (!r) return
    this.closeExport(); wx.showLoading({ title: "生成Word..." })
    try {
      const res = await wx.cloud.callContainer({ config: { env: "prod-d0g68hmay4c8d10e3" }, path: "/api/export/word", header: { "X-WX-SERVICE": "express-rtm4" }, method: "POST", data: r })
      wx.hideLoading()
      if (res.data?.code === 0 && res.data?.url) {
        const base = "https://express-rtm4-274448-6-1446973602.sh.run.tcloudbase.com"
        wx.downloadFile({ url: base + res.data.url, success: (dl) => wx.openDocument({ filePath: dl.tempFilePath, showMenu: true }), fail: () => { this.copyFormattedRecipe(); wx.showToast({ title: "下载失败，已复制文字", icon: "none" }) } })
      } else { wx.hideLoading(); this.exportAsImage() }
    } catch (e) { wx.hideLoading(); wx.showToast({ title: 'Word生成失败，请稍后重试', icon: 'none' }) }
  },
  copyFormattedRecipe() {
    const r = this.data.recipe; if (!r) return
    let txt = '═══════════════════\n'
      + '🍽️  ' + r.name + '\n'
      + (r.category || '') + ' · ¥' + (r.price || '免费') + '\n'
      + '═══════════════════\n\n'
      + '【食材清单】\n'
    ;(r.ingredients || []).forEach((i: any) => txt += '  · ' + i.name + '  ' + (i.amount || '') + '\n')
    txt += '\n【烹饪步骤】\n'
    ;(r.steps || []).forEach((s: any, idx: number) => txt += '  ' + (idx + 1) + '. ' + s.text + '\n')
    if (r.reference) txt += '\n📎 参考：' + r.reference
    if (r.notes) txt += '\n💬 备注：' + r.notes
    wx.setClipboardData({ data: txt })
  },

  // 导出为图片（自适应高度+步骤配图）
  async exportAsImage() {
    this.closeExport()
    const r = this.data.recipe; if (!r) return
    wx.showLoading({ title: '生成图片中...' })
    const W = 600, M = 24, LINE_W = 40 // 每行约40个中文字

    // 计算高度
    let h = 80 // 标题+边框
    h += 36 + 24 // 菜名+分类
    h += 28 + (r.ingredients || []).length * 24 // 食材
    h += 28 // 步骤标题
    ;(r.steps || []).forEach((s: any) => {
      const textLines = Math.ceil(s.text.length / LINE_W)
      h += textLines * 24 + 6
      if (s.img) h += 160 // 步骤图片高度
    })
    if (r.reference) h += 28
    if (r.notes) h += 28
    h += 60 // footer

    const ctx = wx.createCanvasContext('exportCanvas', this)

    // 底色+边框
    ctx.setFillStyle('#ffecda'); ctx.fillRect(0, 0, W, h)
    ctx.setStrokeStyle('#ffa3cb'); ctx.setLineWidth(4); ctx.strokeRect(2, 2, W - 4, h - 4)
    ctx.setStrokeStyle('#fff'); ctx.setLineWidth(8); ctx.strokeRect(10, 10, W - 20, h - 20)
    ctx.setStrokeStyle('#ffa3cb'); ctx.setLineWidth(4); ctx.strokeRect(14, 14, W - 28, h - 28)

    let y = 40
    ctx.setFillStyle('#3f2c15'); ctx.setFontSize(20); ctx.fillText(r.name, M, y); y += 36

    ctx.setFillStyle('#999'); ctx.setFontSize(13)
    ctx.fillText((r.category || '') + ' · ¥' + (r.price || '免费'), M, y); y += 28

    ctx.setFillStyle('#ffa3cb'); ctx.setFontSize(14)
    ctx.fillText('━━ 食材清单 ━━', M, y); y += 24
    ctx.setFillStyle('#3f2c15'); ctx.setFontSize(13)
    ;(r.ingredients || []).forEach((i: any) => {
      ctx.fillText('· ' + i.name + '  ' + (i.amount || ''), M, y); y += 24
    })

    ctx.setFillStyle('#ffa3cb'); ctx.setFontSize(14)
    ctx.fillText('━━ 烹饪步骤 ━━', M, y); y += 28
    ctx.setFillStyle('#3f2c15'); ctx.setFontSize(13)

    const stepDraws: any[] = []
    ;(r.steps || []).forEach((s: any, idx: number) => {
      ctx.fillText((idx + 1) + '. ', M, y)
      // 自动换行
      const text = s.text
      let lineX = M + 28, lineY = y
      for (let i = 0; i < text.length; i += LINE_W) {
        ctx.fillText(text.slice(i, i + LINE_W), lineX, lineY)
        lineY += 20
      }
      y = Math.max(lineY, y + 20) + 4
      if (s.img) {
        stepDraws.push({ img: s.img, x: M, y, w: 160, h: 120 })
        ctx.setFillStyle('#eee'); ctx.fillRect(M, y, 160, 120)
        ctx.setFillStyle('#999'); ctx.setFontSize(12)
        ctx.fillText('[步骤' + (idx + 1) + '配图]', M + 10, y + 65)
        y += 140
      }
      y += 6
    })

    if (r.reference) { ctx.setFillStyle('#999'); ctx.setFontSize(12); ctx.fillText('📎 ' + r.reference.slice(0, 45), M, y); y += 28 }
    if (r.notes) { ctx.setFillStyle('#999'); ctx.setFontSize(12); ctx.fillText('💬 ' + r.notes.slice(0, 45), M, y); y += 28 }
    ctx.setFillStyle('#ccc'); ctx.setFontSize(11); ctx.fillText('—— 来自「食光」小程序', M, y + 16)

    ctx.draw(false, () => {
      setTimeout(() => {
        wx.canvasToTempFilePath({
          canvasId: 'exportCanvas', quality: 1.0, height: h, width: W,
          success: (res: any) => {
            wx.hideLoading()
            wx.showActionSheet({
              itemList: ['💬 分享到微信聊天', '💾 保存到相册'],
              success: (act: any) => {
                if (act.tapIndex === 0) {
                  wx.shareFileMessage({ filePath: res.tempFilePath, fileName: (r.name || 'recipe') + '.jpg' })
                } else {
                  wx.saveImageToPhotosAlbum({ filePath: res.tempFilePath, success: () => wx.showToast({ title: '已保存', icon: 'success' }) })
                }
              }
            })
          },
          fail: () => { wx.hideLoading(); wx.showToast({ title: '生成失败', icon: 'none' }) }
        })
      }, 500)
    })
  },

  shareToChat() { this.closeExport() },
  copyLink() {
    const r = this.data.recipe; if (!r) return
    const id = r.id || ''
    const name = encodeURIComponent(r.name || '')
    const url = 'https://express-rtm4-274448-6-1446973602.sh.run.tcloudbase.com/recipe/' + name + '?id=' + id
    wx.setClipboardData({ data: url, success: () => wx.showToast({ title: '链接已复制，可到浏览器查看', icon: 'success' }) })
    this.closeExport()
  },

  // ============ 预览图片 ============
  previewImg(e: any) {
    const src = e.currentTarget.dataset.src
    if (src) {
      wx.previewImage({
        urls: [src],
        current: src,
      })
    }
  },
  onShareAppMessage() {
    const r = this.data.recipe
    return { title: r ? '食光 · ' + r.name : '食光美食', path: '/pages/recipe-detail/recipe-detail?id=' + (r?.id || ''), imageUrl: r?.coverImg || '' }
  },
})
