var myArgs = process.argv.slice(2);

if(myArgs.length > 0) {
    console.log(`encode string "${ myArgs[0] }" by AES-256-CBC`);
    console.log("=> " + (require('./controller/Utils.js')).aesEncrypt(myArgs[0]));
} else {
    console.log('no input arguement');
}