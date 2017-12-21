var express = require('express')
var router = express.Router()
router.get('/teacher1',(req,res)=>{
    res.send('i am teacher1')
})
router.get('/teacher2',(req,res)=>{
    res.send('i am teacher2')
})
module.exports = router
