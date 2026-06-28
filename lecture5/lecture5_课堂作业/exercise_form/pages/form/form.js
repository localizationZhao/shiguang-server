Page({
  data: {
    // ==================== 地图组件数据 ====================
    markers: [{
      id: 1,
      latitude: 23.099994,
      longitude: 113.324520,
      width: 30,
      height: 30,
      callout: {
        content: '标记点1',
        fontSize: 12,
        borderRadius: 5,
        bgColor: '#fff',
        padding: 5
      }
    }, {
      id: 2,
      latitude: 23.102994,
      longitude: 113.334520,
      width: 30,
      height: 30,
      callout: {
        content: '标记点2',
        fontSize: 12,
        borderRadius: 5,
        bgColor: '#fff',
        padding: 5
      }
    }],
    polyline: [{
      points: [{
        longitude: 113.324520,
        latitude: 23.099994
      }, {
        longitude: 113.334520,
        latitude: 23.102994
      }, {
        longitude: 113.344520,
        latitude: 23.105994
      }],
      color: '#ff5400',
      width: 2,
      dottedLine: true
    }],
    controls: [],
    circles: [{
      latitude: 23.099994,
      longitude: 113.324520,
      radius: 500,
      strokeColor: '#ff5400',
      strokeWidth: 2,
      fillColor: 'rgba(255, 84, 0, 0.1)'
    }],
    mapEventText: '',
    
    // ==================== 多选框数据 ====================
    checkboxItems: [{
      name: '中国',
      value: 'china',
      checked: true
    }, {
      name: '美国',
      value: 'usa',
      checked: false
    }, {
      name: '日本',
      value: 'japan',
      checked: false
    }, {
      name: '英国',
      value: 'uk',
      checked: false
    }],
    checkboxResult: '',
    
    // ==================== 单选框数据 ====================
    radioItems: [{
      name: '男',
      value: 'male'
    }, {
      name: '女',
      value: 'female'
    }],
    radioResult: '',
    
    // 自定义单选数据
    customRadioItems: [{
      id: 'area1',
      name: '区域一'
    }, {
      id: 'area2',
      name: '区域二'
    }, {
      id: 'area3',
      name: '区域三'
    }],
    selectedArea: '',
    customRadioResult: '',
    
    // ==================== 开关组件数据 ====================
    switch1: false,
    switch2: true,
    switchSelect: false,
    sliderValue: 50,
    
    // ==================== 选择器数据 ====================
    array: ['选项一', '选项二', '选项三', '选项四'],
    pickerIndex: -1,
    timeValue: '',
    dateValue: '',
    
    // picker-view数据
    province: ['广东省', '北京市', '上海市'],
    city: ['广州市', '深圳市', '珠海市'],
    pickerViewValue: [0, 0],
    
    // ==================== 表单综合数据 ====================
    formData: {
      username: ''
    },
    formSubmitResult: ''
  },

  // ==================== 地图组件事件 ====================
  bindcontroltap: function (e) {
    console.log('控件点击事件', e)
    this.setData({
      mapEventText: '控件点击 - id: ' + e.detail.controlId
    })
  },
  bindmarkertap: function (e) {
    console.log('标记点点击事件', e)
    this.setData({
      mapEventText: '标记点点击 - id: ' + e.detail.markerId
    })
  },
  bindregionchange: function (e) {
    console.log('视野变化事件', e)
    this.setData({
      mapEventText: '视野变化 - type: ' + e.detail.type
    })
  },
  bindtap: function (e) {
    console.log('地图点击事件', e)
    this.setData({
      mapEventText: '地图点击 - longitude: ' + e.detail.longitude + ', latitude: ' + e.detail.latitude
    })
  },
  
  // ==================== 多选框事件 ====================
  listenCheckboxChange: function (e) {
    console.log('checkbox change', e)
    console.log('选中的value数组:', e.detail.value)
    
    var selectedValues = e.detail.value
    var selectedNames = []
    
    for (var i = 0; i < this.data.checkboxItems.length; i++) {
      if (selectedValues.indexOf(this.data.checkboxItems[i].value) !== -1) {
        selectedNames.push(this.data.checkboxItems[i].name)
      }
    }
    
    this.setData({
      checkboxResult: selectedNames.join(', ') || '未选中任何选项'
    })
  },
  
  // ==================== 单选框事件 ====================
  radioChange: function (e) {
    console.log('radio change', e)
    console.log('选中的值:', e.detail.value)
    
    this.setData({
      radioResult: e.detail.value === 'male' ? '男' : '女'
    })
  },
  
  selectAreaOk: function (e) {
    var areaId = e.currentTarget.dataset.areaid
    console.log('自定义单选点击', areaId)
    
    this.setData({
      selectedArea: areaId
    })
    
    var selectedName = ''
    for (var i = 0; i < this.data.customRadioItems.length; i++) {
      if (this.data.customRadioItems[i].id === areaId) {
        selectedName = this.data.customRadioItems[i].name
        break
      }
    }
    
    this.setData({
      customRadioResult: selectedName
    })
  },
  
  // ==================== 开关组件事件 ====================
  switch1Change: function (e) {
    console.log('switch1 change', e)
    this.setData({
      switch1: e.detail.value
    })
  },
  
  switch2Change: function (e) {
    console.log('switch2 change', e)
    this.setData({
      switch2: e.detail.value
    })
  },
  
  switchOpen: function () {
    this.setData({
      switchSelect: true
    })
  },
  
  switchClose: function () {
    this.setData({
      switchSelect: false
    })
  },
  
  sliderChange: function (e) {
    this.setData({
      sliderValue: e.detail.value
    })
  },
  
  // ==================== 滑动选择器事件 ====================
  sliderBindchange: function (e) {
    console.log('slider change', e)
    this.setData({
      sliderValue: e.detail.value
    })
  },
  
  // ==================== 选择器事件 ====================
  pickerChange: function (e) {
    console.log('picker change', e)
    this.setData({
      pickerIndex: e.detail.value
    })
  },
  
  timePickerChange: function (e) {
    console.log('time picker change', e)
    this.setData({
      timeValue: e.detail.value
    })
  },
  
  datePickerChange: function (e) {
    console.log('date picker change', e)
    this.setData({
      dateValue: e.detail.value
    })
  },
  
  pickerViewChange: function (e) {
    console.log('picker-view change', e)
    this.setData({
      pickerViewValue: e.detail.value
    })
  },
  
  // ==================== 表单综合事件 ====================
  formSubmit: function (e) {
    console.log('form submit', e)
    console.log('表单数据:', e.detail.value)
    
    var formData = e.detail.value
    var result = '用户名: ' + (formData.username || '未填写') + 
                 ', 性别: ' + (formData.gender === 'male' ? '男' : formData.gender === 'female' ? '女' : '未选择') + 
                 ', 爱好: ' + (formData.hobby ? formData.hobby.join(', ') : '未选择') + 
                 ', 通知: ' + (formData.notification ? '开' : '关') + 
                 ', 分数: ' + (formData.score || 0)
    
    this.setData({
      formSubmitResult: result
    })
  },
  
  formReset: function () {
    console.log('form reset')
    this.setData({
      formSubmitResult: '',
      formData: {
        username: ''
      }
    })
    wx.showToast({
      title: '表单已重置',
      icon: 'success',
      duration: 2000
    })
  },
  
  // ==================== 页面生命周期 ====================
  onLoad: function () {
    console.log('表单组件页面加载')
  },
  
  onReady: function () {
    console.log('页面渲染完成，开始绘制画布')
    
    var ctx = wx.createCanvasContext('myCanvas')
    
    ctx.setFillStyle('#ff5400')
    ctx.fillRect(20, 20, 150, 100)
    
    ctx.setFillStyle('#fff')
    ctx.setFontSize(20)
    ctx.fillText('Hello Canvas', 40, 80)
    
    ctx.setStrokeStyle('#000')
    ctx.setLineWidth(2)
    ctx.beginPath()
    ctx.moveTo(20, 150)
    ctx.lineTo(170, 150)
    ctx.stroke()
    
    ctx.draw()
  },
  
  onShow: function () {
    console.log('页面显示')
  },
  
  onHide: function () {
    console.log('页面隐藏')
  }
})