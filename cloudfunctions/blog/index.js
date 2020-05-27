// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const TcbRouter = require('tcb-router')

const db = cloud.database()

const blog = db.collection('blog')

const MAX_LIMIT = 100

// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({
    event
  })

  app.router('list', async (ctx, next) => {
    
    const keyWord = event.keyWord
    let w = {}
    if (keyWord.trim() !== '') {
      w = {
        content: db.RegExp({
          regexp: keyWord,
          options: 'i'
        })
      }
    }

    let blogList = await blog.where(w).skip(event.start).limit(event.count)
    .orderBy('createTime', 'desc').get().then(res => {
      return res.data
    })
    ctx.body = blogList
  })

  app.router('detail', async(ctx, next) => {
    let blogId = event.blogId
    // 详情查询
    let detail = await blog.where({
      _id: blogId
    }).get().then(res => {
      return res.data
    })

    // 评论查询
    const countResult = await blog.count()
    const total = countResult.total
    let commentList = {
      data: []
    }
    if (total > 0) {
      const batchTimes = Math.ceil(total / MAX_LIMIT) 
      const tasks = []
      for (let i = 0; i < batchTimes; i++) {
        let promise = db.collection('blog-comment').skip(i *MAX_LIMIT)
          .limit(MAX_LIMIT)
          .where({
            blogId
          }).orderBy('createTime', 'desc').get()
        tasks.push(promise)
      }
      if (tasks.length > 0) {
        commentList = (await Promise.all(tasks)).reduce((a,b) =>{
          return {
            data: a.data.concat(b.data)
          }
        })
      }
    }
    ctx.body = {
      commentList,
      detail
    }
  })

  const wxContext = cloud.getWXContext()
  app.router('getListByOpenid', async(ctx, next) => {
    ctx.body = await blog.where({
      _openid: wxContext.OPENID
    }).skip(event.start).limit(event.count)
    .orderBy('createTime', 'desc').get().then(res => {
      return res.data
    })
  })

  return app.serve()
}