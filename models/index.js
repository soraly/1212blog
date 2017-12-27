var mysql = require('mysql')
var pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'lzx123',
    database: '20171212blog'
})
module.exports = pool;