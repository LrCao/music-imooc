// pages/profile-bloghistory/profile-bloghistory.js
const MAX_LIMIT = 10

Page({

  /**
   * 页面的初始数据
   */
  data: {
    blogList: []
  },

  _getListBuCloudFn () {
    wx.showLoading({
      title: '加载中...',
    })
    wx.cloud.callFunction({
      name: 'blog',
      data: {
        $url: 'getListByOpenid',
        start:this.data.blogList.length,
        count: MAX_LIMIT
      }
    }).then(res => {
      this.setData({
        blogList: this.data.blogList.concat(res.result)
      })
    }).finally(() => {
      wx.hideLoading()
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this._getListBuCloudFn()
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

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this._getListBuCloudFn()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})