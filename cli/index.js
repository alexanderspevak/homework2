var helpers = require('../lib/helpers');
var readline = require('readline');
var events = require('events');
class _events extends events { };
var e = new _events();

var cli = {};


cli.help = function () {

    var helpObj = {
        'menu': 'Shows menu',
        'help': 'Shows help',
        'orders': 'Shows orders',
        'users': 'Shows users',
        'user --<userId>': 'Shows user specified by id',
        'order --<orderId>': 'shows order specified by id'
    }

    cli.centeredText('Help Menu')
    cli.verticalSpace(1);
    cli.horizontalLine();

    var line;
    for (var key in helpObj) {
        line = ''
        if (helpObj.hasOwnProperty(key)) {
            line += key
            for (var i = 0; i < 60 - key.length; i++) {
                line += ' '
            }
            line += helpObj[key]
            console.log(line)
        }
    }

    cli.horizontalLine();
}

cli.menu = function () {
    helpers.read('menu', 'menu', function (err, data) {
        if (!err && data) {
            console.dir(data)
        } else {
            console.log('sorry we have an error or menu is empty')
        }
    })
}

cli.orders = function () {
    helpers.readLog('orders', 'orders', function (err, data) {
        if (!err) {
            var displayArr = []
            if (data && data.length > 0) {
                for (var i = 0; i < data.length; i++) {
                    if (cli.checkIfwithinDay(helpers.dateToMiliSeconds(data[i].timeCreated))) {
                        displayArr.push(data[i])
                    }
                }
                console.log(displayArr)
            }
            helpers.readDir('orders', function (err, dataZip) {
                if (!err) {

                    for (var j = 0; j < dataZip.length; j++) {
                        var file = dataZip[j];
                        if (file.slice(-1) == 4) {
                            helpers.readZip('orders', file, function (err, zipData) {
                                if (!err && zipData) {
                                    var filteredDisplayArr = JSON.parse(zipData).filter(function (item) {
                                        var milis = helpers.dateToMiliSeconds(item.timeCreated)
                                        if (Date.now() - milis - 24 * 60 * 60 * 1000 < 0) {
                                            return true
                                        } else {
                                            return false
                                        }
                                    })
                                    console.log(filteredDisplayArr)
                                }
                            })
                        }
                    }
                }
            })
        } else {
            console.log('error or data empty', err)
        }
    })
}



cli.order = function (str) {
    var orderId = str.split('--')[1]
    if (orderId) {
        helpers.readLog('orders', 'orders', function (err, data) {
            if (!err) {
                var displayArr = []
                if (data && data.length > 0) {
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].id == orderId) {
                            displayArr.push(data[i])
                        }
                    }
                    if (displayArr.lengt > 0) {
                        console.log(displayArr[0])
                    }

                }
                helpers.readDir('orders', function (err, dataZip) {
                    if (!err) {

                        for (var j = 0; j < dataZip.length; j++) {
                            var file = dataZip[j];
                            if (file.slice(-1) == 4) {
                                helpers.readZip('orders', file, function (err, zipData) {
                                    if (!err && zipData) {
                                        var filteredDisplayArr = JSON.parse(zipData).filter(function (item) {
                                            if (item.id == orderId) {
                                                return true
                                            } else {
                                                return false
                                            }
                                        })
                                        if (filteredDisplayArr.length > 0) {
                                            console.log(filteredDisplayArr[0])
                                        }

                                    }
                                })
                            }
                        }
                    }
                })
            } else {
                console.log('error:', err)
            }
        })

    }

}
cli.users = function () {
    helpers.readDir('users', function (err, files) {
        if (!err) {
            for (var j = 0; j < files.length; j++) {
                var file = files[j].substring(0, files[j].length - 5);
                helpers.read('users', file, function (err, data) {
                    if (!err && data) {
                        var milis = helpers.dateToMiliSeconds(data.timeCreated)
                        if (Date.now() - milis - 24 * 60 * 60 * 1000 < 0) {
                            console.log(data)
                        }

                    }
                })

            }
        } else {
            console.log('no users')
        }
    })

}

cli.user = function (str) {
    var userId = str.split('--')[1]
    if (userId) {
        helpers.readDir('users', function (err, files) {
            if (!err) {
                for (var j = 0; j < files.length; j++) {
                    var file = files[j].substring(0, files[j].length - 5);
                    if (file == userId) {
                        helpers.read('users', file, function (err, data) {
                            if (!err && data) {
                                console.log(data)
                            }
                        })
                    }
                }
            } else {
                console.log('no users')
            }
        })

    }else{
        console.log('nonexistent user id')
    }


}

cli.checkIfwithinDay = function (miliDate) {
    var milisInDay = 24 * 60 * 60 * 1000
    if (Date.now() - miliDate < milisInDay) {
        return true
    } else {
        return false
    }
}



cli.centeredText = function (str) {
    str = typeof (str) == 'string' ? str : ''
    var width = process.stdout.columns
    var indent = Math.floor((width - str.length) / 2)
    var line
    for (var i = 0; i < indent; i++) {
        line += ' '
    }
    line += str
    console.log(line)
}

cli.verticalSpace = function (lines) {
    lines = typeof (lines) == 'number' && lines > 0 ? lines : 1
    for (var i = 0; i < lines; i++) {
        console.log('');
    }
}

cli.horizontalLine = function () {
    var line = ''
    var width = process.stdout.columns
    for (var i = 0; i < width; i++) {
        line += '-'
    }
    console.log(line)
}

e.on('menu', cli.menu)
e.on('help', cli.help)
e.on('orders', cli.orders)
e.on('users', cli.users)
e.on('order --', function (str) {
    cli.order(str)
})
e.on('user --', function (str) {
    cli.user(str)
})
cli.processInput = function (str) {
    str = typeof (str) == 'string' && str.trim().length > 0 ? str.trim() : false
    if (str) {
        var commands = [
            'menu',
            'help',
            'orders',
            'users',
            'order --',
            'user --'
        ]

        var matchFound = false;
        for (var i = 0; i < commands.length; i++) {
            var command = commands[i];
            if (str.indexOf(command) > -1) {
                e.emit(command, str)
                matchFound = true
            }
        }
        if (!matchFound) {
            console.log('Please try again, no matching command found')
        }

    }


}
cli.init = function () {
    console.log('Cli is running')
    var _interface = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: '>'
    })

    _interface.prompt();
    _interface.on('line', function (str) {
        cli.processInput(str)
    })

}

module.exports = cli;