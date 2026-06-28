// DIY 自制菜谱页面
import { getRecipes, getCategories, saveCategories, saveRecipes, deleteRecipe, SYSTEM_CATEGORIES } from '../../utils/storage'
import type { Recipe, Category } from '../../utils/storage'

// 颜色池 + 分类映射
const COLOR_POOL = ['#ff8baa','#79bcff','#ffb37c','#d18bff','#6de192','#ff9a76','#a0e7e5','#f3c4fb','#fcf6bd','#b8bedd']
const CAT_COLORS: Record<string, string> = {'荤菜':'#ff8baa','素菜':'#79bcff','凉菜':'#d18bff','汤羹':'#ffb37c','主食':'#6de192','甜点':'#6de192','酒水':'#d18bff','未分类':'#ff8baa'}
function randomCatColor():string{return COLOR_POOL[Math.floor(Math.random()*COLOR_POOL.length)]}

Page({
  data: {
    // 分类
    categories: [] as Category[],
    activeCat: '荤菜',

    // 菜谱
    allRecipes: [] as Recipe[],
    filteredRecipes: [] as Recipe[],
    searchKeyword: '',
    showPocketBird: true,
    birdTargets: [] as any[],

    // 状态
    isEmpty: false,
    isManageMode: false,       // 批量管理模式
    selectedIds: [] as number[], // 批量选中的菜谱id

    // 弹窗
    showCatMenu: false,        // 分类管理弹窗
    showContextMenu: false,    // 长按菜单
    contextRecipe: null as Recipe | null,
    showAddCat: false,         // 新建分类弹窗
    newCatName: '',
    showEditCat: false,        // 编辑分类
    editingCat: null as Category | null,
    editCatName: '',

    // 删除确认
    showDeleteConfirm: false,
    deleteTargetId: 0,
    deleteTargetName: '',

    // 采购清单弹窗
    showShoppingList: false,
    shoppingItems: [] as { name: string; amount: string; count: number }[],
  },

  _tabIndex: 0, // DIY在TabBar中的位置
  _touchStartX: 0,

  onLoad() {
    this.refreshAll()
  },

  // ===== 左右滑动切换Tab =====
  onTouchStart(e: any) { this._touchStartX = e.touches[0].clientX },
  onTouchEnd(e: any) {
    const deltaX = e.changedTouches[0].clientX - this._touchStartX
    if (Math.abs(deltaX) < 60) return
    const TABS = ['/pages/diy/diy', '/pages/home/home', '/pages/restaurant/restaurant', '/pages/profile/profile']
    const next = deltaX < 0 ? Math.min(this._tabIndex + 1, 3) : Math.max(this._tabIndex - 1, 0)
    if (next !== this._tabIndex) wx.switchTab({ url: TABS[next] })
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 })
    }
    // 口袋小鸟显示模式
    const mode = wx.getStorageSync('birdDisplayMode') || 'all'
    const pages = wx.getStorageSync('birdPages') || ['home','diy','restaurant','profile']
    this.setData({ showPocketBird: mode === 'all' || (mode === 'custom' && pages.indexOf('diy') >= 0) })
    this._scanBirdTargets()
    this.refreshAll()
  },

  // ============ 核心刷新 ============
  refreshAll() {
    const allRecipes = getRecipes().filter(r => !r.draft).map(r => ({
      ...r, color: r.color || CAT_COLORS[r.category] || (getCategories().find(c=>c.name===r.category)||{}as any).color || '#ff8baa'
    }))
    // 交错三色：蓝、橘、紫
    const TAG_COLORS = ['#79bcff', '#ffb37c', '#d18bff']
    const TAG_SHADOWS = ['#5a90d4', '#d49050', '#a060d4']
    const categories = getCategories().map((c: any, i: number) => ({
      ...c, tagColor: TAG_COLORS[i % 3], tagShadow: TAG_SHADOWS[i % 3]
    }))
    // 应用搜索关键词（全局匹配，搜菜名+食材+标签）
    let filtered
    if (this.data.searchKeyword.trim()) {
      const kw = this.data.searchKeyword.trim().toLowerCase()
      filtered = allRecipes.filter(r =>
        r.name.toLowerCase().includes(kw) ||
        (r.ingredients || []).some((i: any) => i.name.toLowerCase().includes(kw)) ||
        (r.category || '').toLowerCase().includes(kw)
      )
    } else {
      filtered = allRecipes.filter(r => r.category === this.data.activeCat)
    }
    this.setData({
      allRecipes,
      categories,
      filteredRecipes: filtered,
      isEmpty: filtered.length === 0,
      selectedIds: [],
      isManageMode: false,
    })
  },

  preventClose() {},

  // ============ 搜索 ============
  onSearchInput(e: any) {
    this.setData({ searchKeyword: e.detail.value }, () => { this.refreshAll() })
  },

  doSearch() {
    this.refreshAll()
  },

  clearSearch() {
    this.setData({ searchKeyword: '' })
    this.refreshAll()
  },

  // ============ 分类操作 ============
  selectCat(e: any) {
    const cat = e.currentTarget.dataset.cat
    if (cat === this.data.activeCat && !this.data.isManageMode) return
    const filtered = this.data.allRecipes.filter(r => r.category === cat)
    this.setData({
      activeCat: cat,
      filteredRecipes: filtered,
      isEmpty: filtered.length === 0,
      selectedIds: [],
    })
  },

  // 打开分类管理弹窗
  openCatMenu() {
    this.setData({ showCatMenu: true })
  },

  closeCatMenu() {
    this.setData({ showCatMenu: false })
  },

  // 新建分类
  showAddCatDialog() {
    this.setData({ showAddCat: true, newCatName: '', showCatMenu: false })
  },

  onNewCatInput(e: any) {
    this.setData({ newCatName: e.detail.value })
  },

  confirmAddCat() {
    const name = this.data.newCatName.trim()
    if (!name) { wx.showToast({ title: '起个名吧', icon: 'none' }); return }
    if (name.length > 4) { wx.showToast({ title: '四个字以内', icon: 'none' }); return }
    const cats = getCategories()
    if (cats.find(c => c.name === name)) {
      wx.showToast({ title: '分类已存在', icon: 'none' }); return
    }
    cats.push({ name, isSystem: false, sort: cats.length, color: randomCatColor() } as any)
    saveCategories(cats)
    this.setData({ showAddCat: false, newCatName: '', categories: cats, activeCat: name })
    this.refreshAll()
    wx.showToast({ title: '分类已添加', icon: 'success' })
  },

  cancelAddCat() {
    this.setData({ showAddCat: false, newCatName: '' })
  },

  // 编辑分类
  showEditCatDialog(e: any) {
    const cat = e.currentTarget.dataset.cat
    this.setData({ showEditCat: true, editingCat: cat, editCatName: cat.name, showCatMenu: false })
  },

  onEditCatInput(e: any) {
    this.setData({ editCatName: e.detail.value })
  },

  confirmEditCat() {
    const name = this.data.editCatName.trim()
    if (!name) { wx.showToast({ title: '起个名吧', icon: 'none' }); return }
    if (name.length > 4) { wx.showToast({ title: '四个字以内', icon: 'none' }); return }
    const cats = getCategories()
    const idx = cats.findIndex(c => c.name === this.data.editingCat!.name)
    if (idx >= 0) cats[idx].name = name
    saveCategories(cats)
    const activeCat = this.data.activeCat === this.data.editingCat!.name ? name : this.data.activeCat
    this.setData({ showEditCat: false, editingCat: null, editCatName: '', categories: cats, activeCat })
    this.refreshAll()
    wx.showToast({ title: '分类已修改', icon: 'success' })
  },

  cancelEditCat() {
    this.setData({ showEditCat: false, editingCat: null, editCatName: '' })
  },

  // 删除分类
  deleteCategory(e: any) {
    const cat: Category = e.currentTarget.dataset.cat
    wx.showModal({
      title: '删除分类',
      content: `确定删除"${cat.name}"吗？该分类下的菜谱将归入"未分类"`,
      success: (res) => {
        if (res.confirm) {
          // 确保"未分类"存在
          let cats = getCategories()
          if (!cats.find(c => c.name === '未分类')) {
            cats.push({ name: '未分类', isSystem: false, sort: cats.length })
          }
          // 移除该分类
          cats = cats.filter(c => c.name !== cat.name)
          saveCategories(cats)

          // 将该分类下的菜谱归入"未分类"
          const recipes = getRecipes()
          recipes.forEach(r => {
            if (r.category === cat.name) r.category = '未分类'
          })
          saveRecipes(recipes)

          const activeCat = this.data.activeCat === cat.name ? '未分类' : this.data.activeCat
          this.setData({ showCatMenu: false, categories: cats, activeCat })
          this.refreshAll()
          wx.showToast({ title: '已删除', icon: 'success' })
        }
      }
    })
  },

  // ============ 菜谱操作 ============
  // 新建菜谱
  createRecipe() {
    wx.navigateTo({ url: '/pages/recipe-edit/recipe-edit' })
  },

  // 查看详情
  viewDetail(e: any) {
    if (this.data.isManageMode) {
      this.toggleSelect(e)
      return
    }
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/recipe-detail/recipe-detail?id=${id}` })
  },

  // 长按菜谱
  longPressRecipe(e: any) {
    const id = Number(e.currentTarget.dataset.id)
    const recipe = this.data.allRecipes.find(r => r.id === id)
    if (recipe) {
      this.setData({ showContextMenu: true, contextRecipe: recipe })
    }
  },

  closeContextMenu() {
    this.setData({ showContextMenu: false, contextRecipe: null })
  },

  // 编辑菜谱
  editRecipe() {
    const id = this.data.contextRecipe!.id
    this.closeContextMenu()
    wx.navigateTo({ url: `/pages/recipe-edit/recipe-edit?id=${id}` })
  },

  // 上架至餐厅
  shelfToRestaurant() {
    const recipe = this.data.contextRecipe!
    const rests = wx.getStorageSync('restaurants') || []
    if (rests.length === 0) {
      wx.showModal({
        title: '提示',
        content: '你还没有餐厅，先去创建一家餐厅吧',
        confirmText: '去创建',
        success: (res) => {
          if (res.confirm) wx.switchTab({ url: '/pages/restaurant/restaurant' })
        }
      })
      this.closeContextMenu()
      return
    }
    // 选择上架到哪家餐厅
    const names = rests.map((r: any) => r.name)
    wx.showActionSheet({
      itemList: names,
      success: (res) => {
        const rest = rests[res.tapIndex]
        if (!rest.menu) rest.menu = []
        if (!rest.menu.find((m: any) => m.recipeId === recipe.id)) {
          rest.menu.push({
            recipeId: recipe.id,
            name: recipe.name,
            price: recipe.price,
            emoji: recipe.coverEmoji,
            onShelf: true,
          })
          wx.setStorageSync('restaurants', rests)
          wx.showToast({ title: `已上架至${rest.name}`, icon: 'success' })
        } else {
          wx.showToast({ title: '该菜品已在菜单中', icon: 'none' })
        }
      }
    })
    this.closeContextMenu()
  },

  // 删除菜谱
  confirmDeleteRecipe() {
    this.setData({
      showDeleteConfirm: true,
      deleteTargetId: this.data.contextRecipe!.id,
      deleteTargetName: this.data.contextRecipe!.name,
      showContextMenu: false,
    })
  },

  cancelDelete() {
    this.setData({ showDeleteConfirm: false, deleteTargetId: 0, deleteTargetName: '' })
  },

  doDeleteRecipe() {
    deleteRecipe(this.data.deleteTargetId)
    this.setData({ showDeleteConfirm: false, deleteTargetId: 0, deleteTargetName: '', contextRecipe: null })
    this.refreshAll()
    wx.showToast({ title: '已删除', icon: 'success' })
  },

  // ============ 批量管理 ============
  toggleManageMode() {
    this.setData({
      isManageMode: !this.data.isManageMode,
      selectedIds: [],
    })
  },

  toggleSelect(e: any) {
    if (!this.data.isManageMode) return
    const id = Number(e.currentTarget.dataset.id)
    let selected = [...this.data.selectedIds]
    const idx = selected.indexOf(id)
    if (idx >= 0) selected.splice(idx, 1)
    else selected.push(id)
    this.setData({ selectedIds: selected })
  },

  // 批量导入采购清单
  batchShoppingList() {
    if (this.data.selectedIds.length === 0) {
      wx.showToast({ title: '请先选择菜谱', icon: 'none' })
      return
    }
    const selectedRecipes = this.data.allRecipes.filter(r => this.data.selectedIds.includes(r.id))
    const ingredientMap = new Map<string, { name: string; amount: string; count: number }>()
    selectedRecipes.forEach(recipe => {
      recipe.ingredients.forEach(ing => {
        const key = ing.name
        if (ingredientMap.has(key)) {
          const item = ingredientMap.get(key)!
          item.count++
          item.amount = item.amount ? `${item.amount}; ${ing.amount}` : ing.amount
        } else {
          ingredientMap.set(key, { name: ing.name, amount: ing.amount, count: 1 })
        }
      })
    })
    const shoppingItems = Array.from(ingredientMap.values())
    this.setData({ showShoppingList: true, shoppingItems })
  },

  closeShoppingList() {
    this.setData({ showShoppingList: false, shoppingItems: [] })
  },

  // 复制采购清单
  copyShoppingList() {
    const text = this.data.shoppingItems
      .map((item, i) => `${i + 1}. ${item.name} - ${item.amount}`)
      .join('\n')
    wx.setClipboardData({
      data: text,
      success: () => wx.showToast({ title: '已复制到剪贴板', icon: 'success' })
    })
  },

  // 全选/取消全选
  toggleSelectAll() {
    if (this.data.selectedIds.length === this.data.filteredRecipes.length) {
      this.setData({ selectedIds: [] })
    } else {
      this.setData({ selectedIds: this.data.filteredRecipes.map(r => r.id) })
    }
  },

  _scanBirdTargets() {
    var self = this;
    var q = wx.createSelectorQuery();
    q.selectAll('.card,.glass,.chip,.btn,.search-bar,.cat-sidebar,.diy-card').boundingClientRect();
    q.exec(function (res: any[]) {
      var rects = res[0];
      if (rects && rects.length > 0) {
        var targets: any[] = [];
        for (var i = 0; i < rects.length; i++) {
          var r = rects[i];
          if (r && r.width > 40 && r.height > 20 && r.top > 10) {
            targets.push({ x: r.left, y: r.top, w: r.width, h: r.height });
          }
        }
        self.setData({ birdTargets: targets });
      }
    });
  },
})
