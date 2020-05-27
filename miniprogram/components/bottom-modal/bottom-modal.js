// components/bottom-modal/bottom-modal.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    modalShow: Boolean
  },

  options: {
    styleIsolation: 'apply-shared',
    multipleSlots: true // 多个插槽
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    onClose () {
      console.log('guanbi')
      this.setData({
        modalShow: false
      })
    }
  }
})
