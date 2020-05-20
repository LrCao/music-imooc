// components/progress-bar/progress-bar.js
// 进度条宽度
let movableAreaWidth = 0
// 进度条球宽度
let movableViewWidth = 0

let currentSec = 0

let duration = 0

let isMova = false // 当前是否在拖动

const backgroundAudioManager = wx.getBackgroundAudioManager()

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isSame: Boolean
  },

  /**
   * 组件的初始数据
   */
  data: {
    showTime: {
      currentTime: '00:00',
      totalTime: '00:00'
    },
    movableDis: 0, // 进度条球的位置
    progress: 0 // 进度条移动百分比
  },

  lifetimes: {
    ready () {
      if (this.properties.isSame && this.data.showTime.totalTime === '00:00') {
        this._setTime()
      }
      this._getMovableDis()
      this._bindBGMEvent()
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onChange (event) {
      if (event.detail.source === 'touch') {
        this.data.progress = event.detail.x / (movableAreaWidth - movableViewWidth) * 100
        this.data.movableDis = event.detail.x
        isMova = true
      }
    },

    onTouchEnd () {
      // 获取当前拖动后的播放时间 秒
      const playTime = duration * this.data.progress / 100
      const currentTimeFmt = this._dateFormat(playTime)
      this.setData({
        propgress: this.data.progress,
        movableDis: this.data.movableDis,
        ['showTime.currentTime']: currentTimeFmt.min + ":" + currentTimeFmt.sec
      })
      backgroundAudioManager.seek(playTime)
      isMova = false
    },

    _getMovableDis () {
      const query = this.createSelectorQuery()
      query.select('.movable-area').boundingClientRect()
      query.select('.movable-view').boundingClientRect()
      query.exec(rect => {
        movableAreaWidth = rect[0].width
        movableViewWidth = rect[1].width
      })
    },

    _bindBGMEvent () {
      backgroundAudioManager.onPlay(() => {
       isMova = false
       this.triggerEvent('musicPlay')
      })
      
      backgroundAudioManager.onStop(() => {
        console.log('onStop')
      })

      backgroundAudioManager.onPause(() => {
        this.triggerEvent('musicPause')
      })

      backgroundAudioManager.onWaiting(() => {
        console.log('owWaiting')
      })

      backgroundAudioManager.onCanplay(() => {
        console.log('onCanplay')
        this._setTime()
      })

      backgroundAudioManager.onTimeUpdate(() => {
        if (isMova) {
          return
        }
        // 获取歌曲当前播放时长
        const currentTime = backgroundAudioManager.currentTime
        let sec = +currentTime.toString().split('.')[0]
        if (sec !== currentSec) {
          const duration = backgroundAudioManager.duration
          const currentTimeFmt = this._dateFormat(currentTime)
          this.setData({
            movableDis: (movableAreaWidth - movableViewWidth) * (currentTime / duration),
            progress: currentTime / duration * 100,
            ['showTime.currentTime']: `${currentTimeFmt.min}:${currentTimeFmt.sec}`
          })
          currentSec = sec
          // 联动歌词
          this.triggerEvent('timeUpdate', {
            currentTime
          })
        }
        
      })

      backgroundAudioManager.onEnded(() => {
        this.triggerEvent('musicEnd')
      })

      backgroundAudioManager.onError(res => {
        console.log('onError')
        console.error(res,errMsg)
        console.error(res.errCode)
        wx.showToast({
          title: '错误' + res.errCode
        })
      })
    },

    // 格式化时间
    _dateFormat (sec) {
      const min = Math.floor(sec / 60)
      sec = Math.floor(sec % 60)
      return {
        'min': this._parse0(min),
        'sec': this._parse0(sec)
      }
    },

    // 补零
    _parse0 (sec) {
      return sec < 10 ? '0' + sec : sec
    },

    _setTime () {
      // 获取当前歌曲总时长
      duration = backgroundAudioManager.duration
      // 原生可能获取不到时长
      if (duration === undefined) {
        setTimeout(() => {
          duration = backgroundAudioManager.duration
          const durationFmt = this._dateFormat(duration)
          this.setData({
            ['showTime.totalTime']: `${durationFmt.min}:${durationFmt.sec}`
          })
        }, 1000)
      } else {
        const durationFmt = this._dateFormat(duration)
        this.setData({
          ['showTime.totalTime']: `${durationFmt.min}:${durationFmt.sec}`
        })
      }
    }
  }
})
