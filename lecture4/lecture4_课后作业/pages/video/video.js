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
    wx.request({
      url: 'http://localhost:8888/demo/video/list',
      method: 'GET',
      success: function(res) {
        console.log('获取视频列表响应:', res);
        if (res.data && Array.isArray(res.data)) {
          var videoData = res.data.map(function(item) {
            return {
              id: item.id,
              videoUrl: 'https://www.w3school.com.cn/i/movie.mp4',
              duration: item.duration,
              title: item.title,
              author: item.author,
              playCount: item.play_count,
              publishTime: item.publish_time
            };
          });
          that.setData({
            videoList: videoData
          });
        } else {
          console.error('服务器返回数据格式错误');
          that.loadMockData();
        }
      },
      fail: function(err) {
        console.error('获取视频列表失败:', err);
        that.loadMockData();
      }
    });
  },
  loadMockData: function() {
    var mockData = [{
      id: 1,
      videoUrl: 'https://www.w3school.com.cn/i/movie.mp4',
      duration: 120,
      title: '科技前沿：人工智能最新进展',
      author: '科技频道',
      playCount: 12580,
      publishTime: '2020-03-09 10:30'
    }, {
      id: 2,
      videoUrl: 'https://www.w3school.com.cn/i/movie.mp4',
      duration: 95,
      title: '娱乐新闻：明星红毯秀',
      author: '娱乐快报',
      playCount: 23600,
      publishTime: '2020-03-09 09:15'
    }, {
      id: 3,
      videoUrl: 'https://www.w3school.com.cn/i/movie.mp4',
      duration: 150,
      title: '汽车评测：新款SUV试驾体验',
      author: '汽车频道',
      playCount: 8900,
      publishTime: '2020-03-08 18:45'
    }, {
      id: 4,
      videoUrl: 'https://www.w3school.com.cn/i/movie.mp4',
      duration: 88,
      title: '财经分析：今日股市行情',
      author: '财经资讯',
      playCount: 5600,
      publishTime: '2020-03-08 16:20'
    }];
    this.setData({
      videoList: mockData
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
      videoUrl: 'https://www.w3school.com.cn/i/movie.mp4',
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