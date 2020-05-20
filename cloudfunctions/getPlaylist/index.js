// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 初始化云服务器
const db = cloud.database()

const playlistCollection = db.collection('playlist')

const rp = require('request-promise')

const URL = 'http://musicapi.xiecheng.live/personalized'

// 数据库一次获取数据最大条数
const MAX_LIMIT = 100

// 云函数入口函数
exports.main = async (event, context) => {
  // 获取数据库数据
  // const list = await playlistCollection.get()
  // 获取数据库数据条数对象
  const countResult = await playlistCollection.count()
  // 获取数据库数据总条数
  const total = countResult.total
  // 获取数据库数据调用次数，以获得所有数据
  const batchTimes = Math.ceil(total / MAX_LIMIT)

  const tasks = []

  for (let i = 0; i < batchTimes; i++) {
    // 获取 i*MAX_LIMIT 到 MAX_LIMIT 数据
    let promise = playlistCollection.skip(i*MAX_LIMIT).limit(MAX_LIMIT).get()
    tasks.push(promise)
  }

  let list = {
    data: []
  }
  // 获取数据库所有数据
  if (tasks.length > 0) {
    list = (await Promise.all(tasks)).reduce((a,b) => {
      return {
        data: a.data.concat(b.data)
      }
    })
  }

  const playlist = await rp(URL).then(res => {
    return JSON.parse(res).result
  })

  let newData = []

  for(let i = 0,len = playlist.length; i < len; i++) {
    let flag = true
    for (let j = 0, len1 = list.data.length; j < len1; j++) {
      if (playlist[i].id === list.data[j].id) {
        flag = false
        break
      }
    }
    if (flag) {
      newData.push(playlist[i])
    }
  }

  for (let i = 0, len = newData.length; i < len; i++) {
    await playlistCollection.add({
      data: {
        ...newData[i],
        createTime: db.serverDate() // 获取数据库时间
      }
    }).then(() => {
      console.log('插入成功')
    }).catch(() => {
      console.log('插入失败')
    })
  }
  // playlist.forEach(i => {
  //   // 获取云数据库数据
    
  // })
}