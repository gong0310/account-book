// 获取小程序实例

let app = getApp();


Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  //获取授权认证
  getUserAuth: function (res) {
    

    if (res.detail && res.detail.userInfo) {
      //已经授权
      app.globalData.isAuth = true;
      if (app.globalData.isAuth) {
        wx.switchTab({
          url: '../home/home'
        })
      }
    }
  }

})