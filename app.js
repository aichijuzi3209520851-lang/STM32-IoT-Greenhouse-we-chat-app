// app.js
App({
  onLaunch() {
    console.log('小程序启动')
  },
  globalData: {
    mqttConfig: {
      host: '192.168.36.221',  // MQTT服务器IP
      port: 8083,               // WebSocket端口
      topic: 'LCW2'             // 订阅主题
    }
  }
})
