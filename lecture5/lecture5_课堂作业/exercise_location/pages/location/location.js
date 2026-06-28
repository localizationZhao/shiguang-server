Page({
  data: {
    currentLocation: {},
    currentLocationError: '',
    selectedLocation: {},
    chooseLocationError: '',
    openLocationError: '',
    authStatus: '',
    authError: ''
  },
  onLoad: function () {
    console.log('位置API页面加载完成')
    this.checkAuthStatus()
  },
  getCurrentLocation: function () {
    var that = this
    that.setData({ currentLocationError: '' })
    wx.getLocation({
      type: 'gcj02',
      altitude: true,
      success: function (res) {
        console.log('获取位置成功:', res)
        that.setData({
          currentLocation: {
            latitude: res.latitude.toFixed(6),
            longitude: res.longitude.toFixed(6),
            speed: res.speed,
            accuracy: res.accuracy,
            altitude: res.altitude,
            horizontalAccuracy: res.horizontalAccuracy,
            verticalAccuracy: res.verticalAccuracy
          }
        })
      },
      fail: function (err) {
        console.error('获取位置失败:', err)
        var errorMsg = '获取位置失败'
        if (err.errMsg && err.errMsg.includes('auth deny')) {
          errorMsg = '位置权限被拒绝，请在设置中开启'
        } else if (err.errMsg) {
          errorMsg = err.errMsg
        }
        that.setData({ currentLocationError: errorMsg })
      }
    })
  },
  chooseLocation: function () {
    var that = this
    that.setData({ chooseLocationError: '' })
    wx.chooseLocation({
      success: function (res) {
        console.log('选择位置成功:', res)
        that.setData({
          selectedLocation: {
            name: res.name,
            address: res.address,
            latitude: res.latitude.toFixed(6),
            longitude: res.longitude.toFixed(6)
          }
        })
      },
      fail: function (err) {
        console.error('选择位置失败:', err)
        var errorMsg = '选择位置失败'
        if (err.errMsg && err.errMsg.includes('cancel')) {
          errorMsg = '用户取消选择'
        } else if (err.errMsg) {
          errorMsg = err.errMsg
        }
        that.setData({ chooseLocationError: errorMsg })
      }
    })
  },
  openMapLocation: function () {
    this.openSelectedLocation()
  },
  openCurrentLocation: function () {
    var that = this
    var loc = that.data.currentLocation
    if (!loc.latitude) {
      wx.showToast({ title: '请先获取当前位置', icon: 'none' })
      return
    }
    that.setData({ openLocationError: '' })
    wx.openLocation({
      latitude: parseFloat(loc.latitude),
      longitude: parseFloat(loc.longitude),
      name: '当前位置',
      address: '获取到的当前位置',
      scale: 18,
      success: function () {
        console.log('打开地图成功')
      },
      fail: function (err) {
        console.error('打开地图失败:', err)
        that.setData({ openLocationError: err.errMsg || '打开地图失败' })
      }
    })
  },
  openSelectedLocation: function () {
    var that = this
    var loc = that.data.selectedLocation
    if (!loc.latitude) {
      wx.showToast({ title: '请先选择一个位置', icon: 'none' })
      return
    }
    that.setData({ openLocationError: '' })
    wx.openLocation({
      latitude: parseFloat(loc.latitude),
      longitude: parseFloat(loc.longitude),
      name: loc.name || '目标位置',
      address: loc.address || '',
      scale: 18,
      success: function () {
        console.log('打开地图成功')
      },
      fail: function (err) {
        console.error('打开地图失败:', err)
        that.setData({ openLocationError: err.errMsg || '打开地图失败' })
      }
    })
  },
  checkAuthStatus: function () {
    var that = this
    that.setData({ authError: '' })
    wx.getSetting({
      success: function (res) {
        console.log('获取设置成功:', res)
        var auth = res.authSetting['scope.userLocation']
        var status = ''
        if (auth === true) {
          status = '已授权'
        } else if (auth === false) {
          status = '已拒绝'
        } else {
          status = '未授权'
        }
        that.setData({ authStatus: status })
      },
      fail: function (err) {
        console.error('获取设置失败:', err)
        that.setData({ authError: err.errMsg || '获取授权状态失败' })
      }
    })
  },
  requestAuth: function () {
    var that = this
    that.setData({ authError: '' })
    wx.authorize({
      scope: 'scope.userLocation',
      success: function () {
        console.log('授权成功')
        wx.showToast({ title: '授权成功', icon: 'success' })
        that.checkAuthStatus()
      },
      fail: function (err) {
        console.error('授权失败:', err)
        if (err.errMsg && err.errMsg.includes('auth deny')) {
          wx.showModal({
            title: '提示',
            content: '位置权限已被拒绝，请在设置中手动开启',
            confirmText: '去设置',
            success: function (res) {
              if (res.confirm) {
                that.openSettings()
              }
            }
          })
        }
        that.checkAuthStatus()
      }
    })
  },
  openSettings: function () {
    var that = this
    wx.openSetting({
      success: function (res) {
        console.log('打开设置成功:', res)
        that.checkAuthStatus()
      },
      fail: function (err) {
        console.error('打开设置失败:', err)
        that.setData({ authError: err.errMsg || '打开设置失败' })
      }
    })
  },
  
})