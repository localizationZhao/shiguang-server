// 餐厅页面
import { getRecipes, getRestaurants, saveRestaurants, getOrders, saveOrders, getFeeds, saveFeeds, getUserProfile, BIRD_TYPES, SEAT_POSITIONS, ACCESSORIES, randomSoulColor, SOUL_COLORS } from '../../utils/storage'
import { generateId, chooseImage } from '../../utils/util'
import { generateQRCode } from '../../utils/api'
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
    feedIsTimePublic: true,
    feedShowLocation: true,
    feedIsLocationPublic: true,
    feedCustomLocation: '',
    feedLocation: '',
    feedLocPrecision: 'exact',
    showShareSheet: false,
    showRestDetail: false,
    restDescription: '',
    orderFilter: 'all',
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

    // ===== 新增：配饰 =====
    accessories: ACCESSORIES,
    selectedAccessory: '',
    showAccessoryPick: false,

    // ===== 新增：灵魂色 =====
    soulColors: SOUL_COLORS,
    selectedSoulColor: SOUL_COLORS[0],
    showColorPick: false,

    // ===== 新增：小程序码 =====
    qrCodePath: '',
    generatingQR: false,

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

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 2 })
    }
    this.refreshAll()

    // 处理扫码进店
    const app = getApp<IAppOption>()
    if (app.globalData.pendingInviteCode) {
      const code = app.globalData.pendingInviteCode
      app.globalData.pendingInviteCode = ''
      // 自动分配空座
      const rests = getRestaurants()
      const target = rests.find((r: any) => r.inviteCode === code)
      if (target) {
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
      } else {
        this.setData({ joinCode: code })
      }
      setTimeout(() => { this.confirmJoinRest() }, 500)
    }
  },

  refreshAll() {
    const allRests = getRestaurants()
    const orders = getOrders()
    const feeds = getFeeds().map((f: any) => ({
      ...f, timeDisplay: f.isTimePublic ? this.computeTimeDisplay(f.createTime) : '时间都去哪了',
      locDisplay: f.showLocation ? (f.isLocationPublic ? (f.locPrecision === 'fuzzy' ? (f.location||'').slice(0,6)+'...附近' : f.location) : (f.customLocation || '神秘地点')) : '',
    }))
    const r = this.data.role
    const rests = r === 'owner' ? allRests.filter((x: any) => x.owner) : allRests
    const has = rests.length > 0
    const idx = this.data.activeRestIdx < rests.length ? this.data.activeRestIdx : 0
    const activeRest = has ? rests[idx] : null
    const menuAll = activeRest ? (activeRest.menu || []) : []
    const menu = menuAll.filter((m: any) => m.onShelf)
    const filteredOrders = activeRest ? orders.filter((o: any) => o.restaurantId === activeRest.id) : []
    this.setData({
      hasRestaurant: has, restaurants: rests, activeRest, menu, menuAll,
      orders: filteredOrders, feeds: this.filterFeeds(feeds), activeRestIdx: idx,
    })
    this.updateAvgRating()
  },

  computeTimeDisplay(ts: number): string {
    if (!ts) return ''
    const diff = Date.now() - ts
    if (diff < 60000) return '刚刚'
    if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
    if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
    if (diff < 604800000) return Math.floor(diff / 86400000) + '天前'
    const d = new Date(ts)
    return d.getFullYear() + '.' + String(d.getMonth()+1).padStart(2,'0') + '.' + String(d.getDate()).padStart(2,'0')
  },

  switchRest(e: any) {
    const idx = parseInt(e.currentTarget.dataset.index)
    this.setData({ activeRestIdx: idx, tab: 'menu' })
    this.refreshAll()
  },

  switchTab(e: any) {
    this.setData({ tab: e.currentTarget.dataset.tab })
  },

  switchRole() {
    const newRole = this.data.role === 'owner' ? 'customer' : 'owner'
    this.setData({ role: newRole, tab: 'menu', activeRestIdx: 0 })
    this.refreshAll()
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
    const rests = getRestaurants()
    const code = 'SG' + Date.now().toString(36).toUpperCase().slice(-8)
    const profile = getUserProfile()
    // 店主坐主座(4号)
    const ownerMember: Member = {
      nickname: profile.nick || '店主',
      birdType: '32x32x1',
      online: true,
      joinedAt: new Date().toISOString(),
      seatIndex: 4,
      accessory: '',
      soulColor: randomSoulColor()
    }
    rests.push({
      id: generateId(), name, owner: true,
      description: this.data.restDescription || '',
      menu: [], members: [ownerMember],
      inviteCode: code, codeExpire: Date.now() + 600000
    })
    saveRestaurants(rests)
    this.setData({ showCreateRest: false, restName: '', hasRestaurant: true, activeRestIdx: rests.length - 1 })
    this.refreshAll()
    wx.showToast({ title: '餐厅开业啦！邀请码：' + code, icon: 'success' })
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
          rests.splice(that.data.activeRestIdx, 1)
          saveRestaurants(rests)
          that.setData({ activeRestIdx: 0 })
          that.refreshAll()
          that.showCustomToast('餐厅已删除', '#f85149')
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
    this.setData({
      showStatus: true,
      statusMembers: members,
      statusOnline: online,
      statusOffline: offline
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
    const seatMap = SEAT_POSITIONS.map(seat => {
      const m = (rest.members || []).find((mb: Member) => mb.seatIndex === seat.id) || null
      return {
        seatId: seat.id,
        label: seat.label,
        member: m,
        isOwner: seat.id === 4  // 4号永远是主座
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
      statusMembers: rest.members || []
    })
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
      selectedSoulColor: randomSoulColor()
    })
  },
  closeJoinRest() { this.setData({ showJoinRest: false, showBirdPicker: false }) },

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
    if (!target) return
    const occupied = (target.members || []).map((m: Member) => m.seatIndex)
    const available = SEAT_POSITIONS.filter(s => s.id !== 4 && !occupied.includes(s.id)).map(s => s.id)
    this.setData({ availableSeats: available, selectedSeat: available.length > 0 ? available[0] : 0 })
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
    const target = rests.find((r: any) => r.inviteCode === input)
    if (!target) { wx.showToast({ title: '邀请码无效', icon: 'none' }); return }
    if (target.codeExpire && Date.now() > target.codeExpire) {
      wx.showToast({ title: '邀请码已过期，请联系店主刷新', icon: 'none' }); return
    }
    if (target.owner) {
      if (target.id === this.data.activeRest?.id) {
        wx.showToast({ title: '这是你自己的店', icon: 'none' }); return
      }
      const joined = rests.filter((r: any) => !r.owner)
      if (joined.length >= 3) { wx.showToast({ title: '最多加入3个', icon: 'none' }); return }
      if (rests.find((r: any) => !r.owner && r.originalId === target.id)) {
        wx.showToast({ title: '已加入过了', icon: 'none' }); return
      }

      const profile = getUserProfile()
      const nick = profile.nick || '美食家'
      const seatIdx = this.data.selectedSeat

      // 创建"已加入"副本
      const joinedRest: Restaurant = {
        id: generateId(), name: target.name, owner: false,
        description: target.description || '',
        originalId: target.id, menu: target.menu,
        members: [{
          nickname: nick,
          birdType: this.data.selectedBird,
          online: true,
          joinedAt: new Date().toISOString(),
          seatIndex: seatIdx,
          accessory: this.data.selectedAccessory,
          soulColor: this.data.selectedSoulColor
        }],
        inviteCode: '',
        codeExpire: 0
      }
      rests.push(joinedRest)

      // 在原餐厅也添加成员
      if (!target.members) target.members = []
      target.members.push({
        nickname: nick,
        birdType: this.data.selectedBird,
        online: true,
        joinedAt: new Date().toISOString(),
        seatIndex: seatIdx,
        accessory: this.data.selectedAccessory,
        soulColor: this.data.selectedSoulColor
      })

      saveRestaurants(rests)
      this.setData({ showJoinRest: false, joinCode: '', showBirdPicker: false, activeRestIdx: rests.length - 1 })
      this.refreshAll()

      const seatLabel = SEAT_POSITIONS.find(s => s.id === seatIdx)?.label || ''
      this.setData({ showToast: true, toastMsg: '尊驾已落座' + target.name + '【' + seatLabel + '】', toastColor: '#ffa3cb' })
      setTimeout(() => { this.setData({ showToast: false }) }, 3000)

      this.setData({ showWelcome: true, welcomeMsg: '欢迎老吃家 ' + nick + ' 大家光临~' })
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
    wx.showToast({ title: '已搬到新座位~', icon: 'success' })
  },

  closeWelcome() { this.setData({ showWelcome: false }) },

  // ===== 餐厅详情 =====
  openRestDetail() { this.setData({ showRestDetail: true }) },
  closeRestDetail() { this.setData({ showRestDetail: false }) },

  // ===== 上架管理 =====
  openShelf() {
    const recipes = getRecipes().filter((r: any) => !r.draft)
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
    const recipeId = e.currentTarget.dataset.id
    const rests = getRestaurants()
    const rest = rests[this.data.activeRestIdx]
    if (!rest || !rest.menu) return
    rest.menu = rest.menu.filter((m: any) => m.recipeId !== recipeId)
    saveRestaurants(rests)
    this.refreshAll()
    wx.showToast({ title: '已下架', icon: 'none' })
  },

  toggleShelfRecipe(e: any) {
    const recipeId = e.currentTarget.dataset.id
    const rests = getRestaurants()
    const rest = rests[this.data.activeRestIdx]
    if (!rest) return
    if (!rest.menu) rest.menu = []
    const idx = rest.menu.findIndex((m: any) => m.recipeId === recipeId)
    if (idx >= 0) { rest.menu.splice(idx, 1) }
    else {
      const r = this.data.diyRecipes.find((r: any) => r.id === recipeId)
      if (r) rest.menu.push({ recipeId: r.id, name: r.name, price: r.price, emoji: r.coverEmoji, onShelf: true })
    }
    saveRestaurants(rests)
    const updated = this.data.diyRecipes.map((r: any) => ({ ...r, onShelf: r.id === recipeId ? !r.onShelf : r.onShelf }))
    this.setData({ diyRecipes: updated })
  },

  // ===== 点餐 =====
  toggleOrderItem(e: any) {
    const id = e.currentTarget.dataset.id
    this.setData({ menuAll: this.data.menuAll.map((m: any) => m.recipeId === id ? { ...m, ordered: !m.ordered } : m) })
  },

  submitOrder() {
    const ordered = this.data.menuAll.filter((m: any) => m.ordered)
    if (ordered.length === 0) { wx.showToast({ title: '请先选择菜品', icon: 'none' }); return }
    const items = ordered.map((m: any) => m.name).join('、')
    const order: Order = {
      id: generateId(), restaurantId: this.data.activeRest.id, restaurantName: this.data.activeRest.name,
      items, itemList: ordered.map((m: any) => ({ recipeId: m.recipeId, name: m.name, price: m.price, emoji: m.emoji })),
      status: 'pending', customer: '我', createdAt: new Date().toISOString(),
    }
    const orders = getOrders(); orders.unshift(order); saveOrders(orders)
    this.setData({ menuAll: this.data.menuAll.map((m: any) => ({ ...m, ordered: false })) })
    this.refreshAll()
    wx.showToast({ title: '下单成功！', icon: 'success' })
  },

  // ===== 订单管理 =====
  acceptOrder(e: any) {
    const id = e.currentTarget.dataset.id
    this.updateOrder(id, 'cooking', '制作中...')
    this.showCustomToast('已接单，开始制作！', '#7ee787')
  },
  finishOrder(e: any) {
    const id = e.currentTarget.dataset.id
    this.updateOrder(id, 'done')
    const r = this.data.role
    this.showCustomToast(r === 'owner' ? '恭喜您，订单完成啦！' : '佳肴已做好，请您尽情享用吧~', '#e3b341')
  },
  rejectOrder(e: any) {
    const id = e.currentTarget.dataset.id
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
    if (idx >= 0) { orders[idx].status = status as any; if (time) orders[idx].time = time; saveOrders(orders) }
    this.refreshAll()
  },

  showCustomToast(msg: string, color: string) {
    this.setData({ showToast: true, toastMsg: msg, toastColor: color })
    setTimeout(() => { this.setData({ showToast: false }) }, 2500)
  },
  closeToast() { this.setData({ showToast: false }) },

  rateOrder(e: any) {
    this.setData({ showRateModal: true, rateOrderId: e.currentTarget.dataset.id, rateStars: 5, rateText: '' })
  },
  closeRateModal() { this.setData({ showRateModal: false }) },
  setRateStars(e: any) { this.setData({ rateStars: parseFloat(e.currentTarget.dataset.star) }) },
  onRateTextInput(e: any) { this.setData({ rateText: e.detail.value }) },
  submitRating() {
    const orders = getOrders()
    const idx = orders.findIndex((o: any) => o.id === this.data.rateOrderId)
    if (idx >= 0) {
      orders[idx].rating = this.data.rateStars
      orders[idx].review = this.data.rateText.trim()
      orders[idx].reviewFeatured = false
      saveOrders(orders)
    }
    this.updateAvgRating()
    this.closeRateModal()
    this.showCustomToast('评价成功！欢迎下次再来！', '#7ee787')
  },
  updateAvgRating() {
    const orders = getOrders().filter((o: any) => o.restaurantId === this.data.activeRest?.id && o.rating)
    if (orders.length === 0) { this.setData({ avgRating: '--' }); return }
    const avg = orders.reduce((s: number, o: any) => s + o.rating, 0) / orders.length
    this.setData({ avgRating: avg.toFixed(1) })
  },
  toggleFeatured(e: any) {
    const oid = e.currentTarget.dataset.id
    const orders = getOrders()
    const idx = orders.findIndex((o: any) => o.id === oid)
    if (idx >= 0) { orders[idx].reviewFeatured = !orders[idx].reviewFeatured; saveOrders(orders); this.refreshAll() }
  },
  rateOrder_old(e: any) {
    const id = e.currentTarget.dataset.id
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
    wx.navigateTo({ url: '/pages/order-detail/order-detail?id=' + id })
  },
  filterOrders(e: any) { this.setData({ orderFilter: e.currentTarget.dataset.filter }) },

  // ===== 感受分享 =====
  openNewFeed() {
    this.setData({
      showNewFeed: true, feedContent: '', feedImages: [],
      feedIsTimePublic: true, feedShowLocation: true,
      feedIsLocationPublic: true, feedCustomLocation: '', feedLocation: '', feedLocPrecision: 'exact',
    })
  },
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
  toggleLocPrecision() { this.setData({ feedLocPrecision: this.data.feedLocPrecision === 'exact' ? 'fuzzy' : 'exact' }) },
  getVisLabel(v: string) { const m: any = { all: '🌐 公开', restaurant: '🏪 餐厅', self: '🔒 仅自己' }; return m[v] || v },
  setFeedFilter(e: any) { this.setData({ feedFilter: e.currentTarget.dataset.f }); this.refreshAll() },
  filterFeeds(feeds: any[]) {
    const f = this.data.feedFilter
    if (f === 'all') return feeds
    if (f === 'restaurant') return feeds.filter((x: any) => x.restaurantName === this.data.activeRest?.name)
    if (f === 'self') return feeds.filter((x: any) => x.nickname === '美食家')
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
    const mode = e.currentTarget.dataset.mode
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
        that.setData({ feedLocation: res.address || res.name || '已选位置' })
        wx.showToast({ title: '位置已选择', icon: 'success' })
      },
      fail() {
        wx.showToast({ title: '已取消', icon: 'none' })
      }
    })
  },
  publishFeed() {
    if (!this.data.feedContent.trim() && this.data.feedImages.length === 0) {
      wx.showToast({ title: '请输入内容或添加图片', icon: 'none' }); return
    }
    const feed: Feed = {
      id: generateId(), content: this.data.feedContent.trim(), images: this.data.feedImages,
      restaurantName: this.data.activeRest?.name || '', nickname: '美食家',
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
    this.setData({
      showNewFeed: false, feedContent: '', feedImages: [],
      feedIsTimePublic: true, feedShowLocation: true,
      feedIsLocationPublic: true, feedCustomLocation: '', feedLocation: '', feedLocPrecision: 'exact', feeds,
    })
    wx.showToast({ title: '分享成功！', icon: 'success' })
  },

  // ===== 消息 =====
  openMsgModal(e: any) {
    this.setData({ showMsgModal: true, msgTargetId: e.currentTarget.dataset.id, msgText: '', msgMode: 'owner' })
  },
  openUrgeModal(e: any) {
    this.setData({ showMsgModal: true, msgTargetId: e.currentTarget.dataset.id, msgText: '', msgMode: 'customer' })
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
    const orderId = e.currentTarget.dataset.id
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
    rest.codeExpire = Date.now() + 600000
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
})
