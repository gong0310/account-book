//导入utils
import { utils } from '../../js/utils.js'

Page({
  /**
   * 页面的初始数据
   */
  data: {
    //按当月几号查询
    bookingDataByDay: [],
    date: '',
    dayMoney: {
      shouru: 0,
      zhichu: 0
    },
    //开始日期 - 结束日期
    dateRange: {
      start: '',
      end: ''
    },
    //本月的收入-支出
    monthMoney: {
      shouru: 0,
      zhichu: 0,
      jieyu: 0,
      decimaljieyu: ''
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  },
  //页面显示执行
  onShow: function () {
    this.getBookingDataByDay();
    this.getDateRange();
    this.getBookingDataByDateRange();
  },
  //日期补零
  formatCurrentDate: function () {
    //获取今天的日期
    // let date = new Date().toLocaleDateString().split('/');
    // console.log(new Date())

    let nowDate = new Date();
    let year = nowDate.getFullYear();
    let month = nowDate.getMonth()+1 ;
    let day = nowDate.getDate() < 10 ? "0" + nowDate.getDate() : nowDate
      .getDate();
    let date = year + "-" + month + "-" + day;  // "2018-03-26"
    date = date.split('-')
    for (let i = 0; i < date.length; i++) {
      date[i] = date[i] >= 10 ? date[i] : '0' + date[i];
    }
    return date;
  },
  getBookingData: function (date) {
    wx.showLoading({
      title: '加载中...'
    })
    wx.cloud.callFunction({
      name: 'get_booking_bydate',
      data: {
        date: date.join('-')
      },
      success: res => {
        wx.hideLoading();
        let o = {
          shouru: 0,
          zhichu: 0
        };
        //统计当天的收入和支出
        res.result.data.forEach(v => {
          let money = Number(v.money);
          o[v.typeTitle.type] += money;
          v.money = utils.thousandthPlace(money.toFixed(2));
        })
        this.setData({
          bookingDataByDay: res.result.data,
          date: date[1] + '月' + date[2] + '日',
          dayMoney: {
            shouru: utils.thousandthPlace(o.shouru.toFixed(2)),
            zhichu: utils.thousandthPlace(o.zhichu.toFixed(2))
          }
        })
      },
      fail: err => {
        wx.hideLoading();
        console.log('出错了 err ==> ', err);
      }
    })
  },
  //按当月的某日查询
  getBookingDataByDay: function () {
    let date = this.formatCurrentDate();
    this.getBookingData(date);
  },
  //处理时间范围
  getDateRange: function () {
    //获取当前日期
    let date = this.formatCurrentDate();
    this.setData({
      dateRange: {
        start: date.slice(0, 2).concat(['01']).join('-'),
        end: date.join('-')
      }
    })
  },
  // 切换查询日期
  toggleDate: function (e) {
    let date = e.detail.value.split('-');
    this.setData({
      date: date[1] + '月' + date[2] + '日'
    })
    this.getBookingData(date);
  },

  //按照日期范围查询记账数据
  getBookingDataByDateRange: function () {
    this.setData({
      monthMoney: {
        shouru: 0,
        zhichu: 0,
        jieyu: 0,
        decimaljieyu: ''
      }
    })
    //加载提示
    wx.showLoading({
      title: '加载中...'
    })
    wx.cloud.callFunction({
      name: 'get_booking_bydaterange',
      data: this.data.dateRange,
      success: res => {
        wx.hideLoading();
        res.result.data.forEach(v => {
          this.data.monthMoney[v.typeTitle.type] += Number(v.money);
        })
        let jieyu = (this.data.monthMoney.shouru - this.data.monthMoney.zhichu).toFixed(2).split('.');
        this.setData({
          monthMoney: {
            shouru: utils.thousandthPlace(this.data.monthMoney.shouru.toFixed(2)),
            zhichu: utils.thousandthPlace(this.data.monthMoney.zhichu.toFixed(2)),
            jieyu: utils.thousandthPlace(jieyu[0]),
            decimaljieyu: jieyu[1]
          }

        })
      },
      fail: err => {
        wx.hideLoading();
        console.log('err ==> ', err);
      }
    })

  }

})