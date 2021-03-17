const sqlConfig = require('../config/sqlConfig');

class functionRoleDao {
    constructor() {
    }

    getFunctionRoleByRole(role){
        let findByPattern = {
            where: {
                ROLE_CODE: role
            }
        }

        return sqlConfig.FUNCTION_ROLE.findAll(findByPattern);
    }
}

module.exports = new functionRoleDao();