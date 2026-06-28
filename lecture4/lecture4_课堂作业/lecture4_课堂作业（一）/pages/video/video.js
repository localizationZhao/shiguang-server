Page({
  data: {
    title: '视频',
    videoList: [],
    viewHeight: 500,
    page: 0,
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
    this.setData({
      page: 0
    });
    this.fetchVideoList();
  },
  fetchVideoList: function() {
    var that = this;
    var videoData = [{
      id: 1,
      videoUrl: 'http://www.w3school.com.cn/i/movie.mp4',
      poster: '../../images/avatar.png',
      duration: 120,
      title: '科技前沿：人工智能最新进展',
      author: '科技频道',
      playCount: 12580,
      publishTime: '2020-03-09 10:30'
    }, {
      id: 2,
      videoUrl: 'http://www.w3school.com.cn/i/movie.mp4',
      poster: '../../images/avatar.png',
      duration: 95,
      title: '娱乐新闻：明星红毯秀',
      author: '娱乐快报',
      playCount: 23600,
      publishTime: '2020-03-09 09:15'
    }, {
      id: 3,
      videoUrl: 'http://www.w3school.com.cn/i/movie.mp4',
      poster: '../../images/avatar.png',
      duration: 150,
      title: '汽车评测：新款SUV试驾体验',
      author: '汽车频道',
      playCount: 8900,
      publishTime: '2020-03-08 18:45'
    }, {
      id: 4,
      videoUrl: 'http://www.w3school.com.cn/i/movie.mp4',
      poster: '../../images/avatar.png',
      duration: 88,
      title: '财经分析：今日股市行情',
      author: '财经资讯',
      playCount: 5600,
      publishTime: '2020-03-08 16:20'
    }];
    that.setData({
      videoList: videoData
    });
  },
  addMoreData: function() {
    var that = this;
    var pageTemp = that.data.page + 1;
    that.setData({
      page: pageTemp
    });
    var moreData = [{
      id: that.data.videoList.length + 1,
      videoUrl: 'http://www.w3school.com.cn/i/movie.mp4',
      poster: '../../images/avatar.png',
      duration: 110,
      title: '社会热点：民生新闻报道',
      author: '社会观察',
      playCount: 18900,
      publishTime: '2020-03-08 14:00'
    }];
    var newList = that.data.videoList.concat(moreData);
    that.setData({
      videoList: newList
    });
  },
  onRefresh: function() {
    var that = this;
    that.setData({
      refreshing: true,
      page: 0
    });
    setTimeout(function() {
      that.fetchVideoList();
      that.setData({
        refreshing: false
      });
    }, 1000);
  },
  onPlay: function(e) {
    console.log('视频播放');
  },
  onPause: function(e) {
    console.log('视频暂停');
  },
  onEnded: function(e) {
    console.log('视频播放结束');
  }
});