var helpers = require('../../lib/helpers')

module.exports = function (data, callback) {
    var token = data.headers.token ? data.headers.token.trim() : false
    if (data.queryString.email && token) {
        helpers.read('tokens', data.queryString.email.trim(), function (err, tokenData) {
            if (!err) {
                if (token === tokenData.id) {
                    var email = data.payload.email && helpers.emailTest(data.payload.email.trim()) ? data.payload.email.trim() : false
                    var street = data.payload.street && typeof (data.payload.street) == 'string' && data.payload.street.trim().length > 0 ? data.payload.street : false;
                    var name = data.payload.name && typeof (data.payload.name) == 'string' && data.payload.name.trim().length > 0 ? data.payload.name : false;
                    var password = data.payload.password && typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 2 ? data.payload.password : false;
                    if (email || street || name || password) {
                        helpers.read('users', data.queryString.email.trim(), function (err, userData) {
                            if (!err) {
                                var dataToWrite = {};
                                dataToWrite.email = email ? email : userData.email
                                dataToWrite.street = street ? street : userData.street
                                dataToWrite.name = name ? name : userData.name
                                dataToWrite.password = password ? helpers.hash(password) : userData.password
                                helpers.update('users', data.queryString.email.trim(), dataToWrite, email, function (err) {
                                    if (!err) {
                                        if (email) {
                                            helpers.update('tokens', data.queryString.email, { 'id': token, 'email': email }, email, function (err) {
                                                if (!err) {
                                                    callback(200, { 'message': 'data changed' })
                                                } else {
                                                    callback(500, { 'Error': err })
                                                }
                                            })
                                        } else {
                                            callback(200, { 'message': 'data changed' })
                                        }
                                    } else {
                                        callback(500, { 'Error': err })
                                    }
                                })
                            } else {
                                callback(500, { 'Error': err })
                            }
                        })
                    } else {
                        callback(400, { 'Error': 'You did not provide fields to be changed or fields are invalid' })
                    }
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
