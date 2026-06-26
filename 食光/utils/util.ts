// 通用工具函数

// 生成唯一ID
export const generateId = (): number => {
  return Date.now() + Math.floor(Math.random() * 10000)
}

// 格式化日期
export const formatTime = (date: Date): string => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  return [year, month, day].map(formatNumber).join('/') + ' ' +
    [hour, minute, second].map(formatNumber).join(':')
}

// 简短日期
export const formatDate = (date: Date): string => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return '刚刚'
  if (mins < 60) return `${mins}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return formatDateOnly(date)
}

// 仅日期
export const formatDateOnly = (date: Date): string => {
  return [date.getFullYear(), date.getMonth() + 1, date.getDate()].map(formatNumber).join('-')
}

const formatNumber = (n: number): string => {
  const s = n.toString()
  return s[1] ? s : '0' + s
}

// 获取当前时间字符串
export const now = (): string => {
  return new Date().toISOString()
}

// 防抖
export const debounce = (fn: Function, delay: number) => {
  let timer: any = null
  return function (this: any, ...args: any[]) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), delay)
  }
}

// 深拷贝
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj))
}

// 随机取数组元素
export const randomPick = <T>(arr: T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)]
}

// 随机打乱数组
export const shuffle = <T>(arr: T[]): T[] => {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

// 图片压缩（微信小程序）
export const compressImage = (src: string, quality: number = 80): Promise<string> => {
  return new Promise((resolve, reject) => {
    wx.compressImage({
      src,
      quality,
      success: (res) => resolve(res.tempFilePath),
      fail: reject
    })
  })
}

// 选择图片
export const chooseImage = (count: number = 1): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    wx.chooseImage({
      count,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => resolve(res.tempFilePaths),
      fail: reject
    })
  })
}

// 选择图片并裁剪到指定比例
// cropScale: '1:1' (灵宠) | '4:3' (菜谱) | 'free' (自由)
export const chooseAndCropImage = (cropScale: string = 'free', count: number = 1): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    // 如果是自由比例，直接用 chooseImage
    if (cropScale === 'free') {
      wx.chooseImage({
        count,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => resolve(res.tempFilePaths),
        fail: reject
      })
      return
    }

    // 需要裁剪：先选图再逐个裁剪
    wx.chooseImage({
      count,
      sizeType: ['original'],  // 原图保证裁剪质量
      sourceType: ['album', 'camera'],
      success: (res) => {
        const paths = res.tempFilePaths
        const results: string[] = []
        let done = 0
        const cropOne = (i: number) => {
          wx.cropImage({
            src: paths[i],
            cropScale: cropScale,
            success: (cropRes: any) => {
              results[i] = cropRes.tempFilePath
              done++
              if (done >= paths.length) resolve(results.filter(Boolean))
            },
            fail: () => {
              // 裁剪失败用原图
              results[i] = paths[i]
              done++
              if (done >= paths.length) resolve(results.filter(Boolean))
            }
          })
        }
        for (let i = 0; i < paths.length; i++) cropOne(i)
      },
      fail: reject
    })
  })
}

// 显示加载
export const showLoading = (title: string = '加载中...') => {
  wx.showLoading({ title, mask: true })
}

// 隐藏加载
export const hideLoading = () => {
  wx.hideLoading()
}

// 显示提示
export const showToast = (title: string, icon: 'success' | 'error' | 'none' = 'none') => {
  wx.showToast({ title, icon, duration: 2000 })
}
