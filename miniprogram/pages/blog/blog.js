// pages/blog/blog.js

let keyWord = ''

Page({

  /**
   * 页面的初始数据
   */
  data: {
    modalShow: false, // 判断底部弹出层是否显示
    blogList: []
  },

  showModal() {

  },

  // 发布功能
  onPublish () {
    // 判断用户是否授权
    let _this = this
    wx.getSetting({
      success(res){
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success (res) {
              _this.loginSuccess({detail: res.userInfo})
            }
          })  
        } else {
          _this.setData({
            modalShow: true
          })
        }
      }
    })
    
  },

  loginSuccess (event) {
    const detail = event.detail
    wx.navigateTo({
      url: `../blog-edit/blog-edit?nickName=${detail.nickName}&avatarUrl=${detail.avatarUrl}`,
    })
  },

  loginFail () {
    wx.showModal({
      title: '授权用户才能发布',
      content: '',
    })
  },

  _loadBlogList(start = 0) {
    wx.showLoading({
      title: '拼命加载中...',
    })
    wx.cloud.callFunction({
      name: 'blog',
      data: {
        keyWord,
        $url: 'list',
        start,
        count: 10
      }
    }).then(res => {
      this.setData({
        blogList: this.data.blogList.concat(res.result)
      })
    }).finally(() => {
      wx.hideLoading()
      wx.stopPullDownRefresh()
    })
  },

  goComment(event) {
    wx.navigateTo({
      url: '../../pages/blog-comment/blog-comment?blogId='+ event.target.dataset.blogid,
    })
  },

  onSearch (event) {
    keyWord = event.detail
    this.setData({
      blogList: []
    })
    this._loadBlogList()
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this._loadBlogList()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
 
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.setData({
      blogList: []
    })
    this._loadBlogList()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this._loadBlogList(this.data.blogList.length)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (event) {
    let blogObj = event.target.dataset.blogid
    return {
      title: blogObj.content,
      path: `/pages/blog-comment/blog-comment?blogId=${blogObj._id}`,
      // imageUrl: ''
    }
  }
})