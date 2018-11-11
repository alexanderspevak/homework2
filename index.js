var server=require('./server');
var workers=require('./workers');

var start=function(){
    workers.init()
    server.init();
    console.log('env file',process.env.NODE_ENV)
};

start();



