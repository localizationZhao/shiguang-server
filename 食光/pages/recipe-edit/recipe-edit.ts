// 新建/编辑菜谱 - 5步表单
import { getRecipes, getCategories, saveCategories, addRecipe, updateRecipe, saveDraft } from '../../utils/storage'
import { generateId, chooseImage, chooseAndCropImage } from '../../utils/util'
import { api } from '../../utils/api'
import type { Recipe, Category, Ingredient, CookingStep } from '../../utils/storage'

Page({
  data: {
    editId: null as number | null,

    // 分类管理
    showCatMgr: false,
    newCatName: '',
    editCatName: '',
    editingCat: null as any,
    preventClose() {},

    // 步骤控制
    step: 1,
    maxStep: 5,

    // 表单数据
    form: {
      name: '',
      category: '荤菜',
      price: '',
      ingredients: [] as Ingredient[],
      steps: [] as CookingStep[],
      reference: '',
      notes: '',
      coverEmoji: '🍽️',
      coverImg: '',
    },

    // 分类列表（用于选择）
    categories: [] as Category[],

    // 封面预览
    coverPreview: '',

    // 食材分类列表
    ingredientCategories: ['肉类', '水产', '蔬菜', '豆制品', '水果', '调味料', '其他辅料'],

    // 步骤拖拽
    dragIndex: -1,

    // 预览计数
    ingredientCount: 0,
    stepCount: 0,
  },

  onLoad(options: any) {
    const categories = getCategories()
    this.setData({ categories })

    const id = parseInt(options.id)
    // 没有编辑ID时，检查草稿
    if (!id) {
      const drafts = getRecipes().filter(r => r.draft)
      if (drafts.length > 0) {
        wx.showModal({
          title: '发现草稿',
          content: '有未完成的草稿「' + drafts[0].name + '」，要继续编辑吗？',
          confirmText: '继续编辑',
          cancelText: '新建',
          success: (res: any) => {
            if (res.confirm) {
              const d = drafts[0]
              this.setData({
                editId: d.id,
                form: {
                  name: d.name, category: d.category, price: d.price ? String(d.price) : '',
                  ingredients: d.ingredients.length > 0 ? d.ingredients : [{name:'',amount:'',category:'肉类'}],
                  steps: d.steps.length > 0 ? d.steps : [{text:''}],
                  reference: d.reference || '', notes: d.notes || '',
                  coverEmoji: d.coverEmoji || '🍽️', coverImg: d.coverImg || '',
                },
                coverPreview: d.coverImg || '',
              })
            }
          }
        })
      }
    }
    if (id) {
      const recipes = getRecipes()
      const recipe = recipes.find(r => r.id === id)
      if (recipe) {
        this.setData({
          editId: id,
          form: {
            name: recipe.name,
            category: recipe.category,
            price: recipe.price ? String(recipe.price) : '',
            ingredients: recipe.ingredients.length > 0 ? recipe.ingredients : [{ name: '', amount: '', category: '肉类' }],
            steps: recipe.steps.length > 0 ? recipe.steps : [{ text: '' }],
            reference: recipe.reference || '',
            notes: recipe.notes || '',
            coverEmoji: recipe.coverEmoji || '🍽️',
            coverImg: recipe.coverImg || '',
          },
          coverPreview: recipe.coverImg || '',
        })
      }
    }
  },

  // ============ 步骤导航 ============
  prevStep() {
    if (this.data.step > 1) {
      this.setData({ step: this.data.step - 1 })
    }
  },

  nextStep() {
    if (this.data.step < this.data.maxStep) {
      // 第1步校验
      if (this.data.step === 1 && !this.data.form.name.trim()) {
        wx.showToast({ title: '请输入菜谱名称', icon: 'none' })
        return
      }
      this.setData({ step: this.data.step + 1 })
      if (this.data.step === 5) this.updatePreviewCounts()
    }
  },

  goStep(e: any) {
    const s = e.currentTarget.dataset.step
    this.setData({ step: s })
    if (s === 5) this.updatePreviewCounts()
  },

  updatePreviewCounts() {
    const f = this.data.form
    this.setData({
      ingredientCount: f.ingredients.filter((i: Ingredient) => i.name.trim()).length,
      stepCount: f.steps.filter((s: CookingStep) => s.text.trim()).length,
    })
  },

  // ============ Step 1: 基本信息 ============
  onNameInput(e: any) {
    this.setData({ 'form.name': e.detail.value })
  },

  onPriceInput(e: any) {
    this.setData({ 'form.price': e.detail.value })
  },

  pickCategory(e: any) {
    this.setData({ 'form.category': e.currentTarget.dataset.cat, showCatMgr: false })
  },

  // 分类管理
  openCatMgr() { this.setData({ showCatMgr: true }) },
  closeCatMgr() { this.setData({ showCatMgr: false }) },
  onNewCatInput(e: any) { this.setData({ newCatName: e.detail.value }) },
  confirmAddCat() {
    const name = (this.data.newCatName || '').trim()
    if (!name || name.length > 4) { wx.showToast({ title: '1-4个字', icon: 'none' }); return }
    const cats = getCategories()
    if (cats.find(c => c.name === name)) { wx.showToast({ title: '已存在', icon: 'none' }); return }
    const colors = ['#ff8baa','#79bcff','#ffb37c','#d18bff','#6de192']
    cats.push({ name, isSystem: false, sort: 99, color: colors[Math.floor(Math.random()*colors.length)] })
    saveCategories(cats)
    this.setData({ categories: cats, newCatName: '', 'form.category': name })
    wx.showToast({ title: '已添加', icon: 'success' })
  },
  startEditCat(e: any) {
    const idx = e.currentTarget.dataset.index
    const cat = this.data.categories[idx]
    if (!cat) return
    this.setData({ editingCat: cat, editCatName: cat.name })
  },
  onEditCatInput(e: any) { this.setData({ editCatName: e.detail.value }) },
  confirmEditCat() {
    if (!this.data.editingCat) return
    const name = (this.data.editCatName || '').trim()
    if (!name || name.length > 4) { wx.showToast({ title: '1-4个字', icon: 'none' }); return }
    const cats = getCategories()
    const idx = cats.findIndex(c => c.name === this.data.editingCat.name)
    if (idx >= 0) { cats[idx].name = name; saveCategories(cats); this.setData({ categories: cats, editingCat: null, editCatName: '' }) }
    if (this.data.form.category === this.data.editingCat.name) { this.setData({ 'form.category': name }) }
    wx.showToast({ title: '已改名', icon: 'success' })
  },
  cancelEditCat() { this.setData({ editingCat: null, editCatName: '' }) },
  deleteCategory(e: any) {
    const idx = e.currentTarget.dataset.index
    const cat = this.data.categories[idx]
    if (!cat || cat.isSystem) return
    wx.showModal({
      title: '删除', content: '确定删除' + cat.name + '？',
      success: (res: any) => {
        if (res.confirm) {
          const cats = getCategories().filter(c => c.name !== cat.name)
          saveCategories(cats)
          this.setData({ categories: cats })
          if (this.data.form.category === cat.name) this.setData({ 'form.category': cats[0]?.name || '荤菜' })
          wx.showToast({ title: '已删除', icon: 'success' })
        }
      }
    })
  },

  // ============ Step 2: 食材清单 ============
  addIngredient() {
    const ingredients = [...this.data.form.ingredients, { name: '', amount: '', category: '肉类' }]
    this.setData({ 'form.ingredients': ingredients })
  },

  removeIngredient(e: any) {
    const idx = e.currentTarget.dataset.index
    if (this.data.form.ingredients.length <= 1) {
      wx.showToast({ title: '至少保留一个食材', icon: 'none' })
      return
    }
    const ingredients = this.data.form.ingredients.filter((_: any, i: number) => i !== idx)
    this.setData({ 'form.ingredients': ingredients })
  },

  onIngNameInput(e: any) {
    const idx = e.currentTarget.dataset.index
    const value = e.detail.value
    this.setData({ [`form.ingredients[${idx}].name`]: value })
  },

  onIngAmountInput(e: any) {
    const idx = e.currentTarget.dataset.index
    const value = e.detail.value
    this.setData({ [`form.ingredients[${idx}].amount`]: value })
  },

  pickIngCategory(e: any) {
    const idx = e.currentTarget.dataset.index
    const cat = e.currentTarget.dataset.cat
    this.setData({ [`form.ingredients[${idx}].category`]: cat })
  },

  // ============ Step 3: 烹饪步骤 ============
  addStep() {
    const steps = [...this.data.form.steps, { text: '' }]
    this.setData({ 'form.steps': steps })
  },

  removeStep(e: any) {
    const idx = e.currentTarget.dataset.index
    if (this.data.form.steps.length <= 1) {
      wx.showToast({ title: '至少保留一个步骤', icon: 'none' })
      return
    }
    const steps = this.data.form.steps.filter((_: any, i: number) => i !== idx)
    this.setData({ 'form.steps': steps })
  },

  onStepInput(e: any) {
    const idx = e.currentTarget.dataset.index
    const value = e.detail.value
    this.setData({ [`form.steps[${idx}].text`]: value })
  },

  // 步骤配图
  async addStepImg(e: any) {
    const idx = e.currentTarget.dataset.index
    try {
      const paths = await chooseAndCropImage('4:3', 1)
      if (paths.length === 0) return
      wx.showLoading({ title: '上传中...' })
      try {
        const res = await wx.cloud.uploadFile({ cloudPath: 'steps/' + Date.now() + '.jpg', filePath: paths[0] })
        this.setData({ [`form.steps[${idx}].img`]: res.fileID })
        wx.showToast({ title: '上传成功', icon: 'success' })
      } catch (e) {
        this.setData({ [`form.steps[${idx}].img`]: paths[0] })
        wx.showToast({ title: '已选择（本地）', icon: 'none' })
      }
      wx.hideLoading()
    } catch (err) {
      console.log('取消选择图片')
    }
  },

  removeStepImg(e: any) {
    const idx = e.currentTarget.dataset.index
    this.setData({ [`form.steps[${idx}].img`]: '' })
  },

  // ============ Step 4: 参考资料 ============
  onRefInput(e: any) {
    this.setData({ 'form.reference': e.detail.value })
  },
  onNotesInput(e: any) {
    this.setData({ 'form.notes': e.detail.value })
  },

  // ============ Step 5: 封面与保存 ============
  async pickCover() {
    let localPath = ''
    try {
      const paths = await chooseAndCropImage('4:3', 1)
      if (paths.length === 0) return
      localPath = paths[0]
      wx.showLoading({ title: '上传中...' })
      const uploadRes = await wx.cloud.uploadFile({ cloudPath: 'recipes/' + Date.now() + '.jpg', filePath: localPath })
      wx.hideLoading()
      this.setData({ 'form.coverImg': uploadRes.fileID, coverPreview: localPath })
      wx.showToast({ title: '封面上传成功', icon: 'success' })
    } catch (err) {
      wx.hideLoading()
      if (localPath) {
        this.setData({ 'form.coverImg': localPath, coverPreview: localPath })
        wx.showToast({ title: '已选择图片（本地）', icon: 'none' })
      }
    }
  },

  removeCover() {
    this.setData({ 'form.coverImg': '', coverPreview: '' })
  },

  // ============ 保存操作 ============
  // 暂存草稿
  saveAsDraft() {
    const f = this.data.form
    const recipe: Recipe = {
      id: this.data.editId || generateId(),
      name: f.name || '未命名草稿',
      category: f.category,
      price: parseFloat(f.price) || 0,
      ingredients: f.ingredients.filter(i => i.name),
      steps: f.steps.filter(s => s.text),
      reference: f.reference,
      notes: f.notes,
      coverEmoji: f.coverEmoji,
      coverImg: f.coverImg,
      createdAt: new Date().toISOString().slice(0, 10),
      draft: true,
      source: 'diy',
    }
    try {
      saveDraft(recipe)
      wx.showToast({ title: '草稿已保存 📝', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 1200)
    } catch(e) {
      console.error('[saveDraft] 保存失败:', e)
      wx.showModal({ title: '保存失败', content: '存储空间可能不足', showCancel: false })
    }
  },

  // 完成保存
  saveRecipe() {
    const f = this.data.form
    if (!f.name.trim()) {
      wx.showToast({ title: '请输入菜谱名称', icon: 'none' })
      this.setData({ step: 1 })
      return
    }

    const recipe: Recipe = {
      id: this.data.editId || generateId(),
      name: f.name.trim(),
      category: f.category,
      price: parseFloat(f.price) || 0,
      ingredients: f.ingredients.filter(i => i.name.trim()),
      steps: f.steps.filter(s => s.text.trim()),
      reference: f.reference,
      notes: f.notes,
      coverEmoji: f.coverEmoji,
      coverImg: f.coverImg,
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString(),
      draft: false,
      source: 'diy',
    }

    if (recipe.ingredients.length === 0) {
      wx.showToast({ title: '请至少添加一个食材', icon: 'none' })
      this.setData({ step: 2 })
      return
    }

    if (recipe.steps.length === 0) {
      wx.showToast({ title: '请至少添加一个步骤', icon: 'none' })
      this.setData({ step: 3 })
      return
    }

    try {
      if (this.data.editId) {
        updateRecipe(recipe)
      } else {
        addRecipe(recipe)
      }
    } catch(e) {
      console.error('[saveRecipe] 保存失败:', e)
      wx.showModal({
        title: '保存失败',
        content: '可能是存储空间不足，请尝试清理小程序数据后重试。',
        showCancel: false
      })
      return
    }

    // 同步云端
    const catId = getCategories().findIndex((c: any) => c.name === recipe.category) + 1 || 1
    api.addRecipe({
      name: recipe.name, category_id: catId, color: recipe.color || '#ff8baa',
      price: recipe.price, ingredients: recipe.ingredients, steps: recipe.steps,
      reference: recipe.reference, cover_img: recipe.coverImg, cover_emoji: recipe.coverEmoji,
      is_public: 0, is_draft: 0, tags: JSON.stringify([])
    }).catch(() => {}) // 云端失败不影响本地

    const saveId = recipe.id
    wx.showToast({ title: this.data.editId ? '修改成功 ✅' : '创建成功 🎉', icon: 'success' })
    setTimeout(() => {
      if (this.data.editId) { wx.redirectTo({ url: '/pages/recipe-detail/recipe-detail?id=' + saveId }) }
      else { wx.navigateBack() }
    }, 800)
  },
})
