const path = require('path');

const hostDomain = process.env.NODE_DOMAIN || 'localhost';
const portNumber = process.env.PORT || '3001';
const debugLevel = process.env.NODE_DEBUG_LEVEL || 'info';
const logAbsoluteRootPath = process.env.NODE_LOG_PATH || '';

module.exports = {
    path: path.dirname(process.mainModule.filename),
    server: {
        useHttp: true,
        useHttps: false,
        httpsConfig: {
            key: 'xxxxxxx.key',
            cert: 'xxxxxxx.cert'
        }
    },
    ldapService: {
        
    },
    dbInfo: {
        database: 'RBBE',
        account: 'SA',
        pwd: '68bf56b6311e4dd8892564104ac7273b:32fba8837f2fa3746ef7262d0a88ec3d',
        host: '127.0.0.1',
        port: 1433,
        encrypt: true
    },
    corsOptions: {
        "origin": "http://localhost:3000",
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
        url: hostDomain + ":" + portNumber
    },
    logManagement: {
        debugLevel: debugLevel,
        doLogHTTP: false,
        execeptionErrorStream: {
            type: 'rotating-file',
            path: logAbsoluteRootPath + 'Logmanager/exceptionError/exceptionError.log',
            period: '1d',
            count: 10,
            level: debugLevel
        },
        debugStream: {
            type: 'rotating-file',
            path: logAbsoluteRootPath + 'Logmanager/debug/debug.log',
            period: '1d',
            count: 10,
            level: debugLevel
        },
        defaultStream: {
            type: 'rotating-file',
            path: logAbsoluteRootPath + 'Logmanager/default/default.log',
            period: '1d',
            count: 10,
            level: debugLevel
        }
    },

    fileManagementApi: 'https://hqsaplu83.hotains.com.tw'
}