var helpers = require('../../lib/helpers');

module.exports=function(data,callback){
    var token = data.headers.token ? data.headers.token.trim() : false
    if (data.queryString.email && token) {
        helpers.read('tokens', data.queryString.email.trim(), function (err, tokenData) {
            if (!err) {
                if (token === tokenData.id) {
                        helpers.read('menu', 'menu', function (err, menuData) {
                            if (!err) {
                                callback(200,menuData)
                            } else {
                                callback(500, { 'Error': err })
                            }
                        })
                } else {
                    callback(400, { 'Error': 'invalid token' })
                }
            } else {
                callback(400, { 'Error': 'Email does not match' })
            }
        })
    } else {
        callback(400, { 'Error': 'You did not provide email or you are not logged in' })
    }
}