var crypto = require('crypto')
var config = require('./config');
var path = require('path');
var fs = require('fs')
var helpers = {}
baseDir = path.join(__dirname, '../data/')
var https = require('https');
const queryString = require('querystring')
var zlib = require('zlib');

helpers.hash = function (str) {
    if (typeof (str) === 'string' && str.length > 0) {
        var hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
        return hash
    } else {
        return false
    }
}

helpers.parseJsonToObject = function (str) {
    try {
        var obj = JSON.parse(str)
        return obj;
    } catch (e) {
        return {}
    }
}
helpers.emailTest = function (str) {
    var emailRegexp = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    return emailRegexp.test(str)
}
helpers.createRandomString = function (strLen) {
    var strLength = typeof (strLen) == 'number' && strLen > 0 ? strLen : false;
    if (strLength) {
        var possibleCharacters = 'abcdefgijklmnopqrstuvxyz0123456789'
        var str = '';
        for (i = 1; i <= strLength; i++) {
            var randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length))
            str += randomCharacter;
        }
        return str;
    } else {
        return false
    }
}
helpers.create = function (dir, file, data, callback) {
    //open the file for writing
    fs.open(baseDir + dir + '/' + file + '.json', 'wx', function (err, fileDescriptor) {
        if (!err && fileDescriptor) {
            //Convert data to string
            var stringData = JSON.stringify(data);
            //write to file and close it
            fs.writeFile(fileDescriptor, stringData, function (err) {
                if (!err) {
                    fs.close(fileDescriptor, function (err) {
                        if (!err) {
                            if (dir === 'tokens') {
                                callback(200, { 'token': data.id })
                            } else {
                                callback(200)
                            }
                        } else {
                            callback(500, { 'Error': 'error writing new file' })
                        }
                    })
                } else {
                    callback(500, { 'Error': 'Error writing to new file' })
                }
            })
        } else {
            if (dir == 'tokens') {
                callback(400, { 'Error': 'could not create new file, it may already exist' })
            } else {
                callback(500, { 'Error': 'could not create new file, it may already exist' })
            }
        }
    })
}
helpers.update = function (dir, file, data, rename, callback) {
    //opent the file for writing
    fs.open(baseDir + dir + '/' + file + '.json', 'r+', function (err, fileDescriptor) {
        if (!err && fileDescriptor) {
            var stringData = JSON.stringify(data)
            fs.truncate(fileDescriptor, function (err) {
                if (!err) {
                    fs.writeFile(fileDescriptor, stringData, function (err) {
                        if (!err) {
                            fs.close(fileDescriptor, function (err) {
                                if (!err) {
                                    if (rename) {
                                        fs.rename(baseDir + dir + '/' + file + '.json',
                                            baseDir + dir + '/' + data.email.trim() + '.json', function (err) {
                                                if (err) {
                                                    callback('error renaming file')
                                                } else {
                                                    callback(false)
                                                }
                                            })
                                    } else {
                                        callback(false)
                                    }

                                } else {
                                    callback('error closing the file')
                                }
                            })
                        } else {
                            callback('error writing to existing file')
                        }
                    })
                } else {
                    callback('error truncating file')
                }
            })
        } else {
            callback('could not open, file probably does not exist')
        }
    })
}

helpers.updateLog = function (dir, file, data, callback) {
    //opent the file for writing
    fs.open(baseDir + dir + '/' + file + '.log', 'r+', function (err, fileDescriptor) {
        if (!err && fileDescriptor) {

            var stringData = ''
            if (data.length > 0) {
                var nextLine = '\n';
                for (var i = 0; i < data.length; i++) {
                    stringData = stringData + JSON.stringify(data[i]) + nextLine
                }

                if (stringData != '') {
                    fs.truncate(fileDescriptor, function (err) {
                        if (!err) {
                            fs.writeFile(fileDescriptor, stringData, function (err) {
                                if (!err) {
                                    fs.close(fileDescriptor, function (err) {
                                        if (!err) {
                                            callback(false)

                                        } else {
                                            callback('error closing the file')
                                        }
                                    })
                                } else {
                                    callback('error writing to existing file')
                                }
                            })
                        } else {
                            callback('error truncating file')
                        }
                    })

                } else {
                    callback('error transforming file')
                }
            } else {
                callback('no data has been provided to function')
            }

        } else {
            callback('could not open, file probably does not exist')
        }
    })
}


helpers.read = function (dir, file, callback) {
    fs.readFile(baseDir + dir + '/' + file + '.json', 'utf8', function (err, data) {
        if (!err && data) {
            var parsedData = helpers.parseJsonToObject(data)
            callback(false, parsedData)
        } else {
            callback(err, data)
        }
    })
}

helpers.readLog = function (dir, file, callback) {
    fs.readFile(baseDir + dir + '/' + file + '.log', 'utf8', function (err, data) {
        if (!err && data) {
            try {
                var sendData = data.split('\n').map((obj) => {

                    return helpers.parseJsonToObject(obj)
                })
                sendData.splice(-1, 1)
                callback(false, sendData)
            } catch (error) {
                callback(error, data)
            }
        } else {
            callback(err, data)
        }
    })
}

helpers.append = function (dir, file, str, callback) {
    fs.open(baseDir + dir + '/' + file + '.log', 'a', function (err, fileDescriptor) {
        if (!err && fileDescriptor) {
            fs.appendFile(fileDescriptor, str + '\n', function (err) {
                if (!err) {
                    fs.close(fileDescriptor, function (err) {
                        if (!err) {
                            callback(false)
                        } else {
                            callback('Error closing file that was being appended')
                        }
                    })
                } else {
                    callback('Error appending to file')
                }
            })
        } else {
            callback('Could not open file for appending')
        }
    })
}


helpers.delete = function (dir, file, callback) {
    fs.unlink(baseDir + dir + '/' + file + '.json', function (err) {
        if (!err) {
            callback(false)
        } else {
            callback('could not delete file')
        }
    })
}

helpers.stripePayment = function (paymentData, callback) {
    var paymentDataCheck = true;
    ['amount', 'description', 'currency', 'source'].forEach((property) => {
        if (!paymentData[property]) {
            paymentDataCheck = false
        }
    })
    if (paymentDataCheck) {
        var { amount, source, description, currency } = paymentData;
        amount = typeof (amount) == 'number' ? amount : false;
        source = typeof (source) == 'string' ? source : false;
        currency = typeof (currency) == 'string' ? currency : false;
        description = typeof (description) == 'string' ? description : false;

        if (amount && source && currency && description) {
            const payload = {
                amount,
                currency,
                description,
                source
            }
 

            const stringPayload = queryString.stringify(payload)
            const requestDetails = {
                'protocol': 'https:',
                'hostname': 'api.stripe.com',
                'method': 'POST',
                'path': '/v1/charges',
                'auth': config.stripe.apiKey,
                'headers': {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': Buffer.byteLength(stringPayload)
                }
            }

            var req = https.request(requestDetails, function (res) {
                var status = res.statusCode;
                if (status == 200 || status == 201) {
                    callback(false)
                } else {
                    callback('status code returned  from stripe was ' + status)
                }
            })
            req.on('error', function (e) {
                callback(e)
            })

            req.write(stringPayload)
            req.end()


        } else {
            callback('invalid payment data type')
        }

    } else {
        callback('Data for payment are missing')
    }
}

helpers.sendMailgunMail = function (mailData, callback) {
    var mailDataCheck = true;
    ['to', 'subject', 'text'].forEach(function (key) {
        if (!mailData[key]) {
            mailDataCheck = false
        }
    })
    if (mailDataCheck) {
        var { to, subject, text } = mailData;
        to = typeof (to) == 'string' ? to : false;
        subject = typeof (subject) == 'string' ? subject : false;
        text = typeof (text) == 'string' ? text : false;
        const payload = {
            from: `Alexander <alexander@${config.mailgun.domainName}>`,
            to,
            subject,
            text
        }

        const stringPayload = queryString.stringify(payload)

        const requestDetails = {
            'protocol': 'https:',
            'hostname': 'api.mailgun.net',
            'method': 'POST',
            'path': `/v3/${config.mailgun.domainName}/messages`,
            'auth': `api:${config.mailgun.apiKey}`,
            'headers': {
                'cache-control': 'no-cache',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(stringPayload)
            }
        }

        var req = https.request(requestDetails, function (res) {
            var status = res.statusCode;
            if (status == 200 || status == 201) {
                callback(false)
            } else {
                callback('status code returned from mailgun was' + status)
            }
            res.on('data', function (chunk) {
            })
        })
        req.on('error', function (e) {
            callback(e)
        })

        req.write(stringPayload)
        req.end()

    } else {
        callback('Not all parameters have been  provided for email sending')
    }
}

helpers.zipOrders = function (dir, destFile, zippedLogs, callback) {
    zlib.gzip(zippedLogs, function (err, buffer) {
        if (!err) {
            fs.open(baseDir + dir + '/' + destFile + 'gz.b64', 'wx', function (err, fileDescriptor) {
                if (!err) {
                    fs.writeFile(fileDescriptor, buffer.toString('base64'), function (err) {
                        if (!err) {
                            fs.close(fileDescriptor, function (err) {
                                if (!err) {
                                    callback(false)
                                } else {
                                    callback('could not close file')
                                }
                            })
                        } else {
                            callback('error writing to zip file')
                        }
                    })
                } else {

                    callback('Could not create new file')
                }
            })
        } else {
            callback('Could not zip file '+err)
        }
    })

}

helpers.formattedNow=function() {
    var now = new Date();
    var y = now.getFullYear();
    var m = now.getMonth() + 1;
    var d = now.getDate();
    var time=now.getTime()
    var mm = m < 10 ? '0' + m : m;
    var dd = d < 10 ? '0' + d : d;
    return '' + y + mm + dd+'_'+time;
}



module.exports = helpers