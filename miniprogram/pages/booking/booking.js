//获取小程序实例
let app = getApp();


Page({

  /**
   * 页面的初始数据
   */
  data: {

    //类型图标数据
    typeIconsData: [],

    //标签类型
    typeTitle: [
      {
        title: '收入',
        type: 'shouru',
        isSelect: true
      },
      {
        title: '支出',
        type: 'zhichu',
        isSelect: false
      }
    ],

    //账户选择
    accountData: [
      {
        title: '现金',
        type: 'xianjin',
        isSelect: true
      },
      {
        title: '支付宝',
        type: 'xianjin',
        isSelect: false
      },
      {
        title: '微信',
        type: 'xianjin',
        isSelect: false
      },
      {
        title: '信用卡',
        type: 'xianjin',
        isSelect: false
      },
      {
        title: '储蓄卡',
        type: 'xianjin',
        isSelect: false
      }
    ],

    //日期
    date: '请选择日期',

    //金额
    money: '',

    //备注
    comment: '',

    //开始时间
    start: '',

    //结束时间
    end: ''

  },

  /**
   * 生命周期函数--监听页面加载，相当于vue的created
   */
  onLoad: function (options) {

    //获取类型图标数据
    this.getTypeIcon();

    //获取开始时间
    this.getStartDate();
  },

  //获取开始时间
  getStartDate: function () {

    wx.showLoading({
      title: '加载中...'
    })

    wx.cloud.callFunction({
      name: 'get_date',
      success: res => {
        wx.hideLoading();
        

        //获取当前时间
        let end = new Date().toLocaleDateString().split('/');
        
        //不足10补零
        for (let i = 1; i < end.length; i++) {
          end[i] = end[i] >= 10 ? end[i] : '0' + end[i];
        }


        this.setData({
          start: res.result.data[0].date,
          end: end.join('-')
        })
      },
      fail: err => {
        wx.hideLoading();
        
      }
    })

  },

  //获取类型图标数据
  getTypeIcon: function () {

    wx.showLoading({
      title: '加载中...'
    })

    //调用云函数
    wx.cloud.callFunction({
      //云函数名称
      name: 'get_typeIcon',

      //成功执行的方法
      success: res => {
        //关闭加载提示
        wx.hideLoading();
        

        //添加一个属性，用于判断当前的选中
        res.result.data.forEach(v => {
          v.isSelect = false;
        })


        this.setData({
          typeIconsData: res.result.data
        })
      },

      //失败执行的方法
      fail: err => {
        //关闭加载提示
        wx.hideLoading();
        
      }
    })

  },
  //切换
  toggle: function (e, key) {
    if (e.currentTarget.dataset.select) {
      return;
    }
    for (let i = 0; i < this.data[key].length; i++) {
      if (this.data[key][i].isSelect) {
        this.data[key][i].isSelect = false;
        break;
      }
    }

    this.data[key][e.currentTarget.dataset.index].isSelect = true;

    //响应页面数据
    this.setData({
      [key]: this.data[key]
    })
  },

  //切换标签类型
  toggleTypeTitle: function (e) {
    this.toggle(e, 'typeTitle');
  },

  //切换类型图标
  toggleTypeIcon: function (e) {
    this.toggle(e, 'typeIconsData');
  },

  //切换账户
  toggleAccount: function (e) {
    this.toggle(e, 'accountData');
  },

  // 选择日期
  selectDate: function (e) {
    
    this.setData({
      date: e.detail.value
    })
  },

  //修改金额
  modifyMoney: function (e) {
    this.setData({
      money: e.detail.value
    })
  },

  //修改备注
  modifyComment: function (e) {
    this.setData({
      comment: e.detail.value
    })
  },

  //获取记账方式, 类型, 账户
  getTypeData: function (key) {
    for (let i = 0; i < this.data[key].length; i++) {
      if (this.data[key][i].isSelect) {
        let o = {
          type: this.data[key][i].type,
          title: this.data[key][i].title
        };
        
        if (key == 'typeIconsData') {
          o.url = this.data[key][i].url;
        }

        return o;
      }
    }

    return false;
  },

  //提示
  tip: function (msg) {
    wx.showToast({
      title: msg,
      icon: 'none',
      duration: 2000
    })
  },

  //保存记账数据
  save: function () {
console.log(app.globalData.isAuth)
    //如果用户没有授权，则跳到授权认证页面
    if (!app.globalData.isAuth) {
      wx.navigateTo({
        url: '../auth/auth'
      })
      return;
    }
    

    //记账数据
    let data = {

    };

    let dataTypes = ['typeTitle', 'typeIconsData', 'accountData'];


    for (let i = 0; i < dataTypes.length; i++) {
      let o = this.getTypeData(dataTypes[i]);
      if (!o) {
        //提示用户
        this.tip('请选择记账类型');
        return;
      } else {
        data[dataTypes[i]] = o;
      }
    }

    
    //获取记账日期
    if (this.data.date == '请选择日期') {
      this.tip('请选择日期');
      return;
    }

    //获取金额
    if (this.data.money == '') {
      this.tip('请填写金额');
      return;
    }
    if (this.data.money >9999999999) {
      this.tip('亲，金额太大了哦！可真有钱');
      return;
    }

    data.date = this.data.date;

    data.money = this.data.money;

    data.comment = this.data.comment;

    

    //开启加载提示
    wx.showLoading({
      title: '加载中...'
    })

    wx.cloud.callFunction({
      name: 'add_booking',
      data,
      success: res => {
        //关闭加载提示
        wx.hideLoading();
        this.tip('保存成功');
      },
      fail: err => {
        //关闭加载提示
        wx.hideLoading();
        this.tip('保存失败');
      }
    })
    

  }

  
})