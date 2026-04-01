// pages/camera/camera.js
Page({
  data: {
    cameraUrl: '',
    fullCameraUrl: '',
    connected: false,
    streamLoaded: false,
    history: []
  },

  onLoad(options) {
    console.log('摄像头页面加载')
    // 加载历史记录
    this.loadHistory()
  },

  // 输入URL
  onUrlInput(e) {
    this.setData({
      cameraUrl: e.detail.value
    })
  },

  // 连接摄像头
  connectCamera() {
    let url = this.data.cameraUrl.trim()

    if (!url) {
      wx.showToast({
        title: '请输入IP地址',
        icon: 'none'
      })
      return
    }

    // 自动添加http://前缀（如果没有的话）
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'http://' + url
    }

    // 自动添加端口号81（摄像头固定端口，如果用户没有指定端口的话）
    // 检查URL中是否已经包含端口号
    const urlWithoutProtocol = url.replace(/^https?:\/\//, '')
    const hasPort = urlWithoutProtocol.includes(':')
    const hasPath = urlWithoutProtocol.includes('/')

    if (!hasPort) {
      // 如果没有端口号，添加:81
      if (hasPath) {
        // 如果有路径，在路径前插入端口号
        url = url.replace(/(\d+\.\d+\.\d+\.\d+)(\/.*)?/, '$1:81$2')
      } else {
        // 如果没有路径，直接添加端口号
        url = url + ':81'
      }
    }

    // 自动添加/stream路径（如果没有指定路径的话）
    if (!url.includes('/stream') && !url.includes('/cam') && !url.includes('.jpg') && !url.includes('/capture')) {
      url = url + '/stream'
    }

    console.log('最终连接URL:', url)

    // 保存到历史记录
    this.saveToHistory(this.data.cameraUrl.trim())

    // 连接
    this.setData({
      fullCameraUrl: url,
      connected: true
    })

    wx.showToast({
      title: '正在连接...',
      icon: 'loading'
    })
  },

  // 断开连接
  disconnectCamera() {
    this.setData({
      connected: false,
      fullCameraUrl: '',
      streamLoaded: false
    })

    wx.showToast({
      title: '已断开连接',
      icon: 'none'
    })
  },

  // 视频流加载成功
  onStreamLoad() {
    this.setData({ streamLoaded: true })
    wx.showToast({
      title: '连接成功',
      icon: 'success'
    })
  },

  // 视频流加载失败
  onStreamError(e) {
    console.error('视频流加载失败:', e)
    wx.showToast({
      title: '连接失败,请检查地址',
      icon: 'none',
      duration: 3000
    })
    this.setData({ streamLoaded: false })
  },

  // 保存到历史记录
  saveToHistory(url) {
    let history = this.data.history

    // 如果已存在，先移除
    const index = history.indexOf(url)
    if (index > -1) {
      history.splice(index, 1)
    }

    // 添加到开头
    history.unshift(url)

    // 最多保存5条
    if (history.length > 5) {
      history = history.slice(0, 5)
    }

    this.setData({ history })

    // 保存到本地存储
    wx.setStorageSync('camera_history', history)
  },

  // 加载历史记录
  loadHistory() {
    try {
      const history = wx.getStorageSync('camera_history') || []
      this.setData({ history })
    } catch (error) {
      console.error('加载历史记录失败:', error)
    }
  },

  // 选择历史记录
  selectHistory(e) {
    const url = e.currentTarget.dataset.url
    this.setData({
      cameraUrl: url
    })
  },

  // 清空历史记录
  clearHistory() {
    wx.showModal({
      title: '确认',
      content: '确定要清空历史记录吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({ history: [] })
          wx.removeStorageSync('camera_history')
          wx.showToast({
            title: '已清空',
            icon: 'success'
          })
        }
      }
    })
  }
})