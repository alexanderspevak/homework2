var http = require('http')
var https = require('https');
var fs = require('fs')
var path = require('path')
var config = require('../lib/config')
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder
var router = require('../handlers');
var helpers = require('../lib/helpers')
const crypto = require('crypto');

var server={}
server.init = () => {
    httpServer.listen(config.httpPort, () => {
        console.log('\x1b[32m%s\x1b[0m', 'server is listening on port ' + config.httpPort)
    })
    httpsServer.listen(config.httpsPort, () => {
        console.log('\x1b[32m%s\x1b[0m', 'server is listening on port ' + config.httpsPort)
    })
}


var httpServer = http.createServer((req, res) => {
    unifiedServer(req, res)

})

var httpsServerOptions = {
    'key': fs.readFileSync(path.join(__dirname, '../https/key.pem')).toString(),
    'cert': fs.readFileSync(path.join(__dirname, '../https/cert.pem')).toString()
};
var credentials=crypto.createCredentials(httpsServerOptions)
var httpsServer = https.createServer(credentials, (req, res) => {
    unifiedServer(req, res)
})


var unifiedServer = (req, res) => {
    var parsedUrl = url.parse(req.url, true)
    var queryString = parsedUrl.query
    var method = req.method.toLocaleLowerCase()
    var headers = req.headers
    var decoder = new StringDecoder('utf-8')
    var buffer = '';
    var trimmedPathName = parsedUrl.pathname && parsedUrl.pathname.length > 0 ? parsedUrl.pathname.substring(1, parsedUrl.pathname.length).trim() : false
    var chosenHandler = router[trimmedPathName]

    req.on('data', function (data) {
        buffer += decoder.write(data)
    })
    req.on('end', function () {
        var data = {
            'pathname': trimmedPathName,
            'queryString': queryString,
            'method': method,
            'headers': headers,
            'payload': helpers.parseJsonToObject(buffer)
        }
        if (chosenHandler) {
            chosenHandler(data, function (statusCode, payload) {
                statusCode = typeof (statusCode) === 'number' ? statusCode : 200
                payload = typeof (payload) === 'object' ? payload : {};
                var payloadString = JSON.stringify(payload)
                res.setHeader('Content-Type', 'application/json')
                res.writeHead(statusCode)
                res.end(payloadString)
            })
        } else {
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ 'Error': 'did not match any routes' }))
        }
    })
}
module.exports=server;


