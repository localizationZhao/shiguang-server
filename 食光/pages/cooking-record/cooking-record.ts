// 做菜记录
import { getCookingRecords, saveCookingRecords, getRecipes } from '../../utils/storage'
import { generateId, chooseImage, chooseAndCropImage, formatDateOnly } from '../../utils/util'
import { api } from '../../utils/api'
import type { CookingRecord } from '../../utils/storage'

Page({
  data: {
    records: [] as CookingRecord[],

    // 新增/编辑弹窗
    showForm: false,
    editId: null as number | null,
    form: {
      recipeId: 0,
      recipeName: '',
      cookedAt: '',
      img: '',
      notes: '',
      voice: '',
    },
    diyRecipes: [] as any[],
    recording: false,
  },

  onShow() {
    this.refresh()
  },

  preventClose() {},

  refresh() {
    const colors = ['n1','n2','n3','n4','n5']
    const records = getCookingRecords().sort((a, b) =>
      new Date(b.cookedAt).getTime() - new Date(a.cookedAt).getTime()
    ).map((r: any, i: number) => ({ ...r, color: colors[i % 5] }))
    this.setData({ records })
  },

  // ============ 新增 ============
  openNew() {
    const recipes = getRecipes().filter(r => !r.draft)
    this.setData({
      showForm: true,
      editId: null,
      form: {
        recipeId: 0,
        recipeName: '',
        cookedAt: formatDateOnly(new Date()),
        img: '',
        notes: '',
      },
      diyRecipes: recipes,
    })
  },

  // ============ 编辑 ============
  editRecord(e: any) {
    const id = e.currentTarget.dataset.id
    const record = this.data.records.find(r => r.id === id)
    if (!record) return
    this.setData({
      showForm: true,
      editId: id,
      form: {
        recipeId: record.recipeId,
        recipeName: record.recipeName,
        cookedAt: record.cookedAt,
        img: record.img || '',
        notes: record.notes || '',
        voice: (record as any).voice || '',
      },
      diyRecipes: getRecipes().filter(r => !r.draft),
    })
  },

  closeForm() {
    this.setData({ showForm: false })
  },

  // 选择菜谱
  pickRecipe(e: any) {
    const idx = e.currentTarget.dataset.index
    const recipe = this.data.diyRecipes[idx]
    this.setData({
      'form.recipeId': recipe.id,
      'form.recipeName': recipe.name,
    })
  },

  // 选择日期
  onDateChange(e: any) {
    this.setData({ 'form.cookedAt': e.detail.value })
  },

  // 选择成品图
  async pickImg() {
    try {
      const paths = await chooseAndCropImage('4:3', 1)
      if (paths.length > 0) {
        this.setData({ 'form.img': paths[0] })
      }
    } catch (err) { /* 取消 */ }
  },

  // 输入备注
  onNotesInput(e: any) {
    this.setData({ 'form.notes': e.detail.value })
  },

  // 保存
  saveRecord() {
    const f = this.data.form
    if (!f.recipeName && !f.notes && !f.img && !f.voice) {
      wx.showToast({ title: '至少写点什么吧~', icon: 'none' })
      return
    }

    const record: CookingRecord = {
      id: this.data.editId || generateId(),
      recipeId: f.recipeId,
      recipeName: f.recipeName || '食光日记',
      cookedAt: f.cookedAt,
      img: f.img,
      notes: f.notes,
      voice: f.voice || '',
    }

    const records = getCookingRecords()
    if (this.data.editId) {
      const idx = records.findIndex(r => r.id === this.data.editId)
      if (idx >= 0) records[idx] = record
    } else {
      records.push(record)
    }
    saveCookingRecords(records)

    this.setData({ showForm: false })
    this.refresh()
    wx.showToast({ title: '记录已保存', icon: 'success' })
  },

  // 删除
  deleteRecord(e: any) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '删除记录',
      content: '确定删除这条做菜记录吗？',
      success: (res) => {
        if (res.confirm) {
          const records = getCookingRecords().filter(r => r.id !== id)
          saveCookingRecords(records)
          this.refresh()
          wx.showToast({ title: '已删除', icon: 'none' })
        }
      }
    })
  },

  // 预览图片
  previewImg(e: any) {
    const src = e.currentTarget.dataset.src
    if (src) {
      wx.previewImage({ urls: [src], current: src })
    }
  },

  onNameInput(e: any) {
    this.setData({ 'form.recipeName': e.detail.value })
  },

  // 语音录制
  toggleVoice() {
    const that = this
    if (this.data.recording) {
      this._recorder.stop()
      this.setData({ recording: false })
      return
    }
    this.setData({ recording: true })
    const rec = wx.getRecorderManager()
    this._recorder = rec
    rec.onStop((res: any) => {
      // 持久化保存录音文件
      wx.saveFile({
        tempFilePath: res.tempFilePath,
        success: (saved: any) => {
          that.setData({ 'form.voice': saved.savedFilePath, recording: false })
        },
        fail: () => {
          that.setData({ 'form.voice': res.tempFilePath, recording: false })
        }
      })
    })
    rec.start({ duration: 60000, format: 'mp3' })
  },
  playVoice() {
    if (this.data.form.voice) {
      const inner = wx.createInnerAudioContext()
      inner.src = this.data.form.voice
      inner.play()
    }
  },

  syncToCloud() {
    const records = getCookingRecords()
    if (records.length === 0) { wx.showToast({ title: '暂无记录', icon: 'none' }); return }
    wx.showLoading({ title: '同步中...' })
    const ps = records.map(r => api.addCookingRecord(r).catch(() => {}))
    Promise.all(ps).then(() => {
      wx.hideLoading()
      wx.showToast({ title: '已同步 ' + records.length + ' 条', icon: 'success' })
    }).catch(() => {
      wx.hideLoading()
      wx.showToast({ title: '部分失败，可重试', icon: 'none' })
    })
  },
})
