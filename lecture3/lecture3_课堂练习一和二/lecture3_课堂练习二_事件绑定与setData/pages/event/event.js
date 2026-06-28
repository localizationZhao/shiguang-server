// pages/event/event.js
// 知识点：事件绑定、setData数据更新、事件传参、冒泡事件
Page({
  data: {
    // ==================== 模块1：基础事件绑定 ====================
    clickCount: 0,              // 点击次数统计
    btnText: '点击我',          // 按钮初始文本
    showTip: false,             // 是否显示提示信息

    // ==================== 模块2：setData数据更新 ====================
    // 数字自增/自减
    counter: 0,

    // 文本动态修改
    statusText: '初始状态',

    // 数组更新（新增/删除）
    todoList: ['学习小程序', '完成作业', '复习课程'],

    // 对象属性更新
    user: {
      name: '张三',
      age: 20,
      role: '学生'
    },

    // ==================== 模块3：事件传参练习 ====================
    paramResult: '',            // 存储事件传参结果

    // ==================== 模块4：条件&列表联动 ====================
    showList: true,             // 控制列表显示/隐藏
    items: [
      { id: 1, name: '苹果', selected: false },
      { id: 2, name: '香蕉', selected: false },
      { id: 3, name: '橙子', selected: false }
    ],

    // ==================== 模块5：冒泡事件演示 ====================
    outerLog: '',               // 外层点击日志
    middleLog: '',              // 中层点击日志
    innerLog: '',               // 内层点击日志

    // ==================== 模块6：乘法表倒序 ====================
    multiplicationTable: [],    // 9开头倒序乘法表

    // ==================== 模块7：随身物品列表 ====================
    dailyItems: [
      { name: '手机', icon: '📱' },
      { name: '笔记本', icon: '📓' },
      { name: '水杯', icon: '🥤' },
      { name: '钥匙', icon: '🔑' },
      { name: '耳机', icon: '🎧' }
    ],

    // ==================== 模块8：设备对象渲染 ====================
    myDevice: {
      brand: '联想',
      color: '深空灰',
      model: 'ThinkPad X1 Carbon Gen 11',
      screenSize: '14英寸',
      resolution: '2880×1800',
      cpu: 'Intel Core i7-1365U',
      memory: '16GB LPDDR5',
      storage: '512GB SSD',
      os: 'Windows 11 Pro'
    },

    // ==================== 模块9：条件渲染图片 ====================
    deviceType: 'windows'       // apple / android / windows / other
  },

  // ==================== 模块1：基础事件绑定 ====================
  // bindtap 点击事件 - view组件
  onViewTap: function() {
    this.setData({
      showTip: !this.data.showTip
    });
  },

  // bindtap 点击事件 - button组件
  onBtnTap: function() {
    this.setData({
      clickCount: this.data.clickCount + 1,
      btnText: '已点击 ' + (this.data.clickCount + 1) + ' 次'
    });
  },

  // ==================== 模块2：setData数据更新 ====================
  // 数字自增
  onIncrement: function() {
    this.setData({
      counter: this.data.counter + 1
    });
  },

  // 数字自减
  onDecrement: function() {
    this.setData({
      counter: this.data.counter - 1
    });
  },

  // 动态修改文本
  onToggleStatus: function() {
    const newStatus = this.data.statusText === '初始状态' ? '已切换状态' : '初始状态';
    this.setData({
      statusText: newStatus
    });
  },

  // 新增数组元素
  onAddItem: function() {
    const newItem = '新任务 ' + (this.data.todoList.length + 1);
    // 正确做法：使用 setData 更新数组
    this.setData({
      todoList: this.data.todoList.concat([newItem])
    });
  },

  // 删除数组最后一个元素
  onRemoveItem: function() {
    if (this.data.todoList.length > 0) {
      const newList = this.data.todoList.slice(0, -1);
      this.setData({
        todoList: newList
      });
    }
  },

  // 更新对象属性
  onUpdateUser: function() {
    this.setData({
      'user.name': '李四',
      'user.age': 25,
      'user.role': '开发者'
    });
  },

  // ==================== 模块3：事件传参练习 ====================
  // 使用 data-* 自定义属性传参
  onParamTap: function(e) {
    // 从 event.currentTarget.dataset 获取自定义参数
    const id = e.currentTarget.dataset.id;
    const name = e.currentTarget.dataset.name;
    this.setData({
      paramResult: '收到参数：id=' + id + ', name=' + name
    });
  },

  // ==================== 模块4：条件&列表联动 ====================
  // 切换列表显示/隐藏
  onToggleList: function() {
    this.setData({
      showList: !this.data.showList
    });
  },

  // 切换列表项选中状态
  onToggleItem: function(e) {
    const index = e.currentTarget.dataset.index;
    // 使用 setData 更新数组中指定对象的属性
    const key = 'items[' + index + '].selected';
    this.setData({
      [key]: !this.data.items[index].selected
    });
  },

  // ==================== 模块5：冒泡事件演示 ====================
  // bind 冒泡事件 - 事件会向父节点传递
  onOuterTap: function() {
    this.setData({
      outerLog: '外层被点击（bindtap 冒泡）'
    });
  },

  onMiddleTap: function() {
    this.setData({
      middleLog: '中层被点击（bindtap 冒泡）'
    });
  },

  // catch 阻止冒泡事件 - 事件不会向父节点传递
  onInnerCatchTap: function() {
    this.setData({
      innerLog: '内层被点击（catchtap 阻止冒泡）'
    });
  },

  // ==================== 模块6：乘法表倒序 ====================
  // 生成乘法表（9开头倒序）
  _generateMultiplicationTable: function() {
    const table = [];
    for (let i = 9; i >= 1; i--) {
      const items = [];
      for (let j = 1; j <= i; j++) {
        items.push(`${i}×${j}=${i * j}`);
      }
      table.push({ multiplier: i, items });
    }
    this.setData({ multiplicationTable: table });
  },

  onLoad: function(options) {
    console.log('练习二页面加载完成');
    // 生成乘法表
    this._generateMultiplicationTable();
  }
});
