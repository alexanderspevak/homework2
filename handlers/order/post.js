var helpers = require('../../lib/helpers');

module.exports = (data, callback) => {
    var token = data.headers.token ? data.headers.token.trim() : false
    if (data.queryString.email && token) {
        helpers.read('tokens', data.queryString.email.trim(), function (err, tokenData) {
            if (!err) {
                if (token === tokenData.id) {
                    helpers.readLog('orders', 'orders', function (err, logData) {
                        if (!err) {
                            var existingOrdersCount = 0
                            if(logData.length>0){
                                logData.forEach((order) => {
                                    if (order.user&&order.user.trim() === data.queryString.email.trim() && order.status == 'open') {
                                        existingOrdersCount++
                                    }
                                })
                            }
                     
                            if (existingOrdersCount > 0) {
                                callback(400, { 'Error': 'You have unprocessed orders. Close before you create new one' })
                            } else {
                                helpers.read('menu', 'menu', function (err, menuData) {
                                    if (!err) {
                                        var amount = 0;
                                        try {
                                            menuData.forEach(function (menuItem) {
                                                data.payload.forEach(function (item) {
                                                    if (menuItem.id == item.id) {
                                                        amount = amount + menuItem.price * item.qty
                                                    }
                                                })
                                            })
                                            var orderData = {
                                                'user': data.queryString.email.trim(),
                                                'amount': amount,
                                                'status': "open",
                                                'order': data.payload,
                                                'timeCreated':new Date(Date.now()).toLocaleString()
                                            }
                                            helpers.append('orders', 'orders', JSON.stringify(orderData), function (err) {
                                                if (!err) {
                                                    callback(200)
                                                } else {
                                                    callback(500, { 'Error': 'Could not save order' })
                                                }
                                            })
                                        }
                                        catch (err) {
                                            callback(400, { 'Error': 'invalid data structure' })
                                        }
                                    } else {
                                        callback(500, { 'Error': 'Could not read menu' })
                                    }
                                })
                            }
                        } else {
                            callback(500, { 'Error': 'Could not read orders' })
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