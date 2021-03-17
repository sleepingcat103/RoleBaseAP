const path = require('path');

const hostDomain = process.env.NODE_DOMAIN || 'localhost';
const portNumber = process.env.PORT || '3001';
const debugLevel = process.env.NODE_DEBUG_LEVEL || 'info';
const logAbsoluteRootPath = process.env.NODE_LOG_PATH || '';

module.exports = {
    path: path.dirname(process.mainModule.filename),
    server: {
        useHttp: true,
        useHttps: true,
        httpsConfig: {
            key: 'xxxxxxx.key',
            cert: 'xxxxxxx.cert'
        }
    },
    ldapService: {
        ADChkUrl: 'http://employee.hotains.com.tw/ADJOB/ADINQ.asmx/ADChk',
        svrAD: '192.168.128.10',
        Domain: 'hotains.com.tw'
    },
    dbInfo: {
        database: "ChatBotManageMent",
        account: "chatbotmanager",
        pwd: "",
        host: "192.168.115.181",
        port: 1433,
        encrypt: false,
    },
    corsOptions: {
        "origin":  [
            "http://dit24-win10.aegon.com.tw:3000",
            "http://dit24-win10.aegon.com.tw:9000",
            "http://dit24-win10.aegon.com.tw:8080",
            "http://dit24-win10.aegon.com.tw",
            "http://dit34-w10.aegon.com.tw:8080",
            "http://10.67.67.100:18080",
            "http://localhost:3000",
            "http://10.67.70.100:3000",
        ],
        "methods": "GET, HEAD, PUT, PATHCH, POST, DELETE",
        "preflightContinue": false,
        "optionsSuccessStatus": 204,
        "credentials": true
    },
    sessionOption: {
        secret: 'expressSession',
        resave: false,
        rolling: true,
        saveUninitialized: true,
        name: 'backend_app:sid'
    },
    site: {
        url: hostDomain + ":" + portNumber,
        debugLevel: debugLevel,
        logPath:logAbsoluteRootPath
    },
    logManagement: {
        debugLevel: debugLevel,
        doLogHTTP: false,
        execeptionErrorStream : {
            type: 'rotating-file',
            path: logAbsoluteRootPath + 'Logmanager/exceptionError/exceptionError.log',
            period: '1d',   
            count: 10 ,
            level: debugLevel    
        },
        debugStream : {
            type: 'rotating-file',
            path: logAbsoluteRootPath + 'Logmanager/debug/debug.log',
            period: '1d',   
            count: 10 ,
            level: debugLevel    
        },
        defaultStream : {
            type: 'rotating-file',
            path: logAbsoluteRootPath + 'Logmanager/default/default.log',
            period: '1d',   
            count: 10 ,
            level: debugLevel    
        }
    },

    fileManagementApi: 'https://hqsaplu83.hotains.com.tw'
}