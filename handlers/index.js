var user=require('./user')
var login=require('./login');
var logout=require('./logout')
var menu=require('./menu');
var order=require('./order');
var pay=require('./pay')

module.exports={
    'user':user,
    'login':login,
    'logout':logout,
    'menu':menu,
    'order':order,
    'pay':pay
}
