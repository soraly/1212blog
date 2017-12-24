var express = require('express')
var bodyParser = require('body-parser')
var consolidate = require('consolidate')
var cookieSession = require('cookie-session')
var ejs = require('ejs')
var multer = require('multer')
var mysql = require('mysql')
var cookieParser = require('cookie-parser')

var server = express();

//测试md5
var md5Obj = require('./static/md5')
console.log(md5Obj.md5('lzx'))

if(process.env.NODE_ENV==='development'){
    console.log('i am in development...')
}

//1.获取请求数据 
//get req.query post:
server.use(bodyParser.urlencoded({ extended: true }));

// 2. cookie和session
server.use(cookieSession)

//3. 设置模板
server.set('view engine','html')  //输出的格式
server.engine('html', consolidate.ejs);  //指定引擎
server.set('views','template'); //指定模板位置

//4. 路由
var adminRoute = require('./route/admin')
var webRoute = require('./route/web')
server.use('/admin',adminRoute)
server.use('/web',webRoute)

//5. 静态数据
server.use(express.static(__dirname+ '/template'))
server.get('/',(req,res)=>{
    res.send('hello')
})
server.get('/lzx',(req,res)=>{
    res.render('1.ejs',{name: 'xiang'})
})

server.listen(8989);
console.log('server listen on 8989');