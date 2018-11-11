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
                            var newOrdersList=[];
                            if(logData.length>0){
                                logData.forEach((order) => {
                                    if (order.user&&order.user.trim() === data.queryString.email.trim() && order.status == 'open') {
                                        existingOrdersCount++
                                    }else{
                                        newOrdersList.push(order)
                                    }
                                })
                            }
                     
                            if (existingOrdersCount > 0) {
                                helpers.updateLog('orders','orders',newOrdersList,function(err){
                                    if(!err){
                                        callback(200)
                                    }else{
                                        callback(500,{'Error':'Could not delete active order'})
                                    }
                                })
                            } else {
                                callback(400, { 'Error': 'There is no active order to be canceled' })
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