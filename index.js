var server=require('./server');
var workers=require('./workers');
var cli=require('./cli')

var start=function(){
    workers.init()
    server.init();
    setTimeout(cli.init,50);
    
};

start();



