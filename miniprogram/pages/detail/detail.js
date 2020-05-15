//导入utils
import { utils } from '../../js/utils.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    bookingData: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    

    //截取参数
    let ids = options.ids.split('@');
    

    wx.setNavigationBarTitle({
      title: options.title + '记账详情'
    })

    this.getBookingDataByIds(ids);

  },

  //根据记账id查询记账数据
  getBookingDataByIds: function (ids) {
    //加载提示
    wx.showLoading({
      title: '加载中...'
    })

    wx.cloud.callFunction({
      name: 'get_booking_byids',
      data: {
        ids
      },
      success: res => {
        //关闭加载提示
        wx.hideLoading();
        

        res.result.data.forEach(v => {
          v.money = utils.thousandthPlace(Number(v.money).toFixed(2));
        })

        //按照日期排序，降序排序
        res.result.data.sort((a, b) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        })

        this.setData({
          bookingData: res.result.data
        })
      },
      fail: err => {
        //关闭加载提示
        wx.hideLoading();
        
      }
    })
  }
})