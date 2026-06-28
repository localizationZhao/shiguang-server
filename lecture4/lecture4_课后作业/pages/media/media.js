var audioManager = null

Page({
  data: {
    imageInfo: '',
    audioPath: '',
    audioStatus: '',
    musicStatus: '',
    poster: 'http://y.gtimg.cn/music/photo_new/T002R300x300M000003rsKF44GyaSk.jpg',
    name: '此时此刻',
    author: '许巍',
    src: 'http://ws.stream.qqmusic.qq.com/M500001VfvsJ21xFqb.mp3',
  },
  onLoad: function() {
    audioManager = wx.getBackgroundAudioManager()
    audioManager.onPlay(() => {
      this.setData({ audioStatus: '播放中' })
    })
    audioManager.onPause(() => {
      this.setData({ audioStatus: '已暂停' })
    })
    audioManager.onEnded(() => {
      this.setData({ audioStatus: '播放结束' })
    })
    audioManager.onStop(() => {
      this.setData({ audioStatus: '已停止' })
    })
  },
  testButtonClick11: function() {
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        var tempFilePaths = res.tempFilePaths
        wx.setStorageSync('selectedImage', tempFilePaths[0])
        wx.showToast({ title: '选择成功', icon: 'success' })
      }
    })
  },
  testButtonClick12: function() {
    var imagePath = wx.getStorageSync('selectedImage')
    if (imagePath) {
      wx.previewImage({
        urls: [imagePath],
        current: imagePath
      })
    } else {
      wx.showToast({ title: '请先选择图片', icon: 'none' })
    }
  },
  testButtonClick13: function() {
    var imagePath = wx.getStorageSync('selectedImage')
    if (imagePath) {
      wx.getImageInfo({
        src: imagePath,
        success: (res) => {
          var info = `宽:${res.width}px, 高:${res.height}px, 路径:${res.path}`
          this.setData({ imageInfo: info })
        }
      })
    } else {
      wx.showToast({ title: '请先选择图片', icon: 'none' })
    }
  },
  testButtonClick14: function() {
    var imagePath = wx.getStorageSync('selectedImage')
    if (imagePath) {
      wx.saveImageToPhotosAlbum({
        filePath: imagePath,
        success: () => {
          wx.showToast({ title: '保存成功', icon: 'success' })
        },
        fail: () => {
          wx.showToast({ title: '保存失败', icon: 'none' })
        }
      })
    } else {
      wx.showToast({ title: '请先选择图片', icon: 'none' })
    }
  },
  testButtonClick21: function() {
    wx.startRecord({
      success: (res) => {
        var tempFilePath = res.tempFilePath
        wx.setStorageSync('recordAudio', tempFilePath)
        this.setData({ audioPath: tempFilePath })
        wx.showToast({ title: '录音完成', icon: 'success' })
      },
      fail: () => {
        wx.showToast({ title: '录音失败', icon: 'none' })
      }
    })
    wx.showToast({ title: '正在录音...', icon: 'loading', duration: 10000 })
  },
  testButtonClick22: function() {
    wx.stopRecord()
    wx.hideToast()
  },
  testButtonClick31: function() {
    var audioPath = wx.getStorageSync('recordAudio')
    if (audioPath) {
      audioManager.src = audioPath
      audioManager.play()
    } else {
      wx.showToast({ title: '请先录音', icon: 'none' })
    }
  },
  testButtonClick32: function() {
    audioManager.pause()
  },
  testButtonClick33: function() {
    audioManager.play()
  },
  testButtonClick34: function() {
    audioManager.stop()
  },
  testButtonClick41: function() {
    wx.getBackgroundAudioPlayerState({
      success: (res) => {
        var statusMap = { 0: '暂停', 1: '播放中', 2: '停止' }
        var status = statusMap[res.status] || '未知'
        var info = `状态:${status}, 播放进度:${res.currentPosition}s, 总时长:${res.duration}s`
        this.setData({ musicStatus: info })
      },
      fail: () => {
        this.setData({ musicStatus: '获取状态失败' })
      }
    })
  },
  testButtonClick42: function() {
    audioManager.title = this.data.name
    audioManager.epname = this.data.name
    audioManager.singer = this.data.author
    audioManager.coverImgUrl = this.data.poster
    audioManager.src = this.data.src
    audioManager.play()
    this.setData({ musicStatus: '播放中' })
  },
  testButtonClick43: function() {
    audioManager.pause()
    this.setData({ musicStatus: '已暂停' })
  },
  testButtonClick44: function() {
    audioManager.seek(16)
    this.setData({ musicStatus: '已跳转到16秒' })
  },
  testButtonClick45: function() {
    audioManager.stop()
    this.setData({ musicStatus: '已停止' })
  },
  audioPlay: function() {
    var audioCtx = wx.createAudioContext('myAudio')
    audioCtx.play()
  },
  audioPause: function() {
    var audioCtx = wx.createAudioContext('myAudio')
    audioCtx.pause()
  },
  audio16: function() {
    var audioCtx = wx.createAudioContext('myAudio')
    audioCtx.seek(16)
  },
  audioStart: function() {
    var audioCtx = wx.createAudioContext('myAudio')
    audioCtx.seek(0)
  },
  backAudioPlay: function() {
    audioManager.title = this.data.name
    audioManager.singer = this.data.author
    audioManager.coverImgUrl = this.data.poster
    audioManager.src = this.data.src
    audioManager.play()
  },
  backAudioPause: function() {
    audioManager.pause()
  },
  backAudio16: function() {
    audioManager.seek(16)
  },
  backAudioStart: function() {
    audioManager.stop()
  }
})