var express = require('express')
var router = express.Router()
var common = require('../../common/md5')
//检查是否有session，没有就去登录
router.get('/login',(req,res,next)=>{
    if(req.session.user){
        res.render('./admin/success.ejs')
    }else {
        res.render('./admin/login.ejs')
    }
})
//mysql的连接pool
var pool = require('../../models/index.js');
router.post('/login',(req,res)=>{
    var sql = `select * from user_tables where username='${req.body.username}'`;
    pool.query(sql, (err,data)=>{
        if(err){
            res.status(500).end('database err')
        }else {
            console.log(data,'data')
            if(data.length){
                if( data[0].password == common.md5(req.body.password) ){
                    res.send('login success')
                }else {
                    res.send('密码错误')
                }
            }else {
                res.send('用户名错误')
            }
        }
    })
})
router.get('/teacher1',(req,res)=>{
    res.send('i am teacher1')
})
router.get('/teacher2',(req,res)=>{
    res.send('i am teacher2')
})
module.exports = router

//cookie-session简单用法
// server.get('/lzx',(req,res)=>{
//     req.session.count =  (req.session.count||0) +1;
//     res.send('count'+req.session.count);
// })
