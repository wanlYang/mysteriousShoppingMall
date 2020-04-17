//获取应用实例  
var app = getApp();
var util = require('../../utils/util.js')

//引入这个插件，使html内容自动转换成wxml内容
var WxParse = require('../../wxParse/wxParse.js');
Page({
  data: {
    pop: null,
    bannerApp: true,
    maskHidden: false,
    winWidth: 0,
    winHeight: 0,
    currentTab: 0, //tab切换  
    productId: 0,
    itemData: {},
    remind: true,
    bannerItem: [],
    buynum: 1,
    // 产品图片轮播
    value: false,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    product:null,
    propertyValues:null,
    ceshiUrl:app.d.ceshiUrl,
    reviews:null
  },
  //页面加载完成函数
  onReady: function () {
    this.pop = this.selectComponent("#pop")
  },
  // 下拉刷新
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading() //在标题栏中显示加载
    this.loadProductDetail();
    wx.hideNavigationBarLoading() //完成停止加载
    wx.stopPullDownRefresh() //停止下拉刷新
  },
  // 传值
  onLoad: function (option) {
    console.log(option)
    var scene = decodeURIComponent(option.scene);
    console.log(scene);
    var that = this;
    if (scene != 'undefined' && scene.length > 1 && scene != '') {
      option = scene;
    }
    that.initNavHeight();
    that.setData({
      productId: option.productId,
    });
    //显示数据
    that.loadProductDetail();
  },
  // 属性选择
  onShow: function () {
    var that = this;

  },
  // 商品详情数据获取 
  loadProductDetail: function () {
    var that = this;
    // if (openid) {
      wx.request({
        url: app.d.ceshiUrl + '/applet/product',
        method: 'post',
        data: {
          product_id: that.data.productId,
        },
        header: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        success: function (res) {
          var status = res.data.status;
          console.log(res.data)
          if (status == 200) {
            var content = res.data.data.product.detail;
            console.log(content)
            WxParse.wxParse('content', 'html', content, that, 5);
            that.setData({
              bannerItem:res.data.data.product.productSingleImages,
              product:res.data.data.product,
              propertyValues:res.data.data.propertyValues,
              reviews:res.data.data.reviews
            });
            that.setData({
              remind: false
            });

          } else{
            wx.showToast({
              title: res.data.message,
              duration: 2000,
            });
          
          }
        },
        error: function (e) {
          wx.showToast({
            title: '网络异常！',
            duration: 2000,
          });
        },
      });
    

  },
  //跳转index
  t_index: function () {
    wx.switchTab({
      url: '../index/index'
    })
  },
  //跳转cart
  go_cart: function () {
    if (app.userlogin(1)) {
      this.pop.clickPup(this)
      return
    }
    util.getUesrBgplus(this, app, false)
    wx.switchTab({
      url: '../cart/cart'
    })
  },
  //购物车直接结算
  Settlement:function(){
    console.log('-Settlement-')
    wx.switchTab({
      url: '../cart/cart'
    })
    return;
  },
  addShopCart: function (e, sizeid) {
    //添加到购物车
    var that = this;
  
  },
  bindChange: function (e) {//滑动切换tab 
    var that = this;
    that.setData({ currentTab: e.detail.current });
  },
  initNavHeight: function () {////获取系统信息
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          winWidth: res.windowWidth,
          winHeight: res.windowHeight
        });
      }
    });
  },
  bannerClosed: function () {
    this.setData({
      bannerApp: false,
    })
  },
  swichNav: function (e) {//点击tab切换
    var that = this;
    if (that.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.target.dataset.current
      })
    }
  },
  //图片预览
  previewImage: function (e) {
    var current = e.target.dataset.src;
    // 路径和 图片的数组
    var arr = [current];
    // 图片预览函数
    wx.previewImage({
      current: current, // 当前显示图片的http链接  
      urls: arr, // 需要预览的图片http链接列表  
    })
  },
  preventTouchMove: function (e) {

  },

});
