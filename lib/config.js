var environments={};

environments.staging={
    'httpPort':3000,
    'httpsPort':3001,
    'hashingSecret':'',//put yuor data here
    'stripe':{
        'apiKey':'',//put yuor data here
        'source':''//put yuor data here
    },
    'mailgun':{
        'apiKey':'put  your data here',//put yuor data here
        'domainName':''//put yuor data here
    }
}

environments.production={
    'httpPort':5000,
    'httpsPort':5001,
    'hashingSecret':'',//put yuor data here
    'stripe':{
        'apiKey':'',//put yuor data here
        'source':''//put yuor data here
    },
    'mailgun':{
        'apiKey':'',//put yuor data here
        'domainName':''//put yuor data here
    }
}

var currentEnvironment=typeof(process.env.NODE_ENV)==='string'?process.env.NODE_ENV.toLowerCase():'';

var environmentToExport=typeof(environments[currentEnvironment])==='object'?environments[currentEnvironment]:environments.staging;

module.exports=environmentToExport