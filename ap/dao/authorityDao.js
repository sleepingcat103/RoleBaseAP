module.exports = class {
    constructor(sqlConfig) {
        this.sqlConfig = sqlConfig
    }

    insertAuthority(authority, rejectExist) {
        let { userId, projectId, roleId, active, memo } = authority;

        let findOrCreateObj = {
            where: {
                "USER_ID": userId,
                "PROJECT_ID": projectId
            },
            defaults: {
                "USER_ID": userId,
                "PROJECT_ID": projectId,
                "ROLE_ID": roleId,
                "ACTIVE": active,
                "MEMO": memo
            }
        }

        return this.sqlConfig.AUTHORITY.findOrCreate(findOrCreateObj)
        .then(result => {
            let authority = result[0];
            let created = result[1];

            if (!created && rejectExist) { // false if author already exists and was not created.
                console.log('authority already exists');
                return Promise.reject({ msg: 'authority already exist' })

            } else {
                return authority.get({ plain: true });
            }
        
        });
    }

    updateAuthority(authority) {
        let { userId, projectId, roleId, active, memo, lastUpdateTime } = authority;

        let findObj = {
            where: {
                "USER_ID": userId,
                "PROJECT_ID": projectId
            }
        }, setObj = {
            "ACTIVE": active,
            "ROLE_ID": roleId,
            "MEMO": memo,
        }, whereObj = {
            where: {
                "USER_ID": userId,
                "PROJECT_ID": projectId,
            }
        };

        return this.sqlConfig.AUTHORITY.count(findObj)
        .then(response => {
            if(response > 0) {
                return this.sqlConfig.AUTHORITY.update(setObj, whereObj);
            } else {
                return Promise.reject({ msg: 'authority is not exist' })
            }
        })
        .then(response => {
            return this.sqlConfig.AUTHORITY.findOne(findObj);
        })
        .then(response => {
            return response.get({ plain: true });
        })
    }

    deleteAuthority(authority) {
        let { userId, projectId, roleId } = authority;
        let findObj = {
            where: {
                "USER_ID": userId,
                "PROJECT_ID": projectId,
                "ROLE_ID": roleId,
            }
        };

        return this.sqlConfig.AUTHORITY.destroy(findObj);
    }
    deleteAuthorityByRoleId(roleId) {
        let findObj = {
            where: {
                "ROLE_ID": roleId,
            }
        };

        return this.sqlConfig.AUTHORITY.destroy(findObj);
    }
    deleteAuthorityByUserId(userId) {
        let findObj = {
            where: {
                "USER_ID": userId,
            }
        };

        return this.sqlConfig.AUTHORITY.destroy(findObj);
    }

    getAuthorityByUserId(userId) {
        let findObj = {
            raw: true,
            where: {
                "ACTIVE": 1,
                "USER_ID": userId
            },
            include: [{
                model: this.sqlConfig.USER,
                where: {
                    "ACTIVE": 1,
                },
            }, {
                model: this.sqlConfig.PROJECT,
                where: {
                    "ACTIVE": 1,
                },
            }, {
                model: this.sqlConfig.ROLE,
            }]
        }
        return this.sqlConfig.AUTHORITY.findAll(findObj);
    }

    listAuthorityByUserId(userId) {
        let findObj = {
            where: {
                "USER_ID": userId,
            }
        };
        return this.sqlConfig.AUTHORITY.findAll(findObj);
    }

    listAuthorityByProjectId(projectId) {
        let findObj = {
            raw: true,
            required: true,
            where: {
                "PROJECT_ID": projectId,
            },
            include: [{
                model: this.sqlConfig.USER,
                where: { active: 1 },
                attributes: ['ACTIVE']
            }]
        };

        return this.sqlConfig.AUTHORITY.findAll(findObj);
    }

    listAuthorityByProjectIdAndRoleId(projectId, roleId) {
        let findObj = {
            raw: true,
            required: true,
            where: {
                "PROJECT_ID": projectId,
                "ROLE_ID": roleId
            },
            include: [{
                model: this.sqlConfig.USER,
                where: { active: 1 },
                attributes: ['ACTIVE']
            }]
        };

        return this.sqlConfig.AUTHORITY.findAll(findObj);
    }

}
