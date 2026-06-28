var ApiUrl = "http://localhost:8888/demo/"
var tyepUrl = ApiUrl + "news/type"
var newsUrl = ApiUrl + "news/list"
Page({
  data: {
    tArray: [],
    loading: true,
    ishidden: true,
    curpage: 0,
    listpage: 0,
    detaildata: [],
    category: "all",
    viewHeight: 500
  },
  onReady: function() {
    this.animation = wx.createAnimation({
      duration: 2000,
      timingFunction: "ease",
    });
    var res = wx.getWindowInfo();
    var width = res.windowHeight - 40 - 50;
    this.setData({
      viewHeight: width
    });
  },
  onLoad: function() {
    wx.showNavigationBarLoading();
    var that = this;
    wx.request({
      url: tyepUrl,
      data: {},
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
        let dataArr = [];
        dataArr = res.data;
        console.log(dataArr);
        that.setData({
          tArray: dataArr
        });
      },
      fail: function(res) {},
      complete: function(res) {
        wx.hideNavigationBarLoading();
        var dataArr = [
          { category: 'all', name: '热点' },
          { category: '1', name: '社会' },
          { category: '2', name: '娱乐' },
          { category: '3', name: '科技' },
          { category: '4', name: '汽车' },
          { category: '5', name: '财经' }
        ]
        that.setData({
          tArray: dataArr
        });
      }
    })
    this.setData({
      listpage: 0
    });
    this.readList("all")
  },
  typeClick: function(e) {
    var idx = e.currentTarget.dataset.idx;
    console.log(idx);
    var that = this;
    that.setData({
      curpage: e.target.id
    });
    this.setData({
      listpage: 0
    });
    console.log("curpage=", this.data.curpage);
    console.log("listpage==", this.data.listpage);
    this.setData({
      category: idx
    });
    this.readList()
  },
  addMoreData: function(e) {
    var that = this;
    var pageTemp = (this.data.listpage + 1)
    that.setData({
      listpage: pageTemp
    });
    this.readList()
  },
  readList: function() {
    this.setData({ loading: false });
    var that = this;
    wx.request({
      url: newsUrl,
      method: "POST",
      data: { "category": this.data.category, "page": this.data.curpage },
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },
      success: function(res) {
        if (that.data.listpage == 0) { that.setData({ detaildata: [] }); }
        var arr = res.data;
        console.log(arr)
        var dataArr = [];
        dataArr = arr;
        that.setData({ detaildata: dataArr, });
      },
      fail: function(res) {},
      complete: function(res) {
        var dataArr = [{
          title: '标题1：今日热点新闻',
          has_image: false,
          comment_count: 5,
          publish_time: '2020-03-09 9:25'
        }, {
          title: '标题2：社会新闻报道',
          has_image: false,
          comment_count: 15,
          publish_time: '2020-03-09 7:34'
        }, {
          title: '标题3：娱乐明星动态',
          has_image: true,
          image_list: [
            { url: '../../images/avatar.png' },
            { url: '../../images/avatar.png' },
            { url: '../../images/avatar.png' }
          ],
          comment_count: 25,
          publish_time: '2020-03-08 19:25'
        }, {
          title: '标题4：科技前沿资讯',
          has_image: false,
          comment_count: 8,
          publish_time: '2020-03-08 19:20'
        }];
        that.setData({ detaildata: dataArr })
        that.setData({ loading: true })
      }
    });
  }
});