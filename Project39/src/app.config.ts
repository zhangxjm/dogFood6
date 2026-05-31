export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/appointment/index',
    'pages/order/index',
    'pages/mine/index',
    'pages/serviceDetail/index',
    'pages/createAppointment/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#F7F3EF',
    navigationBarTitleText: '足浴养生会所',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: '#9E8E80',
    selectedColor: '#B07942',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      { pagePath: 'pages/home/index', text: '首页' },
      { pagePath: 'pages/appointment/index', text: '预约' },
      { pagePath: 'pages/order/index', text: '订单' },
      { pagePath: 'pages/mine/index', text: '我的' }
    ]
  }
})
