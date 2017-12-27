var crypto = require('crypto');
module.exports = {
    'base': 'fjslfjslgfjlsfjlsfjsf',
    'md5': function (content) {
        var obj = crypto.createHash('md5');
        obj.update(content+this.base);
        return obj.digest('hex');
    }
}