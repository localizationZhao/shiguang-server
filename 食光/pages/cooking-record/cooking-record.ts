// 做菜记录
import { getCookingRecords, saveCookingRecords, getRecipes } from '../../utils/storage'
import { generateId, chooseImage, chooseAndCropImage, formatDateOnly } from '../../utils/util'
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
    },
    diyRecipes: [] as any[],
  },

  onShow() {
    this.refresh()
  },

  preventClose() {},

  refresh() {
    this.setData({
      records: getCookingRecords().sort((a, b) =>
        new Date(b.cookedAt).getTime() - new Date(a.cookedAt).getTime()
      ),
    })
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
    if (!f.recipeName) {
      wx.showToast({ title: '请选择菜谱', icon: 'none' })
      return
    }

    const record: CookingRecord = {
      id: this.data.editId || generateId(),
      recipeId: f.recipeId,
      recipeName: f.recipeName,
      cookedAt: f.cookedAt,
      img: f.img,
      notes: f.notes,
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
})
