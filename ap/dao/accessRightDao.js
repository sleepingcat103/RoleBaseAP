module.exports = class {

    constructor(sqlConfig) {
        this.sqlConfig = sqlConfig;
    }

    insertAccessRight(accrssRight) {
        let { projectId, roleId, featureId, accessLayer } = accrssRight;

        let rowData = {
            "PROJECT_ID": projectId, 
            "ROLE_ID": roleId,
            "FEATURE_ID": featureId,
            "ACCESS_LAYER": accessLayer,
        }

        return this.sqlConfig.ACCESS_RIGHT.create(rowData);
    }

    updateAccessRight(accrssRight) {
        let { roleId, featureId, accessLayer } = accrssRight;
        let setObj = {
            "ACCESS_LAYER": accessLayer,
        }, whereObj = {
            where: {
                "ROLE_ID": roleId,
                "FEATURE_ID": featureId,
            }
        };

        return this.sqlConfig.ACCESS_RIGHT.update(setObj, whereObj);
    }

    deleteAccessRight(accrssRight) {
        let { projectId, roleId, featureId } = accrssRight;
        let findObj = {
            where: {
                "PROJECT_ID": projectId, 
                "ROLE_ID": roleId,
                "FEATURE_ID": featureId,
            }
        };

        return this.sqlConfig.ACCESS_RIGHT.destroy(findObj);
    }

    deleteAccessRightByRoleId(roleId) {
        let findObj = {
            where: {
                "ROLE_ID": roleId,
            }
        };

        return this.sqlConfig.ACCESS_RIGHT.destroy(findObj);
    }

    listAccessRight(projectId, roleId) {
        let findObj = {
            raw: true,
            where: { 
                "PROJECT_ID": projectId,
                "ROLE_ID": roleId
            },
            include: [{
                model: this.sqlConfig.FEATURE,
            }],
        }
        return this.sqlConfig.ACCESS_RIGHT.findAll(findObj);
    }

}