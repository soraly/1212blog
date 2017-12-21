var express = require('express')
var router = express.Router()
router.get('/student1',(req,res)=>{
    res.send('i am student1')
})
router.get('/student2',(req,res)=>{
    res.send('i am student2')
})
module.exports = router