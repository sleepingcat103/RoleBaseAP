const sqlConfig = require('../config/sqlConfig');

class configDao {
    constructor() {
    }
    updateConfig(config) {
        let { configId, configValue } = config;
        let setObj = {
            CONFIG_VALUE: configValue,
            // MEMO
        }, whereObj = {
            where: {
                "CONFIG_ID": configId
            }
        };

        return sqlConfig.CONFIG.update(setObj, whereObj);
    }

    getConfigs() {

        let findPattern = {}

        return sqlConfig.CONFIG.findAll();
    }
}

module.exports = new configDao();