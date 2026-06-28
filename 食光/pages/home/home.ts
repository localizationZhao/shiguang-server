// 首页
import { PUBLIC_RECIPES } from '../../utils/storage'
import { randomPick, chooseImage, chooseAndCropImage, generateId } from '../../utils/util'
import { addRecipe, getCategories, saveCategories, SYSTEM_CATEGORIES } from '../../utils/storage'
import { api } from '../../utils/api'

Page({
  data: {
    searchKeyword: '',
    searchResults: [] as any[],
    isSearching: false,
    spinning: false,
    blindResult: '点击转盘试试手气',
    selectedTags: [] as string[],
    showPetCustom: false,
    petFace: '',
    petColor: 'default',
    petName: '小食光',
    // 主题色
    themeColor: 'green',
    themeColors: [
      { key: 'orange', name: '经典橘', main: '#FF9A56', dark: '#E07B3A', light: '#FFD0B0' },
      { key: 'pink', name: '粉嫩', main: '#ff4997', dark: '#d43d7e', light: '#FFB8D0' },
      { key: 'blue', name: '天空蓝', main: '#4285f4', dark: '#3367d6', light: '#a8c8fa' },
      { key: 'green', name: '清新绿', main: '#6bcb77', dark: '#4a9e56', light: '#b7e4c7' },
      { key: 'purple', name: '梦幻紫', main: '#9C27B0', dark: '#7B1FA2', light: '#CE93D8' },
    ],
    themeMain: '#6bcb77',
    themeDark: '#4a9e56',
    themeLight: '#b7e4c7',
    showFilter: false,
    showPocketBird: true,
    birdTargets: [] as any[],
    birdScrollTop: 0 as number,
    selectedIngCat: '全部',
    allRecipes: [] as any[],
    displayRecipes: [] as any[],
    scrollNames: [] as string[],  // 滚动菜名
    systemPets: ['/sptites/pets/1.png', '/sptites/pets/2.png', '/sptites/pets/3.png'],
    showBlindModal: false,
    blindPick: null as any,
    showWelcomeModal: false,
    welcomeNick: '',
  },

  _tabIndex: 1, // 首页在TabBar中的位置
  _touchStartX: 0,

  onLoad() {
    // 加载保存的主题色
    const savedTheme = wx.getStorageSync('themeColor') || 'green'
    const t = this.data.themeColors.find((tc: any) => tc.key === savedTheme)
    if (t) {
      this.setData({ themeMain: t.main, themeDark: t.dark, themeLight: t.light, themeColor: t.key, petColor: t.key })
    }
    this.fetchRecipes()
  },

  // ===== 左右滑动切换Tab =====
  onTouchStart(e: any) { this._touchStartX = e.touches[0].clientX },
  onTouchEnd(e: any) {
    const deltaX = e.changedTouches[0].clientX - this._touchStartX
    if (Math.abs(deltaX) < 40) return
    const TABS = ['/pages/diy/diy', '/pages/home/home', '/pages/restaurant/restaurant', '/pages/profile/profile']
    const next = deltaX < 0 ? Math.min(this._tabIndex + 1, 3) : Math.max(this._tabIndex - 1, 0)
    if (next !== this._tabIndex) {
      const tabBar = this.getTabBar()
      if (tabBar) tabBar.setData({ selected: next })
      wx.switchTab({ url: TABS[next] })
    }
  },

  fetchRecipes() {
    const CAT_COLORS: Record<string,string>={'荤菜':'#ff8baa','素菜':'#79bcff','凉菜':'#d18bff','汤羹':'#ffb37c','主食':'#6de192','甜点':'#6de192','酒水':'#d18bff'}
    const useLocal = () => {
      const recipes = PUBLIC_RECIPES.map((r:any)=>({...r,color:r.color||CAT_COLORS[r.category]||'#ff8baa'}))
      this.setData({ allRecipes: recipes, displayRecipes: recipes, scrollNames: recipes.map((r:any,i:number)=>({id:i, text:r.coverEmoji+' '+r.name})) })
    }
    useLocal() // 先秒显本地
    // 后台静默从云端更新
    wx.cloud.callContainer({
      config: { env: 'prod-d0g68hmay4c8d10e3' }, path: '/api/recipes',
      header: { 'X-WX-SERVICE': 'express-rtm4' }, method: 'GET',
      success: (res: any) => {
        if (res.data?.code === 0 && res.data.data?.length > 0) {
          const recipes = res.data.data
            .filter((r: any) => r.is_public == 1 || r.is_public === '1') // 只要公开菜谱
            .filter((r: any) => !r.source || r.source !== 'copy') // 排除复刻来源
            .map((r: any) => ({...r,color:r.color||CAT_COLORS[r.category_id]||'#ff8baa'}))
          if (recipes.length > 0) {
            this.setData({ allRecipes: recipes, displayRecipes: recipes, scrollNames: recipes.map((r: any, i: number) => ({id: i, text: (r.cover_emoji || ':)') + ' ' + r.name})) })
          }
        }
      }, fail: () => {}
    })
  },

  onPageScroll(e: any) {
    this.setData({ birdScrollTop: e.scrollTop });
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 })
    }
    // 口袋小鸟显示模式
    const mode = wx.getStorageSync('birdDisplayMode') || 'all'
    const rawPages = wx.getStorageSync('birdPages'); const pages = (rawPages && rawPages.length > 0) ? rawPages : ['home','diy','restaurant','profile']
    let showBird = false
    if (mode === 'all') showBird = true
    else if (mode === 'custom') showBird = pages.indexOf('home') >= 0
    else if (mode === 'restaurant' || mode === 'interior') showBird = false
    this.setData({ showPocketBird: showBird })
    // 扫描页面元素给小鸟停靠
    this._scanBirdTargets()
    // 首次启动欢迎弹窗
    const app = getApp<IAppOption>()
    if (app.globalData.needWelcome) {
      app.globalData.needWelcome = false
      this.setData({ showWelcomeModal: true, welcomeNick: '' })
    }
  },

  preventClose() {},

  onSearchInput(e: any) {
    this.setData({ searchKeyword: e.detail.value })
  },

  doSearch() {
    const kw = this.data.searchKeyword.trim()
    if (!kw) {
      this.setData({ isSearching: false, searchResults: [] })
      return
    }
    const results = this.data.allRecipes.filter((r: any) =>
      r.name.includes(kw) || r.ingredients.some((i: any) => i.name.includes(kw))
    )
    this.setData({ isSearching: true, searchResults: results })
  },

  clearSearch() {
    this.setData({ searchKeyword: '', isSearching: false, searchResults: [] })
  },

  spin() {
    if (this.data.spinning) return
    this.setData({ spinning: true, blindResult: '挑选中...' })
    setTimeout(() => {
      const pool = this.data.allRecipes
      if (pool.length === 0) {
        this.setData({ spinning: false, blindResult: '暂无菜谱' })
        return
      }
      const result = randomPick(pool)
      this.setData({ spinning: false, blindResult: result.name, blindPick: result, showBlindModal: true })
    }, 1500)
  },

  toggleTag(e: any) {
    const tag = e.currentTarget.dataset.tag
    const newTags = (tag === '全部') ? [] : [tag]
    const filtered = newTags.length === 0 ? this.data.allRecipes : this.data.allRecipes.filter((r: any) => {
      const rt = Array.isArray(r.tags) ? r.tags : (typeof r.tags === 'string' ? JSON.parse(r.tags) : [])
      return rt.some((recipeTag: string) => recipeTag.includes(newTags[0]) || newTags[0].includes(recipeTag))
    })
    this.setData({ selectedTags: newTags, displayRecipes: filtered })
  },

  applyTagFilter(tags: string[]) {
    if (tags.length === 0) {
      this.setData({ displayRecipes: this.data.allRecipes })
      return
    }
    const filtered = this.data.allRecipes.filter((r: any) => {
      const rt = Array.isArray(r.tags) ? r.tags : (typeof r.tags === 'string' ? JSON.parse(r.tags) : [])
      return tags.some((t: string) => rt.some((recipeTag: string) => recipeTag.includes(t) || t.includes(recipeTag)))
    })
    this.setData({ displayRecipes: filtered })
  },

  openPetCustom() { this.setData({ showPetCustom: true }) },
  closePetCustom() { this.setData({ showPetCustom: false }) },

  async pickPetFace() {
    wx.showActionSheet({
      itemList: ['拍照', '从相册选择'],
      success: async (res: any) => {
        try {
          let path = ''
          if (res.tapIndex === 0) {
            // 拍照 → 先拍再裁剪
            const p = await new Promise<string[]>((resolve, reject) => {
              wx.chooseImage({ count: 1, sizeType: ['original'], sourceType: ['camera'], success: (r) => resolve(r.tempFilePaths), fail: reject })
            })
            if (p.length === 0) return
            path = p[0]
          } else {
            // 相册 → 选图+裁剪
            const p = await chooseAndCropImage('1:1', 1)
            if (p.length === 0) return
            path = p[0]
          }
          if (path) {
            this.setData({ petFace: path })
            wx.setStorageSync('petFace', path)
            wx.showToast({ title: '头像已更新~', icon: 'success' })
          }
        } catch (e) { console.log('pickPetFace error:', e) }
      }
    })
  },

  selectSystemPet(e: any) {
    const src = e.currentTarget.dataset.src
    this.setData({ petFace: src }); wx.setStorageSync('petFace', src)
  },

  selectPetColor(e: any) {
    const key = e.currentTarget.dataset.color
    const t = this.data.themeColors.find((tc: any) => tc.key === key)
    if (t) {
      this.setData({ petColor: key, themeMain: t.main, themeDark: t.dark, themeLight: t.light, themeColor: key })
      wx.setStorageSync('petColor', key)
      wx.setStorageSync('themeColor', key)
    }
  },

  savePet() {
    wx.setStorageSync('petFace', this.data.petFace || '')
    wx.setStorageSync('petColor', this.data.petColor || 'default')
    this.setData({ showPetCustom: false })
    wx.showToast({ title: '灵宠已保存~', icon: 'success' })
  },

  resetPet() {
    this.setData({ petFace: '', petColor: 'default' }); wx.removeStorageSync('petFace'); wx.removeStorageSync('petColor')
  },

  closeWelcomeModal() {
    const nick = (this.data.welcomeNick || '').trim() || '美食家'
    const id = 'SG' + Date.now().toString(36).toUpperCase().slice(-6)
    wx.setStorageSync('userProfile', { nick, id, createdAt: new Date().toISOString() })
    this.setData({ showWelcomeModal: false })
    wx.showToast({ title: '你好，' + nick + '！', icon: 'none' })
  },
  onWelcomeNickInput(e: any) { this.setData({ welcomeNick: e.detail.value }) },

  closeBlindModal() { this.setData({ showBlindModal: false }) },
  retryBlind() { this.setData({ showBlindModal: false }); this.spin() },
  viewBlindDetail() {
    const id = this.data.blindPick?.id
    if (id) { this.setData({ showBlindModal: false }); wx.navigateTo({ url: '/pages/recipe-detail/recipe-detail?id=' + id }) }
  },

  openFilter() { this.setData({ showFilter: true }) },
  closeFilter() { this.setData({ showFilter: false }) },

  selectIngCat(e: any) {
    const cat = e.currentTarget.dataset.cat
    this.setData({ selectedIngCat: cat })
    if (cat === '全部') {
      this.setData({ displayRecipes: this.data.allRecipes })
    } else {
      const CAT_MAP: Record<string, string[]> = {
        '肉类': ['肉类','荤菜'],
        '海鲜': ['水产','海鲜'],
        '蔬菜': ['蔬菜','素菜'],
        '豆制品': ['豆制品'],
        '水果': ['水果'],
        '蛋奶类': ['蛋奶类'],
        '谷物杂粮': ['主食','谷物杂粮'],
      }
      const keywords = CAT_MAP[cat] || [cat]
      this.setData({ displayRecipes: this.data.allRecipes.filter((r: any) =>
        (r.ingredients || []).some((i: any) => keywords.includes(i.cat || i.category || ''))
      )})
    }
  },

  resetFilters() { this.setData({ selectedIngCat: '全部', displayRecipes: this.data.allRecipes, showFilter: false }) },

  viewRecipe(e: any) {
    wx.navigateTo({ url: '/pages/recipe-detail/recipe-detail?id=' + e.currentTarget.dataset.id })
  },

  quickCopy(e: any) {
    const recipeId = Number(e.currentTarget.dataset.id)
    const recipe = this.data.allRecipes.find((r: any) => r.id === recipeId)
    if (!recipe) { console.warn('[quickCopy] 未找到菜谱, id:', recipeId); return }

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

    const copied = {
      ...recipe, id: generateId(), name: recipe.name + '(复刻)',
      createdAt: new Date().toISOString().slice(0, 10), source: 'copy', copiedFrom: recipe.id, draft: false,
    }
    addRecipe(copied)
    // 同步到云端（明确标记为私有菜谱）
    api.addRecipe({ ...copied, is_public: 0, is_draft: 0 }).catch(() => {})
    const newId = copied.id
    wx.showModal({
      title: '复刻成功 🎉',
      content: `"${copied.name}"已添加到你的DIY菜谱~`,
      confirmText: '去编辑',
      cancelText: '好的',
      success: (res: any) => {
        if (res.confirm) {
          wx.navigateTo({ url: `/pages/recipe-edit/recipe-edit?id=${newId}` })
        }
      }
    })
  },

  // 扫描页面元素给小鸟做停靠目标
  _scanBirdTargets() {
    var self = this;
    var q = wx.createSelectorQuery();
    q.selectAll('.card,.glass,.search-bar,.search-wrap,.chip,.btn,.cat-sidebar,.user-card,.diy-card').boundingClientRect();
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
