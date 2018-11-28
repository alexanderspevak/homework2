var environments={};

environments.staging={
    'httpPort':3000,
    'httpsPort':3001,
    'hashingSecret':'',//put yuor data here
    'stripe':{
        'apiKey':'sk_test_AqzOHGCZnXdJQPyGrUzzcUHR',
        'source':'tok_amex'
    },
    'mailgun':{
        'apiKey':'3661ee72d366ed4ddbce94f8a697f803-4412457b-a7b2e79f',
        'domainName':'sandboxdf47d467e73d40dca2795eddd36199f6.mailgun.org'
    }
}



environments.production={
    'httpPort':5000,
    'httpsPort':5001,
    'hashingSecret':'',//put yuor data here
    'stripe':{
        'apiKey':'sk_test_AqzOHGCZnXdJQPyGrUzzcUHR',//put yuor data here
        'source':'tok_amex'
    },
    'mailgun':{
        'apiKey':'3661ee72d366ed4ddbce94f8a697f803-4412457b-a7b2e79f',//put yuor data here
        'domainName':'sandboxdf47d467e73d40dca2795eddd36199f6.mailgun.org'//put yuor data here
    }
}

var currentEnvironment=typeof(process.env.NODE_ENV)==='string'?process.env.NODE_ENV.toLowerCase():'';

var environmentToExport=typeof(environments[currentEnvironment])==='object'?environments[currentEnvironment]:environments.staging;

module.exports=environmentToExport