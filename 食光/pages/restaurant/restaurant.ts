// 餐厅页面
import { getRecipes, getRestaurants, saveRestaurants, getOrders, saveOrders, getFeeds, saveFeeds, getUserProfile, BIRD_TYPES, SEAT_POSITIONS, ACCESSORIES, randomSoulColor, SOUL_COLORS } from '../../utils/storage'
import { generateId, chooseImage } from '../../utils/util'
import { generateQRCode, api } from '../../utils/api'
import type { Restaurant, Order, Feed, Member } from '../../utils/storage'

Page({
  data: {
    hasRestaurant: false,
    restaurants: [] as Restaurant[],
    activeRestIdx: 0,
    activeRest: null as any,
    role: 'customer',
    tab: 'menu',
    menu: [] as any[],
    orders: [] as Order[],
    feeds: [] as Feed[],
    showCreateRest: false,
    restName: '',
    showJoinRest: false,
    joinCode: '',
    showShelf: false,
    diyRecipes: [] as any[],
    shelfSearch: '',
    showNewFeed: false,
    feedContent: '',
    feedVisibility: 'all',
    feedVisibilityOptions: ['all','restaurant','self'],
    feedFilter: 'all',
    feedImages: [] as string[],
    feedIdentity: 'role',
    feedRestId: 0,
    feedRestList: [] as any[],
    feedLocDisplay: '',
    feedIsTimePublic: true,
    feedShowLocation: true,
    feedIsLocationPublic: true,
    feedCustomLocation: '',
    feedLocation: '',
    feedLocPrecision: 'exact',
    feedLng: 0, feedLat: 0,
    feedMarker: [] as any[],
    showShareSheet: false,
    showRestDetail: false,
    restDescription: '',
    orderFilter: 'all',
    filteredOrders: [] as any[],
    allRestsForOrder: [] as any[],
    orderRestFilter: 0,
    menuAll: [] as any[],
    showMsgModal: false,
    msgTargetId: 0,
    msgText: '',
    msgMode: 'owner',
    msgPresets: ['别着急','再等等等等','五分钟就好啦','再等我五百年~'],
    urgePresets: ['快写吧您内','等的我花儿都谢了大哥','大厨您真是慢功夫出细活呀快着点做吧~','我看您才是米其林大厨，比米其林还米其林'],
    showToast: false, toastMsg: '', toastColor: '#7ee787',
    rejectMsgs: ['您的点单遭到拒绝啦~','或许食材不全~','店主心情不佳~','试试别的菜肴吧~'],
    showRateModal: false, rateOrderId: 0, rateStars: 5, rateText: '',
    avgRating: '--', featuredReviews: [] as any[],

    // ===== 新增：编辑餐厅 =====
    showEditRest: false,
    editRestName: '',
    editRestDesc: '',

    // ===== 新增：餐厅内部空间 =====
    showInterior: false,

    // ===== 新增：欢迎弹窗 =====
    showWelcome: false,
    welcomeMsg: '',

    // ===== 新增：选鸟 =====
    showBirdPicker: false,
    birdTypes: BIRD_TYPES,
    selectedBird: '32x32x1',
    joinNickname: '',
    myNick: '', // 当前用户昵称（用于退出按钮比对）

    // ===== 新增：配饰 =====
    accessories: ACCESSORIES,
    selectedAccessory: '',
    showAccessoryPick: false,

    // ===== 新增：灵魂色 =====
    soulColors: SOUL_COLORS,
    selectedSoulColor: SOUL_COLORS[0],
    showColorPick: false,
    isMystery: false,

    // ===== 新增：小程序码 =====
    qrCodePath: '',
    generatingQR: false,
    seatToast: '',
    // 餐厅配色
    restTheme: '#79bcff',
    restThemeDark: '#5a90d4',
    restThemeLight: '#b8d8f0',
    restThemes: [
      { key: 'blue', name: '蓝', main: '#79bcff', dark: '#5a90d4', light: '#b8d8f0' },
      { key: 'pink', name: '粉', main: '#ffa3cb', dark: '#e892b5', light: '#e8c0d4' },
      { key: 'orange', name: '橘', main: '#ffb37c', dark: '#c97a3a', light: '#ffe0c0' },
      { key: 'green', name: '绿', main: '#6bcb77', dark: '#4a9e56', light: '#b7e4c7' },
      { key: 'purple', name: '紫', main: '#d18bff', dark: '#a060d4', light: '#e4c8f8' },
    ],
    showRestTheme: false,
    submitting: false,

    // ===== 口袋小鸟 =====
    showPocketBird: true,
    birdInteriorOnly: false,
    birdTargets: [] as any[],

    // ===== 新增：状态面板 =====
    showStatus: false,
    statusMembers: [] as Member[],
    statusOnline: 0,
    statusOffline: 0,

    // ===== 新增：座位系统 =====
    seatPositions: SEAT_POSITIONS,
    seatMap: [] as { seatId: number; label: string; member: Member | null; isOwner: boolean }[],
    selectedSeat: 0,  // 加入时选的座位
    availableSeats: [] as number[],  // 可选座位号列表
  },

  _tabIndex: 2, // 餐厅在TabBar中的位置
  _touchStartX: 0,

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

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 2 })
    }
    // 口袋小鸟显示模式
    const mode = wx.getStorageSync('birdDisplayMode') || 'all'
    const pages = wx.getStorageSync('birdPages') || ['home','diy','restaurant','profile']
    let showBird = false, interiorOnly = false
    if (mode === 'all') showBird = true
    else if (mode === 'custom') showBird = pages.indexOf('restaurant') >= 0
    else if (mode === 'restaurant') showBird = true
    else if (mode === 'interior') { showBird = true; interiorOnly = true }
    this.setData({ showPocketBird: showBird, birdInteriorOnly: interiorOnly })
    this._scanBirdTargets()
    // 加载保存的餐厅配色
    const saved = wx.getStorageSync('restTheme') || 'blue'
    const t = this.data.restThemes.find((tc: any) => tc.key === saved)
    if (t) this.setData({ restTheme: t.main, restThemeDark: t.dark, restThemeLight: t.light })
    this.refreshAll()

    // 处理扫码进店
    const app = getApp<IAppOption>()
    if (app.globalData.pendingInviteCode) {
      const code = app.globalData.pendingInviteCode
      app.globalData.pendingInviteCode = ''
      const rests = getRestaurants()
      let target = rests.find((r: any) => r.inviteCode === code)
      if (!target) {
        // 本地没找到，从云端查（离线模式跳过）
        const app2 = getApp<IAppOption>()
        if (!app2.globalData.cloudOnline) {
          wx.showToast({ title: '离线模式：仅支持本机已有餐厅', icon: 'none', duration: 2000 })
          return
        }
        api.getRestaurantByCode(code).then((cloudRest: any) => {
          if (cloudRest && cloudRest.invite_code) {
            this._joinByCloudRest(cloudRest, code)
          } else {
            wx.showToast({ title: '邀请码无效或餐厅不存在', icon: 'none' })
          }
        }).catch(() => {
          wx.showToast({ title: '云端不可达，请确认网络', icon: 'none' })
        })
        return
      }
      const occupied = (target.members || []).map((m: any) => m.seatIndex)
      const freeSeats = SEAT_POSITIONS.filter(s => s.id !== 4 && !occupied.includes(s.id)).map(s => s.id)
      const autoSeat = freeSeats.length > 0 ? freeSeats[0] : 0
      this.setData({
        joinCode: code,
        selectedSeat: autoSeat,
        selectedBird: '32x32x1',
        selectedAccessory: '',
        selectedSoulColor: randomSoulColor()
      })
      setTimeout(() => { this.confirmJoinRest() }, 500)
    }
  },

  refreshAll() {
    const allRests = getRestaurants()
    const orders = getOrders()
    // 从云端拉取feed
    api.getFeeds().then((cloudFeeds: any[]) => {
      if (cloudFeeds && cloudFeeds.length > 0) {
        const merged = cloudFeeds.map((f: any) => ({
          id: f.id, content: f.content, images: f.images ? (typeof f.images === 'string' ? JSON.parse(f.images) : f.images) : [],
          restaurantName: f.restaurant_name, nickname: f.nickname || '美食家', posterRole: f.poster_role,
          visibility: f.visibility, createTime: new Date(f.created_at).getTime(),
          isTimePublic: f.is_time_public, showLocation: f.show_location,
          isLocationPublic: f.is_location_public, location: f.location,
          locPrecision: f.loc_precision, customLocation: f.custom_location,
          timeDisplay: f.is_time_public ? this.computeTimeDisplay(new Date(f.created_at).getTime()) : '时间都去哪了',
          locDisplay: f.show_location ? (f.is_location_public ? (f.loc_precision === 'fuzzy' ? (f.location||'').slice(0,6)+'...附近' : f.location) : (f.custom_location || '神秘地点')) : '',
        }))
        saveFeeds(merged)
        this.setData({ feeds: this.filterFeeds(merged) })
      }
    }).catch(() => {})
    const feeds = getFeeds().map((f: any) => ({
      ...f, timeDisplay: f.isTimePublic ? this.computeTimeDisplay(f.createTime) : '时间都去哪了',
      locDisplay: f.showLocation ? (f.isLocationPublic ? (f.locPrecision === 'fuzzy' ? (f.location||'').slice(0,6)+'...附近' : f.location) : (f.customLocation || '神秘地点')) : '',
    }))
    const r = this.data.role
    const rests = (r === 'owner' ? allRests.filter((x: any) => x.owner) : allRests.filter((x: any) => !x.owner)).filter((x: any) => !x.closed)
    const has = rests.length > 0
    const idx = this.data.activeRestIdx < rests.length ? this.data.activeRestIdx : 0
    const activeRest = has ? rests[idx] : null
    const menuAll = activeRest ? (activeRest.menu || []) : []
    const menu = menuAll.filter((m: any) => m.onShelf)
    const restId = activeRest ? (activeRest.originalId || activeRest.id) : 0
    // 收集当前餐厅的所有关联ID（自身+originalId+关联副本）
    const relatedIds = new Set<number>([restId, activeRest?.id].filter(Boolean) as number[])
    if (activeRest) {
      allRests.forEach((r: any) => {
        if (r.originalId === activeRest.id || r.id === activeRest.originalId) relatedIds.add(r.id)
      })
    }
    const filteredOrders = activeRest ? orders.filter((o: any) => relatedIds.has(o.restaurantId)) : []
    this.syncOrdersFromCloud()
    this.setData({
      hasRestaurant: has, restaurants: rests, activeRest, menu, menuAll,
      orders: filteredOrders, filteredOrders: filteredOrders, feeds: this.filterFeeds(feeds), activeRestIdx: idx,
      allRestsForOrder: rests.filter((r: any) => orders.some((o: any) => o.restaurantId === r.id || o.restaurantId === (r.originalId || r.id))),
    })
    this.updateAvgRating()
  },

  computeTimeDisplay(ts: number): string {
    if (!ts) return ''
    const d = new Date(ts)
    const Y = d.getFullYear()
    const M = String(d.getMonth()+1).padStart(2,'0')
    const D = String(d.getDate()).padStart(2,'0')
    const H = String(d.getHours()).padStart(2,'0')
    const m = String(d.getMinutes()).padStart(2,'0')
    return Y + '年' + M + '月' + D + '日 ' + H + ':' + m
  },

  switchRest(e: any) {
    const idx = parseInt(e.currentTarget.dataset.index)
    this.setData({ activeRestIdx: idx, tab: 'menu' })
    this.refreshAll()
  },

  // ===== 长按餐厅标签 → 管理菜单（不切换餐厅） =====
  longPressRest(e: any) {
    const idx = parseInt(e.currentTarget.dataset.index)
    const rests = this.data.restaurants
    const rest = rests[idx]
    if (!rest) return
    // 不自动切换！避免误触导致闪跳
    const that = this
    if (rest.owner) {
      wx.showActionSheet({
        itemList: ['✏️ 编辑名称', '🔄 刷新邀请码', '📋 复制邀请码', '💀 闭店', 'ℹ️ 查看详情', '📍 切换到此店'],
        success(res: any) {
          // 先切换到该餐厅再执行操作
          if (that.data.activeRestIdx !== idx) {
            that.setData({ activeRestIdx: idx, tab: 'menu' })
            that.refreshAll()
          }
          switch (res.tapIndex) {
            case 0: that.openEditRest(); break
            case 1: that.refreshInviteCode(); break
            case 2:
              wx.setClipboardData({ data: rest.inviteCode || '' })
              wx.showToast({ title: '邀请码已复制', icon: 'success' })
              break
            case 3: that.deleteRestaurant(); break
            case 4: that.openRestDetail(); break
            case 5: break // 已切换，无需额外操作
          }
        }
      })
    } else {
      wx.showActionSheet({
        itemList: ['🚪 退出餐厅', 'ℹ️ 查看详情', '📍 切换到此店'],
        success(res: any) {
          if (that.data.activeRestIdx !== idx) {
            that.setData({ activeRestIdx: idx, tab: 'menu' })
            that.refreshAll()
          }
          switch (res.tapIndex) {
            case 0: that.leaveRestaurant(); break
            case 1: that.openRestDetail(); break
            case 2: break
          }
        }
      })
    }
  },

  switchTab(e: any) {
    const t = e.currentTarget.dataset.tab
    this.setData({ tab: t })
    if (t === 'orders') this.syncOrdersFromCloud()
  },

  forceEnter() {
    const all = getRestaurants().filter((r: any) => !r.closed)
    const ownerRests = all.filter((x: any) => x.owner)
    const joinedRests = all.filter((x: any) => !x.owner)
    const autoRole = ownerRests.length > 0 ? 'owner' : (joinedRests.length > 0 ? 'customer' : this.data.role)
    const rests = autoRole === 'owner' ? ownerRests : joinedRests
    if (rests.length > 0) {
      this.setData({ hasRestaurant: true, restaurants: rests, activeRest: rests[0], activeRestIdx: 0, role: autoRole, tab: 'menu' })
      const menu = (rests[0].menu || []).filter((m: any) => m.onShelf)
      this.setData({ menu, menuAll: rests[0].menu || [] })
    } else {
      this.setData({ hasRestaurant: false })
    }
  },

  syncOrdersFromCloud() {
    const rest = this.data.activeRest
    if (!rest?.inviteCode) return
    const restId = rest.originalId || rest.id
    api.getOrders(rest.inviteCode).then((cloudOrders: any[]) => {
      if (!cloudOrders || cloudOrders.length === 0) return
      const merged = cloudOrders.map((o: any) => ({
        id: generateId(), restaurantId: restId,
        restaurantName: o.restaurant_name, items: o.items,
        itemList: o.item_list ? (typeof o.item_list === 'string' ? JSON.parse(o.item_list) : o.item_list) : [],
        status: o.status, customer: o.customer_name || '食客',
        createdAt: o.created_at, time: o.status === 'cooking' ? '制作中...' : '',
        rating: o.rating, review: o.review, urgeCount: o.urge_count || 0,
        cloudId: o.id
      }))
      // 合并到本地：云端来的覆盖本地同cloudId的
      let localOrders = getOrders()
      merged.forEach((mo: any) => {
        const exist = localOrders.findIndex((lo: any) => lo.cloudId === mo.cloudId)
        if (exist >= 0) {
          // 更新状态
          localOrders[exist].status = mo.status
          localOrders[exist].rating = mo.rating
          localOrders[exist].review = mo.review
          localOrders[exist].urgeCount = mo.urgeCount
        } else {
          localOrders.unshift(mo)
        }
      })
      saveOrders(localOrders)
      const filtered = localOrders.filter((o: any) => o.restaurantId === restId || o.restaurantId === rest.id)
      this.setData({ orders: filtered })
      // 重新应用筛选
      if (this.data.orderFilter && this.data.orderFilter !== 'all') {
        this.filterOrders({ currentTarget: { dataset: { filter: this.data.orderFilter } } })
      } else {
        this.setData({ filteredOrders: filtered })
      }
    }).catch(() => {})
  },

  switchRole() {
    const newRole = this.data.role === 'owner' ? 'customer' : 'owner'
    // 切到店主自动显示订单Tab，切到食客显示菜单Tab
    const newTab = newRole === 'owner' ? 'orders' : 'menu'
    const that = this
    this.setData({ role: newRole, tab: newTab, activeRestIdx: 0 }, function () {
      that.refreshAll()
    })
  },

  pickRestTheme(e: any) {
    const key = e.currentTarget.dataset.theme
    const t = this.data.restThemes.find((tc: any) => tc.key === key)
    if (t) {
      this.setData({ restTheme: t.main, restThemeDark: t.dark, restThemeLight: t.light })
      wx.setStorageSync('restTheme', key)
    }
  },

  preventClose() {},

  // ===== 创建餐厅 =====
  openCreateRest() { this.setData({ showCreateRest: true, restName: '', restDescription: '' }) },
  closeCreateRest() { this.setData({ showCreateRest: false }) },
  onRestNameInput(e: any) { this.setData({ restName: e.detail.value }) },
  onRestDescInput(e: any) { this.setData({ restDescription: e.detail.value }) },

  confirmCreateRest() {
    const name = (this.data.restName || '').trim()
    if (!name) { wx.showToast({ title: '请输入餐厅名称', icon: 'none' }); return }
    if (name.length > 8) { wx.showToast({ title: '餐厅名称最多8个字', icon: 'none' }); return }
    const rests = getRestaurants()
    const owned = rests.filter((r: any) => r.owner)
    if (owned.length >= 5) { wx.showToast({ title: '最多创建5个餐厅', icon: 'none' }); return }
    const code = 'SG' + Date.now().toString(36).toUpperCase().slice(-6)
    const newRest: any = {
      id: generateId(), name, owner: true,
      description: this.data.restDescription || '',
      menu: [], members: [],
      inviteCode: code, codeExpire: Date.now() + 86400000
    }
    // 主人自动加入
    const profile = wx.getStorageSync('userProfile') || { nick: '店主' }
    newRest.members.push({ nick: profile.nick || '店主', seatIndex: 4, birdType: '32x32x1', soulColor: randomSoulColor(), online: true })
    rests.push(newRest)
    saveRestaurants(rests)
    // 同步云端
    api.createRestaurant(newRest).then(() => {
      wx.showToast({ title: '已同步云端', icon: 'success', duration: 1000 })
    }).catch((e: any) => {
      console.error('[创建餐厅] 云端同步失败:', e)
    })
    const ownerRests = rests.filter((r: any) => r.owner)
    const newIdx = ownerRests.length - 1
    this.setData({ showCreateRest: false, restName: '', hasRestaurant: true, activeRestIdx: newIdx, role: 'owner' })
    this.refreshAll()
    this.showCustomToast('邀请码：' + code + '（已复制）', '#7ee787')
    wx.setClipboardData({ data: code })
  },

  // ===== 编辑餐厅 =====
  openEditRest() {
    const rest = this.data.activeRest
    if (!rest) return
    this.setData({ showEditRest: true, editRestName: rest.name, editRestDesc: rest.description || '' })
  },
  closeEditRest() { this.setData({ showEditRest: false }) },
  onEditRestNameInput(e: any) { this.setData({ editRestName: e.detail.value }) },
  onEditRestDescInput(e: any) { this.setData({ editRestDesc: e.detail.value }) },

  confirmEditRest() {
    const name = (this.data.editRestName || '').trim()
    if (!name) { wx.showToast({ title: '请输入餐厅名称', icon: 'none' }); return }
    const rests = getRestaurants()
    const rest = rests[this.data.activeRestIdx]
    if (!rest || !rest.owner) return
    rest.name = name
    rest.description = this.data.editRestDesc || ''
    saveRestaurants(rests)
    this.setData({ showEditRest: false })
    this.refreshAll()
    this.showCustomToast('餐厅信息已更新~', '#7ee787')
  },

  // ===== 删除餐厅 =====
  deleteRestaurant() {
    const that = this
    wx.showModal({
      title: '确认删除',
      content: '删除后将无法恢复，确定要删除「' + (this.data.activeRest?.name || '') + '」吗？',
      confirmColor: '#f85149',
      success(res: any) {
        if (res.confirm) {
          const rests = getRestaurants()
          const rest = rests[that.data.activeRestIdx]
          if (rest) {
            rest.closed = true
            // 标记所有加入此店的副本为闭店
            rests.forEach((r: any) => { if (r.originalId === rest.id) r.closed = true })
          }
          saveRestaurants(rests)
          // 云端同步闭店
          api.deleteRestaurant(rest.id).catch(() => {})
          that.setData({ activeRestIdx: 0 })
          that.refreshAll()
          that.showCustomToast('餐厅已闭店，云端已同步', '#f85149')
        }
      }
    })
  },

  // ===== 餐厅状态面板 =====
  openStatus() {
    const rest = this.data.activeRest
    if (!rest) return
    const members = rest.members || []
    const online = members.filter((m: Member) => m.online).length
    const offline = members.length - online
    const profile = getUserProfile()
    this.setData({
      showStatus: true,
      statusMembers: members,
      statusOnline: online,
      statusOffline: offline,
      myNick: profile.nick || '美食家'
    })
  },
  closeStatus() { this.setData({ showStatus: false }) },

  // ===== 进入餐厅内部空间 =====
  enterInterior() {
    if (!this.data.activeRest) return
    const rests = getRestaurants()
    const rest = rests.find((r: any) => r.id === this.data.activeRest.id)
    if (!rest) return
    const profile = getUserProfile()
    const nick = profile.nick || '美食家'
    const isOwner = rest.owner

    // 店主确保在主座4
    if (isOwner) {
      let ownerMember = (rest.members || []).find((m: Member) => m.nickname === nick)
      if (!ownerMember) {
        ownerMember = {
          nickname: nick,
          birdType: '32x32x1',
          online: true,
          joinedAt: new Date().toISOString(),
          seatIndex: 4,
          accessory: '',
          soulColor: randomSoulColor()
        }
        rest.members.push(ownerMember)
      } else {
        ownerMember.online = true
        ownerMember.seatIndex = 4
      }
    } else {
      // 食客：如果还没选座，自动分配空座
      let member = (rest.members || []).find((m: Member) => m.nickname === nick)
      if (!member) {
        const occupied = (rest.members || []).map((m: Member) => m.seatIndex)
        const freeSeats = SEAT_POSITIONS.filter(s => s.id !== 4 && !occupied.includes(s.id))
        const seat = freeSeats.length > 0 ? freeSeats[0].id : 0
        member = {
          nickname: nick,
          birdType: this.data.selectedBird || '32x32x1',
          birdColor: (BIRD_TYPES.find((b: any) => b.key === this.data.selectedBird) || {} as any).color || '#639bff',
          online: true,
          joinedAt: new Date().toISOString(),
          seatIndex: seat,
          accessory: '',
          soulColor: randomSoulColor()
        }
        rest.members.push(member)
      } else {
        member.online = true
      }
    }

    saveRestaurants(rests)

    // 构建座位表
    const ownerNick = isOwner ? nick : '' // 当前用户是店主时，记录其昵称
    const seatMap = SEAT_POSITIONS.map(seat => {
      const m = (rest.members || []).find((mb: Member) => mb.seatIndex === seat.id) || null
      return {
        seatId: seat.id,
        label: seat.label,
        member: m ? { ...m, isOwner: !!ownerNick && m.nickname === ownerNick } : null,
        isOwner: seat.id === 4  // 4号座位标记（主座视觉）
      }
    })

    const onlineCount = (rest.members || []).filter((m: Member) => m.online).length

    const r = this.data.role
    const filtered = r === 'owner' ? rests.filter((x: any) => x.owner) : rests
    const idx = filtered.findIndex((x: any) => x.id === rest.id)
    this.setData({
      showInterior: true,
      activeRest: rest,
      activeRestIdx: idx >= 0 ? idx : 0,
      seatMap,
      statusOnline: onlineCount,
      statusOffline: (rest.members || []).length - onlineCount,
      statusMembers: rest.members || [],
      welcomeMsg: '欢迎老吃家 ' + nick + ' 大家光临！',
      showWelcome: true
    })
    setTimeout(() => { this.setData({ showWelcome: false }) }, 10500)
  },
  leaveInterior() {
    // 标记离线
    const rests = getRestaurants()
    const rest = rests.find((r: any) => r.id === this.data.activeRest.id)
    if (rest) {
      const profile = getUserProfile()
      const nick = profile.nick || '美食家'
      const member = (rest.members || []).find((m: Member) => m.nickname === nick)
      if (member) member.online = false
      saveRestaurants(rests)
    }
    this.setData({ showInterior: false })
    this.refreshAll()
  },

  setMemberOnline(online: boolean) {
    const rests = getRestaurants()
    const rest = rests.find((r: any) => r.id === this.data.activeRest.id)
    if (!rest) return
    const profile = getUserProfile()
    const nick = profile.nick || '美食家'
    const member = (rest.members || []).find((m: Member) => m.nickname === nick)
    if (member) {
      member.online = online
      saveRestaurants(rests)
    }
  },

  // ===== 加入餐厅（选鸟+选座+选配饰） =====
  openJoinRest() {
    const profile = getUserProfile()
    this.setData({
      showJoinRest: true, joinCode: '',
      showBirdPicker: true, selectedBird: '32x32x1',
      joinNickname: profile.nick || '美食家',
      selectedSeat: 0, availableSeats: [],
      selectedAccessory: '',
      selectedSoulColor: randomSoulColor(),
      isMystery: false
    })
  },
  closeJoinRest() { this.setData({ showJoinRest: false, showBirdPicker: false }) },
  toggleMystery() { this.setData({ isMystery: !this.data.isMystery }) },

  onJoinCodeInput(e: any) { this.setData({ joinCode: e.detail.value }) },

  selectBird(e: any) {
    this.setData({ selectedBird: e.currentTarget.dataset.bird })
  },

  // 输入邀请码后检查可用座位
  checkAvailableSeats() {
    const input = (this.data.joinCode || '').trim().toUpperCase()
    if (!input || input.length < 6) return
    const rests = getRestaurants()
    const target = rests.find((r: any) => r.inviteCode === input)
    if (target) {
      const occupied = (target.members || []).map((m: Member) => m.seatIndex)
      const available = SEAT_POSITIONS.filter(s => s.id !== 4 && !occupied.includes(s.id)).map(s => s.id)
      this.setData({ availableSeats: available, selectedSeat: available.length > 0 ? available[0] : 0 })
    }
  },

  selectSeat(e: any) {
    this.setData({ selectedSeat: parseInt(e.currentTarget.dataset.seat) })
  },

  selectAccessory(e: any) {
    this.setData({ selectedAccessory: e.currentTarget.dataset.acc })
  },

  selectSoulColor(e: any) {
    this.setData({ selectedSoulColor: e.currentTarget.dataset.color })
  },

  // 换装（在内部空间）
  toggleAccessoryPick() { this.setData({ showAccessoryPick: !this.data.showAccessoryPick, showColorPick: false }) },
  toggleColorPick() { this.setData({ showColorPick: !this.data.showColorPick, showAccessoryPick: false }) },

  changeAccessory(e: any) {
    const acc = e.currentTarget.dataset.acc
    const rests = getRestaurants()
    const rest = rests.find((r: any) => r.id === this.data.activeRest.id)
    if (!rest) return
    const profile = getUserProfile()
    const nick = profile.nick || '美食家'
    const member = (rest.members || []).find((m: Member) => m.nickname === nick)
    if (member) member.accessory = acc
    saveRestaurants(rests)
    this.setData({ selectedAccessory: acc, showAccessoryPick: false })
    this.enterInterior()
  },

  changeSoulColor(e: any) {
    const color = e.currentTarget.dataset.color
    const rests = getRestaurants()
    const rest = rests.find((r: any) => r.id === this.data.activeRest.id)
    if (!rest) return
    const profile = getUserProfile()
    const nick = profile.nick || '美食家'
    const member = (rest.members || []).find((m: Member) => m.nickname === nick)
    if (member) member.soulColor = color
    saveRestaurants(rests)
    this.setData({ selectedSoulColor: color, showColorPick: false })
    this.enterInterior()
  },

  confirmJoinRest() {
    const input = (this.data.joinCode || '').trim().toUpperCase()
    if (!input) { wx.showToast({ title: '请输入邀请码', icon: 'none' }); return }
    const rests = getRestaurants()
    let target = rests.find((r: any) => r.inviteCode === input)
    if (!target) {
      // 本地没有，查云端
      const app = getApp<IAppOption>()
      if (!app.globalData.cloudOnline) {
        wx.showModal({
          title: '离线模式',
          content: '当前为离线模式，只能加入本机已有的餐厅。\n\n💡 在同一台手机上：\n1. 切换到"店主"角色创建餐厅\n2. 获得邀请码\n3. 切换回"食客"输入邀请码即可',
          showCancel: false, confirmText: '知道了'
        })
        return
      }
      wx.showLoading({ title: '云端查找...' })
      wx.cloud.callContainer({
        config: { env: 'prod-d0g68hmay4c8d10e3' },
        path: '/api/restaurants/by-code/' + encodeURIComponent(input),
        header: { 'X-WX-SERVICE': 'express-rtm4' },
        method: 'GET',
        timeout: 8000,
        success: (res: any) => {
          wx.hideLoading()
          if (res.data?.code === 0 && res.data.data) {
            const cloudRest = res.data.data
            // 构造成本地格式
            const r: Restaurant = {
              id: cloudRest.id,
              name: cloudRest.name,
              description: cloudRest.description || '',
              owner: true, // 原始店
              menu: [],
              members: (cloudRest.members || []).map((m: any) => ({
                nickname: m.nickname, birdType: m.bird_type || '32x32x1',
                online: false, joinedAt: m.joined_at || '', seatIndex: m.seat_index || 0,
                accessory: m.accessory || '', soulColor: m.soul_color || randomSoulColor()
              })),
              inviteCode: cloudRest.invite_code || '',
              codeExpire: cloudRest.code_expire || 0
            }
            this.doJoinRest(rests, r)
          } else {
            wx.showToast({ title: '邀请码无效', icon: 'none' })
          }
        },
        fail: () => {
          wx.hideLoading()
          wx.showModal({
            title: '云端不可达',
            content: '真机调试时云托管未发布，跨设备功能不可用。\n\n💡 单设备测试：在同一台手机上，店主创建餐厅后，切换到"食客"角色，输入邀请码即可体验完整流程。',
            showCancel: false, confirmText: '知道了'
          })
        }
      })
      return
    }
    // 邀请码有效期24小时
    if (target.codeExpire && Date.now() > target.codeExpire) {
      wx.showToast({ title: '邀请码已过期，请联系店主刷新~', icon: 'none' }); return
    }
    if (target.owner) {
      this.doJoinRest(rests, target)
    }
  },

  doJoinRest(rests: Restaurant[], target: Restaurant) {
    if (target.owner) {
      const isOwn = target.id === this.data.activeRest?.id
      if (!isOwn) {
        const joined = rests.filter((r: any) => !r.owner)
        if (joined.length >= 3) { wx.showToast({ title: '最多加入3个', icon: 'none' }); return }
        if (rests.find((r: any) => !r.owner && r.originalId === target.id)) {
          wx.showToast({ title: '已加入过了', icon: 'none' }); return
        }
      }

      const profile = getUserProfile()
      const nick = this.data.isMystery ? '神秘食客' : (profile.nick || '美食家')
      const seatIdx = isOwn ? 4 : this.data.selectedSeat

      // 在原餐厅添加成员（跳过重复检查，允许店主以食客身份加入）
      if (!target.members) target.members = []
      if (!target.members.find((m: any) => m.nickname === nick)) {
        target.members.push({
          nickname: nick,
          birdType: this.data.selectedBird,
          birdColor: (BIRD_TYPES.find((b: any) => b.key === this.data.selectedBird) || {} as any).color || '#639bff',
          online: true,
          joinedAt: new Date().toISOString(),
          seatIndex: seatIdx,
          accessory: this.data.selectedAccessory,
          soulColor: this.data.selectedSoulColor
        })
      }

      // 创建"已加入"副本（食客视角用）
      const joinedRest: Restaurant = {
        id: generateId(), name: target.name, owner: false,
        description: target.description || '',
        originalId: target.id, menu: target.menu,
        members: [{
          nickname: nick,
          birdType: this.data.selectedBird,
          birdColor: (BIRD_TYPES.find((b: any) => b.key === this.data.selectedBird) || {} as any).color || '#639bff',
          online: true,
          joinedAt: new Date().toISOString(),
          seatIndex: seatIdx,
          accessory: this.data.selectedAccessory,
          soulColor: this.data.selectedSoulColor
        }],
        inviteCode: target.inviteCode || '',
        codeExpire: 0
      }
      rests.push(joinedRest)

      // 从云端拉取菜单
      if (target.inviteCode) {
        api.getRestaurantMenu(target.inviteCode).then((menu: any[]) => {
          if (menu && menu.length > 0) {
            target.menu = menu.map((m: any) => ({
              recipeId: m.recipe_id, name: m.name, price: m.price,
              emoji: m.emoji, onShelf: !!m.on_shelf
            }))
            saveRestaurants(rests)
            this.refreshAll()
          }
        }).catch(() => {})
      }

      saveRestaurants(rests)
      const newIdx = rests.length - 1
      const newRole = isOwn ? 'customer' : this.data.role
      this.setData({ showJoinRest: false, joinCode: '', showBirdPicker: false, activeRestIdx: newIdx >= 0 ? newIdx : 0, role: newRole })
      this.refreshAll()

      const seatLabel = SEAT_POSITIONS.find(s => s.id === seatIdx)?.label || ''
      const joinMsg = isOwn
        ? '您成功作为食客加入自己的店，可以体验点单功能啦~'
        : '尊驾已落座' + target.name + '【' + seatLabel + '】'
      this.setData({ showToast: true, toastMsg: joinMsg, toastColor: '#ffa3cb' })
      setTimeout(() => { this.setData({ showToast: false }) }, 3000)

      this.setData({ showWelcome: true, welcomeMsg: '欢迎老吃家 ' + nick + ' 大家光临！' })
      setTimeout(() => { this.setData({ showWelcome: false }) }, 10500)
    }
  },

  // ===== 换座 =====
  switchSeat(e: any) {
    const newSeat = parseInt(e.currentTarget.dataset.seat)
    if (isNaN(newSeat)) return
    // 主座(4)只有店主能坐
    const rests = getRestaurants()
    const rest = rests.find((r: any) => r.id === this.data.activeRest.id)
    if (!rest) return
    const profile = getUserProfile()
    const nick = profile.nick || '美食家'
    const isOwner = rest.owner && (nick === (rest.members || []).find((m: Member) => m.seatIndex === 4)?.nickname || rest.owner)

    // 检查该座是否已被占
    const occupied = (rest.members || []).find((m: Member) => m.seatIndex === newSeat)
    if (occupied) {
      wx.showToast({ title: '此席位已经有尊臀落座啦~', icon: 'none' })
      return
    }

    // 主座只允许店主
    if (newSeat === 4 && !isOwner) {
      wx.showToast({ title: '这是店主专座~', icon: 'none' })
      return
    }

    const member = (rest.members || []).find((m: Member) => m.nickname === nick)
    if (!member) {
      wx.showToast({ title: '请先进店~', icon: 'none' })
      return
    }

    const oldSeat = member.seatIndex
    member.seatIndex = newSeat
    saveRestaurants(rests)

    // 重建座位表
    const seatMap = SEAT_POSITIONS.map(seat => {
      const m = (rest.members || []).find((mb: Member) => mb.seatIndex === seat.id) || null
      return { seatId: seat.id, label: seat.label, member: m, isOwner: seat.id === 4 }
    })

    const onlineCount = (rest.members || []).filter((m: Member) => m.online).length
    this.setData({
      seatMap,
      activeRest: rest,
      statusOnline: onlineCount,
      statusOffline: (rest.members || []).length - onlineCount,
      statusMembers: rest.members || []
    })
    this.setData({ seatToast: '已搬到新座位~' })
    setTimeout(() => { this.setData({ seatToast: '' }) }, 2500)
  },

  // ===== 踢出食客 =====
  kickMember(e: any) {
    const nick = e.currentTarget.dataset.nick
    wx.showModal({
      title: '踢出食客',
      content: '确定要将「' + nick + '」踢出餐厅吗？踢出后需要重新加入。',
      confirmColor: '#f85149',
      success: (res: any) => {
        if (!res.confirm) return
        const rests = getRestaurants()
        const rest = rests.find((r: any) => r.id === this.data.activeRest.id)
        if (!rest) return
        rest.members = (rest.members || []).filter((m: any) => m.nickname !== nick)
        // 同时删除该食客加入的本店副本
        const joinedIdx = rests.findIndex((r: any) => !r.owner && r.originalId === rest.id && (r.members || []).some((m: any) => m.nickname === nick))
        if (joinedIdx >= 0) rests.splice(joinedIdx, 1)
        saveRestaurants(rests)
        this.refreshAll()
        wx.showToast({ title: '已踢出 ' + nick, icon: 'none' })
      }
    })
  },

  // ===== 食客主动退出 =====
  leaveRestaurant() {
    const rests = getRestaurants()
    const rest = rests.find((r: any) => r.id === this.data.activeRest.id)
    if (!rest || rest.owner) return
    const profile = getUserProfile()
    const nick = profile.nick || '美食家'
    wx.showModal({
      title: '退出餐厅',
      content: '确定要退出「' + rest.name + '」吗？',
      confirmColor: '#f85149',
      success: (res: any) => {
        if (!res.confirm) return
        // 从本店移除自己
        const idx = rests.findIndex((r: any) => r.id === rest.id)
        if (idx >= 0) rests.splice(idx, 1)
        // 也从原店移除自己的成员记录
        if (rest.originalId) {
          const original = rests.find((r: any) => r.id === rest.originalId)
          if (original && original.members) {
            original.members = original.members.filter((m: any) => m.nickname !== nick)
          }
        }
        saveRestaurants(rests)
        this.setData({ activeRestIdx: 0 })
        this.refreshAll()
        wx.showToast({ title: '已退出餐厅', icon: 'none' })
      }
    })
  },

  closeWelcome() { this.setData({ showWelcome: false }) },

  // ===== 餐厅详情 =====
  openRestDetail() { this.setData({ showRestDetail: true }) },
  closeRestDetail() { this.setData({ showRestDetail: false }) },

  // ===== 上架管理 =====
  openShelf() {
    let recipes = getRecipes().filter((r: any) => !r.draft)
    // 如果没有DIY菜谱，拉公共菜谱
    if (recipes.length === 0) {
      recipes = PUBLIC_RECIPES.map((r: any, i: number) => ({ ...r, id: 10000 + i }))
    }
    const menu = this.data.activeRest?.menu || []
    const ids = menu.map((m: any) => m.recipeId)
    this.setData({ showShelf: true, shelfSearch: '', diyRecipes: recipes.map((r: any) => ({ ...r, onShelf: ids.includes(r.id) })) })
  },
  closeShelf() { this.setData({ showShelf: false, shelfSearch: '' }); this.refreshAll() },
  onShelfSearch(e: any) { this.setData({ shelfSearch: e.detail.value }) },
  doShelfSearch() {
    const kw = this.data.shelfSearch.trim().toLowerCase()
    const recipes = getRecipes().filter((r: any) => !r.draft && r.name.toLowerCase().includes(kw))
    const menu = this.data.activeRest?.menu || []
    const ids = menu.map((m: any) => m.recipeId)
    this.setData({ diyRecipes: recipes.map((r: any) => ({ ...r, onShelf: ids.includes(r.id) })) })
  },

  unshelfFromMenu(e: any) {
    const recipeId = Number(e.currentTarget.dataset.id)
    const rests = getRestaurants()
    const rest = rests[this.data.activeRestIdx]
    if (!rest || !rest.menu) return
    rest.menu = rest.menu.filter((m: any) => m.recipeId !== recipeId)
    saveRestaurants(rests)
    api.removeRestaurantMenu(rest.inviteCode, recipeId).catch(() => {})
    this.refreshAll()
    wx.showToast({ title: '已下架', icon: 'none' })
  },

  toggleShelfRecipe(e: any) {
    const recipeId = Number(e.currentTarget.dataset.id)
    const rests = getRestaurants()
    const rest = rests[this.data.activeRestIdx]
    if (!rest) return
    if (!rest.menu) rest.menu = []
    const idx = rest.menu.findIndex((m: any) => m.recipeId === recipeId)
    if (idx >= 0) {
      rest.menu.splice(idx, 1)
      api.removeRestaurantMenu(rest.inviteCode, recipeId).catch(() => {})
    } else {
      const r = this.data.diyRecipes.find((r: any) => r.id === recipeId)
      if (r) {
        rest.menu.push({ recipeId: r.id, name: r.name, price: r.price, emoji: r.coverEmoji, onShelf: true })
        api.addRestaurantMenu(rest.inviteCode, { recipeId: r.id, name: r.name, price: r.price, emoji: r.coverEmoji }).catch(() => {})
      }
    }
    saveRestaurants(rests)
    const updated = this.data.diyRecipes.map((r: any) => ({ ...r, onShelf: r.id === recipeId ? !r.onShelf : r.onShelf }))
    this.setData({ diyRecipes: updated })
  },

  // ===== 点餐 =====
  toggleOrderItem(e: any) {
    const id = Number(e.currentTarget.dataset.id)
    this.setData({ menuAll: this.data.menuAll.map((m: any) => m.recipeId === id ? { ...m, ordered: !m.ordered } : m) })
  },

  submitOrder() {
    if (this.data.submitting) return
    if (this.data.activeRest?.closed) {
      wx.showModal({ title: '⚠️', content: '您所在的餐厅已被该店店主删除！', showCancel: false, confirmText: '知道了' })
      return
    }
    const ordered = this.data.menuAll.filter((m: any) => m.ordered)
    if (ordered.length === 0) { wx.showToast({ title: '请先选择菜品', icon: 'none' }); return }
    this.setData({ submitting: true })
    const items = ordered.map((m: any) => m.name).join('、')
    const restId = this.data.activeRest.originalId || this.data.activeRest.id
    const order: Order = {
      id: generateId(), restaurantId: restId, restaurantName: this.data.activeRest.name,
      items, itemList: ordered.map((m: any) => ({ recipeId: m.recipeId, name: m.name, price: m.price, emoji: m.emoji })),
      status: 'pending', customer: '我', createdAt: new Date().toISOString(),
    }
    const orders = getOrders(); orders.unshift(order); saveOrders(orders)
    // 同步到云端
    api.createOrder({
      restaurant_id: this.data.activeRest.inviteCode,
      restaurant_name: this.data.activeRest.name,
      customer_name: order.customer,
      items: order.items,
      item_list: order.itemList,
      status: 'pending'
    }).then((res: any) => {
      if (res?.id) {
        order.cloudId = res.id
        saveOrders(orders)
      }
    }).catch(() => {})
    this.setData({ menuAll: this.data.menuAll.map((m: any) => ({ ...m, ordered: false })), submitting: false })
    this.refreshAll()
    wx.showToast({ title: '下单成功！等待店主接单...', icon: 'success' })
  },

  // ===== 订单管理 =====
  acceptOrder(e: any) {
    const id = Number(e.currentTarget.dataset.id)
    this.updateOrder(id, 'cooking', '制作中...')
    this.showCustomToast('已接单，制作中...', '#7ee787')
  },
  finishOrder(e: any) {
    const id = Number(e.currentTarget.dataset.id)
    this.updateOrder(id, 'done')
    const r = this.data.role
    this.showCustomToast(r === 'owner' ? '恭喜您，订单完成啦！' : '佳肴已做好，请您尽情享用吧~', '#e3b341')
  },
  rejectOrder(e: any) {
    const id = Number(e.currentTarget.dataset.id)
    const msg = this.data.rejectMsgs[Math.floor(Math.random() * this.data.rejectMsgs.length)]
    const that = this
    wx.showModal({
      title: '拒单', content: '确定拒绝吗？',
      success: (res: any) => {
        if (res.confirm) {
          that.updateOrder(id, 'rejected')
          that.showCustomToast(msg, '#f85149')
        }
      }
    })
  },
  updateOrder(id: number, status: string, time?: string) {
    const orders = getOrders()
    const idx = orders.findIndex((o: any) => o.id === id)
    if (idx >= 0) {
      orders[idx].status = status as any
      if (time) orders[idx].time = time
      saveOrders(orders)
      // 同步状态到云端
      if (orders[idx].cloudId) {
        api.updateOrder(orders[idx].cloudId, { status }).catch(() => {})
      }
    }
    this.refreshAll()
  },

  showCustomToast(msg: string, color: string) {
    this.setData({ showToast: true, toastMsg: msg, toastColor: color })
    setTimeout(() => { this.setData({ showToast: false }) }, 2500)
  },
  closeToast() { this.setData({ showToast: false }) },

  checkRestClosed(): boolean {
    const rest = this.data.activeRest
    if (rest && rest.closed) {
      wx.showModal({
        title: '该餐厅已闭店~',
        content: '店主已关闭了这家温暖的餐厅。',
        confirmText: '不再怀念',
        cancelText: '留作纪念',
        confirmColor: '#f85149',
        success: (res: any) => {
          if (res.confirm) {
            const rests = getRestaurants().filter((r: any) => r.id !== rest.id && r.originalId !== rest.id)
            saveRestaurants(rests)
            this.refreshAll()
          }
        }
      })
      return true
    }
    return false
  },

  rateOrder(e: any) {
    this.setData({ showRateModal: true, rateOrderId: e.currentTarget.dataset.id, rateStars: 5, rateText: '' })
  },
  closeRateModal() { this.setData({ showRateModal: false }) },
  skipRating() {
    const orders = getOrders()
    const idx = orders.findIndex((o: any) => o.id === this.data.rateOrderId)
    if (idx >= 0) {
      orders[idx].rating = -1 // -1 表示拒评
      orders[idx].review = ''
      orders[idx].reviewFeatured = false
      // 添加店主端聊天记录
      if (!orders[idx].chat) orders[idx].chat = []
      orders[idx].chat.push({
        txt: '呦呵！您的厨艺可能赛东坡呀~您亲爱的食客拒绝点评~宫廷御厨都比不上您！订单结束啦！',
        from: 'owner', time: new Date().toLocaleTimeString()
      })
      if (orders[idx].cloudId) api.updateOrder(orders[idx].cloudId, { status: 'done', rating: -1 }).catch(() => {})
      saveOrders(orders)
    }
    this.closeRateModal()
    this.refreshAll()
    this.showCustomToast('订单结束啦！亲亲欢迎下次再来小馆呦~~', '#ffb37c')
  },
  urgeRating(e: any) {
    const id = Number(e.currentTarget.dataset.id)
    const orders = getOrders()
    const idx = orders.findIndex((o: any) => o.id === id)
    if (idx >= 0) {
      if (orders[idx].ownerUrged) {
        this.showCustomToast('您已催评价八百次啦~赶火车都没您嘿嘿~', '#f85149')
        return
      }
      orders[idx].ownerUrged = true
      // 添加聊天记录
      if (!orders[idx].chat) orders[idx].chat = []
      const profile = getUserProfile()
      orders[idx].chat.push({
        txt: '已向食客催评价',
        from: 'owner',
        time: new Date().toLocaleTimeString()
      })
      orders[idx].chat.push({
        txt: (profile.nick || '店主') + ' 大店主邀请您老吃家评价菜肴啦~~',
        from: 'customer',
        time: new Date().toLocaleTimeString()
      })
      saveOrders(orders)
      // 同步到云端
      if (orders[idx].cloudId) api.updateOrder(orders[idx].cloudId, { status: 'done', urge_count: (orders[idx].urgeCount || 0) + 1 }).catch(() => {})
    }
    this.refreshAll()
    this.showCustomToast('已催促食客评价~', '#ffb37c')
  },
  setRateStars(e: any) { this.setData({ rateStars: parseFloat(e.currentTarget.dataset.star) }) },
  onRateTextInput(e: any) { this.setData({ rateText: e.detail.value }) },
  submitRating() {
    const orders = getOrders()
    const idx = orders.findIndex((o: any) => o.id === this.data.rateOrderId)
    if (idx >= 0) {
      orders[idx].rating = this.data.rateStars
      orders[idx].review = this.data.rateText.trim()
      orders[idx].reviewFeatured = false
      if (orders[idx].cloudId) api.updateOrder(orders[idx].cloudId, { status: 'done', rating: this.data.rateStars, review: this.data.rateText.trim() }).catch(() => {})
      saveOrders(orders)
    }
    this.updateAvgRating()
    this.closeRateModal()
    this.refreshAll()
    this.showCustomToast('评价成功！欢迎下次再来！', '#7ee787')
  },
  updateAvgRating() {
    const orders = getOrders().filter((o: any) => o.restaurantId === this.data.activeRest?.id && o.rating)
    if (orders.length === 0) { this.setData({ avgRating: '--' }); return }
    const avg = orders.reduce((s: number, o: any) => s + o.rating, 0) / orders.length
    this.setData({ avgRating: avg.toFixed(1) })
  },
  toggleFeatured(e: any) {
    const oid = Number(e.currentTarget.dataset.id)
    const orders = getOrders()
    const idx = orders.findIndex((o: any) => o.id === oid)
    if (idx >= 0) { orders[idx].reviewFeatured = !orders[idx].reviewFeatured; saveOrders(orders); this.refreshAll() }
  },
  rateOrder_old(e: any) {
    const id = Number(e.currentTarget.dataset.id)
    wx.showActionSheet({
      itemList: ['⭐', '⭐⭐', '⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐⭐⭐⭐'],
      success: (res: any) => {
        const orders = getOrders()
        const idx = orders.findIndex((o: any) => o.id === id)
        if (idx >= 0) { orders[idx].rating = res.tapIndex + 1; saveOrders(orders); this.refreshAll() }
        wx.showToast({ title: '已评价', icon: 'success' })
      }
    })
  },
  viewOrderDetail(e: any) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: '/pages/order-detail/order-detail?id=' + id + '&role=' + this.data.role })
  },
  filterOrdersByRest(e: any) {
    const restId = parseInt(e.currentTarget.dataset.id)
    const allRests = getRestaurants()
    const filtered = getOrders().filter((o: any) => {
      const rest = allRests.find((r: any) => r.id === restId)
      return rest && (o.restaurantId === rest.id || o.restaurantId === (rest.originalId || rest.id))
    })
    this.setData({ orderRestFilter: restId, orders: filtered, orderFilter: 'all', filteredOrders: filtered })
  },

  filterOrders(e: any) {
    const f = e.currentTarget.dataset.filter
    const orders = this.data.orders
    let filtered = orders
    if (f === 'all') filtered = orders
    else if (f === 'pending') filtered = orders.filter((o: any) => o.status === 'pending')
    else if (f === 'cooking') filtered = orders.filter((o: any) => o.status === 'cooking')
    else if (f === 'rating') filtered = orders.filter((o: any) => o.status === 'done' && !o.rating)
    else if (f === 'done') filtered = orders.filter((o: any) => (o.status === 'done' && o.rating) || o.status === 'rejected')
    this.setData({ orderFilter: f, filteredOrders: filtered })
  },

  // ===== 感受分享 =====
  openNewFeed() {
    const rests = getRestaurants()
    const r = this.data.role
    const feedRestList = r === 'owner' ? rests.filter((x: any) => x.owner) : rests.filter((x: any) => !x.owner)
    this.setData({
      showNewFeed: true, feedContent: '', feedImages: [],
      feedIsTimePublic: true, feedShowLocation: true,
      feedIsLocationPublic: true, feedCustomLocation: '', feedLocation: '', feedLocPrecision: 'exact',
      feedIdentity: 'role', feedRestId: feedRestList[0]?.id || 0, feedRestList,
    })
  },
  pickFeedIdentity(e: any) { this.setData({ feedIdentity: e.currentTarget.dataset.id }) },
  setFeedVisibility(e: any) { this.setData({ feedVisibility: e.currentTarget.dataset.v }) },
  pickFeedRest(e: any) { this.setData({ feedRestId: parseInt(e.currentTarget.dataset.id) }) },
  closeNewFeed() { this.setData({ showNewFeed: false }) },
  onFeedInput(e: any) { this.setData({ feedContent: e.detail.value }) },
  async addFeedImage() {
    try { const paths = await chooseImage(3); this.setData({ feedImages: [...this.data.feedImages, ...paths].slice(0, 9) }) } catch (e) { }
  },
  removeFeedImage(e: any) {
    const i = e.currentTarget.dataset.index
    this.setData({ feedImages: this.data.feedImages.filter((_: any, idx: number) => idx !== i) })
  },
  toggleVisibility() {
    const opts = this.data.feedVisibilityOptions
    const i = opts.indexOf(this.data.feedVisibility)
    this.setData({ feedVisibility: opts[(i + 1) % opts.length] })
  },
  toggleLocPrecision() {
    this.setData({ feedLocPrecision: this.data.feedLocPrecision === 'exact' ? 'fuzzy' : 'exact' })
    this.updateFeedLocDisplay()
  },
  getVisLabel(v: string) { const m: any = { all: '🌐 公开', restaurant: '🏪 餐厅', self: '🔒 仅自己' }; return m[v] || v },
  setFeedFilter(e: any) { this.setData({ feedFilter: e.currentTarget.dataset.f }); this.refreshAll() },
  filterFeeds(feeds: any[]) {
    const f = this.data.feedFilter
    if (f === 'all') return feeds
    if (f === 'public') return feeds.filter((x: any) => x.visibility === 'all')
    if (f === 'restaurant') return feeds.filter((x: any) => x.visibility === 'restaurant' && x.restaurantName === this.data.activeRest?.name)
    if (f === 'self') return feeds.filter((x: any) => x.visibility === 'self')
    return feeds
  },

  formatFeedTime(ts: number): string {
    if (!ts) return ''
    const diff = Date.now() - ts
    if (diff < 60000) return '刚刚'
    if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
    if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
    if (diff < 604800000) return Math.floor(diff / 86400000) + '天前'
    const d = new Date(ts)
    return d.getFullYear() + '.' + String(d.getMonth() + 1).padStart(2, '0') + '.' + String(d.getDate()).padStart(2, '0')
  },

  toggleFeedTimePublic(e: any) { this.setData({ feedIsTimePublic: e.detail.value }) },

  toggleFeedLocationMode(e: any) {
    const mode = e.currentTarget.dataset.m
    if (mode === 'public') {
      this.setData({ feedShowLocation: true, feedIsLocationPublic: true })
      this.getFeedLocation()
    } else if (mode === 'custom') {
      this.setData({ feedShowLocation: true, feedIsLocationPublic: false })
    } else {
      this.setData({ feedShowLocation: false })
    }
  },

  onFeedCustomLocation(e: any) { this.setData({ feedCustomLocation: e.detail.value }) },

  getFeedLocation() {
    const that = this
    wx.chooseLocation({
      success(res) {
        const loc = res.address || res.name || '已选位置'
        const lng = res.longitude || 0
        const lat = res.latitude || 0
        that.setData({
          feedLocation: loc, feedLocDisplay: loc,
          feedLng: lng, feedLat: lat,
          feedMarker: [{ id: 0, longitude: lng, latitude: lat, iconPath: '/sptites/menu.png', width: 30, height: 30 }]
        })
        wx.showToast({ title: '位置已选择', icon: 'success' })
      },
      fail() {
        wx.showToast({ title: '已取消', icon: 'none' })
      }
    })
  },
  previewFeedLocation() {
    const lat = this.data.feedLat, lng = this.data.feedLng
    if (lat && lng) {
      wx.openLocation({ latitude: lat, longitude: lng, name: this.data.feedLocation, scale: 14 })
    }
  },
  updateFeedLocDisplay() {
    const loc = this.data.feedLocation || ''
    const prec = this.data.feedLocPrecision
    this.setData({ feedLocDisplay: prec === 'exact' ? loc : (loc.length > 6 ? loc.slice(0,6)+'...附近' : loc) })
  },
  publishFeed() {
    if (!this.data.feedContent.trim() && this.data.feedImages.length === 0) {
      wx.showToast({ title: '请输入内容或添加图片', icon: 'none' }); return
    }
    const identity = this.data.feedIdentity === 'role' ? (this.data.role === 'owner' ? '👨‍🍳店主' : '🍽️食客') : this.data.feedIdentity
    const restName = this.data.feedRestId ? (this.data.feedRestList.find((r: any) => r.id === this.data.feedRestId)?.name || '') : ''
    const feed: Feed = {
      id: generateId(), content: this.data.feedContent.trim(), images: this.data.feedImages,
      restaurantName: this.data.feedVisibility === 'restaurant' ? restName : '',
      nickname: identity,
      posterRole: this.data.role,
      visibility: this.data.feedVisibility as 'all' | 'restaurant',
      createdAt: new Date().toISOString(), comments: [],
      createTime: Date.now(),
      isTimePublic: this.data.feedIsTimePublic,
      showLocation: this.data.feedShowLocation,
      isLocationPublic: this.data.feedIsLocationPublic,
      location: this.data.feedLocation,
      locPrecision: this.data.feedLocPrecision,
      customLocation: this.data.feedCustomLocation,
    }
    const feeds = getFeeds(); feeds.unshift(feed); saveFeeds(feeds)
    // 同步到云端
    api.createFeed({
      content: feed.content, images: feed.images, restaurant_name: feed.restaurantName,
      poster_role: feed.posterRole, visibility: feed.visibility,
      show_location: feed.showLocation, is_location_public: feed.isLocationPublic,
      location: feed.location, loc_precision: feed.locPrecision,
      custom_location: feed.customLocation, is_time_public: feed.isTimePublic
    }).catch(() => {})
    this.setData({
      showNewFeed: false, feedContent: '', feedImages: [],
      feedIsTimePublic: true, feedShowLocation: true,
      feedIsLocationPublic: true, feedCustomLocation: '', feedLocation: '', feedLocPrecision: 'exact', feeds,
    })
    wx.showToast({ title: '分享成功！', icon: 'success' })
  },

  // ===== 消息 =====
  openMsgModal(e: any) {
    this.setData({ showMsgModal: true, msgTargetId: Number(e.currentTarget.dataset.id), msgText: '', msgMode: 'owner' })
  },
  openUrgeModal(e: any) {
    this.setData({ showMsgModal: true, msgTargetId: Number(e.currentTarget.dataset.id), msgText: '', msgMode: 'customer' })
  },
  closeMsgModal() { this.setData({ showMsgModal: false, msgTargetId: 0, msgText: '' }) },
  onMsgInput(e: any) { this.setData({ msgText: e.detail.value.slice(0, 25) }) },
  sendPresetMsg(e: any) {
    const txt = e.currentTarget.dataset.txt
    const isUrge = this.data.msgMode === 'customer'
    this.saveChatMsg(txt, isUrge)
    wx.showToast({ title: '已发送', icon: 'success' })
    this.closeMsgModal()
  },
  sendCustomMsg() {
    const txt = this.data.msgText.trim()
    if (!txt) { wx.showToast({ title: '请先输入消息', icon: 'none' }); return }
    this.saveChatMsg(txt, false)
    wx.showToast({ title: '已发送', icon: 'success' })
    this.closeMsgModal()
  },
  saveChatMsg(txt: string, isUrge: boolean) {
    const orders = getOrders()
    const idx = orders.findIndex((o: any) => o.id === this.data.msgTargetId)
    if (idx < 0) return
    if (!orders[idx].chat) orders[idx].chat = []
    orders[idx].chat.push({ txt, from: this.data.role, time: new Date().toLocaleTimeString() })
    if (isUrge) { orders[idx].urgeCount = (orders[idx].urgeCount || 0) + 1 }
    saveOrders(orders)
    this.refreshAll()
  },
  deleteOrderChat(e: any) {
    const orderId = Number(e.currentTarget.dataset.id)
    const chatIdx = e.currentTarget.dataset.ci
    const orders = getOrders()
    const oi = orders.findIndex((o: any) => o.id === orderId)
    if (oi >= 0 && orders[oi].chat) { orders[oi].chat.splice(chatIdx, 1); saveOrders(orders); this.refreshAll() }
    wx.showToast({ title: '已删除', icon: 'none' })
  },

  // ===== 分享 =====
  openShareSheet() {
    this.setData({ showShareSheet: true, qrCodePath: '' })
    // 自动生成小程序码
    const rest = this.data.activeRest
    if (rest && rest.inviteCode && !this.data.qrCodePath) {
      this.setData({ generatingQR: true })
      generateQRCode(rest.inviteCode).then((path: string) => {
        this.setData({ qrCodePath: path, generatingQR: false })
      }).catch(() => {
        this.setData({ generatingQR: false })
      })
    }
  },
  closeShareSheet() { this.setData({ showShareSheet: false }) },
  refreshInviteCode() {
    const rests = getRestaurants()
    const rest = rests[this.data.activeRestIdx]
    if (!rest || !rest.owner) return
    rest.inviteCode = 'SG' + Date.now().toString(36).toUpperCase().slice(-8)
    rest.codeExpire = Date.now() + 86400000 // 24小时有效
    saveRestaurants(rests)
    this.refreshAll()
    wx.showToast({ title: '邀请码已刷新', icon: 'success' })
  },

  copyShareLink() {
    const rest = this.data.activeRest
    if (!rest) return
    const code = rest.inviteCode || ''
    wx.setClipboardData({
      data: code,
      success: () => wx.showToast({ title: '已复制：' + code, icon: 'success' })
    })
    this.closeShareSheet()
  },

  // 从云端查到的餐厅加入
  _joinByCloudRest(cloudRest: any, code: string) {
    const rests = getRestaurants()
    // 检查是否已经加入过
    const existing = rests.filter((r: any) => !r.owner)
    if (existing.find((r: any) => r.originalId === cloudRest.id)) {
      // 已加入，直接进入
      this.setData({ role: 'customer' })
      this.forceEnter()
      return
    }
    const occupied = (cloudRest.members || []).map((m: any) => m.seatIndex || m.seat_index)
    const freeSeats = SEAT_POSITIONS.filter((s: any) => s.id !== 4 && !occupied.includes(s.id)).map((s: any) => s.id)
    const autoSeat = freeSeats.length > 0 ? freeSeats[0] : 0
    this.setData({
      joinCode: code,
      selectedSeat: autoSeat,
      selectedBird: '32x32x1',
      selectedAccessory: '',
      selectedSoulColor: randomSoulColor(),
      isMystery: false
    })
    // 直接构建并加入
    const r: any = {
      id: cloudRest.id, name: cloudRest.name,
      description: cloudRest.description || '', owner: false,
      members: (cloudRest.members || []).map((m: any) => ({
        nickname: m.nickname, seatIndex: m.seat_index || 0, birdType: m.bird_type || '32x32x1',
        soulColor: m.soul_color || randomSoulColor(), online: false
      })),
      inviteCode: cloudRest.invite_code || code,
      originalId: cloudRest.id
    }
    this.doJoinRest(rests, r)
  },

  _scanBirdTargets() {
    var self = this;
    var q = wx.createSelectorQuery();
    q.selectAll('.card,.glass,.btn,.rest-card,.bench-seat,.interior-signboard,.online-badge,.search-bar,.chip').boundingClientRect();
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
