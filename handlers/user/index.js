var get=require('./get')
var put=require('./put')
var post=require('./post')
var del=require('./del')

var methods={
    'get':get,
    'put':put,
    'post':post,
    'delete':del
}
var user=(data,callback)=>{
    console.log('data method',data.method)
    if(methods[data.method]){
        methods[data.method](data,callback)
    }else{
        callback(400,{'Error': ' No matching methods'})
    }
}

module.exports=user;