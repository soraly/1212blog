const express = require('express')
const router = express.Router()
const common = require('../../common/md5')
const sass = require('node-sass');
const fs = require('fs')
//mysql的连接pool
const pool = require('../../models/index.js');


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


//检查是否有session，没有就去登录
router.use((req, res, next) => {
    console.log(req.session.user_id, 'req.session.user_id')
    if (!req.session.user_id && req.url != '/login') {
        res.redirect('/admin/login');
    } else {
        next();
    }
})
router.get('/login', (req, res) => {
    res.render('./admin/login.ejs')
})

router.post('/login', (req, res) => {
    var sql = `select * from user_tables where username='${req.body.username}'`;
    pool.query(sql, (err, data) => {
        if (err) {
            res.status(500).end('database err')
        } else {
            console.log(data, 'data')
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
router.get('/', (req, res) => {
    complieSass('./assets/css/main.scss', './template/css/mainn.css').then(()=>{
        res.render('./admin/success.ejs');
    })    
})
router.get('/teacher2', (req, res) => {
    res.send('i am teacher2')
})
module.exports = router

//cookie-session简单用法
// server.get('/lzx',(req,res)=>{
//     req.session.count =  (req.session.count||0) +1;
//     res.send('count'+req.session.count);
// })
