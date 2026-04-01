// pages/sensor/sensor.js
const app = getApp()

Page({
  data: {
    mqttConnected: false,
    socketTask: null,
    showConfig: false,
    mqttHost: '192.168.36.221',
    mqttPort: '8083',
    mqttTopic: 'LCW2',
    sensorData: {
      temperature: null,
      humidity: null,
      waterLevel: null,
      airQuality: null,
      warning: false
    },
    thresholds: {
      temperature: 30,
      humidity: 90,
      waterLevel: 50
    },
    lastUpdateTime: null
  },

  onLoad(options) {
    console.log('传感器页面加载')
    // 从本地存储加载配置
    this.loadConfig()
  },

  onUnload() {
    this.disconnectMqtt()
  },

  // 加载配置
  loadConfig() {
    try {
      const host = wx.getStorageSync('mqtt_host')
      const port = wx.getStorageSync('mqtt_port')
      const topic = wx.getStorageSync('mqtt_topic')

      if (host) this.setData({ mqttHost: host })
      if (port) this.setData({ mqttPort: port })
      if (topic) this.setData({ mqttTopic: topic })
    } catch (error) {
      console.error('加载配置失败:', error)
    }
  },

  // 显示配置弹窗
  showMqttConfig() {
    this.setData({ showConfig: true })
  },

  // 隐藏配置弹窗
  hideConfig() {
    this.setData({ showConfig: false })
  },

  // 阻止冒泡
  stopPropagation() {},

  // 服务器地址输入
  onHostInput(e) {
    this.setData({ mqttHost: e.detail.value })
  },

  // 端口输入
  onPortInput(e) {
    this.setData({ mqttPort: e.detail.value })
  },

  // 主题输入
  onTopicInput(e) {
    this.setData({ mqttTopic: e.detail.value })
  },

  // 保存配置并连接
  saveConfigAndConnect() {
    const { mqttHost, mqttPort, mqttTopic } = this.data

    if (!mqttHost || !mqttPort || !mqttTopic) {
      wx.showToast({
        title: '请填写完整配置',
        icon: 'none'
      })
      return
    }

    // 保存到本地存储
    try {
      wx.setStorageSync('mqtt_host', mqttHost)
      wx.setStorageSync('mqtt_port', mqttPort)
      wx.setStorageSync('mqtt_topic', mqttTopic)
    } catch (error) {
      console.error('保存配置失败:', error)
    }

    this.setData({ showConfig: false })
    this.connectMqtt()
  },

  // 连接MQTT (使用原生WebSocket)
  connectMqtt() {
    const { mqttHost, mqttPort } = this.data
    const connectUrl = `ws://${mqttHost}:${mqttPort}/mqtt`

    console.log('===== MQTT连接开始 =====')
    console.log('连接URL:', connectUrl)
    console.log('主机:', mqttHost)
    console.log('端口:', mqttPort)
    console.log('主题:', this.data.mqttTopic)

    // 显示连接中提示
    wx.showLoading({
      title: '正在连接...',
      mask: true
    })

    try {
      const socketTask = wx.connectSocket({
        url: connectUrl,
        header: {
          'content-type': 'application/json'
        },
        protocols: ['mqtt'],
        success: () => {
          console.log('✓ WebSocket连接请求已发送')
        },
        fail: (err) => {
          console.error('✗ WebSocket连接请求失败:', err)
          console.error('错误详情:', JSON.stringify(err))
          wx.hideLoading()
          wx.showModal({
            title: '连接失败',
            content: `无法连接到${connectUrl}\n\n错误信息: ${err.errMsg || '未知错误'}\n\n请检查:\n1. MQTT服务器是否运行\n2. IP地址和端口是否正确\n3. 防火墙是否开放8083端口\n4. EMQX WebSocket是否启用`,
            showCancel: false
          })
        }
      })

      // 监听 WebSocket 连接打开
      socketTask.onOpen(() => {
        console.log('✓ WebSocket连接已成功建立')
        wx.hideLoading()

        // 发送 MQTT CONNECT 数据包
        const clientId = 'wx_sensor_' + Math.random().toString(16).substring(2, 10)
        console.log('客户端ID:', clientId)
        console.log('正在发送MQTT CONNECT包...')
        this.sendMqttConnect(socketTask, clientId)

        this.setData({
          mqttConnected: true,
          socketTask: socketTask
        })

        wx.showToast({
          title: 'MQTT已连接',
          icon: 'success',
          duration: 2000
        })

        // 订阅主题
        setTimeout(() => {
          console.log('正在订阅主题:', this.data.mqttTopic)
          this.sendMqttSubscribe(socketTask, this.data.mqttTopic)
        }, 500)
      })

      // 监听 WebSocket 接收到服务器的消息
      socketTask.onMessage((res) => {
        this.handleMqttMessage(res.data)
      })

      // 监听 WebSocket 错误
      socketTask.onError((err) => {
        console.error('✗ WebSocket错误:', err)
        console.error('错误详情:', JSON.stringify(err))
        wx.hideLoading()
        wx.showModal({
          title: 'WebSocket错误',
          content: `连接出现错误\n\n可能原因:\n1. 网络不稳定\n2. 服务器断开连接\n3. 防火墙阻止连接\n\n请重新尝试连接`,
          showCancel: false
        })
        this.setData({ mqttConnected: false })
      })

      // 监听 WebSocket 关闭
      socketTask.onClose((res) => {
        console.log('✗ WebSocket连接已断开')
        console.log('关闭代码:', res.code)
        console.log('关闭原因:', res.reason)
        this.setData({ mqttConnected: false })

        if (res.code !== 1000) {
          wx.showToast({
            title: '连接已断开',
            icon: 'none',
            duration: 2000
          })
        }
      })

    } catch (error) {
      console.error('✗ 创建WebSocket失败:', error)
      console.error('异常详情:', JSON.stringify(error))
      wx.hideLoading()
      wx.showModal({
        title: '连接异常',
        content: `创建连接时发生异常\n\n${error.message || '未知异常'}`,
        showCancel: false
      })
    }
  },

  // 断开MQTT
  disconnectMqtt() {
    const { socketTask } = this.data
    if (socketTask) {
      socketTask.close({
        success: () => {
          this.setData({ mqttConnected: false, socketTask: null })
          wx.showToast({
            title: '已断开连接',
            icon: 'none'
          })
        }
      })
    }
  },

  // 发送 MQTT CONNECT 数据包
  sendMqttConnect(socketTask, clientId) {
    console.log('正在构造MQTT CONNECT数据包...')

    // 简化的 MQTT CONNECT 数据包
    const protocolName = 'MQTT'
    const protocolLevel = 4

    let packet = []

    // Fixed header
    packet.push(0x10) // CONNECT packet type

    // Remaining length (will be calculated)
    let variableHeader = []

    // Protocol name
    variableHeader.push(0, protocolName.length)
    for (let i = 0; i < protocolName.length; i++) {
      variableHeader.push(protocolName.charCodeAt(i))
    }

    // Protocol level
    variableHeader.push(protocolLevel)

    // Connect flags
    variableHeader.push(0x02) // Clean session

    // Keep alive
    variableHeader.push(0, 60)

    // Client ID
    const clientIdBytes = []
    clientIdBytes.push(0, clientId.length)
    for (let i = 0; i < clientId.length; i++) {
      clientIdBytes.push(clientId.charCodeAt(i))
    }

    const remainingLength = variableHeader.length + clientIdBytes.length
    packet.push(remainingLength)
    packet = packet.concat(variableHeader).concat(clientIdBytes)

    const buffer = new Uint8Array(packet).buffer

    console.log('MQTT CONNECT包大小:', packet.length, 'bytes')

    socketTask.send({
      data: buffer,
      success: () => {
        console.log('✓ MQTT CONNECT包发送成功')
      },
      fail: (err) => {
        console.error('✗ MQTT CONNECT包发送失败:', err)
      }
    })
  },

  // 发送 MQTT SUBSCRIBE 数据包
  sendMqttSubscribe(socketTask, topic) {
    console.log('正在构造MQTT SUBSCRIBE数据包...')

    let packet = []

    // Fixed header
    packet.push(0x82) // SUBSCRIBE packet type with QoS 1

    // Packet identifier
    const packetId = [0, 1]

    // Topic
    const topicBytes = []
    topicBytes.push(0, topic.length)
    for (let i = 0; i < topic.length; i++) {
      topicBytes.push(topic.charCodeAt(i))
    }
    topicBytes.push(0) // QoS 0

    const remainingLength = packetId.length + topicBytes.length
    packet.push(remainingLength)
    packet = packet.concat(packetId).concat(topicBytes)

    const buffer = new Uint8Array(packet).buffer

    console.log('MQTT SUBSCRIBE包大小:', packet.length, 'bytes')
    console.log('订阅主题:', topic)

    socketTask.send({
      data: buffer,
      success: () => {
        console.log('✓ MQTT SUBSCRIBE包发送成功')
      },
      fail: (err) => {
        console.error('✗ MQTT SUBSCRIBE包发送失败:', err)
      }
    })
  },

  // 处理MQTT消息
  handleMqttMessage(data) {
    try {
      // 将 ArrayBuffer 转换为字符串
      const uint8Array = new Uint8Array(data)

      console.log('收到MQTT消息，数据包大小:', uint8Array.length, 'bytes')
      console.log('消息类型:', '0x' + uint8Array[0].toString(16))

      // 检查是否是 PUBLISH 消息 (0x30)
      if (uint8Array[0] >> 4 === 3) {
        console.log('这是一个PUBLISH消息')

        // 解析 PUBLISH 消息
        let pos = 1

        // 解析 remaining length
        let multiplier = 1
        let remainingLength = 0
        let byte
        do {
          byte = uint8Array[pos++]
          remainingLength += (byte & 0x7F) * multiplier
          multiplier *= 128
        } while ((byte & 0x80) !== 0)

        // 跳过 topic length 和 topic
        const topicLength = (uint8Array[pos] << 8) + uint8Array[pos + 1]
        pos += 2 + topicLength

        // 提取 payload
        const payloadBytes = uint8Array.slice(pos)
        let payload = ''
        for (let i = 0; i < payloadBytes.length; i++) {
          payload += String.fromCharCode(payloadBytes[i])
        }

        console.log('消息负载:', payload)

        // 尝试解析 JSON
        const jsonData = JSON.parse(payload)
        console.log('✓ 解析成功，传感器数据:', jsonData)

        // 更新传感器数据
        this.setData({
          sensorData: {
            temperature: jsonData.temperature,
            humidity: jsonData.humidity,
            waterLevel: jsonData.waterLevel,
            airQuality: jsonData.airQuality,
            warning: jsonData.warning
          },
          lastUpdateTime: this.formatTime(new Date())
        })

        // 如果有报警，震动提醒
        if (jsonData.warning) {
          console.log('⚠ 报警触发，开启震动')
          wx.vibrateShort({ type: 'heavy' })
        }
      } else if (uint8Array[0] === 0x20) {
        // CONNACK
        console.log('✓ 收到CONNACK确认包')
      } else if (uint8Array[0] === 0x90) {
        // SUBACK
        console.log('✓ 收到SUBACK确认包，订阅成功')
      } else {
        console.log('收到其他类型的MQTT消息')
      }
    } catch (error) {
      console.error('✗ 解析MQTT消息失败:', error)
      console.error('错误详情:', error.message)
    }
  },

  // 温度阈值输入
  onTempThresholdChange(e) {
    this.setData({
      'thresholds.temperature': Number(e.detail.value) || 30
    })
  },

  // 湿度阈值输入
  onHumidityThresholdChange(e) {
    this.setData({
      'thresholds.humidity': Number(e.detail.value) || 90
    })
  },

  // 水位阈值输入
  onWaterThresholdChange(e) {
    this.setData({
      'thresholds.waterLevel': Number(e.detail.value) || 50
    })
  },

  // 应用阈值设置
  applyThresholds() {
    const { thresholds } = this.data

    // 验证阈值范围
    if (thresholds.temperature < 0 || thresholds.temperature > 100) {
      wx.showToast({
        title: '温度阈值应在0-100℃',
        icon: 'none'
      })
      return
    }

    if (thresholds.humidity < 0 || thresholds.humidity > 100) {
      wx.showToast({
        title: '湿度阈值应在0-100%',
        icon: 'none'
      })
      return
    }

    if (thresholds.waterLevel < 0 || thresholds.waterLevel > 100) {
      wx.showToast({
        title: '水位阈值应在0-100%',
        icon: 'none'
      })
      return
    }

    wx.showToast({
      title: '阈值设置成功',
      icon: 'success'
    })
  },

  // 格式化时间
  formatTime(date) {
    const hour = date.getHours().toString().padStart(2, '0')
    const minute = date.getMinutes().toString().padStart(2, '0')
    const second = date.getSeconds().toString().padStart(2, '0')
    return `${hour}:${minute}:${second}`
  }
})