//获取小程序实例
let app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {
      url: '',
      nickName: ''
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },

  onReady: function () {
    
    setTimeout(() => {
      this.getUserInfo();
    }, 600)
    

  },

  //查看我的记账
  viewMyBookingData: function () {
    wx.navigateTo({
      url: '../mybooking/mybooking'
    })
  },

  //获取用户授权信息
  getUserInfo: function () {

    if (app.globalData.isAuth) {
      //如果授权，则获取用户信息
      wx.getUserInfo({
        success: res => {
          

          this.setData({
            userInfo: {
              url: res.userInfo.avatarUrl,
              nickName: res.userInfo.nickName
            }
          })
        }
      })
    }

  }
})