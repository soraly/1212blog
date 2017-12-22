const crypto = require('crypto');
const content = 'lzx'
var md5 = crypto.createHash('md5')
md5.update(content)
var hex = md5.digest('hex')
console.log(hex,'hex')