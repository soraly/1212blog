const express = require('express')
const router = express.Router()
const common = require('../../common/md5')
const sass = require('node-sass');
const fs = require('fs')
//mysql的连接pool
const pool = require('../../models/index.js');

//编译scss
function complieSass(inputUrl,outPut) {
    return new Promise((resolve, reject) => {
        sass.render({
            file: inputUrl,
            outputStyle: 'expanded'
        }, function (err, data) {
            if (err) {
                console.log(err, 'rrr')
            } else {
                var css = data.css.toString();
                fs.writeFile(outPut, css, (err) => {
                    console.log('write done')
                    resolve()
                })
            }
        })
    })
}


//每次请求过来时检查是否有session，没有就去登录
router.use((req, res, next) => {
    console.log(req.session.user_id, 'req.session.user_id')
    if (!req.session.user_id && req.url != '/login') {
        res.redirect('/admin/login');
    } else {
        next();
    }
})
//配置login页的路由，get方式表示获取login页面，post方式表示是提交数据到login页
router.get('/login', (req, res) => {
    if(req.session.user_id){
        res.redirect('/admin/')
    }else {
        res.render('./admin/login.ejs')
    }
})

router.post('/login', (req, res) => {
    var sql = `select * from user_tables where username='${req.body.username}'`;
    pool.query(sql, (err, data) => {
        if (err) {
            res.status(500).end('database err')
        } else {
            if (data.length) {
                if (data[0].password == common.md5(req.body.password)) {
                    req.session.user_id = data[0].id;
                    res.redirect('/admin/');
                } else {
                    res.status(400).send('密码错误').end()
                }
            } else {
                res.status(400).send('用户名错误').end()
            }
        }
    })
})
//访问 localhost:8989/admin时的页面
router.get('/', (req, res) => {
    complieSass('./assets/css/main.scss', './template/css/mainn.css').then(()=>{
        res.render('./admin/success.ejs');
    })
})
//banners的路由，根据action区别行为
router.get('/banners',(req,res)=>{
    var banners = [];
    switch (req.query.action){
        case 'edit':
            break;

        case 'del':
            var sql = 'delete from banner_table where id =' + req.query.id;
            pool.query(sql, (err,data)=>{
                if(err){
                    res.status(500).end('data base wrong..' + err)
                }else {
                    res.redirect('/admin/banners')
                }
            })
            break;
        default:
            var sql = 'select * from banner_table';
            pool.query(sql, (err, data)=>{
                if(err){
                    res.status(500).end('data wrong...' + err);
                }else {
                    res.render('./admin/banners.ejs', {banners: data});
                    console.log(data,'data')
                }
            })
    }

})
router.post('/banners',(req,res)=>{
    var title = req.body.title;
    var description = req.body.description;
    var link = req.body.link;
    var sql = `insert into banner_table values(null, '${title}','${description}','${link}')`
    console.log(sql,'sql')
    pool.query(sql, (err, data)=>{
        if(err){
            res.status(500).end('data wrong...' + err)
        }else {
            console.log(data,'add-data')
            res.redirect('/admin/banners');
        }
    })
})
router.get('/teacher2', (req, res) => {
    res.send('i am teacher2');
})
module.exports = router

//cookie-session简单用法
// server.get('/lzx',(req,res)=>{
//     req.session.count =  (req.session.count||0) +1;
//     res.send('count'+req.session.count);
// })
