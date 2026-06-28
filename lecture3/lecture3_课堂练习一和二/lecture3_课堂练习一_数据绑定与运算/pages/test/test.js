// pages/test/test.js
// 知识点：小程序页面数据定义、Mustache数据绑定、页面数据运算
Page({
  data: {
    // ==================== 练习1：基本数据绑定 ====================
    // 覆盖 JavaScript 所有基础核心数据类型

    // 1. 字符串 String
    message: 'Hello WeChat Mini Program',

    // 2. 整数 Number
    age: 25,

    // 3. 浮点数 Number
    price: 99.9,

    // 4. 布尔 true
    isLogin: true,

    // 5. 布尔 false
    isVip: false,

    // 6. null 空值
    emptyValue: null,

    // 7. undefined 未定义
    notDefined: undefined,

    // 8. 一维数组 Array
    fruits: ['苹果', '香蕉', '橙子', '葡萄'],

    // 9. 嵌套对象 Object
    userInfo: {
      name: '张三',
      gender: '男',
      city: '北京',
      score: 95
    },

    // ==================== 练习2：页面数据运算 ====================
    // 用于算术运算的变量
    numA: 10,
    numB: 3,

    // 用于三元表达式的变量
    score: 85,
    temperature: 35,

    // 用于条件比较运算的变量
    x: 18,
    y: 18,
    m: 5,
    n: 8,

    // 用于逻辑运算的变量
    hasTicket: true,
    isWeekend: false,
    isHoliday: true,

    // 用于字符串拼接的变量
    firstName: '张',
    lastName: '三',
    greeting: '你好',

    // 用于复杂数据渲染的对象
    book: {
      title: '《简·爱》',
      author: {
        name: '夏洛蒂·勃朗特',
        country: '英国'
      },
      chapters: ['第一章 盖茨黑德府', '第二章 洛伍德学校', '第三章 桑菲尔德庄园']
    },

    // 用于 wx:if 条件渲染的变量（课程原生示例保留）
    showContent: true,
    isStudent: true,
    userType: 'admin',

    // ==================== 练习二补充功能 ====================

    // 1. 乘法表数据（9开头倒序）
    multiplicationTable: [],

    // 2. 随身物品列表（自定义下标和列表项）
    dailyItems: [
      { name: '手机', icon: '📱' },
      { name: '笔记本', icon: '📓' },
      { name: '水杯', icon: '🥤' },
      { name: '钥匙', icon: '🔑' },
      { name: '耳机', icon: '🎧' }
    ],

    // 3. 设备对象（描述自己的笔记本电脑）
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

    // 4. 设备类型（用于条件渲染图片）
    deviceType: 'windows' // 可选值: 'apple', 'android', 'windows', 'other'
  },

  onLoad: function(options) {
    // 页面加载时执行，生成乘法表
    this._generateMultiplicationTable();
    console.log('练习一页面加载完成');
  },

  // 生成乘法表（9开头倒序）
  _generateMultiplicationTable() {
    const table = [];
    for (let i = 9; i >= 1; i--) {
      const items = [];
      for (let j = 1; j <= i; j++) {
        items.push(`${i}×${j}=${i * j}`);
      }
      table.push({ multiplier: i, items });
    }
    this.setData({ multiplicationTable: table });
  }
});
