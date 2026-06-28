// pages/index/index.js - 页面逻辑文件
Page({
  data: {
    // 图书封面图片路径
    cover: '/images/image.png',
    
    // 图书基本信息
    title: '简·爱',
    score: 9.8,
    author: '夏洛蒂·勃朗特',
    publisher: '人民文学出版社',
    year: 1847,
    genre: '经典文学/女性成长',
    pages: 486,
    audience: '高中及以上读者',
    
    // 图书标签列表
    tags: ['经典', '独立女性', '爱情', '成长', '19世纪文学'],
    
    // 基础信息列表（用于 wx:for 列表渲染）
    infoList: [
      { label: '作者', value: '夏洛蒂·勃朗特' },
      { label: '出版社', value: '人民文学出版社' },
      { label: '出版年份', value: '1847' },
      { label: '类型', value: '经典文学/女性成长' },
      { label: '页数', value: '486' },
      { label: '适读人群', value: '高中及以上读者' }
    ],
    
    // 书籍简介（完整内容）
    summary: '《简·爱》是夏洛蒂·勃朗特的代表作，讲述了一位出身贫寒的孤女简·爱，在经历舅母家的虐待、孤儿院的苦难后，成长为独立坚强的女性。她成为桑菲尔德庄园的家庭教师，与庄园主人罗切斯特相爱，却在婚礼上发现对方已有妻子的秘密。简·爱坚守尊严与原则，毅然离开，历经磨难后最终与爱人重逢，收获了平等而真挚的爱情。这部作品深刻探讨了女性独立、人格尊严与真爱平等的主题。',
    
    // 作者简介（完整内容）
    authorBio: '夏洛蒂·勃朗特（1816—1855），英国女作家，"勃朗特三姐妹"之一。出生于英国约克郡贫苦牧师家庭，幼年丧母，曾就读于条件恶劣的慈善学校。成年后担任家庭教师，深知当时女性的生存困境。一生命运坎坷，常年饱受病痛折磨，年仅39岁便离世。其文字真挚细腻、情感饱满，擅长刻画底层女性的内心挣扎与精神抗争。代表作《简·爱》一经出版便轰动英国文坛，成为跨越时代的女性成长经典。',
    
    // 章节目录列表
    chapters: [
      { id: 1, title: '第一章', summary: '盖茨黑德庄园的苦难' },
      { id: 2, title: '第二章', summary: '洛伍德学校的岁月' },
      { id: 3, title: '第三章', summary: '桑菲尔德庄园任家庭教师' },
      { id: 4, title: '第四章', summary: '与罗切斯特的相识' },
      { id: 5, title: '第五章', summary: '爱情与秘密' },
      { id: 6, title: '第六章', summary: '婚礼中断' },
      { id: 7, title: '第七章', summary: '出走与流浪' },
      { id: 8, title: '第八章', summary: '重逢与幸福结局' }
    ],
    
    // 控制简介展开/收起
    showFullSummary: false,
    
    // 控制作者简介展开/收起
    showFullAuthorBio: false,
    
    // 是否有电子版（用于条件渲染示例）
    hasEbook: true,
    
    // ==================== 数据绑定示例数据 ====================
    // 简单绑定示例
    message: 'Hello 简·爱!',
    
    // 组件属性绑定示例
    itemId: 'book-detail-001',
    
    // 控制属性绑定示例
    condition: true,
    
    // 三元运算示例
    flag: true,
    
    // 算数运算示例
    a: 1,
    b: 2,
    c: 3,
    
    // 字符串运算示例
    greeting: 'Hello',
    name: '读者',
    
    // 数据路径运算示例
    object: {
      key: '经典名著'
    },
    array: ['简·爱', '傲慢与偏见', '呼啸山庄'],
    
    // 数组组合示例
    zero: 0,
    
    // 对象组合示例
    foo: 'my-foo',
    bar: 'my-bar',
    obj1: {
      a: 1,
      b: 2
    },
    obj2: {
      c: 3,
      d: 4
    },
    
    // 逻辑判断示例
    length: 8,
    
    // 条件渲染示例数据
    janeAge: 20,
    hasEbook: true,
    
    // ==================== 列表渲染示例数据 ====================
    // 默认列表渲染数据
    defaultArray: [
      { message: '第一章：盖茨黑德' },
      { message: '第二章：洛伍德学校' },
      { message: '第三章：桑菲尔德庄园' }
    ],
    
    // 自定义变量名列表渲染数据
    customArray: [
      { title: '简·爱', year: 1847 },
      { title: '傲慢与偏见', year: 1813 },
      { title: '呼啸山庄', year: 1847 }
    ],
    
    // 嵌套列表渲染数据（人物关系矩阵）
    characterMatrix: [
      { person: '简·爱', relations: ['孤儿', '家庭教师', '罗切斯特妻子'] },
      { person: '罗切斯特', relations: ['庄园主', '简·爱雇主', '已婚男人'] },
      { person: '海伦', relations: ['简·爱好友', '洛伍德学生', '早逝'] }
    ],
    
    // block wx:for 数据（书籍信息块）
    bookInfoBlocks: [
      { label: '书名', value: '简·爱' },
      { label: '作者', value: '夏洛蒂·勃朗特' },
      { label: '年份', value: '1847年' },
      { label: '类型', value: '经典名著' }
    ],
    
    // wx:key 示例数据（对象数组，使用 property 作为 key）
    objectArray: [
      { id: 5, unique: 'unique_5' },
      { id: 4, unique: 'unique_4' },
      { id: 3, unique: 'unique_3' },
      { id: 2, unique: 'unique_2' },
      { id: 1, unique: 'unique_1' },
      { id: 0, unique: 'unique_0' }
    ],
    
    // wx:key 示例数据（数字数组，使用 *this 作为 key）
    numberArray: [1, 2, 3, 4],
    
    // 字符串解析示例
    stringFor: 'array',
    
    // 空格问题示例
    spaceArray: [1, 2, 3],
    
    // 动态模板示例数据（人物列表）
    characters: [
      { name: '简·爱', role: '女主角', gender: 'female' },
      { name: '罗切斯特', role: '男主角', gender: 'male' },
      { name: '海伦', role: '简·爱好友', gender: 'female' },
      { name: '圣约翰', role: '传教士', gender: 'male' }
    ]
  },

  /**
   * 切换书籍简介的展开/收起状态
   */
  toggleSummary() {
    this.setData({
      showFullSummary: !this.data.showFullSummary
    });
  },

  /**
   * 切换作者简介的展开/收起状态
   */
  toggleAuthorBio() {
    this.setData({
      showFullAuthorBio: !this.data.showFullAuthorBio
    });
  },

  onLoad() {
    console.log('《简·爱》图书详情页加载完成');
  }
});
