// pages/container/container.js
// 知识点：view、scroll-view、swiper/swiper-item、movable-area/movable-view、match-media
Page({
  data: {
    // ==================== view 容器 ====================
    // 示例数据：课程表
    courseList: [
      { day: '周一', course: '高等数学', time: '08:00-09:40' },
      { day: '周二', course: '数据结构', time: '10:00-11:40' },
      { day: '周三', course: '操作系统', time: '14:00-15:40' },
      { day: '周四', course: '计算机网络', time: '08:00-09:40' },
      { day: '周五', course: '移动开发', time: '10:00-11:40' }
    ],

    // ==================== scroll-view 容器 ====================
    // 横向滚动数据：城市天气
    weatherList: [
      { city: '北京', temp: '25°C', icon: '☀️' },
      { city: '上海', temp: '28°C', icon: '⛅' },
      { city: '广州', temp: '32°C', icon: '🌧️' },
      { city: '深圳', temp: '30°C', icon: '⛈️' },
      { city: '成都', temp: '22°C', icon: '☁️' },
      { city: '杭州', temp: '26°C', icon: '🌤️' },
      { city: '武汉', temp: '29°C', icon: '☀️' },
      { city: '西安', temp: '24°C', icon: '⛅' }
    ],
    // 纵向滚动数据：消息列表
    messageList: [
      { id: 1, title: '系统通知', content: '您的课程作业已更新', time: '10:30' },
      { id: 2, title: '同学留言', content: '明天一起去图书馆吗？', time: '09:15' },
      { id: 3, title: '课程提醒', content: '下午2点有移动开发课程', time: '08:00' },
      { id: 4, title: '成绩公布', content: '数据结构期中成绩已发布', time: '昨天' },
      { id: 5, title: '活动通知', content: '本周五举办技术分享会', time: '昨天' },
      { id: 6, title: '系统通知', content: '校园网维护通知', time: '前天' }
    ],
    scrollHeight: 400,  // scroll-view 高度
    
    // scroll-view 高级功能数据
    toView: 'msg3',     // 滚动到指定元素
    scrollTop: 0,       // 滚动位置
    scrollOrder: ['msg1', 'msg2', 'msg3', 'msg4', 'msg5', 'msg6'],

    // ==================== swiper 容器 ====================
    // 轮播图数据：校园风景
    bannerList: [
      { id: 1, title: '图书馆', color: '#4a90d9' },
      { id: 2, title: '教学楼', color: '#52c41a' },
      { id: 3, title: '操场', color: '#fa8c16' },
      { id: 4, title: '食堂', color: '#f5222d' }
    ],
    currentBanner: 0,   // 当前轮播索引
    indicatorDots: true, // 是否显示指示点
    autoplay: true,     // 自动播放
    vertical: false,    // 是否纵向切换
    interval: 3000,     // 轮播间隔
    duration: 500,      // 切换动画时长
    circular: true,     // 是否衔接滑动

    // ==================== movable-view 容器 ====================
    // 可拖动元素位置
    x: 0,
    y: 0,
    scale: 2,           // 放缩倍数
    
    // ==================== movable-view 更多属性 ====================
    // 阻尼/摩擦/动画控制
    animX: 0,
    animY: 0,
    disabledMove: false,
    useAnimation: true,
    
    // ==================== page-container 容器 ====================
    showBottom: false,
    showCenter: false
  },

  onLoad: function() {
    // 计算 scroll-view 高度
    const sysInfo = wx.getSystemInfoSync();
    this.setData({
      scrollHeight: sysInfo.windowHeight * 0.4
    });
  },

  // scroll-view 滚动到顶部事件
  onScrollToUpper: function(e) {
    console.log('滚动到顶部', e);
  },

  // scroll-view 滚动到底部事件
  onScrollToLower: function(e) {
    console.log('滚动到底部', e);
  },

  // scroll-view 滚动中事件
  onScroll: function(e) {
    console.log('滚动中，scrollTop:', e.detail.scrollTop);
  },

  // 滚动到指定位置
  scrollToTarget: function() {
    const order = this.data.scrollOrder;
    for (let i = 0; i < order.length; i++) {
      if (order[i] === this.data.toView) {
        const nextIndex = (i + 1) % order.length;
        this.setData({
          toView: order[nextIndex],
          scrollTop: (i + 1) * 80
        });
        break;
      }
    }
  },

  // 滚动固定距离
  scrollToTop: function() {
    this.setData({
      scrollTop: 0
    });
  },

  // 滚动增量距离
  scrollMove: function() {
    this.setData({
      scrollTop: this.data.scrollTop + 50
    });
  },

  // swiper 切换事件
  onBannerChange: function(e) {
    this.setData({
      currentBanner: e.detail.current
    });
  },

  // 切换指示点
  toggleIndicatorDots: function() {
    this.setData({
      indicatorDots: !this.data.indicatorDots
    });
  },

  // 切换自动播放
  toggleAutoplay: function() {
    this.setData({
      autoplay: !this.data.autoplay
    });
  },

  // 切换纵向/横向
  toggleVertical: function() {
    this.setData({
      vertical: !this.data.vertical
    });
  },

  // 切换衔接滑动
  toggleCircular: function() {
    this.setData({
      circular: !this.data.circular
    });
  },

  // 切换时长改变
  durationChange: function(e) {
    this.setData({
      duration: e.detail.value
    });
  },

  // 间隔时长改变
  intervalChange: function(e) {
    this.setData({
      interval: e.detail.value
    });
  },

  // movable-view 拖动事件
  onChange: function(e) {
    console.log('movable-view 位置变化', e.detail);
  },

  // movable-view 放缩事件
  onScale: function(e) {
    console.log('movable-view 放缩', e.detail);
  },

  // 点击移动到指定位置
  tap: function() {
    this.setData({
      x: 30,
      y: 30
    });
  },

  // 点击放大3倍
  tap2: function() {
    this.setData({
      scale: 3
    });
  },

  // ==================== movable-view 更多属性事件 ====================
  // 点击无动画移动到指定位置
  tapAnim: function() {
    this.setData({
      animX: 100,
      animY: 100
    });
  },

  // 切换禁用拖动
  toggleDisabled: function() {
    this.setData({
      disabledMove: !this.data.disabledMove
    });
  },

  // 切换动画
  toggleAnimation: function() {
    this.setData({
      useAnimation: !this.data.useAnimation
    });
  },

  // ==================== page-container 事件 ====================
  // 打开底部弹窗
  showPageContainer: function() {
    this.setData({ showBottom: true });
  },

  // 关闭底部弹窗
  hidePageContainer: function() {
    this.setData({ showBottom: false });
  },

  // 打开居中弹窗
  showCenterContainer: function() {
    this.setData({ showCenter: true });
  },

  // 关闭居中弹窗
  hideCenterContainer: function() {
    this.setData({ showCenter: false });
  },

  // 点击遮罩层关闭
  onClickOverlay: function() {
    this.setData({ showBottom: false });
  },

  // page-container 生命周期事件
  onBeforeEnter: function() {
    console.log('page-container 进入前');
  },

  onAfterEnter: function() {
    console.log('page-container 进入后');
  },

  onBeforeLeave: function() {
    console.log('page-container 离开前');
  },

  onAfterLeave: function() {
    console.log('page-container 离开后');
  }
});
