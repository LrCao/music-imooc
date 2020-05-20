let lyricHeight = 0

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    lyric: {
      type: String,
      value: '纯音乐，暂无歌词',
      lrcList: []
    }
  },

  observers: {
    lyric (val) {
      this._parseLyric(val)
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    nowLyricIndex: 0, //当前选中的歌词的索引
    scrollTop: 0 // 滚动条滚动的高度
  },

  lifetimes: {
    ready () {
      wx.getSystemInfo({
        success: function(res) {
          // 求出1rpx对应1px的比例
          lyricHeight = res.screenWidth / 750 * 64
        },
      })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    update (time) {
      let lrcList = this.data.lrcList
      if (!lrcList || !lrcList.length) {
        return
      }
      if (time >= lrcList[lrcList.length-1].time) {
        this.setData({
          nowLyricIndex: lrcList.length - 1,
          scrollTop: (lrcList.length - 1) * lyricHeight
        })
        return 
      }
      for (let i = 0, len = lrcList.length; i < len; i++) {
        if (time <= lrcList[i].time) {
          if (this.data.nowLyricIndex === (i - 1)) {
            return
          }
          this.setData({
            nowLyricIndex: i - 1,
            scrollTop: (i - 1) * lyricHeight
          })
          break
        }
      }
    },

    _parseLyric (sLyric) {
      let line = sLyric.split('\n')
      let list = []
      line.forEach(r => {
        let time = r.match(/\[(\d{2,}):(\d{2})(?:\.(\d{2,3}))?]/g)
        if (time) {
          let lrc = r.split(time)[1]
          let timeReg = time[0].match(/(\d{2,}):(\d{2})(?:\.(\d{2,3}))?/)
          let timeSec = parseInt(timeReg[1]) * 60 + parseInt(timeReg[2]) + parseInt(timeReg[3] / 1000)
          list.push({
            lrc,
            time: timeSec
          })
          this.setData({
            lrcList: list
          })
        }
      })
    }
  }
})
