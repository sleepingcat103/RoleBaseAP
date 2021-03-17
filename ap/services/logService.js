const config = require('../config/configRouter');
const bunyan = require('bunyan');
const bunyanErrorHandler = function(err , stream){
    console.log("Log streaming error!! " , stream.name , err);
}
const exceptionErrorLog = bunyan.createLogger({name: "error",streams:[config.logManagement.execeptionErrorStream]});
exceptionErrorLog.on('error', bunyanErrorHandler);
const debugLog = bunyan.createLogger({name: "debug",streams:[config.logManagement.debugStream]});
debugLog.on('error', bunyanErrorHandler);


class logService {
    constructor() {
    }

    error(error) {
        let content = Object.values(arguments);
        content.splice(0, 1);
        console.log(error, buildContent(content));

        exceptionErrorLog.error({ err: error }, buildContent(content));
    }
    debug() {
        let content = buildContent(arguments);
        console.error(content);
        
        debugLog.debug.apply(content);
    }
}

let buildContent = (args) => {
    return Object.values(args).map(arg => {
        if(typeof(arg) == 'object') {
            return JSON.stringify(arg);
        } else {
            return arg;
        }
    }).join(' ');
}

module.exports = new logService();