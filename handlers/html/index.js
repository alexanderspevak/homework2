var handlers={}
var fs=require('fs')
var path=require('path')

var baseDir=path.join(__dirname+'/../../public/')
var menuDir=path.join(__dirname+'/../../data/menu')

handlers.index=function(data,callback){
    
    fs.readFile(baseDir+'index.html',function(err,data){
        if(!err){
            callback(200,data,'html')
        }else{
            callback(500,{'Error':'Could not read html data'},false)
        }
    })
}

handlers.styles=function(data,callback){
    fs.readFile(baseDir+'app.css',function(err,data){
        if(!err){
            callback(200,data,'css')
        }else{
            callback(500,{'Error':'Could not read html data'},false)
        }
    })
}

handlers.signup=function(data,callback){
    
    fs.readFile(baseDir+'signup.html',function(err,data){
        if(!err){
            callback(200,data,'html')
        }else{
            callback(500,{'Error':'Could not read html data'},false)
        }
    })
}

handlers.app=function(data,callback){
    
    fs.readFile(baseDir+'app.js',function(err,data){
        if(!err){
            callback(200,data,'javascript')
        }else{
            callback(500,{'Error':'Could not read javascript data'},false)
        }
    })
}

handlers.menu=function(data,callback){
    fs.readFile(baseDir+'menu.html',function(err,data){
        if(!err){
            callback(200,data,'html')
        }else{
            callback(500,{'Error':'Could not read html data'},false)
        }
    })
}

handlers.login=function(data,callback){
    
    fs.readFile(baseDir+'login.html',function(err,data){
        if(!err){
            callback(200,data,'html')
        }else{
            callback(500,{'Error':'Could not read html data'},false)
        }
    })
}


module.exports=handlers;