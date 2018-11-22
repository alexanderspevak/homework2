var user=require('./user')
var login=require('./login');
var logout=require('./logout')
var menu=require('./menu');
var order=require('./order');
var pay=require('./pay')
var clientSide=require('./html')

module.exports={
    'user':user,
    'loginroute':login,
    'logout':logout,
    'menu':clientSide.menu,
    'order':order,
    'pay':pay,
    '':clientSide.index,
    'signup':clientSide.signup,
    'css':clientSide.styles,
    'app.js':clientSide.app,
    'menudata':menu,
    'login':clientSide.login,
}
