Page({
  data: {
    menuList: [
      { icon: '📝', text: '我的发布' },
      { icon: '❤️', text: '我的收藏' },
      { icon: '💬', text: '我的评论' },
      { icon: '👍', text: '我的点赞' }
    ],
    settingsList: [
      { icon: '🔔', text: '消息设置' },
      { icon: '🌙', text: '夜间模式' },
      { icon: '👤', text: '编辑资料' },
      { icon: '⚙️', text: '系统设置' }
    ]
  },
  onLoad: function() {
    console.log('UserCenterPage Load');
  }
});