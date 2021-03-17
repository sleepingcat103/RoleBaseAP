module.exports = class userDao {
    constructor(sqlConfig) {
        this.sqlConfig = sqlConfig
    }

    // createUser(user) {
    //     let { userId, password, active, directLogin, memo } = user;

    //     let rowData= {
    //         "USER_ID": userId,
    //         "PASSWORD": password,
    //         "ACTIVE": active,
    //         "DIRECT_LOGIN": directLogin,
    //         "MEMO": memo
    //     }

    //     return this.sqlConfig.USER.create(rowData);
    // }

    insertUser(user, rejectExist) {
        let { userId, password, active, directLogin, memo } = user;

        let findOrCreateObj = {
            where: {
                "USER_ID": userId
            },
            defaults: {
                "USER_ID": userId,
                "PASSWORD": password,
                "ACTIVE": active,
                "DIRECT_LOGIN": directLogin,
                "MEMO": memo,
                "ADMIN": 0
            }
        }

        return this.sqlConfig.USER.findOrCreate(findOrCreateObj)
        .then(result => {
            let user = result[0];
            let created = result[1];

            if (!created && rejectExist) { 
                console.log('User already exists');
                return Promise.reject({ msg: 'User already exists' })

            } else {
                return user.get({ plain: true });
            }
        
        })
    }
    insertAdminUser(user, rejectExist) {
        let { userId, password } = user;

        let findOrCreateObj = {
            where: {
                "USER_ID": userId
            },
            defaults: {
                "USER_ID": userId,
                "PASSWORD": password,
                "ACTIVE": 1,
                "DIRECT_LOGIN": 1,
                "ADMIN": 1
            }
        }

        return this.sqlConfig.USER.findOrCreate(findOrCreateObj)
        .then(result => {
            let user = result[0];
            let created = result[1];

            if (!created) { 
                console.log('User already exists');
                return Promise.reject({ msg: 'User already exists' })

            } else {
                return user.get({ plain: true });
            }
        
        })
    }
    toggleUser(user) {
        let { userId, active } = user;

        let setObj = {
            "ACTIVE": active,
        }, whereObj = {
            where: {
                "USER_ID": userId,
                "ADMIN": 0
            }
        };

        return this.sqlConfig.USER.update(setObj, whereObj);
    }
    toggleAdminUser(user) {
        let { userId, active } = user;

        let setObj = {
            "ACTIVE": active,
        }, whereObj = {
            where: {
                "USER_ID": userId,
                "ADMIN": 1
            }
        };

        return this.sqlConfig.USER.update(setObj, whereObj);
    }

    updateUser(user) {
        let { userId, password, active, directLogin, memo } = user;
        let setObj = {
            "PASSWORD": password,
            "ACTIVE": active,
            "DIRECT_LOGIN": directLogin,
            "MEMO": memo == 'null' ? undefined : memo,
        }, whereObj = {
            where: {
                "USER_ID": userId
            }
        };

        return this.sqlConfig.USER.update(setObj, whereObj);
    }

    deleteUser(userId) {
        let findObj = {
            where: {
                "ADMIN": 0,
                "USER_ID": userId
            }
        };

        return this.sqlConfig.USER.destroy(findObj);
    }
    
    deleteAdminUser(userId) {
        let findObj = {
            where: {
                "ADMIN": 1,
                "USER_ID": userId
            },
            raw: true
        };

        return this.sqlConfig.USER.destroy(findObj);
    }

    getUser(userId) {
        let findObj = {
            where: {
                "USER_ID": userId
            },
            raw: true
        };

        return this.sqlConfig.USER.findOne(findObj);
    }

    listUsers(x) {
        let findObj = {
            where: {
                "ADMIN": 0
            },
            raw: true
        };

        return this.sqlConfig.USER.findAll(findObj);
    }
    listAdminUsers(x) {
        let findObj = {
            where: {
                "ADMIN": 1,
            },
            raw: true
        };

        return this.sqlConfig.USER.findAll(findObj);
    }

    listUsersByProjectId(projectId) {
        let findObj = {
            raw: true,
            required: true,
            where: { "ACTIVE": 1 },
            include: [{
                model: this.sqlConfig.AUTHORITY,
                where: { "PROJECT_ID": projectId },
            }]
        };

        return this.sqlConfig.USER.findAll(findObj);
    }

}
