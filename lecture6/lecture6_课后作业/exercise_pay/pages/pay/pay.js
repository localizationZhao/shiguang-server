/**
 * pay.js - 微信支付页面逻辑文件
 * 功能：微信支付API调用、MD5签名生成、支付结果处理
 * 知识点：wx.requestPayment、paySign签名、支付回调处理
 */

Page({

  /**
   * 页面初始数据
   * 知识点：data数据绑定，Mustache语法
   */
  data: {
    // 商品信息
    productInfo: {
      title: '微信小程序开发实战',
      description: '从入门到精通，全面掌握小程序开发技能。包含基础组件、API调用、支付功能等核心知识点。',
      price: '99.00',
      image: '/images/book.svg'
    },

    // 支付参数（课件核心知识点）
    payParams: {
      timeStamp: '',      // 时间戳
      nonceStr: '',       // 随机字符串
      package: '',        // 订单详情扩展字符串（prepay_id格式）
      signType: 'MD5',    // 签名方式
      paySign: ''         // 签名
    },

    // 签名计算规则说明
    signRule: 'paySign = MD5(appId=wxd678efh567hg6787&nonceStr=xxx&package=prepay_id=xxx&signType=MD5&timeStamp=xxx&key=xxx)',

    // 支付结果相关
    showResult: false,
    paySuccess: false,
    resultMessage: '',
    orderInfo: {
      orderId: '',
      payTime: '',
      amount: ''
    }
  },

  /**
   * 页面加载生命周期
   * 知识点：onLoad生命周期、数据初始化
   */
  onLoad: function (options) {
    console.log('支付页面加载')
    
    // 初始化支付参数
    this.initPayParams()
  },

  /**
   * 初始化支付参数
   * 知识点：时间戳生成、随机字符串生成、签名计算
   */
  initPayParams: function () {
    // 1. 生成时间戳（秒级）
    // 知识点：Date.getTime() 返回毫秒，需除以1000转为秒
    var timeStamp = Math.floor(Date.now() / 1000).toString()
    
    // 2. 生成随机字符串（nonceStr）
    // 知识点：随机字符串要求32位以内，用于防重放攻击
    var nonceStr = this.generateNonceStr()
    
    // 3. 模拟prepay_id格式
    // 知识点：实际prepay_id需从商户服务器调用微信支付统一下单接口获取
    var packageStr = 'prepay_id=wx20260627' + timeStamp + 'demo123456'
    
    // 4. 签名类型
    // 知识点：signType支持MD5、HMAC-SHA256，课件使用MD5
    var signType = 'MD5'
    
    // 5. 计算签名 paySign（课件核心知识点）
    // 知识点：签名规则 - 按字典序拼接参数+key，再进行MD5加密
    var paySign = this.calculatePaySign(timeStamp, nonceStr, packageStr, signType)
    
    // 更新页面数据
    this.setData({
      payParams: {
        timeStamp: timeStamp,
        nonceStr: nonceStr,
        package: packageStr,
        signType: signType,
        paySign: paySign
      }
    })
    
    console.log('支付参数初始化完成:')
    console.log('timeStamp:', timeStamp)
    console.log('nonceStr:', nonceStr)
    console.log('package:', packageStr)
    console.log('signType:', signType)
    console.log('paySign:', paySign)
  },

  /**
   * 生成随机字符串 nonceStr
   * 知识点：nonceStr要求 - 32位以内随机字符串
   * @returns {string} 随机字符串
   */
  generateNonceStr: function () {
    // 模拟课件示例中的随机字符串格式
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    var nonceStr = ''
    for (var i = 0; i < 32; i++) {
      nonceStr += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return nonceStr
  },

  /**
   * 计算支付签名 paySign（课件核心知识点）
   * 知识点：MD5签名计算规则
   * 
   * 签名规则（课件示例）：
   * paySign = MD5(appId=wxd678efh567hg6787&nonceStr=xxx&package=prepay_id=xxx&signType=MD5&timeStamp=xxx&key=xxx)
   * 
   * @param {string} timeStamp - 时间戳
   * @param {string} nonceStr - 随机字符串
   * @param {string} packageStr - prepay_id格式字符串
   * @param {string} signType - 签名类型
   * @returns {string} MD5签名结果
   */
  calculatePaySign: function (timeStamp, nonceStr, packageStr, signType) {
    // 模拟小程序AppId和商户密钥（课件演示用）
    // 知识点：实际开发中AppId从app.json获取，key从商户服务器获取
    var appId = 'wxd678efh567hg6787'  // 课件示例AppId
    var key = 'qazwsxedcrfvtgbyhnujmikolp111111'  // 课件示例商户密钥（32位）

    // 第一步：按字典序拼接参数（知识点：参数名按ASCII码从小到大排序）
    // 拼接格式：appId=xxx&nonceStr=xxx&package=xxx&signType=xxx&timeStamp=xxx
    var paramsStr = 'appId=' + appId + 
                    '&nonceStr=' + nonceStr + 
                    '&package=' + packageStr + 
                    '&signType=' + signType + 
                    '&timeStamp=' + timeStamp + 
                    '&key=' + key

    console.log('签名拼接字符串:', paramsStr)

    // 第二步：对拼接字符串进行MD5加密（知识点：MD5摘要算法）
    // 知识点：微信小程序无内置MD5函数，实际开发需引入加密库或由后端计算
    // 此处模拟返回32位MD5签名格式（演示用）
    var paySign = this.mockMD5(paramsStr)

    console.log('paySign签名结果:', paySign)

    return paySign
  },

  /**
   * 模拟MD5加密函数（演示用）
   * 知识点：实际开发需使用crypto库或后端计算
   * 课件示例返回格式：32位十六进制字符串
   * 
   * @param {string} str - 待加密字符串
   * @returns {string} 模拟MD5结果
   */
  mockMD5: function (str) {
    // 模拟课件示例中的签名结果格式
    // 实际MD5加密需引入第三方库（如crypto-js）
    // 课件示例签名：22D9B4E54AB1950F51E0...
    
    // 简化模拟：返回固定格式签名（演示用）
    var hash = ''
    for (var i = 0; i < str.length; i++) {
      hash += (str.charCodeAt(i) % 16).toString(16)
    }
    // 补齐到32位
    while (hash.length < 32) {
      hash += '0'
    }
    return hash.substring(0, 32).toUpperCase()
  },

  /**
   * 处理支付按钮点击
   * 知识点：wx.requestPayment API调用（课件核心知识点）
   */
  handlePayment: function () {
    console.log('用户点击支付按钮')
    
    // 获取当前支付参数
    var params = this.data.payParams
    
    // 知识点：wx.requestPayment API（课件核心）
    // 调用微信支付，唤起支付密码输入界面
    wx.requestPayment({
      // 参数1：时间戳
      timeStamp: params.timeStamp,
      
      // 参数2：随机字符串
      nonceStr: params.nonceStr,
      
      // 参数3：订单详情扩展字符串
      package: params.package,
      
      // 参数4：签名方式
      signType: params.signType,
      
      // 参数5：签名
      paySign: params.paySign,

      /**
       * 成功回调 - 支付完成
       * 知识点：支付成功后的业务处理
       */
      success: function (res) {
        console.log('支付成功回调:', res)
        console.log('支付成功，errMsg:', res.errMsg)
        
        // 生成订单信息
        var orderId = 'ORDER_' + Date.now()
        var payTime = this.formatTime(Date.now())
        var amount = this.data.productInfo.price
        
        // 更新页面显示支付成功
        this.setData({
          showResult: true,
          paySuccess: true,
          resultMessage: '恭喜您，支付已完成！',
          orderInfo: {
            orderId: orderId,
            payTime: payTime,
            amount: amount
          }
        })
        
        // 弹出成功提示
        wx.showToast({
          title: '支付成功',
          icon: 'success',
          duration: 2000
        })
        
        console.log('订单信息:', orderId, payTime, amount)
      }.bind(this),

      /**
       * 失败回调 - 支付失败或用户取消
       * 知识点：异常场景处理 - 用户取消、参数错误、支付失败
       */
      fail: function (res) {
        console.log('支付失败回调:', res)
        console.log('支付失败，errMsg:', res.errMsg)
        
        var failMessage = ''
        
        // 判断失败原因
        if (res.errMsg.indexOf('requestPayment:fail cancel') !== -1) {
          // 知识点：用户主动取消支付
          failMessage = '您已取消支付'
          console.log('用户取消支付')
        } else if (res.errMsg.indexOf('requestPayment:fail') !== -1) {
          // 知识点：支付调用失败（参数错误、网络问题等）
          failMessage = '支付失败：' + res.errMsg
          console.log('支付调用失败:', res.errMsg)
        } else {
          failMessage = '支付异常'
          console.log('支付异常:', res.errMsg)
        }
        
        // 更新页面显示支付失败
        this.setData({
          showResult: true,
          paySuccess: false,
          resultMessage: failMessage
        })
        
        // 弹出失败提示
        wx.showModal({
          title: '支付提示',
          content: failMessage,
          showCancel: false,
          confirmText: '知道了'
        })
      }.bind(this),

      /**
       * 完成回调 - 无论成功失败都会执行
       * 知识点：complete回调用于清理资源、记录日志
       */
      complete: function (res) {
        console.log('支付API调用完成')
        console.log('complete回调:', res.errMsg)
      }
    })
  },

  /**
   * 格式化时间
   * @param {number} timestamp - 时间戳（毫秒）
   * @returns {string} 格式化后的时间字符串
   */
  formatTime: function (timestamp) {
    var date = new Date(timestamp)
    var year = date.getFullYear()
    var month = (date.getMonth() + 1).toString().padStart(2, '0')
    var day = date.getDate().toString().padStart(2, '0')
    var hour = date.getHours().toString().padStart(2, '0')
    var minute = date.getMinutes().toString().padStart(2, '0')
    var second = date.getSeconds().toString().padStart(2, '0')
    
    return year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second
  },

  /**
   * 处理图片加载错误
   * 知识点：binderror事件处理图片加载失败
   */
  handleImageError: function (e) {
    console.log('书籍封面图片加载失败:', e.detail.errMsg)
    // 图片加载失败时使用占位图
    this.setData({
      'productInfo.image': '/images/book-placeholder.svg'
    })
  },

  /**
   * 页面卸载生命周期
   * 知识点：清理资源
   */
  onUnload: function () {
    console.log('支付页面卸载')
  }
})