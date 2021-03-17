const sqlConfig = require('../config/sqlConfig');

class rolesDao {
    constructor() {
    }
    getRoles(){
        let findByPattern = {
            where: {
                ON_DUTY: "Y"
            }
        }

        return sqlConfig.ROLES.findAll(findByPattern);
    }

}

module.exports = new rolesDao();