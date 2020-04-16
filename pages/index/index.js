var app = getApp();
var zi = 0;
var cont_time = 0; //首页tab点击
var util = require('../../utils/util.js')
Page({
  data: {
    pop: null,
    inforList: [], //公告
    banner: [ {id: "20", image: app.d.ceshiUrl + "/static/banner/banner1.jpg", url: "undefined"},
              {id: "21", image:app.d.ceshiUrl + "/static/banner/banner2.jpg", url: "undefined"},
              {id: "22", image: app.d.ceshiUrl + "/static/banner/banner3.jpg", url: "undefined"}
            ],
    indicatorDots: true, // 是否显示面板指示点
    autoplay: true, // 是否自动切换
    interval: 5000, // 自动切换时间间隔
    duration: 1000, // 滑动动画时长
    circular: true, // 是否采用衔接滑动
    scrollLeft: 0, //tab标题的滚动条位置
    current: 0, //当前选中的Tab项
    allList:[],
    notmore:false,
    current1: 0,
    page: 1,
    index: 1,
    cont: 1,
    tabid: 0,
    loading: false,
    remind: '加载中',
    showModal: false,
    timestamp: 0,
    searchView: false,
    height: 0,
    cart: 0, //购物车数量
    // mainHeight: 0,
  },
  //下拉事件
  onPullDownRefresh: function() {
    wx.showNavigationBarLoading() //在标题栏中显示加载
    this.onLoad();
    wx.hideNavigationBarLoading() //完成停止加载
    wx.stopPullDownRefresh() //停止下拉刷新
  },

  //设置图片响应式
  setContainerHeight: function (e) {
    //图片的原始宽度
    var imgWidth = e.detail.width;
    //图片的原始高度
    var imgHeight = e.detail.height;
    //同步获取设备宽度
    var sysInfo = wx.getSystemInfoSync();
    console.log("sysInfo:", sysInfo);
    //获取屏幕的宽度
    var screenWidth = sysInfo.screenWidth;
    //获取屏幕和原图的比例
    var scale = screenWidth / imgWidth;
    //设置容器的高度
    this.setData({
        height: imgHeight * scale
    })
    console.log(this.data.height);
  },
  imgW: function(e) {
    var $width = e.detail.width, //获取图片真实宽度
      $height = e.detail.height,
      ratio = $width / $height; //图片的真实宽高比例
    var viewWidth = 718, //设置图片显示宽度，左右留有16rpx边距
      viewHeight = 718 / ratio; //计算的高度值
    var image = this.data.images;
    //将图片的datadata-index作为image对象的key,然后存储图片的宽高值
    image[e.target.dataset.index] = {
      width: viewWidth,
      height: viewHeight
    }
    this.setData({
      images: image
    })
  },
  getMore: function(e) {
    var that = this;
    var page = that.data.page;
    var index = that.data.tabid;
    var current = that.data.current;
    console.log(page+"."+index+"."+current);
    wx.request({
      url: app.d.ceshiUrl + '/applet/getmore',
      method: 'post',
      data: {
        page: page,
        index: index,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function(res) {
        var prolist = res.data.data;
        wx.hideNavigationBarLoading() //完成停止加载
        wx.stopPullDownRefresh() //停止下拉刷新
        that.setData({
          loading: false,
        });
        if (prolist == '' || res.data.status == 0) {
       
          that.setData({
            notmore: true,
            
          });

          return false;
        } else {
          var allList = that.data.allList;
          allList[current].products.push(...prolist)
          var indexTwoData = allList[0].products;
          console.log(indexTwoData)
          that.setData({
            page: page + 1,
            allList: allList,
            indexTwoData: indexTwoData
          });
        }
      },
      fail: function(e) {
        wx.showToast({
          title: '网络异常！',
          duration: 2000
        });
      }
    })
  },
  // 获取首页产品信息
  loadProductDetail: function() {
    var that = this;
    var userinfo = wx.getStorageSync('userInfo');
    if (userinfo.nickName) {
      app.globalData.userInfo = userinfo;
    }
    // var openid = app.globalData.userInfo.openid ? app.globalData.userInfo.openid : false;
    // if (openid) {
      wx.request({
        url: app.d.ceshiUrl + '/applet/index',
        method: 'post',
        data: {
          user_id: app.globalData.userInfo.user_id
        },
        header: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        success: function(res) {
          
          var bgcolor = "#33a3dc"; //产品显示

          var banner_num = Object.keys(that.data.banner); // 轮播图
          var notice = [{url: "1", title: "玄煞古风"}];
          var allList = res.data.data
          var indexTwoData = allList[0].products;
          that.setData({
            allList : allList,
            indexTwoData : indexTwoData
          })
          that.setData({
            inforList: notice,
            banner_num: banner_num,
            mch_name: app.globalData.title,
            logo: res.data.logo,
          });

          that.setData({remind: ''});
  
        },
        fail: function(e) {
          wx.showToast({
            title: '网络异常！',
            duration: 2000
          });
        },
      })
   // }
  },
  //上拉事件
  onReachBottom: function() {
    var that = this;
    that.setData({
      loading: true,
    });
    that.getMore();
  },
  obm: function() {
    var that = this;
    var timestamp = Date.parse(new Date());
    console.log(timestamp, that.data.timestamp)
    if (timestamp - that.data.timestamp > 2000) {
      that.setData({
        timestamp: timestamp,
      });

    }

  },
  /**
   * Tab的点击切换事件
   */
  tabItemClick: function(e) {
    //防止点击过快带来的闪屏问题
    var timestamp = Date.parse(new Date());
    timestamp = timestamp / 1000;
    var data = e.currentTarget.dataset;
    var that = this;
    if (cont_time) {
      if (timestamp - cont_time >= 1) {
        that.nextpic(data);
        cont_time = timestamp;
      } else {
        cont_time = timestamp;
      }
    } else {
      that.nextpic(data);
      cont_time = timestamp;
    }
    that.checkCor(e);
  },
  nextpic: function(data) {
    this.setData({
      current: data.pos,
      tabid: data.tabid
    });
  },
  //设置点击tab大于第七个是自动跳到后面
  checkCor: function(e) {
    if (this.data.current > 4) {
      this.setData({
        scrollLeft: 800
      })
    } else {
      this.setData({
        scrollLeft: 0
      })
    }
  },
  /**
   * 内容区域swiper的切换事件
   */
  contentChange: function(e) {
    var that = this;
    var id = e.detail.current;
   
    var tabid = that.data.allList[id].id;
    console.log(tabid)
    this.setData({
      current: id,
      tabid: tabid,
      notmore:false,
      page: 1,
    })
    this.loadProductDetail();
    this.checkCor();
  },
  onShow: function() {
    console.log(app)
    // app.getUserSessionKey()

    var indexchase = app.d.indexchase;
    var that = this;
    if (indexchase) {
      that.onLoad();
      app.d.indexchase = false;
    }
  },
  onReady: function() {
    this.pop = this.selectComponent("#pop")
  },
  onLoad: function(e) {
    var that = this;
    that.loadProductDetail();
  },

  preventTouchMove: function() {

  },

  go: function() {
    this.setData({
      showModal: false
    })
  },
  material: function(res) {
    wx.getUserInfo({
      success: function(res) {
        var userInfo = res.userInfo;
        var nickName = userInfo.nickName;
        var avatarUrl = userInfo.avatarUrl;
        var gender = userInfo.gender; //性别 0：未知、1：男、2：女
        wx.request({
          url: app.d.ceshiUrl + '&action=user&m=material',
          method: 'post',
          data: {
            openid: app.globalData.userInfo.openid,
            nickName: nickName,
            avatarUrl: avatarUrl,
            gender: gender
          },
          header: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          success: function(res) {
            wx.showToast({
              title: res.data.info,
              success: 2000
            });
          }
        })
      }
    })
  },
  //获取用户信息新接口
  agreeGetUser: function(e) {
    let that = this
    if (e.detail.errMsg == 'getUserInfo:ok') {
      //获取成功设置状态
      app.globalData.userlogin = true;
      wx.setStorageSync('userlogin', true);
      //设置用户信息本地存储
      try {
        wx.setStorageSync('userInfo', e.detail.userInfo);
      } catch (e) {
        wx.showToast({
          title: '系统提示:网络错误！',
          icon: 'warn',
          duration: 1500,
        })
      }
      wx.showLoading({
        title: '加载中...',
        duration: 1500,
      })
      that.setData({
        userlogin: false
      })
      that.getOP(e.detail.userInfo)
    }
  },
  login: function() {

    var that = this;
    //取出本地存储用户信息，解决需要每次进入小程序弹框获取用户信息
    var userInfo = wx.getStorageSync('userInfo');
    console.log(userInfo)
    wx.login({
      success: res => {
        app.globalData.code = res.code
        wx.setStorageSync('code', res.code)
      },
      fail: function() {
        wx.showToast({
          title: '系统提示:网络错误！',
          icon: 'warn',
          duration: 1500,
        })
      }
    })

    wx.getSetting({
      success: (res) => {
        // 没有授权需要弹框 
        if (!res.authSetting['scope.userInfo']) {
          that.setData({
            userlogin: true
          });
        } else {
          //判断用户已经授权。不需要弹框
          if (app.globalData.userlogin) {
            that.setData({
              userlogin: false
            })
            app.globalData.userlogin = true;
            wx.setStorageSync('userlogin', true);
          } else {
            that.setData({
              userlogin: true
            });
          }
        }
      },
      fail: function() {
        wx.showToast({
          title: '系统提示:网络错误！',
          icon: 'warn',
          duration: 1500,
        })
      }
    })
  },
  getOP: function(res) {
    //提交用户信息 获取用户id
    let that = this
    let userInfo = res;
    var user = app.globalData.userInfo;
    app.globalData.userInfo['avatarUrl'] = userInfo.avatarUrl; // 头像
    app.globalData.userInfo['nickName'] = userInfo.nickName; // 昵称
    app.globalData.userInfo['gender'] = userInfo.gender; //  性别

    wx.setStorageSync('userInfo', app.globalData.userInfo);
    //写入缓存
    var nickName = userInfo.nickName;
    var avatarUrl = userInfo.avatarUrl;
    var gender = userInfo.gender; //性别 0：未知、1：男、2：女
    wx.request({
      url: app.d.ceshiUrl + '&action=user&m=material',
      method: 'post',
      data: {
        openid: app.globalData.userInfo.openid,
        nickName: nickName,
        avatarUrl: avatarUrl,
        gender: gender
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function(res) {
        wx.showToast({
          title: '授权成功!',
          success: 2000
        });
        that.onLoad();
      }
    })
  }



});