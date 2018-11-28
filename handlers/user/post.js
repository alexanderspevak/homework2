var helpers = require('../../lib/helpers')

module.exports = function (data, callback) {
    var email =data.payload.email&& helpers.emailTest(data.payload.email.trim())?data.payload.email.trim():false
    var street = data.payload.street && typeof (data.payload.street) == 'string' && data.payload.street.trim().length > 0 ? data.payload.street : false;
    var name = data.payload.name && typeof (data.payload.name) == 'string' && data.payload.name.trim().length > 0 ? data.payload.name : false;
    var password = data.payload.password &&typeof (data.payload.password) == 'string'&& data.payload.password.trim().length > 2 ? data.payload.password : false;
    if (email && street && name && password) {
        helpers.read('tokens',email,function(err,data){
            if(err){
                if(hashedPassword){
                    var data = {
                        'email': email,
                        'street': street,
                        'name': name,
                        'password': hashedPassword,
                        'timeCreated':new Date(Date.now()).toLocaleString(),
                    }
                    helpers.create('users',data.email,data,function(statusCode,err){
                        if(statusCode===200){
                            var token=helpers.createRandomString(20)
                            helpers.create('tokens',data.email,{'id':token,'email':data.email},function(statusCode,payload){
                                 callback(statusCode,payload)   
                            })
                        }else{
                            callback(statusCode,err)
                        }
                    })
                }else{
                    callback(500,{'Error':'Unsuccessfull hash'})
                }
            }else{
                callback(400,{'Error':'User already exists'})
            }
        })
        var hashedPassword=helpers.hash(password)

    
    } else {
        callback(400, { 'Error': 'Input field(s) is not valid' })
    }

}