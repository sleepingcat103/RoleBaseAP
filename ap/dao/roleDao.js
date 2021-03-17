module.exports = class {
    constructor(sqlConfig) {
        this.sqlConfig = sqlConfig;
    }

    insertRole(role) {
        let { roleId, roleName, memo } = role;

        let findOrCreateObj = {
            where: {
                "ROLE_ID": roleId
            },
            defaults: {
                "ROLE_ID": roleId,
                "EDITABLE": 1,
                "ROLE_NAME": roleName,
                "MEMO": memo
            }
        }

        return this.sqlConfig.ROLE.findOrCreate(findOrCreateObj)
        .then(result => {
            let role = result[0];
            let created = result[1];

            if (!created) { 
                console.log('Role already exists');
                return Promise.reject({ msg: 'Role already exists' })

            } else {
                return role.get({ plain: true });
            }
        })
    }

    updateRole(role) {
        let { roleId, roleName, memo } = role;
        let setObj = {
            "ROLE_NAME": roleName,
            "MEMO": memo == 'null' ? undefined : memo,
        }, whereObj = {
            where: {
                "ROLE_ID": roleId
            }
        };

        return this.sqlConfig.ROLE.update(setObj, whereObj);
    }

    deleteRole(roleId) {
        let findObj = {
            where: {
                "ROLE_ID": roleId
            }
        };

        return this.sqlConfig.ROLE.destroy(findObj);
    }

    getRole(roleId) {
        let findObj = {
            where: {
                "ROLE_ID": roleId
            }
        };

        return this.sqlConfig.ROLE.findOne(findObj);
    }

    listRole() {
        let findObj = {
            raw: true,
            where: {
                "ROLE_ID": {
                    [this.sqlConfig.Op.not]: 'admin'
                }
            }
        };

        return this.sqlConfig.ROLE.findAll(findObj);
    }
}