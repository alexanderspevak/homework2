var helpers = require('../lib/helpers');

var workers = {}
workers.init = function () {
    console.log('\x1b[33m%s\x1b[0m','Background workers are running')

    setInterval(function(){
        helpers.readLog('orders', 'orders', function (err, logArr) {
            if (!err) {
                var openLogs = [];
                var closedLogs = []
                logArr.forEach(function (order) {
                    if (order.status == 'closed') {
                        closedLogs.push(order)
                    } else if (order.status == 'open') {
                        openLogs.push(order)
                    } else if (order.status != 'open' && order.status != 'closed') {
                        console.log('Please check logs, order status unknown')
                    }
                })
                console.log('closedLogs', closedLogs)
                helpers.updateLog('orders', 'orders', openLogs, function (err) {
                    if (!err) {
                        console.log('Closed orders removed from active orders')
                    } else {
                        console.log('Error removing closed orders', err)
                    }
                })
                if (closedLogs.length > 0) {
                    helpers.zipOrders('orders', helpers.formattedNow(), JSON.toString(closedLogs), function (err) {
                        if (!err) {
                            console.log('zipped files saved')
                        } else {
                            console.log('error zipping files: ' + err)
                        }
                    })
                } else {
                    console.log('no zipped files for saving')
                }
    
            } else {
                console.log('Could not read logs in saving process')
            }
        })

    },60*60*1000*24)

}

module.exports = workers;

