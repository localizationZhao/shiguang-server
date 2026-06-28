Page({
  data: {
    title: '关注',
    followList: [],
    viewHeight: 500,
    refreshing: false
  },
  onReady: function() {
    var res = wx.getWindowInfo();
    var height = res.windowHeight - 40 - 50;
    this.setData({
      viewHeight: height
    });
  },
  onLoad: function() {
    this.fetchFollowList();
  },
  fetchFollowList: function() {
    var that = this;
    var followData = [{
      avatar: '../../images/avatar.png',
      username: '科技达人',
      time: '1小时前',
      content: '今天分享一下人工智能的最新发展趋势，AI技术正在改变我们的生活方式...',
      hasImage: false,
      images: [],
      likes: 128,
      comments: 25,
      shares: 15
    }, {
      avatar: '../../images/avatar.png',
      username: '娱乐快报',
      time: '2小时前',
      content: '最新娱乐新闻：明星红毯秀精彩瞬间',
      hasImage: true,
      images: ['../../images/avatar.png', '../../images/avatar.png', '../../images/avatar.png'],
      likes: 356,
      comments: 89,
      shares: 42
    }, {
      avatar: '../../images/avatar.png',
      username: '财经资讯',
      time: '3小时前',
      content: '今日股市收盘分析，大盘走势平稳，科技股表现亮眼...',
      hasImage: false,
      images: [],
      likes: 78,
      comments: 15,
      shares: 8
    }, {
      avatar: '../../images/avatar.png',
      username: '旅游博主',
      time: '5小时前',
      content: '分享一组美丽的风景照片，大自然的魅力让人沉醉',
      hasImage: true,
      images: ['../../images/avatar.png', '../../images/avatar.png'],
      likes: 520,
      comments: 120,
      shares: 68
    }];
    that.setData({
      followList: followData
    });
  },
  onRefresh: function() {
    var that = this;
    that.setData({
      refreshing: true
    });
    setTimeout(function() {
      that.fetchFollowList();
      that.setData({
        refreshing: false
      });
    }, 1000);
  }
});