// 数据模型与本地存储工具

// ============ 类型定义 ============

export interface Ingredient {
  name: string
  amount: string
  category?: string // 食材分类
}

export interface CookingStep {
  text: string
  img?: string // 步骤配图
}

export interface Recipe {
  id: number
  name: string
  category: string
  tags?: string[]      // 首页筛选标签
  color: string
  price: number
  ingredients: Ingredient[]
  steps: CookingStep[]
  reference?: string // 参考链接
  coverEmoji: string
  coverImg?: string // 封面图片路径
  createdAt: string
  updatedAt?: string
  draft?: boolean // 是否为草稿
  source?: 'diy' | 'public' | 'copy' // 菜谱来源
  copiedFrom?: number // 从哪个公共菜谱复刻
}

export interface Category {
  name: string
  isSystem: boolean
  sort: number
  color?: string     // 分类颜色
}

export interface OrderItem {
  recipeId: number
  name: string
  price: number
  emoji: string
}

export interface Order {
  id: number
  restaurantId: number
  restaurantName: string
  items: string // 菜品名称逗号分隔
  itemList: OrderItem[]
  status: 'pending' | 'cooking' | 'done' | 'rejected'
  customer: string
  time?: string // 预计时间
  createdAt: string
  rating?: number // 评价 1-5
  messages?: { text: string; from: 'owner' | 'customer'; time: string }[]
}

export interface Member {
  nickname: string
  birdType: string   // 鸟型图片文件名，如 '32x32x1'
  online: boolean
  joinedAt: string
  seatIndex: number  // 座位号 0-7
  accessory: string  // 配饰emoji，如 '🎩' '👑' ''
  soulColor: string  // 灵魂色，唯一配色 hex
}

// 可选配饰
export const ACCESSORIES = [
  '', '🎩', '👑', '🕶️', '🎀', '💍', '✨', '⭐', '🌺', '🍀', '🔥', '💎', '🏆'
]

// 灵魂色池——每只鸟随机取一个，一眼认出自己
export const SOUL_COLORS = [
  '#ff6b9d', '#ff9a76', '#ffd93d', '#6bcb77', '#4d96ff',
  '#9b59b6', '#e056a0', '#00bcd4', '#ff7043', '#26c6da',
  '#ab47bc', '#ef5350', '#42a5f5', '#66bb6a', '#ffa726',
  '#ec407a', '#5c6bc0', '#29b6f6', '#8d6e63', '#ffca28'
]

// 随机生成灵魂色
export function randomSoulColor(): string {
  return SOUL_COLORS[Math.floor(Math.random() * SOUL_COLORS.length)]
}

// 座位布局：8个座位，4号为主座（店主专座）
export const SEAT_POSITIONS = [
  { id: 0, label: '上座' },
  { id: 1, label: '雅座' },
  { id: 2, label: '上座' },
  { id: 3, label: '散座' },
  { id: 4, label: '主座' },   // 店主专座
  { id: 5, label: '散座' },
  { id: 6, label: '边座' },
  { id: 7, label: '边座' },
]

export interface Restaurant {
  id: number
  name: string
  avatar?: string
  description: string
  owner: boolean // 是否是自己的餐厅
  menu: { recipeId: number; name: string; price: number; emoji: string; onShelf: boolean; ordered?: boolean }[]
  members: Member[]
  inviteCode: string
  codeExpire: number
  originalId?: number  // 加入的餐厅的原ID
  closed?: boolean     // 餐厅是否已闭店
}

// 可选的鸟型图片列表
export const BIRD_TYPES = [
  '29x29x2', '29x29x3', '32x24x2', '32x24x3',
  '32x32x1', '32x32x2', '48x48x1', '60x45x2',
  '60x45x3', '67x50x2', '74x55x2', '96x96x1'
]

export interface CookingRecord {
  id: number
  recipeId: number
  recipeName: string
  cookedAt: string // 做菜日期
  img?: string // 成品图
  notes?: string
  voice?: string // 语音录音
}

export interface Feed {
  id: number
  content: string
  images?: string[]
  video?: string
  restaurantName?: string
  nickname?: string
  visibility: 'all' | 'restaurant'
  createdAt: string
  // 时间显示
  createTime: number       // 时间戳(毫秒)
  isTimePublic: boolean    // 是否公开时间
  // 位置显示
  showLocation: boolean    // 是否显示位置
  isLocationPublic: boolean // 公开真实位置 or 自定义
  location: string         // 真实位置
  customLocation: string   // 自定义位置名
  comments?: { text: string; user: string; time: string }[]
}

// ============ 预设分类 ============

export const SYSTEM_CATEGORIES: Category[] = [
  { name: '荤菜', isSystem: true, sort: 0 },
  { name: '素菜', isSystem: true, sort: 1 },
  { name: '凉菜', isSystem: true, sort: 2 },
  { name: '汤羹', isSystem: true, sort: 3 },
  { name: '主食', isSystem: true, sort: 4 },
  { name: '甜点', isSystem: true, sort: 5 },
  { name: '酒水', isSystem: true, sort: 6 },
]

// ============ 偏好标签 ============

export const PREFERENCE_TAGS = ['早餐', '午餐', '晚餐', '肉类', '蔬菜', '甜品', '海鲜', '主食', '汤类', '小吃']

// ============ 公共菜谱（模拟数据） ============

export const PUBLIC_RECIPES: Recipe[] = [
  { id:1001, name:'宫保鸡丁', tags:["午餐","晚餐","肉类"], category:'荤菜', color:'#ff8baa', price:38, ingredients:[], steps:[], coverEmoji:'🍗', createdAt:'2025-01-01', source:'public' as const },
  { id:1002, name:'麻婆豆腐', tags:["午餐","晚餐","蔬菜"], category:'素菜', color:'#79bcff', price:22, ingredients:[], steps:[], coverEmoji:'🧈', createdAt:'2025-01-01', source:'public' as const },
  { id:1003, name:'清蒸鲈鱼', tags:["午餐","晚餐","海鲜"], category:'荤菜', color:'#ff8baa', price:58, ingredients:[], steps:[], coverEmoji:'🐟', createdAt:'2025-01-01', source:'public' as const },
  { id:1004, name:'番茄鸡蛋汤', tags:["午餐","晚餐","汤类","蛋奶类"], category:'汤羹', color:'#ffb37c', price:15, ingredients:[], steps:[], coverEmoji:'🍅', createdAt:'2025-01-01', source:'public' as const },
  { id:1005, name:'蛋炒饭', tags:["早餐","午餐","主食","蛋奶类"], category:'主食', color:'#6de192', price:18, ingredients:[], steps:[], coverEmoji:'🍚', createdAt:'2025-01-01', source:'public' as const },
  { id:1006, name:'红烧排骨', tags:["午餐","晚餐","肉类"], category:'荤菜', color:'#ff8baa', price:48, ingredients:[], steps:[], coverEmoji:'🍖', createdAt:'2025-01-01', source:'public' as const },
  { id:1007, name:'蒜蓉西蓝花', tags:["午餐","晚餐","蔬菜"], category:'素菜', color:'#79bcff', price:16, ingredients:[], steps:[], coverEmoji:'🥦', createdAt:'2025-01-01', source:'public' as const },
  { id:1008, name:'芒果慕斯', tags:["甜点","小吃","蛋奶类"], category:'甜点', color:'#6de192', price:35, ingredients:[], steps:[], coverEmoji:'🥭', createdAt:'2025-01-01', source:'public' as const },
  { id:1009, name:'鱼香肉丝', tags:["午餐","晚餐","肉类"], category:'荤菜', color:'#ff8baa', price:32, ingredients:[], steps:[], coverEmoji:'🍖', createdAt:'2025-01-01', source:'public' as const },
  { id:1010, name:'红烧肉', tags:["午餐","晚餐","肉类"], category:'荤菜', color:'#ff8baa', price:58, ingredients:[], steps:[], coverEmoji:'🥩', createdAt:'2025-01-01', source:'public' as const },
  { id:1011, name:'西红柿炒鸡蛋', tags:["早餐","午餐","晚餐","蔬菜","蛋奶类"], category:'素菜', color:'#79bcff', price:18, ingredients:[], steps:[], coverEmoji:'🍅', createdAt:'2025-01-01', source:'public' as const },
  { id:1012, name:'酸辣土豆丝', tags:["午餐","晚餐","蔬菜"], category:'素菜', color:'#79bcff', price:16, ingredients:[], steps:[], coverEmoji:'🥔', createdAt:'2025-01-01', source:'public' as const },
  { id:1013, name:'地三鲜', tags:["午餐","晚餐","蔬菜"], category:'素菜', color:'#79bcff', price:28, ingredients:[], steps:[], coverEmoji:'🍆', createdAt:'2025-01-01', source:'public' as const },
  { id:1014, name:'酸辣汤', tags:["午餐","晚餐","汤类"], category:'汤羹', color:'#ffb37c', price:16, ingredients:[], steps:[], coverEmoji:'🥣', createdAt:'2025-01-01', source:'public' as const },
  { id:1015, name:'桂花糕', tags:["甜点","小吃"], category:'甜点', color:'#6de192', price:18, ingredients:[], steps:[], coverEmoji:'🌸', createdAt:'2025-01-01', source:'public' as const },
  { id:1016, name:'红糖糍粑', tags:["甜点","小吃"], category:'甜点', color:'#6de192', price:22, ingredients:[], steps:[], coverEmoji:'🍡', createdAt:'2025-01-01', source:'public' as const },
  { id:1017, name:'蒜蓉生蚝', tags:["午餐","晚餐","海鲜"], category:'荤菜', color:'#ff8baa', price:68, ingredients:[], steps:[], coverEmoji:'🦪', createdAt:'2025-01-01', source:'public' as const },
  { id:1018, name:'香辣蟹', tags:["午餐","晚餐","海鲜"], category:'荤菜', color:'#ff8baa', price:88, ingredients:[], steps:[], coverEmoji:'🦀', createdAt:'2025-01-01', source:'public' as const },
  { id:1019, name:'孜然羊肉', tags:["午餐","晚餐","肉类"], category:'荤菜', color:'#ff8baa', price:58, ingredients:[], steps:[], coverEmoji:'🐑', createdAt:'2025-01-01', source:'public' as const },
  { id:1020, name:'啤酒鸭', tags:["午餐","晚餐","肉类"], category:'荤菜', color:'#ff8baa', price:48, ingredients:[], steps:[], coverEmoji:'🦆', createdAt:'2025-01-01', source:'public' as const },
  { id:1021, name:'干煸四季豆', tags:["午餐","晚餐","蔬菜"], category:'素菜', color:'#79bcff', price:22, ingredients:[], steps:[], coverEmoji:'🫘', createdAt:'2025-01-01', source:'public' as const },
  { id:1022, name:'蚝油生菜', tags:["午餐","晚餐","蔬菜"], category:'素菜', color:'#79bcff', price:18, ingredients:[], steps:[], coverEmoji:'🥬', createdAt:'2025-01-01', source:'public' as const },
  { id:1023, name:'牛肉拉面', tags:["午餐","晚餐","主食","肉类"], category:'主食', color:'#6de192', price:28, ingredients:[], steps:[], coverEmoji:'🍜', createdAt:'2025-01-01', source:'public' as const },
  { id:1024, name:'皮蛋瘦肉粥', tags:["早餐","肉类"], category:'主食', color:'#6de192', price:18, ingredients:[], steps:[], coverEmoji:'🥣', createdAt:'2025-01-01', source:'public' as const },
  { id:1025, name:'春卷', tags:["午餐","晚餐","小吃"], category:'主食', color:'#6de192', price:25, ingredients:[], steps:[], coverEmoji:'🫔', createdAt:'2025-01-01', source:'public' as const },
  { id:1026, name:'凉拌藕片', tags:["午餐","晚餐","蔬菜"], category:'凉菜', color:'#d18bff', price:16, ingredients:[], steps:[], coverEmoji:'🪷', createdAt:'2025-01-01', source:'public' as const },
  { id:1027, name:'糖醋里脊', tags:["午餐","晚餐","肉类"], category:'荤菜', color:'#ff8baa', price:42, ingredients:[], steps:[], coverEmoji:'🍖', createdAt:'2025-01-01', source:'public' as const },
  { id:1028, name:'回锅肉', tags:["午餐","晚餐","肉类"], category:'荤菜', color:'#ff8baa', price:38, ingredients:[], steps:[], coverEmoji:'🥩', createdAt:'2025-01-01', source:'public' as const },
  { id:1029, name:'可乐鸡翅', tags:["午餐","晚餐","肉类"], category:'荤菜', color:'#ff8baa', price:35, ingredients:[], steps:[], coverEmoji:'🍗', createdAt:'2025-01-01', source:'public' as const },
  { id:1030, name:'油焖大虾', tags:["午餐","晚餐","海鲜"], category:'荤菜', color:'#ff8baa', price:68, ingredients:[], steps:[], coverEmoji:'🦐', createdAt:'2025-01-01', source:'public' as const },
  { id:1031, name:'蒜蓉粉丝扇贝', tags:["午餐","晚餐","海鲜"], category:'荤菜', color:'#ff8baa', price:58, ingredients:[], steps:[], coverEmoji:'🐚', createdAt:'2025-01-01', source:'public' as const },
  { id:1032, name:'水煮牛肉', tags:["午餐","晚餐","肉类"], category:'荤菜', color:'#ff8baa', price:58, ingredients:[], steps:[], coverEmoji:'🥩', createdAt:'2025-01-01', source:'public' as const },
  { id:1033, name:'清炒油麦菜', tags:["午餐","晚餐","蔬菜"], category:'素菜', color:'#79bcff', price:16, ingredients:[], steps:[], coverEmoji:'🥬', createdAt:'2025-01-01', source:'public' as const },
  { id:1034, name:'手撕包菜', tags:["午餐","晚餐","蔬菜"], category:'素菜', color:'#79bcff', price:18, ingredients:[], steps:[], coverEmoji:'🥬', createdAt:'2025-01-01', source:'public' as const },
  { id:1035, name:'凉拌木耳', tags:["午餐","晚餐","蔬菜"], category:'凉菜', color:'#d18bff', price:16, ingredients:[], steps:[], coverEmoji:'🍄', createdAt:'2025-01-01', source:'public' as const },
  { id:1036, name:'夫妻肺片', tags:["午餐","晚餐","肉类","小吃"], category:'凉菜', color:'#d18bff', price:38, ingredients:[], steps:[], coverEmoji:'🥩', createdAt:'2025-01-01', source:'public' as const },
  { id:1037, name:'口水鸡', tags:["午餐","晚餐","肉类","小吃"], category:'凉菜', color:'#d18bff', price:35, ingredients:[], steps:[], coverEmoji:'🐔', createdAt:'2025-01-01', source:'public' as const },
  { id:1038, name:'紫菜蛋花汤', tags:["午餐","晚餐","汤类","蛋奶类"], category:'汤羹', color:'#ffb37c', price:12, ingredients:[], steps:[], coverEmoji:'🥣', createdAt:'2025-01-01', source:'public' as const },
  { id:1039, name:'冬瓜排骨汤', tags:["午餐","晚餐","汤类","肉类"], category:'汤羹', color:'#ffb37c', price:32, ingredients:[], steps:[], coverEmoji:'🍖', createdAt:'2025-01-01', source:'public' as const },
  { id:1040, name:'菌菇汤', tags:["午餐","晚餐","汤类","蔬菜"], category:'汤羹', color:'#ffb37c', price:18, ingredients:[], steps:[], coverEmoji:'🍄', createdAt:'2025-01-01', source:'public' as const },
  { id:1041, name:'番茄鸡蛋面', tags:["早餐","午餐","主食","蛋奶类"], category:'主食', color:'#6de192', price:18, ingredients:[], steps:[], coverEmoji:'🍜', createdAt:'2025-01-01', source:'public' as const },
  { id:1042, name:'老北京炸酱面', tags:["午餐","晚餐","主食","肉类"], category:'主食', color:'#6de192', price:22, ingredients:[], steps:[], coverEmoji:'🍜', createdAt:'2025-01-01', source:'public' as const },
  { id:1043, name:'刀削面', tags:["午餐","晚餐","主食"], category:'主食', color:'#6de192', price:20, ingredients:[], steps:[], coverEmoji:'🍜', createdAt:'2025-01-01', source:'public' as const },
  { id:1044, name:'双皮奶', tags:["甜点","小吃","蛋奶类"], category:'甜点', color:'#6de192', price:16, ingredients:[], steps:[], coverEmoji:'🍮', createdAt:'2025-01-01', source:'public' as const },
  { id:1045, name:'梅菜扣肉', tags:["午餐","晚餐","肉类"], category:'荤菜', color:'#ff8baa', price:48, ingredients:[], steps:[], coverEmoji:'🥩', createdAt:'2025-01-01', source:'public' as const },
  { id:1046, name:'担担面', tags:["午餐","晚餐","主食","肉类"], category:'主食', color:'#6de192', price:22, ingredients:[], steps:[], coverEmoji:'🍜', createdAt:'2025-01-01', source:'public' as const },
  { id:1047, name:'葱油拌面', tags:["早餐","午餐","主食"], category:'主食', color:'#6de192', price:15, ingredients:[], steps:[], coverEmoji:'🍜', createdAt:'2025-01-01', source:'public' as const },
  { id:1048, name:'煎饺', tags:["早餐","小吃","肉类"], category:'主食', color:'#6de192', price:25, ingredients:[], steps:[], coverEmoji:'🥟', createdAt:'2025-01-01', source:'public' as const },
  { id:1049, name:'芒果布丁', tags:["甜点","小吃","水果"], category:'甜点', color:'#6de192', price:18, ingredients:[], steps:[], coverEmoji:'🍮', createdAt:'2025-01-01', source:'public' as const },
  { id:1050, name:'绿豆糕', tags:["甜点"], category:'甜点', color:'#6de192', price:16, ingredients:[], steps:[], coverEmoji:'🍪', createdAt:'2025-01-01', source:'public' as const },
  { id:1051, name:'杏仁豆腐', tags:["甜点","蛋奶类"], category:'甜点', color:'#6de192', price:18, ingredients:[], steps:[], coverEmoji:'🍮', createdAt:'2025-01-01', source:'public' as const },
  { id:1052, name:'玉米排骨汤', tags:["午餐","晚餐","汤类","肉类"], category:'汤羹', color:'#ffb37c', price:30, ingredients:[], steps:[], coverEmoji:'🌽', createdAt:'2025-01-01', source:'public' as const },
  { id:1053, name:'鸡蛋灌饼', tags:["早餐","主食","蛋奶类"], category:'主食', color:'#6de192', price:15, ingredients:[], steps:[], coverEmoji:'🫓', createdAt:'2025-01-01', source:'public' as const },
  { id:1054, name:'鲜肉小笼包', tags:["早餐","肉类","小吃"], category:'主食', color:'#6de192', price:28, ingredients:[], steps:[], coverEmoji:'🥟', createdAt:'2025-01-01', source:'public' as const },
  { id:1055, name:'小米南瓜粥', tags:["早餐","汤类"], category:'主食', color:'#6de192', price:12, ingredients:[], steps:[], coverEmoji:'🥣', createdAt:'2025-01-01', source:'public' as const },
  { id:1056, name:'红糖发糕', tags:["早餐","甜点"], category:'甜点', color:'#6de192', price:16, ingredients:[], steps:[], coverEmoji:'🍰', createdAt:'2025-01-01', source:'public' as const },
  { id:1057, name:'黄焖鸡', tags:["午餐","晚餐","肉类"], category:'荤菜', color:'#ff8baa', price:38, ingredients:[], steps:[], coverEmoji:'🍗', createdAt:'2025-01-01', source:'public' as const },
  { id:1058, name:'蒜蓉油麦菜', tags:["午餐","晚餐","蔬菜"], category:'素菜', color:'#79bcff', price:16, ingredients:[], steps:[], coverEmoji:'🥬', createdAt:'2025-01-01', source:'public' as const },
  { id:1059, name:'清蒸多宝鱼', tags:["午餐","晚餐","海鲜"], category:'荤菜', color:'#ff8baa', price:78, ingredients:[], steps:[], coverEmoji:'🐟', createdAt:'2025-01-01', source:'public' as const },
  { id:1060, name:'辣炒花蛤', tags:["午餐","晚餐","海鲜","小吃"], category:'荤菜', color:'#ff8baa', price:35, ingredients:[], steps:[], coverEmoji:'🐚', createdAt:'2025-01-01', source:'public' as const },
  { id:1061, name:'鸡蛋炒面', tags:["午餐","晚餐","主食","蛋奶类"], category:'主食', color:'#6de192', price:18, ingredients:[], steps:[], coverEmoji:'🍝', createdAt:'2025-01-01', source:'public' as const },
  { id:1062, name:'银耳莲子汤', tags:["汤类","甜点"], category:'汤羹', color:'#ffb37c', price:18, ingredients:[], steps:[], coverEmoji:'🥣', createdAt:'2025-01-01', source:'public' as const },
  { id:1063, name:'糖醋排骨', tags:["午餐","晚餐","肉类"], category:'荤菜', color:'#ff8baa', price:42, ingredients:[], steps:[], coverEmoji:'🍖', createdAt:'2025-01-01', source:'public' as const },
  { id:1064, name:'水煮鱼', tags:["午餐","晚餐","海鲜"], category:'荤菜', color:'#ff8baa', price:58, ingredients:[], steps:[], coverEmoji:'🐟', createdAt:'2025-01-01', source:'public' as const },
  { id:1065, name:'油泼面', tags:["午餐","晚餐","主食"], category:'主食', color:'#6de192', price:18, ingredients:[], steps:[], coverEmoji:'🍜', createdAt:'2025-01-01', source:'public' as const },
  { id:1066, name:'芒果双皮奶', tags:["甜点","小吃","水果","蛋奶类"], category:'甜点', color:'#6de192', price:18, ingredients:[], steps:[], coverEmoji:'🍮', createdAt:'2025-01-01', source:'public' as const },
  { id:1067, name:'冬瓜丸子汤', tags:["午餐","晚餐","汤类","肉类"], category:'汤羹', color:'#ffb37c', price:28, ingredients:[], steps:[], coverEmoji:'🍖', createdAt:'2025-01-01', source:'public' as const },
  { id:1068, name:'凉拌海带丝', tags:["午餐","晚餐","蔬菜","小吃"], category:'凉菜', color:'#d18bff', price:14, ingredients:[], steps:[], coverEmoji:'🥗', createdAt:'2025-01-01', source:'public' as const },
  { id:1069, name:'豆沙糯米糍', tags:["早餐","甜点","小吃"], category:'甜点', color:'#6de192', price:16, ingredients:[], steps:[], coverEmoji:'🍡', createdAt:'2025-01-01', source:'public' as const },
]

// ============ 存储操作函数 ============

// 获取自定义分类
export function getCategories(): Category[] {
  const saved = wx.getStorageSync('categories')
  if (!saved || saved.length === 0) {
    return [...SYSTEM_CATEGORIES]
  }
  return saved
}

// 保存分类
export function saveCategories(cats: Category[]): void {
  wx.setStorageSync('categories', cats)
}

// 重置为系统默认分类
export function resetCategories(): Category[] {
  wx.setStorageSync('categories', [...SYSTEM_CATEGORIES])
  return [...SYSTEM_CATEGORIES]
}

// 获取DIY菜谱
export function getRecipes(): Recipe[] {
  return wx.getStorageSync('recipes') || []
}

// 保存DIY菜谱
export function saveRecipes(recipes: Recipe[]): void {
  wx.setStorageSync('recipes', recipes)
}

// 添加菜谱
export function addRecipe(recipe: Recipe): void {
  const recipes = getRecipes()
  recipes.unshift(recipe)
  saveRecipes(recipes)
}

// 更新菜谱
export function updateRecipe(recipe: Recipe): void {
  const recipes = getRecipes()
  const idx = recipes.findIndex(r => r.id === recipe.id)
  if (idx >= 0) {
    recipes[idx] = { ...recipe, updatedAt: new Date().toISOString() }
    saveRecipes(recipes)
  }
}

// 删除菜谱
export function deleteRecipe(id: number): void {
  const recipes = getRecipes().filter(r => r.id !== id)
  saveRecipes(recipes)
}

// 获取草稿
export function getDrafts(): Recipe[] {
  return getRecipes().filter(r => r.draft)
}

// 保存草稿
export function saveDraft(recipe: Recipe): void {
  const recipes = getRecipes()
  const idx = recipes.findIndex(r => r.id === recipe.id)
  if (idx >= 0) {
    recipes[idx] = recipe
  } else {
    recipes.unshift(recipe)
  }
  saveRecipes(recipes)
}

// 获取收藏列表
export function getFavorites(): Recipe[] {
  return wx.getStorageSync('favorites') || []
}

// 添加收藏
export function addFavorite(recipe: Recipe): void {
  const favs = getFavorites()
  if (!favs.find(f => f.id === recipe.id)) {
    favs.unshift(recipe)
    wx.setStorageSync('favorites', favs)
  }
}

// 取消收藏
export function removeFavorite(id: number): void {
  const favs = getFavorites().filter(f => f.id !== id)
  wx.setStorageSync('favorites', favs)
}

// 是否已收藏
export function isFavorite(id: number): boolean {
  return getFavorites().some(f => f.id === id)
}

// 获取餐厅列表（自动迁移旧数据）
export function getRestaurants(): Restaurant[] {
  const rests = wx.getStorageSync('restaurants') || []
  let migrated = false
  for (const r of rests) {
    // 迁移 members: string[] -> Member[]
    if (r.members && r.members.length > 0 && typeof r.members[0] === 'string') {
      r.members = r.members.map((nick: string, i: number) => ({
        nickname: nick,
        birdType: '32x32x1',
        online: false,
        joinedAt: new Date().toISOString(),
        seatIndex: r.owner ? 4 : (i + 1) % 8,
        accessory: '',
        soulColor: randomSoulColor()
      }))
      migrated = true
    }
    // 确保必有字段
    if (!r.description) r.description = ''
    if (!r.inviteCode) r.inviteCode = ''
    if (!r.codeExpire) r.codeExpire = 0
    if (!r.members) r.members = []
  }
  if (migrated) {
    wx.setStorageSync('restaurants', rests)
  }
  return rests
}

// 保存餐厅列表
export function saveRestaurants(rests: Restaurant[]): void {
  wx.setStorageSync('restaurants', rests)
}

// 获取订单列表
export function getOrders(): Order[] {
  return wx.getStorageSync('orders') || []
}

// 保存订单列表
export function saveOrders(orders: Order[]): void {
  wx.setStorageSync('orders', orders)
}

// 获取做菜记录
export function getCookingRecords(): CookingRecord[] {
  return wx.getStorageSync('cookingRecords') || []
}

// 保存做菜记录
export function saveCookingRecords(records: CookingRecord[]): void {
  wx.setStorageSync('cookingRecords', records)
}

// 获取感受分享动态
export function getFeeds(): Feed[] {
  return wx.getStorageSync('feeds') || []
}

// 保存感受分享动态
export function saveFeeds(feeds: Feed[]): void {
  wx.setStorageSync('feeds', feeds)
}

// 获取用户资料
export function getUserProfile() {
  return wx.getStorageSync('userProfile') || { nick: '美食家', avatar: '', id: '10001' }
}

// 保存用户资料
export function saveUserProfile(profile: any): void {
  wx.setStorageSync('userProfile', profile)
}
