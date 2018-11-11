var helpers = require('../../lib/helpers')
module.exports = function (data, callback) {
    var email = data.payload.email && helpers.emailTest(data.payload.email.trim()) ? data.payload.email.trim() : false
    var password = data.payload.password && typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 2 ? data.payload.password : false;
    if (email && password) {
        helpers.read('tokens',email,function(err,tokenData){
            if(err){
                helpers.read('users', data.payload.email.trim(), function (err, userData) {
                    if (!err) {
                        if (helpers.hash(password) == userData.password) {
                            var newToken = helpers.createRandomString(20)
                            var newTokenData = {
                                'id': newToken,
                                'email': email
                            }
                            helpers.create('tokens', newTokenData.email,newTokenData, function (statusCode, payload) {
                                callback(statusCode, payload)
                            })
                        } else {
                            callback(400, { 'Error': 'password does not match' })
                        }
                    } else {
                        callback(500, { 'Error': 'could not read user' })
                    }
                })
            }else{
                callback(200, {'token':tokenData.id})
            }
        })

    }
    else {
        callback(400, { 'Error': 'Input field(s) is not valid' })
    }

}