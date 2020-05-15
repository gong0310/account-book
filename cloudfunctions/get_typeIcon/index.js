// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

//获取数据库引用
const db = cloud.database();

// 云函数入口函数
//await必须配合async, 不能单独使用await
exports.main = async (event, context) => {
  //查询数据库
  try {

    return await db.collection('typeIcon').get();

  } catch(err) {
    console.log('云函数调用失败 err ==> ', err);
  }

}