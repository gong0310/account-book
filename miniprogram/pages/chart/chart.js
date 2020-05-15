var wxCharts = require('../../js/wxcharts.js');

//导入utils
import { utils } from '../../js/utils.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    condition: ['年', '月', '日'],
    text: '月',
    date: '请选择日期',

    titleData: [
      {
        title: '收入',
        money: 0,
        type: 'shouru',
        isActive: true
      },
      {
        title: '支出',
        money: 0,
        type: 'zhichu',
        isActive: false
      }
    ],

    screenWidth: 0,

    //月份 30天
    day30: ['04', '06', '09', '11'],

    //月份 31天
    day31: ['01', '03', '05', '07', '08', '10', '12'],

    //记账数据
    bookingData: {
      shouru: [],
      zhichu: []
    },

    //饼图数据
    series: [],

    //默认按收入统计
    defaultType: 'shouru',

    //按照类型统计记账数据
    typeBookingData: [],

    //总金额
    total: 0

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },

  onShow: function () {
    //获取屏幕宽度
    let screenWidth = wx.getSystemInfoSync().screenWidth;

    //获取当前日期
    let nowDate = new Date();
    let year = nowDate.getFullYear();
    let month = nowDate.getMonth()+1 ;
    let day = nowDate.getDate() < 10 ? "0" + nowDate.getDate() : nowDate
      .getDate();
    let date = year + "-" + month + "-" + day;  // "2018-03-26"
    date = date.split('-')

    for (let i = 1; i < date.length; i++) {
      date[i] = date[i] >= 10 ? date[i] : '0' + date[i];
    }

    this.setData({
      screenWidth,
      date: date.join('-')
    })


    //查找记账数据
    this.findBookingData();
  },

  //查看记账详情
  viewBookingDataDetail: function (e) {
  //  console.log(e.currentTarget.dataset.ids);
  wx.navigateTo({
    url: '../detail/detail?ids=' + e.currentTarget.dataset.ids + '&title=' + e.currentTarget.dataset.title
  })
  },

  //绘制饼图
  drawPie: function () {
    new wxCharts({
      canvasId: 'pieCanvas',
      type: 'pie',
      series: this.data.series,
      width: this.data.screenWidth,
      height: 300,
      dataLabel: true
    });
  },

  //切换收入统计-支出统计
  toggleTitle: function (e) {
    console.log(e);
    if (e.currentTarget.dataset.active) {
      return;
    }

    for (let i = 0; i < this.data.titleData.length; i++) {
      if (this.data.titleData[i].isActive) {
        this.data.titleData[i].isActive = false;
        break;
      }
    }

    this.data.titleData[e.currentTarget.dataset.index].isActive = true;

    this.setData({
      titleData: this.data.titleData,
      defaultType: e.currentTarget.dataset.type
    })

    console.log('this.data.bookingData ==> ', this.data.bookingData);
    
    //绘制饼图
    this.drawPieForData();
  },

  //选择查询日期
  selectDate: function (e) {

    let date = this.data.date.split('-');

    let value = e.detail.value.split('-');

    
    
    if (this.data.text == '年') {

      //如果同年，则不查询
      if (date[0] == value[0]) {
        console.log('按年查询---同年');
        return;
      }


    } else if (this.data.text == '月') {

      //按月份查询, 不用考虑日
      //如果修改年份，不用考虑月份是否相同
      //同年份，需要考虑月份是否相同

      //如果同年份
      if (date[0] == value[0]) {
        //判断是否同月
        if (date[1] == value[1]) {
          console.log('按月查询----同年同月');
          return;
        }
      }

    } else if (this.data.date == e.detail.value) {
      console.log('按日查询---同年同月同日');
      return;
    }

    this.setData({
      date: e.detail.value
    })

    //按条件查询记账数据
    this.findBookingData();
  },

  //按年月日条件查询
  selectCondition: function (e) {

    if (this.data.text == this.data.condition[e.detail.value]) {
      console.log('相同查询条件');
      return;
    }

    this.setData({
      text: this.data.condition[e.detail.value]
    })

    //获取记账数据
    this.findBookingData();
  },

  //按条件查询记账数据
  findBookingData: function () {

    //获取条件
    var condition = this.data.text;

    //获取选择的日期
    var date = this.data.date.split('-');

    let start = '';
    let end = '';

    
    if (condition == '年') {
      //年
      //2020-01-01 - 2020-12-31
      start = date[0] + '-01-01';
      end = date[0] + '-12-31';

    } else if (condition == '月') {
      //月
      //当月01号 - 当月尾号 (28, 29, 30, 31)
      let m = date[1];

      start = date.slice(0, 2);
      start.push('01');
      start = start.join('-');
      end = date.slice(0, 2);

      if (this.data.day30.indexOf(m) > - 1) {
        //30
        end.push('30');
      } else if (this.data.day31.indexOf(m) > -1) {
        //31
        end.push('31');
      } else {
        //2月
        //判断年份是否为闰年平年
        if (date[0] % 400 == 0 || (date[0] % 4 == 0 && date[0] % 100 != 0)) {
          //2月29号
          end.push('29');
        } else {
          //2月28号
          end.push('28');
        }
      }

      end = end.join('-');

      // console.log('start ==> ', start);
      // console.log('end ==> ', end);


    } else {
      //日
      start = date.join('-');
      end = start;

      console.log('start ==> ', start);
      console.log('end ==> ', end);

    }

    //获取记账数据
    this.getBookingDataByDate(start, end);

  },

  getBookingDataByDate: function (start, end) {
    wx.showLoading({
      title: '加载中...'
    })

    wx.cloud.callFunction({
      name: 'get_booking_bydaterange',
      data: {
        start,
        end
      },
      success: res => {
        wx.hideLoading();
        // console.log('res ==> ', res);

        this.setData({
          bookingData: {
            shouru: [],
            zhichu: []
          }
        })

        let sum = {
          shouru: 0,
          zhichu: 0
        };
        
        res.result.data.forEach(v => {
          //按收入或者支出分类
          this.data.bookingData[v.typeTitle.type].push(v);

          //统计收入或者支出总金额
          sum[v.typeTitle.type] += Number(v.money);
        })

        for (let key in sum) {
          sum[key] = sum[key].toFixed(2);
        }

        this.data.titleData.forEach(v => {
          v.money = utils.thousandthPlace(sum[v.type]);
        })

        this.setData({
          bookingData: this.data.bookingData,
          titleData: this.data.titleData
        })
        this.drawPieForData(this.data.defaultType);
        
      },
      fail: err => {
        wx.hideLoading();
        console.log('err ==> ', err);
      }
    })
  },

  //根据收入后者支出记账数据绘制饼图
  drawPieForData: function () {
    //按收入-支出获取饼图数据
    let data = this.data.bookingData[this.data.defaultType];
    if (data.length == 0) {
      this.setData({
        series: []
      })
      return;
    }

    //按照类型分类统计 比如:餐饮，娱乐，学习...
    let seriesData = [];

    let typeBookingData = [];

    //总金额
    let total = 0;


    data.forEach(v => {

      total += Number(v.money);


      //查找series数组是否存在当前类型，如果不存在，则添加一个类型，如果存在，则累加金额
      let isHas = false;
      for (let i = 0; i < seriesData.length; i++) {

        if (v.typeIconsData.type == seriesData[i].type) {
          //累加金额
          seriesData[i].data += Number(v.money);
          isHas = true;

          typeBookingData[i].money += Number(v.money);
          typeBookingData[i].ids += '@' + v._id;
          ++typeBookingData[i].count;

          break;
        }
      }

      //如果不存在，则在series添加一个类型
      if (!isHas) {
        //随机生成颜色

        let rgb = {
          r: 0,
          g: 0,
          b: 0
        };

        for (let key in rgb) {
          rgb[key] = Math.ceil(Math.random() * 255);
        }

        seriesData.push({
          color: 'rgb(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ')',
          name: v.typeIconsData.title,
          type: v.typeIconsData.type,
          data: Number(v.money),
          format: value => {
            return '  ' + v.typeIconsData.title + ' ' + (value * 100).toFixed(3) + '%  ';
          }
        });


        //类型记账数据
        typeBookingData.push({
          color: 'rgb(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ')',
          money: Number(v.money),
          count: 1,
          typeIconsData: v.typeIconsData,
          ids: v._id
        })
      }


    })
    //保留两位小数
    typeBookingData.forEach(item => {
      item.totalMoney = utils.thousandthPlace(item.money.toFixed(2));
      item.money = item.money.toFixed(2);
    })

    this.setData({
      series: seriesData,
      typeBookingData,
      total
    })

    //绘制饼图
    this.drawPie(this.data.series);

  }

})