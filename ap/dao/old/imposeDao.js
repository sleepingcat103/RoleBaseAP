const sqlConfig = require('../config/sqlConfig');

class imposeDao {
    constructor() {
    }
    insertUser(userData) {
        let { employeeId, roleCode, memo, onDuty } = userData;

        let rowData = {
            EMPLOYEE_ID: employeeId,
            ROLE_CODE: roleCode,
            MEMO: memo,
            ON_DUTY: onDuty
        }

        return sqlConfig.IMPOSE.create(rowData);
    }

    updateUser(userData) {
        let { employeeId, roleCode, onDuty, memo } = userData;
        let setObj = {
            ROLE_CODE: roleCode,
            MEMO: memo == 'null' ? undefined : memo,
            ON_DUTY: onDuty
        }, whereObj = {
            where: {
                "EMPLOYEE_ID": employeeId
            }
        };

        return sqlConfig.IMPOSE.update(setObj, whereObj);
    }

    getUser(id) {
        let findByPattern = {
            where: {
                EMPLOYEE_ID: id
            }
        };

        return sqlConfig.IMPOSE.findOne(findByPattern);
    }

    getUsers() {
        let findByPattern = {};

        return sqlConfig.IMPOSE.findAll();
    }
}

module.exports = new imposeDao();