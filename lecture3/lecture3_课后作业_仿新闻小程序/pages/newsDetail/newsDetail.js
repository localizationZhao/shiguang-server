// pages/newsDetail/newsDetail.js
// 知识点：页面参数接收、本地数据展示、setData 更新
Page({
  data: {
    selectedNews: null  // 当前选中的新闻详情
  },

  onLoad: function(options) {
    // 接收从首页传递的新闻数据（通过 JSON 字符串传递）
    if (options.news) {
      try {
        const news = JSON.parse(decodeURIComponent(options.news));
        this.setData({
          selectedNews: news
        });
        // 更新导航栏标题为新闻标题
        wx.setNavigationBarTitle({
          title: news.title.substring(0, 10) + (news.title.length > 10 ? '...' : '')
        });
      } catch (e) {
        console.error('解析新闻数据失败', e);
      }
    }
  }
});
