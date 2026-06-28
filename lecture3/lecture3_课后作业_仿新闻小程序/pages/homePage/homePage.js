// pages/homePage/homePage.js
// 知识点：本地数据操作、setData更新、事件传参、scroll-view使用、文件存储、网络请求模拟、交互反馈
Page({
  data: {
    // 顶部菜单分类（可从本地存储读取）
    tArray: [],
    // 全部分类候选（用于添加频道）
    allCategories: [
      { name: '全部', category: 'all' },
      { name: '科技', category: 'tech' },
      { name: '体育', category: 'sports' },
      { name: '娱乐', category: 'ent' },
      { name: '财经', category: 'finance' },
      { name: '军事', category: 'military' },
      { name: '教育', category: 'edu' },
      { name: '健康', category: 'health' },
      { name: '汽车', category: 'car' }
    ],
    curpage: 0,             // 当前选中的分类索引
    category: 'all',        // 当前分类
    detaildata: [],         // 当前显示的新闻列表
    allData: [],            // 存储全部本地数据，用于分类过滤
    loading: true,
    viewHeight: 500,        // scroll-view 高度
    listpage: 0,            // 模拟分页页码
    showChannelPicker: false, // 是否显示频道选择弹窗
    refreshing: false,       // 下拉刷新状态
    availableCategories: []  // 可添加的频道列表（过滤后）
  },

  onLoad: function() {
    // 1. 计算 scroll-view 高度（减去顶部菜单和 tabBar）
    const windowInfo = wx.getWindowInfo();
    const windowHeight = windowInfo.windowHeight;
    // 顶部菜单高度 80rpx -> 转换为 px (以 750 设计稿为基准)
    const topHeight = 80 / 750 * windowInfo.windowWidth;
    // tabBar 高度约为 50px
    const tabBarHeight = 50;
    // 留一点余量
    const viewHeight = windowHeight - topHeight - tabBarHeight - 10;
    this.setData({ viewHeight: viewHeight });

    // 2. 读取本地存储的分类配置（文件操作）
    this.loadLocalCategories();

    // 3. 模拟网络请求获取新闻数据
    this.fetchNewsData();
  },

  // 文件操作：读取本地存储的分类配置
  loadLocalCategories: function() {
    try {
      const savedCategories = wx.getStorageSync('myCategories');
      if (savedCategories && savedCategories.length > 0) {
        this.setData({ tArray: savedCategories });
      } else {
        // 首次使用，设置默认分类
        const defaultCategories = [
          { name: '全部', category: 'all' },
          { name: '科技', category: 'tech' },
          { name: '体育', category: 'sports' },
          { name: '娱乐', category: 'ent' },
          { name: '财经', category: 'finance' },
          { name: '军事', category: 'military' }
        ];
        this.setData({ tArray: defaultCategories });
        // 保存到本地存储
        wx.setStorageSync('myCategories', defaultCategories);
      }
    } catch (e) {
      console.error('读取本地分类配置失败', e);
    }
  },

  // 文件操作：保存分类配置到本地
  saveCategories: function(categories) {
    try {
      wx.setStorageSync('myCategories', categories);
      this.setData({ tArray: categories });
      wx.showToast({
        title: '频道已保存',
        icon: 'success',
        duration: 1500
      });
    } catch (e) {
      console.error('保存分类配置失败', e);
      wx.showToast({
        title: '保存失败',
        icon: 'error'
      });
    }
  },

  // 网络请求模拟：模拟从服务器获取新闻数据
  fetchNewsData: function() {
    // 显示加载中
    wx.showLoading({
      title: '加载中...',
      mask: true
    });

    // 模拟网络延迟
    setTimeout(() => {
      const mockNews = this.getMockNewsData();
      
      this.setData({
        allData: mockNews,
        loading: false
      });

      // 隐藏加载提示
      wx.hideLoading();

      // 交互反馈：加载成功提示
      wx.showToast({
        title: '数据加载完成',
        icon: 'success',
        duration: 1000
      });

      // 默认显示全部
      this.filterNews('all');
    }, 800);
  },

  // 模拟网络请求返回的新闻数据
  getMockNewsData: function() {
    return [
      {
        title: '人工智能助力疫情防控，新算法提高筛查效率',
        category: 'tech',
        image_list: [
          { url: 'https://picsum.photos/200/150?random=1' },
          { url: 'https://picsum.photos/200/150?random=2' },
          { url: 'https://picsum.photos/200/150?random=3' }
        ],
        has_image: true,
        comment_count: 128,
        publish_time: '2026-06-27 10:30'
      },
      {
        title: '国足战胜强敌，晋级世界杯预选赛下一轮',
        category: 'sports',
        image_list: [
          { url: 'https://picsum.photos/200/150?random=4' },
          { url: 'https://picsum.photos/200/150?random=5' },
          { url: 'https://picsum.photos/200/150?random=6' }
        ],
        has_image: true,
        comment_count: 256,
        publish_time: '2026-06-26 22:15'
      },
      {
        title: '新款旗舰手机发布，搭载骁龙8 Gen 3处理器',
        category: 'tech',
        image_list: [
          { url: 'https://picsum.photos/200/150?random=7' }
        ],
        has_image: true,
        comment_count: 89,
        publish_time: '2026-06-26 14:00'
      },
      {
        title: '全球气候变化会议达成新协议，碳中和目标提前',
        category: 'finance',
        image_list: [],
        has_image: false,
        comment_count: 45,
        publish_time: '2026-06-25 09:00'
      },
      {
        title: '电影《星际穿越》续集定档，明年暑期上映',
        category: 'ent',
        image_list: [
          { url: 'https://picsum.photos/200/150?random=8' },
          { url: 'https://picsum.photos/200/150?random=9' }
        ],
        has_image: true,
        comment_count: 312,
        publish_time: '2026-06-24 18:45'
      },
      {
        title: '新型战斗机首飞成功，航空工业再创佳绩',
        category: 'military',
        image_list: [
          { url: 'https://picsum.photos/200/150?random=10' }
        ],
        has_image: true,
        comment_count: 178,
        publish_time: '2026-06-24 10:00'
      },
      {
        title: '教育部发布新规，中小学将全面普及编程课程',
        category: 'edu',
        image_list: [
          { url: 'https://picsum.photos/200/150?random=11' }
        ],
        has_image: true,
        comment_count: 95,
        publish_time: '2026-06-23 15:30'
      },
      {
        title: '最新研究发现：每天运动30分钟可显著降低心血管疾病风险',
        category: 'health',
        image_list: [],
        has_image: false,
        comment_count: 67,
        publish_time: '2026-06-23 08:00'
      },
      {
        title: '新能源汽车销量再创新高，比亚迪蝉联冠军',
        category: 'car',
        image_list: [
          { url: 'https://picsum.photos/200/150?random=12' },
          { url: 'https://picsum.photos/200/150?random=13' }
        ],
        has_image: true,
        comment_count: 203,
        publish_time: '2026-06-22 20:00'
      }
    ];
  },

  // 根据分类过滤新闻
  filterNews: function(category) {
    const all = this.data.allData;
    let filtered = [];
    if (category === 'all') {
      filtered = all;
    } else {
      filtered = all.filter(item => item.category === category);
    }
    this.setData({
      detaildata: filtered,
      listpage: 0   // 重置页码
    });
  },

  // 点击分类菜单（事件传参：data-idx 和 data-index）
  typeClick: function(e) {
    const idx = e.currentTarget.dataset.index;
    const category = e.currentTarget.dataset.idx;
    this.setData({
      curpage: idx,
      category: category
    });
    this.filterNews(category);
  },

  // 加载更多（模拟，实际可以分批加载本地数据）
  addMoreData: function() {
    wx.showToast({
      title: '已加载全部数据',
      icon: 'none'
    });
  },

  // 点击新闻跳转到详情页
  goToDetail: function(e) {
    const news = e.currentTarget.dataset.news;
    // 将新闻对象转为 JSON 字符串，通过 URL 参数传递
    const newsStr = encodeURIComponent(JSON.stringify(news));
    wx.navigateTo({
      url: '/pages/newsDetail/newsDetail?news=' + newsStr
    });
  },

  // 交互反馈：点击添加频道按钮，打开频道选择弹窗
  onAddChannel: function() {
    // 计算可添加的频道（排除已添加的）
    const currentCategories = this.data.tArray.map(item => item.category);
    const available = this.data.allCategories.filter(
      cat => !currentCategories.includes(cat.category)
    );
    this.setData({
      showChannelPicker: true,
      availableCategories: available
    });
  },

  // 交互反馈：关闭频道选择弹窗
  onCloseChannelPicker: function() {
    this.setData({ showChannelPicker: false });
  },

  // 文件操作 + 逻辑层组件数据操作：添加频道
  onAddCategory: function(e) {
    const category = e.currentTarget.dataset.category;
    const name = e.currentTarget.dataset.name;
    const currentCategories = this.data.tArray;
    
    // 检查是否已存在
    const exists = currentCategories.some(item => item.category === category);
    if (exists) {
      wx.showToast({
        title: '该频道已存在',
        icon: 'none'
      });
      return;
    }

    // 添加到当前分类列表
    const newCategories = [...currentCategories, { name, category }];
    
    // 保存到本地存储（文件操作）
    this.saveCategories(newCategories);
    
    // 交互反馈
    wx.showToast({
      title: `已添加${name}频道`,
      icon: 'success'
    });
  },

  // 文件操作 + 逻辑层组件数据操作：删除频道
  onRemoveCategory: function(e) {
    const category = e.currentTarget.dataset.category;
    const currentCategories = this.data.tArray;
    
    // 不能删除"全部"频道
    if (category === 'all') {
      wx.showToast({
        title: '默认频道不可删除',
        icon: 'none'
      });
      return;
    }

    // 从列表中移除
    const newCategories = currentCategories.filter(item => item.category !== category);
    
    // 保存到本地存储（文件操作）
    this.saveCategories(newCategories);
    
    // 如果当前选中的是被删除的频道，切回"全部"
    if (this.data.category === category) {
      this.setData({ curpage: 0, category: 'all' });
      this.filterNews('all');
    }
    
    // 交互反馈
    wx.showToast({
      title: '已删除频道',
      icon: 'success'
    });
  },

  // 交互反馈：下拉刷新
  onRefresh: function() {
    this.setData({ refreshing: true });
    
    // 模拟刷新延迟
    setTimeout(() => {
      this.fetchNewsData();
      this.setData({ refreshing: false });
      
      wx.showToast({
        title: '刷新成功',
        icon: 'success'
      });
    }, 1000);
  }
});
