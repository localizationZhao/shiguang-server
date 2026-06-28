/**
 * record.js - 录音与播放页面逻辑文件
 * 功能：三大模块完整实现 - 录音API、文件管理API、音频控制API
 * 知识点：wx.startRecord/stopRecord、wx.saveFile/getFileInfo、wx.playVoice/pauseVoice/stopVoice
 * 注意：使用课程讲授的旧版API，适配lecture5教学内容
 */

Page({
  /**
   * 页面数据对象
   */
  data: {
    isSpeaking: false,
    picId: 1,
    recordStatus: '',
    tempFilePath: '',
    voices: [],
    currentPlayPath: '',
    currentPlayPathShort: '',
    isPlaying: false,
    isPaused: false
  },

  /**
   * 音量动画定时器
   */
  speakTimer: null,

  /**
   * onLoad - 页面加载
   */
  onLoad: function () {
    console.log('录音与播放页面加载')

    var savedVoices = wx.getStorageSync('voices') || []
    this.setData({ voices: savedVoices })

    console.log('已加载 ' + savedVoices.length + ' 条历史录音')
  },

  /**
   * onUnload - 页面卸载
   */
  onUnload: function () {
    if (this.speakTimer) {
      clearInterval(this.speakTimer)
      this.speakTimer = null
    }

    wx.stopRecord()
    wx.stopVoice()
  },

  // ==================== 模块一：录音功能 ====================

  /**
   * handleTouchStart - 按下录音按钮
   * 知识点：wx.startRecord API
   */
  handleTouchStart: function () {
    console.log('按下录音按钮')

    var that = this

    that.setData({
      isSpeaking: true,
      picId: 1,
      recordStatus: '正在录音...'
    })

    that.startSpeakAnimation()

    wx.startRecord({
      success: function (res) {
        console.log('录音成功:', res)
        var tempFilePath = res.tempFilePath

        that.setData({ tempFilePath: tempFilePath })

        wx.showToast({
          title: '录音完成',
          icon: 'success',
          duration: 2000
        })

        that.saveRecordingFile(tempFilePath)
      },

      fail: function (err) {
        console.error('录音失败:', err)

        that.stopSpeakAnimation()

        that.setData({
          isSpeaking: false,
          recordStatus: ''
        })

        if (err.errMsg && err.errMsg.indexOf('auth deny') !== -1) {
          wx.showModal({
            title: '录音权限被拒绝',
            content: '请在设置中开启麦克风权限',
            confirmText: '去设置',
            success: function (modalRes) {
              if (modalRes.confirm) {
                wx.openSetting({
                  success: function (res) {
                    if (res.authSetting['scope.record']) {
                      wx.showToast({
                        title: '权限已开启',
                        icon: 'success'
                      })
                    }
                  }
                })
              }
            }
          })
        } else {
          wx.showToast({
            title: '录音失败',
            icon: 'none',
            duration: 2000
          })
        }
      },

      complete: function () {
        console.log('录音API调用完成')
      }
    })
  },

  /**
   * handleTouchEnd - 松开录音按钮
   * 知识点：wx.stopRecord API
   */
  handleTouchEnd: function () {
    console.log('松开录音按钮')

    var that = this

    that.stopSpeakAnimation()

    wx.stopRecord({
      success: function (res) {
        console.log('停止录音成功')
        that.setData({
          isSpeaking: false,
          recordStatus: '录音已结束'
        })
      },
      fail: function (err) {
        console.error('停止录音失败:', err)
        that.setData({
          isSpeaking: false,
          recordStatus: '录音失败'
        })
      },
      complete: function () {
        console.log('停止录音API调用完成')
      }
    })
  },

  /**
   * startSpeakAnimation - 启动音量动画
   */
  startSpeakAnimation: function () {
    var that = this

    that.speakTimer = setInterval(function () {
      var currentPicId = that.data.picId
      var nextPicId = currentPicId >= 5 ? 1 : currentPicId + 1
      that.setData({ picId: nextPicId })
      console.log('音量动画切换：' + currentPicId + ' -> ' + nextPicId)
    }, 200)
  },

  /**
   * stopSpeakAnimation - 停止音量动画
   */
  stopSpeakAnimation: function () {
    if (this.speakTimer) {
      clearInterval(this.speakTimer)
      this.speakTimer = null
      console.log('音量动画已停止')
    }
  },

  // ==================== 模块二：文件管理功能 ====================

  /**
   * saveRecordingFile - 保存录音文件
   * 知识点：wx.saveFile API
   */
  saveRecordingFile: function (tempFilePath) {
    var that = this

    console.log('开始保存录音文件:', tempFilePath)

    wx.saveFile({
      tempFilePath: tempFilePath,

      success: function (res) {
        console.log('文件保存成功:', res)
        var savedFilePath = res.savedFilePath

        that.getFileInfoAndAddToList(savedFilePath)
      },

      fail: function (err) {
        console.error('文件保存失败:', err)
        wx.showToast({
          title: '保存失败',
          icon: 'none',
          duration: 2000
        })
      },

      complete: function () {
        console.log('保存文件API调用完成')
      }
    })
  },

  /**
   * getFileInfoAndAddToList - 获取文件信息
   * 知识点：wx.getFileInfo API
   */
  getFileInfoAndAddToList: function (filePath) {
    var that = this

    wx.getFileInfo({
      filePath: filePath,

      success: function (res) {
        console.log('获取文件信息成功:', res)

        var fileSizeInBytes = res.size
        var fileSizeInKB = (fileSizeInBytes / 1024).toFixed(2) + ' KB'

        var createTime = that.formatDateTime(new Date())
        var filePathShort = filePath.substring(filePath.lastIndexOf('/') + 1)

        var voiceRecord = {
          filePath: filePath,
          filePathShort: filePathShort,
          createTime: createTime,
          fileSize: fileSizeInKB
        }

        var voices = that.data.voices
        voices.push(voiceRecord)

        that.setData({ voices: voices })
        wx.setStorageSync('voices', voices)

        console.log('录音记录已添加:', voiceRecord)

        wx.showToast({
          title: '录音已保存',
          icon: 'success',
          duration: 2000
        })
      },

      fail: function (err) {
        console.error('获取文件信息失败:', err)

        var createTime = that.formatDateTime(new Date())
        var filePathShort = filePath.substring(filePath.lastIndexOf('/') + 1)

        var voiceRecord = {
          filePath: filePath,
          filePathShort: filePathShort,
          createTime: createTime,
          fileSize: '未知'
        }

        var voices = that.data.voices
        voices.push(voiceRecord)

        that.setData({ voices: voices })
        wx.setStorageSync('voices', voices)
      },

      complete: function () {
        console.log('获取文件信息API调用完成')
      }
    })
  },

  /**
   * formatDateTime - 格式化日期时间
   */
  formatDateTime: function (date) {
    var year = date.getFullYear()
    var month = this.padZero(date.getMonth() + 1)
    var day = this.padZero(date.getDate())
    var hour = this.padZero(date.getHours())
    var minute = this.padZero(date.getMinutes())
    var second = this.padZero(date.getSeconds())

    return year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second
  },

  /**
   * padZero - 数字补零
   */
  padZero: function (num) {
    return num < 10 ? '0' + num : num.toString()
  },

  // ==================== 模块三：音频播放控制 ====================

  /**
   * handlePlayVoice - 点击录音列表项播放
   */
  handlePlayVoice: function (e) {
    var filePath = e.currentTarget.dataset.key

    console.log('点击播放录音:', filePath)

    var filePathShort = filePath.substring(filePath.lastIndexOf('/') + 1)

    this.setData({
      currentPlayPath: filePath,
      currentPlayPathShort: filePathShort
    })

    this.playVoiceFile(filePath)
  },

  /**
   * handleStartPlay - 开始播放按钮
   * 知识点：wx.playVoice API
   */
  handleStartPlay: function () {
    var filePath = this.data.currentPlayPath

    if (!filePath) {
      wx.showToast({
        title: '请先选择录音文件',
        icon: 'none',
        duration: 2000
      })
      return
    }

    this.playVoiceFile(filePath)
  },

  /**
   * playVoiceFile - 播放录音文件
   */
  playVoiceFile: function (filePath) {
    var that = this

    console.log('开始播放录音:', filePath)

    wx.playVoice({
      filePath: filePath,

      success: function () {
        console.log('播放成功')

        that.setData({
          isPlaying: true,
          isPaused: false
        })

        wx.showToast({
          title: '开始播放',
          icon: 'success',
          duration: 1500
        })
      },

      fail: function (err) {
        console.error('播放失败:', err)

        that.setData({
          isPlaying: false,
          isPaused: false
        })

        wx.showToast({
          title: '播放失败',
          icon: 'none',
          duration: 2000
        })
      },

      complete: function () {
        console.log('播放API调用完成')
      }
    })

    wx.onVoicePlayEnd({
      success: function (res) {
        console.log('播放结束:', res)

        that.setData({
          isPlaying: false,
          isPaused: false
        })
      },
      fail: function (err) {
        console.error('监听播放结束失败:', err)
      }
    })
  },

  /**
   * handlePausePlay - 暂停播放
   * 知识点：wx.pauseVoice API
   */
  handlePausePlay: function () {
    var that = this

    console.log('暂停播放')

    wx.pauseVoice()

    that.setData({
      isPlaying: false,
      isPaused: true
    })

    wx.showToast({
      title: '已暂停',
      icon: 'none',
      duration: 1500
    })
  },

  /**
   * handleResumePlay - 继续播放
   */
  handleResumePlay: function () {
    var that = this
    var filePath = that.data.currentPlayPath

    console.log('继续播放')

    if (!filePath) {
      wx.showToast({
        title: '请先选择录音文件',
        icon: 'none',
        duration: 2000
      })
      return
    }

    wx.playVoice({
      filePath: filePath,

      success: function () {
        console.log('继续播放成功')

        that.setData({
          isPlaying: true,
          isPaused: false
        })

        wx.showToast({
          title: '继续播放',
          icon: 'none',
          duration: 1500
        })
      },

      fail: function (err) {
        console.error('继续播放失败:', err)

        wx.showToast({
          title: '继续播放失败',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },

  /**
   * handleStopPlay - 结束播放
   * 知识点：wx.stopVoice API
   */
  handleStopPlay: function () {
    var that = this

    console.log('停止播放')

    wx.stopVoice()

    that.setData({
      isPlaying: false,
      isPaused: false
    })

    wx.showToast({
      title: '已停止',
      icon: 'none',
      duration: 1500
    })
  }
})