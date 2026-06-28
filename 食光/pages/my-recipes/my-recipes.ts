// 自制菜谱记录
import { getRecipes } from '../../utils/storage'

Page({
  data: {
    recipes: [] as any[],
  },
  onShow() {
    const recipes = getRecipes().filter((r: any) => !r.draft)
    this.setData({ recipes: recipes.reverse() })
  },
  toDetail(e: any) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: '/pages/recipe-detail/recipe-detail?id=' + id })
  },
})
