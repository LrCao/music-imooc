// 输入文字最大的个数
const MAX_WORDS_NUM = 140

const MAX_IMG_MUN = 9

const db = wx.cloud.database()

// 发布内容
let content = ''

let userInfo = {}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 当前输入文字个数
    wordsNum: 140,
    footerBottom: 0,
    images: []
  },

  onInput (event) {
    let wordsNum = event.detail.value.length
    this.setData({
      wordsNum: MAX_WORDS_NUM - wordsNum
    })
    content = event.detail.value
    
  },

  onFocus (event) {
    // 模拟器获取的键盘高度为0
    this.setData({
      footerBottom: event.detail.height
    })
  },
  
  onBlur () {
    this.setData({
      footerBottom: 0
    })
  },

  onChooseImage () {
    let max = MAX_IMG_MUN - this.data.images.length
    wx.chooseImage({
      count: max,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setData({
          images : this.data.images.concat(res.tempFilePaths)
        })
      },
    })
  },

  onDelIamge (event) {
    this.data.images.splice(event.target.dataset.index, 1)
    this.setData({
      images: this.data.images
    })
  },

  onPreviewImage (event) {
    wx.previewImage({
      urls: this.data.images,
      current: event.target.dataset.imgsrc
    })
  },

  send () {

    if (content.trim() === '') {
      wx.showModal({
        title: '请输入内容',
        content: '',
      })
      return
    }
    wx.showLoading({
      title: '发布中...',
      mask: true
    })
    // 数据 =》 云数据库
    // 数据库 内容，图片fileId, openId ,昵称，头像，时间
    // 1.图片 -> 云存储 fileId 云文件Id
    let promiseArr = []
    let fileIds = []
    // 图片上传
    for (let i = 0, len = this.data.images.length; i < len; i++) {
      let p = new Promise ((resolve, reject) => {
        let item = this.data.images[i]
        // 文件扩展名
        let suffix = /\.\w+$/.exec(item)[0]
        wx.cloud.uploadFile({
          cloudPath: 'blog/' + Date.now() + suffix,
          filePath: item,
          success: res => {
            fileIds = fileIds.concat(res.fileID)
            resolve()
          },
          fail: err => {
            reject()
          }
        })
      })
      promiseArr.push(p)
    }
    // 存入到云数据库
    Promise.all(promiseArr).then(res => {
       db.collection('blog').add({
         data: {
           content,
           img: fileIds,
            ...userInfo,
            createTime: db.serverDate() // 服务端的时间
         }
       })
    }).then(() => {
      wx.showToast({
        title: '发布成功',
      })
      wx.navigateBack()
      const prevPage = getCurrentPages()[0]
      prevPage.onPullDownRefresh()

    }).catch(() => {
      wx.showToast({
        title: '发布失败',
      })
    }).finally(() => {
      wx.hideLoading()
    })
    
  },  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    userInfo = options
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})