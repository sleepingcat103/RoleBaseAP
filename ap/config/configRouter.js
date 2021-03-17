console.log(">>>>>>> use " + process.env.NODE_ENV + " config <<<<<<<");
module.exports = require("./" + process.env.NODE_ENV + "/config");