
var app = {};
app.order = [];

app.bindForm = function () {
    var pageForm = document.querySelector("form")

    if (pageForm) {
        pageForm.addEventListener('submit', function (e) {
            e.preventDefault();
            var formId = this.id;
            var path = this.action;
            var method = this.method;
            var elements = this.elements
            var payload = {}
            var key;
            var value;
            for (var i = 0; i < elements.length; i++) {
                key = elements[i].id
                value = elements[i].value
                payload[key] = value
            }

            if (pageForm.id == 'signup-form') {
                if (app.checkSignup(payload)) {
                    app.request(false, payload, path, method, {}, function (statusCode, returnPayload) {

                        if (statusCode == 200) {
                            if (returnPayload.token) {
                                localStorage.setItem('token', returnPayload.token)
                                localStorage.setItem('email', payload.email)
                                window.location.replace("/menu");
                            } else {
                                alert('Server error')
                            }

                        } else {
                            alert(payload)
                        }
                    })
                } else {
                    alert('invalid parameter')
                }

               
            }

            if (pageForm.id == 'login-form') {
                app.request(false, payload, path, method, {}, function (statusCode, returnPayload) {
                    if (statusCode == 200) {
                        if (returnPayload.token) {
                            localStorage.setItem('token', returnPayload.token)
                            localStorage.setItem('email', payload.email)
                            window.location.replace("/menu");
                        } else {
                            alert('Server error')
                        }

                    } else {
                        alert(JSON.stringify(returnPayload))
                    }
                })
            }

            if(pageForm.id='submitPayment'){
                var email=localStorage.getItem('email');
                var source=payload.creditCard;
                var queryStringObject={
                    email,
                    source
                }
                app.request(false,false,'/pay','GET',queryStringObject,function(statusCode,message){
                    if(statusCode==200){
                        alert('your order will arrive soon')
                    }else{
                        alert('unsuccessfull payment')
                    }
                })
            }
            app.closeModal();

        })
    }
}

app.checkSignup = function (payload) {
    var email = payload.email && app.emailTest(payload.email.trim()) ? payload.email.trim() : false
    var street = payload.street && typeof (payload.street) == 'string' && payload.street.trim().length > 0 ? payload.street : false;
    var name = payload.name && typeof (payload.name) == 'string' && payload.name.trim().length > 0 ? payload.name : false;
    var password = payload.password && typeof (payload.password) == 'string' && payload.password.trim().length > 2 ? payload.password : false;
    if (email && street && name && password) {
        return true
    } else {
        return false
    }
}

app.checkLogin = function (payload) {
    var email = payload.email && app.emailTest(payload.email.trim()) ? payload.email.trim() : false
    var password = payload.password && typeof (payload.password) == 'string' && payload.password.trim().length > 2 ? payload.password : false;
    if (email && password) {
        return true
    } else {
        return false
    }
}

app.request = function (headers, payload, path, method, queryStringObject, callback) {
    headers = typeof (headers) == 'object' && headers != null ? headers : {};
    payload = typeof (payload) == 'object' && payload != null ? payload : {};
    path = typeof (path) == 'string' ? path : "/";
    method = ['GET', 'POST', 'PUT', 'DELETE'].indexOf(method.toUpperCase()) > -1 ? method : 'GET';
    queryStringObject = typeof (queryStringObject) == 'object' && queryStringObject != null ? queryStringObject : {};
    callback = typeof (callback) == 'function' ? callback : false;
    var requestUrl = path + '?'
    var counter = 0
    for (var key in queryStringObject) {
        if (queryStringObject.hasOwnProperty(key)) {

            if (counter > 0) {
                requestUrl = requestUrl + '&'
            }
            requestUrl = requestUrl + key + '=' + queryStringObject[key]
            counter++
        }
    }

    var xhr = new XMLHttpRequest()
    xhr.open(method, requestUrl, true)
    xhr.setRequestHeader("Content-type", "application/json");
    for (var headerKey in headers) {
        if (headers.hasOwnProperty(headerKey)) {
            xhr.setRequestHeader(headerKey, headers[headerKey]);
        }
    }
    var token = localStorage.getItem('token')
    if (token) {
        xhr.setRequestHeader('token', token);
    }

    xhr.onreadystatechange = function () {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            var statusCode = xhr.status;
            var responseReturned = xhr.responseText;

            // Callback if requested
            if (callback) {
                try {
                    var parsedResponse = JSON.parse(responseReturned);
                    callback(statusCode, parsedResponse);
                } catch (e) {
                    callback(statusCode, false);
                }

            }
        }
    }
    // Send the payload as JSON
    var payloadString = JSON.stringify(payload);
    xhr.send(payloadString);
}
app.createNode = function (element) {
    return document.createElement(element);
}
app.append = function (parent, child) {
    return parent.appendChild(child);
}
app.setAttribute = function (itemId, key, value) {
    var item = document.getElementById(itemId)
    item.setAttribute(key, value)
    return item
}
app.fetchMenu = function () {
    var ul = document.getElementById('menu');
    if (ul) {
        var email = localStorage.getItem('email');
        var token = localStorage.getItem('token')
        if (email && token) {
            var queryStringObject = {
                'email': email
            }
            var path = '/menudata'
            app.request({}, false, path, 'GET', queryStringObject, function (statusCode, returnData) {
                if (statusCode == 200) {
                    if (returnData) {
                        var buttonIdArr = []
                        for (var i = 0; i < returnData.length; i++) {
                            var buttonId = returnData[i].id + '_' + returnData[i].price+'_'+returnData[i].name
                            buttonIdArr.push(buttonId)
                            var listElement = app.createNode('li')
                            var buttonElement = app.createNode('button')
                            listElement.setAttribute('id', returnData[i].id)
                            buttonElement.setAttribute('id', buttonId)
                            listElement.innerHTML = returnData[i].name + ' ' + returnData[i].price + ' $ '
                            buttonElement.innerHTML = 'add to cart'
                            listElement.appendChild(buttonElement)
                            ul.appendChild(listElement)
                        }
                        app.buttonItemOrder(buttonIdArr)
                    }
                } else {
                    alert('error')
                }
            })
        } else {
            alert('you are not logged in')
            window.location.replace('');
        }
    }
}
app.buttonItemOrder = function (buttonIdArr) {
    for (var i = 0; i < buttonIdArr.length; i++) {
        var currentButton = document.getElementById(buttonIdArr[i])
        currentButton.onclick = app.addToCart.bind(this, buttonIdArr[i])
    }
}
app.addToCart = function (data) {
    var orderArr=data.split('_')
    var existsInOrderChecker=0
    for(var i=0;i<app.order.length;i++){
        if(app.order[i].id==orderArr[0]){
            existsInOrderChecker++;
            app.order[i].qty++
        }
    }
    if(existsInOrderChecker===0){
        app.order.push({
            qty:1,
            id:orderArr[0],
            price:orderArr[1],
            name:orderArr[2]
        })
    }
    app.fillCart(app.order);
}
app.fillCart=function(ordersArr){
    var basket=document.getElementById('basket')
    if(basket){
        basket.innerHTML=''
        var total=0;
        var ul=app.createNode('ul')
        ul.setAttribute('id','basketList')
        for (var i=0;i<ordersArr.length;i++){
            var listElement=app.createNode('li')
            listElement.innerHTML=ordersArr[i].name+' x '+ordersArr[i].qty + ' = '+ordersArr[i].qty*ordersArr[i].price+'$'
            ul.appendChild(listElement)
            total=total+ordersArr[i].qty*ordersArr[i].price
        }
      basket.appendChild(ul);
      var totalDiv=app.createNode('div');
      var buyButton=app.createNode('button');
      buyButton.onclick=app.sendOrder
      buyButton.innerHTML='Order!'
      totalDiv.innerHTML='Total '+total+'$';
      basket.appendChild(totalDiv)
      basket.appendChild(buyButton)
    }
}

app.sendOrder=function(){
    var email=localStorage.getItem('email');
    var token=localStorage.getItem('token')
    if(token&&email){
        var headers={
        }
        var queryStringObject={
            'email':email
        }
        var path='/order'

        app.request(headers,app.order,path,'POST',queryStringObject,function(statusCode,messageObject){
            if(statusCode==200){
                var modal=document.getElementById('modal');
                modal.style.display='block'
            }else{
                alert(messageObject.Error)
            }
        })

    }else{
        alert('you are not logged in')
    }

}
app.closeModal=function(){
    var modal=document.getElementById('modal');
    modal.style.display='none'
}


app.emailTest = function (str) {
    var emailRegexp = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    return emailRegexp.test(str)
}



app.bindButtons=function(){
    var buttonArray=document.getElementsByTagName('button')
    for (var i=0;i<buttonArray.length;i++){
        if(buttonArray[i].id=="close"){
            buttonArray[i].onclick=app.closeModal
        }
  
    }
}

window.onload = function () {
    app.bindForm();
    app.fetchMenu();
    app.bindButtons();
}
