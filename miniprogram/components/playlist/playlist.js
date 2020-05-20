// components/playlist/playlist.js
Component({
  /**
   * 组件的属性列表
   */
  properties: { // 等同 vue得props
    playlist: {
      type: Object
    }
  },

  observers: { // 监听
    ['playlist.playCount'] (val) {
      
      this.setData({
        _count: this._tranNumber(val, 2)
      })
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    _count: 0
  },

  /**
   * 组件的方法列表
   */
  methods: {
    _tranNumber (num, point) {
      let numStr = num.toString().split('.')[0]
      if (numStr.length < 6) {
        return numStr
      } else if (numStr.length >= 6 && numStr.length <= 8) {
        let decimal = ((+numStr) / 10000).toFixed(2)
        return decimal + '万'
      } else {
        return ((+numStr) / 100000000).toFixed(4) + '亿'
      }
    },

    goToMusiclist () {
      wx.navigateTo({
        url: `../../pages/musiclist/musiclist?playlistId=${this.properties.playlist.id}`,
      })
    } 
  }
})
