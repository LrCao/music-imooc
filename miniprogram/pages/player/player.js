// pages/player/player.js

let musiclist = []
// 正在播放的歌曲下标
let nowPlayingIndex = -1
// 获取全局唯一的背景音频管理器
const backgroundAudioManager = wx.getBackgroundAudioManager()

const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    picUrl: '',
    isPlaying: false, // 页面加载时是否播放
    isLyricShow: false, // 是否显示歌词页
    lyric: '',
    isSame: false // 判断点击进入播放的歌曲，是否与当前播放歌曲一致
  },

  _loadMusicDetail (musicId) {
    console.log(typeof musicId, typeof app.getPlayMusicId())
    if (+musicId === +app.getPlayMusicId()) {
      this.setData({
        isSame: true
      })
    } else {
      this.setData({
        isSame: false
      })
    }
    if (!this.data.isSame) {
      backgroundAudioManager.stop()
    }

    let music = musiclist[nowPlayingIndex]

    wx.setNavigationBarTitle({
      title: music.name,
    })

    this.setData({
      picUrl: music.al.picUrl
    })

    app.setPlayMusicId(musicId)

    wx.showLoading({
      title: '加载中...',
    })

    wx.cloud.callFunction({
      name: 'music',
      data: {
        musicId,
        $url: 'musicUrl'
      }
    }).then(res => {
      let result = JSON.parse(res.result)
      if (!result.data[0].url) {
        wx.showToast({
          title: '无权限播放',
        })
      }
      if (!this.data.isSame) {
        backgroundAudioManager.src = result.data[0].url
        backgroundAudioManager.title = music.name
        backgroundAudioManager.coverImgUrl = music.al.picUrl
        backgroundAudioManager.singer = music.ar[0].name
        backgroundAudioManager.epname = music.al.name
        // 保存播放历史
        this.savePlayHistory()
      }
      this.setData({
        isPlaying: true
      })

      wx.hideLoading()

      wx.cloud.callFunction({
        name: 'music',
        data: {
          $url: 'lyric',
          musicId
        }
      }).then(res => {
        let lyric = '纯音乐，暂无歌词'
        const lrc = JSON.parse(res.result).lrc
        if (lrc) {
          lyric = lrc.lyric
        }
        this.setData({
          lyric
        })
      })
    })
  },

  // 联动暂停
  musicPause () {
    this.setData({
      isPlaying: false
    })
  },

  // 联动播放
  musicPlay () {
    this.setData({
      isPlaying: true
    })
  },

  togglePlaying () {
    // 正在播放
    if (this.data.isPlaying) {
      backgroundAudioManager.pause()
    } else {
      backgroundAudioManager.play()
    }
    this.setData({
      isPlaying: !this.data.isPlaying
    })
  },

  onPrev () {
    nowPlayingIndex--
    if (nowPlayingIndex < 0) {
      nowPlayingIndex = musiclist.length - 1
    }
    this._loadMusicDetail(musiclist[nowPlayingIndex].id)
  },

  onNext () {
    nowPlayingIndex++
    if (nowPlayingIndex === musiclist.length) {
      nowPlayingIndex = 0
    }
    this._loadMusicDetail(musiclist[nowPlayingIndex].id)
  },

  onChangeLyricShow () {
    this.setData({
      isLyricShow: !this.data.isLyricShow
    })
  },

  timeUpdate(event) {
    this.selectComponent('.lyric').update(event.detail.currentTime)
  },

  // 保存播放历史
  savePlayHistory () {
    const music = musiclist[nowPlayingIndex]
    const openid = app.globalData.openid
    const history = wx.getStorageSync(openid)
    if (!history.some(i => i.id === music.id)) {
      history.unshift(music)
      wx.setStorage({
        key: openid,
        data: history,
      })
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    musiclist = wx.getStorageSync('musiclist')
    nowPlayingIndex = options.index
    console.log(options)
    this._loadMusicDetail(options.musicId)
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