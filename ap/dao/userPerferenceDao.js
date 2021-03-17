module.exports = class userPerference {

    constructor(sqlConfig) {
        this.sqlConfig = sqlConfig;
    }

    insertUserPerference(userPerference) {
        let { userId, defaultProject } = userPerference;

        let rowData = {
            "USER_ID": userId,
            "DEFAULT_PROJECT": defaultProject,
        }

        return this.sqlConfig.USER_PERFERENCE.create(rowData);
    }

    updateUserPerference(userPerference) {
        let { userId, defaultProject } = userPerference;
        let setObj = {
            "DEFAULT_PROJECT": defaultProject,
        }, whereObj = {
            where: {
                "USER_ID": userId,
            }
        };

        return this.sqlConfig.USER_PERFERENCE.update(setObj, whereObj);
    }

    deleteUserPerference(userId) {
        let findObj = {
            where: {
                "USER_ID": userId
            }
        };

        return this.sqlConfig.USER_PERFERENCE.destroy(findObj);
    }

    getUserPerference(userId) {
        let findObj = {
            where: {
                "USER_ID": userId
            }
        };

        return this.sqlConfig.USER_PERFERENCE.findOne(findObj);
    }   
}