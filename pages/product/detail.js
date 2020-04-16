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
    wsc: 'bxs',
    sc: 'bxs',
    paytype: 'buynow',
    sizeid: '',
    remind: true,
    bannerItem: [],
    select: [],//选中
    buynum: 1,
    // 产品图片轮播
    value: false,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    xefl: true,//点击选择规格显示状态
    // 属性选择
    firstIndex: -1,
    //数据结构：以一组一组来进行设定  
    commodityAttr: [],
    attrValueList: [],
    show_share: false,
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
    var that = this;
    if (scene != 'undefined' && scene.length > 1 && scene != '') {
      option = scene;
    }
    that.initNavHeight();
    if (option.referee_openid != '') {
      app.globalData.userInfo['referee_openid'] = option.referee_openid;
    } else {
      app.globalData.userInfo['referee_openid'] = '';
    }
    that.setData({
      productId: option.productId,
      userid: option.userid ? option.userid : false,
      choujiangid: option.choujiangid ? option.choujiangid : '',
      type1: option.type1 ? option.type1 : '',//判断是抽奖还是其他活动
      role: option.role ? option.role : '',
      size: option.size ? option.size : '',
      earn: option.earn ? option.earn : false,
      // cart: app.globalData.userInfo.cart ? app.globalData.userInfo.cart:0//购物车数量
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
    var choujiangid = that.data.choujiangid;
    var openid = app.globalData.userInfo.openid;
    console.log(app.globalData.userInfo, 'openid')
    // if (openid) {
      var bgcolor = app.d.bgcolor;
      wx.setNavigationBarColor({
        frontColor: app.d.frontColor,
        backgroundColor: bgcolor, // 页面标题为路由参数
        animation: {
          duration: 400,
          timingFunc: 'easeIn'
        }
      });
      console.log(that.data.userid)
      wx.request({
        url: app.d.ceshiUrl + '&action=product&m=index',
        method: 'post',
        data: {
          pro_id: that.data.productId,
          openid: openid,
          type1: that.data.type1,//判断是抽奖还是其他活动
          choujiangid: that.data.choujiangid,
          role: that.options.role ? that.options.role : '',
          size: that.data.size,
          userid: that.data.userid
        },
        header: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        success: function (res) {
          var status = res.data.status;
          var is_shou = res.data.type;
          if (status == 1) {
            var pro = res.data.pro;
            var content = pro.content;
            WxParse.wxParse('content', 'html', content, that, 5);
            that.setData({
              bgcolor: bgcolor,
              itemData: pro,
              kucun: pro.num,
              bannerItem: pro.img_arr,
              share: res.data.share,
              title: pro.name,
              is_zhekou: pro.is_zhekou,
              comments: res.data.comments,
              is_shou: res.data.type,
              collection_id: res.data.collection_id,
              choujiangid: that.data.choujiangid,
              role: that.data.role ? that.data.role : '',
              qj_price: res.data.qj_price,
              qj_yprice: res.data.qj_yprice,
              attrList: res.data.attrList,
              skuBeanList: res.data.skuBeanList,
              zhekou: res.data.zhekou != '' ? res.data.zhekou : false,
            });
            util.getUesrBgplus(that,app,true)
            that.setData({
              remind: false
            });
            //默认选中
            that.one();

          } else if (status == 3) {
            wx.showToast({
              title: res.data.err,
              duration: 2000,
            });
            wx.redirectTo({
              url: '../../pages/draw/draw'
            });
          } else {
            util.getUesrBgplus(that, app, true)
            util.getUesrBgplus(that, app, false)
            wx.switchTab({
                url: '../index/index'
            })
            wx.showToast({
              title: res.data.err,
              duration: 2000,
            });
          }
          //判断是否收藏
          if (is_shou) {
            that.setData({
              wsc: 'bxs',
              sc: 'xs',
            })
          } else {
            that.setData({
              wsc: 'xs',
              sc: 'bxs',
            })
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
  // 弹窗
  setModalStatus: function (e) {
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    });
    //定义点击的类型
    var type = e.target.dataset.type ? e.target.dataset.type : false;
    //控制两种不同显示方式 
    if (type) {
      this.setData({
        xefl: false,
      })
    } else {
      this.setData({
        xefl: true,
      })
      type = this.data.paytype;
    }
    this.animation = animation
    animation.translateY(300).step();
    this.setData({
      paytype: type,
      animationData: animation.export()
    })
    if (e.currentTarget.dataset.status == 1) {
      this.setData({
        showModalStatus: true
      });
    }
    setTimeout(function () {
      animation.translateY(0).step()
      this.setData({
        animationData: animation
      })
      if (e.currentTarget.dataset.status == 0) {
        this.setData({
          showModalStatus: false
        });
      }
    }.bind(this), 200)
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

  /**
   * Sku核心算法
   * 根据所有出当前类别之外的选择 判断按钮的enable ？ false or true
   */

  /**
   * 规格属性点击事件
   */


  /* 点击确定 */
  submit: function (e) {
    var that = this;
    var sizeid = that.data.sizeid;

    if (sizeid == '' || sizeid.length < 1) {
      wx.showToast({
        title: '请完善属性',
        icon: 'loading',
        duration: 1000
      })
    } else {
      var type = e.target.dataset.type;
      var sizeid = sizeid;
      that.addShopCart(e, sizeid)
    }
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
    var pro_type = e.target.dataset.type;
    var ptype = e.currentTarget.dataset.type;
    // console.log(ptype, '--jnkmjkl')
      wx.request({
        url: app.d.ceshiUrl + '&action=product&m=add_cart',
        method: 'post',
        data: {
          uid: app.globalData.userInfo.openid,
          pid: that.data.productId,
          num: that.data.buynum,
          sizeid: sizeid,
          pro_type: pro_type,
        },
        header: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        success: function (res) {
          //设置购物车刷新
          app.d.purchase = 1;
          var data = res.data;
          if (data.status == 1) {
            var ptype = e.currentTarget.dataset.type;
            if (ptype == 'buynow') {
              wx.redirectTo({
                url: '../order/pay?cartId=' + data.cart_id + '&pid=' + that.data.productId + '&num=' + that.data.buynum + '&type=1',
              });
              return;
            } else {
              wx.showToast({
                title: '加入购物车成功',
                icon: 'success',
                duration: 2000
              });
              util.getUesrBgplus(that, app,true)
              that.setData({
                showModalStatus: false
              });
            }
          } else {
            wx.showToast({
              icon: 'loading',
              title: data.err,
              duration: 2000
            });
          }
        },
        fail: function () {
          wx.showToast({
            title: '网络异常！',
            duration: 2000
          });
        }
      });
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


  // 取消收藏
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
