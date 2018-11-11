var helpers = require('../../lib/helpers')

var logout = (data, callback) => {
    if (data.method == 'delete') {
        var token = data.headers.token ? data.headers.token.trim() : false
        if (data.payload.email && token) {
            helpers.read('tokens', data.payload.email, function (err, tokenData) {
                if (!err) {
                    if (token === tokenData.id) {
                        helpers.delete('tokens', tokenData.email, function (err) {
                            if (err) {
                                callback(500, { 'Error': 'Issue with deleting token' })
                            } else {
                                callback(200)
                            }
                        })
                    } else {
                        callback(400, { 'Error': 'wrong email or you are not logged in' })
                    }
                } else {
                    callback(400, { 'Error': 'You are not logged in ' })
                }
            })
        } else {
            callback(400, { 'Error': 'You did not provide email or you are not logged in' })
        }
    }
    else {
        callback(400, { 'Error': ' Method for this route is delete' })
    }
}

module.exports = logout;