var helpers = require('../../lib/helpers');
var config = require('../../lib/config')

module.exports = function (data, callback) {
    var token = data.headers.token ? data.headers.token.trim() : false
    if (data.queryString.email && token) {
        helpers.read('tokens', data.queryString.email.trim(), function (err, tokenData) {
            if (!err) {
                if (token === tokenData.id) {
                    helpers.readLog('orders', 'orders', function (err, logArr) {
                        if (!err) {
                            if (logArr.length > 0) {
                                var thisUsersActiveOrder;
                                var newLogArr = [];
                                logArr.forEach(function (order) {
                                    if (order.user && order.user.trim() === data.queryString.email.trim() && order.status === 'open') {
                                        thisUsersActiveOrder = order
                                        order.status = 'closed'
                                    }
                                    if (order.status) {
                                        newLogArr.push(order);
                                    }
                                })
                                if (thisUsersActiveOrder) {
                                    helpers.updateLog('orders', 'orders', newLogArr, function (err) {
                                        if (!err) {
                                            var paymentData = {
                                                'amount': thisUsersActiveOrder.amount,
                                                'source': config.stripe.source,
                                                'description': 'Card payment amex',
                                                'currency': 'usd'
                                            }
                                            helpers.stripePayment(paymentData, function (err) {
                                                if (!err) {
                                                    var emailData = {
                                                        'to': data.queryString.email.trim(),
                                                        'subject': 'Food payment',
                                                        'text': `you have been charged ${thisUsersActiveOrder.amount}`
                                                    }
                                                    helpers.sendMailgunMail(emailData, function (err) {
                                                        if (!err) {
                                                            callback(200)
                                                        } else {
                                                            callback(400, { 'Error': err })
                                                        }
                                                    })
                                                } else {
                                                    callback(400, { 'Error': err })
                                                }
                                            })
                                        } else {
                                            callback(500, { 'Error': err })
                                        }
                                    })
                                } else {
                                    callback(400, { 'Error': 'You have no active orders' })
                                }
                            } else {
                                callback(400, { 'Error': 'You have no active orders' })
                            }
                        } else {
                            callback(500, { 'Error': 'Could not read log file' })
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