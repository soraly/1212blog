var express = require('express')
var bodyParser = require('body-parser')
var consolidate = require('consolidate')
var cookieSession = require('cookie-session')
var ejs = require('ejs')
var multer = require('multer')
var mysql = require('mysql')
var adminRoute = require('./route/admin')
var webRoute = require('./route/web')
var server = express();
var md5Obj = require('./static/md5')
console.log(md5Obj.md5('lzx'))
if(process.env.NODE_ENV==='development'){
    console.log('i am in development...')
}
server.use('/admin',adminRoute)
server.use('/web',webRoute)
server.use(express.static(__dirname+ '/template'))
server.get('/',(req,res)=>{
    res.send('hello')
})

server.listen(8989);
console.log('server listen on 8989');