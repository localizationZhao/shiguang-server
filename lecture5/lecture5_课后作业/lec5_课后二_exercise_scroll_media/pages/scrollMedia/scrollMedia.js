/**
 * scrollMedia.js - 横向滚动多媒体界面页面逻辑文件
 * 功能：管理页面数据、处理用户交互、调用媒体API
 * 知识点：setData数据更新、wx.chooseImage、wx.chooseVideo、事件绑定
 */

Page({
  /**
   * 页面初始数据
   * 所有媒体数据源绑定到data，通过Mustache语法渲染到视图
   */
  data: {
    // ===== 文字数据源 =====
    // 知识点：Mustache语法双向绑定，修改后视图自动更新
    textContent: '微信小程序左右滚动多媒体界面演示',
    textInput: '',

    // ===== 图片数据源 =====
    // 默认占位图片路径，使用网络图片确保初始显示
    imageSrc: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=beautiful%20nature%20landscape%20with%20mountains%20and%20lake&image_size=square',
    defaultImageSrc: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=beautiful%20nature%20landscape%20with%20mountains%20and%20lake&image_size=square',

    // ===== 音频数据源 =====
    // 初始音频源地址，使用网络音频确保可播放
    audioSrc: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    audioInput: '',

    // ===== 视频数据源 =====
    // 初始视频源地址，使用网络视频确保可播放
    videoSrc: 'https://www.w3schools.com/html/mov_bbb.mp4'
  },

  /**
   * 页面加载生命周期
   * 页面初始化完成时触发
   */
  onLoad: function (options) {
    console.log('横向滚动多媒体页面加载完成')
  },

  /**
   * ==================== 文字源控制函数 ====================
   */

  /**
   * handleTextInput - 监听文字输入框输入
   * 知识点：input组件bindinput事件，实时获取输入内容
   */
  handleTextInput: function (e) {
    this.setData({
      textInput: e.detail.value
    })
  },

  /**
   * updateText - 更新文字内容
   * 知识点：setData更新数据，Mustache语法自动渲染到视图
   * 校验输入内容，为空时给出友好提示
   */
  updateText: function () {
    var inputText = this.data.textInput.trim()
    
    // 输入校验
    if (!inputText) {
      wx.showToast({
        title: '请输入文字内容',
        icon: 'none',
        duration: 2000
      })
      return
    }

    // 使用setData更新数据，视图自动同步
    this.setData({
      textContent: inputText,
      textInput: ''
    })

    // 成功提示
    wx.showToast({
      title: '文字更新成功',
      icon: 'success',
      duration: 2000
    })
  },

  /**
   * ==================== 图片源控制函数 ====================
   */

  /**
   * chooseImage - 从相册选择图片
   * 知识点：wx.chooseImage接口，支持从相册选择单张图片
   * 完整覆盖success、fail、complete回调
   */
  chooseImage: function () {
    var that = this

    // 调用微信相册选择图片API
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album'],
      /**
       * 成功回调：获取选中图片的临时路径
       */
      success: function (res) {
        var tempFilePath = res.tempFilePaths[0]
        
        // 更新图片数据源
        that.setData({
          imageSrc: tempFilePath
        })

        // 成功提示
        wx.showToast({
          title: '图片选择成功',
          icon: 'success',
          duration: 2000
        })
      },
      /**
       * 失败回调：处理用户取消选择、授权失败等异常
       */
      fail: function (err) {
        console.error('选择图片失败:', err)
        
        // 区分不同错误类型，给出友好提示
        if (err.errMsg && err.errMsg.indexOf('cancel') !== -1) {
          wx.showToast({
            title: '已取消选择',
            icon: 'none',
            duration: 2000
          })
        } else {
          wx.showToast({
            title: '选择图片失败，请检查权限',
            icon: 'none',
            duration: 2000
          })
        }
      },
      /**
       * 完成回调：无论成功失败都会执行
       */
      complete: function () {
        console.log('选择图片操作完成')
      }
    })
  },

  /**
   * resetImage - 重置图片为默认图片
   * 知识点：setData恢复初始数据源
   */
  resetImage: function () {
    this.setData({
      imageSrc: this.data.defaultImageSrc
    })

    wx.showToast({
      title: '图片已重置',
      icon: 'success',
      duration: 2000
    })
  },

  /**
   * handleImageError - 图片加载错误处理
   */
  handleImageError: function (e) {
    console.error('图片加载失败:', e)
    wx.showToast({
      title: '图片加载失败',
      icon: 'none',
      duration: 2000
    })
  },

  /**
   * ==================== 音频源控制函数 ====================
   */

  /**
   * handleAudioInput - 监听音频URL输入框输入
   */
  handleAudioInput: function (e) {
    this.setData({
      audioInput: e.detail.value
    })
  },

  /**
   * updateAudio - 更新音频源
   * 知识点：audio组件src属性绑定变量，更新后立即生效
   * 校验输入地址格式，无效时给出友好提示
   */
  updateAudio: function () {
    var inputUrl = this.data.audioInput.trim()
    
    // 输入校验
    if (!inputUrl) {
      wx.showToast({
        title: '请输入音频地址',
        icon: 'none',
        duration: 2000
      })
      return
    }

    // 简单的URL格式校验
    if (!/^https?:\/\/.*\.(mp3|wav|ogg|aac)$/i.test(inputUrl)) {
      wx.showToast({
        title: '请输入有效的音频地址',
        icon: 'none',
        duration: 2000
      })
      return
    }

    // 更新音频数据源
    this.setData({
      audioSrc: inputUrl,
      audioInput: ''
    })

    wx.showToast({
      title: '音频源更新成功',
      icon: 'success',
      duration: 2000
    })
  },

  /**
   * handleAudioError - 音频播放错误处理
   */
  handleAudioError: function (e) {
    console.error('音频播放失败:', e)
    wx.showToast({
      title: '音频播放失败，请检查地址',
      icon: 'none',
      duration: 2000
    })
  },

  /**
   * ==================== 视频源控制函数 ====================
   */

  /**
   * chooseVideo - 拍摄或选择视频
   * 知识点：wx.chooseVideo接口，支持拍摄或从相册选择视频
   * 完整覆盖success、fail、complete回调
   */
  chooseVideo: function () {
    var that = this

    // 调用微信视频选择API
    wx.chooseVideo({
      sourceType: ['album', 'camera'],
      maxDuration: 60,
      camera: 'back',
      /**
       * 成功回调：获取选中视频的临时路径
       */
      success: function (res) {
        var tempFilePath = res.tempFilePath
        
        // 更新视频数据源
        that.setData({
          videoSrc: tempFilePath
        })

        // 成功提示
        wx.showToast({
          title: '视频选择成功',
          icon: 'success',
          duration: 2000
        })
      },
      /**
       * 失败回调：处理用户取消选择、授权失败等异常
       */
      fail: function (err) {
        console.error('选择视频失败:', err)
        
        // 区分不同错误类型，给出友好提示
        if (err.errMsg && err.errMsg.indexOf('cancel') !== -1) {
          wx.showToast({
            title: '已取消选择',
            icon: 'none',
            duration: 2000
          })
        } else {
          wx.showToast({
            title: '选择视频失败，请检查权限',
            icon: 'none',
            duration: 2000
          })
        }
      },
      /**
       * 完成回调：无论成功失败都会执行
       */
      complete: function () {
        console.log('选择视频操作完成')
      }
    })
  },

  /**
   * handleVideoError - 视频播放错误处理
   */
  handleVideoError: function (e) {
    console.error('视频播放失败:', e)
    wx.showToast({
      title: '视频播放失败，请检查地址',
      icon: 'none',
      duration: 2000
    })
  },

  /**
   * 页面相关生命周期函数
   */
  onReady: function () {
    console.log('页面渲染完成')
  },

  onShow: function () {
    console.log('页面显示')
  },

  onHide: function () {
    console.log('页面隐藏')
  },

  onUnload: function () {
    console.log('页面卸载')
  }
})