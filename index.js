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

//server.set('trust proxy', 1) // trust first proxy
// 2. cookie和session
server.use(cookieSession({
    name: 'session',
    keys: ['aaa', 'bbbb' ,'cccc'],
    maxAge: 24*3600*1000 //24h
}))

//3. 设置模板
server.set('view engine','html')  //输出的格式
server.engine('html', consolidate.ejs);  //指定引擎
server.set('views','template'); //指定模板位置

//4. 路由
var adminRoute = require('./route/admin')
var webRoute = require('./route/web')
server.use('/admin',adminRoute)
server.use('/web',webRoute)

server.get('/oss',(req,res)=>{
    res.render('oss/index.html')
})
var js_part = `<script type="text/javascript">
for (var a=window.location.href.split("?")[1].split("&"),r={},i=0; i<a.length; i++) {
    var b=a[i].split("=");
    // Escape URL string
    if (b[0] == 'url') {
        b[1] = decodeURIComponent(b[1]);
    }
    r[b[0]]=b[1];
}
console.log(r);
parent.upload_callback_1(r, 119598);
</script>`;
server.use('/returnJS',(req,res)=>{
    res.writeHead(200,{'Content-Type':'text/html'})
    res.end(js_part)
})
// server.use('/getToken',(req,res)=>{
//     res.writeHead(200,{'Content-Type':'text/html'})
//     res.end(js_part)
// })
server.use('/getToken',(req,res)=>{
    var url = 'http://school.igrow.cn/api/1.1b/file/upyun/form/uploadcallback?funcid=1&image-type=JPEG&image-frames=1&image-height=326&sign=a9a3cbce4a7737158ded86af025b3b58&ext-param=igr-domain%3Dpictest.haoyuyuan.com&code=200&file_size=24004&image-width=767&url=%2F2017%2F12%2F29%2F2unoien0qth3zuvnb0ng1955eiih3jqo.jpg&time=1514512627&message=ok&mimetype=image%2Fjpeg';
    var url2 = 'http://school.igrow.cn/api/1.1b/file/upyun/form/uploadcallback_1?image-type=JPEG&image-frames=1&image-height=326&sign=a9a3cbce4a7737158ded86af025b3b58&ext-param=igr-domain%3Dpictest.haoyuyuan.com&code=200&file_size=24004&image-width=767&url=%2F2017%2F12%2F29%2F2unoien0qth3zuvnb0ng1955eiih3jqo.jpg&time=1514512627&message=ok&mimetype=image%2Fjpeg';
    var url3 = 'http://baby.igrow.cn/api/1.1b/file/upyun/form/uploadcallback_2?semesterid=4071&image-type=JPEG&image-frames=1&image-height=223&sign=05ab5b1cab45955ab3c97735e6e4f6b9&ext-param=igr-domain%3Dimgtest.haoyuyuan.com&code=200&file_size=14454&image-width=656&url=%2F2017%2F12%2F29%2Fh2grr3qd8jr4x2t48jl2z6tvqleqa1c1.jpg&time=1514526799&message=ok&mimetype=image%2Fjpeg'
    res.writeHead(302,{'Content-Type':'text/html','Access-Control-Allow-Origin':'*','Location':'http://localhost:8989/returnJS'})
    res.end('{"name":"xiang"}')
})

server.use(express.static(__dirname+ '/template'))

server.listen(8989);
console.log('server listen on 8989');