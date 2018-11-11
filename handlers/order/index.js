var del=require('./delete')
var post=require('./post')


var methods={
    'post':post,
    'delete':del
}
var user=(data,callback)=>{
    if(methods[data.method]){
        methods[data.method](data,callback)
    }else{
        callback(400,{'Error': ' No matching methods'})
    }
}

module.exports=user;