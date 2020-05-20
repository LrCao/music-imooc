
const app = getApp()

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    musiclist: {
      type: Array,
      default: []
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    playingId: -1
  },

  pageLifetimes: {
    show () {
      this.setData({
        playingId: +app.getPlayMusicId()
      })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onSelected (event) {
      // 事件源 事件处理函数 事件对象 事件类型
      const ds = event.currentTarget.dataset
      const musicid = ds.musicid
      this.setData({
        playingId: musicid
      })
      wx.navigateTo({
        url: `../../pages/player/player?musicId=${musicid}&index=${ds.index}`,
      })
    }
  }
})
