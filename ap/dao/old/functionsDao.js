const sqlConfig = require('../config/sqlConfig');
const { Op } = require("sequelize");

class functionsDao {
    constructor() {
    }
    getFunctions(codes){
        let findByPattern = {
            where: {
                [Op.or]: codes.map(code => {
                    return {
                        FUNCTION_CODE: code,
                        ON_DUTY: "Y"
                    }
                })
            }
        }

        return sqlConfig.FUNCTIONS.findAll(findByPattern);
    }
}

module.exports = new functionsDao();