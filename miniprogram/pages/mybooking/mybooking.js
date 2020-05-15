//导入utils
import { utils } from '../../js/utils.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    myBookingData: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getBookingDataByUser();
  },

  
  //获取我的记账数据
  getBookingDataByUser: function () {
    wx.showLoading({
      title: '加载中...'
    })

    wx.cloud.callFunction({
      name: 'get_booking_byuser',
      success: res => {
        wx.hideLoading();
        

        res.result.data.forEach(v => {
          v.money = utils.thousandthPlace(Number(v.money).toFixed(2));
        })

        res.result.data.sort((a, b) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        })

        this.setData({
          myBookingData: res.result.data
        })


      },
      fail: err => {
        wx.hideLoading();
        
      }
    })
  },

  //删除我的记账
  removeMybooking: function (e) {
    

    //加载提示
    wx.showLoading({
      title: '加载中...'
    })

    wx.cloud.callFunction({
      name: 'remove_booking_byid',
      data: {
        id: e.currentTarget.dataset.id
      },
      success: res => {
        wx.hideLoading();
        // 
        if (res.result.stats.removed == 1) {
          this.data.myBookingData.splice(e.currentTarget.dataset.index, 1);

          this.setData({
            myBookingData: this.data.myBookingData
          })
          wx.showToast({
            title: '删除成功',
            icon: 'none',
            duration: 2000
          })
        } else {
          //提示用户删除失败
          wx.showToast({
            title: '删除失败',
            icon: 'none',
            duration: 2000
          })
        }
      },
      fail: err => {
        wx.hideLoading();
        
      }
    })

    
  }

})